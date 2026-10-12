const $ = id => document.getElementById(id);
const canvas = $('game'), g = canvas.getContext('2d');
g.imageSmoothingEnabled = false;
const paths = {
  city:'backgrounds/medieval-town-v1.png',
  forest:'backgrounds/forest-watercolor-v1.png',
  cave:'backgrounds/crystal-cavern-v1.png',
  peaks:'backgrounds/twilight-peaks-v1.png',
  ruins:'backgrounds/sun-ruins-v1.png',
  throne:'backgrounds/celestial-throne-v1.png',
  heroes:'sprites/heroes-v2.png',
  warriorWalk:'sprites/warrior-walk-v1.png',
  mageWalk:'sprites/mage-walk-v1.png',
  warriorAttack:'sprites/warrior-attack-v2.png',
  mageAttack:'sprites/mage-attack-v2.png',
  monstersA:'sprites/monsters-01-v3.png',
  monstersB:'sprites/monsters-02-v3.png'
};
const images = {};
for (const [name,path] of Object.entries(paths)) {
  images[name] = new Image();
  images[name].src = 'public/assets/' + path;
}
const HERO_CROPS = [[55,84,668,948],[106,107,730,948]];
// Global atlas bounds: several creatures extend beyond a nominal fifth of the sheet.
const MONSTER_CROPS = [
  [70,385,330,640],[465,288,760,640],[830,312,1180,640],[1195,244,1690,635],[1700,190,2160,635],
  [8,195,455,645],[455,260,830,645],[830,195,1180,615],[1185,215,1670,645],[1670,200,2160,645]
];
const MONSTERS = [
  {name:'Broto Saltitante',kind:'physical',size:57,element:'earth',weakness:'fire',motion:'squish'},
  {name:'Duende de Folhas',kind:'physical',size:63,element:'earth',weakness:'air',motion:'sway'},
  {name:'Mariposa Lilás',kind:'magic',size:62,element:'air',weakness:'water',motion:'fly'},
  {name:'Raposa do Bosque',kind:'physical',size:75,element:'fire',weakness:'water',motion:'stride'},
  {name:'Arqueiro Cogumelo',kind:'ranged',size:78,element:'earth',weakness:'fire',motion:'sway'},
  {name:'Golem de Musgo',kind:'physical',size:94,element:'earth',weakness:'air',motion:'heavy'},
  {name:'Sentinela Solar',kind:'ranged',size:86,element:'fire',weakness:'water',motion:'sway'},
  {name:'Espírito Lunar',kind:'magic',size:77,element:'water',weakness:'earth',motion:'fly'},
  {name:'Serpente Celeste',kind:'magic',size:94,element:'air',weakness:'earth',motion:'sway'},
  {name:'Cavaleiro Obsidiano',kind:'physical',size:99,element:'fire',weakness:'water',motion:'heavy'}
];
const REGIONS = ['BOSQUE DO AMANHECER','CAVERNA DOS ECOS','PICOS DO CREPÚSCULO','RUÍNAS DO SOL','TRONO CELESTE'];
const state = {
  profileId:null,name:'',className:null,advantage:'water',weakness:'fire',
  room:0,highest:0,mode:'idle',repeat:false,heldLeft:false,x:460,ground:390,heroPhase:0,
  hp:100,maxHp:100,mana:100,maxMana:100,xp:0,level:1,gold:0,
  basePhysical:4,baseMagical:4,physicalDefense:0,magicalDefense:0,
  physicalSkill:0,magicalSkill:0,skillPoints:0,defensePoints:0,
  enemies:[],shots:[],effects:[],particles:[],drops:[],lastPlayerHit:0,lastMonsterHit:0,
  lastMonsterPhysical:0,lastMonsterMagical:0,hitAt:0,hurtAt:0,pendingAttack:null
};
const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
const fmt = value => Math.round(value).toLocaleString('pt-BR');
const meta = createMeta(state,{updateUI,label,onProfileSelected,onProfileLeft});
let heroAttackAt = 0, last = performance.now(), nextRoomAt = 0;
function label(message) { $('message').textContent = message; }
function xpNeeded() { return 20 + (state.level-1)*8; }
function elementColor(key) { return ELEMENTS[key]?.color||'#fff0c9'; }
function elementBonus(attackerElement,targetWeakness) { return attackerElement===targetWeakness?1.1:1; }
function weaponDamage() {
  const weapon = meta.weapon();
  const basePhysical = state.basePhysical + state.physicalSkill;
  const baseMagical = state.baseMagical + state.magicalSkill;
  if (!weapon) return state.className==='warrior'
    ? {physical:basePhysical,magical:0}
    : {physical:0,magical:baseMagical};
  return {
    physical:weapon.physical>0?basePhysical+weapon.physical:0,
    magical:weapon.magical>0?baseMagical+weapon.magical:0
  };
}
function displayedAttack(kind) {
  const weapon=meta.weapon();
  return (kind==='physical'?state.basePhysical+state.physicalSkill:state.baseMagical+state.magicalSkill)+
    (weapon?.[kind]||0);
}
function defenseValue(kind) {
  return state[kind==='physical'?'physicalDefense':'magicalDefense']+meta.armorDefense(kind);
}
function onProfileSelected() {
  state.lastPlayerHit=0;state.lastMonsterHit=0;
  state.lastMonsterPhysical=0;state.lastMonsterMagical=0;state.heroPhase=0;
  enterRoom(0);
  label('Bem-vindo, '+state.name+'. Prepare-se na cidade ou pressione RUN RIGHT.');
}
function onProfileLeft() {
  state.room=0;state.mode='idle';state.enemies=[];state.shots=[];state.effects=[];state.particles=[];state.drops=[];state.x=460;state.pendingAttack=null;
  label('Escolha um personagem para entrar na jornada.');
  updateUI();
}
function countForRoom(room) {return room%10===0?1:1+Math.floor(((room-1)%10)/2);}
function enemyType(room,index) {
  const step=((room-1)%10)+1,decade=Math.floor((room-1)/10);
  if (step<=3) return [0,1,2][(step+index-1)%3];
  const pools=[[1,2,3,4],[2,3,4,5],[3,4,5,6],[4,5,6,7],[5,6,7,8],
    [6,7,8,9],[7,8,9,3],[8,9,4,6],[9,5,6,8],[7,8,9,5]];
  return pools[decade][(step+index*2)%4];
}
function makeEnemies(room) {
  const step=((room-1)%10)+1,decade=Math.floor((room-1)/10),weak=step<=3,boss=room%20===0;
  return Array.from({length:countForRoom(room)},(_,index)=>{
    const type=boss?[5,6,7,8,9][room/20-1]:enemyType(room,index);
    const species=MONSTERS[type];
    const hp=Math.round((18+decade*14+step*5)*(weak ? .65 : 1)*(boss ? 3.2 : 1));
    const power=(2+decade*1.5+step*.55)*(weak ? .7 : 1)*(boss ? 1.8 : 1);
    const physicalAttack=Math.max(1,Math.round(power*(species.kind==='physical' ? .75 : .32)));
    const magicalAttack=Math.max(1,Math.round(power*(species.kind==='magic' ? .75 : .28)));
    return {id:index,type,kind:species.kind,name:species.name,element:species.element,weakness:species.weakness,
      boss,x:650+index*70,y:state.ground,hp,maxHp:hp,physicalAttack,magicalAttack,
      attackAt:0,hurtAt:0,diedAt:0,phase:index*1.8,moving:false};
  });
}
function enterRoom(room,fromRight=false) {
  state.room=clamp(room,0,100);
  state.shots=[];state.effects=[];state.particles=[];state.drops=[];state.pendingAttack=null;state.hitAt=0;
  meta.closeWindow();
  if (!state.room) {
    state.x=460;state.enemies=[];state.mode='idle';
    label('Na Vila do Amanhecer. Prepare equipamentos e distribua pontos.');
  } else {
    state.highest=Math.max(state.highest,state.room);
    state.enemies=makeEnemies(state.room);
    state.x=fromRight?900:295;
    state.mode=fromRight?'back':'forward';
    label('Sala '+state.room+': '+state.enemies.length+' criatura(s) à frente.');
  }
  updateUI();meta.save();
}
function addXp(amount) {
  state.xp+=amount;
  while (state.xp>=xpNeeded()) {
    state.xp-=xpNeeded();state.level++;
    state.basePhysical++;state.baseMagical++;
    const hpGain=state.className==='warrior'?10:6,mpGain=state.className==='warrior'?5:7;
    state.maxHp+=hpGain;state.maxMana+=mpGain;
    state.hp=Math.min(state.maxHp,state.hp+hpGain);
    state.mana=Math.min(state.maxMana,state.mana+mpGain);
    state.skillPoints++;state.defensePoints++;
    floatText(state.x,260,'NÍVEL '+state.level,'#ffe2a4');
    label('Nível '+state.level+'! Há 1 ponto de Skill e 1 de Defesa para alocar na cidade.');
  }
  meta.save();
}
function floatText(x,y,text,color) {state.effects.push({x,y,text,color,life:900});}
function burst(x,y,color,count=8) {
  for (let i=0;i<count;i++) {
    const angle=(i/count)*Math.PI*2+Math.random()*.3, speed=.07+Math.random()*.14;
    state.particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-.07,
      size:1.5+Math.random()*2.5,life:350+Math.random()*250,maxLife:600,color});
  }
}
function heroBox() {return {x:state.x-21,y:state.ground-102,w:42,h:102};}
function enemyBox(enemy) {
  const size=MONSTERS[enemy.type].size*(enemy.boss?1.42:1);
  return {x:enemy.x-size*.36,y:enemy.y-size,w:size*.72,h:size};
}
function overlap(a,b) {return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function orbHits(x,y,r,box) {return x+r>box.x&&x-r<box.x+box.w&&y+r>box.y&&y-r<box.y+box.h;}
function nearest() {return state.enemies.filter(enemy=>enemy.hp>0).sort((a,b)=>Math.abs(a.x-state.x)-Math.abs(b.x-state.x))[0];}
function hurtEnemy(enemy,damage,attackElement) {
  if (enemy.hp<=0) return;
  const advantage=state.advantage===enemy.weakness||attackElement===enemy.weakness;
  const multiplier=advantage?1.1:1;
  const raw=(damage.physical||0)+(damage.magical||0);
  const dealt=Math.min(enemy.hp,Math.max(1,Math.round(raw*multiplier)));
  enemy.hp-=dealt;enemy.hurtAt=performance.now();state.lastPlayerHit=dealt;
  floatText(enemy.x,enemy.y-MONSTERS[enemy.type].size-23,'-'+fmt(dealt)+(advantage?' ✦':''),'#fff0c4');
  burst(enemy.x-12,enemy.y-MONSTERS[enemy.type].size*.55,elementColor(attackElement),advantage?12:7);
  meta.soundFx('hit');
  if (enemy.hp<=0) {
    enemy.diedAt=enemy.hurtAt;
    const decade=Math.floor((state.room-1)/10);
    const gold=2+decade*2+Math.floor(Math.random()*4)+(enemy.boss?22:0);
    state.gold+=gold;
    for (let i=0;i<Math.min(5,2+Math.floor(gold/12));i++)
      state.drops.push({x:enemy.x,y:enemy.y-40,vx:(i-2)*.045,vy:-.18-Math.random()*.07,age:0});
    floatText(enemy.x,enemy.y-34,'+'+gold+' GOLD','#f6d58d');
    addXp(7+decade+(enemy.boss?12:0));
    if (state.enemies.every(value=>value.hp<=0)) {
      meta.soundFx('win');
      state.mode=state.repeat||state.room===100?'repeat-back':'advance';
      nextRoomAt=performance.now()+350;
      label(state.room===100?'Sala 100 vencida! Voltando para a sala 99.':state.repeat?
        'Vitória! O herói volta para repetir a sala.':'Vitória! Seguindo em frente.');
    }
  }
  updateUI();meta.save();
}
function hurtHero(physical,magical,element) {
  if (state.mode==='recover') return;
  const multiplier=elementBonus(element,state.weakness);
  const physicalHit=Math.max(0,Math.round(physical*multiplier)-defenseValue('physical'));
  const magicalHit=Math.max(0,Math.round(magical*multiplier)-defenseValue('magical'));
  const dealt=physicalHit+magicalHit;
  state.lastMonsterHit=dealt;state.lastMonsterPhysical=physicalHit;
  state.lastMonsterMagical=magicalHit;state.hurtAt=performance.now();
  if (dealt>0) {
    state.hp=Math.max(0,state.hp-dealt);
    floatText(state.x,250,'-'+fmt(dealt),elementColor(element));
    burst(state.x,state.ground-70,elementColor(element),8);
    meta.soundFx('hurt');
  } else floatText(state.x,250,'BLOQUEADO','#cde7d8');
  if (state.hp===0) {
    state.mode='recover';state.shots=[];state.pendingAttack=null;
    label('Você caiu. Voltando à sala 1...');
    setTimeout(()=>{
      if (state.mode!=='recover') return;
      state.hp=state.maxHp;state.mana=state.maxMana;
      enterRoom(1);
    },1200);
  }
  updateUI();meta.save();
}
function heroUsesRange() {
  const weapon=meta.weapon();
  return weapon?weapon.type==='magical'&&state.mana>=3:state.className==='mage'&&state.mana>=3;
}
function playerAttack(now) {
  const target=nearest();
  if (!target) return;
  state.hitAt=now;
  state.pendingAttack={range:heroUsesRange(),impactAt:now+330};
}
function resolvePlayerAttack() {
  const attack=state.pendingAttack;
  state.pendingAttack=null;
  if (!attack||state.mode==='recover'||!nearest()) return;
  const weapon=meta.weapon(),damage=weaponDamage(),element=weapon?.element||state.advantage;
  if (attack.range) {
    state.mana-=3;
    state.shots.push({owner:'hero',x:state.x+28,y:state.ground-42,vx:.72,r:10,
      physical:damage.physical,magical:damage.magical,element,life:1700,color:elementColor(element)});
  } else {
    const reach={x:state.x+7,y:state.ground-106,w:102,h:106};
    const melee=weapon?.type==='magical'
      ? {physical:state.basePhysical+state.physicalSkill+(weapon.physical||0),magical:0}
      : damage.physical+damage.magical>0?damage:{physical:state.basePhysical+state.physicalSkill,magical:0};
    for (const enemy of state.enemies) if (enemy.hp>0&&overlap(reach,enemyBox(enemy))) hurtEnemy(enemy,melee,element);
  }
}
function enemyAttack(enemy,now) {
  enemy.attackAt=now;
  if (enemy.kind==='physical') {
    const reach={x:enemy.x-91,y:state.ground-100,w:91,h:100};
    if (overlap(reach,heroBox())) hurtHero(enemy.physicalAttack,enemy.magicalAttack,enemy.element);
  } else {
    state.shots.push({owner:'enemy',x:enemy.x-24,y:state.ground-60,
      vx:enemy.kind==='magic'?-.46:-.62,r:enemy.kind==='magic'?10:7,
      physical:enemy.physicalAttack,magical:enemy.magicalAttack,element:enemy.element,
      life:2300,color:elementColor(enemy.element)});
  }
}
function updateUI() {
  const logged=!!state.profileId,room=state.room;
  $('status-top').hidden=!logged;
  $('combat-readout').hidden=!logged||!room;
  const target=logged&&room?nearest():null;
  $('target-card').hidden=!target;
  if (target) {
    $('target-name').textContent=target.name;
    $('target-element').textContent='Elemento: '+ELEMENTS[target.element].name;
    $('target-weakness').textContent='Fraco a: '+ELEMENTS[target.weakness].name;
    $('target-attack').textContent='Ataque F/M '+target.physicalAttack+'/'+target.magicalAttack;
  }
  $('city-hub').hidden=!logged||room!==0;
  $('controls-dock').hidden=!logged;
  $('hotbar').hidden=!logged;
  $('switch-character').hidden=!logged||room!==0;
  $('area').textContent=room?REGIONS[Math.min(4,Math.floor((room-1)/20))]:'VILA DO AMANHECER';
  $('room').textContent=room?(room%20===0?'MINIBOSS · ':'')+'SALA '+String(room).padStart(2,'0')+' / 100':'CIDADE';
  if (!logged) return;
  $('hero-name').textContent=state.name;
  $('class-label').textContent=(state.className==='warrior'?'GUERREIRO':'MAGO')+' · '+ELEMENTS[state.advantage].name;
  $('level').textContent=state.level;
  $('hp').textContent=fmt(state.hp)+'/'+fmt(state.maxHp);
  $('mana').textContent=fmt(state.mana)+'/'+fmt(state.maxMana);
  $('xp').textContent=fmt(state.xp)+'/'+fmt(xpNeeded());
  $('hpbar').style.width=100*state.hp/state.maxHp+'%';
  $('manabar').style.width=100*state.mana/state.maxMana+'%';
  $('xpbar').style.width=100*state.xp/xpNeeded()+'%';
  $('physical-attack').textContent=fmt(displayedAttack('physical'));
  $('magic-attack').textContent=fmt(displayedAttack('magical'));
  $('physical-defense').textContent=fmt(defenseValue('physical'));
  $('magical-defense').textContent=fmt(defenseValue('magical'));
  $('gold').textContent=fmt(state.gold);
  $('depth').textContent=state.highest;
  $('hero-hit').textContent=fmt(state.lastPlayerHit);
  $('monster-hit').textContent=fmt(state.lastMonsterPhysical)+'/'+fmt(state.lastMonsterMagical);
  $('skill-points-badge').textContent=state.skillPoints?String(state.skillPoints):'';
  $('defense-points-badge').textContent=state.defensePoints?String(state.defensePoints):'';
  $('repeat').setAttribute('aria-pressed',String(state.repeat));
  $('repeat-state').textContent=state.repeat?'ON':'OFF';
  $('run').disabled=state.mode==='recover';
}
function drawBackground(t) {
  const region=Math.min(4,Math.floor((Math.max(1,state.room)-1)/20));
  const key=state.room?['forest','cave','peaks','ruins','throne'][region]:'city';
  const img=images[key];
  if (img.complete&&img.naturalWidth) {
    const height=Math.min(img.naturalHeight,img.naturalWidth/2);
    g.drawImage(img,0,(img.naturalHeight-height)/2,img.naturalWidth,height,0,0,960,480);
  } else {
    g.fillStyle=state.room?'#546b68':'#aeaa8f';g.fillRect(0,0,960,480);
  }
  if (state.room) {
    g.fillStyle=region===1?'#6261a312':'#f0d2b010';g.fillRect(0,0,960,480);
    for (let i=0;i<13;i++) {
      const x=(i*181)%940,y=148+(i*69)%210;
      g.globalAlpha=.2+.12*Math.sin(t/570+i);
      g.fillStyle=region===1?'#c9bcff':'#fff0c4';
      g.fillRect(x+Math.sin(t/800+i)*5,y,3,3);
    }
    g.globalAlpha=1;
  }
}
function drawShadow(x,ground,width,alpha) {
  g.fillStyle='rgba(18,31,40,'+alpha+')';
  g.beginPath();g.ellipse(x,ground+2,width*.32,5,0,0,Math.PI*2);g.fill();
}
function drawWholeSprite(image,cell,crop,x,ground,width,height,phase,moving,facing,hurt,motion,attackPulse) {
  const air=motion==='fly';
  drawShadow(x,ground,width,air ? .27 : .38);
  const step=Math.sin(phase),breath=Math.sin(phase*.27);
  let sx=1,sy=1,rotation=0,offsetY=0;
  if (air) {
    offsetY=-11+Math.sin(phase*.8)*4;
    sx=1+Math.sin(phase*2.3)*.045;
    sy=1-Math.sin(phase*2.3)*.025;
    rotation=Math.sin(phase*.65)*.045;
  } else if (motion==='squish') {
    sx=1+Math.abs(step)*.055;sy=1-Math.abs(step)*.065;
    rotation=Math.sin(phase*.35)*.018;
  } else if (motion==='heavy') {
    sx=1+Math.abs(step)*.012;sy=1-Math.abs(step)*.018;
    rotation=(moving?step*.018:breath*.008);
  } else {
    sx=1+Math.abs(step)*.016;sy=1-Math.abs(step)*.025;
    rotation=(moving?step*.03:breath*.01);
  }
  if (attackPulse) rotation+=attackPulse*.09;
  g.save();
  g.translate(x+facing*attackPulse*6,ground+offsetY);
  g.scale(facing*sx,sy);
  g.rotate(rotation);
  if (hurt) g.filter='brightness(1.55)';
  g.drawImage(image,cell+crop[0],crop[1],crop[2]-crop[0],crop[3]-crop[1],
    -width/2,-height,width,height);
  g.restore();
  if (moving&&!air) {
    const dustAlpha=.10+Math.abs(step)*.11;
    g.fillStyle='rgba(237,220,182,'+dustAlpha+')';
    g.beginPath();g.arc(x-facing*width*.27,ground-1,2+Math.abs(step)*2,0,Math.PI*2);g.fill();
  }
}
function drawHero(t) {
  if (!state.profileId) return;
  const mage=state.className==='mage';
  const attackElapsed=t-state.hitAt;
  const attacking=state.room>0&&attackElapsed>=0&&attackElapsed<640&&state.mode!=='recover';
  const image=images[mage?(attacking?'mageAttack':'mageWalk'):(attacking?'warriorAttack':'warriorWalk')];
  const moving=['forward','back','advance','repeat-back'].includes(state.mode)||state.heldLeft;
  const facing=state.mode==='back'||state.mode==='repeat-back'?-1:1;
  const attackPulse=attacking?Math.sin(attackElapsed/640*Math.PI):0;
  if (image.complete&&image.naturalWidth) {
    const frame=attacking?(attackElapsed<150?0:attackElapsed<280?1:attackElapsed<420?2:3)
      :(moving?Math.floor(state.heroPhase/(Math.PI/2))%4:1);
    const cell=image.naturalWidth/4;
    const bounds=attacking?(mage?[0,543,1020,1640,2172]:[0,543,1040,1680,2172]):null;
    const sourceX=bounds?bounds[frame]:frame*cell;
    const sourceWidth=bounds?bounds[frame+1]-sourceX:cell;
    drawShadow(state.x,state.ground,78,.4);
    g.save();
    g.translate(state.x+facing*(attacking&&frame===2?5:0),state.ground);
    g.scale(facing,1);
    if (state.mode==='recover') g.rotate(-.6);
    if (t-state.hurtAt<150) g.filter='brightness(1.55)';
    g.drawImage(image,sourceX,42,sourceWidth,650,-48,-116,96,116);
    g.restore();
    if (moving) {
      const dust=.12+.15*Math.abs(Math.sin(state.heroPhase));
      g.fillStyle='rgba(240,219,184,'+dust+')';
      g.beginPath();g.arc(state.x-facing*22,state.ground-1,2.4,0,Math.PI*2);g.fill();
    }
  } else if (images.heroes.complete&&images.heroes.naturalWidth) {
    const fallback=images.heroes;
    drawWholeSprite(fallback,mage?fallback.naturalWidth/2:0,HERO_CROPS[mage?1:0],
      state.x,state.ground,86,116,state.heroPhase+(moving?0:t/700),moving,facing,
      t-state.hurtAt<150,'stride',attackPulse);
  } else {g.fillStyle='#d9887b';g.fillRect(state.x-20,state.ground-100,40,100);}
  if (attackPulse>0&&attackElapsed>280&&attackElapsed<440) {
    g.save();
    const color=elementColor(meta.weapon()?.element||state.advantage);
    g.strokeStyle=color;g.shadowColor=color;g.shadowBlur=15;
    g.globalAlpha=.55;g.lineWidth=2+attackPulse*2;
    g.beginPath();g.arc(state.x+facing*28,state.ground-75,39+attackPulse*8,
      facing===1 ? -1.05 : 2.1,facing===1 ? .85 : 4.2);g.stroke();
    g.restore();
  }
}
function drawEnemy(enemy,t) {
  const image=enemy.type<5?images.monstersA:images.monstersB;
  const species=MONSTERS[enemy.type],width=species.size*(enemy.boss?1.42:1),height=width;
  const elapsed=t-enemy.attackAt,attackPulse=elapsed>=0&&elapsed<360?Math.sin(elapsed/360*Math.PI):0;
  g.save();
  if (enemy.diedAt) g.globalAlpha=Math.max(0,1-(t-enemy.diedAt)/430);
  if (image.complete&&image.naturalWidth)
    drawWholeSprite(image,0,MONSTER_CROPS[enemy.type],
      enemy.x,enemy.y,width,height,enemy.phase+(enemy.moving?0:t/770),enemy.moving,-1,
      t-enemy.hurtAt<160,species.motion,attackPulse);
  else {g.fillStyle='#b59a94';g.fillRect(enemy.x-width/2,enemy.y-height,width,height);}
  if (attackPulse>.15&&enemy.hp>0) {
    const color=elementColor(enemy.element);
    g.strokeStyle=color;g.shadowColor=color;g.shadowBlur=12;g.lineWidth=2+attackPulse*3;
    g.beginPath();g.arc(enemy.x-width*.32,enemy.y-height*.55,width*.3,2.2,4.9);g.stroke();
    g.shadowBlur=0;
  }
  g.restore();
  if (enemy.hp<=0) return;
  const barW=enemy.boss?106:67;
  g.fillStyle='#1c2634';g.fillRect(enemy.x-barW/2,enemy.y-height-16,barW,6);
  g.fillStyle=elementColor(enemy.element);g.fillRect(enemy.x-barW/2,enemy.y-height-16,barW*enemy.hp/enemy.maxHp,6);
  g.textAlign='center';g.font='bold 11px system-ui';g.fillStyle='#fff7e3';
  g.shadowColor='#192530';g.shadowBlur=4;
  g.fillText((enemy.boss?'MINIBOSS · ':'')+enemy.name+' '+ELEMENTS[enemy.element].icon,enemy.x,enemy.y-height-23);
  g.shadowBlur=0;g.textAlign='left';
}
function drawShots() {
  for (const shot of state.shots) {
    g.save();g.fillStyle=shot.color;g.strokeStyle=shot.color;g.shadowColor=shot.color;g.shadowBlur=19;
    g.globalAlpha=.35;g.beginPath();g.arc(shot.x-shot.vx*20,shot.y,shot.r*1.25,0,Math.PI*2);g.fill();
    g.globalAlpha=1;g.beginPath();g.arc(shot.x,shot.y,shot.r,0,Math.PI*2);g.fill();
    g.fillStyle='#fffaf0';g.beginPath();g.arc(shot.x,shot.y,shot.r*.38,0,Math.PI*2);g.fill();
    g.restore();
  }
}
function drawDrops(dt) {
  for (let i=state.drops.length-1;i>=0;i--) {
    const drop=state.drops[i];drop.age+=dt;
    if (drop.age<360) {
      drop.x+=drop.vx*dt;drop.y+=drop.vy*dt;drop.vy+=dt*.00055;
      drop.y=Math.min(state.ground-7,drop.y);
    } else {
      drop.x+=(state.x-drop.x)*Math.min(1,dt*.012);
      drop.y+=(state.ground-75-drop.y)*Math.min(1,dt*.012);
    }
    g.save();g.globalAlpha=Math.max(0,Math.min(1,(900-drop.age)/180));
    g.fillStyle='#f5c778';g.strokeStyle='#fff3c8';g.shadowColor='#ffd890';g.shadowBlur=10;
    g.beginPath();g.ellipse(drop.x,drop.y,4,5,0,0,Math.PI*2);g.fill();g.stroke();
    g.restore();
    if (drop.age>900) state.drops.splice(i,1);
  }
}
function drawParticles(dt) {
  for (let i=state.particles.length-1;i>=0;i--) {
    const particle=state.particles[i];
    particle.x+=particle.vx*dt;particle.y+=particle.vy*dt;particle.vy+=dt*.00027;particle.life-=dt;
    g.save();g.globalAlpha=Math.max(0,particle.life/particle.maxLife);
    g.fillStyle=particle.color;g.shadowColor=particle.color;g.shadowBlur=8;
    g.beginPath();g.arc(particle.x,particle.y,particle.size,0,Math.PI*2);g.fill();
    g.restore();
    if (particle.life<=0) state.particles.splice(i,1);
  }
}
function drawEffects(dt) {
  for (let i=state.effects.length-1;i>=0;i--) {
    const effect=state.effects[i];effect.life-=dt;effect.y-=dt*.035;
    g.globalAlpha=Math.min(1,effect.life/450);g.fillStyle=effect.color;
    g.font='bold 17px system-ui';g.textAlign='center';g.shadowColor='#172336';g.shadowBlur=5;
    g.fillText(effect.text,effect.x,effect.y);
    if (effect.life<=0) state.effects.splice(i,1);
  }
  g.globalAlpha=1;g.shadowBlur=0;g.textAlign='left';
}
function stepGame(t,dt) {
  state.mana=Math.min(state.maxMana,state.mana+dt*.0015);
  if (state.heldLeft&&state.pendingAttack) {state.pendingAttack=null;state.hitAt=0;}
  if (state.pendingAttack&&t>=state.pendingAttack.impactAt) resolvePlayerAttack();
  const startX=state.x;
  if (state.heldLeft&&state.room&&state.mode!=='recover') {
    state.mode='back';state.x-=dt*.46;
    if (state.x<45) enterRoom(state.room-1,true);
  } else if (state.mode==='back') {
    const target=nearest();
    state.mode=state.room?(target?(state.x>target.x+30?'paused-back':'forward'):'advance'):'idle';
    if (state.mode==='paused-back') label('Retorno pausado. Segure ◀ para continuar ou RUN RIGHT para enfrentar esta sala.');
  }
  if (state.mode==='forward') {
    const target=nearest();
    if (target) {
      const stop=heroUsesRange()?195:70;
      state.x=Math.min(state.x+dt*.18,target.x-stop);
      if (target.x-state.x<=stop+2) state.mode='fight';
    }
  }
  if (state.mode==='fight') {
    const target=nearest();
    if (!target) state.mode=state.repeat?'repeat-back':'advance';
    else {
      const reach=heroUsesRange()?250:97;
      if (target.x-state.x>reach) state.x=Math.min(state.x+dt*.17,target.x-reach);
      if (t-heroAttackAt>(heroUsesRange()?900:700)) {heroAttackAt=t;playerAttack(t);}
    }
  }
  state.heroPhase+=Math.abs(state.x-startX)*.115;
  for (const enemy of state.enemies) {
    enemy.moving=false;
    if (enemy.hp<=0||!['forward','fight'].includes(state.mode)) continue;
    const distance=enemy.x-state.x;
    const desired=enemy.kind==='physical'?64:enemy.kind==='ranged'?157:170;
    if (distance>desired) {
      const previous=enemy.x;
      enemy.x=Math.max(state.x+desired,enemy.x-dt*(enemy.boss ? .085 : .115));
      enemy.phase+=Math.abs(previous-enemy.x)*.14;
      enemy.moving=enemy.x!==previous;
    }
    if (distance<(enemy.kind==='physical'?96:290)&&t-enemy.attackAt>(enemy.boss?1700:1400)) enemyAttack(enemy,t);
  }
  for (let i=state.shots.length-1;i>=0;i--) {
    const shot=state.shots[i];shot.x+=shot.vx*dt;shot.life-=dt;
    if (shot.owner==='hero') {
      const enemy=state.enemies.find(value=>value.hp>0&&orbHits(shot.x,shot.y,shot.r,enemyBox(value)));
      if (enemy) {hurtEnemy(enemy,shot,shot.element);state.shots.splice(i,1);continue;}
    } else if (orbHits(shot.x,shot.y,shot.r,heroBox())) {
      hurtHero(shot.physical,shot.magical,shot.element);
      state.shots.splice(i,1);continue;
    }
    if (shot.life<=0||shot.x<0||shot.x>960) state.shots.splice(i,1);
  }
  if (t>nextRoomAt&&state.mode==='advance') {
    const previous=state.x;state.x+=dt*.33;state.heroPhase+=Math.abs(state.x-previous)*.115;
    if (state.x>925) enterRoom(Math.min(100,state.room+1));
  }
  if (t>nextRoomAt&&state.mode==='repeat-back') {
    const previous=state.x;state.x-=dt*.34;state.heroPhase+=Math.abs(state.x-previous)*.115;
    if (state.x<45) enterRoom(state.room===100?99:state.room);
  }
  meta.autoUsePotions();
}
function frame(t) {
  const dt=Math.min(40,t-last);last=t;
  if (state.profileId&&state.room) stepGame(t,dt);
  drawBackground(t);
  for (const enemy of state.enemies) drawEnemy(enemy,t);
  drawDrops(dt);drawHero(t);drawShots();drawParticles(dt);drawEffects(dt);
  if (state.profileId) {
    $('mana').textContent=fmt(state.mana)+'/'+fmt(state.maxMana);
    $('manabar').style.width=100*state.mana/state.maxMana+'%';
  }
  requestAnimationFrame(frame);
}
$('run').onclick=()=>{
  if (!state.profileId||state.mode==='recover') return;
  if (state.room===0) enterRoom(1);
  else if (state.mode==='repeat-back') {state.mode='advance';state.repeat=false;updateUI();meta.save();}
  else if (state.mode==='paused-back') enterRoom(state.room);
  else if (state.mode==='back') {
    const target=nearest();
    if (target&&state.x>target.x+30) enterRoom(state.room);
    else state.mode='forward';
  }
};
$('repeat').onclick=()=>{
  if (!state.profileId) return;
  state.repeat=!state.repeat;
  label(state.repeat?'Repetir sala ativado. O herói voltará após vencer.':'Repetir sala desativado.');
  updateUI();meta.save();
};
const left=$('left');
function setLeft(value) {state.heldLeft=value;left.classList.toggle('held',value);}
left.addEventListener('pointerdown',event=>{left.setPointerCapture(event.pointerId);setLeft(true);});
for (const event of ['pointerup','pointercancel','lostpointercapture']) left.addEventListener(event,()=>setLeft(false));
window.addEventListener('keydown',event=>{
  if (['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
  if (event.key==='ArrowLeft'||event.key.toLowerCase()==='a') {event.preventDefault();setLeft(true);}
  if (event.key==='ArrowRight') $('run').click();
  if (/^[0-9]$/.test(event.key)) meta.useSlot(event.key==='0'?9:Number(event.key)-1,false);
  if (event.key==='Escape') meta.closeWindow();
});
window.addEventListener('keyup',event=>{
  if (event.key==='ArrowLeft'||event.key.toLowerCase()==='a') setLeft(false);
});
window.addEventListener('blur',()=>setLeft(false));
setInterval(()=>{if(state.profileId) meta.save();},8000);
updateUI();requestAnimationFrame(frame);
