const SAVE_KEY = 'eco-dos-seis-save-v4';
const ELEMENTS = {
  water:{name:'Água', icon:'◈', color:'#8dcde7'},
  fire:{name:'Fogo', icon:'✦', color:'#f2aa83'},
  earth:{name:'Terra', icon:'◆', color:'#b4c990'},
  air:{name:'Ar', icon:'❋', color:'#d6c9ef'}
};
const ITEMS = [
  {id:'blade', category:'weapon', name:'Lâmina de Carvalho', icon:'⚔', price:12, type:'physical', element:'earth', physical:2, magical:0, spells:[]},
  {id:'staff', category:'weapon', name:'Cajado de Orvalho', icon:'✧', price:12, type:'magical', element:'water', physical:0, magical:2, spells:[]},
  {id:'ember', category:'weapon', name:'Sabre da Brasa', icon:'⚔', price:42, type:'physical', element:'fire', physical:4, magical:2, spells:[]},
  {id:'wind', category:'weapon', name:'Bastão dos Ventos', icon:'✧', price:42, type:'magical', element:'air', physical:2, magical:4, spells:[]},
  {id:'steel', category:'weapon', name:'Espada da Vigília', icon:'⚔', price:82, type:'physical', element:'air', physical:7, magical:0, spells:[]},
  {id:'moon', category:'weapon', name:'Cajado da Lua', icon:'✧', price:82, type:'magical', element:'water', physical:0, magical:7, spells:[]},
  {id:'vest', category:'armor', name:'Colete de Linho', icon:'⬟', price:16, physicalDefense:2, magicalDefense:0},
  {id:'cloak', category:'armor', name:'Manto Sereno', icon:'◈', price:16, physicalDefense:0, magicalDefense:2},
  {id:'mail', category:'armor', name:'Cota do Guardião', icon:'⬟', price:68, physicalDefense:5, magicalDefense:1},
  {id:'ward', category:'armor', name:'Traje Rúnico', icon:'◈', price:68, physicalDefense:1, magicalDefense:5},
  {id:'buckler', category:'shield', name:'Escudo de Carvalho', price:18, physicalDefense:2, magicalDefense:0},
  {id:'trousers', category:'pants', name:'Calças de Linho', price:14, physicalDefense:1, magicalDefense:0},
  {id:'hood', category:'head', name:'Capuz do Viajante', price:20, physicalDefense:0, magicalDefense:2},
  {id:'boots', category:'boots', name:'Botas de Caminho', price:16, physicalDefense:1, magicalDefense:0},
  {id:'pendant', category:'necklace', name:'Colar do Orvalho', price:28, physicalDefense:0, magicalDefense:2}
];
const POTIONS = {
  health:{id:'health',name:'Poção de vida',icon:'❤',price:9,restore:.35,resource:'hp'},
  mana:{id:'mana',name:'Poção de mana',icon:'✦',price:9,restore:.35,resource:'mana'}
};
const PROFILE_FIELDS = ['name','className','advantage','weakness','highest','hp','maxHp','mana','maxMana','xp','level','gold','diamonds','basePhysical','baseMagical','physicalDefense','magicalDefense','physicalSkill','magicalSkill','skillPoints','defensePoints','repeat','roomHistory','skillResets'];
const GEAR_SLOTS = {weapon:'Arma principal',shield:'Escudo',pants:'Calças',chest:'Peitoral',head:'Cabeça',boots:'Botas',necklace:'Colar'};
const emptyGear = () => Object.fromEntries(Object.keys(GEAR_SLOTS).map(slot=>[slot,null]));
const itemSlot = entry => entry.category==='armor'?'chest':entry.category;
const ITEM_ART = ['blade','staff','ember','wind','steel','moon','vest','cloak','mail','ward','health','mana'];
const GEAR_ART = ['buckler','trousers','hood','boots','pendant'];
function createMeta(state, hooks) {
  const $ = id => document.getElementById(id);
  let profiles = [], active = null, owned = new Set(), inventory = {}, gear = emptyGear();
  let potions = {health:0,mana:0}, hotbar = Array.from({length:10},()=>({itemId:null,threshold:40}));
  let lastPotionAt = 0, soundOn = false, audio = null, note = 0, marketQuantity=1;
  const item = id => ITEMS.find(entry => entry.id === id);
  const current = () => profiles.find(profile => profile.id === active);
  const totalGold = () => Math.floor(state.gold).toLocaleString('pt-BR');
  function freshProfile(name, className, advantage, weakness) {
    return {id:'hero-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),
      name,className,advantage,weakness,highest:0,hp:100,maxHp:100,mana:100,maxMana:100,xp:0,level:1,gold:0,diamonds:0,
      basePhysical:4,baseMagical:4,physicalDefense:0,magicalDefense:0,physicalSkill:0,magicalSkill:0,
      skillPoints:0,defensePoints:0,repeat:false,roomHistory:[],skillResets:{day:'',count:0},owned:[],inventory:{},gear:emptyGear(),
      potions:{health:2,mana:2},hotbar:Array.from({length:10},(_,index)=>({itemId:index===0?'health':index===1?'mana':null,
        skillId:index>=2&&index<7?HERO_SKILLS[className][index-2].id:null,threshold:40}))};
  }
  function sanitizeProfile(profile) {
    if (!profile || typeof profile.id !== 'string') return null;
    const clean = freshProfile(String(profile.name||'Viajante').slice(0,18),profile.className==='mage'?'mage':'warrior',
      ELEMENTS[profile.advantage]?profile.advantage:'water',ELEMENTS[profile.weakness]?profile.weakness:'fire');
    clean.id=profile.id;
    for (const key of PROFILE_FIELDS) if (profile[key]!==undefined) clean[key]=profile[key];
    clean.name=String(clean.name||'Viajante').slice(0,18);
    clean.advantage=ELEMENTS[clean.advantage]?clean.advantage:'water';
    clean.weakness=ELEMENTS[clean.weakness]?clean.weakness:'fire';
    clean.diamonds=Math.max(0,Math.floor(Number(profile.diamonds)||0));
    clean.skillResets={day:String(profile.skillResets?.day||''),count:Math.max(0,Math.min(3,Math.floor(Number(profile.skillResets?.count)||0)))};
    clean.roomHistory=Array.isArray(profile.roomHistory)?profile.roomHistory.slice(0,10).map(run=>({
      room:Math.max(1,Math.min(201,Math.floor(Number(run?.room)||1))),
      result:['Vitória','Derrota','Retirada','Empurrado'].includes(run?.result)?run.result:'Vitória',
      seconds:Math.max(1,Math.floor(Number(run?.seconds)||1)),
      damage:Math.max(0,Math.floor(Number(run?.damage)||0)),
      gold:Math.max(0,Math.floor(Number(run?.gold)||0)),
      kills:Math.max(0,Math.floor(Number(run?.kills)||0))})):[];
    clean.owned=Array.isArray(profile.owned)?profile.owned.filter(id=>!!item(id)):[];
    clean.inventory={};
    for(const entry of ITEMS) {
      const count=Math.max(0,Math.floor(Number(profile.inventory?.[entry.id]??(clean.owned.includes(entry.id)?1:0))||0));
      if(count) clean.inventory[entry.id]=count;
    }
    clean.owned=Object.keys(clean.inventory);
    clean.gear=emptyGear();
    for (const slot of Object.keys(GEAR_SLOTS)) {
      const id=profile.gear?.[slot]||(slot==='chest'?profile.gear?.armor:null);
      const entry=item(id);
      const vocation=clean.className==='mage'?'magical':'physical';
      if (clean.owned.includes(id)&&entry&&itemSlot(entry)===slot&&
          (slot!=='weapon'||entry.type===vocation)) clean.gear[slot]=id;
    }
    clean.potions={health:Math.max(0,Number(profile.potions?.health)||0),mana:Math.max(0,Number(profile.potions?.mana)||0)};
    clean.hotbar=Array.from({length:10},(_,index)=>{
      const slot=profile.hotbar?.[index]||{};
      const threshold=Number(slot.threshold);
      return {itemId:POTIONS[slot.itemId]?slot.itemId:null,skillId:skillFor(clean.className,slot.skillId)?slot.skillId:null,
        threshold:Number.isFinite(threshold)?Math.max(1,Math.min(99,threshold)):40};
    });
    if(!clean.hotbar.some(slot=>slot.skillId)) {
      for(const skill of HERO_SKILLS[clean.className]) {
        const free=clean.hotbar.findIndex((slot,index)=>index>=2&&!slot.itemId&&!slot.skillId);
        if(free>=0) clean.hotbar[free].skillId=skill.id;
      }
    }
    clean.needsElements=!!profile.needsElements;
    return clean;
  }
  function loadProfiles() {
    try {
      const data=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
      if (data?.v===4 && Array.isArray(data.profiles)) {
        profiles=data.profiles.slice(0,2).map(sanitizeProfile).filter(Boolean);
        return;
      }
      const old=JSON.parse(localStorage.getItem('eco-dos-seis-save-v3')||'null');
      if (old?.v===3 && old.state?.className) {
        const migrated=freshProfile('Viajante',old.state.className,'water','fire');
        for (const key of PROFILE_FIELDS) if (old.state[key]!==undefined) migrated[key]=old.state[key];
        migrated.gold=Math.max(0,Number(old.state.coins)||0);
        const legacyItem={bronze:'blade',crystal:'steel'};
        migrated.owned=[...new Set((old.owned||[]).map(id=>legacyItem[id]||id).filter(id=>!!item(id)))];
        migrated.gear={...emptyGear(),weapon:legacyItem[old.gear?.weapon]||old.gear?.weapon||null,
          chest:old.gear?.armor||null};
        if ((old.owned||[]).includes('charm')) migrated.gold+=42;
        migrated.needsElements=true;
        profiles=[sanitizeProfile(migrated)];
        persist();
      } else {
        const older=JSON.parse(localStorage.getItem('eco-dos-seis-save-v2')||'null');
        if (older?.v===2 && older.state?.className) {
          const migrated=freshProfile('Viajante',older.state.className,'water','fire');
          const level=Math.max(1,Math.floor(Number(older.state.level)||1));
          migrated.level=level;
          migrated.basePhysical=4+level-1;
          migrated.baseMagical=4+level-1;
          migrated.maxHp=100+(level-1)*(migrated.className==='warrior'?10:6);
          migrated.maxMana=100+(level-1)*(migrated.className==='warrior'?5:7);
          migrated.hp=migrated.maxHp;
          migrated.mana=migrated.maxMana;
          migrated.skillPoints=level-1;
          migrated.defensePoints=level-1;
          migrated.highest=Math.max(0,Math.min(200,Number(older.state.highest)||0));
          migrated.gold=Math.max(0,Number(older.state.coins)||0);
          migrated.needsElements=true;
          profiles=[migrated];
          persist();
        }
      }
    } catch {}
  }
  function persist() {
    try {localStorage.setItem(SAVE_KEY,JSON.stringify({v:4,profiles}));} catch {}
  }
  function save() {
    const profile=current();
    if (!profile) return;
    for (const key of PROFILE_FIELDS) profile[key]=state[key];
    profile.owned=[...owned];
    profile.inventory={...inventory};
    profile.gear={...gear};
    profile.potions={...potions};
    profile.hotbar=hotbar.map(slot=>({...slot}));
    persist();
  }
  function activate(id) {
    save();
    const profile=profiles.find(entry=>entry.id===id);
    if (!profile) return;
    active=id;
    for (const key of PROFILE_FIELDS) state[key]=profile[key];
    state.profileId=id;
    state.hp=Math.max(1,Math.min(state.maxHp,state.hp));
    state.mana=Math.max(0,Math.min(state.maxMana,state.mana));
    owned=new Set(profile.owned);
    inventory={...profile.inventory};
    gear={...profile.gear};
    potions={...profile.potions};
    hotbar=profile.hotbar.map(slot=>({...slot}));
    $('character-screen').hidden=true;
    $('profile-form').hidden=true;
    $('switch-character').hidden=false;
    hooks.onProfileSelected();
    renderHotbar();
    save();
  }
  function leaveProfile() {
    if (state.room!==0) return;
    save();
    active=null;
    state.profileId=null;
    state.className=null;
    $('switch-character').hidden=true;
    closeWindow();
    $('character-screen').hidden=false;
    hooks.onProfileLeft();
    renderProfiles();
  }
  function renderProfiles() {
    const list=$('profile-list');
    list.replaceChildren();
    for (const profile of profiles) {
      const card=document.createElement('article');
      card.className='profile-card';
      const icon=document.createElement('span');
      icon.className='profile-icon '+profile.className;
      icon.setAttribute('aria-hidden','true');
      const text=document.createElement('div');
      const title=document.createElement('strong');
      title.textContent=profile.name;
      const detail=document.createElement('small');
      detail.textContent=(profile.className==='mage'?'Mago':'Guerreiro')+' · Nível '+profile.level;
      const elements=document.createElement('span');elements.className='profile-elements';
      elements.append(makeElementIcon(profile.advantage),document.createTextNode(' vantagem · '),
        makeElementIcon(profile.weakness),document.createTextNode(' desvantagem'));
      text.append(title,detail,elements);
      const button=document.createElement('button');
      button.textContent=profile.needsElements?'CONFIGURAR':'ENTRAR';
      button.onclick=()=>profile.needsElements?openForm(profile):activate(profile.id);
      card.append(icon,text,button);
      list.append(card);
    }
    if (!profiles.length) {
      const empty=document.createElement('p');
      empty.className='empty-profiles';
      empty.textContent='Nenhum herói criado. Escolha um nome, uma classe e seus elementos para começar.';
      list.append(empty);
    }
    $('new-profile').hidden=profiles.length>=2;
  }
  function openForm(profile=null) {
    const form=$('profile-form');
    form.hidden=false;
    form.dataset.editId=profile?.id||'';
    form.querySelector('h3').textContent=profile?'Configure seu herói':'Novo personagem';
    form.querySelector('button[type=submit]').textContent=profile?'SALVAR E ENTRAR':'CRIAR E ENTRAR';
    $('profile-name').value=profile?.name||'';
    form.querySelector('input[value=warrior]').checked=(profile?.className||'warrior')==='warrior';
    form.querySelector('input[value=mage]').checked=profile?.className==='mage';
    form.querySelectorAll('input[name=profile-class]').forEach(input=>input.disabled=!!profile);
    $('profile-element').value=profile?.advantage||'water';
    $('profile-weakness').value=profile?.weakness||'fire';
    updateElementPreviews();
    $('profile-error').textContent='';
    $('new-profile').hidden=true;
    $('profile-name').focus();
  }
  function closeForm() {
    $('profile-form').hidden=true;
    $('new-profile').hidden=profiles.length>=2;
    $('profile-error').textContent='';
  }
  function makeElementIcon(element) {
    const icon=document.createElement('span');icon.className='element-icon';
    icon.dataset.element=element;
    icon.title=ELEMENTS[element]?.name||'';
    return icon;
  }
  function updateElementPreviews() {
    $('advantage-icon').dataset.element=$('profile-element').value;
    $('weakness-icon').dataset.element=$('profile-weakness').value;
  }
  function makeItemSprite(id) {
    const sprite=document.createElement('span');sprite.className='item-sprite';
    sprite.dataset.item=id;
    const oldIndex=ITEM_ART.indexOf(id),gearIndex=GEAR_ART.indexOf(id);
    if (oldIndex>=0) {
      sprite.style.backgroundPosition=(oldIndex%4)*100/3+'% '+Math.floor(oldIndex/4)*50+'%';
    } else if (gearIndex>=0) {
      sprite.classList.add('gear-art');
      sprite.style.backgroundPosition=gearIndex*25+'% 50%';
    }
    sprite.setAttribute('aria-hidden','true');
    return sprite;
  }
  function createOrUpdate(event) {
    event.preventDefault();
    const name=$('profile-name').value.trim().slice(0,18);
    const advantage=$('profile-element').value, weakness=$('profile-weakness').value;
    if (name.length<2) {$('profile-error').textContent='Escolha um nome com pelo menos duas letras.';return;}
    if (advantage===weakness) {$('profile-error').textContent='Escolha elementos diferentes para vantagem e desvantagem.';return;}
    const editing=$('profile-form').dataset.editId;
    if (editing) {
      const profile=profiles.find(entry=>entry.id===editing);
      if (!profile) return;
      profile.name=name;profile.advantage=advantage;profile.weakness=weakness;profile.needsElements=false;
      persist();activate(profile.id);
    } else {
      if (profiles.length>=2) return;
      const className=$('profile-form').querySelector('input[name=profile-class]:checked').value;
      const profile=freshProfile(name,className,advantage,weakness);
      profiles.push(profile);persist();activate(profile.id);
    }
  }
  function weapon() {return item(gear.weapon)||null;}
  function armorDefense(kind) {
    const field=kind==='physical'?'physicalDefense':'magicalDefense';
    return Object.entries(gear).filter(([slot])=>slot!=='weapon')
      .reduce((total,[,id])=>total+(item(id)?.[field]||0),0);
  }
  function closeWindow() {$('window-backdrop').hidden=true;}
  function refreshWindow(render) {
    const content=$('window-content'),scroll=content.scrollTop;
    render();
    content.scrollTop=scroll;
  }
  function showWindow(section) {
    if (state.room!==0||!active) return;
    const titles={market:'Mercado',bag:'Bolsa',skills:'Skills',defense:'Defesa',slots:'Atalhos',portal:'Portal da Hunt'};
    if (!titles[section]) return;
    $('window-title').textContent=titles[section];
    $('window-backdrop').hidden=false;
    if (section==='market') renderMarket();
    if (section==='bag') renderBag();
    if (section==='skills'||section==='defense') renderPoints(section);
    if (section==='slots') renderSlots();
    if (section==='portal') renderPortal();
    $('window-content').scrollTop=0;
  }
  function itemDescription(entry) {
    if (entry.category==='weapon') {
      const mixed=entry.physical&&entry.magical?'físico + mágico':entry.physical?'físico':'mágico';
      return (entry.type==='physical'?'Arma física':'Arma mágica')+' · '+ELEMENTS[entry.element].name+
        ' · Dano '+mixed+': '+(entry.physical||0)+' / '+(entry.magical||0)+' · Magias: futuras';
    }
    return GEAR_SLOTS[itemSlot(entry)]+' · Defesa física '+(entry.physicalDefense||0)+' · Defesa mágica '+(entry.magicalDefense||0);
  }
  function itemComparison(entry) {
    const signed=value=>value>=0?'+'+value:String(value);
    if (entry.category==='weapon') {
      const current=item(gear.weapon),oldF=current?.physical||0,oldM=current?.magical||0;
      const newF=entry.physical||0,newM=entry.magical||0;
      return 'Arma atual '+oldF+'/'+oldM+' → '+newF+'/'+newM+
        ' · diferença F '+signed(newF-oldF)+' / M '+signed(newM-oldM);
    }
    const current=item(gear[itemSlot(entry)]),oldF=current?.physicalDefense||0,oldM=current?.magicalDefense||0;
    const newF=entry.physicalDefense||0,newM=entry.magicalDefense||0;
    return 'Defesa no slot '+oldF+'/'+oldM+' → '+newF+'/'+newM+
      ' · diferença F '+signed(newF-oldF)+' / M '+signed(newM-oldM);
  }
  function makeCard(titleText,description,buttonText,onClick,disabled=false,spriteId=null,comparison='') {
    const card=document.createElement('article');card.className='item-card';
    if (spriteId) card.append(makeItemSprite(spriteId));
    const element=item(spriteId)?.element;
    if (element) {const emblem=makeElementIcon(element);emblem.classList.add('card-element');card.append(emblem);}
    const title=document.createElement('strong');title.textContent=titleText;
    const detail=document.createElement('p');detail.textContent=description;
    const button=document.createElement('button');button.textContent=buttonText;button.disabled=disabled;
    button.onclick=onClick;
    card.append(title,detail);
    if (comparison) {
      const compare=document.createElement('small');compare.className='item-compare';
      compare.textContent=comparison;card.append(compare);
    }
    card.append(button);
    return card;
  }
  function renderMarket() {
    const content=$('window-content');content.replaceChildren();
    const intro=document.createElement('p');intro.className='window-intro';
    intro.textContent='Suprimentos e equipamentos básicos. Equipamentos raros virão de drops de criaturas.';
    const quantityLine=document.createElement('label');quantityLine.className='market-quantity';
    quantityLine.textContent='Quantidade para comprar ou vender ';
    const quantity=document.createElement('input');quantity.type='number';quantity.min='1';quantity.max='99';quantity.value=String(marketQuantity);
    quantity.oninput=()=>{marketQuantity=Math.max(1,Math.min(99,Math.floor(Number(quantity.value)||1)));};
    quantityLine.append(quantity);
    const amount=()=>Math.max(1,Math.min(99,Math.floor(Number(quantity.value)||1)));
    const heading=document.createElement('h3');heading.className='market-heading';heading.textContent='COMPRAR';
    const grid=document.createElement('div');grid.className='item-grid';
    const vocation=state.className==='mage'?'magical':'physical';
    const basics=new Set(['blade','staff','vest','cloak','buckler','trousers','hood','boots','pendant']);
    for (const entry of ITEMS.filter(value=>basics.has(value.id)&&(value.category!=='weapon'||value.type===vocation)))
      grid.append(makeCard(entry.name,itemDescription(entry),
      'COMPRAR · '+entry.price+' GOLD cada',()=>{
        const count=amount();if(state.gold<entry.price*count) {hooks.label('Gold insuficiente para '+count+' equipamentos.');return;}
        state.gold-=entry.price*count;inventory[entry.id]=(inventory[entry.id]||0)+count;owned.add(entry.id);
        save();hooks.updateUI();refreshWindow(renderMarket);
      },state.gold<entry.price,entry.id,itemComparison(entry)));
    for (const potion of Object.values(POTIONS)) grid.append(makeCard(potion.name,
      'Restaura 35% de '+(potion.resource==='hp'?'vida':'mana')+'. Na barra, você define o percentual para uso automático.',
      'COMPRAR · '+potion.price+' GOLD cada',()=>{
        const count=amount();if(state.gold<potion.price*count) {hooks.label('Gold insuficiente para '+count+' poções.');return;}
        state.gold-=potion.price*count;potions[potion.id]+=count;
        save();hooks.updateUI();renderHotbar();refreshWindow(renderMarket);
      },state.gold<potion.price,potion.id));
    const sellHeading=document.createElement('h3');sellHeading.className='market-heading';sellHeading.textContent='VENDER';
    const sellGrid=document.createElement('div');sellGrid.className='item-grid';
    for(const entry of ITEMS.filter(value=>owned.has(value.id))) {
      const value=Math.max(1,Math.floor(entry.price*.5));
      sellGrid.append(makeCard(entry.name,itemDescription(entry)+' · '+inventory[entry.id]+' na bolsa',
        'VENDER · +'+value+' GOLD cada',()=>{
        const count=Math.min(amount(),inventory[entry.id]||0);if(!count)return;
        inventory[entry.id]-=count;
        if(!inventory[entry.id]) {delete inventory[entry.id];owned.delete(entry.id);
          const slot=itemSlot(entry);if(gear[slot]===entry.id) gear[slot]=null;}
        state.gold+=value*count;save();hooks.updateUI();refreshWindow(renderMarket);
      },false,entry.id));
    }
    for(const potion of Object.values(POTIONS)) {
      const value=Math.max(1,Math.floor(potion.price*.5));
      sellGrid.append(makeCard(potion.name,potions[potion.id]+' na bolsa · '+value+' gold por unidade',
        'VENDER · +'+value+' GOLD cada',()=>{
          const count=Math.min(amount(),potions[potion.id]);if(!count)return;
          potions[potion.id]-=count;state.gold+=count*value;
          save();hooks.updateUI();renderHotbar();refreshWindow(renderMarket);
        },potions[potion.id]<1,potion.id));
    }
    content.append(intro,quantityLine,heading,grid,sellHeading,sellGrid);
  }
  function renderSkillList() {
    const content=$('window-content');
      const heading=document.createElement('h3');heading.className='skill-list-title';
      heading.textContent='Técnicas do '+(state.className==='mage'?'Mago':'Guerreiro');
      const list=document.createElement('div');list.className='skill-list';
      for(const technique of HERO_SKILLS[state.className]) {
        const row=document.createElement('article');row.className='skill-entry';
        row.style.setProperty('--skill-color',technique.color);
        const icon=makeSkillIcon(technique);icon.classList.add('skill-entry-icon');
        const copy=document.createElement('div');
        const name=document.createElement('strong');name.textContent=technique.name+' · +'+technique.bonus;
        const description=document.createElement('small');description.textContent=technique.description;
        const cost=document.createElement('em');cost.textContent=technique.mana+' mana · '+(technique.cooldown/1000).toFixed(1)+' s';
        copy.append(name,description,cost);row.append(icon,copy);list.append(row);
      }
      const action=document.createElement('button');action.className='wide-action';action.textContent='ORGANIZAR ATALHOS';
      action.onclick=()=>showWindow('slots');
      content.append(heading,list,action);
  }
  function renderBag() {
    const content=$('window-content');content.replaceChildren();
    const layout=document.createElement('div');layout.className='bag-layout';
    const paperdoll=document.createElement('section');paperdoll.className='paperdoll';
    const heading=document.createElement('h3');heading.textContent='EQUIPAMENTO';
    const portrait=document.createElement('span');portrait.className='paperdoll-hero '+state.className;
    portrait.setAttribute('aria-hidden','true');
    const slotGrid=document.createElement('div');slotGrid.className='gear-grid';
    for (const [slot,label] of Object.entries(GEAR_SLOTS)) {
      const button=document.createElement('button');button.className='gear-slot';
      const equipped=item(gear[slot]);
      const sprite=equipped?makeItemSprite(equipped.id):document.createElement('span');
      if (!equipped) {sprite.className='empty-gear-icon';sprite.textContent='+';}
      const name=document.createElement('span');name.className='gear-slot-name';
      name.textContent=equipped?equipped.name:label;
      button.title=equipped?'Retirar '+equipped.name:label+' vazio';
      button.setAttribute('aria-label',button.title);
      button.append(sprite,name);
      if (equipped) button.onclick=()=>{gear[slot]=null;save();hooks.updateUI();refreshWindow(renderBag);};
      else button.disabled=true;
      slotGrid.append(button);
    }
    paperdoll.append(heading,portrait,slotGrid);
    const inventoryPanel=document.createElement('section');inventoryPanel.className='bag-inventory';
    const inventoryHeading=document.createElement('h3');inventoryHeading.textContent='BOLSA';
    const help=document.createElement('p');help.className='window-intro';
    help.textContent='Escolha um item para equipar. Toque em um slot preenchido para retirar.';
    const grid=document.createElement('div');grid.className='item-grid';
    for (const entry of ITEMS.filter(value=>owned.has(value.id))) {
      const slot=itemSlot(entry),equipped=gear[slot]===entry.id;
      const compatible=entry.category!=='weapon'||entry.type===(state.className==='mage'?'magical':'physical');
      grid.append(makeCard(entry.name+' ×'+(inventory[entry.id]||1),itemDescription(entry),!compatible?'OUTRA VOCAÇÃO':equipped?'EQUIPADO':'EQUIPAR',()=>{
        if (!compatible) return;
        gear[slot]=entry.id;save();hooks.updateUI();refreshWindow(renderBag);
      },equipped||!compatible,entry.id,itemComparison(entry)));
    }
    const potionRow=document.createElement('div');potionRow.className='potion-row';
    for (const potion of Object.values(POTIONS)) {
      const badge=document.createElement('div');badge.className='potion-badge';
      const copy=document.createElement('span');copy.textContent=potion.name+' · '+potions[potion.id];
      badge.append(makeItemSprite(potion.id),copy);potionRow.append(badge);
    }
    const shortcuts=document.createElement('button');shortcuts.className='wide-action';
    shortcuts.textContent='CONFIGURAR 10 ATALHOS E PERCENTUAIS';
    shortcuts.onclick=()=>showWindow('slots');
    inventoryPanel.append(inventoryHeading,help);
    if (grid.childElementCount) inventoryPanel.append(grid);
    else {const empty=document.createElement('p');empty.className='window-intro';empty.textContent='A bolsa ainda não tem equipamentos. Visite o Mercado.';inventoryPanel.append(empty);}
    inventoryPanel.append(potionRow,shortcuts);
    layout.append(paperdoll,inventoryPanel);content.append(layout);
  }
  function renderPortal() {
    const content=$('window-content');content.replaceChildren();
    const intro=document.createElement('p');intro.className='window-intro';
    intro.textContent='Escolha uma sala de 1 a 200. O portal abre na primeira sala da dezena: escolher 100 leva à 91; escolher 200 leva à 191.';
    const panel=document.createElement('div');panel.className='portal-panel';
    const label=document.createElement('label');label.textContent='SALA DESEJADA';
    const input=document.createElement('input');input.type='number';input.min='1';input.max='200';input.step='1';
    input.inputMode='numeric';input.value='1';
    const preview=document.createElement('strong');preview.className='portal-preview';
    const action=document.createElement('button');action.className='wide-action';
    const update=()=>{
      const target=Number(input.value),valid=Number.isInteger(target)&&target>=1&&target<=200;
      const entry=valid?Math.floor((target-1)/10)*10+1:1;
      preview.textContent=valid?'Entrada na sala '+entry+' · avance até a '+target:
        'Escolha uma sala entre 1 e 200.';
      action.disabled=!valid;
      action.textContent=valid?'ENTRAR NA SALA '+entry:'ESCOLHA UMA SALA';
    };
    input.oninput=update;
    action.onclick=()=>{if (!action.disabled) hooks.portalToRoom(Number(input.value));};
    label.append(input);panel.append(label,preview,action);
    const quick=document.createElement('div');quick.className='portal-grid';
    for (let start=1;start<=191;start+=10) {
      const end=start+9,button=document.createElement('button');
      button.textContent=start+'–'+end;
      button.title='Entrada na sala '+start;
      button.onclick=()=>{input.value=String(end);update();};
      quick.append(button);
    }
    update();content.append(intro,panel,quick);
  }
  function renderPoints(section) {
    const skill=section==='skills',available=skill?state.skillPoints:state.defensePoints;
    const content=$('window-content');content.replaceChildren();
    const intro=document.createElement('p');intro.className='window-intro';
    intro.textContent='Pontos disponíveis: '+available+'. Cada nível concede 1 ponto para alocar.';
    const grid=document.createElement('div');grid.className='point-grid';
    const choices=skill
      ? [{key:'physicalSkill',title:'Skill física',description:'+1 ao ataque físico.'},{key:'magicalSkill',title:'Skill mágica',description:'+1 ao ataque mágico.'}]
      : [{key:'physicalDefense',title:'Defesa física',description:'Reduz em 1 o dano físico recebido.'},{key:'magicalDefense',title:'Defesa mágica',description:'Reduz em 1 o dano mágico recebido.'}];
    for (const choice of choices) grid.append(makeCard(choice.title+' · '+state[choice.key],choice.description,'ALOCAR +1',()=>{
      if (!(skill?state.skillPoints:state.defensePoints)) return;
      state[choice.key]++;
      if (skill) state.skillPoints--; else state.defensePoints--;
      save();hooks.updateUI();refreshWindow(()=>renderPoints(section));
    },!available));
    content.append(intro,grid);
    if(skill) {
      renderSkillList();
      const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
      const used=state.skillResets?.day===today()?state.skillResets.count:0;
      const invested=state.physicalSkill+state.magicalSkill;
      const reset=document.createElement('button');reset.className='wide-action reset-skill';
      reset.textContent='REALOCAR PONTOS · 5.000 GOLD · '+(3-used)+'/3 HOJE';
      reset.disabled=used>=3||state.gold<5000||invested===0;
      reset.onclick=()=>{
        const day=today(),count=state.skillResets?.day===day?state.skillResets.count:0;
        if(count>=3||state.gold<5000||state.physicalSkill+state.magicalSkill===0)return;
        state.gold-=5000;state.skillPoints+=state.physicalSkill+state.magicalSkill;
        state.physicalSkill=0;state.magicalSkill=0;state.skillResets={day,count:count+1};
        save();hooks.updateUI();refreshWindow(()=>renderPoints(section));
        hooks.label('Pontos de Skill devolvidos. Distribua-os novamente.');
      };
      content.append(reset);
    }
  }
  function renderSlots() {
    const content=$('window-content');content.replaceChildren();
    const intro=document.createElement('p');intro.className='window-intro';
    intro.textContent='Poções e skills são usadas automaticamente na ordem dos slots, da esquerda para a direita. Você também pode ativá-las pelo botão ou pelas teclas 1–0.';
    const grid=document.createElement('div');grid.className='slot-config-grid';
    hotbar.forEach((slot,index)=>{
      const card=document.createElement('article');card.className='slot-config-card';
      const title=document.createElement('strong');title.textContent='SLOT '+(index+1);
      const select=document.createElement('select');
      for (const [value,text] of [['','Vazio'],['health','Poção de vida'],['mana','Poção de mana'],
        ...HERO_SKILLS[state.className].map(skill=>['skill:'+skill.id,skill.name+' · +'+skill.bonus])]) {
        const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);
      }
      select.value=slot.skillId?'skill:'+slot.skillId:slot.itemId||'';
      select.onchange=()=>{slot.skillId=select.value.startsWith('skill:')?select.value.slice(6):null;
        slot.itemId=POTIONS[select.value]?select.value:null;save();renderHotbar();refreshWindow(renderSlots);};
      const skill=skillFor(state.className,slot.skillId);
      const detail=document.createElement('small');detail.className='slot-skill-detail';
      detail.textContent=skill?skill.description+' · '+skill.mana+' mana · '+(skill.cooldown/1000).toFixed(1)+' s':'';
      const threshold=document.createElement('label');threshold.className='threshold-label';
      const titlePercent=document.createElement('span');titlePercent.textContent='Usar com '+slot.threshold+'% ou menos';
      const slider=document.createElement('input');slider.type='range';slider.min='1';slider.max='99';slider.value=slot.threshold;
      slider.disabled=!slot.itemId;
      slider.oninput=()=>{slot.threshold=Number(slider.value);titlePercent.textContent='Usar com '+slot.threshold+'% ou menos';renderHotbar();};
      slider.onchange=()=>save();
      threshold.append(titlePercent,slider);
      threshold.hidden=!slot.itemId;
      card.append(title,select,detail,threshold);grid.append(card);
    });
    content.append(intro,grid);
  }
  function renderHotbar() {
    const host=$('hotbar');host.replaceChildren();
    hotbar.forEach((slot,index)=>{
      const button=document.createElement('button');button.className='hotbar-slot';
      const potion=POTIONS[slot.itemId],skill=skillFor(state.className,slot.skillId);
      const key=document.createElement('small');key.textContent=index===9?'0':String(index+1);
      const icon=potion?makeItemSprite(potion.id):skill?makeSkillIcon(skill):document.createElement('strong');
      if (!potion&&!skill) icon.textContent='+';
      const count=document.createElement('span');count.textContent=potion?String(potions[potion.id]):'';
      const threshold=document.createElement('em');threshold.textContent=potion?slot.threshold+'%':skill?skill.mana+' MP':'';
      if(skill) {button.classList.add('skill-slot');button.dataset.skill=skill.id;
        button.style.setProperty('--skill-color',skill.color);}
      button.append(key,icon,count,threshold);
      button.title=skill?skill.name+' · +'+skill.bonus+' dano · '+skill.mana+' mana · '+(skill.cooldown/1000).toFixed(1)+' s':
        potion?potion.name+' · automático em '+slot.threshold+'%':'Slot vazio · configure na cidade';
      button.setAttribute('aria-label',button.title);
      button.onclick=()=>state.room===0?showWindow('slots'):useSlot(index,false);
      host.append(button);
    });
  }
  function useSlot(index,automatic=false) {
    const slot=hotbar[index],potion=POTIONS[slot?.itemId];
    if(slot?.skillId) return hooks.castSkill(slot.skillId,automatic);
    if (!potion||!active||potions[potion.id]<=0||state.hp<=0) return false;
    const now=performance.now();
    if (now-lastPotionAt<900) return false;
    const value=potion.resource==='hp'?state.hp:state.mana;
    const maximum=potion.resource==='hp'?state.maxHp:state.maxMana;
    if (value>=maximum) return false;
    if (automatic && value/maximum*100>slot.threshold) return false;
    const restored=Math.max(1,Math.round(maximum*potion.restore));
    if (potion.resource==='hp') state.hp=Math.min(state.maxHp,state.hp+restored);
    else state.mana=Math.min(state.maxMana,state.mana+restored);
    potions[potion.id]--;lastPotionAt=now;
    hooks.label(potion.name+' usada: +'+restored+' '+(potion.resource==='hp'?'vida':'mana')+'.');
    hooks.updateUI();renderHotbar();save();soundFx('potion');
    return true;
  }
  function autoUseHotbar() {
    if (!active||state.room===0||state.mode==='recover') return;
    for (let index=0;index<10;index++) if (useSlot(index,true)) break;
  }
  function soundFx(kind) {
    if (!soundOn||!audio) return;
    const oscillator=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;
    oscillator.type=kind==='hurt'?'sawtooth':'triangle';
    oscillator.frequency.setValueAtTime(kind==='hurt'?180:kind==='win'?500:kind==='potion'?630:330,now);
    oscillator.frequency.exponentialRampToValueAtTime(kind==='hurt'?90:kind==='win'?740:kind==='potion'?840:190,now+.16);
    gain.gain.setValueAtTime(.025,now);gain.gain.exponentialRampToValueAtTime(.0001,now+.2);
    oscillator.connect(gain).connect(audio.destination);oscillator.start(now);oscillator.stop(now+.21);
  }
  $('sound').onclick=()=>{
    soundOn=!soundOn;
    $('sound').classList.toggle('active',soundOn);
    $('sound').setAttribute('aria-label',soundOn?'Desativar música':'Ativar música');
    if (soundOn) {audio ||=new (window.AudioContext||window.webkitAudioContext)();audio.resume();}
  };
  setInterval(()=>{
    if (!soundOn||!audio) return;
    const oscillator=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;
    const melody=[220,261.63,329.63,392,329.63,261.63];
    oscillator.type='sine';oscillator.frequency.value=melody[note++%melody.length];
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(.018,now+.07);
    gain.gain.exponentialRampToValueAtTime(.0001,now+1.1);
    oscillator.connect(gain).connect(audio.destination);oscillator.start(now);oscillator.stop(now+1.12);
  },1400);
  document.querySelectorAll('[data-window]').forEach(button=>button.onclick=()=>showWindow(button.dataset.window));
  $('window-close').onclick=closeWindow;
  $('window-backdrop').addEventListener('click',event=>{if(event.target===$('window-backdrop')) closeWindow();});
  $('new-profile').onclick=()=>openForm();
  $('cancel-profile').onclick=closeForm;
  $('profile-form').onsubmit=createOrUpdate;
  $('profile-element').onchange=updateElementPreviews;
  $('profile-weakness').onchange=updateElementPreviews;
  $('switch-character').onclick=leaveProfile;
  loadProfiles();renderProfiles();
  return {save,weapon,armorDefense,renderHotbar,showWindow,closeWindow,useSlot,autoUseHotbar,soundFx};
}
