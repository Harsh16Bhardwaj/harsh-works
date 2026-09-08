import * as T from 'three';

export function surface(color, metalness = 0) {
  return new T.MeshStandardMaterial({ color, metalness, roughness: metalness ? .36 : .78, flatShading: true });
}
export function part(parent, geometry, material, x=0, y=0, z=0) {
  const object = new T.Mesh(geometry, material);
  object.position.set(x,y,z); parent.add(object); return object;
}

export function makeActor(seat, kind=0, local=false) {
  kind %= 4;
  const root=new T.Group(); root.position.set(seat.x,0,seat.z); root.rotation.y=seat.facing;
  const skin=surface([0xb97643,0x486174,0x819b85,0x998677][kind]);
  const coat=surface([0x243b32,0x27343f,0x293a35,0x292d30][kind]);
  const gold=surface(0xbe965b,.65), ivory=surface(0xe8d0a1), shadow=surface(0x101b1c);
  const torso=new T.Group(); torso.position.y=.62; root.add(torso);
  part(torso,new T.CylinderGeometry(.3,.43,.7,8),coat,0,0,0);
  for(const side of [-1,1]) {
    const lapel=part(torso,new T.BoxGeometry(.16,.35,.04),gold,side*.16,.12,.27);
    lapel.rotation.z=side*-.3;
    part(root,new T.BoxGeometry(.18,.32,.25),shadow,side*.19,.18,0);
  }
  const tie=part(torso,new T.ConeGeometry(.065,.25,4),gold,0,.04,.32); tie.rotation.z=Math.PI;
  const neck=new T.Group(); neck.position.y=.42; torso.add(neck);
  part(neck,new T.CylinderGeometry(.12,.15,.18,8),shadow);
  const head=new T.Group(); head.position.y=.2; neck.add(head);
  part(head,kind===2?new T.BoxGeometry(.53,.49,.4):new T.IcosahedronGeometry(.34,1),skin);
  if(kind===0) {
    for(const side of [-1,1]) {
      const ear=part(head,new T.ConeGeometry(.135,.43,3),skin,side*.22,.31,-.03); ear.rotation.z=side*-.16;
      part(head,new T.ConeGeometry(.08,.26,3),shadow,side*.22,.34,.025);
    }
    const muzzle=part(head,new T.ConeGeometry(.2,.35,4),ivory,0,-.09,.28); muzzle.rotation.x=Math.PI/2;
    part(head,new T.IcosahedronGeometry(.067,0),shadow,0,-.06,.45);
  } else if(kind===1) {
    const beak=part(head,new T.ConeGeometry(.135,.44,4),gold,0,-.035,.3); beak.rotation.x=Math.PI/2;
    for(const side of [-1,1]) for(let j=0;j<3;j++) {
      const feather=part(torso,new T.BoxGeometry(.14,.28,.05),coat,side*(.32+j*.035),.2-j*.05,-.03);
      feather.rotation.z=side*-.35;
    }
  } else if(kind===2) {
    part(head,new T.BoxGeometry(.55,.16,.06),shadow,0,.04,.23);
    part(head,new T.BoxGeometry(.24,.055,.06),gold,0,-.16,.23);
    for(const side of [-1,1]) { const ear=part(head,new T.CylinderGeometry(.075,.075,.07,12),gold,side*.3,0,0); ear.rotation.z=Math.PI/2; }
    part(head,new T.BoxGeometry(.31,.035,.3),gold,0,.25,0);
  } else {
    part(head,new T.SphereGeometry(.38,8,6,0,Math.PI*2,0,Math.PI*.65),coat,0,.065,-.035);
    part(head,new T.ConeGeometry(.24,.4,5),skin,0,-.045,.16).rotation.z=Math.PI;
  }
  const eyes=[];
  for(const side of [-1,1]) {
    part(head,new T.BoxGeometry(.15,.07,.04),shadow,side*.135,.055,.285);
    const eye=part(head,new T.BoxGeometry(.08,.025,.025),ivory,side*.135,.055,.31); eyes.push(eye);
    if(kind!==2) part(head,new T.BoxGeometry(.17,.035,.05),coat,side*.135,.11,.28).rotation.z=side*.17;
  }
  const arms=[];
  for(const side of [-1,1]) {
    const shoulder=new T.Group(); shoulder.position.set(side*.34,.24,.04); torso.add(shoulder);
    part(shoulder,new T.SphereGeometry(.13,8,6),kind===2?gold:coat);
    part(shoulder,new T.CylinderGeometry(.09,.11,.32,8),coat,0,-.16,0);
    const elbow=new T.Group(); elbow.position.y=-.3; shoulder.add(elbow);
    part(elbow,new T.CylinderGeometry(.08,.1,.28,8),coat,0,-.14,0);
    part(elbow,new T.CylinderGeometry(.09,.09,.06,8),ivory,0,-.25,0);
    part(elbow,new T.IcosahedronGeometry(.11,1),skin,0,-.32,0);
    shoulder.rotation.x=-.45; elbow.rotation.x=-.7; arms.push({shoulder,elbow,side});
  }
  const cards=new T.Group(); cards.position.set(0,.52,.6); cards.rotation.x=-.35; root.add(cards);
  for(let i=0;i<5;i++) {
    const card=part(cards,new T.BoxGeometry(.16,.24,.014),ivory,(i-2)*.1,Math.abs(i-2)*.012,0);
    card.rotation.z=(i-2)*-.12;
    part(card,new T.BoxGeometry(.125,.2,.003),coat,0,0,-.009);
  }
  const halo=part(root,new T.TorusGeometry(.5,.014,6,48),gold,0,1.47,-.16);
  const chair=new T.Group();chair.position.z=-.31;root.add(chair);
  const chairWood=surface([0x263b34,0x253644,0x30443b,0x393238][kind]);
  // A readable lounge-chair silhouette: grounded legs, cushion, arms and a tall framed back.
  part(chair,new T.BoxGeometry(.76,.12,.64),chairWood,0,.24,0);
  part(chair,new T.BoxGeometry(.65,.09,.53),coat,0,.32,.035);
  part(chair,new T.BoxGeometry(.72,.76,.12),chairWood,0,.69,-.25);
  part(chair,new T.BoxGeometry(.58,.57,.075),coat,0,.68,-.17);
  for(const side of [-1,1]){
    part(chair,new T.BoxGeometry(.1,.7,.1),chairWood,side*.31,-.05,-.12);
    part(chair,new T.BoxGeometry(.1,.7,.1),chairWood,side*.31,-.05,.22);
    part(chair,new T.BoxGeometry(.11,.11,.58),chairWood,side*.43,.5,.02);
    part(chair,new T.BoxGeometry(.06,.06,.48),gold,side*.43,.58,.04);
  }
  const crestGeometry=[new T.ConeGeometry(.11,.22,3),new T.OctahedronGeometry(.11),new T.BoxGeometry(.18,.18,.08),new T.TorusGeometry(.11,.025,5,16)][kind];
  const crest=part(chair,crestGeometry,gold,0,1.11,-.24);crest.rotation.z=kind===0?Math.PI:0;
  let youTexture=null;
  if(local){
    const badge=document.createElement('canvas');badge.width=256;badge.height=96;const ctx=badge.getContext('2d');
    ctx.fillStyle='rgba(7,20,18,.92)';ctx.beginPath();ctx.roundRect(16,12,224,72,34);ctx.fill();
    ctx.strokeStyle='rgba(224,187,117,.92)';ctx.lineWidth=4;ctx.stroke();
    ctx.fillStyle='#f1d49d';ctx.font='700 42px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('YOU',128,50);
    youTexture=new T.CanvasTexture(badge);youTexture.colorSpace=T.SRGBColorSpace;
    const marker=new T.Sprite(new T.SpriteMaterial({map:youTexture,transparent:true,depthTest:false}));
    marker.position.set(0,.65,0);marker.scale.set(.72,.27,1);marker.renderOrder=8;head.add(marker);
  }
  const bodyMeshes=[];torso.traverse(object=>{if(object.isMesh)bodyMeshes.push(object);});
  const contactY=kind===0?1.77:1.6;
  return {root,torso,neck,head,eyes,arms,cards,halo,chair,bodyMeshes,kind,seat,youTexture,contactY,blinkAt:2+kind*1.1,lastCount:5,playAt:-100};
}

export function makeWreckage(actor) {
  actor.root.updateMatrixWorld(true);
  const group=new T.Group();group.position.set(actor.seat.x,0,actor.seat.z);group.rotation.y=actor.seat.facing;
  const inverseRoot=actor.root.matrixWorld.clone().invert(),localMatrix=new T.Matrix4();
  actor.bodyMeshes.forEach((source,index)=>{
    const piece=new T.Mesh(source.geometry,source.material);
    localMatrix.multiplyMatrices(inverseRoot,source.matrixWorld);
    localMatrix.decompose(piece.position,piece.quaternion,piece.scale);
    piece.userData.startPosition=piece.position.clone();
    piece.userData.startQuaternion=piece.quaternion.clone();
    source.geometry.computeBoundingBox();
    const size=new T.Vector3();source.geometry.boundingBox.getSize(size).multiply(piece.scale);
    const lane=(index%5)-2,depth=(Math.floor(index/5)%4)-1.5;
    piece.userData.restPosition=new T.Vector3(lane*.2+(index%2)*.06,-.36+Math.max(.025,size.y*.42),depth*.16-.12);
    piece.userData.restQuaternion=new T.Quaternion().setFromEuler(new T.Euler(Math.PI/2+(index%3)*.22,(index%4)*.47,(index%2?1:-1)*.3));
    group.add(piece);
  });
  group.visible=false;
  return group;
}

export function makeHammer(seat, contactY=1.6) {
  // Include the lower striking cap in the collision height so no visible mesh crosses the actor.
  const headOffset=1.05,headHalfHeight=.35,baseY=contactY+headOffset+headHalfHeight;
  const root=new T.Group(); root.position.set(seat.x,baseY,seat.z);
  root.rotation.y=seat.facing; // local +Z points toward the table center
  const pivot=new T.Group(); root.add(pivot);
  const brass=surface(0xc09b5c,.7), steel=surface(0x747e78,.8), dark=surface(0x232d2c,.35);
  const head=new T.Group(); head.position.y=-headOffset; pivot.add(head);
  // At contact the broad circular underside is horizontal and above the target.
  part(head,new T.CylinderGeometry(.47,.47,.58,20),steel);
  part(head,new T.CylinderGeometry(.5,.5,.07,20),brass,0,.3,0);
  part(head,new T.CylinderGeometry(.5,.5,.08,20),dark,0,-.31,0);
  part(head,new T.TorusGeometry(.475,.025,6,32),brass,0,.18,0).rotation.x=Math.PI/2;
  part(pivot,new T.CylinderGeometry(.065,.085,1,10),surface(0x68472d),0,-.47,0);
  for(let i=0;i<5;i++) part(pivot,new T.CylinderGeometry(.075,.075,.045,10),dark,0,-.2-i*.12,0);
  part(root,new T.SphereGeometry(.105,10,8),brass);
  root.visible=false;
  return {root,pivot,head,baseY,contactY};
}
