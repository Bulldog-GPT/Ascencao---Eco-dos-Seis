# Eco dos Seis

Jogo 2D para navegador e celular. Abra `index.html` no navegador. A interface, as janelas da cidade e os dez atalhos ficam no mesmo palco, sem rolagem da página.

## Personagens

Na tela de entrada, crie até dois personagens com nome, classe (Guerreiro ou Mago), elemento de vantagem e elemento de desvantagem. A seleção mostra as sprites de cada classe e emblemas ilustrados dos elementos. Cada herói tem seu próprio nível, gold, equipamentos, poções e atalhos. Um save da versão anterior é migrado como **Viajante**; na primeira seleção, escolha seus elementos.

Os elementos disponíveis são água, fogo, terra e ar. Quando o elemento do herói ou de sua arma corresponde à fraqueza do monstro, o golpe recebe 10% de bônus. Um monstro cujo elemento corresponde à desvantagem do herói também causa 10% a mais de dano.

## Combate e progressão

- **RUN RIGHT** inicia a jornada; o personagem caminha e ataca automaticamente. Espada e cajado usam poses de preparação, golpe e recuperação, com efeito visual no quadro do impacto.
- **RUN LEFT**, **A** ou **←** inicia o retorno automático. Na cidade, RUN LEFT leva ao Dragão Vermelho de nível 101.
- **MODO MANUAL** permite caçar com os botões de movimento e ataque. No teclado, use **A/D** ou **←/→** para andar e **Espaço** para atacar.
- No modo manual, o corpo dos monstros bloqueia a passagem. Os monstros surgem do lado oposto ao lado pelo qual o herói entra na sala.
- **RETORNAR CIDADE** leva o herói imediatamente à Vila do Amanhecer.
- **REPETIR** faz o personagem caminhar à esquerda após vencer e enfrentar a sala novamente.
- As teclas **1–9** e **0** usam os dez slots de atalhos.

Cada vocação possui cinco técnicas de combate próprias, com gesto do herói, efeito visual, custo de mana e recarga. O Guerreiro usa Corte da Aurora, Estocada do Vento, Ruptura Rúnica, Quebra-Terra e Estrela do Herói. O Mago usa Orbe do Orvalho, Flor de Brasa, Selo das Raízes, Raio Prismático e Eclipse Lunar. O bônus fixo da técnica soma ao ataque normal da arma, nível e atributo; o bônus elemental de 10% é aplicado ao total. Cada técnica atinge somente um alvo. Os cinco atalhos iniciais aparecem nos slots 3 a 7 e podem ser trocados na cidade. Durante a caçada, a barra usa poções e skills automaticamente na ordem da esquerda para a direita. Os ícones das skills são desenhos vetoriais próprios.

Os dois heróis começam com 100 de vida e 100 de mana. A cada nível, ganham +1 de ataque físico, +1 de ataque mágico, 1 ponto de Skill e 1 ponto de Defesa. O Guerreiro recebe +10 de vida e +5 de mana; o Mago recebe +6 de vida e +7 de mana. Os pontos são distribuídos nas janelas **Skills** e **Defesa** da cidade.

O dano do herói usa seus atributos, pontos de Skill e arma equipada. A espada atinge somente o monstro mais próximo. Monstros podem arrastar, empurrar, desacelerar com magia ou saltar para trás após atacar. Os efeitos incluem veneno, chamas, paralisia, congelamento, cegueira e lentidão, inclusive em monstros. Os possuídos têm 14% de chance de surgir, aura roxa e o dobro de vida e ataque. O ouro dos monstros comuns foi reduzido. Cada miniboss de sala e o Dragão Vermelho concedem exatamente 1 diamante por derrota. Morrer leva à sala 1. Após vencer a sala 200, o herói repete a sala 199.

A jornada tem seis contos: **Rei Ratão** (1–30), **Rei Frog** (31–60), **Monarca Lobão** (61–100), **Conde Vamp** (101–135), **Faraó Mum** (136–170) e **Draconiano** (171–200). Cada conto contém oito monstros ilustrados, duas cenas de caçada e uma arena de miniboss. Os minicontos narrativos serão escritos depois. O Dragão Vermelho é um encontro separado, a oeste da cidade.

## Cidade e atalhos

O **Mercado** vende somente equipamentos básicos e poções. É possível selecionar quantidades para comprar e vender; a Bolsa guarda a quantidade de cada equipamento. Itens avançados ficam reservados para futuros drops de criaturas. Mercado e Bolsa mostram a diferença entre cada item e o equipamento atual. A **Bolsa** mostra o personagem e sete slots: arma principal, escudo, calças, peitoral, cabeça, botas e colar. Toque em um item da bolsa para equipá-lo ou em um slot preenchido para retirá-lo. Cada arma registra tipo físico ou mágico, elemento, dano físico e mágico, e uma lista de magias reservada para expansão futura. As poções e skills podem ser colocadas nos atalhos pela própria barra na cidade. Cada poção restaura 35% do recurso correspondente. Na janela de Skills, realocar os pontos custa 5.000 gold e é permitido até 3 vezes por dia local.

O **Portal da Hunt** fica na cidade e aceita qualquer sala de 1 a 200. A entrada sempre começa na primeira sala da dezena escolhida: selecionar 90 abre a sala 81; selecionar 200 abre a 191. As janelas abrem no alto e ao centro do palco, rolando internamente quando necessário. Uma placa apresenta cada sala; uma faixa destaca a vitória. O botão **OCULTAR PAINÉIS** deixa apenas a cena visível e pode ser usado novamente para restaurar a interface.

O progresso é salvo no `localStorage` do navegador. A música pode ser ativada pelo botão **♫**.

## Organização

- `src/main.js`: movimento, animações, combate, elementos, drops e salas.
- `src/skills.js`: cinco técnicas de cada vocação, seus bônus, custos, recargas e descrições.
- `src/chapters.js`: faixas, cenários, nomes dos monstros e minibosses de cada conto.
- `src/sprite-bounds.js`: recortes visíveis e linha dos pés para posicionar as criaturas no chão.
- `src/meta.js`: personagens, cidade, equipamentos, poções, slots, salvamento e áudio.
- `src/style.css`: interface responsiva de uma tela.
- `public/assets/backgrounds/`: cenários.
- `public/assets/sprites/`: quadros de caminhada e ataque dos heróis, atlas das 48 criaturas, seis minibosses e o Dragão Vermelho, ícones de itens e emblemas elementais.
