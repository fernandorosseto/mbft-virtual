# MBFT Virtual · Plano

## 1. Proposta

Consulta ao MBFT (Res. CONTRAN nº 985/2022) para agentes de fiscalização de trânsito. O site não ensina nem prepara para prova: deixa o PDF oficial mais fácil de usar. Achar a ficha certa em segundos, ler sem zoom no celular, navegar entre fichas relacionadas.

## 2. Funcionalidades previstas

1. **Ficha** (`/fichas/[codigo]`, feita): cabeçalho com código, tipificação resumida, amparo legal, gravidade, penalidade, medida administrativa, infrator, competência, pontuação, constatação e crime; depois quando autuar, quando não autuar, definições e procedimentos, exemplos de observações e informações complementares. Link para a página do PDF oficial.
2. **Busca** (feita, sobre código, tipificação resumida e amparo legal) por código (ex.: 672-61), artigo do CTB (ex.: 230, XVI) ou palavra, rodando no navegador sobre um índice leve.
3. **Lista** das fichas agrupadas por artigo do CTB (feita, na página inicial); filtros feitos (gravidade, infrator, competência).
4. **Parte geral** do manual (feita: `/parte-geral`).
5. **Amparo legal** com o texto do artigo do CTB (feito: seção "Texto do CTB" na ficha).

## 3. Decisões em aberto

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
| 18/11/2026 | Ficha mostra o texto do CTB do amparo legal: caput, dispositivo citado (marcado) e a sanção que vale para ele; o artigo inteiro fica recolhido | o agente confere a letra da lei sem sair da ficha; em artigos longos (art. 230), a sanção certa é o primeiro bloco "Infração / Penalidade / Medida" depois do inciso |
| 18/11/2026 | Filtros no catálogo: gravidade, infrator, competência e constatação (sem abordagem / mediante abordagem / vide procedimentos), valendo para lista, busca e mapa | o PDF escreve o mesmo valor de vários jeitos (18 formas de competência); os filtros usam categorias agrupadas, e a ficha continua com o texto original. Constatação entrou por ser decisiva em campo |
| 18/11/2026 | Uso sem internet: service worker próprio; páginas visitadas ficam salvas sozinhas; "Salvar todas" (411 fichas e parte geral) só quando a pessoa pede; site instalável; aviso quando a conexão cai | o agente consulta em campo, às vezes sem sinal; baixar tudo custa ~5 MB e ~40 MB no aparelho, então não é automático |
| 18/11/2026 | Guiar por código da ficha ou por artigo do CTB, em todo o site (listas, mapas, conexões, sugestões); no PC à vista no cabeçalho, no celular no painel "Aa" | muitos agentes conhecem a infração pelo artigo, não pelo código; a troca é só CSS, então vale também nos grafos gerados no build |
| 18/11/2026 | Tamanho do texto em três níveis (normal, 115%, 130%) no painel "Aa" | acessibilidade, leitura em campo |
| 18/11/2026 | Grafos com tema de uma ou duas palavras por ficha (arquivo temas.json, escrito à mão com palavras da tipificação) e animação: nós surgem, linhas se desenham, a linha do nó em destaque corre no sentido da citação | o código sozinho não diz do que a ficha trata; a heurística automática dava temas ruins ("lançando esteja") |
| 18/11/2026 | Ficha lista as resoluções citadas no texto, com link para o DOU quando localizada; o texto do CTB vai para o fim da ficha | o agente precisa saber quais normas a ficha usa; o CTB é consulta de apoio, depois do conteúdo da ficha |
| 18/11/2026 | Grafos interativos como no Obsidian: física ao vivo, arrastar bolinhas, destaque ao passar o mouse, zoom e arraste, tela cheia; no celular, o dedo no fundo rola a página e o grafo livre fica em tela cheia | explorar as ligações entre fichas como no Obsidian, sem prender a rolagem da página no celular; sem bibliotecas (~3 KB a mais no JavaScript da ficha) |
| 18/11/2026 | Listas de conexões pelo sentido da ligação, com a situação (texto do item): "Não autue aqui, use", "Autue também", "Outras referências", "Fichas que mandam para esta". Grafo sem mudança, para testar antes | 94% das citações vêm do "quando não autuar" (em vez desta) e ~5% pedem outro auto (também): sentidos opostos que o grafo e as listas mostravam iguais; o agente precisa ver em que situação trocar de ficha |
| 18/11/2026 | Grafos com ligações tipadas: seta vermelha (autuar lá em vez daqui), verde (autuar também), cinza tracejada (referência); ida e volta numa linha com duas setas; filtro por tipo na legenda; tocar na linha mostra o motivo (item do PDF nas ligações da ficha aberta; nas demais e no mapa, só o tipo) | depois de testar as listas por sentido; os motivos ficam só na ficha aberta para a página não crescer (os grafos densos têm centenas de linhas) |
| 18/11/2026 | Grafo da ficha vai uma vez só na página, com as duas disposições (PC e celular); o balão da linha não repete o texto do item | as ligações tipadas levaram as 411 fichas de 5,4 para 8,2 MB compactados (pesa no "Salvar todas"); voltou para 6,8 MB |
| 18/11/2026 | Botão flutuante de atalhos para as seções da ficha (só as que a ficha tem), com a seção atual marcada e "Voltar ao topo" | a ficha ficou longa (grafo, ligações, resoluções, CTB); no celular, chegar ao "quando não autuar" ou ao CTB pedia muita rolagem |
