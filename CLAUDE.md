# CTB Virtual

Site interativo que explica as resoluções do CONTRAN e o Código de Trânsito Brasileiro sobre um carro 3D. O usuário escolhe um assunto (ex.: Películas) e vê no carro onde cada regra se aplica; tocando numa zona, abre a explicação completa.

**Rumo atual (12/11/2026): site 100% voltado a concurseiros, com foco no concurso da PRF; freemium (Vidros 960, Placas 969 e Iluminação 970 grátis; restante pago).** O plano, as decisões em aberto e o registro de decisões estão em **`PLANO.md`**: leia antes de mudar funcionalidades, conteúdo ou textos, e registre lá cada decisão nova. Público majoritariamente no celular: **mobile first**.

## Comandos

```bash
npm run dev                  # servidor de desenvolvimento
npm run typecheck            # tsc --noEmit
npm run lint                 # ESLint (next/core-web-vitals)
npm run verificar:citacoes   # confere o texto literal das normas e a consistência do conteúdo
npm run build
```

Rode `typecheck`, `lint` e `verificar:citacoes` antes de cada commit que mexa em conteúdo ou tipos.

## Navegação

Hierarquia: **Tema → Assunto → Zona**. A combinação Assunto × Zona é uma **Ficha**.

| Estado | URL | Carro | Painel |
|---|---|---|---|
| 0. Início | `/` | vista geral; dica "Escolha um assunto no menu ou toque em uma parte do veículo" | introdução (fatos dos editais, temas grátis/pagos, lista de espera); o × a fecha e fica lembrado no navegador, e a dica no carro reabre |
| Resolução | `/vidros` | vista geral | página da resolução: ficha técnica, por que cai, mapa da norma (cada artigo → assunto), alcance, linha do tempo, letra da lei |
| 1. Assunto | `/vidros/peliculas` | zonas coloridas por status, botões com o resumo curto em todas (assunto sem peça, como Medição, deixa a vista geral) | aula em abas: Resumo · Teoria · Lei · Questões |
| 2. Ficha | `/vidros/peliculas/para-brisa` | câmera voa à zona; demais botões esmaecidos, mas clicáveis | ficha completa; abas para outros assuntos da mesma zona |
| 3. Peça sem assunto | `/vidros/para-brisa` | botões com os assuntos daquela peça | resumo da peça |

- Implementação: `src/lib/navegacao.ts` (estado ↔ URL, `estadoPai`, `assuntosDaPeca`, metadados). O casco (`src/components/app/AppShell.tsx`: menu, carro, painel) fica no **layout raiz**, para o carro 3D não ser recarregado entre rotas; ele lê a URL com `usePathname()`. As páginas em `src/app/[tema]/[slug]/...` só validam o endereço (404) e geram título/descrição. `/[tema]/[slug]` é assunto ou peça conforme o slug (ids de assunto e de zona nunca coincidem). Todas as rotas são estáticas (`generateStaticParams`).
- Veículo por assunto: `Assunto.veiculo` (`'automovel'` padrão, `'caminhao'` ou `'caminhao-trator'`, este sem uso hoje). O caminhão só aparece nos assuntos com regra própria para pesados (hoje: Danos: ônibus, micro-ônibus e caminhões); ao escolher outro assunto, o palco volta ao automóvel com a transição. A peça sem assunto (estado 3) é sempre do automóvel; no caminhão, só as zonas do assunto respondem ao toque.
- Caminho principal: menu (assunto) → botões no carro → painel. O toque direto no carro (estado 3) é o caminho alternativo; ambos levam à mesma ficha.
- Esc e o link "voltar" do painel sobem um nível (2 → 1 → resolução → 0; 3 → 0); o × fecha tudo (→ 0). O "voltar" do navegador segue o histórico. Cada estado tem URL própria e compartilhável.
- Compartilhamento e buscadores: `src/lib/metadados.ts` (título, descrição, canônico, Open Graph, cartão do X), `src/lib/imagemPrevia.tsx` (imagem de prévia 1200×630 com o destaque da regra, nas fontes Barlow lidas de `@fontsource` no build) e um `opengraph-image.tsx` por rota; `src/app/sitemap.ts` e `robots.ts`. Tudo é gerado no build. **Em produção, defina `NEXT_PUBLIC_SITE_URL`** (ex.: `https://ctbvirtual.com.br`); sem ela, os links absolutos usam o domínio de produção da Vercel ou `http://localhost:3000` (`src/lib/site.ts`).
- Painel: resolução = `PaginaDaResolucao` (`src/components/panel/Aula.tsx`); estado 1 = aula em abas (a aba volta para Resumo a cada navegação; no celular, trocar de aba sobe o painel para o meio); estado 2 = ficha em rolagem única (abas com os outros assuntos da mesma peça e link para a aula); estado 3 = assuntos da peça. Blocos reaproveitados em `src/components/panel/Blocos.tsx`.
- Desktop: menu à esquerda, carro no centro, painel à direita (`camera.setViewOffset` para o carro não ficar atrás do painel).
  - Menu recolhível: botão no canto do menu; recolhido, uma aba "Menu" na borda esquerda do palco reabre. Lembrado no navegador (`ctbvirtual_menu_recolhido`).
  - Painel com largura ajustável: alça na borda esquerda (arrastar; clique duplo ou setas do teclado). De 360 px até deixar 320 px para o carro. Um clique no palco sem arrastar (até 6 px) volta ao padrão de 440 px; girar o carro não recolhe. A largura vai para `areaCoberta.direita`.
- Celular (≤ 860 px, `QUERY_CELULAR` em `src/lib/useMediaQuery.ts`): cabeçalho compacto numa linha (marca, selo PRF, menu), barra de assuntos fixa embaixo e gaveta com o menu completo. O painel é um bottom sheet arrastável (`src/components/panel/usePainelArrastavel.ts`) com três níveis: baixo (assunto e peça abrem assim, para o mapa do carro aparecer), meio (a ficha abre assim) e alto; arrasto rápido muda um nível, toque na alça alterna. A altura do painel vai para o `CarStage` (`areaCoberta.baixo`), que desloca a vista para o carro ficar centrado acima dele. Marcadores em uma linha só. Toque ≥ 44px. Botões no carro com até 12 caracteres e no máximo 5 zonas por vez.

## Conteúdo único (PRF) e acesso

Um só conteúdo, para o candidato da PRF (o modo motorista foi removido em 12/11/2026). **Todo conteúdo segue o padrão da seção 3.4 do `PLANO.md`**: página da resolução, assunto como aula, ficha curta por peça.

- **Página da resolução** (`Tema.pagina`, ex.: `src/data/temas/vidros/pagina.ts`): ficha técnica, por que cai, alcance, mapa (`ItemMapa.artigos`), linha do tempo e dispositivos.
- **Aula do assunto** (`Assunto.aula`), em abas:
  - Resumo: onde se aplica, destaque, em resumo, pode / não pode, revisão rápida (`aula.revisao`);
  - Teoria: `aula.teoria` (tópicos; textos aceitam `**negrito**`), itens visuais (`aula.visuais`: `tabela`, `linhaDoTempo`, `mapaDanos`, `calculadoraVC`), pontos de prova (`prova`), na fiscalização, conexões;
  - Lei: letra da lei, infração e penalidade, fontes;
  - Questões: `aula.questoes` (Certo/Errado, +1/−1, gabarito comentado com dispositivos).
- **Ficha** (assunto × peça): destaque, em resumo, pode / não pode, pontos de prova, letra da lei, na fiscalização, infração, link para a aula.
- `npm run verificar:citacoes` cobra o mínimo: assunto publicado tem aula com teoria, pelo menos 1 visual, 5 frases de revisão e 5 questões; e o mapa da página cobre **todos** os artigos da norma principal (linhas `Art. N` do texto oficial).

- `Tema.acesso` / `TemaFuturo.acesso`: `'gratis' | 'pago'`. Hoje só marca a interface (selos "Grátis" / "Completo"). Antes de cobrar, o conteúdo pago precisa vir do servidor (ver `PLANO.md`).
- Lista de espera: `src/components/panel/ListaDeEspera.tsx` → `POST /api/lista-espera` → Firestore, coleção `lista_espera` (id = SHA-256 do e-mail, sem duplicados), via Firebase Admin em `src/lib/servidor/firebase.ts`. `firestore.rules` nega todo acesso pelo navegador. Variáveis só no servidor: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (ver `.env.example`). Sem elas: em dev só registra no console; em produção responde 503.
- Site independente: nunca usar marca, brasão ou nome da PRF/banca como se fosse oficial.

## Conteúdo (`src/data/`)

```
src/types/conteudo.ts          tipos: Tema, Assunto, Zona, Ficha, Dispositivo, Infracao
src/data/conteudo.ts           índice, consultas (obterFicha, fichasDaZona...) e validarConteudo()
src/data/normas/normas.ts      normas (Res. 960, Res. 989, CTB)
src/data/normas/dispositivos.ts  TEXTO LITERAL de cada artigo/inciso citado (cadastrado uma única vez)
src/data/normas/infracoes.ts   infrações do CTB (natureza, pontos, valor, medida)
src/data/zonas.ts              zonas do carro, malha 3D e enquadramento de câmera
src/data/temas/vidros/         página da Res. 960 (pagina.ts) e assuntos: peliculas, danos, danosPesados (caminhão), seguranca, inscricoes, medicao
```

Regras do conteúdo jurídico:
- Fichas **nunca** copiam texto de lei: apontam para ids de `dispositivos.ts`.
- `texto` de um dispositivo é cópia exata do publicado. `npm run verificar:citacoes` confere contra `docs/normas/res960.txt` e `res989.txt` (extraídos dos PDFs com `pdftotext -layout`) e `docs/normas/ctb.txt`.
- CTB: `docs/normas/ctb-planalto.html` é a página compilada do Planalto salva pelo navegador (o Planalto bloqueia acesso automatizado a partir da nuvem). `tools/normas/extrair-ctb.py` gera `ctb.txt` descartando os trechos riscados (redações revogadas). Para atualizar: salvar de novo a página, rodar o extrator e `npm run verificar:citacoes`.
- Dispositivos com `fonte: null` ficam **pendentes de conferência** (sem cópia oficial no repositório) e não devem ser publicados.
- Não afirmar nada que não esteja no texto. Omissões e ambiguidades da norma vão em `prova.atencao`, sem resolver por conta própria.
- Redação alterada: a antiga continua cadastrada com `revogadoPor` (usada no histórico).
- Rodapé obrigatório: "Conteúdo informativo. Não substitui o texto publicado no Diário Oficial da União."

Fatos já conferidos com o texto oficial (Res. 960/2022, Res. 989/2022 e CTB compilado em `docs/normas/`):
- Art. 4º, I: mínimo de 70% para para-brisa e demais áreas indispensáveis à dirigibilidade (§ 1º: para-brisa, com exclusões de serigrafia, degradê e faixa de 20 cm em pesados; laterais dianteiras).
- Art. 4º, II (redação da 989, em vigor desde 02/01/2023): demais vidros podem ficar abaixo de 70%, sem piso, com retrovisores externos dos dois lados. Redação original: mínimo de 28%. § 2º: vigia segue o inciso II. § 3º: vidros do teto fora dos limites.
- Art. 8º: película não refletiva permitida no conjunto vidro-película; chancela obrigatória nas áreas indispensáveis (§§ 1º e 2º).
- Art. 10: vedadas película refletiva (I) e bolhas na área crítica e áreas indispensáveis (II).
- Arts. 13 a 16: danos no para-brisa (trincas e fraturas circulares); zero dano e sem reparo na área crítica e na faixa de 2,5 cm; área crítica dos automóveis = metade esquerda da região de varredura das palhetas (art. 16), e dos pesados = retângulo 50 × 40 cm no eixo do volante (art. 15); demais veículos 2 danos (10 cm / Ø 4 cm); ônibus, micro-ônibus e caminhões 3 danos (20 cm / Ø 4 cm).
- Art. 19, § 1º: VC = MR + 7%.
- Art. 21: película → CTB 230, XVI (III, "a" a "d"); dano no para-brisa → CTB 230, XVIII (V, "a"); material publicitário no para-brisa ou vigia → CTB 230, XV (II).
- CTB, art. 111 (caput: "É vedado, nas áreas envidraçadas do veículo:"), III e parágrafo único.
- CTB, art. 230, XV, XVI, XVII e XVIII: grave (sanção comum aos incisos VII a XIX), multa e retenção do veículo para regularização; R$ 195,23 (art. 258, II); 5 pontos (art. 259, II).

## Modelo 3D

- `public/models/carro.glb`: sedã (~420 KB, texturas 512px). Nós: `carroceria`, `oticas`, `vidros`, `parabrisa`, `roda*`. Frente para +X, Y para cima, chão em y = 0.
- O arquivo já vem pronto, sem montagem no navegador (`tools/modelos/`):
  - `repintar_carro.py`: a textura original é amarela (parecida com o destaque dos vidros); só os pixels amarelos viram prata `#c3cad3`, preservando o sombreado (grade, frisos e cromados ficam como estão).
  - `preparar_carro.py`: divide os vidros em `vidros-dianteiros` (centro do triângulo em X > −0,32, coluna B), `vigia` (atrás da coluna B, normal predominante em X) e `vidros-traseiros` (normal predominante em Z), e cria o teto solar `teto` (o modelo não tem teto de vidro): raios verticais medem o teto e um painel acompanha a curvatura, na metade dianteira da parte plana; o ponto do marcador vai em `extras.ancora`.
  - Antes isso era feito a cada carregamento e travava a página (~700 ms só a repintura). Os scripts não fazem nada se rodados de novo.
- `public/models/caminhao.glb`: caminhão de carga com carroceria de madeira (3 eixos, cabine branca), ~250 mil triângulos, comprimido com meshopt (~1,7 MB; o `GLTFLoader` usa o `MeshoptDecoder`). Vem pronto de `tools/modelos/preparar_caminhao.mjs`: marcas e antena removidas; materiais (cabine branca, carroceria de madeira, faróis claros, piscas âmbar, faixas refletivas brancas); simplificação e normais com vincos; placas Mercosul na frente e atrás (imagem de `tools/modelos/gerar_placa.mjs`, com o desenho de `src/lib/placaMercosul.ts`, 400 × 130 mm); para-choque fechado e rebaixo oval da grade tampado; frente para +X, centrado, rodas no chão; vidros divididos em `parabrisa`, `vidros-dianteiros` e `vidros-cabine`. No site, `three/caminhao.ts` só passa os vidros para metros (as posições do arquivo são quantizadas) e calcula o plano do para-brisa. Escala em metros, a mesma do sedã. Mapa de danos de pesado com as medidas reais do vidro (área crítica 40 × 50 cm a 55 cm da borda do motorista; coincide com o volante do modelo). Vista geral, enquadramento do para-brisa, distância máxima da câmera e recuo no celular próprios (`Carro.vista`, `enquadrar`, `distanciaMaxima`, `recuoCelular`).
- `public/models/cavalo-mecanico.glb` (`three/caminhaoTrator.ts`, veículo `'caminhao-trator'`): caminhão-trator guardado para uso futuro; nenhum assunto o usa hoje.
- `tools/blender/`: scripts de recorte do pacote original (Blender 4.x, `blender -b --python ...`); ajustar caminhos de entrada.
- Cena: asfalto com faixa tracejada amarela, sol alto com sombra suave e sombra de contato sob o carro. Só o chão recebe sombra. OrbitControls sem pan, distância e ângulo polar limitados.

## Carro 3D (`src/components/canvas/`)

O `CarStage` não conhece assuntos: recebe dados genéricos e só desenha.

| Prop | Uso |
|---|---|
| `pinturas` | status por zona → cor do vidro (`src/data/status.ts`) e legenda |
| `marcadores` | um card por zona com o resumo curto (estado 1/2), ligado ao vidro pela linha animada do nó (`nodes/Marcadores.tsx`). Disposição em `nodes/disposicao.ts`: testa ~180 posições em volta do ponto (acima, diagonais, laterais) e escolhe a de menor custo (distância, ficar sobre a silhueta do carro, cobrir o ponto de outra zona, linha atravessar card ou cruzar outra linha, estabilidade entre quadros); depois refina (cada card revê a posição conhecendo os outros) e compara algumas ordens de escolha. **Regra rígida: cards nunca se tocam**; também nas posições exibidas durante o movimento (`separarCards`), e sem lugar livre o card some. A linha chega pelo lado do card voltado para o ponto. Custo: ~0,8 ms por quadro, as ordens alternativas só a cada 15 quadros e nada com a câmera parada. Esmaece quando a zona está atrás da carroceria (raio a cada 8 quadros, acelerado por BVH: `three/raios.ts`, árvores montadas aos poucos em momentos ociosos; sem elas o teste é pulado, porque no caminhão custava ~50 ms e piorava o INP); a legenda vai para o pé da área livre no celular |
| `no` | nó com ramos animados saindo de uma zona, um botão por item (estado 3). `geometria.sortear`: 1 item acima do ponto; 2+ alternando esquerda/direita, empilhados sem se tocar (passo cobre o sorteio e o vai-e-vem). No celular, arranjo compacto (botões de 168 px em duas colunas, linhas retas, vai-e-vem horizontal menor). A cada quadro o grupo é deslocado para dentro do palco se o ponto estiver perto da borda (as linhas continuam saindo do vidro) |
| `zonaFocada` | câmera voa ao enquadramento da zona (`ZONAS[z].camera`; no celular, mesmo alvo e câmera 1,35× mais distante); `null` volta à vista geral |
| `areaCoberta` | px cobertos pelo painel (direita no desktop, embaixo no celular): a vista é deslocada para a área livre e marcadores fora dela somem |
| `mostrarMapaDanos` | textura de danos no para-brisa; toques no para-brisa passam a ser classificados em área crítica, faixa periférica ou demais áreas |
| `onToqueZona` | toque num vidro, já convertido em `ZonaId` |
| `veiculo` | `'automovel'`, `'caminhao'` ou `'caminhao-trator'`. Ao mudar, troca animada (1,5 s), em sequência: o veículo atual segue pela estrada e some, depois o outro chega por trás e para no centro (sem os dois semitransparentes ao mesmo tempo; transparência com escrita de profundidade, sem "raio-X"). A câmera voa ao enquadramento do novo no mesmo tempo e curva da chegada; as sombras (sol e contato) somem durante o movimento; vidros, cores e mapa de danos do novo aparecem junto com ele. Marcadores, nó, legenda e dica do assunto novo só aparecem quando o veículo chega (`veiculoExibido`); enquanto o outro carrega, o atual fica neutro. O segundo veículo é carregado em segundo plano 1,5 s depois do primeiro |

Módulos: `three/cena.ts` (renderer, luzes, chão; resolução e sombra menores no celular), `three/carro.ts` (carrega o GLB com progresso, divide os vidros, calcula âncoras), `three/mapaDanos.ts` (textura e classificação; a faixa periférica segue o contorno real da malha).

Para-brisa: `src/lib/paraBrisa.ts` tem a geometria em medidas reais (sedã: vidro 1,42 × 0,92 m, mais estreito no alto, palhetas de 60 e 48 cm; caminhão: 2,3 × 0,95 m, área crítica 40 × 50 cm na linha de centro do volante) e os símbolos de trinca e fratura. `src/lib/pintarMapaDanos.ts` é o pintor único: desenha a textura do 3D e o diagrama 2D da aba Teoria (`panel/WindshieldDamageDiagram.tsx`, canvas em vista de fora, motorista à direita, sem volante), com as mesmas cores (vidro escuro, amarelo nas demais áreas, vermelho hachurado na área crítica, faixa vermelha de 2,5 cm em escala). Linhas tracejadas só nos pesados (linha de centro e topo do volante); no automóvel, sem contorno da varredura nem eixo. Nos automóveis, a área crítica é a **metade esquerda da região varrida** (art. 16), não o lado esquerdo inteiro do vidro: os cantos fora da varredura são demais áreas (exceto a faixa de 2,5 cm). O toque no 3D usa a mesma função (`naAreaCriticaAutomovel`). Pinturas valem por peça; subzonas (`subzonaDe`) são representadas pelo mapa de danos.

O `AppShell` traduz o estado da URL para essas props.

## Licenças e créditos (obrigatório)

- Modelo 3D: "Generic passenger car pack", de Comrade1280 (https://sketchfab.com/3d-models/generic-passenger-car-pack-20f9af9b8a404d5cb022ac6fe87f21f5), licença **CC BY 4.0**, recortado e adaptado. Crédito com link para autor e licença visível no site.
- Caminhão (`public/models/caminhao.glb`, crédito nas fontes e no rodapé do menu): "FORD CARGO MAX TRUCK 2428e - RICK MODDING", de Rick_modding (https://skfb.ly/pCvqD), licença **CC BY 4.0**, adaptado: inscrições da marca e do modelo removidas, cores trocadas, malha simplificada (`tools/modelos/`).
- Caminhão-trator guardado (`public/models/cavalo-mecanico.glb`, sem uso hoje): "low poly DAF xf105", de Alvin.Woodly (https://skfb.ly/oEIBZ), licença **CC BY 4.0**, adaptado: letras da marca removidas. Se voltar a ser exibido, dar o crédito como o do sedã.
- Não usar modelos de carros reais/de marca nem modelos com licença de uso pessoal. Exceções registradas no `PLANO.md`: os dois caminhões acima, sem as inscrições da marca.

## Identidade visual

- Tema claro com acento amarelo de sinalização: `--sign: #eab308; --sign-text: #854d0e;`.
- Tokens: `--asphalt: #f1f5f9` (fundo), `--asphalt-2: #ffffff` (superfícies), `--asphalt-3: #cbd5e1` (bordas), `--paint: #0f172a` (texto), `--muted: #475569`, `--ok: #15803d`, `--bad: #dc2626`.
- Fontes: Barlow Condensed (títulos), Barlow (texto), Source Serif 4 (citações da norma), IBM Plex Mono (números).
- Zero emojis na interface: só ícones `lucide-react` ou texto.

## Plano de etapas

0. ~~Preparação: documentação, ESLint~~ (feito)
1. ~~Modelo de dados, dispositivos literais, conteúdo de Películas e Danos, verificação de citações~~ (feito)
2. ~~Carro 3D: separar vigia; zonas clicáveis no para-brisa (Danos); colorir zonas por status; dividir `CarStage.tsx`; sombra menor no celular; progresso de carregamento~~ (feito)
3. ~~Navegação: rotas, estados da tabela acima, painel com visão geral do assunto, ficha e peça; remoção do modelo antigo~~ (feito)
4. ~~Layout mobile: barra inferior, bottom sheet arrastável, cabeçalho compacto~~ (feito)
5. Quadro-resumo de dispositivos por assunto (histórico, atenção e letra da lei já entraram na etapa 3).
6. ~~Open Graph, imagem de prévia por rota, sitemap e robots~~ (feito)

Depois: seguir o roteiro de lançamento do `PLANO.md` (seção 8). Todo conteúdo novo segue o padrão da seção 3.4 do `PLANO.md` (página da resolução, assunto como aula, ficha curta por peça).
