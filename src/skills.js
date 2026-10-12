// O bônus é fixo; o ataque da arma, nível e atributo continuam no golpe base.
const CLASS_INFO={
  warrior:{name:'Guerreiro',role:'Espada e escudo',type:'physical',weapons:['sword'],hp:10,mana:5,color:'#e8c389'},
  mage:{name:'Mago',role:'Magia arcana',type:'magical',weapons:['staff'],hp:6,mana:7,color:'#c8b7f4'},
  professor:{name:'Professor',role:'Livros e fórmulas',type:'magical',weapons:['book'],hp:6,mana:8,color:'#a9c7f4',atlas:0},
  druid:{name:'Druida',role:'Cajado e natureza',type:'magical',weapons:['staff'],hp:8,mana:7,color:'#a8d39c',atlas:1},
  assassin:{name:'Assassino',role:'Adagas e sombras',type:'physical',weapons:['dagger'],hp:7,mana:6,color:'#c5aae9',atlas:2},
  bard:{name:'Bardo',role:'Música e magia',type:'hybrid',weapons:['instrument'],hp:8,mana:7,color:'#efb5b8',atlas:3},
  thief:{name:'Ladrão',role:'Adagas e truques',type:'physical',weapons:['dagger'],hp:8,mana:6,color:'#e4c080',atlas:4},
  barbarian:{name:'Bárbaro',role:'Machado e fúria',type:'physical',weapons:['axe'],hp:12,mana:4,color:'#e6a083',atlas:5},
  lancer:{name:'Lanceiro',role:'Alcance e investida',type:'physical',weapons:['spear'],hp:10,mana:5,color:'#9ad8ce',atlas:6},
  alchemist:{name:'Alquimista',role:'Frascos e reações',type:'magical',weapons:['flask'],hp:7,mana:8,color:'#b9dda5',atlas:7},
  monk:{name:'Monge',role:'Manoplas e combos',type:'physical',weapons:['gauntlet'],hp:9,mana:6,color:'#c8c3ef',atlas:8},
  summoner:{name:'Invocador',role:'Grimório e espectros',type:'magical',weapons:['grimoire'],hp:6,mana:9,color:'#bfa8ec',atlas:9},
  archer:{name:'Atirador',role:'Arco e mobilidade',type:'physical',weapons:['bow'],hp:8,mana:6,color:'#b9d5a1',atlas:10}
};
const HERO_SKILLS = {
  warrior: [
    {id:'phantom-return',name:'Travessia do Herói',icon:'➶',bonus:8,mana:12,cooldown:4500,range:700,color:'#e8d5a6',kind:'traverse',description:'Cruza a fileira de monstros e retorna ao ponto de origem.'},
    {id:'shield-charge',name:'Aríete do Escudo',icon:'⬟',bonus:12,mana:14,cooldown:5300,range:130,color:'#b6d4ce',kind:'shield',status:'slow',description:'Golpe de escudo que empurra um inimigo para trás.'},
    {id:'blade-whirl',name:'Giro de Aço',icon:'✺',bonus:16,mana:19,cooldown:6400,range:135,color:'#f2d9a1',kind:'whirl',description:'Pivô e corte circular no inimigo mais próximo.'},
    {id:'ground-split',name:'Fenda do Guardião',icon:'◆',bonus:23,mana:25,cooldown:8300,range:165,color:'#d8b28a',kind:'quake',status:'slow',description:'Espada no chão; a fissura sobe sob o alvo.'},
    {id:'heroic-comet',name:'Cometa do Aventureiro',icon:'✦',bonus:32,mana:34,cooldown:12000,range:215,color:'#ffedb6',kind:'comet',description:'Salto e queda com um impacto luminoso.'}
  ],
  mage: [
    {id:'arcane-power',name:'Poder Arcano',icon:'◈',bonus:8,mana:10,cooldown:3200,range:315,color:'#cdbdff',kind:'orb',description:'Condensa energia neutra em uma esfera pulsante.'},
    {id:'arcane-storm',name:'Tempestade Arcana',icon:'✺',bonus:13,mana:17,cooldown:5500,range:340,color:'#bab8fb',kind:'storm',description:'Três descargas arcanas giram sobre o alvo.'},
    {id:'mortal-paralysis',name:'Paralisia Mortal',icon:'⬡',bonus:17,mana:21,cooldown:7000,range:330,color:'#d7b8f0',kind:'paralysis',status:'paralyze',description:'Selo cinzento que imobiliza o inimigo.'},
    {id:'arcane-wall',name:'Muralha Arcana',icon:'▥',bonus:22,mana:26,cooldown:10000,range:280,color:'#a8d9ed',kind:'wall',description:'Ergue uma barreira protetora e lança um pulso.'},
    {id:'arcane-breath',name:'Sopro Arcano',icon:'➶',bonus:31,mana:33,cooldown:11500,range:390,color:'#e8d9ff',kind:'breath',status:'blind',description:'Exala uma onda larga de energia arcana.'}
  ],
  professor:[
    {id:'ink-quill',name:'Pena de Tinta Viva',bonus:8,mana:10,cooldown:3000,range:340,color:'#b6c6f0',kind:'orb',description:'Uma pena espectral escreve o impacto no ar.'},
    {id:'margin-sigil',name:'Nota de Rodapé',bonus:12,mana:16,cooldown:4800,range:350,color:'#d5bded',kind:'paralysis',status:'slow',description:'Marca o alvo com um glifo que desacelera.'},
    {id:'page-storm',name:'Temporal de Páginas',bonus:17,mana:22,cooldown:6500,range:365,color:'#e9d8ac',kind:'storm',description:'Páginas encantadas cercam e cortam o alvo.'},
    {id:'theorem',name:'Teorema Irrefutável',bonus:23,mana:28,cooldown:8500,range:380,color:'#aacfea',kind:'wall',status:'paralyze',description:'Uma equação luminosa trava o inimigo.'},
    {id:'final-chapter',name:'Capítulo Final',bonus:34,mana:38,cooldown:12000,range:410,color:'#f8e5ba',kind:'breath',description:'O livro abre um grande selo de conhecimento.'}
  ],
  druid:[
    {id:'seed-star',name:'Semente Estelar',bonus:8,mana:10,cooldown:3100,range:315,color:'#bce5a6',kind:'orb',description:'Uma semente brilhante explode em folhas.'},
    {id:'briar-bind',name:'Abraço de Espinhos',bonus:13,mana:17,cooldown:5300,range:330,color:'#9bc996',kind:'paralysis',status:'paralyze',description:'Cipós prendem os pés do alvo.'},
    {id:'moss-ward',name:'Círculo de Musgo',bonus:17,mana:22,cooldown:7400,range:300,color:'#b7d8a4',kind:'wall',description:'Um círculo vivo protege o druida por um instante.'},
    {id:'wild-bloom',name:'Florescer Selvagem',bonus:23,mana:28,cooldown:9000,range:355,color:'#e5bdc7',kind:'storm',description:'Pétalas e espinhos giram ao redor do inimigo.'},
    {id:'ancient-grove',name:'Bosque Ancestral',bonus:34,mana:38,cooldown:12500,range:390,color:'#c6dfa8',kind:'quake',status:'slow',description:'Raízes antigas erguem a terra sob o alvo.'}
  ],
  assassin:[
    {id:'shade-cut',name:'Corte da Sombra',bonus:8,mana:9,cooldown:3000,range:145,color:'#cbb2ed',kind:'whirl',description:'Dois cortes em um único passo.'},
    {id:'backstep',name:'Passo Fantasma',bonus:12,mana:14,cooldown:4900,range:190,color:'#aaa5dc',kind:'traverse',description:'Cruza o alvo e reaparece onde começou.'},
    {id:'venom-edge',name:'Lâmina de Veneno',bonus:17,mana:20,cooldown:6500,range:150,color:'#a7d18d',kind:'shield',status:'poison',description:'Adaga envenenada num golpe preciso.'},
    {id:'night-fall',name:'Queda Noturna',bonus:24,mana:27,cooldown:8800,range:205,color:'#d8b8eb',kind:'comet',status:'blind',description:'Salta por cima do alvo e cai com as duas lâminas.'},
    {id:'silent-finale',name:'Silêncio Final',bonus:35,mana:37,cooldown:12500,range:210,color:'#eee0fa',kind:'breath',description:'Uma sequência veloz de sombras e estocadas.'}
  ],
  bard:[
    {id:'first-chord',name:'Primeiro Acorde',bonus:8,mana:10,cooldown:2900,range:285,color:'#f1c9a4',kind:'orb',description:'Nota dourada que vibra ao atingir.'},
    {id:'syncopation',name:'Síncope',bonus:13,mana:16,cooldown:5000,range:285,color:'#d9c0f0',kind:'paralysis',status:'slow',description:'Ritmo quebrado atrasa o passo do inimigo.'},
    {id:'crescendo',name:'Crescendo',bonus:18,mana:23,cooldown:7000,range:320,color:'#f3b6bd',kind:'storm',description:'Três notas crescentes convergem no alvo.'},
    {id:'refrain',name:'Refrão Protetor',bonus:23,mana:28,cooldown:9200,range:300,color:'#b6dee4',kind:'wall',description:'A melodia ergue um escudo sonoro.'},
    {id:'grand-finale',name:'Grande Finale',bonus:34,mana:39,cooldown:12500,range:360,color:'#f4dbad',kind:'breath',description:'Uma onda de acordes preenche a arena.'}
  ],
  thief:[
    {id:'quick-swipe',name:'Mão Ligeira',bonus:8,mana:9,cooldown:2800,range:140,color:'#e5c38f',kind:'whirl',description:'Ataque curto antes de um passo evasivo.'},
    {id:'feint',name:'Finta da Raposa',bonus:12,mana:15,cooldown:4800,range:170,color:'#c9d0a4',kind:'shield',status:'blind',description:'Distrai o alvo e golpeia por baixo.'},
    {id:'pocket-sand',name:'Areia nos Olhos',bonus:17,mana:21,cooldown:6500,range:210,color:'#ead0a0',kind:'paralysis',status:'blind',description:'Uma nuvem de areia desorienta o inimigo.'},
    {id:'coin-rain',name:'Chuva de Moedas',bonus:22,mana:26,cooldown:8500,range:245,color:'#f2d88f',kind:'storm',description:'Moedas cortantes ricocheteiam no alvo.'},
    {id:'last-trick',name:'Último Truque',bonus:33,mana:36,cooldown:12000,range:250,color:'#f3e6bf',kind:'traverse',description:'Desaparece, atravessa a linha inimiga e retorna.'}
  ],
  barbarian:[
    {id:'axe-cleave',name:'Talho do Machado',bonus:9,mana:8,cooldown:3200,range:155,color:'#f3bd94',kind:'whirl',description:'Machado pesado em arco largo.'},
    {id:'war-cry',name:'Grito de Guerra',bonus:13,mana:14,cooldown:5000,range:180,color:'#eaa783',kind:'breath',status:'slow',description:'Rugido que abala o inimigo.'},
    {id:'shoulder-ram',name:'Ombro de Pedra',bonus:18,mana:19,cooldown:6700,range:160,color:'#d9b795',kind:'shield',status:'paralyze',description:'Investida de ombro que empurra para trás.'},
    {id:'earth-shaker',name:'Abala-Terra',bonus:25,mana:27,cooldown:9000,range:190,color:'#dcb991',kind:'quake',description:'O cabo do machado racha o solo.'},
    {id:'berserker-star',name:'Fúria do Titã',bonus:36,mana:36,cooldown:12500,range:220,color:'#ffc79b',kind:'comet',description:'Salto furioso seguido de uma queda devastadora.'}
  ],
  lancer:[
    {id:'piercing-thrust',name:'Estocada da Aurora',bonus:9,mana:9,cooldown:3100,range:190,color:'#a9e6dd',kind:'lunge',description:'Baixa o ombro e projeta a lança num golpe preciso.'},
    {id:'spear-vault',name:'Salto da Lança',bonus:14,mana:16,cooldown:5200,range:230,color:'#c0e9d5',kind:'comet',description:'Usa a haste como apoio e cai sobre o alvo.'},
    {id:'banner-sweep',name:'Arco da Bandeira',bonus:19,mana:22,cooldown:6800,range:195,color:'#d9e7aa',kind:'whirl',status:'slow',description:'Gira o corpo e varre o espaço à frente.'},
    {id:'pinning-point',name:'Ponta Implacável',bonus:25,mana:28,cooldown:9100,range:240,color:'#99d8db',kind:'paralysis',status:'paralyze',description:'Crava a ponta da lança e imobiliza o alvo.'},
    {id:'celestial-charge',name:'Investida Celeste',bonus:36,mana:38,cooldown:12500,range:430,color:'#f0edbf',kind:'traverse',description:'Atravessa a linha inimiga e retorna com um clarão.'}
  ],
  alchemist:[
    {id:'volatile-vial',name:'Frasco Volátil',bonus:8,mana:10,cooldown:3000,range:315,color:'#b7e8ac',kind:'orb',description:'Mistura e arremessa uma poção que estoura no impacto.'},
    {id:'caustic-mist',name:'Névoa Cáustica',bonus:13,mana:17,cooldown:5200,range:325,color:'#a9d9a0',kind:'breath',status:'poison',description:'Espalha vapores corrosivos ao redor do alvo.'},
    {id:'crystal-flask',name:'Frasco de Cristal',bonus:18,mana:23,cooldown:6900,range:330,color:'#b5e4dc',kind:'paralysis',status:'freeze',description:'Uma reação cristalina congela os passos inimigos.'},
    {id:'transmutation',name:'Círculo de Transmutação',bonus:24,mana:29,cooldown:9000,range:345,color:'#e7d39e',kind:'wall',description:'Desenha um círculo alquímico e ergue proteção.'},
    {id:'chain-reaction',name:'Reação em Cadeia',bonus:35,mana:39,cooldown:12500,range:390,color:'#e6c98e',kind:'storm',status:'burn',description:'Frascos ricocheteiam e detonam em sequência.'}
  ],
  monk:[
    {id:'open-palm',name:'Palma Serena',bonus:9,mana:9,cooldown:2900,range:145,color:'#dedcf1',kind:'lunge',description:'Gira a cintura e desfere uma palma concentrada.'},
    {id:'spiral-kick',name:'Chute Espiral',bonus:14,mana:15,cooldown:4800,range:160,color:'#c5bdf0',kind:'whirl',description:'Pivota sobre um pé e lança um chute giratório.'},
    {id:'stillness-seal',name:'Selo da Quietude',bonus:19,mana:22,cooldown:6900,range:175,color:'#b1d6df',kind:'paralysis',status:'paralyze',description:'Prende o alvo com um golpe em ponto vital.'},
    {id:'rising-fist',name:'Punho Ascendente',bonus:25,mana:28,cooldown:8700,range:180,color:'#e4c8aa',kind:'comet',description:'Agacha, salta e acerta um soco ascendente.'},
    {id:'hundred-palms',name:'Cem Palmas',bonus:36,mana:37,cooldown:12000,range:200,color:'#f0e0c2',kind:'storm',description:'Uma sequência acelerada culmina num impacto circular.'}
  ],
  summoner:[
    {id:'spectral-call',name:'Chamado Espectral',bonus:8,mana:11,cooldown:3100,range:330,color:'#cbbaf4',kind:'orb',description:'Abre o grimório e invoca uma garra espectral.'},
    {id:'echo-servant',name:'Servo do Eco',bonus:14,mana:18,cooldown:5400,range:345,color:'#b6c9ed',kind:'storm',description:'Três ecos invocados cercam o inimigo.'},
    {id:'binding-rune',name:'Runa de Vínculo',bonus:19,mana:24,cooldown:7100,range:350,color:'#dbc3f1',kind:'paralysis',status:'paralyze',description:'Uma marca prende a sombra do alvo.'},
    {id:'guardian-pact',name:'Pacto Guardião',bonus:24,mana:30,cooldown:9300,range:350,color:'#afc6e4',kind:'wall',description:'Um guardião espectral protege o invocador.'},
    {id:'eclipse-pact',name:'Pacto do Eclipse',bonus:36,mana:40,cooldown:13000,range:410,color:'#e2c9f7',kind:'eclipse',description:'A criatura assume forma colossal e golpeia o alvo.'}
  ],
  archer:[
    {id:'quick-arrow',name:'Flecha Veloz',bonus:9,mana:9,cooldown:2800,range:355,color:'#c8dda9',kind:'beam',description:'Puxa e solta a corda num só movimento.'},
    {id:'wind-step',name:'Passo do Vento',bonus:14,mana:16,cooldown:5000,range:375,color:'#c0e4d1',kind:'lunge',description:'Recuo ágil seguido de um tiro em diagonal.'},
    {id:'binding-arrow',name:'Flecha de Cipó',bonus:19,mana:22,cooldown:6900,range:380,color:'#b5d694',kind:'paralysis',status:'slow',description:'A flecha se abre em cipós ao atingir.'},
    {id:'moon-piercer',name:'Perfura-Lua',bonus:25,mana:28,cooldown:8800,range:410,color:'#d8e4c6',kind:'breath',description:'Um disparo carregado desenha um rastro luminoso.'},
    {id:'star-rain',name:'Chuva de Estrelas',bonus:36,mana:38,cooldown:12500,range:450,color:'#e7e7b6',kind:'storm',description:'Salta para trás e dispara uma chuva de flechas.'}
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
  ,traverse:'<path d="M5 30h38M9 20l7-9 7 9-7 9zM27 17l6-7 6 7-6 7M42 29l-7 7-7-7"/>',
  shield:'<path d="M24 5L39 11v12c0 10-7 16-15 21C16 39 9 33 9 23V11zM16 24h22M30 18l8 6-8 6"/>',
  whirl:'<path d="M8 30a17 17 0 1 0 3-16M7 12v9h9M16 34l17-17M31 13l6 1-1 6"/>',
  comet:'<path d="M7 8l18 17M10 19l15 6M25 25l12-17M25 25l18 3M25 25l-6 17M25 25l10 15"/><circle cx="25" cy="25" r="5"/>',
  storm:'<path d="M8 19c5-11 18-14 27-8M36 10l1 8-8-2M40 30c-5 11-18 14-27 8M12 38l-1-8 8 2M22 15l-4 12h7l-3 9 10-15h-7l3-6"/>',
  paralysis:'<path d="M24 5l15 9v20l-15 9L9 34V14zM24 5v38M9 14l30 20M39 14L9 34"/>',
  wall:'<path d="M7 40V15l8-8h18l8 8v25M7 40h34M16 13v23M24 9v27M32 13v23M11 28h26"/>',
  breath:'<path d="M6 16c11-10 15 10 27 0M6 24c15-9 18 9 36 0M6 33c11-8 18 8 30 0M36 12l7 12-7 12"/>'
};
function makeSkillIcon(skill) {
  const icon=document.createElement('span');icon.className='skill-art';
  icon.style.setProperty('--skill-color',skill.color);
  const initials=skill.name.split(' ').filter(word=>word.length>2).slice(0,2).map(word=>word[0]).join('').toUpperCase();
  icon.innerHTML='<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">'+
    '<circle class="skill-icon-ring" cx="24" cy="24" r="21"/>'+SKILL_ICON_ART[skill.kind]+
    '<text x="35" y="43" text-anchor="middle" class="skill-monogram">'+initials+'</text></svg>';
  return icon;
}
