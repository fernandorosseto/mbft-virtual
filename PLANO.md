# MBFT Virtual · Plano

## 1. Proposta

Consulta ao MBFT (Res. CONTRAN nº 985/2022) para agentes de fiscalização de trânsito. O site não ensina nem prepara para prova: deixa o PDF oficial mais fácil de usar. Achar a ficha certa em segundos, ler sem zoom no celular, navegar entre fichas relacionadas.

## 2. Funcionalidades previstas

1. **Ficha** (`/fichas/[codigo]`, feita): cabeçalho com código, tipificação resumida, amparo legal, gravidade, penalidade, medida administrativa, infrator, competência, pontuação, constatação e crime; depois quando autuar, quando não autuar, definições e procedimentos, exemplos de observações e informações complementares. Link para a página do PDF oficial.
2. **Busca** (feita, sobre código, tipificação resumida e amparo legal) por código (ex.: 672-61), artigo do CTB (ex.: 230, XVI) ou palavra, rodando no navegador sobre um índice leve.
3. **Lista** das fichas agrupadas por artigo do CTB (feita, na página inicial); filtros feitos (gravidade, infrator, competência).
4. **Parte geral** do manual (feita: `/parte-geral`).
5. **Amparo legal** com o texto do artigo do CTB (feito: seção "Texto do CTB" na ficha).

## Próximos passos (ideias registradas)

6. **Páginas de resolução** (`/resolucoes/[numero]`, ex.: `/resolucoes/960`): ementa, link do DOU, situação (em vigor, alterada por quem) e as fichas do MBFT ligadas a ela. Na ficha, seção "Resolução que regulamenta", separada de "Resoluções citadas". Exemplo: a ficha de película (670-00) não cita nenhuma resolução, mas o assunto é da Res. 960/2022 (alterada pela 989/2022). Essa ligação não está no texto do MBFT: precisa ser curadoria do site, marcada como tal, com o artigo da resolução como fonte e conferida quando houver revogação. Primeira candidata: Res. 960, já conferida no CTB Virtual.

7. Feitos em 19/11/2026: desenhos das fichas, busca com sinônimos, copiar exemplo de observação, favoritas e recentes, modo escuro, prévia ao compartilhar, testes automáticos e verificação semanal do PDF (ver registro de decisões).
8. **Domínio próprio**: quando houver, definir `NEXT_PUBLIC_SITE_URL` na Vercel; até lá, links e prévias usam o endereço `.vercel.app`.

## 3. Decisões em aberto

- Cobrança ou acesso gratuito.
- Domínio.

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
| 18/11/2026 | Botão de atalhos com borda de tinta irregular e animação de líquido (turbulência do SVG), inspirada nos logogramas circulares do filme A Chegada, com desenho próprio | pedido de identidade visual mais marcante no botão; sem copiar símbolos do filme; animação pausa quando o botão está escondido |
| 18/11/2026 | Ícone do botão de atalhos: seta que segue em frente ou vira à direita (linguagem de placa de trânsito), desenhada no traço do lucide. Exceção à regra "só ícones lucide-react" | o lucide não tem essa seta; os parecidos (bifurcação) lembram ramos de programação, não placa |
| 18/11/2026 | O botão de atalhos vira uma gota: o círculo e a borda são uma forma só, da mesma cor, com pontas de líquido que tentam sair em lugares e ritmos aleatórios, sem nunca se soltar | o anel separado deixava espaço entre o círculo e a borda; o pedido era o líquido fazer parte do botão |
| 18/11/2026 | Ícone do botão de atalhos passa a ser a imagem da seta enviada (sem fundo), recortada e reduzida para 97 × 128 px (2,4 KB) e usada como máscara, com a cor do botão | forma exata da placa pedida; a máscara deixa a seta branca na gota escura e escura na amarela |
| 18/11/2026 | Next.js 14.2.35 → 15.5.29 (com React 19) e PostCSS forçado para 8.5.33: `npm audit` de 2 vulnerabilidades (1 crítica) para 0 | as falhas do Next 14 eram de recursos que o site não usa (otimização de imagem, Server Actions, middleware, rewrites), mas a versão estava fora de correção; Next 16 exigiria trocar o `next lint` |
| 18/11/2026 | Cabeçalhos de segurança (CSP restrita ao próprio site, sem exibição em quadro de outro site, HSTS etc.) e manifesto do PWA com id, escopo e atalhos | o site não enviava nenhum cabeçalho de segurança; o manifesto já permitia instalar, os campos novos são os recomendados |
| 18/11/2026 | Topo da ficha com dois selos do mesmo tamanho: o principal escuro e o outro (ficha ou artigo) em amarelo com texto escuro; no celular a letra acompanha a largura da tela para caber numa linha | a referência secundária em texto cinza pequeno ficava apagada e quebrava mal |
| 19/11/2026 | Desenhos das fichas recortados do PDF oficial com a legenda colorida (168 recortes em 142 fichas, WebP, 4,2 MB), em "Informações complementares"; entram no "Salvar todas" | a legenda ("AUTUAR 552-50" com o quadradinho vermelho) é texto do PDF, fora da imagem: sem ela o agente não sabe qual veículo é qual |
| 19/11/2026 | Busca com sinônimos do dia a dia (insulfilm → película, bafômetro → etilômetro, uber → transporte remunerado...), mostrando o termo usado | o agente digita a palavra da rua; o texto das fichas não muda |
| 19/11/2026 | Botão de copiar nos exemplos do campo de observações; favoritas e vistas por último guardadas só no aparelho | preencher o AIT no celular; acesso rápido às fichas mais usadas, sem cadastro |
| 19/11/2026 | Modo escuro (automático pelo aparelho, ou escolhido no painel Aa) | consulta à noite, na viatura |
| 19/11/2026 | Imagem de prévia por ficha (código, artigo, gravidade, tipificação), gerada no build | link mandado no WhatsApp mostra a ficha; funciona com o endereço .vercel.app enquanto não houver domínio |
| 19/11/2026 | Testes automáticos (dados + navegador no celular e no computador) e GitHub Actions a cada envio; verificação semanal do PDF oficial com aviso por issue | substitui a conferência manual de cada mudança; atualização do manual sem custo (GitHub Actions grátis); o gov.br só entrega o arquivo em `.../mbvt20222.pdf/@@download/file` |
| 19/11/2026 | Fontes guardadas no projeto (`src/fontes`, OFL) no lugar do download do Google Fonts no build | o download falhou de forma intermitente no GitHub Actions e já tinha falhado uma vez localmente; poderia derrubar uma publicação na Vercel |
| 19/11/2026 | Grafo no modo artigo: artigo repetido no mesmo grafo leva o código junto, em letra menor; cartão da ligação e listas mostram sempre artigo e código. Ligações entre vizinhas apagadas e sem seta. Botões de zoom numa barra acima do grafo | 243 das 411 fichas dividem o amparo com outra (o grafo mostrava "Art. 162, III → Art. 162, III"); as ligações entre vizinhas competiam com as da ficha; os botões cobriam fichas no canto |
| 19/11/2026 | Texto do link do PDF no fim da ficha conforme o que a ficha tem: tabela (8 fichas, lista à mão em `tabelas.json`), desenhos, ou só o texto original | o texto antigo ("Figuras e tabelas da ficha estão no PDF oficial") aparecia em todas e sugeria conteúdo que a maioria não tem; a detecção automática de tabelas confunde a moldura da ficha com tabela |
| 19/11/2026 | Tabelas do PDF na ficha no lugar do texto achatado: tabela da CNH (505-31 a 505-34) em HTML, com as células conferidas contra o texto; a de inscrição de tara (675-00, muitas células mescladas) em recorte da página; a da Res. 547/2015 (683-11 a 683-13) já estava num desenho. A lista é escolhida à mão em `extrair_tabelas.py` | o parágrafo corrido da tabela era ilegível no celular; montar em HTML uma tabela cheia de mesclas arriscaria trocar uma célula de lugar |
