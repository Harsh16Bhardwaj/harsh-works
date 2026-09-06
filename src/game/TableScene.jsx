'use client';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';

export default function TableScene({players,activeId,phase}) {
  const host=useRef(null);const state=useRef({players,activeId,phase});
  const [ready,setReady]=useState(false);
  state.current={players,activeId,phase};
  useEffect(()=>{
    const el=host.current;let renderer;
    try {renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});} catch {return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.4));renderer.outputColorSpace=T.SRGBColorSpace;
    const scene=new T.Scene();const camera=new T.PerspectiveCamera(36,1,.1,60);
    camera.position.set(0,5.9,8.8);camera.lookAt(0,1.05,0);
    scene.add(new T.HemisphereLight(0xb8d4cf,0x172823,2));
    const warm=new T.DirectionalLight(0xffd295,3);warm.position.set(-3,6,3);scene.add(warm);
    const rim=new T.DirectionalLight(0x66b8b3,2);rim.position.set(4,3,-3);scene.add(rim);
    const material=(color,metalness=0)=>new T.MeshStandardMaterial({color,roughness:.72,metalness,flatShading:true});
    const wood=material(0x443329),gold=material(0xa88951,.45),felt=material(0x234b40),dark=material(0x142821);
    function mesh(geo,mat,parent,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
    const table=new T.Group();scene.add(table);
    const base=mesh(new T.CylinderGeometry(3.15,3.1,.22,64),wood,table,0,.33,0);base.scale.z=.57;
    const edge=mesh(new T.CylinderGeometry(3.09,3.09,.045,64),gold,table,0,.46,0);edge.scale.z=.57;
    const top=mesh(new T.CylinderGeometry(2.99,2.99,.045,64),felt,table,0,.49,0);top.scale.z=.56;
    for(const x of [-2,2]) mesh(new T.CylinderGeometry(.1,.16,1.1,8),dark,table,x,-.2,0);
    const positions=[[-.05,0,-1.8],[-2.8,0,-.1],[2.8,0,-.1],[0,0,1.72]];
    const figures=[];
    for(let i=0;i<4;i++){
      const kind=state.current.players[i]?.character ?? i;
      const g=new T.Group();g.position.set(...positions[i]);g.scale.setScalar(1.2);g.rotation.y=i===1?.55:i===2?-.55:i===3?Math.PI:0;g.visible=i<3;scene.add(g);
      const skin=material([0xb57443,0x435e70,0x819786,0x856d80][kind]);const coat=material([0x263a36,0x2c3041,0x233c35,0x332e40][kind]);const cream=material(0xe0c293);
      mesh(new T.CylinderGeometry(.29,.48,.72,7),coat,g,0,.72,0);
      const head=mesh(kind===2?new T.BoxGeometry(.5,.5,.4):new T.IcosahedronGeometry(.34,0),skin,g,0,1.3,0);
      if(kind===0){for(const x of [-.2,.2]){const ear=mesh(new T.ConeGeometry(.13,.37,3),skin,g,x,1.63,0);ear.rotation.z=x>0?-.2:.2;}const snout=mesh(new T.ConeGeometry(.18,.28,4),cream,g,0,1.22,.29);snout.rotation.x=Math.PI/2;}
      if(kind===1){const beak=mesh(new T.ConeGeometry(.14,.38,4),gold,g,0,1.23,.3);beak.rotation.x=Math.PI/2;}
      for(const x of [-.13,.13])mesh(new T.BoxGeometry(.1,.035,.035),cream,g,x,1.36,.29);
      const tie=mesh(new T.ConeGeometry(.065,.3,3),gold,g,0,.8,.27);tie.rotation.z=Math.PI;
      const arms=[];
      for(const x of [-.36,.36]){const arm=mesh(new T.CylinderGeometry(.1,.12,.55,6),coat,g,x,.69,.23);arm.rotation.x=-.7;const hand=mesh(new T.IcosahedronGeometry(.12,0),skin,g,x,.49,.43);arms.push({arm,hand,side:Math.sign(x)});}
      const halo=mesh(new T.TorusGeometry(.45,.016,5,36),gold,g,0,1.29,-.2);
      const portal=new T.Group();portal.visible=false;portal.position.set(positions[i][0],2.35,positions[i][2]);scene.add(portal);
      const portalMat=new T.MeshBasicMaterial({color:0x75eadc,transparent:true,opacity:.58});
      const portalRing=mesh(new T.TorusGeometry(.5,.028,7,36),portalMat,portal);portalRing.rotation.x=Math.PI/2;
      const portalCore=mesh(new T.CircleGeometry(.43,28),new T.MeshBasicMaterial({color:0x17103d,transparent:true,opacity:.38}),portal);portalCore.rotation.x=Math.PI/2;
      figures.push({g,head,halo,arms,portal,portalRing,baseY:g.position.y,baseZ:g.position.z});
    }
    // Candle-like table lamps add depth without shadow maps or postprocessing.
    for(const x of [-1.8,1.8]){mesh(new T.CylinderGeometry(.1,.14,.3,8),gold,table,x,.68,-.7);mesh(new T.SphereGeometry(.055,8,6),new T.MeshBasicMaterial({color:0xffd499}),table,x,.87,-.7);}
    el.appendChild(renderer.domElement);
    setReady(true);
    const contextLost=(event)=>{event.preventDefault();setReady(false);};
    const contextRestored=()=>setReady(true);
    renderer.domElement.addEventListener('webglcontextlost',contextLost);
    renderer.domElement.addEventListener('webglcontextrestored',contextRestored);
    const project=(point)=>{point.project(camera);return {x:(point.x+1)*el.clientWidth/2,y:(1-point.y)*el.clientHeight/2};};
    function placeLabels(){scene.updateMatrixWorld();camera.updateMatrixWorld();figures.forEach((f,i)=>{const label=el.parentElement.querySelector(`.seat-${i}`);if(!label)return;const p=project(f.g.localToWorld(new T.Vector3(0,1.95,0)));label.style.left=`${Math.max(4,Math.min(el.clientWidth-label.offsetWidth,p.x-label.offsetWidth/2))}px`;label.style.top=`${Math.max(0,p.y-54)}px`;label.style.right='auto';});const center=el.parentElement.querySelector('.orbit-table-center');if(center){const p=project(new T.Vector3(0,.52,.1));center.style.top=`${p.y-58}px`;}}
    const resize=()=>{const {width,height}=el.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/Math.max(1,height);camera.position.z=width<600?11:8.8;camera.zoom=width<600?1:1.8;camera.updateProjectionMatrix();placeLabels();};
    const observer=new ResizeObserver(resize);observer.observe(el);resize();
    const media=matchMedia('(prefers-reduced-motion: reduce)');let last=0;let signature='';let lastPhase=state.current.phase;let phaseAt=0;
    renderer.setAnimationLoop((time)=>{if(document.hidden||time-last<33)return;last=time;
      const nextSignature=state.current.players.map(p=>`${p.id}:${p.alive}`).join(',')+state.current.activeId+state.current.phase+el.clientWidth+el.clientHeight;
      if(media.matches&&signature===nextSignature)return;signature=nextSignature;
      if(lastPhase!==state.current.phase){lastPhase=state.current.phase;phaseAt=time;}
      const portalPhase=['loading','armed','firing','resolved','finished'].includes(state.current.phase);
      figures.forEach((f,i)=>{const p=state.current.players[i];const active=p?.id===state.current.activeId;const targeted=active&&portalPhase;
        const consumed=p?.alive===false;const taking=consumed&&targeted;const consumeProgress=taking?Math.min(1,(time-phaseAt)/1300):0;
        const opening=state.current.phase==='loading'?Math.min(1,(time-phaseAt)/1500):1;
        const closing=state.current.phase==='resolved'&&!consumed?Math.max(0,1-(time-phaseAt)/850):1;
        const portalScale=Math.max(.01,opening*closing);
        f.portal.visible=targeted&&portalScale>.02;f.portal.scale.setScalar(portalScale);f.portal.rotation.y=media.matches?0:time*.0015;f.portalRing.rotation.z=media.matches?0:time*.0025;
        f.halo.visible=active&&!consumed;f.halo.scale.setScalar(active&&!media.matches?1.15:1);
        f.g.visible=i===3 ? targeted : !consumed||taking;
        f.g.rotation.x=0;f.g.rotation.z=taking?consumeProgress*.2:0;
        f.g.scale.setScalar(taking?Math.max(.08,1.2*(1-consumeProgress)):active&&!media.matches?1.3:1.2);
        f.g.position.y=f.baseY+(taking?consumeProgress*2:targeted&&!media.matches?Math.sin(time*.004)*.06:media.matches?0:Math.sin(time*.0012+i)*.016);f.g.position.z=f.baseZ;
        f.head.rotation.z=media.matches?0:active?Math.sin(time*.003)*.07:Math.sin(time*.0008+i)*.035;
        f.arms.forEach(({arm,hand,side})=>{arm.rotation.x=targeted ? -1.05 : -.7+Math.sin(time*.0015+i+side)*.035;arm.rotation.z=targeted ? side*.12 : Math.sin(time*.001+i)*side*.045;hand.position.y=targeted ? .58 : .49;hand.position.x=side*.36;hand.position.z=targeted ? .48 : .43;});
      });
      renderer.render(scene,camera);
    });
    return()=>{observer.disconnect();renderer.setAnimationLoop(null);renderer.domElement.removeEventListener('webglcontextlost',contextLost);renderer.domElement.removeEventListener('webglcontextrestored',contextRestored);scene.traverse(o=>{o.geometry?.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();};
  },[]);
  return <div className={`orbit-scene ${ready?'is-ready':''}`} ref={host} aria-hidden="true" />;
}
