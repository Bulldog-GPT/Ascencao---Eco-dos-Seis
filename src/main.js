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
  monstersB:'sprites/monsters-02-v3.png',
  dragon:'sprites/red-dragon-v1.png',
  rats:'sprites/chapter-rats-v1.png',frogs:'sprites/chapter-frogs-v1.png',
  wolves:'sprites/chapter-wolves-v1.png',vampires:'sprites/chapter-vampires-v1.png',
  mummies:'sprites/chapter-mummies-v1.png',draconians:'sprites/chapter-draconians-v1.png',
  bosses:'sprites/chapter-bosses-v1.png',
  sceneRats:'backgrounds/chapter-rats-v1.png',sceneFrogs:'backgrounds/chapter-frogs-v1.png',
  sceneWolves:'backgrounds/chapter-wolves-v1.png',sceneVampires:'backgrounds/chapter-vampires-v1.png',
  sceneMummies:'backgrounds/chapter-mummies-v1.png',sceneDraconians:'backgrounds/chapter-draconians-v1.png',
  altRats:'backgrounds/chapter-rats-alt-v1.png',altFrogs:'backgrounds/chapter-frogs-alt-v1.png',
  altWolves:'backgrounds/chapter-wolves-alt-v1.png',altVampires:'backgrounds/chapter-vampires-alt-v1.png',
  altMummies:'backgrounds/chapter-mummies-alt-v1.png',altDraconians:'backgrounds/chapter-draconians-alt-v1.png',
  bossRats:'backgrounds/boss-rats-v1.png',bossFrogs:'backgrounds/boss-frogs-v1.png',
  bossWolves:'backgrounds/boss-wolves-v1.png',bossVampires:'backgrounds/boss-vampires-v1.png',
  bossMummies:'backgrounds/boss-mummies-v1.png',bossDraconians:'backgrounds/boss-draconians-v1.png'
};
const images = {};
// Posição do piso nas pinturas originais, como fração da altura da imagem.
const BACKGROUND_FLOOR={
  sceneRats:.66,altRats:.70,bossRats:.76,
  sceneFrogs:.73,altFrogs:.71,bossFrogs:.77,
  sceneWolves:.77,altWolves:.74,bossWolves:.75,
  sceneVampires:.75,altVampires:.75,bossVampires:.72,
  sceneMummies:.74,altMummies:.73,bossMummies:.72,
  sceneDraconians:.78,altDraconians:.72,bossDraconians:.69
};
const eagerAssets=new Set(['city','heroes','warriorWalk','mageWalk','warriorAttack','mageAttack']);
for (const [name,path] of Object.entries(paths)) {
  images[name] = new Image();
  if(eagerAssets.has(name)) images[name].src = 'public/assets/' + path;
}
function ensureImage(name) {
  const image=images[name];
  if(image&&!image.src) image.src='public/assets/'+paths[name];
  return image;
}
const HERO_CROPS = [[55,84,668,948],[106,107,730,948]];
// Global atlas bounds: several creatures extend beyond a nominal fifth of the sheet.
const MONSTER_CROPS = [
  [70,385,330,640],[465,288,760,640],[830,312,1180,640],[1195,244,1690,635],[1700,190,2160,635],
  [8,195,455,645],[455,260,830,645],[830,195,1180,615],[1185,215,1670,645],[1670,200,2160,645]
];
const MONSTERS = [
  {name:'Broto Saltitante',kind:'physical',style:'hop',tell:'SALTO',size:57,element:'earth',weakness:'fire',motion:'squish',windup:480,cooldown:1750,range:82,speed:.13,lunge:32},
  {name:'Duende de Folhas',kind:'physical',style:'jab',tell:'ESTOCADA',size:63,element:'earth',weakness:'air',motion:'sway',windup:290,cooldown:1180,range:78,speed:.15},
  {name:'Mariposa Lilás',kind:'magic',style:'spores',tell:'ESPOROS',size:62,element:'air',weakness:'water',motion:'fly',windup:620,cooldown:2200,range:255,speed:.09},
  {name:'Raposa do Bosque',kind:'physical',style:'pounce',tell:'BOTE',size:75,element:'fire',weakness:'water',motion:'stride',windup:410,cooldown:1750,range:112,speed:.2,lunge:55,pushChance:.22,dashChance:.28},
  {name:'Arqueiro Cogumelo',kind:'ranged',style:'arrow',tell:'FLECHA',size:78,element:'earth',weakness:'fire',motion:'sway',windup:550,cooldown:1900,range:315,speed:.09},
  {name:'Golem de Musgo',kind:'physical',style:'slam',tell:'IMPACTO',size:94,element:'earth',weakness:'air',motion:'heavy',windup:850,cooldown:2700,range:125,speed:.065,pushChance:.55},
  {name:'Sentinela Solar',kind:'ranged',style:'flare',tell:'RAIO SOLAR',size:86,element:'fire',weakness:'water',motion:'sway',windup:750,cooldown:2400,range:315,speed:.095,dashChance:.48},
  {name:'Espírito Lunar',kind:'magic',style:'wisp',tell:'FOGO FÁTUO',size:77,element:'water',weakness:'earth',motion:'fly',windup:560,cooldown:2050,range:285,speed:.12,dashChance:.52},
  {name:'Serpente Celeste',kind:'magic',style:'venom',tell:'VENENO',size:94,element:'air',weakness:'earth',motion:'sway',windup:640,cooldown:2150,range:255,speed:.12,pushChance:.25,dashChance:.35},
  {name:'Cavaleiro Obsidiano',kind:'physical',style:'charge',tell:'INVESTIDA',size:99,element:'fire',weakness:'water',motion:'heavy',windup:690,cooldown:2500,range:145,speed:.105,lunge:75,pushChance:.62,dashChance:.22}
];
const CHAPTERS = window.GAME_CHAPTERS;
const chapterFor = room => CHAPTERS.find(chapter=>room>=chapter.start&&room<=chapter.end)||CHAPTERS[0];
const isMinibossRoom = room => room>0&&room<=200&&chapterFor(room).end===room;
const MONSTER_STYLES = ['hop','jab','pounce','charge','arrow','venom','slam','wisp'];
const MONSTER_STATUSES = [null,'paralyze','burn','drag','blind','poison','freeze','slow'];
for (const chapter of CHAPTERS) {
  const chapterIndex=CHAPTERS.indexOf(chapter);
  chapter.types=chapter.creatures.map((name,index)=>{
    const base=MONSTERS[(index+chapterIndex*2)%10];
    return MONSTERS.push({...base,name,style:MONSTER_STYLES[index],status:MONSTER_STATUSES[index],
      kind:index===4?'ranged':index===5||index===7?'magic':'physical',
      speed:base.speed*1.35,motion:index===3||index===6?'heavy':index===0||index===2?'stride':'sway',
      baseSprite:(index+chapterIndex*2)%10,chapterIndex,variant:index,
      dashChance:index===2||index===4 ? .68 : base.dashChance||0,
      pushChance:index===3||index===6 ? .55 : base.pushChance||0,
      drag:index===3})-1;
  });
  chapter.bossType=MONSTERS.push({...MONSTERS[9],name:chapter.miniboss,size:115,
    speed:.17,style:'charge',status:['poison','freeze','slow','blind','paralyze','burn'][chapterIndex],
    baseSprite:[5,0,3,7,9,8][chapterIndex],chapterIndex,variant:8,pushChance:.72,dashChance:.5})-1;
}
const DRAGON_TYPE=MONSTERS.push({name:'Dragão Vermelho',kind:'magic',style:'flare',tell:'SOPRO INFERNAL',size:270,
  element:'fire',weakness:'water',motion:'heavy',windup:1050,cooldown:1900,range:530,speed:.19,
  pushChance:.8,dashChance:.25,status:'burn',baseSprite:9,chapterIndex:5,variant:9})-1;
const ROOM_PRESSURE = [.78,.86,.94,1,1.04,1.09,1.15,1.22,1.29,1.36];
const state = {
  profileId:null,name:'',className:null,advantage:'water',weakness:'fire',
  room:0,highest:0,mode:'idle',repeat:false,repeatEntry:false,heldLeft:false,manual:false,manualLeft:false,manualRight:false,manualAttack:false,x:460,ground:390,facing:1,heroPhase:0,heroMoving:false,
  hp:100,maxHp:100,mana:100,maxMana:100,xp:0,level:1,gold:0,diamonds:0,
  basePhysical:4,baseMagical:4,physicalDefense:0,magicalDefense:0,
  physicalSkill:0,magicalSkill:0,skillPoints:0,defensePoints:0,
  enemies:[],shots:[],effects:[],particles:[],drops:[],waves:[],roomHistory:[],roomStartedAt:0,
  roomDamage:0,roomGold:0,roomDiamonds:0,roomKills:0,roomOutcomeRecorded:false,
  shakeUntil:0,shakePower:0,poisonUntil:0,nextPoisonAt:0,statuses:{},
  lastPlayerHit:0,lastMonsterHit:0,
  lastMonsterPhysical:0,lastMonsterMagical:0,hitAt:-1e9,hurtAt:-1e9,pendingAttack:null,attackDirection:1,
  activeSkill:null,skillVisuals:[],skillReadyAt:{},roomSignUntil:0,victoryUntil:0
};
const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
const fmt = value => Math.round(value).toLocaleString('pt-BR');
const meta = createMeta(state,{updateUI,label,onProfileSelected,onProfileLeft,portalToRoom,castSkill});
let heroAttackAt = 0, last = performance.now(), nextRoomAt = 0;
function label(message) { $('message').textContent = message; }
function showRoomSign(room) {
  const chapter=room<=200?chapterFor(room):null;
  $('room-chapter').textContent=room===201?'PORTÃO OESTE':chapter?.title||'JORNADA';
  $('room-display').textContent=room===201?'DRAGÃO VERMELHO':'SALA '+String(room).padStart(2,'0');
  $('room-subtitle').textContent=room===201?'Confronto especial':isMinibossRoom(room)?'Encontro de miniboss':
    chapter?.scenes[Math.floor((room-chapter.start)/5)%2]||'Caçada';
  state.roomSignUntil=performance.now()+2600;
  $('room-sign').hidden=false;
}
function showVictory() {
  $('victory-title').textContent=state.room===201?'O Dragão Vermelho caiu':
    isMinibossRoom(state.room)?'Miniboss derrotado':'Sala '+state.room+' concluída';
  $('victory-reward').textContent='+'+fmt(state.roomGold)+' gold'+(state.roomDiamonds?'  ·  +'+state.roomDiamonds+' diamante':'');
  state.victoryUntil=performance.now()+2200;
  $('victory-banner').hidden=false;
}
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
  state.poisonUntil=0;state.statuses={};state.manual=false;state.heldLeft=false;state.facing=1;
  state.skillReadyAt={};state.activeSkill=null;state.skillVisuals=[];
  enterRoom(0);
  label('Bem-vindo, '+state.name+'. Prepare-se na cidade ou pressione RUN RIGHT.');
}
function onProfileLeft() {
  $('game').parentElement.classList.remove('cinema');$('hide-ui').setAttribute('aria-pressed','false');
  $('hide-ui').textContent='◉ OCULTAR PAINÉIS';
  $('room-sign').hidden=true;$('victory-banner').hidden=true;
  state.room=0;state.mode='idle';state.enemies=[];state.shots=[];state.effects=[];state.particles=[];state.drops=[];state.x=460;state.heroMoving=false;state.pendingAttack=null;
  state.roomHistory=[];state.waves=[];state.poisonUntil=0;state.activeSkill=null;state.skillVisuals=[];
  label('Escolha um personagem para entrar na jornada.');
  updateUI();
}
function portalToRoom(target) {
  if (!state.profileId||state.room!==0) return;
  const requested=Number(target);
  if (!Number.isInteger(requested)||requested<1||requested>200) return;
  const entry=Math.floor((requested-1)/10)*10+1;
  enterRoom(entry);
  label('Portal da Hunt: sala '+entry+'. Vença as salas seguintes para chegar à '+requested+'.');
}
function countForRoom(room) {return room%10===0?1:1+Math.floor(((room-1)%10)/2);}
function enemyType(room,index) {
  const chapter=chapterFor(room),step=((room-1)%10)+1;
  if (step<=3) return chapter.types[(step+index-1)%3];
  return chapter.types[(step+index*2)%8];
}
function makeEnemies(room) {
  const dragon=room===201,step=((room-1)%10)+1,decade=Math.floor((room-1)/10),weak=step<=3,boss=dragon||isMinibossRoom(room);
  return Array.from({length:boss?1:countForRoom(room)},(_,index)=>{
    const type=dragon?DRAGON_TYPE:boss?chapterFor(room).bossType:enemyType(room,index);
    const species=MONSTERS[type];
    const possessed=!boss&&Math.random()<.14;
    const strength=possessed?2:1;
    const pressure=ROOM_PRESSURE[step-1];
    const hp=dragon?38000:Math.round((18+decade*17+step*6)*(weak ? .7 : 1)*(boss ? 4.2 : 1)*pressure*strength);
    const combatScale=.58+Math.max(0,room-20)/80*.42;
    const power=dragon?460:(2+decade*1.8+step*.65)*(weak ? .75 : 1)*(boss ? 2.2 : 1)*pressure*combatScale*strength;
    const physicalAttack=Math.max(1,Math.round(power*(species.kind==='physical'||species.kind==='ranged' ? .75 : .28)));
    const magicalAttack=Math.max(1,Math.round(power*(species.kind==='magic' ? .75 : .22)));
    return {id:index,type,kind:species.kind,name:(possessed?'Possuído · ':'')+species.name,
      element:species.element,weakness:species.weakness,boss,possessed,
      x:dragon?760:600+index*56,y:state.ground,hp,maxHp:hp,physicalAttack,magicalAttack,statuses:{},
      attackAt:-1e9,hurtAt:-1e9,diedAt:0,phase:index*1.8,moving:false,facing:-1,dashUntil:0,
      telegraphAt:0,telegraphUntil:0,recoverUntil:performance.now()+index*580};
  });
}
function enterRoom(room,fromRight=false,repeatEntry=false) {
  state.room=clamp(room,0,201);
  state.repeatEntry=repeatEntry;
  state.heroMoving=false;
  state.shots=[];state.effects=[];state.particles=[];state.drops=[];state.waves=[];
  state.pendingAttack=null;state.hitAt=-1e9;state.activeSkill=null;state.skillVisuals=[];state.roomStartedAt=performance.now();
  state.roomDamage=0;state.roomGold=0;state.roomDiamonds=0;state.roomKills=0;state.roomOutcomeRecorded=false;
  $('victory-banner').hidden=true;
  meta.closeWindow();
  if (!state.room) {
    $('room-sign').hidden=true;state.roomSignUntil=0;
    state.x=460;state.enemies=[];state.mode='idle';state.facing=1;state.heldLeft=false;state.poisonUntil=0;state.statuses={};
    label('Na Vila do Amanhecer. Prepare equipamentos e distribua pontos.');
  } else {
    showRoomSign(state.room);
    if (state.room<=200) state.highest=Math.max(state.highest,state.room);
    state.enemies=makeEnemies(state.room);
    state.x=fromRight?830:295;
    state.facing=fromRight?-1:1;
    if (fromRight||state.room===201) {
      state.enemies.forEach((enemy,index)=>{enemy.x=state.room===201?225:160+index*62;enemy.facing=1;});
      state.mode=state.manual?'manual':'return-fight';
      label(state.room===201?'O Dragão Vermelho de nível 101 guarda o portão oeste!':
        'Sala '+state.room+': derrote as criaturas para continuar voltando.');
    } else {
      state.mode=state.manual?'manual':'forward';
      label(state.room===201?'O Dragão Vermelho de nível 101 protege a saída oeste da cidade!':
        'Sala '+state.room+': '+state.enemies.length+' criatura(s) à frente.');
    }
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
function impact(x,y,color,power=1) {
  const now=performance.now();
  state.waves.push({x,y,radius:4,maxRadius:20+power*18,start:now,life:250+power*70,color});
  state.shakeUntil=Math.max(state.shakeUntil,now+70+power*45);
  state.shakePower=Math.max(state.shakePower,power*2.4);
}
function burst(x,y,color,count=8) {
  for (let i=0;i<count;i++) {
    const angle=(i/count)*Math.PI*2+Math.random()*.3, speed=.07+Math.random()*.14;
    state.particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-.07,
      size:1.5+Math.random()*2.5,life:350+Math.random()*250,maxLife:600,color});
  }
}
function heroBox() {return {x:state.x-18,y:state.ground-96,w:36,h:96};}
function enemyCrop(enemy) {
  const species=MONSTERS[enemy.type];
  const family=['rats','frogs','wolves','vampires','mummies','draconians'][species.chapterIndex];
  if(enemy.type===DRAGON_TYPE) return window.CREATURE_BOUNDS.dragon[0];
  if(species.variant===8) return window.CREATURE_BOUNDS.bosses[species.chapterIndex];
  return family?window.CREATURE_BOUNDS[family][species.variant]:MONSTER_CROPS[species.baseSprite??enemy.type];
}
function enemyVisual(enemy) {
  const species=MONSTERS[enemy.type],crop=enemyCrop(enemy);
  const family=['rats','frogs','wolves','vampires','mummies','draconians'][species.chapterIndex];
  const sheet=enemy.type===DRAGON_TYPE?'dragon':species.variant===8?'bosses':family;
  const cell=enemy.type===DRAGON_TYPE?0:species.variant===8?species.chapterIndex:species.variant;
  const height=enemy.type===DRAGON_TYPE?265:enemy.boss?186:
    Math.max(118,Math.min(150,species.size*1.65));
  const width=height*(crop[2]-crop[0])/(crop[3]-crop[1]);
  const foot=sheet?window.CREATURE_FEET[sheet][cell]:crop[3];
  const footOffset=sheet==='frogs'?0:Math.max(0,crop[3]-foot)*height/(crop[3]-crop[1]);
  return {width,height,crop,footOffset,half:Math.min(enemy.boss?100:82,Math.max(35,width*.36))};
}
function enemyBox(enemy) {
  const visual=enemyVisual(enemy);
  return {x:enemy.x-visual.half,y:enemy.y-visual.height,w:visual.half*2,h:visual.height};
}
function overlap(a,b) {return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function orbHits(x,y,r,box) {return x+r>box.x&&x-r<box.x+box.w&&y+r>box.y&&y-r<box.y+box.h;}
function moveHero(delta) {
  let next=clamp(state.x+delta,20,940);
  if(!delta) return;
  for(const enemy of state.enemies) {
    if(enemy.hp<=0) continue;
    const box=enemyBox(enemy);
    if(box.y>=state.ground||box.y+box.h<=state.ground-96) continue;
    const gap=18+(box.w/2);
    if(delta>0&&enemy.x>=state.x&&next>enemy.x-gap) next=Math.min(next,enemy.x-gap);
    if(delta<0&&enemy.x<=state.x&&next<enemy.x+gap) next=Math.max(next,enemy.x+gap);
  }
  state.x=clamp(next,20,940);
}
function moveEnemy(enemy,delta) {
  const gap=18+enemyVisual(enemy).half;
  let next=clamp(enemy.x+delta,80,880);
  if(enemy.x>=state.x&&next<state.x+gap) next=state.x+gap;
  if(enemy.x<state.x&&next>state.x-gap) next=state.x-gap;
  enemy.x=clamp(next,80,880);
}
function nearest() {return state.enemies.filter(enemy=>enemy.hp>0).sort((a,b)=>Math.abs(a.x-state.x)-Math.abs(b.x-state.x))[0];}
const STATUS_INFO={poison:['VENENO','#a7da83'],burn:['CHAMAS','#ff9a61'],paralyze:['PARALISIA','#f5dc8a'],freeze:['GELO','#a4dcf5'],blind:['CEGUEIRA','#b5a5d5'],slow:['LENTIDÃO','#a3bfd9'],drag:['ARRASTADO','#d8af91']};
function addStatus(target,kind,duration=3000) {
  if (!kind||!STATUS_INFO[kind]||target.hp===0) return;
  if(target.statuses?.[kind]?.until>performance.now()) {
    target.statuses[kind].until=performance.now()+duration;return;
  }
  target.statuses??={};target.statuses[kind]={until:performance.now()+duration,tickAt:performance.now()+750};
  floatText(target.x??state.x,(target.y??state.ground)-125,STATUS_INFO[kind][0],STATUS_INFO[kind][1]);
}
function tickStatuses(target,t) {
  for (const [kind,status] of Object.entries(target.statuses||{})) {
    if (t>=status.until) {delete target.statuses[kind];continue;}
    if ((kind==='poison'||kind==='burn')&&t>=status.tickAt) {
      status.tickAt=t+850;
      if (target===state) hurtHero(0,kind==='burn'?3:2,kind==='burn'?'fire':'earth');
      else if(target.hp>0) hurtEnemy(target,{physical:0,magical:Math.max(2,Math.round(target.maxHp*.012))},kind==='burn'?'fire':'earth',false);
    }
  }
}
function hasStatus(target,kind,t=performance.now()) {return !!target.statuses?.[kind]&&target.statuses[kind].until>t;}
function recordRoomResult(result) {
  if (!state.room||state.roomOutcomeRecorded) return;
  state.roomOutcomeRecorded=true;
  state.roomHistory.unshift({room:state.room,result,
    seconds:Math.max(1,Math.round((performance.now()-state.roomStartedAt)/1000)),
    damage:state.roomDamage,gold:state.roomGold,kills:state.roomKills});
  state.roomHistory.length=Math.min(10,state.roomHistory.length);
}
function hurtEnemy(enemy,damage,attackElement,proc=true) {
  if (enemy.hp<=0) return;
  const height=enemyVisual(enemy).height;
  const advantage=state.advantage===enemy.weakness||attackElement===enemy.weakness;
  const multiplier=advantage?1.1:1;
  const raw=(damage.physical||0)+(damage.magical||0);
  const dealt=Math.min(enemy.hp,Math.max(1,Math.round(raw*multiplier)));
  enemy.hp-=dealt;enemy.hurtAt=performance.now();state.lastPlayerHit=dealt;
  const side=enemy.x>=state.x?1:-1;
  const textX=clamp(enemy.x+side*48,55,905);
  floatText(textX,enemy.y-height*.58,
    '-'+fmt(dealt)+(advantage?' ✦':''),'#fff0c4');
  burst(enemy.x-12,enemy.y-height*.55,elementColor(attackElement),advantage?12:7);
  impact(enemy.x,enemy.y-height*.56,elementColor(attackElement),advantage?1.15:.8);
  meta.soundFx('hit');
  if (proc&&enemy.hp>0&&Math.random()<.22) {
    const effect={fire:'burn',water:'freeze',earth:'poison',air:'paralyze'}[attackElement];
    addStatus(enemy,effect,1900);
  }
  if(proc&&enemy.hp>0&&damage.magical>0&&Math.random()<.1) addStatus(enemy,'blind',1700);
  if(proc&&enemy.hp>0&&damage.physical>0&&Math.random()<.1) addStatus(enemy,'slow',1700);
  if (enemy.hp<=0) {
    enemy.diedAt=enemy.hurtAt;
    state.roomKills++;
    const decade=Math.floor((state.room-1)/10);
    const gold=(1+Math.floor(decade/4)+Math.floor(Math.random()*3)+(enemy.boss?8:0))*(enemy.possessed?2:1);
    state.gold+=gold;
    state.roomGold+=gold;
    if(enemy.boss) {state.diamonds++;state.roomDiamonds++;floatText(textX,enemy.y-height-25,'+1 DIAMANTE','#a7e5f3');
      state.drops.push({kind:'diamond',x:enemy.x,y:enemy.y-85,vx:0,vy:-.24,age:0});}
    for (let i=0;i<Math.min(5,2+Math.floor(gold/12));i++)
      state.drops.push({x:enemy.x,y:enemy.y-40,vx:(i-2)*.045,vy:-.18-Math.random()*.07,age:0});
    floatText(textX,enemy.y-height*.98,'+'+gold+' GOLD','#f6d58d');
    addXp((7+decade+(enemy.boss?12:0))*(enemy.possessed?2:1));
    if (state.enemies.every(value=>value.hp<=0)) {
      recordRoomResult('Vitória');
      showVictory();
      meta.soundFx('win');
      const returning=state.mode==='return-fight';
      state.mode=state.room===201?'dragon-victory':state.manual?'manual-clear':state.repeatEntry?'repeat-back':returning?(state.heldLeft?'return-travel':'paused-back'):
        (state.repeat||state.room===200?'repeat-back':'advance');
      nextRoomAt=performance.now()+(state.room===201?2100:1550);
      label(state.room===201?'O Dragão Vermelho foi vencido! Voltando à cidade.':returning?'Sala limpa. Voltando automaticamente.':
        state.room===200?'Sala 200 vencida! Voltando para a sala 199.':state.repeat?
        'Vitória! O herói volta para repetir a sala.':'Vitória! Seguindo em frente.');
    }
  }
  updateUI();meta.save();
}
function pushHero(source) {
  const sourceX=source.sourceX??source.x;
  const direction=sourceX>=state.x?-1:1;
  state.pendingAttack=null;state.hitAt=-1e9;
  moveHero(direction*(source.boss?88:68));
  floatText(state.x,245,'EMPURRADO','#d3a5f4');
  if (state.x<=45||state.x>=925) {
    const previous=state.room===201?0:Math.max(0,state.room-1);
    recordRoomResult('Empurrado');
    enterRoom(previous,true);
    label(previous?'Empurrado para a sala '+previous+'! Derrote as criaturas para voltar.':
      'O golpe lançou você de volta à cidade.');
    return true;
  }
  return false;
}
function hurtHero(physical,magical,element,source=null) {
  if (state.mode==='recover') return;
  const multiplier=elementBonus(element,state.weakness);
  const physicalHit=Math.max(0,Math.round(physical*multiplier)-defenseValue('physical'));
  const magicalHit=Math.max(0,Math.round(magical*multiplier)-defenseValue('magical'));
  const dealt=physicalHit+magicalHit;
  state.lastMonsterHit=dealt;state.lastMonsterPhysical=physicalHit;
  state.lastMonsterMagical=magicalHit;state.hurtAt=performance.now();
  if (dealt>0) {
    state.hp=Math.max(0,state.hp-dealt);
    state.roomDamage+=dealt;
    floatText(state.x,250,'-'+fmt(dealt),elementColor(element));
    burst(state.x,state.ground-70,elementColor(element),8);
    impact(state.x,state.ground-65,elementColor(element),1);
    meta.soundFx('hurt');
  } else floatText(state.x,250,'BLOQUEADO','#cde7d8');
  if (state.hp===0) {
    recordRoomResult('Derrota');
    state.mode='recover';state.heroMoving=false;state.shots=[];state.pendingAttack=null;state.activeSkill=null;
    state.poisonUntil=0;state.nextPoisonAt=0;state.statuses={};
    label('Você caiu. Voltando à sala 1...');
    setTimeout(()=>{
      if (state.mode!=='recover') return;
      state.hp=state.maxHp;state.mana=state.maxMana;
      enterRoom(1);
    },1200);
  } else if (dealt>0&&source?.pushChance&&Math.random()<source.pushChance) {
    if (pushHero(source)) return;
  }
  if (dealt>0&&source?.status&&Math.random()<.38) addStatus(state,source.status);
  updateUI();meta.save();
}
function heroUsesRange() {
  const weapon=meta.weapon();
  return weapon?weapon.type==='magical'&&state.mana>=3:state.className==='mage'&&state.mana>=3;
}
function heroReach(target) {return heroUsesRange()?195:Math.max(70,enemyVisual(target).half+25);}
function playerAttack(now) {
  const target=nearest();
  if (!target) return;
  state.activeSkill=null;
  state.hitAt=now;
  state.attackDirection=target.x>=state.x?1:-1;
  state.pendingAttack={range:heroUsesRange(),direction:state.attackDirection,impactAt:now+330};
}
function castSkill(id,automatic=false) {
  const skill=skillFor(state.className,id),target=nearest(),now=performance.now();
  if(!skill||!state.profileId||!state.room||state.mode==='recover'||!target) return false;
  if(state.pendingAttack||now-heroAttackAt<460) return false;
  if(hasStatus(state,'freeze',now)||hasStatus(state,'paralyze',now)) return false;
  if((state.skillReadyAt[id]||0)>now) {if(!automatic)label(skill.name+' ainda está recarregando.');return false;}
  if(state.mana<skill.mana) {if(!automatic)label('Mana insuficiente para '+skill.name+'.');return false;}
  if(Math.abs(target.x-state.x)>skill.range) {if(!automatic)label('Aproxime-se para usar '+skill.name+'.');return false;}
  state.mana-=skill.mana;state.skillReadyAt[id]=now+skill.cooldown;
  heroAttackAt=now;state.hitAt=now;state.attackDirection=target.x>=state.x?1:-1;
  state.activeSkill={id,at:now,targetId:target.id,castX:state.x,targetX:target.x};
  state.pendingAttack={range:false,direction:state.attackDirection,impactAt:now+410,skillId:id,targetId:target.id};
  floatText(state.x,state.ground-145,skill.name.toUpperCase(),skill.color);
  burst(state.x,state.ground-60,skill.color,13);
  label(skill.name+'! +'+skill.bonus+' de dano fixo ao ataque normal.');
  meta.soundFx('skill');updateUI();meta.save();
  return true;
}
function resolvePlayerAttack() {
  const attack=state.pendingAttack;
  state.pendingAttack=null;
  if (!attack||state.mode==='recover'||!nearest()) return;
  if(attack.skillId) {
    const skill=skillFor(state.className,attack.skillId);
    const target=state.enemies.find(enemy=>enemy.id===attack.targetId&&enemy.hp>0);
    if(!skill||!target||Math.abs(target.x-state.x)>skill.range+25) return;
    const damage=weaponDamage(),kind=state.className==='mage'?'magical':'physical';
    damage[kind]+=skill.bonus;
    const element=meta.weapon()?.element||state.advantage;
    const visual={kind:skill.kind,x:state.x,y:state.ground-67,targetX:target.x,targetY:target.y-enemyVisual(target).height*.55,
      direction:attack.direction,color:skill.color,at:performance.now(),life:620};
    if(state.className==='mage') {
      state.shots.push({owner:'hero',kind:'skill-'+skill.kind,x:state.x+attack.direction*28,y:state.ground-73,
        vx:attack.direction*(skill.kind==='beam'?1.5:.9),vy:0,r:skill.kind==='eclipse'?19:skill.kind==='beam'?8:13,
        physical:damage.physical,magical:damage.magical,element,life:1100,color:skill.color,
        skillStatus:skill.status,skillTarget:target.id,skillVisual:visual});
    } else {
      state.skillVisuals.push(visual);
      hurtEnemy(target,damage,element);
      if(target.hp>0&&skill.status) addStatus(target,skill.status,2100);
    }
    return;
  }
  if(hasStatus(state,'blind')&&Math.random()<.45) {
    floatText(state.x,state.ground-130,'ERROU','#d8c7e6');return;
  }
  const weapon=meta.weapon(),damage=weaponDamage(),element=weapon?.element||state.advantage;
  if (attack.range) {
    state.mana-=3;
    state.shots.push({owner:'hero',kind:'hero-magic',x:state.x+attack.direction*28,y:state.ground-60,
      vx:attack.direction*.72,vy:0,r:10,
      physical:damage.physical,magical:damage.magical,element,life:1700,color:elementColor(element)});
  } else {
    const reach={x:attack.direction===1?state.x+7:state.x-109,y:state.ground-106,w:102,h:106};
    const melee=weapon?.type==='magical'
      ? {physical:state.basePhysical+state.physicalSkill+(weapon.physical||0),magical:0}
      : damage.physical+damage.magical>0?damage:{physical:state.basePhysical+state.physicalSkill,magical:0};
    const target=state.enemies.filter(enemy=>enemy.hp>0&&
      (enemy.x-state.x)*attack.direction>=-12&&overlap(reach,enemyBox(enemy)))
      .sort((a,b)=>Math.abs(a.x-state.x)-Math.abs(b.x-state.x))[0];
    if (target) hurtEnemy(target,melee,element);
  }
}
function enemyAttack(enemy,now) {
  enemy.attackAt=now;
  const species=MONSTERS[enemy.type];
  const pushChance=Math.max(species.pushChance||0,enemy.boss ? .5 : 0);
  const direction=enemy.facing;
  if (Math.random()<(species.dashChance||0)) {
    enemy.dashUntil=now+420;
    enemy.dashDirection=-direction;
  }
  if (enemy.kind==='physical') {
    if (species.lunge) moveEnemy(enemy,direction*species.lunge);
    const span=species.style==='slam'?135:species.style==='charge'?112:91;
    const reach={x:direction===-1?enemy.x-span:enemy.x,y:state.ground-100,w:span,h:100};
    if (species.style==='slam') state.waves.push({x:enemy.x,y:state.ground,radius:12,maxRadius:120,
      start:now,life:500,color:'#c3d59a'});
    if (species.style==='charge') state.waves.push({x:enemy.x,y:state.ground-45,radius:12,maxRadius:70,
      start:now,life:300,color:'#f2aa83'});
    if (overlap(reach,heroBox())) hurtHero(enemy.physicalAttack,enemy.magicalAttack,enemy.element,
      {x:enemy.x,pushChance,boss:enemy.boss,status:species.status});
  } else {
    const style=species.style;
    const speed={spores:.4,arrow:.83,flare:.55,wisp:.36,venom:.5}[style]||.52;
    const count=style==='spores'?3:1;
    for (let index=0;index<count;index++) {
      const spread=index-(count-1)/2;
      state.shots.push({owner:'enemy',kind:style,x:enemy.x+direction*24,
        y:state.ground-62+spread*19,vx:direction*speed,vy:style==='spores'?spread*.045:0,
        r:style==='arrow'?5:style==='spores'?7:11,
        physical:Math.max(1,Math.round(enemy.physicalAttack*(style==='spores'?.45:1))),
        magical:Math.max(1,Math.round(enemy.magicalAttack*(style==='spores'?.45:1))),
        element:enemy.element,sourceX:enemy.x,pushChance,boss:enemy.boss,status:species.status,
        homing:style==='wisp',poison:style==='venom',life:2300,color:elementColor(enemy.element)});
    }
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
  $('hide-ui').hidden=!logged;
  $('return-city').hidden=!logged||room===0;
  $('return-city').disabled=state.mode==='recover';
  const chapter=room&&room<=200?chapterFor(room):null;
  const sceneIndex=chapter?Math.floor((room-chapter.start)/5)%2:0;
  $('area').textContent=room===201?'PORTÃO OESTE · DRAGÃO VERMELHO':room?
    chapter.title+' · '+(isMinibossRoom(room)?chapter.boss:chapter.scenes[sceneIndex]):'VILA DO AMANHECER';
  $('room').textContent=room===201?'BOSS · NÍVEL 101':room?(isMinibossRoom(room)?'MINIBOSS · ':'')+'SALA '+String(room).padStart(2,'0')+' / 200':'CIDADE';
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
  $('diamonds').textContent=fmt(state.diamonds);
  $('depth').textContent=state.highest;
  $('hero-hit').textContent=fmt(state.lastPlayerHit);
  $('monster-hit').textContent=fmt(state.lastMonsterPhysical)+'/'+fmt(state.lastMonsterMagical);
  $('skill-points-badge').textContent=state.skillPoints?String(state.skillPoints):'';
  $('defense-points-badge').textContent=state.defensePoints?String(state.defensePoints):'';
  $('repeat').setAttribute('aria-pressed',String(state.repeat));
  $('repeat-state').textContent=state.repeat?'ON':'OFF';
  $('run').disabled=state.mode==='recover';
  $('left').setAttribute('aria-pressed',String(state.heldLeft));
  $('mode-toggle').setAttribute('aria-pressed',String(state.manual));
  $('mode-toggle').textContent=state.manual?'MODO MANUAL':'MODO AUTO';
  $('manual-controls').hidden=!state.manual;
}
function drawBackground(t) {
  const chapter=chapterFor(Math.min(200,Math.max(1,state.room)));
  const isBoss=isMinibossRoom(state.room);
  const variant=Math.floor((state.room-chapter.start)/5)%2;
  const key=state.room===201?'peaks':state.room?chapter.backgrounds[isBoss?2:variant]:'city';
  const img=ensureImage(key);
  if (img.complete&&img.naturalWidth) {
    const height=Math.min(img.naturalHeight,img.naturalWidth/2);
    const scale=BACKGROUND_FLOOR[key]?(state.ground/480)/BACKGROUND_FLOOR[key]:1;
    const drawWidth=960*scale,drawHeight=480*scale;
    g.drawImage(img,0,(img.naturalHeight-height)/2,img.naturalWidth,height,
      (960-drawWidth)/2,0,drawWidth,drawHeight);
  } else {
    g.fillStyle=state.room?'#546b68':'#aeaa8f';g.fillRect(0,0,960,480);
  }
  if (state.room) {
    g.fillStyle=state.room===201?'#b3302e55':chapter.tint+'2c';g.fillRect(0,0,960,480);
    // Chapter silhouettes add a separate storybook foreground to each painted scene.
    g.save();g.globalAlpha=.27;g.fillStyle=chapter.tint;
    for(let i=0;i<5;i++) {
      const x=70+i*210+(variant?63:0),base=386;
      g.beginPath();g.moveTo(x-42,base);g.quadraticCurveTo(x-25,base-34-(i%2)*17,x,base-25);
      g.quadraticCurveTo(x+34,base-53,x+49,base);g.fill();
      if (chapter.start===31||chapter.start===136) {g.beginPath();g.ellipse(x,base-37,18,8,0,0,Math.PI*2);g.fill();}
      if (chapter.start===101||chapter.start===171) {g.fillRect(x-4,base-96,8,75);g.fillRect(x-17,base-76,34,7);}
    }
    g.restore();
    if (isBoss||state.room===201) {
      const glow=g.createRadialGradient(480,192,20,480,192,360);
      glow.addColorStop(0,state.room===201?'#ff9d6450':chapter.tint+'66');glow.addColorStop(1,'#1e213100');
      g.fillStyle=glow;g.fillRect(0,0,960,480);
      g.fillStyle='#efe3c8dd';g.font='bold 15px Georgia';g.textAlign='center';
      g.fillText(state.room===201?'O DRAGÃO DO PORTÃO OESTE':chapter.boss,480,113);g.textAlign='left';
    }
    for (let i=0;i<13;i++) {
      const x=(i*181)%940,y=148+(i*69)%210;
      g.globalAlpha=.2+.12*Math.sin(t/570+i);
      g.fillStyle=chapter.start===31?'#c9bcff':'#fff0c4';
      g.fillRect(x+Math.sin(t/800+i)*5,y,3,3);
    }
    g.globalAlpha=1;
  }
}
function drawShadow(x,ground,width,alpha) {
  g.fillStyle='rgba(18,31,40,'+alpha+')';
  g.beginPath();g.ellipse(x,ground+2,width*.32,5,0,0,Math.PI*2);g.fill();
}
function drawWholeSprite(image,cell,crop,x,ground,width,height,phase,moving,facing,hurt,motion,attackPulse,spriteFacesLeft=false,shadowGround=ground,windup=0,footOffset=0,mask=null) {
  const air=motion==='fly';
  drawShadow(x,shadowGround,width,air ? .27 : .38);
  const step=Math.sin(phase),breath=Math.sin(phase*.27);
  let sx=1,sy=1,rotation=0,offsetY=0;
  if (air) {
    offsetY=-11+Math.sin(phase*.8)*4;
    sx=1+Math.sin(phase*2.3)*.045;
    sy=1-Math.sin(phase*2.3)*.025;
    rotation=Math.sin(phase*.65)*.045;
  } else if (motion==='squish') {
    sx=1+Math.abs(step)*.075;sy=1-Math.abs(step)*.085;
    rotation=moving?step*.055:Math.sin(phase*.35)*.018;
  } else if (motion==='heavy') {
    sx=1+Math.abs(step)*.045;sy=1-Math.abs(step)*.05;
    rotation=(moving?step*.06:breath*.008);
  } else {
    sx=1+Math.abs(step)*.065;sy=1-Math.abs(step)*.075;
    rotation=(moving?step*.075:breath*.01);
  }
  if (windup) {rotation-=windup*.09;sx*=1+windup*.04;sy*=1-windup*.07;}
  if (attackPulse) {rotation+=attackPulse*.19;sx*=1+attackPulse*.12;sy*=1-attackPulse*.06;offsetY-=attackPulse*4;}
  g.save();
  g.translate(x+facing*attackPulse*11,ground+offsetY+footOffset);
  g.scale((spriteFacesLeft?-facing:facing)*sx,sy);
  g.rotate(rotation);
  if (hurt) g.filter='brightness(1.55)';
  if(mask) {
    g.beginPath();mask.forEach(([u,v],index)=>{const px=-width/2+u*width,py=-height+v*height;
      if(index)g.lineTo(px,py);else g.moveTo(px,py);});
    g.closePath();g.clip();
  }
  g.drawImage(image,cell+crop[0],crop[1],crop[2]-crop[0],crop[3]-crop[1],
    -width/2,-height,width,height);
  g.restore();
  if (moving&&!air) {
    const dustAlpha=.10+Math.abs(step)*.11;
    g.fillStyle='rgba(237,220,182,'+dustAlpha+')';
    g.beginPath();g.ellipse(x-facing*width*.23,ground-1,3+Math.abs(step)*4,2,0,0,Math.PI*2);g.fill();
    g.beginPath();g.ellipse(x+facing*width*.13,ground-1,2+Math.abs(step)*2,1.4,0,0,Math.PI*2);g.fill();
  }
}
function drawHero(t) {
  if (!state.profileId) return;
  const mage=state.className==='mage';
  const attackElapsed=t-state.hitAt;
  const attacking=state.room>0&&attackElapsed>=0&&attackElapsed<680&&state.mode!=='recover';
  const image=images[mage?(attacking?'mageAttack':'mageWalk'):(attacking?'warriorAttack':'warriorWalk')];
  const moving=state.heroMoving;
  const target=nearest();
  const facing=attacking?state.attackDirection:
    ['fight','return-fight'].includes(state.mode)&&target?(target.x>=state.x?1:-1):
    state.facing;
  const attackPulse=attacking?Math.sin(attackElapsed/680*Math.PI):0;
  const skillPose=attacking&&state.activeSkill&&attackElapsed<680?
    skillFor(state.className,state.activeSkill.id):null;
  if (image.complete&&image.naturalWidth) {
    const beat=attackElapsed<170?0:attackElapsed<330?1:attackElapsed<450?2:3;
    const poseOrders={lunge:[0,2,2,3],rune:[1,1,2,3],quake:[0,1,2,3],star:[1,1,2,2],
      orb:[0,1,2,3],flower:[1,1,2,3],roots:[0,1,1,2],beam:[0,1,2,2],eclipse:[1,1,2,3]};
    const frame=attacking?(skillPose?poseOrders[skillPose.kind]?.[beat]??beat:beat)
      :(moving?Math.floor(state.heroPhase/(Math.PI/2))%4:1);
    const cell=image.naturalWidth/4;
    const bounds=attacking?(mage?[0,543,1020,1640,2172]:[0,543,1040,1680,2172]):null;
    const sourceX=bounds?bounds[frame]:frame*cell;
    const sourceWidth=bounds?bounds[frame+1]-sourceX:cell;
    drawShadow(state.x,state.ground,78,.4);
    g.save();
    const poseX=attacking?[-5,-2,11,2][frame]+(skillPose?.kind==='lunge'||skillPose?.kind==='star'?attackPulse*13:0):0;
    const poseY=attacking?[1,-3,-1,0][frame]-(skillPose?.kind==='quake'||skillPose?.kind==='roots'?attackPulse*7:0)-
      (skillPose?.kind==='eclipse'||skillPose?.kind==='flower'?attackPulse*5:0):moving?Math.sin(state.heroPhase)*1.5:0;
    g.translate(state.x+facing*poseX,state.ground+poseY);
    g.scale(facing,1);
    if (attacking) g.rotate([-.018,-.035,.04,.008][frame]+(skillPose?.kind==='rune'?-attackPulse*.15:
      skillPose?.kind==='quake'?attackPulse*.12:skillPose?.kind==='eclipse'?-attackPulse*.12:
      skillPose?.kind==='beam'?attackPulse*.08:skillPose?.kind==='flower'?-attackPulse*.06:0));
    if (state.mode==='recover') g.rotate(-.6);
    if (t-state.hurtAt<150) g.filter='brightness(1.55)';
    const drawWidth=attacking?96:78,drawHeight=attacking?116:94;
    g.drawImage(image,sourceX,42,sourceWidth,650,-drawWidth/2,-drawHeight,drawWidth,drawHeight);
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
  if (state.poisonUntil>t&&state.room>0) {
    g.save();g.fillStyle='#a9d887';g.shadowColor='#a5e172';g.shadowBlur=8;
    for (let index=0;index<3;index++) {
      const x=state.x-19+index*18+Math.sin(t/260+index)*4;
      const y=state.ground-26-index*23+Math.sin(t/330+index)*6;
      g.globalAlpha=.35+.2*Math.sin(t/300+index);
      g.beginPath();g.arc(x,y,3+index*.5,0,Math.PI*2);g.fill();
    }
    g.restore();
  }
  if (attackPulse>0&&attackElapsed>310&&attackElapsed<460&&!skillPose) {
    g.save();
    const color=elementColor(meta.weapon()?.element||state.advantage);
    g.strokeStyle=color;g.shadowColor=color;g.shadowBlur=15;
    g.globalAlpha=.58;g.lineWidth=2+attackPulse*2;
    if (mage) {
      const cx=state.x+facing*51,cy=state.ground-75,r=14+attackPulse*11;
      g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.stroke();
      for (let index=0;index<4;index++) {
        const angle=index*Math.PI/2+t*.004;
        g.beginPath();g.moveTo(cx+Math.cos(angle)*(r+3),cy+Math.sin(angle)*(r+3));
        g.lineTo(cx+Math.cos(angle)*(r+11),cy+Math.sin(angle)*(r+11));g.stroke();
      }
    } else {
      g.beginPath();g.arc(state.x+facing*32,state.ground-76,38+attackPulse*12,
        facing===1 ? -1.13 : 2.01,facing===1 ? .92 : 4.27);g.stroke();
      g.lineWidth=1.5;
      g.beginPath();g.arc(state.x+facing*32,state.ground-76,46+attackPulse*11,
        facing===1 ? -.8 : 2.34,facing===1 ? .6 : 3.74);g.stroke();
    }
    g.restore();
  }
}
function drawSkillVisuals(t) {
  const cast=state.activeSkill;
  if(cast&&t-cast.at<680&&state.room>0) {
    const skill=skillFor(state.className,cast.id),p=clamp((t-cast.at)/680,0,1);
    if(skill) {
      g.save();g.translate(state.x,state.ground-67);g.scale(state.attackDirection,1);
      g.globalAlpha=(1-p)*.7;g.strokeStyle=skill.color;g.fillStyle=skill.color;
      g.shadowColor=skill.color;g.shadowBlur=18;g.lineWidth=2.5;
      if(state.className==='mage') {
        for(let i=0;i<3;i++) {
          const r=15+i*9+p*15;
          g.beginPath();g.arc(28,0,r,-Math.PI*.8,Math.PI*.8);g.stroke();
        }
        for(let i=0;i<5;i++) {
          const a=i*Math.PI*2/5+t*.004;
          g.beginPath();g.arc(28+Math.cos(a)*31,Math.sin(a)*31,2.5,0,Math.PI*2);g.fill();
        }
      } else {
        const radius=skill.kind==='quake'?58:skill.kind==='star'?70:45;
        g.beginPath();g.arc(28,0,radius,-1.5+p*.4,.5+p*.5);g.stroke();
        g.beginPath();g.arc(28,0,radius+7,-1.2+p*.4,.2+p*.5);g.stroke();
        if(skill.kind==='rune') {
          g.beginPath();for(let i=0;i<6;i++) {
            const a=i*Math.PI/3+t*.002;const x=18+Math.cos(a)*24,y=Math.sin(a)*24;
            if(!i)g.moveTo(x,y);else g.lineTo(x,y);
          }g.closePath();g.stroke();
        }
      }
      g.restore();
    }
  }
  for(let i=state.skillVisuals.length-1;i>=0;i--) {
    const effect=state.skillVisuals[i],p=(t-effect.at)/effect.life;
    if(p>=1){state.skillVisuals.splice(i,1);continue;}
    const x=effect.targetX,y=effect.targetY,r=18+p*65;
    g.save();g.globalAlpha=(1-p)*.85;g.strokeStyle=effect.color;g.fillStyle=effect.color;
    g.shadowColor=effect.color;g.shadowBlur=20;g.lineWidth=3.5*(1-p)+1;
    if(effect.kind==='quake'||effect.kind==='roots') {
      const floor=state.ground-2;
      for(let j=-2;j<=2;j++) {
        const px=x+j*20,growth=Math.sin(p*Math.PI)*42;
        g.beginPath();g.moveTo(px,floor);g.lineTo(px+j*3,floor-growth*(1-Math.abs(j)*.13));g.lineTo(px+7,floor-4);g.stroke();
      }
      g.beginPath();g.ellipse(x,floor,r,r*.25,0,0,Math.PI*2);g.stroke();
    } else if(effect.kind==='flower') {
      for(let j=0;j<7;j++) {const a=j*Math.PI*2/7+p*2;
        g.beginPath();g.ellipse(x+Math.cos(a)*r*.6,y+Math.sin(a)*r*.6,12*(1-p)+2,5, a,0,Math.PI*2);g.fill();}
    } else if(effect.kind==='beam'||effect.kind==='lunge') {
      g.beginPath();g.moveTo(effect.x,effect.y);g.lineTo(x,y);g.stroke();
      g.lineWidth=1.5;g.beginPath();g.moveTo(effect.x,effect.y-10);g.lineTo(x,y-10);g.stroke();
    } else if(effect.kind==='eclipse') {
      g.beginPath();g.arc(x,y,r*.75,-Math.PI*.7,Math.PI*.7);g.stroke();
      g.beginPath();g.arc(x+9,y-8,r*.42,0,Math.PI*2);g.stroke();
    } else if(effect.kind==='rune') {
      for(let j=0;j<6;j++) {const a=j*Math.PI/3+p;
        g.beginPath();g.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);
        g.lineTo(x+Math.cos(a+1)*r,y+Math.sin(a+1)*r);g.stroke();}
    } else if(effect.kind==='star') {
      g.beginPath();for(let j=0;j<10;j++){const a=-Math.PI/2+j*Math.PI/5,rr=j%2?r*.4:r;
        if(!j)g.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);
        else g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}
      g.closePath();g.stroke();
    } else {
      g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.stroke();
      g.beginPath();g.arc(x,y,r*.48,0,Math.PI*2);g.stroke();
    }
    g.restore();
  }
}
function drawEnemy(enemy,t,highlighted) {
  const sprite=MONSTERS[enemy.type].baseSprite??enemy.type;
  const species=MONSTERS[enemy.type],visual=enemyVisual(enemy),
    width=visual.width,height=visual.height,crop=visual.crop;
  const family=['rats','frogs','wolves','vampires','mummies','draconians'][species.chapterIndex];
  const image=enemy.type===DRAGON_TYPE?ensureImage('dragon'):
    species.variant===8?ensureImage('bosses'):family?ensureImage(family):
    sprite<5?ensureImage('monstersA'):ensureImage('monstersB');
  const elapsed=t-enemy.attackAt,attackPulse=elapsed>=0&&elapsed<360?Math.sin(elapsed/360*Math.PI):0;
  const charge=enemy.telegraphUntil>t?clamp((t-enemy.telegraphAt)/species.windup,0,1):0;
  const leap=species.style==='hop'?Math.sin(charge*Math.PI)*15+attackPulse*9:
    species.style==='pounce'?Math.sin(charge*Math.PI)*7+attackPulse*5:0;
  g.save();
  if (enemy.diedAt) g.globalAlpha=Math.max(0,1-(t-enemy.diedAt)/430);
  if (enemy.possessed&&enemy.hp>0) {
    const glow=.55+.16*Math.sin(t/180+enemy.id);
    g.save();g.globalAlpha=glow;g.strokeStyle='#cb79ff';g.shadowColor='#b145f2';g.shadowBlur=19;
    g.lineWidth=4;g.beginPath();g.ellipse(enemy.x,enemy.y-height*.53,width*.55,height*.55,0,0,Math.PI*2);g.stroke();
    g.fillStyle='#9e4ddd44';g.beginPath();g.ellipse(enemy.x,enemy.y-height*.53,width*.48,height*.48,0,0,Math.PI*2);g.fill();g.restore();
  }
  if (enemy.telegraphUntil>t&&enemy.hp>0) {
    const charge=clamp((t-enemy.telegraphAt)/species.windup,0,1);
    const color=elementColor(enemy.element);
    g.save();g.globalAlpha=.3+charge*.62;g.strokeStyle=color;g.fillStyle=color;
    g.shadowColor=color;g.shadowBlur=8+charge*12;g.lineWidth=2+charge*2;
    if (enemy.kind==='physical') {
      g.beginPath();g.ellipse(enemy.x+enemy.facing*species.range*.65,enemy.y-3,
        16+charge*23,4+charge*5,0,0,Math.PI*2);g.stroke();
    } else {
      g.setLineDash([5,6]);g.beginPath();g.moveTo(enemy.x,enemy.y-height*.55);
      g.lineTo(state.x,state.ground-68);g.stroke();g.setLineDash([]);
    }
    g.textAlign='center';g.font='bold 10px system-ui';
    g.fillText(species.tell,enemy.x,enemy.y-height-43);
    g.fillRect(enemy.x-24,enemy.y-height-36,48*charge,3);
    g.restore();
  }
  if (enemy.type===DRAGON_TYPE&&images.dragon.complete&&images.dragon.naturalWidth) {
    drawShadow(enemy.x,enemy.y,width,.5);
    g.save();g.translate(enemy.x,enemy.y-leap+visual.footOffset);
    g.scale(enemy.facing===-1?1:-1,1);
    g.rotate(Math.sin(t/630)*.014+attackPulse*.045);
    if(t-enemy.hurtAt<160) g.filter='brightness(1.55)';
    g.drawImage(images.dragon,crop[0],crop[1],crop[2]-crop[0],crop[3]-crop[1],
      -width/2,-height,width,height);g.restore();
  } else if (image.complete&&image.naturalWidth) {
    g.save();
    drawWholeSprite(image,0,crop,
      enemy.x,enemy.y-leap,width,height,enemy.phase+(enemy.moving?0:t/770),enemy.moving,enemy.facing,
      t-enemy.hurtAt<160,species.motion,attackPulse,true,enemy.y,charge,visual.footOffset,
      family==='rats'||family==='frogs'?window.CREATURE_MASKS[family][species.variant]:null);
    g.restore();
  } else {g.fillStyle='#b59a94';g.fillRect(enemy.x-width/2,enemy.y-height,width,height);}
  if (attackPulse>.15&&enemy.hp>0) {
    const color=elementColor(enemy.element);
    g.strokeStyle=color;g.shadowColor=color;g.shadowBlur=12;g.lineWidth=2+attackPulse*3;
    const flashX=enemy.x+enemy.facing*width*.32,flashY=enemy.y-height*.55;
    g.beginPath();
    if (enemy.kind==='physical') g.arc(flashX,flashY,width*.3,
      enemy.facing===1?-1.1:2.04,enemy.facing===1?1.1:4.24);
    else g.arc(flashX,flashY,width*.18+attackPulse*8,0,Math.PI*2);
    g.stroke();
    g.shadowBlur=0;
  }
  g.restore();
  if (enemy.hp<=0) return;
  const activeStatuses=Object.keys(enemy.statuses||{}).filter(key=>hasStatus(enemy,key,t));
  if (activeStatuses.length) {
    g.textAlign='center';g.font='bold 9px system-ui';g.fillStyle='#fff8ea';
    g.fillText(activeStatuses.map(key=>STATUS_INFO[key][0]).join(' · '),enemy.x,enemy.y-height-36);
    g.textAlign='left';
  }
  const barW=enemy.boss?106:67;
  g.fillStyle='#1c2634';g.fillRect(enemy.x-barW/2,enemy.y-height-16,barW,6);
  g.fillStyle=enemy.possessed?'#cb79ff':elementColor(enemy.element);
  g.fillRect(enemy.x-barW/2,enemy.y-height-16,barW*enemy.hp/enemy.maxHp,6);
  if (enemy===highlighted||enemy.boss) {
    g.textAlign='center';g.font='bold 11px system-ui';g.fillStyle='#fff7e3';
    g.shadowColor='#192530';g.shadowBlur=4;
    g.fillText((enemy.boss?'MINIBOSS · ':'')+enemy.name+' '+ELEMENTS[enemy.element].icon,enemy.x,enemy.y-height-23);
    g.shadowBlur=0;g.textAlign='left';
  }
}
function drawShots() {
  for (const shot of state.shots) {
    g.save();g.fillStyle=shot.color;g.strokeStyle=shot.color;g.shadowColor=shot.color;g.shadowBlur=15;
    if (shot.kind==='skill-beam') {
      g.lineWidth=7;g.beginPath();g.moveTo(shot.x-shot.vx*60,shot.y);g.lineTo(shot.x+Math.sign(shot.vx)*15,shot.y);g.stroke();
      g.strokeStyle='#fff9ea';g.lineWidth=2;g.beginPath();g.moveTo(shot.x-shot.vx*42,shot.y);g.lineTo(shot.x+Math.sign(shot.vx)*15,shot.y);g.stroke();
    } else if (shot.kind==='skill-eclipse') {
      g.beginPath();g.arc(shot.x,shot.y,shot.r,Math.PI*.25,Math.PI*1.75);g.stroke();
      g.fillStyle='#f7e8ff';g.beginPath();g.arc(shot.x+5,shot.y-4,shot.r*.38,0,Math.PI*2);g.fill();
    } else if (shot.kind==='skill-flower') {
      for(let petal=0;petal<6;petal++) {const a=petal*Math.PI/3+shot.x*.02;
        g.beginPath();g.ellipse(shot.x+Math.cos(a)*shot.r*.65,shot.y+Math.sin(a)*shot.r*.65,
          shot.r*.55,shot.r*.25,a,0,Math.PI*2);g.fill();}
    } else if (shot.kind==='skill-roots') {
      g.beginPath();for(let point=0;point<8;point++) {const a=point*Math.PI/4;
        g.lineTo(shot.x+Math.cos(a)*shot.r,shot.y+Math.sin(a)*shot.r);}g.closePath();g.stroke();
    } else if (shot.kind==='arrow') {
      g.lineWidth=3;g.beginPath();g.moveTo(shot.x-shot.vx*31,shot.y);
      g.lineTo(shot.x+Math.sign(shot.vx)*10,shot.y);g.stroke();
      g.beginPath();g.arc(shot.x+Math.sign(shot.vx)*10,shot.y,3,0,Math.PI*2);g.fill();
    } else if (shot.kind==='flare') {
      g.translate(shot.x,shot.y);g.rotate(Math.PI/4);g.fillRect(-shot.r,-shot.r,shot.r*2,shot.r*2);
      g.fillStyle='#fff8d7';g.fillRect(-3,-3,6,6);
    } else {
      g.globalAlpha=.3;g.beginPath();g.arc(shot.x-shot.vx*25,shot.y-shot.vy*25,shot.r*1.2,0,Math.PI*2);g.fill();
      g.globalAlpha=1;g.beginPath();g.arc(shot.x,shot.y,shot.r,0,Math.PI*2);g.fill();
      g.fillStyle='#fffaf0';g.beginPath();g.arc(shot.x,shot.y,shot.r*.38,0,Math.PI*2);g.fill();
      if (shot.kind==='spores'||shot.kind==='wisp') {
        g.strokeStyle='#fffaf0';g.lineWidth=1.5;
        g.beginPath();g.arc(shot.x,shot.y,shot.r+4,0,Math.PI*2);g.stroke();
      }
    }
    g.restore();
  }
}
function drawWaves(t) {
  for (let i=state.waves.length-1;i>=0;i--) {
    const wave=state.waves[i],progress=(t-wave.start)/wave.life;
    if (progress>=1) {state.waves.splice(i,1);continue;}
    const radius=wave.radius+(wave.maxRadius-wave.radius)*Math.max(0,progress);
    g.save();g.globalAlpha=(1-Math.max(0,progress))*.75;
    g.strokeStyle=wave.color;g.shadowColor=wave.color;g.shadowBlur=12;g.lineWidth=2.5;
    g.beginPath();g.ellipse(wave.x,wave.y,radius,Math.max(5,radius*.28),0,0,Math.PI*2);g.stroke();
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
    g.fillStyle=drop.kind==='diamond'?'#9de7f4':'#f5c778';
    g.strokeStyle=drop.kind==='diamond'?'#e8ffff':'#fff3c8';
    g.shadowColor=drop.kind==='diamond'?'#8de6ff':'#ffd890';g.shadowBlur=10;
    g.beginPath();
    if(drop.kind==='diamond') {g.moveTo(drop.x,drop.y-7);g.lineTo(drop.x+6,drop.y);
      g.lineTo(drop.x,drop.y+7);g.lineTo(drop.x-6,drop.y);g.closePath();}
    else g.ellipse(drop.x,drop.y,4,5,0,0,Math.PI*2);
    g.fill();g.stroke();
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
    g.font='bold 16px system-ui';g.textAlign='center';g.shadowColor='#172336';g.shadowBlur=5;
    g.lineWidth=3;g.strokeStyle='#152638';g.strokeText(effect.text,effect.x,effect.y);
    g.fillText(effect.text,effect.x,effect.y);
    if (effect.life<=0) state.effects.splice(i,1);
  }
  g.globalAlpha=1;g.shadowBlur=0;g.textAlign='left';
}
function stepGame(t,dt) {
  state.mana=Math.min(state.maxMana,state.mana+dt*.0015);
  if(state.mode==='recover') return;
  if (state.room===0) {
    const cityStartX=state.x;
    if (state.mode==='city-west'||(state.manual&&state.manualLeft)) {
      state.facing=-1;state.x-=dt*.27;
      if (state.x<48) {enterRoom(201,true);return;}
    } else if(state.manual&&state.manualRight) {
      state.facing=1;
      state.x+=dt*.27;
      if(state.x>925) {enterRoom(1);return;}
    }
    state.heroMoving=Math.abs(state.x-cityStartX)>.1;
    state.heroPhase+=Math.abs(state.x-cityStartX)*.115;
    return;
  }
  tickStatuses(state,t);
  for (const enemy of state.enemies) if(enemy.hp>0) tickStatuses(enemy,t);
  if (state.poisonUntil>t&&t>=state.nextPoisonAt&&state.mode!=='recover') {
    state.nextPoisonAt=t+900;
    hurtHero(0,2,'air');
  }
  if (!state.manual&&state.heldLeft&&state.mode!=='return-fight'&&state.pendingAttack) {
  state.pendingAttack=null;state.hitAt=-1e9;state.activeSkill=null;
  }
  if (state.pendingAttack&&t>=state.pendingAttack.impactAt) resolvePlayerAttack();
  const startX=state.x;
  const hindered=hasStatus(state,'freeze',t)||hasStatus(state,'paralyze',t);
  const moveScale=hindered?0:hasStatus(state,'slow',t)?.52:1;
  if (state.manual&&state.mode!=='dragon-victory') {
    if(state.mode!=='manual-clear') state.mode='manual';
    const manualDirection=(state.manualRight?1:0)-(state.manualLeft?1:0);
    if(manualDirection) state.facing=manualDirection;
    moveHero(manualDirection*dt*.3*moveScale);
    if (state.x<45) {enterRoom(state.room===201?0:state.room-1,true);return;}
    if (state.x>925) {enterRoom(state.room===201?0:Math.min(200,state.room+1));return;}
    if (state.manualAttack&&t-heroAttackAt>(heroUsesRange()?900:700)&&!hindered) {
      heroAttackAt=t;playerAttack(t);
    }
  } else if (state.mode==='return-travel') {
    if (!state.heldLeft) state.mode='paused-back';
    else if (t>nextRoomAt) {
      state.facing=-1;
      moveHero(-dt*.34*moveScale);
      if (state.x<45) {enterRoom(state.room-1,true);return;}
    }
  } else if (state.mode!=='return-fight'&&state.heldLeft&&state.room&&state.mode!=='recover') {
    state.mode='back';state.facing=-1;moveHero(-dt*.46*moveScale);
    if (state.x<45) {enterRoom(state.room-1,true);return;}
  } else if (state.mode==='back') {
    state.mode='paused-back';
    label('Retorno pausado. Segure ◀ para continuar ou RUN RIGHT para avançar.');
  }
  if (state.mode==='forward') {
    const target=nearest();
    if (target) {
      const stop=heroReach(target);
      const direction=target.x>=state.x?1:-1;
      const gap=Math.abs(target.x-state.x);
      if (gap>stop) moveHero(direction*Math.min(dt*.18*moveScale,gap-stop));
      if (Math.abs(target.x-state.x)<=stop+2) state.mode='fight';
    }
  }
  if (state.mode==='fight'||state.mode==='return-fight') {
    const target=nearest();
    if (!target) state.mode=state.mode==='return-fight'?
      (state.heldLeft?'return-travel':'paused-back'):(state.repeat?'repeat-back':'advance');
    else {
      const reach=heroReach(target);
      const direction=target.x>=state.x?1:-1;
      const gap=Math.abs(target.x-state.x);
      if (gap>reach) moveHero(direction*Math.min(dt*.17*moveScale,gap-reach));
      if (gap<=reach+8&&t-heroAttackAt>(heroUsesRange()?900:700)&&!hindered) {
        heroAttackAt=t;playerAttack(t);
      }
    }
  }
  state.heroMoving=Math.abs(state.x-startX)>.1;
  if(state.heroMoving) state.facing=state.x>startX?1:-1;
  state.heroPhase+=Math.abs(state.x-startX)*.115;
  const roomAtStart=state.room;
  let activeWarnings=state.enemies.filter(enemy=>enemy.hp>0&&enemy.telegraphUntil>t).length;
  const maxWarnings=state.room<=20?2:3;
  for (const enemy of state.enemies) {
    enemy.moving=false;
    if (enemy.hp<=0) continue;
    if (!['forward','fight','return-fight','back','manual','manual-clear'].includes(state.mode)) continue;
    const species=MONSTERS[enemy.type];
    if (hasStatus(enemy,'freeze',t)||hasStatus(enemy,'paralyze',t)) continue;
    if (enemy.telegraphUntil) {
      if (t>=enemy.telegraphUntil) {
        enemy.telegraphUntil=0;
        activeWarnings--;
        enemyAttack(enemy,t);
        enemy.recoverUntil=t+(enemy.boss?540:380);
      }
      if (state.room!==roomAtStart) return;
      continue;
    }
    enemy.facing=state.x>=enemy.x?1:-1;
    if (enemy.dashUntil>t) {
      const previous=enemy.x;
      moveEnemy(enemy,enemy.dashDirection*dt*.76);
      enemy.phase+=Math.abs(enemy.x-previous)*.14;
      enemy.moving=enemy.x!==previous;
      continue;
    }
    if (enemy.recoverUntil>t) continue;
    const distance=Math.abs(enemy.x-state.x);
    const ahead=state.enemies.filter(other=>other!==enemy&&other.hp>0&&
      Math.abs(other.x-state.x)<distance&&other.kind===enemy.kind).length;
    const desired=enemy.kind==='physical'?Math.max(58,Math.min(95,species.range-34))+ahead*31:
      (enemy.kind==='ranged'?190:175)+ahead*23;
    if (distance>desired) {
      const previous=enemy.x;
      moveEnemy(enemy,enemy.facing*Math.min(distance-desired,dt*species.speed*(enemy.boss?.9:1)*(hasStatus(enemy,'slow',t)?.5:1)));
      enemy.phase+=Math.abs(previous-enemy.x)*.14;
      enemy.moving=enemy.x!==previous;
      if (species.drag&&distance<105&&enemy.moving&&Math.random()<.14) {
        state.x=clamp(state.x+(state.heldLeft||state.mode==='return-fight'?1:-1)*dt*.18,32,928);
        addStatus(state,'drag',700);
      }
    }
    const attackRange=Math.max(species.range,enemyVisual(enemy).half+23);
    if (!hasStatus(enemy,'blind',t)&&activeWarnings<maxWarnings&&Math.abs(enemy.x-state.x)<=attackRange&&
        t-enemy.attackAt>species.cooldown*(enemy.boss?.88:1)) {
      enemy.telegraphAt=t;
      enemy.telegraphUntil=t+species.windup;
      enemy.moving=false;
      activeWarnings++;
    }
  }
  for (let i=state.shots.length-1;i>=0;i--) {
    const shot=state.shots[i];
    if (shot.homing) {
      shot.vx=clamp(shot.vx+Math.sign(state.x-shot.x)*dt*.00045,-.55,.55);
      shot.y+=clamp(state.ground-65-shot.y,-dt*.08,dt*.08);
    }
    shot.x+=shot.vx*dt;shot.y+=(shot.vy||0)*dt;shot.life-=dt;
    if (shot.owner==='hero') {
      const enemy=state.enemies.find(value=>value.hp>0&&
        (shot.skillTarget===undefined||value.id===shot.skillTarget)&&orbHits(shot.x,shot.y,shot.r,enemyBox(value)));
      if (enemy) {hurtEnemy(enemy,shot,shot.element);
        if(shot.skillVisual) state.skillVisuals.push({...shot.skillVisual,targetX:enemy.x,
          targetY:enemy.y-enemyVisual(enemy).height*.55,at:t});
        if(enemy.hp>0&&shot.skillStatus) addStatus(enemy,shot.skillStatus,2100);
        state.shots.splice(i,1);continue;}
    } else if (orbHits(shot.x,shot.y,shot.r,heroBox())) {
      hurtHero(shot.physical,shot.magical,shot.element,shot);
      if (state.room!==roomAtStart) return;
      if (shot.poison&&state.lastMonsterHit>0&&state.mode!=='recover') {
        state.poisonUntil=t+3000;state.nextPoisonAt=t+900;
        label('Veneno da serpente: dano mágico por alguns segundos.');
      }
      state.shots.splice(i,1);continue;
    }
    if (shot.life<=0||shot.x<0||shot.x>960) state.shots.splice(i,1);
  }
  if (t>nextRoomAt&&state.mode==='advance') {
    const previous=state.x;moveHero(dt*.33*moveScale);state.heroMoving=true;state.facing=1;
    state.heroPhase+=Math.abs(state.x-previous)*.115;
    if (state.x>925) enterRoom(Math.min(200,state.room+1));
  }
  if (t>nextRoomAt&&state.mode==='repeat-back') {
    const previous=state.x;moveHero(-dt*.34);state.heroMoving=true;state.facing=-1;
    state.heroPhase+=Math.abs(state.x-previous)*.115;
    if (state.x<45) enterRoom(state.room===200?199:state.room,true,true);
  }
  if (t>nextRoomAt&&state.mode==='dragon-victory') enterRoom(0);
  meta.autoUseHotbar();
}
function frame(t) {
  const dt=Math.min(40,t-last);last=t;
  if(state.roomSignUntil&&t>state.roomSignUntil) $('room-sign').hidden=true;
  if(state.victoryUntil&&t>state.victoryUntil) $('victory-banner').hidden=true;
  if (state.profileId) stepGame(t,dt);
  g.fillStyle='#152a34';g.fillRect(0,0,960,480);
  g.save();
  if (t<state.shakeUntil) {
    g.translate(Math.sin(t*.17)*state.shakePower,Math.cos(t*.21)*state.shakePower*.55);
  } else state.shakePower=0;
  drawBackground(t);
  drawWaves(t);
  const highlighted=nearest();
  for (const enemy of state.enemies) drawEnemy(enemy,t,highlighted);
  drawDrops(dt);drawHero(t);drawSkillVisuals(t);drawShots();drawParticles(dt);drawEffects(dt);
  g.restore();
  if (state.profileId) {
    $('mana').textContent=fmt(state.mana)+'/'+fmt(state.maxMana);
    $('manabar').style.width=100*state.mana/state.maxMana+'%';
    const active=Object.keys(state.statuses||{}).filter(key=>hasStatus(state,key,t));
    $('status-effect').hidden=(state.poisonUntil<=t&&active.length===0)||state.room===0;
    $('status-effect').textContent=active.length?active.map(key=>STATUS_INFO[key][0]).join(' · '):'VENENO';
    document.querySelectorAll('.hotbar-slot[data-skill]').forEach(button=>{
      const skill=skillFor(state.className,button.dataset.skill),remaining=Math.max(0,(state.skillReadyAt[skill.id]||0)-t);
      button.classList.toggle('cooling',remaining>0);
      button.dataset.cooldown=remaining>0?(remaining/1000).toFixed(1):'';
      button.disabled=state.room===0?false:state.mana<skill.mana||remaining>0;
    });
  }
  requestAnimationFrame(frame);
}
$('run').onclick=()=>{
  if (!state.profileId||state.mode==='recover') return;
  state.manual=false;state.heldLeft=false;state.repeatEntry=false;
  if (state.room===0) enterRoom(1);
  else if (state.room===201) enterRoom(0);
  else if (state.mode==='repeat-back'&&state.room===200) {
    label('A sala 200 foi concluída. O herói seguirá repetindo a sala 199.');
  }
  else if (state.mode==='repeat-back') {state.mode='advance';state.repeat=false;updateUI();meta.save();}
  else if (['paused-back','return-travel','return-fight'].includes(state.mode)) state.mode=nearest()?'fight':'advance';
  else if (state.mode==='back') {
    state.mode=nearest()?'fight':'advance';
  }
  else if (state.mode==='manual'||state.mode==='manual-clear') state.mode=nearest()?'fight':'advance';
  updateUI();
};
$('repeat').onclick=()=>{
  if (!state.profileId) return;
  state.repeat=!state.repeat;
  if(!state.repeat) state.repeatEntry=false;
  label(state.repeat?'Repetir sala ativado. O herói voltará após vencer.':'Repetir sala desativado.');
  updateUI();meta.save();
};
const hideUi=$('hide-ui');
hideUi.onclick=()=>{
  const hidden=$('game').parentElement.classList.toggle('cinema');
  if(hidden) meta.closeWindow();
  hideUi.setAttribute('aria-pressed',String(hidden));
  hideUi.textContent=hidden?'◉ MOSTRAR PAINÉIS':'◉ OCULTAR PAINÉIS';
};
const left=$('left');
$('return-city').onclick=()=>{
  if (!state.profileId||state.room===0||state.mode==='recover') return;
  setLeft(false);state.manual=false;
  recordRoomResult('Retirada');
  enterRoom(0);
  label('Você retornou à Vila do Amanhecer. Prepare-se para a próxima jornada.');
};
function setLeft(value) {
  state.heldLeft=value;left.classList.toggle('held',value);
  left.setAttribute('aria-pressed',String(value));
}
left.onclick=()=>{
  if(!state.profileId||state.mode==='recover') return;
  state.manual=false;setLeft(true);
  if(state.room===0) {state.mode='city-west';label('Seguindo para oeste: o Dragão Vermelho aguarda além da cidade.');}
  else if(state.room===201) enterRoom(0);
  else if(state.mode==='manual'||state.mode==='manual-clear') state.mode=nearest()?'return-fight':'return-travel';
  updateUI();
};
$('mode-toggle').onclick=()=>{
  if(!state.profileId||state.mode==='recover') return;
  state.manual=!state.manual;
  setLeft(false);state.manualLeft=false;state.manualRight=false;state.manualAttack=false;
  if(state.manual) {state.mode='manual';label('Modo manual: use as setas e ATACAR. Teclado: A/D e Espaço.');}
  else if(state.room===0) state.mode='idle';
  else state.mode=nearest()?'forward':'advance';
  updateUI();
};
for(const [id,key] of [['manual-left','manualLeft'],['manual-right','manualRight'],['manual-attack','manualAttack']]) {
  const button=$(id);
  button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);state[key]=true;button.classList.add('held');});
  for(const event of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(event,()=>{state[key]=false;button.classList.remove('held');});
}
window.addEventListener('keydown',event=>{
  if (['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
  if (event.key==='ArrowLeft'||event.key.toLowerCase()==='a') {event.preventDefault();if(state.manual) state.manualLeft=true;else if(!event.repeat) left.click();}
  if (event.key==='ArrowRight'||event.key.toLowerCase()==='d') {event.preventDefault();if(state.manual) state.manualRight=true;else if(!event.repeat) $('run').click();}
  if(event.code==='Space'&&state.manual) {event.preventDefault();state.manualAttack=true;}
  if (/^[0-9]$/.test(event.key)) meta.useSlot(event.key==='0'?9:Number(event.key)-1,false);
  if (event.key==='Escape') meta.closeWindow();
});
window.addEventListener('keyup',event=>{
  if (event.key==='ArrowLeft'||event.key.toLowerCase()==='a') state.manualLeft=false;
  if (event.key==='ArrowRight'||event.key.toLowerCase()==='d') state.manualRight=false;
  if(event.code==='Space') state.manualAttack=false;
});
window.addEventListener('blur',()=>{state.manualLeft=false;state.manualRight=false;state.manualAttack=false;});
setInterval(()=>{if(state.profileId) meta.save();},8000);
updateUI();requestAnimationFrame(frame);
