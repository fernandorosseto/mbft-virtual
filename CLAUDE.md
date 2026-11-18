# MBFT Virtual

Site de **consulta** ao Manual Brasileiro de Fiscalização de Trânsito (MBFT, anexo da Res. CONTRAN nº 985/2022) para **agentes de fiscalização de trânsito**. A proposta é melhorar a leitura do PDF oficial: achar a ficha certa rápido, ler bem no celular e no computador, com o site leve.

Nasceu como cópia do CTB Virtual (site para concurseiros, com carro 3D); o 3D e o conteúdo de concurso foram removidos em 18/11/2026. Plano e registro de decisões em **`PLANO.md`**: leia antes de mudar funcionalidades ou textos, e registre lá cada decisão nova.

## Comandos

```bash
npm run dev         # servidor de desenvolvimento
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint (next/core-web-vitals)
npm run build
```

Rode `typecheck`, `lint` e `build` antes de cada commit.

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
- `contran-indice.json`: índice das resoluções do CONTRAN no DOU (nº 700 em diante), de `tools/normas/dou/coletar.py`. Serve para ligar as resoluções citadas nas fichas.

## Estrutura

| Rota | Conteúdo |
|---|---|
| `/` | catálogo: fichas agrupadas por artigo do CTB, com busca no título e no texto completo, filtros (gravidade, infrator, competência, constatação) e modo mapa (`?q=`, `?g=`, `?i=`, `?c=`, `?a=`, `?ver=mapa` no endereço) |
| `/fichas/[codigo]` | ficha completa (ex.: `/fichas/552-50`), gerada no build para as 411 fichas; no topo, "Buscar nesta ficha" e "Ir para outra ficha ou tema" |
| `/busca.json` | índice gerado no build (fichas, palavras do texto completo, citações, seções da parte geral); o navegador só baixa ao buscar (~80 KB compactado) |
| `/parte-geral` | Parte Geral do manual numa página, com sumário (fixo ao lado no PC, recolhível no celular) e âncoras por seção (`#8-2`, `#infracoes-concorrentes`) |

```
src/lib/mbft.ts              lê docs/normas/mbft/mbft.json no build (server-only): Ficha, obterFicha, fichasPorArtigo, vizinhas, textoCompleto, citacoes (a cita b quando o texto de a traz o código de b), conexoes, categoriasDe (valores do PDF agrupados para os filtros: infrator em 4, competência por órgão citado, constatação em 3)
src/components/Catalogo.tsx  lista, busca e filtros (cliente; opções em OU dentro do grupo, E entre grupos; valem para lista, busca e mapa): primeiro título/código/amparo; com o índice, também o texto completo (resultados separados). Códigos, números e romanos casam a palavra inteira; o resto, pelo começo (src/lib/texto.ts)
src/lib/busca.ts             busca comum ao catálogo e à ficha: termosDe, buscarFichas (título/amparo, depois texto), buscarSecoes, carregarIndice (baixa /busca.json uma vez)
src/components/BuscaNaFicha.tsx busca dentro da ficha, como o "Localizar" do navegador: marca as ocorrências com a CSS Custom Highlight API (sem mexer no HTML; sem suporte, seleciona a atual), sem diferenciar acentos; Enter/Shift+Enter andam; barra fixa no pé com ↑ ↓ ×. Fica de fora o que tem `data-fora-da-busca` e os rótulos do grafo
src/components/IrPara.tsx    campo com sugestões: seções da parte geral que casam com o título primeiro, depois fichas; setas e Enter; "Ver todos os resultados no catálogo" (/?q=)
src/components/MapaBusca.tsx mapa da busca (cliente), estilo grafo do Obsidian: fichas encontradas (maiores) e fichas ligadas a elas por citação (menores, até 40 ou 20 se a busca trouxe 15+); tocar mostra um cartão com link
src/components/ConexoesFicha.tsx grafo local da ficha, desenhado no build (SVG com links, sem JavaScript), em versão larga e alta, e as listas "cita" / "é citada por"
src/components/DesenhoGrafo.tsx SVG de grafo já posicionado (cor = gravidade); serve ao servidor e ao cliente
src/lib/grafo.ts             disposição por forças, determinística, sem bibliotecas: partes pequenas soltas vão para uma faixa; no fim afasta nós até caber o rótulo
src/components/TextoMbft.tsx texto da ficha com códigos citados (ex.: 565-70) virando link; dividirItem separa número e subitens (1.1.)
src/lib/ctb.ts               lê ctb-artigos.json (server-only): referenciasDe (amparo → artigo, inciso, alínea, §), trechosDoAmparo (caput + dispositivo citado + a primeira sanção depois dele; artigo inteiro à parte)
src/components/AmparoCtb.tsx seção "Texto do CTB" da ficha (#ctb): trecho com o citado marcado, "[...]" nos saltos, artigo inteiro recolhido, notas de redação discretas
src/lib/parteGeral.ts        lê docs/normas/mbft/parte-geral.json (server-only): SECOES, secoesDaMedida (medida administrativa da ficha → seção 8.x)
src/components/Gravidade.tsx selo da natureza da infração
src/components/Casco.tsx     cabeçalho e rodapé (no layout)
src/lib/site.ts              URL_SITE, NOME_SITE, URL_MBFT_OFICIAL
src/lib/metadados.ts         metadataDe({ titulo, descricao, caminho })
```

- A ficha mostra os campos como estão no PDF: quadro (tipificação, amparo legal, penalidade, medida administrativa, infrator, competência, pontuação, constatação, crime), quando autuar / quando não autuar lado a lado no PC, definições e procedimentos, exemplos do campo de observações, informações complementares, link para a página do PDF oficial (`#page=N`) e fichas anterior e seguinte na ordem do manual.
- Citações: 1.704 entre as 411 fichas (só 18 isoladas). São a base do mapa da busca e das conexões da ficha.
- Na ficha, a medida administrativa ganha links para a seção da parte geral (retenção 8.1, remoção 8.2 etc.).
- A ficha 542-81 aparece duas vezes no PDF (págs. 190 e 192), com o mesmo conteúdo: fica uma só.
- Gravidade por cor: gravíssima vermelho, grave laranja, média amarelo, leve verde.

Em produção, defina `NEXT_PUBLIC_SITE_URL`.

## Regras

- Rodapé obrigatório: "Conteúdo informativo. Não substitui o texto publicado no Diário Oficial da União."
- Site independente: nunca usar marca, brasão ou nome de órgão de trânsito como se fosse oficial.

## Identidade visual

- Tema claro com acento amarelo de sinalização: `--sign: #eab308; --sign-text: #854d0e;`.
- Tokens: `--asphalt: #f1f5f9` (fundo), `--asphalt-2: #ffffff` (superfícies), `--asphalt-3: #cbd5e1` (bordas), `--paint: #0f172a` (texto), `--muted: #475569`, `--ok: #15803d`, `--bad: #dc2626`.
- Fontes: Barlow Condensed (títulos), Barlow (texto), Source Serif 4 (texto da norma), IBM Plex Mono (códigos e números).
- Zero emojis na interface: só ícones `lucide-react` ou texto.
