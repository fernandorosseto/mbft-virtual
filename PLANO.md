# MBFT Virtual · Plano

## 1. Proposta

Consulta ao MBFT (Res. CONTRAN nº 985/2022) para agentes de fiscalização de trânsito. O site não ensina nem prepara para prova: deixa o PDF oficial mais fácil de usar. Achar a ficha certa em segundos, ler sem zoom no celular, navegar entre fichas relacionadas.

## 2. Funcionalidades previstas

1. **Ficha** (`/fichas/[codigo]`, feita): cabeçalho com código, tipificação resumida, amparo legal, gravidade, penalidade, medida administrativa, infrator, competência, pontuação, constatação e crime; depois quando autuar, quando não autuar, definições e procedimentos, exemplos de observações e informações complementares. Link para a página do PDF oficial.
2. **Busca** (feita, sobre código, tipificação resumida e amparo legal) por código (ex.: 672-61), artigo do CTB (ex.: 230, XVI) ou palavra, rodando no navegador sobre um índice leve.
3. **Lista** das fichas agrupadas por artigo do CTB (feita, na página inicial); faltam os filtros (gravidade, infrator, competência).
4. **Parte geral** do manual (feita: `/parte-geral`).
5. **Amparo legal** com o texto do artigo do CTB (de `docs/normas/ctb.txt`).

## 3. Decisões em aberto

- Uso offline (site instalável, PWA).
- Cobrança ou acesso gratuito.
- Domínio.
- Figuras e tabelas das informações complementares (o extrator não as captura).

## Registro de decisões

| Data | Decisão | Motivo |
|---|---|---|
| 18/11/2026 | Projeto criado a partir de uma cópia do CTB Virtual | aproveitar a estrutura (Next.js, identidade visual, MBFT já convertido em JSON, CTB extraído) |
| 18/11/2026 | Público: agentes de fiscalização de trânsito; site consultivo | outro público que o do CTB Virtual (concurseiros da PRF) |
| 18/11/2026 | Sem veículo 3D; a interatividade é melhorar a leitura do PDF e o site deve ser leve, com layout para celular e computador | consulta em campo, no celular |
| 18/11/2026 | Limpeza: removidos 3D (modelos, Three.js, scripts de modelagem), conteúdo e editais de concurso, Res. 960/989, verificador de citações, vídeos, lista de espera (Firebase) e imagens de prévia por rota | nada disso se aplica ao novo site; fica no histórico do CTB Virtual se for preciso |
| 18/11/2026 | Página inicial = catálogo das fichas por artigo do CTB, com busca no navegador sobre código, tipificação resumida e amparo legal (sem o texto completo, para a página continuar leve) | o agente chega pela busca ou pelo artigo; buscar no texto inteiro exigiria baixar o MBFT todo |
| 18/11/2026 | Ficha mostra os campos do PDF sem reescrita; códigos citados no texto viram links; figuras e tabelas ficam no PDF oficial, com link para a página | fidelidade ao texto; o extrator não captura figuras |
| 18/11/2026 | Parte geral numa página só, com sumário e âncoras, texto extraído do `pdftotext` em parágrafos e listas; a medida administrativa da ficha liga à seção 8.x correspondente | são ~30 páginas de texto corrido: uma página com sumário é leve (~37 KB compactada) e permite busca do navegador; o texto do pdfplumber tinha palavras coladas |
| 18/11/2026 | Busca também no texto completo das fichas, com índice baixado só ao buscar; resultados separados entre título/amparo e texto | "álcool" achava 1 ficha pelo título e o tema aparece em 5; o índice (~80 KB compactado) não pesa na página inicial |
| 18/11/2026 | Visualização em grafo, estilo Obsidian: modo mapa na busca (encontradas + ligadas por citação) e conexões em cada ficha (grafo local + listas cita / é citada por) | as fichas se citam muito ("utilizar 565-70"); o grafo mostra o tema inteiro e os enquadramentos vizinhos. Desenho próprio em SVG, sem bibliotecas; na ficha, gerado no build |
| 18/11/2026 | Duas buscas no topo da ficha: "Buscar nesta ficha" (marca e conta as ocorrências, anda entre elas) e "Ir para outra ficha ou tema" (sugestões de fichas e seções da parte geral) | fichas longas: o agente procura um termo dentro dela sem o Ctrl+F do celular; e troca de ficha sem voltar ao catálogo |
