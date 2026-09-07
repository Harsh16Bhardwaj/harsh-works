import * as T from 'three';

export function surface(color, metalness = 0) {
  return new T.MeshStandardMaterial({ color, metalness, roughness: metalness ? .36 : .78, flatShading: true });
}
export function part(parent, geometry, material, x=0, y=0, z=0) {
  const object = new T.Mesh(geometry, material);
  object.position.set(x,y,z); parent.add(object); return object;
}

export function makeActor(seat, kind=0) {
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
  const chair=part(root,new T.BoxGeometry(.68,.76,.13),shadow,0,.55,-.3);
  part(chair,new T.BoxGeometry(.54,.035,.04),gold,0,.27,.08);
  return {root,torso,neck,head,eyes,arms,cards,halo,kind,seat,blinkAt:2+kind*1.1,lastCount:5,playAt:-100};
}

export function makeHammer(seat) {
  const root=new T.Group(); root.position.set(seat.x,2.93,seat.z);
  root.rotation.y=seat.facing; // local +Z points toward the table center
  const pivot=new T.Group(); root.add(pivot);
  const brass=surface(0xc09b5c,.7), steel=surface(0x747e78,.8), dark=surface(0x232d2c,.35);
  const head=new T.Group(); head.position.y=-1.56; pivot.add(head);
  // At contact the broad circular underside is horizontal and above the target.
  part(head,new T.CylinderGeometry(.47,.47,.58,20),steel);
  part(head,new T.CylinderGeometry(.5,.5,.07,20),brass,0,.3,0);
  part(head,new T.CylinderGeometry(.5,.5,.08,20),dark,0,-.31,0);
  part(head,new T.TorusGeometry(.475,.025,6,32),brass,0,.18,0).rotation.x=Math.PI/2;
  part(pivot,new T.CylinderGeometry(.065,.085,1.48,10),surface(0x68472d),0,-.72,0);
  for(let i=0;i<5;i++) part(pivot,new T.CylinderGeometry(.075,.075,.045,10),dark,0,-.2-i*.12,0);
  part(root,new T.SphereGeometry(.105,10,8),brass);
  root.visible=false;
  return {root,pivot,head};
}
