// O bônus é fixo; o ataque da arma, nível e atributo continuam no golpe base.
const HERO_SKILLS = {
  warrior: [
    {id:'dawn-cut',name:'Corte da Aurora',icon:'✺',bonus:7,mana:8,cooldown:2800,range:115,color:'#ffd392',kind:'arc',description:'Arco luminoso de espada. Um alvo.'},
    {id:'wind-lunge',name:'Estocada do Vento',icon:'➶',bonus:11,mana:12,cooldown:4200,range:165,color:'#b6e7dc',kind:'lunge',status:'slow',description:'Avança num rastro de vento e desacelera.'},
    {id:'rune-guard',name:'Ruptura Rúnica',icon:'⬡',bonus:15,mana:16,cooldown:5600,range:120,color:'#c4a7f3',kind:'rune',status:'paralyze',description:'Golpe de escudo com runas paralisantes.'},
    {id:'earth-break',name:'Quebra-Terra',icon:'◆',bonus:21,mana:23,cooldown:7600,range:140,color:'#e2bc89',kind:'quake',status:'slow',description:'Espada contra o chão; onda de pedra.'},
    {id:'hero-star',name:'Estrela do Herói',icon:'✦',bonus:30,mana:32,cooldown:11000,range:175,color:'#fff1b6',kind:'star',description:'Investida final com uma estrela dourada.'}
  ],
  mage: [
    {id:'dew-orb',name:'Orbe do Orvalho',icon:'◈',bonus:7,mana:8,cooldown:2800,range:300,color:'#9de7ef',kind:'orb',status:'freeze',description:'Projétil aquoso que pode congelar.'},
    {id:'ember-flower',name:'Flor de Brasa',icon:'✿',bonus:11,mana:12,cooldown:4200,range:300,color:'#ffab83',kind:'flower',status:'burn',description:'Pétalas ardentes em torno de um alvo.'},
    {id:'root-sigil',name:'Selo das Raízes',icon:'❈',bonus:15,mana:16,cooldown:5600,range:320,color:'#b9daa0',kind:'roots',status:'paralyze',description:'Glifo de raízes que prende o inimigo.'},
    {id:'prism-beam',name:'Raio Prismático',icon:'◇',bonus:21,mana:23,cooldown:7600,range:370,color:'#c7b3f6',kind:'beam',status:'blind',description:'Feixe colorido que pode cegar.'},
    {id:'moon-eclipse',name:'Eclipse Lunar',icon:'☾',bonus:30,mana:32,cooldown:11000,range:380,color:'#e6d2ff',kind:'eclipse',status:'slow',description:'Lua crescente e explosão de luz violeta.'}
  ]
};
const skillFor = (className,id) => HERO_SKILLS[className]?.find(skill=>skill.id===id);
const SKILL_ICON_ART={
  arc:'<path d="M9 33c7-16 18-22 31-20M10 34l8-2-6-6M30 12l7 3-2-8"/><path d="M12 39l27-27M34 10l5 2-2 5"/>',
  lunge:'<path d="M6 32c11-8 24-10 35-8M24 12l17 12-17 12M7 13l11 5M7 40l12-4"/><path d="M17 24h23"/>',
  rune:'<path d="M24 5l17 10v18L24 43 7 33V15zM24 11v27M12 18l12 7 12-7M13 31l11-6 11 6"/>',
  quake:'<path d="M5 35l10-11 6 6 9-17 13 22M5 39h38M24 5l-4 12 6 1-5 12"/>',
  star:'<path d="M24 4l4.7 14.7L44 24l-15.3 5.3L24 44l-4.7-14.7L4 24l15.3-5.3zM24 12v24M12 24h24"/>',
  orb:'<circle cx="24" cy="24" r="14"/><path d="M15 21c8-12 16-10 21-3M12 27c10 12 20 11 26 0M24 4v6M24 38v6"/>',
  flower:'<circle cx="24" cy="24" r="5"/><path d="M24 18c-11-13-14 2-5 5M29 22c12-9 14 8 3 7M26 29c2 16-13 15-10 3M17 26C3 31 6 14 18 18M30 16c4-12 15-5 9 5"/>',
  roots:'<path d="M24 6v21M24 15l-9-8M24 20l10-11M24 26l-15 9M24 26l15 9M24 27l-5 15M24 27l5 15M7 36l-3 5M41 36l3 5"/><circle cx="24" cy="24" r="4"/>',
  beam:'<path d="M8 24L24 5l16 19-16 19zM24 5v38M8 24h32M14 17l20 14M14 31l20-14"/><circle cx="24" cy="24" r="4"/>',
  eclipse:'<path d="M31 5a19 19 0 1 0 12 30A16 16 0 0 1 31 5zM10 9l2 3 3 1-3 2-2 3-2-3-3-2 3-1zM36 9l1 2 3 1-3 1-1 2-2-2-2-1 2-1z"/>'
};
function makeSkillIcon(skill) {
  const icon=document.createElement('span');icon.className='skill-art';
  icon.style.setProperty('--skill-color',skill.color);
  icon.innerHTML='<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">'+
    '<circle class="skill-icon-ring" cx="24" cy="24" r="21"/>'+SKILL_ICON_ART[skill.kind]+'</svg>';
  return icon;
}
