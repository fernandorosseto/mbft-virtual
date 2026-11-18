# CTB Virtual · Plano: foco no concurso da PRF

Documento vivo. Registra o rumo do produto, as decisões e o andamento. Toda decisão nova entra no **Registro de decisões** (fim do arquivo), com data.

Última atualização: 12/11/2026 (editais de 2018 e 2021 e mapeamento das resoluções)

---

## 1. Decisão e contexto

**Decisão (12/11/2026):** o CTB Virtual passa a ser **100% voltado a concurseiros**, com foco no concurso da **Polícia Rodoviária Federal (PRF)**. Mantêm-se o nome e a ideia: as normas de trânsito explicadas sobre um veículo 3D. Sai a divisão entre modo motorista e modo concurseiro.

**Modelo:** freemium. De 3 a 4 resoluções são gratuitas; o restante fica no módulo pago.

**Contexto de mercado** (informado pelo Fernando; **conferir as fontes antes de usar em qualquer peça de divulgação**):

| Fato | Situação | Fonte a registrar |
|---|---|---|
| Rumor de novo concurso da PRF | não confirmado | _(link)_ |
| PEC da Segurança Pública em discussão | conferir o estágio atual de tramitação | _(link)_ |
| Diretor-geral da PRF disse que é preciso dobrar o efetivo | conferir a entrevista original | _(link)_ |

> Regra de comunicação: o site **nunca** afirma que o concurso está autorizado ou que o edital vai sair sem uma fonte oficial (Diário Oficial ou ato do Ministério). Rumor é tratado como rumor, com link. Isso protege a credibilidade, que é o principal ativo de um produto de estudo jurídico.

---

## 2. Público e proposta de valor

**Público:** candidatos ao cargo de Policial Rodoviário Federal. Estudam legislação de trânsito em profundidade, fazem muitas questões e precisam da letra da lei atualizada.

**Dor:** a legislação de trânsito é extensa, muda com frequência (o CONTRAN consolidou e renumerou boa parte das resoluções entre 2020 e 2023) e é cobrada em detalhe (percentuais, medidas, enquadramentos, pegadinhas).

**Proposta de valor:**
1. **Visual:** a regra aparece no veículo 3D, no lugar onde se aplica. Memorização por imagem.
2. **Confiável:** todo texto de lei citado é conferido automaticamente com o texto oficial (`npm run verificar:citacoes`). É o diferencial a comunicar: "letra da lei conferida".
3. **Focado na prova:** pegadinhas, histórico de redação, enquadramento exato e questões no estilo da banca.
4. **Atualizado:** quando uma norma muda, o site mostra o que mudou e quando.

---

## 3. Conteúdo

### 3.1 Mapear o edital

**Editais analisados** (texto e fonte em `docs/editais/`):
- **2021:** Edital nº 1, de 18/01/2021 (DOU de 19/01/2021), banca Cebraspe. É o último publicado.
- **2018:** Edital nº 1 - PRF, de 27/11/2018 (DOU de 28/11/2018), banca Cebraspe. Provas em 2019 (os editais de 2019 no DOU são etapas deste concurso; não houve outro edital de abertura em 2019).

Até 12/11/2026 não há edital novo; as notícias falam em pedido de vagas em andamento (conferir na fonte oficial).

**O peso da Legislação de Trânsito nas provas** (conferido nos editais):

| | 2018 | 2021 |
|---|---|---|
| Itens de trânsito (Bloco II, só legislação de trânsito) | **40 de 120 (33%)** | **30 de 120 (25%)** |
| Nota mínima no bloco (abaixo disso, eliminado) | 12 | 10 |
| Desempate pelo bloco (depois da preferência ao idoso) | maior nota e maior nº de acertos | idem |
| Formato | Certo/Errado; +1 acerto, −1 erro | idem |
| Além do CTB | Decreto nº 4.711/2003 (coordenação do SNT) | Lei nº 5.970/1973 e Lei nº 14.071/2020 citada |
| Resoluções do CONTRAN | 48 | 39 |

> Argumento central de venda: nos dois últimos concursos, trânsito foi um bloco próprio, de um quarto a um terço da prova, eliminatório e critério de desempate. São fatos dos editais.

**Resoluções cobradas → normas de hoje.** Mapeamento completo em **`docs/editais/mapeamento-resolucoes.md`** (57 números, 28 deles nos dois editais). Feito no Diário Oficial: coleta das 315 resoluções do CONTRAN do nº 700 ao nº 1.035 e leitura dos artigos de revogação, seguindo as cadeias. Resultado:
- **44** revogadas, com a norma atual identificada;
- **5** em vigor, com alterações posteriores (242/2007, 723/2018, 789/2020, 798/2020, 810/2020);
- **7** sem revogação localizada, provavelmente em vigor (26/1998, 36/1998, 110/2000, 289/2008, 508/2014, 525/2015, 735/2018): conferir;
- **1** revogada sem substituta (205/2006, pela 906/2022, que só revoga normas obsoletas).

Normas atuais que mais concentram resoluções dos editais (candidatas naturais a conteúdo, inclusive gratuito):

| Norma atual | Substitui (editais 2018/2021) | Assunto |
|---|---|---|
| Res. 882/2021 (via 899/2022) | 210, 211, 258, 290, 520, 803 | limites de pesos e dimensões (conferir se o conteúdo foi incorporado à 882) |
| Res. 960/2022 | 216, 253, 254 | vidros: películas, danos, visibilidade — **já pronta** |
| Res. 969/2022 | 32, 231, 780 | placas de identificação (PIV) |
| Res. 970/2022 | 227, 268, 667 | sinalização e iluminação dos veículos |
| Res. 985/2022 | 371, 561 | Manual Brasileiro de Fiscalização de Trânsito |
| Res. 1.027/2026 | 720, 809 | registro, licenciamento e transferência de veículos |

> Os números 969 e 970, que já apareciam no menu como "em breve", estão confirmados. O 993 (equipamentos obrigatórios) também: é o destino da antiga 14/1998 (14 → 912 → 993).

**Tarefas:**
- [x] Obter os editais de 2021 e 2018 e listar o conteúdo de Legislação de Trânsito.
- [x] Confirmar banca e formato: Cebraspe, Certo/Errado, nos dois.
- [x] Mapear as resoluções dos dois editais para as normas de hoje (`docs/editais/mapeamento-resolucoes.md`).
- [ ] Conferir as 7 resoluções sem revogação localizada e a absorção da 882 pela 899.
- [ ] Levantar as questões de trânsito das provas de 2019 e 2021 (Cebraspe) para medir a incidência por assunto. O site da banca não é acessível daqui: baixar as provas pelo navegador e colocar em `docs/editais/`.
- [ ] Classificar cada norma atual por **incidência** e **potencial visual** (dá para mostrar num veículo 3D?).

### 3.2 Critério para as resoluções gratuitas

As 3 ou 4 gratuitas funcionam como vitrine. Devem:
1. ter **alta incidência** em prova (atraem quem pesquisa o assunto);
2. ter **alto potencial visual** (mostram o diferencial do 3D);
3. cobrir **assuntos diferentes** (mostram a amplitude do pago);
4. incluir **uma parte do CTB** que todo candidato estuda, como uma porta de entrada (ver 3.3).

**Decidido (12/11/2026):**
1. **Vidros — Res. 960/2022** (já pronta);
2. **Placas — Res. 969/2022**;
3. **Sinalização e iluminação dos veículos — Res. 970/2022**.

As três são muito visuais no carro e, juntas, substituem 9 das resoluções cobradas nos editais. **Álcool (Res. 1.031/2026) fica no pago**, como destaque do lançamento (mudou em agosto de 2026 e caiu nos dois concursos).

### 3.3 O CTB

O CTB é a base da prova e o tema mais buscado. Sugestão:
- **Grátis:** o quadro interativo de infrações para as infrações ligadas às resoluções gratuitas (por exemplo, art. 230 para vidros). Mostra a ferramenta sem entregar tudo.
- **Pago:** o quadro completo de infrações (arts. 161 a 255), com filtros por natureza, penalidade e medida administrativa, e as alterações recentes da lei.

### 3.4 Padrão de conteúdo (nível de cursinho preparatório)

**Meta:** para cada resolução publicada, o candidato não precisa de outro material. O conteúdo tem a profundidade de um bom material de cursinho (teoria completa, letra da lei, pegadinhas, exercícios); o carro 3D é o diferencial, não o substituto do texto.

**Princípios**
- **Cobertura integral:** todo artigo da norma aparece em algum assunto ou fica marcado como "sem relevância para a prova", com o motivo. Nada some por não caber no carro.
- **Tudo com fonte:** cada afirmação traz o dispositivo entre parênteses, no padrão "(art. 4º, I)". A letra da lei é conferida automaticamente com o texto oficial.
- **Não inventar:** omissões e ambiguidades da norma vão para "Atenção", sem resolver por conta própria.
- **Material próprio:** nada copiado de cursinhos, livros ou plataformas de questões (texto, esquemas ou comentários).

**Três níveis de página**

| Nível | Exemplo | Papel |
|---|---|---|
| Resolução | Res. 960/2022 | porta de entrada da norma: o que é, por que cai, como está organizada |
| Assunto | Películas | a aula: carro interativo + teoria completa + exercícios |
| Ficha (assunto × peça) | Películas no para-brisa | o recorte daquela peça: curto, direto, remete à aula do assunto |

**1. Página da resolução**
- **Ficha técnica:** número e data, publicação no DOU, vigência, normas que a alteraram, normas que ela revogou.
- **Por que cai:** quais resoluções dos editais de 2018 e 2021 ela substitui (`docs/editais/mapeamento-resolucoes.md`) e quanto o tema pesa na prova.
- **Mapa da norma:** capítulos e artigos, cada um com link para o assunto que o explica (é aqui que a cobertura integral fica visível).
- **Linha do tempo:** redação original e alterações, com datas de vigência.

**2. Assunto (a aula), nesta ordem**
1. **No carro (interativo):** o cerne do assunto nas peças do veículo: cores por regra, cards com o resumo curto, camada visual própria quando ajudar (ex.: mapa de danos no para-brisa). Quando o assunto não tem lugar no veículo (prazos, procedimentos, documentos), o carro mostra a vista geral e o visual vai para o painel.
2. **Em resumo:** a regra em 3 a 5 linhas.
3. **Teoria:** a explicação completa, em tópicos, com linguagem de aula: conceitos e definições da norma, regra geral, exceções, exemplos práticos e o "porquê" quando a norma o dá. Cada tópico com o artigo correspondente.
4. **Item visual (pelo menos um por assunto):** quadro comparativo, tabela, esquema, linha do tempo ou diagrama. Ex.: limites de dano para carros × ônibus e caminhões; áreas indispensáveis × demais vidros.
5. **Letra da lei:** todos os dispositivos do assunto, conferidos, com destaque nas palavras que a banca costuma trocar (números, prazos, "vedado", "poderá", "no mínimo", "exceto"). Redação anterior logo abaixo, quando houver.
6. **Pontos de prova e pegadinhas:** como a banca cobra: a afirmação típica e por que está certa ou errada.
7. **Atenção:** o que a norma não resolve.
8. **Infração e penalidade:** quadro com artigo do CTB, natureza, pontos, valor, penalidade, medida administrativa e, quando conferido, o código de enquadramento do MBFT (Res. 985/2022).
9. **Na fiscalização:** o que o agente verifica e como, sempre com base no texto (ótica do policial rodoviário).
10. **Conexões:** artigos do CTB e outras resoluções ligados ao assunto, com link interno.
11. **Questões Certo/Errado:** autorais, no estilo da banca, com gabarito comentado e o artigo (mínimo de 5 por assunto; nas gratuitas, amostra aberta e o restante no pago).
12. **Revisão rápida:** 5 a 10 frases-chave para a véspera da prova (base dos flashcards).
13. **Fontes.**

**3. Ficha (assunto × peça)**
- Destaque (o número ou a regra principal), resumo, pode / não pode, letra da lei daquela peça, pontos de prova específicos, infração. Link para a teoria do assunto.

**Guia de redação**
- Frases curtas, voz ativa, uma ideia por frase. Negrito só nas palavras-chave.
- Usar os termos da norma ("transmitância luminosa", não "escurecimento"); na primeira vez, explicar o termo.
- Norma por extenso na primeira citação ("Resolução CONTRAN nº 960/2022"), depois "Res. 960/2022".
- Siglas por extenso na primeira vez em que aparecem em cada tela, com a sigla entre parênteses: "medidor de transmitância luminosa (MTL)". Em menus e abas, preferir o nome à sigla.
- Sem opinião e sem "geralmente": se a norma não diz, vai para "Atenção".

**Pronto para publicar (checklist por resolução)**
- [ ] Todos os artigos cobertos ou justificados.
- [ ] `npm run verificar:citacoes` sem erro e sem dispositivo pendente.
- [ ] Teoria, item visual, pegadinhas, infração e revisão rápida em todos os assuntos.
- [ ] Questões com gabarito comentado (mínimo por assunto atingido).
- [ ] Página da resolução com ficha técnica, mapa e linha do tempo.
- [ ] Revisão por uma segunda pessoa (registrar quem e quando).
- [ ] Conferido no celular.

**Vidros (960/2022) é o piloto:** já tem carro, resumo, pode / não pode, letra da lei, pontos de prova, atenção e infração. Faltam a página da resolução, teoria, itens visuais em Películas, questões, revisão rápida e a cobertura dos demais artigos (vidro de segurança, medição, entre outros). Fechar o padrão em Vidros antes de Placas, para Placas e Iluminação já nascerem completas.

### 3.5 Veículos além do carro

Várias normas tratam de moto, caminhão, ônibus e reboque. O modelo atual é um sedã.
- [ ] Listar quais resoluções do edital precisam de outro veículo.
- [x] Cavalo mecânico: `public/models/cavalo-mecanico.glb` (CC BY 4.0, letras da marca removidas; ver `tools/modelos/README.md`). Guardado, sem uso desde 14/11/2026.
- [x] Caminhão de carga com carroceria: `public/models/caminhao.glb` (CC BY 4.0, inscrições da marca removidas; ver `tools/modelos/README.md`). É o caminhão exibido nos assuntos de pesados.
- [ ] Buscar outros modelos 3D genéricos (sem marca) com licença que permita uso comercial (CC BY ou CC0). A licença atual do sedã (CC BY 4.0) permite uso comercial com crédito.
- [x] Adaptar o `CarStage` para trocar de veículo (transição animada entre automóvel e caminhão).
- [ ] Películas nos pesados: faixa de 20 cm na base do para-brisa fora da área indispensável (art. 4º, § 1º, I), candidata a assunto do caminhão.

---

## 4. Funcionalidades

### 4.1 Já existe
- Veículo 3D com zonas coloridas por regra, marcadores animados e mapa de danos.
- Navegação por URL: tema → assunto → zona; páginas estáticas com prévia para compartilhamento.
- Painel com letra da lei, pontos de prova, histórico, atenção e enquadramento.
- Conferência automática das citações contra o texto oficial.
- Layout de celular com painel arrastável.

### 4.2 Muda com o novo foco
- **Sai o modo motorista.** Um só conteúdo, escrito para concurseiro. O texto simples atual ("Em português claro") vira o **resumo** no topo de cada ficha.
- **Sai o seletor de modo** do cabeçalho; no lugar, o acesso (entrar / assinar).
- **Textos e SEO** passam a falar com o candidato da PRF (títulos, descrições, imagens de prévia).

### 4.3 Novas funcionalidades

| Funcionalidade | Para quê | Plano | Prioridade |
|---|---|---|---|
| Conta de usuário (login) | acesso ao pago, progresso | grátis | alta |
| Bloqueio do conteúdo pago **no servidor** | hoje o conteúdo "PRO" vai inteiro para o navegador e pode ser copiado | — | alta |
| Questões por ficha, no estilo da banca | treino, principal motivo de pagar | pago (amostra grátis) | alta |
| Quadro interativo de infrações do CTB | consulta e revisão rápida | parcial / pago | alta |
| Flashcards com revisão espaçada | memorização | pago | média |
| Progresso por resolução | motivação, retenção | grátis com conta | média |
| Simulados cronometrados | treino de prova | pago | média |
| "O que mudou": linha do tempo das alterações | atualização, diferencial | grátis | média |
| Lista de espera / avisos do concurso por e-mail | captação antes de cobrar | grátis | alta (Fase 1) |
| Página do concurso PRF (edital, datas, notícias com fonte) | SEO e tráfego | grátis | média |
| Marcação e anotações na letra da lei | estudo ativo | pago | baixa |
| Ranking / comparação com outros candidatos | engajamento | pago | baixa |

**Questões: cuidado com direitos.**
- Questões **autorais** no estilo da banca são o caminho seguro.
- Questões de provas anteriores só com fonte (banca, ano, cargo) e depois de confirmar que o uso é permitido. Não copiar comentários de outras plataformas.

---

## 5. Cobrança

### 5.1 Modelo recomendado

**Pagamento único com validade, "até a prova",** em vez de assinatura mensal recorrente.
- Combina com o comportamento do concurseiro (estuda até a prova e para).
- Evita cobrança recorrente, cancelamentos e cartões recusados todo mês.
- Funciona bem com Pix, o meio preferido no Brasil.

Estrutura sugerida (valores são **hipóteses a validar** com pesquisa e teste, não decisões):

| Plano | Conteúdo | Validade | Hipótese de preço |
|---|---|---|---|
| Grátis | 3–4 resoluções, amostra de questões, novidades do concurso | — | R$ 0 |
| PRF Completo | todas as resoluções, questões, flashcards, quadro do CTB, simulados | 12 meses | à vista no Pix com desconto ou parcelado no cartão |
| Mensal (opcional, depois) | o mesmo do Completo | 30 dias | para quem quer testar |

- **Preço de lançamento** para a lista de espera (escassez real: vagas ou prazo).
- **Garantia:** compras online têm direito de arrependimento de 7 dias pelo Código de Defesa do Consumidor (art. 49). Comunicar isso como garantia.
- Definir o preço depois de levantar quanto custam as alternativas que o candidato já usa (cursos, bancos de questões).

### 5.2 Meio de pagamento

| Opção | Prós | Contras |
|---|---|---|
| **Mercado Pago** (Checkout Pro) | Pix e cartão parcelado; conhecido no Brasil; webhooks para liberar o acesso | integração e nota fiscal por nossa conta |
| Stripe | ótima API, Pix disponível | menos familiar ao público; conferir taxas no Brasil |
| Asaas | Pix, boleto, cartão; emite nota fiscal | menos conhecido do consumidor |
| Hotmart / Kiwify | cuidam do pagamento, nota e afiliados | taxa maior; área de membros própria não combina com o site 3D (dá para integrar por webhook) |

**Recomendação:** Mercado Pago (Pix + cartão), integrado por webhook ao nosso login. Reavaliar Hotmart/Kiwify se quisermos um programa de **afiliados** (professores e influenciadores de concurso vendendo o acesso).

### 5.3 Como o acesso é liberado (técnico)
1. O candidato cria conta e escolhe o plano.
2. O pagamento é feito no checkout do provedor.
3. O provedor avisa nosso servidor (webhook com assinatura verificada).
4. O servidor grava o direito de acesso com data de validade.
5. O conteúdo pago só é enviado pelo servidor a quem tem acesso válido. **Nada do pago vai no código público** (hoje vai: precisa mudar antes de cobrar).
6. Limite de dispositivos simultâneos por conta, para reduzir compartilhamento de senha.

---

## 6. Gestão

### 6.1 Produção de conteúdo
- **Fluxo por resolução:** levantar o texto oficial → cadastrar os dispositivos → `verificar:citacoes` → escrever as fichas → revisão → publicar.
- **Revisão jurídica:** antes de cobrar, ter um revisor (professor de legislação de trânsito ou policial com experiência em ensino) para revisar cada resolução. Registrar quem revisou e quando.
- **Ritmo:** definir a meta (ex.: uma resolução por semana) depois de medir quanto tempo leva a próxima.
- **Atualização:** acompanhar o DOU e o site do Ministério dos Transportes para novas resoluções do CONTRAN; quando uma norma mudar, atualizar o texto oficial e rodar a conferência. Assinantes são avisados.

### 6.2 Legal e administrativo
- [ ] **Começar como pessoa física** (decidido): CNPJ não é obrigatório para vender. Renda no carnê-leão (tabela progressiva, até 27,5%) e INSS como autônomo. **Antes da primeira venda**, consulta rápida com contador: quanto se paga como pessoa física, a partir de que faturamento compensa abrir empresa (Simples Nacional) e se a atividade cabe no MEI.
- [ ] Não há isenção por "venda de conhecimento": a imunidade do art. 150, VI, "d" da Constituição (livros, inclusive eletrônicos, RE 330.817) afasta impostos sobre o produto, não o imposto de renda de quem vende; e uma plataforma interativa com questões dificilmente seria tratada como livro.
- [ ] Enquadramento do produto: **plataforma/material de estudo digital**, não "curso" (sem aulas, carga horária nem certificado). Usar esses termos na comunicação; o contador define o enquadramento fiscal.
- [ ] Termos de uso e política de privacidade (LGPD): dados coletados, finalidade, exclusão de conta.
- [ ] Aviso permanente: "Conteúdo informativo. Não substitui o texto publicado no Diário Oficial da União."
- [ ] Créditos e licenças: modelo 3D (CC BY 4.0, crédito visível), fontes (OFL).
- [ ] Não usar marca, brasão ou nome da PRF de forma que sugira vínculo oficial.

### 6.3 Métricas
| Métrica | Para quê |
|---|---|
| Visitas e origem (busca, redes, indicação) | onde investir divulgação |
| Cadastros na lista de espera / contas criadas | interesse real |
| Conversão grátis → pago | se o freemium funciona |
| Uso por resolução e questões respondidas | o que tem valor |
| Pedidos de reembolso e motivo | qualidade |
| Erros de conteúdo reportados | confiabilidade |

### 6.4 Divulgação
- **Conteúdo com fonte** sobre o concurso, a PEC e a entrevista do diretor-geral (um texto por assunto, com links), para atrair buscas.
- **Vídeos curtos** do veículo 3D explicando uma regra (Instagram, TikTok, YouTube Shorts): o 3D é o que diferencia.
- **Prévias de compartilhamento** já prontas: cada ficha gera uma imagem com a regra.
- **Parcerias** com professores e perfis de concurso (afiliados, ver 5.2).
- **E-mail** para a lista de espera: novidades do concurso e uma resolução nova por vez.

---

## 7. Mudanças técnicas

| Mudança | Onde | Fase |
|---|---|---|
| Remover modo motorista e seletor de modo | `ConcurseiroAccessContext`, `SidebarMenu`, `InfoPanel`, tipos `ConteudoMotorista`/`ConteudoConcurseiro` | 1 |
| Resumo no topo da ficha (antigo "motorista.explicacao") | `src/types/conteudo.ts`, fichas | 1 |
| Campo `acesso: 'gratis' \| 'pago'` por resolução/assunto | `src/types/conteudo.ts`, `src/data/` | 1 |
| Resolução como entidade própria no menu (além do tema) | `src/data/normas`, menu | 1 |
| Textos, SEO e imagens de prévia voltados à PRF | `src/lib/metadados.ts`, `imagemPrevia.tsx`, layout | 1 |
| Lista de espera (formulário + armazenamento) | nova rota + banco | 1 |
| Login (Firebase Authentication) | novo | 2 |
| Banco de dados: usuários, acessos, progresso, questões | Firestore (Firebase) | 2 |
| Conteúdo pago servido pelo servidor (não estático) | rotas protegidas, Server Components | 2 |
| Checkout + webhook do provedor de pagamento | novo | 2 |
| Padrão de conteúdo: página da resolução (ficha técnica, mapa, linha do tempo), `teoria`, `visuais`, `revisao` e `questoes` no assunto | `src/types/conteudo.ts`, `src/data/`, `InfoPanel` | 1 |
| Navegação dentro do painel (abas ou índice) para o conteúdo mais longo | `InfoPanel` | 1 |
| Verificar a cobertura integral: artigos da norma sem assunto | `scripts/verificar-citacoes.ts` | 1 |
| Questões, flashcards, simulados | novo | 3 |
| Troca de veículo 3D (moto, caminhão, ônibus) | `CarStage`, `three/carro.ts` | 3 |
| Testes automatizados (navegação, disposição dos cards, cobrança) | novo | 2 |

> Hoje o site é 100% estático. O conteúdo gratuito pode continuar estático (rápido e bom para busca); o pago passa a exigir servidor.

---

## 8. Roteiro por fases

Prazos em semanas de trabalho; ajustar conforme a notícia do concurso.

**Fase 0 · Decisões e levantamento (1–2 semanas)**
- [ ] Conferir as fontes do contexto (seção 1).
- [x] Obter o edital de 2021 e listar o conteúdo de trânsito (seção 3.1).
- [x] Mapear as resoluções de 2018 e 2021 para as normas vigentes (`docs/editais/mapeamento-resolucoes.md`).
- [ ] Levantar as provas de 2019 e 2021 para medir a incidência por assunto.
- [x] Escolher as resoluções gratuitas: 960, 969 e 970 (seção 3.2).
- [x] Provedor de pagamento: Mercado Pago (Pix e cartão). Preço: em aberto.
- [ ] Encontrar revisor jurídico.

**Roteiro de lançamento (decidido em 12/11/2026): lançar o gratuito o quanto antes e abrir pré-venda com preço de fundador.** O concurso não tem data, mas já há candidatos estudando; quem aparecer primeiro com material confiável ganha a lembrança do candidato. A pré-venda valida se pagam antes de construir todo o módulo pago; ser transparente sobre o que já existe e o cronograma de liberação, com garantia de 7 dias.

**Semana 1 · Reposicionar e publicar**
- [x] Remover o modo motorista; textos voltados ao candidato da PRF.
- [x] Apresentação na tela inicial com os fatos dos editais (trânsito: 25–33% da prova, eliminatório, desempate).
- [x] Lista de espera por e-mail (Firestore; testada em produção em 13/11/2026).
- [ ] Publicar: ~~merge do PR~~, ~~Vercel~~ (no ar no endereço .vercel.app), domínio próprio (`NEXT_PUBLIC_SITE_URL`), ~~estatísticas de acesso~~ (Vercel Web Analytics). *(contas: Fernando)*

**Semana 2 · Padrão de conteúdo (seção 3.4), com Vidros como piloto**
- [x] Tipos e painel para o novo padrão: página da resolução, teoria, itens visuais, revisão rápida, questões; abas no assunto (decisão 7).
- [x] Vidros completo no padrão: página da 960; Películas e Danos com aula; novos assuntos Vidro de segurança, Inscrições e cortinas e Medição (MTL); os 23 artigos cobertos. Falta a revisão por uma segunda pessoa.

**Semanas 2–4 · Completar as gratuitas no padrão**
- [x] Vidros (960/2022): primeira versão (carro, letra da lei, pontos de prova, infração).
- [ ] Placas (969/2022).
- [ ] Sinalização e iluminação (970/2022).

**Semanas 2–3 · Questões Certo/Errado**
- [ ] Componente de questões (estilo Cebraspe: +1 acerto, −1 erro), com comentário e artigo da lei.
- [ ] ~20 questões autorais por norma; amostra liberada nas gratuitas.

**Semanas 3–5 · Área paga e pré-venda**
- [ ] Login e banco (Firebase Authentication e Firestore), conteúdo pago entregue só pelo servidor.
- [ ] Checkout Pix/cartão (Mercado Pago) com liberação automática.
- [ ] Álcool (1.031/2026) como primeira norma paga.
- [ ] Termos de uso e política de privacidade.
- [ ] Abrir a pré-venda para a lista de espera (preço de fundador).

**Em paralelo (Fernando):** contas Vercel, Firebase e Mercado Pago; domínio; conversa com contador; preço de fundador e preço cheio; horas semanais para revisar o conteúdo de cada norma.

**Fase 3 · Profundidade (contínuo)**
- [ ] Quadro completo de infrações do CTB.
- [ ] Flashcards e simulados.
- [ ] Outros veículos 3D.
- [ ] Uma resolução nova por ciclo, até cobrir o edital.

**Gatilhos que mudam o plano**
- **Edital publicado:** congelar o conteúdo pelo edital novo, priorizar exatamente o que ele cobra, intensificar a divulgação.
- **Concurso adiado ou negado:** manter o freemium; avaliar ampliar para outros concursos que cobram legislação de trânsito (polícias militares, Detrans, guardas municipais).

---

## 9. Riscos

| Risco | Efeito | Como reduzir |
|---|---|---|
| O concurso não sair logo | vendas abaixo do esperado | validade de 12 meses; conteúdo útil para outros concursos |
| Edital cobrar conteúdo diferente | retrabalho | começar pelo núcleo que todo edital cobra (CTB e resoluções de alta incidência) |
| Norma mudar depois de publicada | conteúdo errado | conferência automática, monitorar o DOU, avisar assinantes |
| Erro jurídico no conteúdo | perda de confiança, reembolsos | revisor, fontes oficiais, canal para reportar erro |
| Conteúdo pago copiado | perda de receita | conteúdo pago só no servidor; limite de dispositivos |
| Uso indevido de questões de terceiros | problema de direitos | questões autorais; provas antigas só com fonte e permissão |
| Dependência de uma pessoa para produzir | ritmo lento | modelo de ficha padronizado; revisor externo |

---

## 10. Decisões em aberto

2. Provedor de pagamento: Mercado Pago, Stripe, Asaas ou Hotmart/Kiwify?
3. Preço de fundador, preço cheio e validade do plano.
4. Quem faz a revisão jurídica?
5. Domínio definitivo do site.
6. Expandir para outros concursos desde já ou só se o da PRF demorar?
7. Questões de provas anteriores da banca: usar (com fonte) ou só autorais? Hoje: só autorais (seção 4.3).

---

## Registro de decisões

| Data | Decisão | Motivo |
|---|---|---|
| 12/11/2026 | Site 100% voltado a concurseiros, foco no concurso da PRF; mantém nome e ideia | rumor de concurso, PEC da Segurança Pública e declaração sobre ampliação do efetivo (a confirmar) |
| 12/11/2026 | Sai o modo motorista / concurseiro | um só público |
| 12/11/2026 | Freemium: 3–4 resoluções grátis, restante pago | vitrine do produto e captação |
| 12/11/2026 | Vidros (Res. 960/2022) é a primeira resolução gratuita | já está pronta e conferida; cobre 3 das 39 resoluções do edital de 2021 (216/2006, 253/2007 e 254/2007, revogadas por ela) |
| 12/11/2026 | Gratuitas: Vidros (960/2022), Placas (969/2022) e Sinalização e iluminação (970/2022); Álcool (1.031/2026) no pago | visuais no carro, substituem 9 resoluções cobradas; álcool é o destaque do pago |
| 12/11/2026 | Lançar o gratuito o quanto antes e abrir pré-venda com preço de fundador (roteiro na seção 8) | concurso sem data, mas candidatos já estudando |
| 12/11/2026 | Vender como pessoa física no início; contador antes da primeira venda | CNPJ não é obrigatório; não há isenção de IR por "venda de conhecimento" |
| 12/11/2026 | Produto é plataforma/material de estudo digital, não curso | sem aulas, carga horária nem certificado |
| 12/11/2026 | Ficha única: em resumo, pode/não pode, pontos de prova, letra da lei, na fiscalização, infração e penalidade; dicas ao motorista reescritas do ponto de vista da fiscalização | conteúdo de motorista vira o resumo, sem perder a base para quem não conhece a norma |
| 12/11/2026 | Introdução na tela inicial (fatos dos editais, grátis/completo, lista de espera); site se declara independente da PRF e da banca | conversão e transparência |
| 12/11/2026 | Firebase (Google) no lugar do Supabase: lista de espera no Firestore, gravada só pelo servidor (Firebase Admin; regras negam acesso pelo navegador); login futuro com Firebase Authentication | escolha do Fernando; nenhuma chave no navegador |
| 13/11/2026 | Conta Google própria do projeto (Firebase, e-mail de contato); GitHub e Vercel na conta pessoal do Fernando, transferíveis depois. Vercel Hobby até a pré-venda; ao vender, plano Pro ou outra hospedagem (Hobby é só para uso não comercial) | separar dados e contato do projeto sem complicar o deploy |
| 13/11/2026 | Padrão de conteúdo de nível de cursinho (seção 3.4): página da resolução, assunto como aula (carro, resumo, teoria, visual, lei, pegadinhas, infração, fiscalização, questões, revisão) e ficha curta por peça; Vidros como piloto antes de Placas | o conteúdo é tão importante quanto o visual; Placas e Iluminação já nascem completas |
| 13/11/2026 | Abas no assunto (Resumo · Teoria · Lei · Questões); ficha da peça em rolagem única | conteúdo de aula ficou longo; a ficha continua curta |
| 13/11/2026 | Novo status "Exigência" (roxo) para regras de material, como vidro laminado | "Tem limite" não descreve exigência de tipo de vidro |
| 13/11/2026 | Desktop: menu esquerdo recolhível e painel direito com largura ajustável pela borda; clique no carro devolve a largura padrão | mais área para o carro ou para a leitura, conforme o momento do estudo |
| 13/11/2026 | Teto solar criado no carro 3D (o modelo não tinha) | a regra do art. 4º, § 3º, precisa de um vidro no teto para ser vista e tocada |
| 13/11/2026 | Carro prata (`#c3cad3`) no lugar do amarelo original | o amarelo se confundia com o destaque dos vidros; prata contrasta com asfalto e céu e deixa todas as cores das regras em evidência (comparado com branco e grafite) |
| 13/11/2026 | Correção: área crítica dos automóveis passa a ser só a metade esquerda da região varrida pelas palhetas (art. 16) no 3D, no diagrama e nos textos; antes o 3D usava o lado esquerdo inteiro | o desenho antigo contrariava a norma; o ponto virou pegadinha nova (questão danos-08) |
| 14/11/2026 | Diagrama de danos da aba Teoria desenhado pelo mesmo pintor do 3D: vista de fora, sem volante, proporções reais de para-brisa de carro e de caminhão e palhetas de tamanhos diferentes | o diagrama antigo não seguia o padrão do carro; vermelho onde não pode dano, amarelo onde há tolerância |
| 14/11/2026 | Cavalo mecânico: modelo "low poly DAF xf105" (Alvin.Woodly, CC BY 4.0) com as letras DAF/XF removidas; exceção à regra de não usar veículos de marca, com crédito ao autor | cara chata 4x2, como os mais comuns no Brasil; peças já separadas (luzes, para-brisa, chassi); não havia modelo genérico equivalente com licença livre |
| 14/11/2026 | Caminhão só nos assuntos com regra própria para pesados (`Assunto.veiculo`); os gerais ficam no automóvel, com transição animada entre os dois | o candidato vê no caminhão só o que muda para ele; Películas, Inscrições etc. não têm regra específica |
| 14/11/2026 | Novo assunto "Danos: ônibus, micro-ônibus e caminhões" (art. 15), no caminhão 3D; o mapa da norma aponta o art. 15 para ele | a área crítica de 50 × 40 cm e a tolerância de 3 danos são o caso mais claro de regra própria dos pesados na Res. 960 |
| 14/11/2026 | O enquadramento do caminhão-trator (art. 15 ou 16) fica em "Atenção", com as definições do CTB (Anexo I) | o CTB distingue caminhão de caminhão-trator, e a Resolução só cita caminhões; não resolver por conta própria |
| 14/11/2026 | O caminhão do 3D passa a ser um caminhão de carga com carroceria ("FORD CARGO MAX TRUCK 2428e", Rick_modding, CC BY 4.0, sem as inscrições da marca e do modelo, cabine repintada de branco); o cavalo mecânico fica guardado (`'caminhao-trator'`), sem uso | a Res. 960 fala em "caminhões"; um caminhão de carga ilustra o art. 15 sem a dúvida do caminhão-trator e também serve para a faixa de 20 cm dos veículos de carga acima de 3.500 kg. Mesma exceção à regra de marcas aplicada ao cavalo |
| 14/11/2026 | Sai do assunto de pesados o aviso sobre o caminhão-trator (Atenção, teoria, revisão e conexão com o Anexo I do CTB) | com um caminhão de carga no 3D, a dúvida deixa de aparecer; a banca cobra a letra do art. 15 ("caminhões") |
| 14/11/2026 | MBFT (Res. 985/2022) convertido em JSON (`docs/normas/mbft/`); a ficha 672-61 diz "caminhões (incluindo caminhões-tratores)", mas os editais cobram a 985 "exceto as fichas". Não entra no conteúdo por ora | evitar confundir o candidato com material que o edital exclui; decisão de usar como nota de fiscalização ainda em aberto |
| 12/11/2026 | Referência de conteúdo: editais PRF de 2021 e 2018 até sair edital novo; o núcleo são as 28 resoluções cobradas nos dois, convertidas para as normas de hoje | trânsito foi 25% (2021) e 33% (2018) da prova objetiva, eliminatório e critério de desempate |

## Andamento

Histórico do que já foi feito antes desta decisão (detalhes no `CLAUDE.md` e no PR #1):
- Etapas 0 a 4 e 6 do plano anterior concluídas: modelo de conteúdo com citações conferidas, carro 3D por zonas, navegação por URL, layout de celular, prévias de compartilhamento.
- Cards do carro que nunca se sobrepõem.

Semana 1 (12/11/2026):
- Modos removidos: `ConcurseiroAccessContext`, `ConcurseiroGate` e `features.ts` apagados; campos `motorista`/`concurseiro` viraram `essencial`/`prova`; `comoConferir` virou `naFiscalizacao`.
- `Tema.acesso` e selos "Grátis"/"Completo" no menu e na introdução; temas futuros na ordem do roteiro (Placas, Iluminação, Álcool, Equipamentos).
- Tela inicial com introdução e lista de espera (`/api/lista-espera`, Firestore, `firestore.rules`, `.env.example`).
- Títulos, descrições, palavras-chave e imagem de prévia da tela inicial voltados à PRF.
- Pendente (Fernando): criar o projeto no Firebase, ativar o Firestore e publicar `firestore.rules`; gerar a chave da conta de serviço; na Vercel, definir `NEXT_PUBLIC_SITE_URL`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY`; merge do PR e domínio.

13/11/2026:
- PR #1 mesclado; site publicado na Vercel com as variáveis do Firebase. Cadastro na lista de espera testado em produção e gravado no Firestore.
- Vercel Web Analytics ativado no projeto e incluído no layout (`@vercel/analytics`, sem cookies).
- Falta da semana 1: domínio próprio (e então `NEXT_PUBLIC_SITE_URL`).

Semana 2 (13/11/2026):
- Padrão de conteúdo implementado: página da resolução (`/vidros`), aula em abas, questões Certo/Errado com placar (+1/−1), itens visuais (tabelas, linha do tempo, mapa de danos, simulador do VC).
- Res. 960 inteira cadastrada: 77 citações conferidas com o texto oficial (eram 44); verificação de cobertura dos 23 artigos.
- Vidros com 5 assuntos e 37 questões autorais: Películas (9), Danos (7), Vidro de segurança (7), Inscrições e cortinas (7), Medição (7).
- Nó do carro com 3+ assuntos (o para-brisa tem 4) e arranjo compacto no celular.
- Pendente: revisão do conteúdo por uma segunda pessoa (checklist da seção 3.4).
