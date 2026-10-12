# Eco dos Seis

Jogo 2D para navegador e celular. Abra `index.html` no navegador. A interface, as janelas da cidade e os dez atalhos ficam no mesmo palco, sem rolagem da página.

## Personagens

Na tela de entrada, crie até dois personagens com nome, classe (Guerreiro ou Mago), elemento de vantagem e elemento de desvantagem. A seleção mostra as sprites de cada classe e emblemas ilustrados dos elementos. Cada herói tem seu próprio nível, gold, equipamentos, poções e atalhos. Um save da versão anterior é migrado como **Viajante**; na primeira seleção, escolha seus elementos.

Os elementos disponíveis são água, fogo, terra e ar. Quando o elemento do herói ou de sua arma corresponde à fraqueza do monstro, o golpe recebe 10% de bônus. Um monstro cujo elemento corresponde à desvantagem do herói também causa 10% a mais de dano.

## Combate e progressão

- **RUN RIGHT** inicia a jornada; o personagem caminha e ataca automaticamente. Espada e cajado têm quatro poses próprias de ataque; o golpe ocorre no quadro de impacto.
- Segure **◀**, **A** ou **←** para voltar pelas salas até a cidade.
- **REPETIR** faz o personagem caminhar à esquerda após vencer e enfrentar a sala novamente.
- As teclas **1–9** e **0** usam os dez slots de atalhos.

Os dois heróis começam com 100 de vida e 100 de mana. A cada nível, ganham +1 de ataque físico, +1 de ataque mágico, 1 ponto de Skill e 1 ponto de Defesa. O Guerreiro recebe +10 de vida e +5 de mana; o Mago recebe +6 de vida e +7 de mana. Os pontos são distribuídos nas janelas **Skills** e **Defesa** da cidade.

O dano do herói usa apenas seus atributos, pontos de Skill e dano da arma equipada. Cada monstro possui ataque físico e mágico; as respectivas defesas do herói e da armadura reduzem cada parte do golpe. Cada criatura derrotada derruba gold, mostrado como moedas que voam até o herói. As salas 1–3 de cada dezena têm criaturas mais fracas. Há 100 salas e minibosses a cada 20. Morrer leva à sala 1. Após vencer a sala 100, o herói passa a repetir a sala 99.

## Cidade e atalhos

O **Mercado** vende armas, equipamentos e poções. A **Bolsa** mostra o personagem e sete slots: arma principal, escudo, calças, peitoral, cabeça, botas e colar. Toque em um item da bolsa para equipá-lo ou em um slot preenchido para retirá-lo. A Bolsa também abre a configuração dos dez atalhos. Cada arma registra tipo físico ou mágico, elemento, dano físico e mágico, e uma lista de magias reservada para expansão futura. As poções podem ser colocadas nos atalhos, usadas manualmente ou ativadas automaticamente no percentual de vida ou mana definido em cada slot. Cada poção restaura 35% do recurso correspondente.

O progresso é salvo no `localStorage` do navegador. A música pode ser ativada pelo botão **♫**.

## Organização

- `src/main.js`: movimento, animações, combate, elementos, drops e salas.
- `src/meta.js`: personagens, cidade, equipamentos, poções, slots, salvamento e áudio.
- `src/style.css`: interface responsiva de uma tela.
- `public/assets/backgrounds/`: cenários.
- `public/assets/sprites/`: quadros de caminhada e ataque dos heróis, atlas das dez criaturas, ícones de itens e emblemas elementais.
