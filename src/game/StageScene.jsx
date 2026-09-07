'use client';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {makeActor,makeHammer,part,surface} from './stage-models.js';
import {CONTACT_SECONDS,clamp01,damp,hammerPose,tableSeats} from './presentation.js';

export default function StageScene({players,activeId,phase,gameKey,round,onContact}) {
  const host=useRef(null),latest=useRef(null),[ready,setReady]=useState(false);
  latest.current={players,activeId,phase,round,onContact};
  useEffect(()=>{
    const el=host.current,reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let renderer;
    try {renderer=new T.WebGLRenderer({alpha:true,antialias:true});}catch{return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;
    renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(37,1,.1,45);
    const baseCamera=new T.Vector3(0,7.4,10),baseLook=new T.Vector3(0,.85,0),look=baseLook.clone();
    camera.position.copy(baseCamera);camera.lookAt(look);
    scene.add(new T.HemisphereLight(0xc3d7cc,0x101814,1.5));
    const key=new T.DirectionalLight(0xffd6a3,2.5);key.position.set(-4,6,5);scene.add(key);
    const rim=new T.DirectionalLight(0x8bb4b1,1.8);rim.position.set(4,4,-4);scene.add(rim);
    const gold=surface(0xb99661,.7),wood=surface(0x392b23),felt=surface(0x1c4438),dark=surface(0x142623);
    const table=new T.Group();scene.add(table);
    for(const [radius,y,height,mat] of [[3.14,.33,.2,wood],[3.1,.45,.045,gold],[3.02,.49,.035,felt]]){
      part(table,new T.CylinderGeometry(radius,radius,height,80),mat,0,y,0).scale.z=.59;
    }
    const rail=part(table,new T.TorusGeometry(2.98,.015,6,96),gold,0,.515,0);rail.rotation.x=-Math.PI/2;rail.scale.y=.59;
    for(const x of [-2,2])part(table,new T.CylinderGeometry(.11,.17,.85,8),dark,x,-.1,0);
    const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
    const context=canvas.getContext('2d'),gradient=context.createRadialGradient(32,32,0,32,32,32);
    gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(.35,'rgba(255,255,255,.65)');gradient.addColorStop(1,'rgba(255,255,255,0)');
    context.fillStyle=gradient;context.fillRect(0,0,64,64);const radial=new T.CanvasTexture(canvas);
    const actors=tableSeats(latest.current.players).map((seat,i)=>{
      if(!seat)return null;
      const actor=makeActor(seat,latest.current.players[i]?.character??i);scene.add(actor.root);
      actor.lastCount=latest.current.players[i]?.count??latest.current.players[i]?.hand?.length??5;
      actor.hammer=makeHammer(seat);scene.add(actor.hammer.root);
      const shadow=part(scene,new T.PlaneGeometry(1.7,1.4),new T.MeshBasicMaterial({map:radial,color:0x020b08,transparent:true,opacity:.65,depthWrite:false}),seat.x,.515,seat.z);shadow.rotation.x=-Math.PI/2;
      actor.debris=new T.Group();actor.debris.position.set(seat.x,.52,seat.z);actor.debris.visible=false;scene.add(actor.debris);
      for(let j=0;j<12;j++)part(actor.debris,new T.TetrahedronGeometry(.08+(j%3)*.025),surface(j%3?0x38453d:0xb69466));
      return actor;
    });
    const target=new T.Object3D();target.position.set(0,1,0);scene.add(target);
    const spot=new T.SpotLight(0xffd09a,32,10,.23,.75,1.25);spot.target=target;scene.add(spot);
    const face=new T.PointLight(0xffdab0,3,3,2);scene.add(face);
    const lamp=new T.Group();scene.add(lamp);part(lamp,new T.CylinderGeometry(.17,.23,.25,16),dark);
    part(lamp,new T.CylinderGeometry(.19,.19,.04,20),gold,0,-.14,0);
    part(lamp,new T.CircleGeometry(.15,20),new T.MeshBasicMaterial({color:0xffe1a2}),0,-.165,0).rotation.x=-Math.PI/2;
    const beamMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,
      uniforms:{strength:{value:.12}},
      vertexShader:'varying vec3 local; varying vec3 viewNormal; varying vec3 viewPosition; void main(){local=position; vec4 mv=modelViewMatrix*vec4(position,1.); viewNormal=normalize(normalMatrix*normal); viewPosition=mv.xyz; gl_Position=projectionMatrix*mv;}',
      fragmentShader:'uniform float strength; varying vec3 local; varying vec3 viewNormal; varying vec3 viewPosition; void main(){float edge=pow(abs(dot(normalize(viewNormal),normalize(-viewPosition))),1.7); float height=smoothstep(-2.5,-1.2,local.y)*(1.-smoothstep(1.8,2.5,local.y)); gl_FragColor=vec4(1.,.79,.45,strength*edge*height);}'
    });
    const beam=part(scene,new T.ConeGeometry(1,5,40,1,true),beamMaterial,0,3,0);
    const pool=part(scene,new T.PlaneGeometry(2.4,2.4),new T.MeshBasicMaterial({map:radial,color:0xffd18c,transparent:true,opacity:.28,depthWrite:false,blending:T.AdditiveBlending}),0,.53,0);pool.rotation.x=-Math.PI/2;
    const dustPositions=new Float32Array(36*3);
    for(let i=0;i<36;i++){dustPositions[i*3]=Math.sin(i*13.7)*.65;dustPositions[i*3+1]=.65+(i/36)*4.1;dustPositions[i*3+2]=Math.cos(i*9.2)*.65;}
    const dustGeometry=new T.BufferGeometry();dustGeometry.setAttribute('position',new T.BufferAttribute(dustPositions,3));
    const dust=new T.Points(dustGeometry,new T.PointsMaterial({color:0xeed3a2,size:.023,transparent:true,opacity:.38,depthWrite:false}));scene.add(dust);
    const impact=part(scene,new T.RingGeometry(.45,.49,48),new T.MeshBasicMaterial({color:0xefc28a,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}),0,.54,0);impact.rotation.x=-Math.PI/2;
    part(scene,new T.CylinderGeometry(.035,.035,9,8),dark,0,4.8,-2.8).rotation.z=Math.PI/2;
    const pendants=[];
    for(const x of [-4.1,4.1]){
      const hanging=new T.Group();hanging.position.set(x,3.65,-2.6);scene.add(hanging);
      part(hanging,new T.CylinderGeometry(.009,.009,1.8,5),gold,0,.6,0);
      part(hanging,new T.OctahedronGeometry(.16),gold,0,-.4,0);
      part(hanging,new T.TorusGeometry(.28,.013,5,32),gold,0,-.4,0);pendants.push(hanging);
    }
    const flights=new T.Group();scene.add(flights);let flight=null;
    const flightMaterial=surface(0xe1d0a9),cardGeometry=new T.BoxGeometry(.19,.29,.015);
    for(let i=0;i<3;i++)part(flights,cardGeometry,flightMaterial);flights.visible=false;
    el.appendChild(renderer.domElement);setReady(true);
    let width=0,height=0;const point=new T.Vector3();
    function project(x,y,z){point.set(x,y,z).project(camera);return{x:(point.x+1)*width/2,y:(1-point.y)*height/2};}
    function labels(){
      actors.forEach((actor,i)=>{
        if(!actor||i===3)return;const label=el.parentElement.querySelector(`.seat-${i}`);if(!label)return;
        const front=actor.seat.z>.4;
        const p=project(actor.seat.x*(front?1.45:1),front?1.15:1.9,actor.seat.z);
        label.style.left=`${Math.max(2,Math.min(width-label.offsetWidth,p.x-label.offsetWidth/2))}px`;
        label.style.top=`${Math.max(3,p.y-(front?(width<600?-30:20):56))}px`;label.style.right='auto';label.dataset.depth=front?'front':'back';
      });
      const center=el.parentElement.querySelector('.orbit-table-center');
      if(center&&!center.classList.contains('is-revealing')){const p=project(0,.52,-.05);center.style.left=`${p.x}px`;center.style.top=`${p.y-75}px`;}
    }
    function resize(){({width,height}=el.getBoundingClientRect());renderer.setSize(width,height,false);camera.aspect=width/Math.max(1,height);camera.zoom=width<600?1.08:1.62;camera.updateProjectionMatrix();labels();}
    const observer=new ResizeObserver(resize);observer.observe(el);resize();
    const lost=event=>{event.preventDefault();setReady(false);},restored=()=>setReady(true);
    renderer.domElement.addEventListener('webglcontextlost',lost);renderer.domElement.addEventListener('webglcontextrestored',restored);
    const restoredResult=['resolved','finished'].includes(latest.current.phase);
    let last=0,phaseAt=restoredResult?-2:0,phaseKey=`${latest.current.round}:${latest.current.phase}`,contactKey=restoredResult?phaseKey:'',elapsed=0;
    const focusCamera=new T.Vector3(),focusLook=new T.Vector3(),scratch=new T.Vector3();
    renderer.setAnimationLoop(ms=>{
      if(document.hidden){last=ms;return;}
      const dt=Math.min(.05,(ms-last)/1000||1/60);last=ms;elapsed+=dt;
      const state=latest.current,nextKey=`${state.round}:${state.phase}`;
      if(nextKey!==phaseKey){phaseKey=nextKey;phaseAt=elapsed;}
      const t=elapsed-phaseAt,index=state.players.findIndex(p=>p?.id===state.activeId),actor=actors[index];
      const consequence=['loading','armed','firing','resolved','finished'].includes(state.phase);
      const eliminated=actor?state.players[index]?.alive===false:false;
      const pose=hammerPose(state.phase,t,eliminated,reduced.matches);
      if(actor&&pose.contact&&contactKey!==phaseKey){contactKey=phaseKey;state.onContact?.({eliminated,pan:actor.seat.x/3.1});}
      const a=damp(7,dt),camA=damp(4,dt),seat=actor?.seat??{x:0,z:0,facing:0};
      const focus=consequence&&!reduced.matches;
      focusCamera.set(seat.x*.22,6.9,9.1);focusLook.set(seat.x*.28,1.1,seat.z*.28);
      camera.position.lerp(focus?focusCamera:baseCamera,camA);look.lerp(focus?focusLook:baseLook,camA);
      const after=t-CONTACT_SECONDS;
      if(focus&&pose.contact&&after<.22)camera.position.x+=Math.sin(after*100)*.017*Math.exp(-after*17);
      camera.lookAt(look);target.position.lerp(scratch.set(seat.x,.9,seat.z),a);
      spot.position.set(target.position.x,5.35,target.position.z);lamp.position.copy(spot.position);
      const light=actor&&(state.phase==='playing'||consequence);
      spot.intensity+=((light?consequence?24:32:0)-spot.intensity)*a;
      scratch.set(seat.x+Math.sin(seat.facing)*.8,1.5,seat.z+Math.cos(seat.facing)*.8);face.position.lerp(scratch,a);face.intensity+=((light?3:0)-face.intensity)*a;
      beam.position.set(target.position.x,2.9,target.position.z);beamMaterial.uniforms.strength.value+=((light?.12:0)-beamMaterial.uniforms.strength.value)*a;
      pool.position.set(target.position.x,.53,target.position.z);pool.material.opacity+=((light?.26:0)-pool.material.opacity)*a;
      dust.position.set(target.position.x,0,target.position.z);dust.visible=!reduced.matches;
      if(!reduced.matches){dust.rotation.y=elapsed*.035;pendants.forEach((p,i)=>p.rotation.z=Math.sin(elapsed*.45+i)*.035);}
      impact.visible=pose.contact&&!reduced.matches&&after<.5;
      if(impact.visible){impact.position.set(seat.x,.54,seat.z);impact.scale.setScalar(1+after*3.2);impact.material.opacity=.45*(1-clamp01(after/.5));}
      actors.forEach((f,i)=>{
        if(!f)return;const p=state.players[i];if(!p){f.root.visible=false;return;}
        const active=i===index,targeted=active&&consequence,dead=p.alive===false,hit=targeted&&pose.contact;
        f.root.visible=!dead||(targeted&&!hit);f.hammer.root.visible=targeted;
        f.hammer.pivot.rotation.x=-pose.angle;f.hammer.root.position.y=2.93+pose.lift;
        f.debris.visible=dead&&(!targeted||hit);
        if(f.debris.visible)f.debris.children.forEach((shard,j)=>{const s=targeted?clamp01(Math.max(0,after)/.9):1,theta=j/12*Math.PI*2;shard.position.set(Math.cos(theta)*s*.7,Math.max(.02,.35+(j%3)*.12+s*1.1-s*s*2),Math.sin(theta)*s*.45);shard.rotation.set(s*j,s*j*.7,s*j*.4);});
        const count=p.count??p.hand?.length??0;
        if(count<f.lastCount&&state.phase==='playing'){f.playAt=elapsed;flight={from:new T.Vector3(f.seat.x,.92,f.seat.z),at:elapsed,count:Math.min(3,f.lastCount-count)};}
        f.lastCount=count;f.cards.children.forEach((card,j)=>card.visible=j<count);
        const motion=reduced.matches?0:1,play=clamp01((elapsed-f.playAt)/.6),reach=motion*Math.sin(play*Math.PI);
        const breathe=motion*Math.sin(elapsed*1.8+i*1.7)*.012,squash=targeted?pose.squash:0;
        f.root.scale.set(1+squash*.3,1-squash,1+squash*.3);f.torso.position.y=.62+breathe;
        const brace=targeted&&!pose.contact?.18:0;f.neck.rotation.x+=((brace-reach*.13)-f.neck.rotation.x)*a;
        let gaze=0;if(!active&&actor){gaze=Math.atan2(seat.x-f.seat.x,seat.z-f.seat.z)-f.seat.facing;gaze=Math.atan2(Math.sin(gaze),Math.cos(gaze));}
        f.neck.rotation.y+=(Math.max(-.42,Math.min(.42,gaze))*.6-f.neck.rotation.y)*a;
        f.head.rotation.z=motion*Math.sin(elapsed*.65+i)*.025;
        if(elapsed>f.blinkAt+.14)f.blinkAt=elapsed+3.1+i*.61;
        const blink=motion&&elapsed>f.blinkAt?.12:1;f.eyes.forEach(eye=>eye.scale.y=blink);
        f.arms.forEach(({shoulder,elbow,side})=>{shoulder.rotation.x+=((-.45-reach*.5-(targeted?.16:0))-shoulder.rotation.x)*a;shoulder.rotation.z=side*brace;elbow.rotation.x+=((-.7-reach*.4)-elbow.rotation.x)*a;});
        f.cards.rotation.y=motion*Math.sin(elapsed*.7+i)*.02;f.halo.visible=active&&!dead;f.halo.scale.setScalar(1);
      });
      flights.visible=!!flight&&!reduced.matches&&elapsed-flight.at<.48;
      if(flights.visible){const s=clamp01((elapsed-flight.at)/.48);flights.children.forEach((card,i)=>{card.visible=i<flight.count;card.position.copy(flight.from).multiplyScalar(1-s);card.position.y=.58+(1-s)*.35+Math.sin(s*Math.PI)*.55;card.position.x+=i*.08*s;card.rotation.set(-Math.PI/2*s,0,(i-1)*.12*s);});}
      scene.updateMatrixWorld();camera.updateMatrixWorld();labels();renderer.render(scene,camera);
    });
    return()=>{
      observer.disconnect();renderer.setAnimationLoop(null);renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.domElement.removeEventListener('webglcontextrestored',restored);
      const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});
      geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());radial.dispose();renderer.dispose();renderer.domElement.remove();
    };
  },[gameKey]);
  return <div className={`orbit-scene ${ready?'is-ready':''}`} ref={host} aria-hidden="true"/>;
}
