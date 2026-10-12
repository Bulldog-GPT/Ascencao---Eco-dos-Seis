# Eco dos Seis

Jogo 2D para navegador e celular. Abra `index.html` no navegador. A interface, as janelas da cidade e os dez atalhos ficam no mesmo palco, sem rolagem da página.

## Personagens

Na tela de entrada, crie até dois personagens com nome, uma das treze vocações (Guerreiro, Mago, Professor, Druida, Assassino, Bardo, Ladrão, Bárbaro, Lanceiro, Alquimista, Monge, Invocador ou Atirador), elemento de vantagem e elemento de desvantagem. A seleção mostra a arte de cada classe e emblemas ilustrados dos elementos. Cada herói tem seu próprio nível, gold, equipamentos, poções e atalhos. As onze vocações adicionais usam folhas próprias de quatro quadros de caminhada e quatro de ataque em aquarela pixelada, armas iniciais próprias e cinco técnicas exclusivas cada. Um save da versão anterior é migrado como **Viajante**; na primeira seleção, escolha seus elementos.

Os elementos disponíveis são água, fogo, terra e ar. Quando o elemento do herói ou de sua arma corresponde à fraqueza do monstro, o golpe recebe 10% de bônus. Um monstro cujo elemento corresponde à desvantagem do herói também causa 10% a mais de dano.

## Combate e progressão

- **RUN RIGHT** inicia a jornada; o personagem caminha e ataca automaticamente. Espada e cajado usam poses de preparação, golpe e recuperação, com efeito visual no quadro do impacto.
- **RUN LEFT**, **A** ou **←** inicia o retorno automático. Na cidade, RUN LEFT leva ao Dragão Vermelho de nível 101.
- **MODO MANUAL** permite caçar com os botões de movimento e ataque. No teclado, use **A/D** ou **←/→** para andar e **Espaço** para atacar.
- No modo manual, o corpo dos monstros bloqueia a passagem. Os monstros surgem do lado oposto ao lado pelo qual o herói entra na sala.
- **RETORNAR CIDADE** leva o herói imediatamente à Vila do Amanhecer.
- **REPETIR** faz o personagem caminhar à esquerda após vencer e enfrentar a sala novamente.
- As teclas **1–9** e **0** usam os dez slots de atalhos.

Cada vocação possui cinco técnicas de combate próprias, com gesto do herói, efeito visual, custo de mana e recarga. O Guerreiro usa Travessia do Herói (cruza os monstros e retorna), Aríete do Escudo (empurra), Giro de Aço, Fenda do Guardião e Cometa do Aventureiro. O Mago usa Poder Arcano, Tempestade Arcana, Paralisia Mortal, Muralha Arcana (reduz dano recebido por 3,5 segundos) e Sopro Arcano. O bônus fixo da técnica soma ao ataque normal da arma, nível e atributo; o bônus elemental de 10% é aplicado ao total. A Travessia atinge os inimigos na trajetória; as outras técnicas selecionam um alvo. Os cinco atalhos iniciais aparecem nos slots 3 a 7 e podem ser trocados na cidade. Durante a caçada, a barra usa poções e skills automaticamente na ordem da esquerda para a direita. Os ícones das skills são desenhos vetoriais próprios.

As novas técnicas seguem a personalidade de cada vocação: o Professor usa penas, páginas e teoremas; o Druida invoca sementes, espinhos e raízes; o Assassino luta com passos furtivos e veneno; o Bardo usa acordes e escudos sonoros; o Ladrão combina fintas, areia e moedas; o Bárbaro usa talhos, gritos e impactos de machado. Cada classe tem uma cadência de ataque própria. O Bardo combina dano físico e mágico.

O Lanceiro usa estocadas, varreduras e investidas; o Alquimista lança frascos e reações; o Monge combina palmas e chutes; o Invocador projeta um guardião espectral; o Atirador dispara flechas à distância. Os heróis usam a mesma altura de desenho durante caminhada e ataque, reduzida para a tela de caça. A troca dos quadros de caminhada acompanha a distância percorrida, com os pés alinhados ao chão em cada folha.

Os heróis começam com 100 de vida e 100 de mana. A cada nível, ganham +1 de ataque físico, +1 de ataque mágico, 1 ponto de Skill e 1 ponto de Defesa. O ganho de vida/mana depende da vocação: Guerreiro +10/+5, Mago +6/+7, Professor +6/+8, Druida +8/+7, Assassino +7/+6, Bardo +8/+7, Ladrão +8/+6, Bárbaro +12/+4, Lanceiro +10/+5, Alquimista +7/+8, Monge +9/+6, Invocador +6/+9 e Atirador +8/+6. Os pontos são distribuídos nas janelas **Skills** e **Defesa** da cidade.

O dano do herói usa seus atributos, pontos de Skill e arma equipada. A espada atinge somente o monstro mais próximo. Monstros podem arrastar, empurrar, desacelerar com magia ou saltar para trás após atacar. Os efeitos incluem veneno, chamas, paralisia, congelamento, cegueira e lentidão, inclusive em monstros. Os possuídos têm 14% de chance de surgir, aura roxa e o dobro de vida e ataque. O ouro dos monstros comuns foi reduzido. Cada miniboss de sala e o Dragão Vermelho concedem exatamente 1 diamante por derrota. Morrer leva à sala 1. Após vencer a sala 200, o herói repete a sala 199.

A jornada tem seis contos: **Rei Ratão** (1–30), **Rei Frog** (31–60), **Monarca Lobão** (61–100), **Conde Vamp** (101–135), **Faraó Mum** (136–170) e **Draconiano** (171–200). Cada conto contém oito monstros ilustrados, duas cenas de caçada e uma arena de miniboss. Os minicontos narrativos serão escritos depois. O Dragão Vermelho é um encontro separado, a oeste da cidade.

## Cidade e atalhos

O **Mercado** vende somente equipamentos básicos e poções. Cada item tem quantidade própria, preço unitário e botões de compra e venda; o saldo de gold e diamantes fica visível no alto da janela. Uma mensagem animada confirma cada transação. A Bolsa guarda a quantidade de cada equipamento. Itens avançados ficam reservados para futuros drops de criaturas. A **Bolsa** mostra o personagem e sete slots: arma principal, escudo, calças, peitoral, cabeça, botas e colar. Toque em um item da bolsa para equipá-lo ou em um slot preenchido para retirá-lo. Cada arma registra tipo físico ou mágico, elemento, dano físico e mágico, e uma lista de magias reservada para expansão futura. As poções e skills podem ser colocadas nos atalhos pela própria barra na cidade. Cada poção restaura 35% do recurso correspondente. Na janela de Skills, realocar os pontos custa 5.000 gold e é permitido até 3 vezes por dia local.

O **Portal da Hunt** fica na cidade e oferece a primeira sala de cada conto (1, 31, 61, 101, 136 e 171). Cada destino é liberado somente após derrotar o miniboss do conto anterior. O painel da cidade fica no canto superior direito; as janelas abrem no alto e ao centro do palco. Uma placa apresenta cada sala; uma faixa destaca a vitória. O botão **OCULTAR PAINÉIS** deixa apenas a cena visível e pode ser usado novamente para restaurar a interface.

O progresso é salvo no `localStorage` do navegador. Na seleção de personagens, **RECOMEÇAR · APAGAR PERSONAGENS** apaga os heróis e o progresso deste navegador. A música pode ser ativada pelo botão **♫**.

## Organização

- `src/main.js`: movimento, animações, combate, elementos, drops e salas.
- `src/skills.js`: cinco técnicas de cada vocação, seus bônus, custos, recargas e descrições.
- `src/chapters.js`: faixas, cenários, nomes dos monstros e minibosses de cada conto.
- `src/sprite-bounds.js`: recortes visíveis e linha dos pés para posicionar as criaturas no chão.
- `src/meta.js`: personagens, cidade, equipamentos, poções, slots, salvamento e áudio.
- `src/style.css`: interface responsiva de uma tela.
- `public/assets/backgrounds/`: cenários.
- `public/assets/sprites/`: quadros de caminhada e ataque dos heróis, onze folhas de oito poses, efeitos pintados das treze vocações, atlas das 48 criaturas, seis minibosses e o Dragão Vermelho, ícones de itens e emblemas elementais.
