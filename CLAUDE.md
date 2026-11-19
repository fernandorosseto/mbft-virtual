# MBFT Virtual

Site de **consulta** ao Manual Brasileiro de Fiscalização de Trânsito (MBFT, anexo da Res. CONTRAN nº 985/2022) para **agentes de fiscalização de trânsito**. A proposta é melhorar a leitura do PDF oficial: achar a ficha certa rápido, ler bem no celular e no computador, com o site leve.

Nasceu como cópia do CTB Virtual (site para concurseiros, com carro 3D); o 3D e o conteúdo de concurso foram removidos em 18/11/2026. Plano e registro de decisões em **`PLANO.md`**: leia antes de mudar funcionalidades ou textos, e registre lá cada decisão nova.

## Comandos

```bash
npm run dev         # servidor de desenvolvimento
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint (next/core-web-vitals)
npm run build
npm run verificar:dados  # confere fichas, temas, parte geral, desenhos, artigos do CTB e sinônimos
npm run test:e2e         # testes no navegador (Playwright) contra o build; sobe o servidor sozinho
```

Rode `typecheck`, `lint`, `verificar:dados` e `build` antes de cada commit (e `test:e2e` quando mexer em tela). O GitHub Actions roda tudo a cada envio (`.github/workflows/ci.yml`).

## Princípios

- **Leve:** páginas estáticas (`generateStaticParams`), quase nada de JavaScript no cliente, sem bibliotecas pesadas. Nada de 3D.
- **Celular e computador:** o agente consulta em campo, no celular; layout próprio para os dois (`QUERY_CELULAR` em `src/lib/useMediaQuery.ts`, ≤ 860 px). Toque ≥ 44 px.
- **Fiel ao texto:** o conteúdo vem do PDF oficial; não resumir nem reescrever as fichas por conta própria. Em caso de divergência, vale o texto publicado.

## Fontes (`docs/normas/`)

- `MBVT20222.pdf`: PDF oficial do MBFT.
- `mbft/parte-geral.json`: a Parte Geral (págs. 5 a 30) em seções e blocos (parágrafo, item com marcador, sigla), gerada do `mbft.txt` por `tools/normas/mbft/extrair_parte_geral.py`, que reconhece os títulos pelo sumário do manual. O texto por página do `mbft.json` não serve para isso: o pdfplumber cola palavras nas linhas justificadas.
- `mbft/mbft.json`: o MBFT convertido (parte geral por página e as 412 fichas, com os campos do PDF); `mbft/mbft.txt`: texto corrido para conferência. Formato e limitações em `docs/normas/mbft/README.md`; gerado por `tools/normas/mbft/extrair_mbft.py`.
- `ctb.txt`: CTB vigente, extraído de `ctb-planalto.html` (página compilada do Planalto salva pelo navegador) por `tools/normas/extrair-ctb.py`, descartando redações revogadas. Serve para mostrar o artigo citado no amparo legal.
- `ctb-artigos.json`: os 100 artigos do CTB citados nas fichas, em blocos (caput, inciso, alínea, parágrafo, sanção), gerado do `ctb.txt` por `tools/normas/extrair_artigos_ctb.py` (junta linhas quebradas, "Art." e "§" soltos).
- `contran-indice.json`: índice das resoluções do CONTRAN no DOU (nº 700 em diante), de `tools/normas/dou/coletar.py`. Liga as resoluções citadas nas fichas ao DOU (seção "Resoluções citadas").
- `mbft/figuras.json` e `public/figuras/`: desenhos das fichas recortados do PDF com a legenda colorida (WebP), por `tools/normas/mbft/extrair_figuras.py` (pdftohtml para as posições, pdftoppm para renderizar).
- `mbft/tabelas.json`: as 8 fichas com tabela no PDF (conferidas à mão; citar tabela de outra norma não conta). Decide o texto do link "Abrir na página N" no fim da ficha: com tabela, "A tabela desta ficha está no PDF oficial"; sem figura nem tabela, "Texto original no PDF oficial".
- `mbft/temas.json`: uma ou duas palavras de tema por ficha, escritas à mão com palavras da tipificação resumida, para os rótulos dos grafos (não substituem o texto da ficha).

## Estrutura

| Rota | Conteúdo |
|---|---|
| `/` | catálogo: fichas agrupadas por artigo do CTB, com busca no título e no texto completo, filtros (gravidade, infrator, competência, constatação) e modo mapa (`?q=`, `?g=`, `?i=`, `?c=`, `?a=`, `?ver=mapa` no endereço) |
| `/fichas/[codigo]` | ficha completa (ex.: `/fichas/552-50`), gerada no build para as 411 fichas; no topo, "Buscar nesta ficha" e "Ir para outra ficha ou tema" |
| `/busca.json` | índice gerado no build (fichas, palavras do texto completo, citações com o tipo, seções da parte geral); o navegador só baixa ao buscar (~80 KB compactado) |
| `/sw.js` | service worker do uso sem internet (gerado no build, sem bibliotecas): `/_next/static` cache primeiro; páginas rede primeiro com cópia salva (sem cópia: `/offline`); `/busca.json` cópia e atualização em segundo plano; pedidos RSC só rede (se falhar, o Next recarrega a página e ela sai do cache); "salvar-todas" baixa as fichas e os arquivos delas. Cache único `mbft-v1`, não apagado a cada versão |
| `/offline`, `/manifest.webmanifest` | página para página não salva sem internet; manifesto do site instalável (ícones em `public/icones/`, gerados do `icon.svg`) |
| `/parte-geral` | Parte Geral do manual numa página, com sumário (fixo ao lado no PC, recolhível no celular) e âncoras por seção (`#8-2`, `#infracoes-concorrentes`) |

```
src/lib/mbft.ts              lê docs/normas/mbft/mbft.json no build (server-only): Ficha, obterFicha, fichasPorArtigo, vizinhas, textoCompleto, citacoes (a cita b quando o texto de a traz o código de b), citacoesTipadas (com o tipo mais forte do par), conexoes, ligacoesDaFicha (itens que citam outras fichas, com o sentido: emVez = item do "quando não autuar"; tambem = "autuar também", "concomitantemente", "precedida pela lavratura", "lavrar outro auto"; referencia = o resto), categoriasDe (valores do PDF agrupados para os filtros: infrator em 4, competência por órgão citado, constatação em 3)
src/components/Catalogo.tsx  lista, busca e filtros (cliente; opções em OU dentro do grupo, E entre grupos; valem para lista, busca e mapa): primeiro título/código/amparo; com o índice, também o texto completo (resultados separados). Códigos, números e romanos casam a palavra inteira; o resto, pelo começo (src/lib/texto.ts)
src/lib/sinonimos.ts         termos do dia a dia → termos do manual (insulfilm → película); a busca usa os dois e o catálogo mostra o que usou
src/lib/busca.ts             busca comum ao catálogo e à ficha: termosDe, buscarFichas (título/amparo, depois texto), buscarSecoes, carregarIndice (baixa /busca.json uma vez)
src/components/BuscaNaFicha.tsx busca dentro da ficha, como o "Localizar" do navegador: marca as ocorrências com a CSS Custom Highlight API (sem mexer no HTML; sem suporte, seleciona a atual), sem diferenciar acentos; Enter/Shift+Enter andam; barra fixa no pé com ↑ ↓ ×. Fica de fora o que tem `data-fora-da-busca` e os rótulos do grafo
src/components/AtalhosFicha.tsx botão flutuante (canto inferior direito) com atalhos para as seções que a ficha tem (ícone: seta que segue em frente ou vira à direita, como nas placas, de `public/icones/seta-atalhos.png`, imagem sem fundo usada como máscara com a cor do botão; ids: enquadramento, quando-autuar, quando-nao-autuar, definicoes, exemplos, informacoes, conexoes, resolucoes, ctb) e "Voltar ao topo"; o próprio botão é uma gota de líquido (AnelTinta: corpo redondo e 7 pontas da mesma cor fundidas por filtro "metaball" — desfoque + corte do alfa — que empurram a borda em lugares e ritmos aleatórios; a ponta nunca se solta do corpo; escuro, amarelo com o menu aberto; anima só visível e sem prefers-reduced-motion); aparece depois de rolar, marca a seção atual, sobe quando a barra de ocorrências da busca na ficha está aberta (`data-barra-ocorrencias`)
src/components/IrPara.tsx    campo com sugestões: seções da parte geral que casam com o título primeiro, depois fichas; setas e Enter; "Ver todos os resultados no catálogo" (/?q=)
src/components/MapaBusca.tsx mapa da busca (cliente), estilo grafo do Obsidian: fichas encontradas (maiores) e fichas ligadas a elas por citação (menores, até 40 ou 20 se a busca trouxe 15+); tocar mostra um cartão com link
src/components/ConexoesFicha.tsx grafo local da ficha (posições calculadas no build, GrafoVivo no navegador): um grafo só na página, com a disposição larga (PC) e a estreita (celular, prop `celular` do GrafoVivo, escolhida pela largura da tela), e as ligações pelo sentido (LigacoesFicha)
src/components/LigacoesFicha.tsx ligações da ficha com a situação de cada uma (texto do item do PDF): "Não autue aqui, use" (quando não autuar), "Autue também" (pede outro auto), "Outras referências" e "Fichas que mandam para esta" (com o item de lá; 6 visíveis, o resto recolhido)
src/components/GrafoVivo.tsx grafo interativo no estilo do Obsidian (cliente, sem bibliotecas): física ao vivo (molas nas ligações, repulsão, colisão pelo rótulo; começa nas posições do servidor e se acomoda; só anima visível; para sozinha), arrastar bolinha puxa as ligadas, passar o mouse destaca a ficha e as vizinhas, zoom (botões, Ctrl + roda no quadro, roda e pinça em tela cheia) e arraste do fundo (mouse; toque só em tela cheia, para o dedo rolar a página), temas somem com zoom afastado, tela cheia (Esc fecha). Posições e câmera vão direto no DOM. Rótulo: código ou artigo + tema. Linhas por sentido, com seta para a ficha indicada (nas duas pontas quando é ida e volta): vermelha = autuar lá em vez daqui, verde = autuar também, cinza tracejada = referência; legenda acima liga e desliga cada tipo, na mesma barra dos botões de zoom (fora do grafo, para não cobrir fichas); ligações entre vizinhas (sem passar pela ficha aberta; no mapa, entre fichas menores) ficam apagadas e sem seta até uma ponta ser destacada; no modo artigo, artigo repetido no mesmo grafo leva o código junto (desambiguarArtigos em noGrafo.ts) e o cartão mostra sempre artigo e código; passar o mouse na linha mostra o motivo, tocar abre um cartão com o sentido e o item do PDF; linhas do nó em destaque correm no sentido da citação; sem animação com prefers-reduced-motion. Sem JavaScript, o SVG do servidor continua com links
src/lib/noGrafo.ts           comum ao servidor e ao cliente: NoGrafo, RAIO, tamanhoDoNo (espaço de cada rótulo), TipoLigacao (emVez / tambem / referencia) e ArestaGrafo (par de fichas com o tipo em cada sentido e, na ficha aberta, os itens do PDF que fazem a citação); juntarArestas une ida e volta numa linha
src/lib/grafo.ts             disposição por forças, determinística, sem bibliotecas: partes pequenas soltas vão para uma faixa; no fim afasta nós até caber o rótulo de cada um; posicionarComAltura aumenta a altura enquanto houver rótulos encostados (limitada pelo número de nós)
src/components/TextoMbft.tsx texto da ficha com códigos citados (ex.: 565-70) virando link; dividirItem separa número e subitens (1.1.)
src/lib/ctb.ts               lê ctb-artigos.json (server-only): referenciasDe (amparo → artigo, inciso, alínea, §), trechosDoAmparo (caput + dispositivo citado + a primeira sanção depois dele; artigo inteiro à parte)
src/components/AmparoCtb.tsx seção "Texto do CTB" da ficha (#ctb): trecho com o citado marcado, "[...]" nos saltos, artigo inteiro recolhido, notas de redação discretas
src/lib/parteGeral.ts        lê docs/normas/mbft/parte-geral.json (server-only): SECOES, secoesDaMedida (medida administrativa da ficha → seção 8.x)
src/components/Gravidade.tsx selo da natureza da infração
src/components/Casco.tsx     cabeçalho e rodapé (no layout)
src/components/Preferencias.tsx preferências de leitura (guardadas no navegador e aplicadas no <head> antes da pintura): guiar por código da ficha ou artigo do CTB (`data-ref` no <html>; no PC à vista, no celular no painel "Aa"), tamanho do texto (`data-fonte` 1/2: zoom 1,15/1,3 no <main>) e tema (`data-tema` claro/escuro; sem ele, segue o aparelho)
src/components/Ref.tsx       Ref / RefOutra: desenham código e artigo; as classes globais so-codigo / so-artigo mostram só um (vale em SVG). Usar em todo lugar que identifica uma ficha
src/lib/rotulos.ts           rotuloArtigo (amparo → "Art. 230, XVI"), linhasDoTema (até 2 linhas de ~14 caracteres)
src/lib/resolucoes.ts        resoluções citadas no texto da ficha ("nº 882/2021", "nº 764, de 20 de dezembro de 2018"; Contran, DNIT, ANTT...), com link do DOU quando o índice tem o mesmo número e ano
src/components/ResolucoesCitadas.tsx seção da ficha com essas resoluções
src/components/UsoOffline.tsx registra o service worker (só em produção), mostra no rodapé quantas fichas estão salvas e o botão "Salvar todas" (~5 MB de download, ~40 MB no aparelho); AvisoSemRede: faixa abaixo do cabeçalho quando a conexão cai
src/lib/figuras.ts           figurasDa(codigo): desenhos recortados do PDF, mostrados em "Informações complementares"
src/components/BotaoCopiar.tsx copiar texto (exemplos do campo de observações)
src/lib/minhasFichas.ts      favoritas e vistas por último, só no aparelho (localStorage); Favoritar (estrela na ficha, registra a visita) e MinhasFichas (listas na página inicial)
src/lib/imagemPrevia.tsx     imagem de prévia 1200 × 630 (opengraph-image da ficha e da página inicial), gerada no build
src/lib/site.ts              URL_SITE, NOME_SITE, URL_MBFT_OFICIAL
src/lib/metadados.ts         metadataDe({ titulo, descricao, caminho })
```

- A ficha mostra, nesta ordem: buscas (nesta ficha / outra ficha, na mesma linha também no celular), selos do mesmo tamanho (principal escuro, o outro em amarelo `--sign`, conforme "guiar por"; letra acompanha a largura da tela no celular) e gravidade, quadro (tipificação, amparo legal, penalidade, medida administrativa, infrator, competência, pontuação, constatação, crime), quando autuar / quando não autuar lado a lado no PC, definições e procedimentos, exemplos do campo de observações, informações complementares, conexões, resoluções citadas, texto do CTB, link para a página do PDF oficial (`#page=N`) e fichas anterior e seguinte na ordem do manual.
- Citações: 1.704 entre as 411 fichas (só 18 isoladas). Por item: 1.245 "em vez desta" (quando não autuar), 92 "autue também", 12 referências. São a base do mapa da busca e das conexões da ficha.
- Na ficha, a medida administrativa ganha links para a seção da parte geral (retenção 8.1, remoção 8.2 etc.).
- A ficha 542-81 aparece duas vezes no PDF (págs. 190 e 192), com o mesmo conteúdo: fica uma só.
- Gravidade por cor: gravíssima vermelho, grave laranja, média amarelo, leve verde.

Em produção, defina `NEXT_PUBLIC_SITE_URL`.

## Atualização do manual

- `.github/workflows/verificar-mbft.yml`: toda segunda baixa o PDF oficial (`.../mbvt20222.pdf/@@download/file`; sem o sufixo o gov.br devolve HTML) e compara o hash com `docs/normas/MBVT20222.pdf`. Se mudou, abre uma issue. Para atualizar: trocar o PDF, rodar os extratores de `tools/normas/mbft/` e `tools/normas/extrair_artigos_ctb.py`, dar tema às fichas novas em `temas.json`, `npm run verificar:dados` e os testes. O rodapé mostra a data do PDF (`extraidoEm` do `mbft.json`).

## Segurança e hospedagem

- Next.js 15 e React 19. `npm audit --omit=dev` deve ficar em 0: o PostCSS embutido no Next é forçado para uma versão corrigida (`overrides` no `package.json`). Ao atualizar o Next, rodar o audit de novo e remover o override se ele não for mais preciso.
- Tudo é gerado no build (páginas, `/busca.json`, `/sw.js`, manifesto): o servidor só entrega arquivos; não há banco, formulário, login nem dados de quem usa. Preferências ficam no navegador de cada um.
- Cabeçalhos em `next.config.mjs`: CSP só com recursos do próprio site (`'unsafe-inline'` em scripts e estilos é exigido pelo Next e pelo React numa página estática), `frame-ancestors 'none'`, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS e `Cross-Origin-Opener-Policy`. Recurso de fora (fonte, script, imagem) precisa entrar na CSP.
- Next 15: `params` das páginas chega como Promise (`await params`).

## Regras

- Rodapé obrigatório: "Conteúdo informativo. Não substitui o texto publicado no Diário Oficial da União."
- Site independente: nunca usar marca, brasão ou nome de órgão de trânsito como se fosse oficial.

## Identidade visual

- Tema claro com acento amarelo de sinalização: `--sign: #eab308; --sign-text: #854d0e;`.
- Tokens: `--asphalt: #f1f5f9` (fundo), `--asphalt-2: #ffffff` (superfícies), `--asphalt-3: #cbd5e1` (bordas), `--paint: #0f172a` (texto), `--muted: #475569`, `--ok: #15803d`, `--bad: #dc2626`; e `--linha`, `--realce`, `--realce-2`, `--inverso-bg`/`--inverso-tx` (botões e selos escuros), `--sobre-amarelo` (texto sobre `--sign`), `--g-*` (gravidade). Todos têm versão escura em `globals.css`: **não usar cor fixa no CSS** (exceto o fundo branco dos desenhos do PDF).
- Fontes: Barlow Condensed (títulos), Barlow (texto), Source Serif 4 (texto da norma), IBM Plex Mono (códigos e números). Arquivos em `src/fontes/` (woff2 latin dos pesos usados, licença OFL), carregados com `next/font/local`: o build não baixa nada do Google Fonts.
- Zero emojis na interface: só ícones `lucide-react` ou texto.
