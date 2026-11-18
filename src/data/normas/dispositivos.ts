import type { Dispositivo } from '@/types/conteudo';

/**
 * Texto literal dos dispositivos citados no site. Cada trecho é cadastrado uma única vez e
 * as fichas apenas apontam para ele pelo id.
 *
 * Regras:
 * - `texto` é cópia exata do texto publicado. Não resumir, não corrigir grafia, não reordenar.
 * - Dispositivos com `fonte` preenchida são conferidos por `npm run verificar:citacoes`
 *   contra docs/normas/<fonte>.txt (extraído do PDF do DOU).
 * - `fonte: null` = ainda sem cópia oficial no repositório; o script lista como pendente.
 * - Fontes: res960/res989 (PDF do DOU) e ctb (página compilada do Planalto, sem trechos riscados).
 * - Quando uma redação é alterada, a antiga ganha `revogadoPor` e permanece cadastrada
 *   (usada no histórico da redação).
 */
export const DISPOSITIVOS = {
  // ---------------------------------------------------------------------------
  // Res. CONTRAN 960/2022: Capítulo I, áreas envidraçadas
  // ---------------------------------------------------------------------------
  // Arts. 1º a 3º e 5º a 7º: objeto e vidros de segurança
  'res960.art1': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 1º',
    texto:
      "Art. 1º Esta Resolução dispõe sobre os requisitos de segurança de vidros, a visibilidade para fins de circulação, o uso de vidros em veículos blindados e o uso de medidores de transmitância luminosa.",
    fonte: 'res960',
  },
  'res960.art2': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 2º, caput',
    texto:
      "Art. 2º Os veículos automotores, os reboques e semirreboques deverão sair de fábrica com as suas partes envidraçadas equipadas com vidros de segurança que atendam aos termos desta Resolução e aos requisitos estabelecidos na ABNT NBR 9491.",
    fonte: 'res960',
  },
  'res960.art2.pu': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 2º, parágrafo único',
    texto:
      "Parágrafo único. A exigência prevista no caput aplica-se também aos vidros destinados a reposição.",
    fonte: 'res960',
  },
  'res960.art3': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 3º',
    texto:
      "Art. 3º Para circulação nas vias públicas do território nacional é obrigatório o uso de vidro de segurança laminado no para-brisa de todos os veículos e de vidro de segurança temperado, uniformemente protendido, ou laminado, nas demais partes envidraçadas.",
    fonte: 'res960',
  },
  'res960.art5': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 5º',
    texto:
      "Art. 5º Os vidros de segurança aos quais se refere esta Resolução, deverão trazer marcação indelével em local de fácil visualização contendo, no mínimo, a marca do fabricante do vidro e o símbolo de conformidade com a legislação brasileira definido pelo Instituto Nacional de Metrologia, Qualidade e Tecnologia (INMETRO).",
    fonte: 'res960',
  },
  'res960.art6': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 6º, caput',
    texto:
      "Art. 6º Fica a critério do órgão máximo executivo de trânsito da União admitir, exclusivamente para os vidros de segurança, para efeito de comprovação do atendimento da NBR 9491 e suas normas complementares, os resultados de testes e ensaios obtidos por procedimentos ou métodos equivalentes, realizados no exterior.",
    fonte: 'res960',
  },
  'res960.art6.par1': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 6º, § 1º',
    texto:
      "§ 1º Serão aceitos os resultados de ensaios admitidos por órgãos reconhecidos pela Comissão ou Comunidade Europeia e os Estados Unidos da América, em conformidade com os procedimentos adotados por esses organismos.",
    fonte: 'res960',
  },
  'res960.art6.par2': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 6º, § 2º',
    texto:
      "§ 2º Nos casos previstos no § 1º, a identificação da conformidade dos vidros de segurança dar-se-á, alternada ou cumulativamente, mediante marcação indelével que contenha no mínimo a marca do fabricante e o símbolo de conformidade da Comissão ou da Comunidade Europeia, constituídos pela letra \"E\" maiúscula acompanhada de um índice numérico, representando o país emitente do certificado, inseridos em um círculo, ou pela letra \"e\" minúscula acompanhada de um número representando o país emitente do certificado, inseridos em um retângulo e, se dos Estados Unidos da América, simbolizado pela sigla \"DOT\".",
    fonte: 'res960',
  },
  'res960.art7': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 7º',
    texto:
      "Art. 7º O fabricante, o representante e o importador do veículo deverão certificar-se de que seus produtos obedecem aos preceitos estabelecidos por esta Resolução, mantendo-se em condição de comprová-los, quando solicitados pelo órgão máximo executivo de trânsito da União.",
    fonte: 'res960',
  },
  'res960.art4': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 4º, caput',
    texto: 'Art. 4º A transmitância luminosa das áreas envidraçadas:',
    fonte: 'res960',
  },
  'res960.art4.I': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 4º, I',
    texto:
      'I - não poderá ser inferior a 70% para os vidros dos para-brisas e das demais áreas envidraçadas indispensáveis à dirigibilidade do veículo; e',
    contexto: 'res960.art4',
    fonte: 'res960',
  },
  'res960.art4.II': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 4º, II',
    texto:
      'II - poderá ser inferior à transmitância luminosa definida no inciso I para os vidros que não interferem nas áreas envidraçadas indispensáveis à dirigibilidade do veículo dotado de espelhos retrovisores externos em ambos os lados.',
    contexto: 'res960.art4',
    redacao: 'Redação dada pela Res. CONTRAN 989/2022',
    vigencia: 'Desde 02/01/2023',
    fonte: 'res989',
  },
  'res960.art4.II.original': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 4º, II (redação original)',
    texto:
      'II - não poderá ser inferior a 28% para os vidros que não interferem nas áreas envidraçadas indispensáveis à dirigibilidade do veículo.',
    contexto: 'res960.art4',
    revogadoPor: 'res960.art4.II',
    vigencia: 'De 01/06/2022 a 01/01/2023',
    fonte: 'res960',
  },
  'res960.art4.par1': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 4º, § 1º',
    texto:
      '§ 1º Consideram-se áreas envidraçadas indispensáveis à dirigibilidade do veículo, conforme ilustrado no Anexo I desta resolução:',
    fonte: 'res960',
  },
  'res960.art4.par1.I': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 4º, § 1º, I',
    texto:
      'I - a área do para-brisa, excluídas a faixa periférica de serigrafia destinada a dar acabamento ao vidro, a área ocupada pela banda degradê, caso existente, conforme estabelece a ABNT NBR 9491, e a faixa de 20 centímetros na parte inferior do para-brisa dos veículos de carga com Peso Bruto Total (PBT) superior a 3.500 kg e dos micro-ônibus e ônibus; e',
    contexto: 'res960.art4.par1',
    fonte: 'res960',
  },
  'res960.art4.par1.II': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 4º, § 1º, II',
    texto:
      'II - as áreas envidraçadas situadas nas laterais dianteiras do veículo, respeitando o campo de visão do condutor.',
    contexto: 'res960.art4.par1',
    fonte: 'res960',
  },
  'res960.art4.par2': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 4º, § 2º',
    texto:
      '§ 2º Aplica-se ao vidro de segurança traseiro (vigia) o disposto no inciso II do caput, desde que o veículo esteja dotado de espelho retrovisor em ambos os lados, conforme a legislação vigente.',
    fonte: 'res960',
  },
  'res960.art4.par3': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 4º, § 3º',
    texto:
      '§ 3º Os vidros de segurança situados no teto dos veículos ficam excluídos dos limites fixados neste artigo.',
    fonte: 'res960',
  },
  'res960.art8': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 8º, caput',
    texto:
      'Art. 8º A aplicação de película não refletiva nas áreas envidraçadas dos veículos automotores, definidas no artigo 2º, será permitida desde que atendidas as mesmas condições de transmitância para o conjunto vidro-película estabelecidas no artigo 4º.',
    fonte: 'res960',
  },
  'res960.art8.par1': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 8º, § 1º',
    texto:
      '§ 1º A marca do instalador e o índice de transmitância luminosa existentes em cada conjunto vidro-película localizadas nas áreas envidraçadas dos veículos indispensáveis à dirigibilidade serão gravados indelevelmente na película por meio de chancela.',
    fonte: 'res960',
  },
  'res960.art8.par2': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 8º, § 2º',
    texto: '§ 2º As informações inscritas na chancela devem ser legíveis pelos lados externos dos vidros.',
    fonte: 'res960',
  },
  'res960.art9': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 9º',
    texto:
      "Art. 9º Fora das áreas envidraçadas indispensáveis à dirigibilidade do veículo, a aplicação de inscrições, pictogramas ou painéis decorativos de qualquer espécie será permitida, desde que o veículo possua espelhos retrovisores externos de ambos os lados e que sejam atendidas as mesmas condições de transmitância para o conjunto vidro-pictograma/inscrição estabelecidas no artigo 4º desta Resolução.",
    fonte: 'res960',
  },
  'res960.art10': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 10, caput',
    texto: 'Art. 10. São vedados:',
    fonte: 'res960',
  },
  'res960.art10.I': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 10, I',
    texto: 'I - a aplicação de películas refletivas nas áreas envidraçadas do veículo;',
    contexto: 'res960.art10',
    fonte: 'res960',
  },
  'res960.art10.II': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 10, II',
    texto:
      'II - a manutenção de películas com bolhas na área crítica de visão do condutor e nas áreas indispensáveis à dirigibilidade do veículo;',
    contexto: 'res960.art10',
    fonte: 'res960',
  },
  'res960.art10.III': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 10, III',
    texto:
      "III - o uso de qualquer inscrição, adesivo, legenda ou símbolo pintados ou afixados nas áreas envidraçadas dos veículos indispensáveis à dirigibilidade;",
    contexto: 'res960.art10',
    fonte: 'res960',
  },
  'res960.art10.IV': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 10, IV',
    texto:
      "IV - o uso de cortinas, persianas fechadas ou similares nos veículos em movimento, salvo nas áreas não indispensáveis à dirigibilidade, desde que possuam espelhos retrovisores em ambos os lados;",
    contexto: 'res960.art10',
    fonte: 'res960',
  },
  'res960.art10.V': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 10, V',
    texto:
      "V - o uso de painéis luminosos que reproduzam mensagens dinâmicas ou estáticas, excetuando-se as utilizadas em transporte coletivo de passageiro com finalidade de informar o serviço ao usuário da linha.",
    contexto: 'res960.art10',
    fonte: 'res960',
  },
  'res960.art11': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 11',
    texto:
      "Art. 11. O disposto na presente Resolução não se aplica às máquinas agrícolas, rodoviárias e florestais e aos veículos destinados à circulação exclusivamente fora das vias públicas e nem aos veículos incompletos, inacabados e destinados à exportação.",
    fonte: 'res960',
  },
  'res960.art12': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 12, caput',
    texto:
      "Art. 12. Os veículos blindados são isentos do uso dos vidros de segurança exigidos no art. 2º e dos requisitos do inciso I do art. 4º, aplicando-se às suas áreas envidraçadas o estabelecido na NBR 16218 da ABNT.",
    redacao: 'Redação dada pela Res. CONTRAN 989/2022',
    vigencia: 'Desde 02/01/2023',
    fonte: 'res989',
  },
  'res960.art12.original': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 12, caput (redação original)',
    texto:
      "Art. 12. Os veículos blindados são isentos do uso dos vidros de segurança exigidos no artigo 2º e dos requisitos do artigo 4º, aplicando-se às suas áreas envidraçadas o estabelecido na NBR 16218 da ABNT.",
    vigencia: 'De 01/06/2022 a 01/01/2023',
    revogadoPor: 'res960.art12',
    fonte: 'res960',
  },
  'res960.art12.pu': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 12, parágrafo único',
    texto:
      "Parágrafo único. A isenção prevista no caput aplica-se também aos vidros destinados a reposição.",
    fonte: 'res960',
  },

  // ---------------------------------------------------------------------------
  // Res. CONTRAN 960/2022: Capítulo II, danos nas áreas envidraçadas
  // ---------------------------------------------------------------------------
  'res960.art13': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 13',
    texto:
      'Art. 13. Para efeito desta Resolução, as trincas e fraturas de configuração circular são consideradas dano ao para-brisa.',
    fonte: 'res960',
  },
  'res960.art14': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 14',
    texto:
      'Art. 14. Na área crítica de visão do condutor e em uma faixa periférica de 2,5 centímetros de largura das bordas externas do para-brisa não devem existir trincas e fraturas de configuração circular e, caso ocorram, não podem ser recuperadas.',
    fonte: 'res960',
  },
  'res960.art15': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 15, caput',
    texto:
      'Art. 15. Nos para-brisas dos ônibus, micro-ônibus e caminhões, a área crítica de visão do condutor, conforme figura ilustrativa do Anexo II, é aquela situada à esquerda do veículo, determinada por um retângulo de 50 centímetros de altura por 40 centímetros de largura, cujo eixo de simetria vertical é demarcado pela projeção da linha de centro do volante de direção, paralela à linha de centro do veículo, cuja base coincide com a linha tangente do ponto mais alto do volante.',
    fonte: 'res960',
  },
  'res960.art15.pu': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 15, parágrafo único',
    texto:
      'Parágrafo único. Nos para-brisas dos veículos de que trata o caput, são permitidos no máximo três danos, exceto nas regiões definidas no art. 14, respeitados os seguintes limites: I - trinca não superior a 20 centímetros de comprimento; e II - fratura de configuração circular não superior a 4 centímetros de diâmetro.',
    fonte: 'res960',
  },
  'res960.art16': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 16, caput',
    texto:
      'Art. 16. Nos demais veículos automotores, a área crítica de visão do condutor é a metade esquerda da região de varredura das palhetas do limpador de para-brisa.',
    fonte: 'res960',
  },
  'res960.art16.pu': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 16, parágrafo único',
    texto:
      'Parágrafo único. Nos para-brisas dos veículos de que trata o caput, são permitidos no máximo dois danos, exceto nas regiões definidas no art. 14, respeitando-se os seguintes limites: I - trinca não superior a 10 centímetros de comprimento; e II - fratura de configuração circular não superior a 4 centímetros de diâmetro.',
    fonte: 'res960',
  },

  // ---------------------------------------------------------------------------
  // Res. CONTRAN 960/2022: Capítulo III, medidores de transmitância luminosa (MTL)
  // ---------------------------------------------------------------------------
  'res960.art17': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 17, caput',
    texto:
      'Art. 17. A verificação dos índices de transmitância luminosa das áreas envidraçadas de veículos estabelecidos nesta Resolução deve ser efetuada por meio de instrumento denominado medidor de transmitância luminosa - MTL.',
    fonte: 'res960',
  },
  'res960.art17.pu': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 17, parágrafo único',
    texto:
      "Parágrafo único. MTL é o instrumento de medição destinado a medir, em valores percentuais, a transmitância luminosa de vidros, películas, filmes e outros materiais simples ou compostos.",
    fonte: 'res960',
  },
  'res960.art18': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 18',
    texto:
      "Art. 18. O MTL das áreas envidraçadas de veículos deve ter seu modelo aprovado pelo INMETRO e ser aprovado na verificação metrológica em periodicidade conforme regulamentação metrológica em vigor.",
    fonte: 'res960',
  },
  'res960.art19': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 19, caput',
    texto:
      'Art. 19. O auto de infração lavrado com base na medição da transmitância luminosa e a respectiva notificação da autuação, além do disposto no CTB, e na legislação complementar, deverão conter, expressas em termos percentuais: I - a medição realizada pelo instrumento; II - o valor considerado para fins de aplicação de penalidade; e III - o limite regulamentado para a área envidraçada fiscalizada.',
    fonte: 'res960',
  },
  'res960.art19.par1': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 19, § 1º',
    texto:
      '§ 1º Para obtenção do Valor Considerado (VC), deverá ser somado à Medição Realizada (MR) o percentual de 7% (VC = MR + 7%).',
    fonte: 'res960',
  },
  'res960.art19.par2': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 19, § 2º',
    texto:
      "§ 2º Além das demais disposições deste artigo, deve ser informada no auto de infração a identificação da área envidraçada objeto da autuação.",
    fonte: 'res960',
  },
  'res960.art20': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 20',
    texto:
      "Art. 20. Quando o MTL for dotado de dispositivo impressor, o registro impresso deve conter os seguintes dados: I - data e hora; II - placa do veículo; III - transmitância medida pelo instrumento; IV - área envidraçada fiscalizada; V - identificação do instrumento; e VI - identificação do agente.",
    fonte: 'res960',
  },

  // ---------------------------------------------------------------------------
  // Res. CONTRAN 960/2022: Capítulo IV, enquadramento das infrações (art. 21)
  // ---------------------------------------------------------------------------
  'res960.art21': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 21, caput',
    texto:
      'Art. 21. O descumprimento do disposto nesta Resolução implicará, conforme o caso, na aplicação ao infrator das seguintes penalidades e medidas administrativas previstas no CTB:',
    fonte: 'res960',
  },
  'res960.art21.I': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 21, I',
    texto:
      "I - art. 230, inciso XII: veículo com painéis luminosos em desacordo com esta Resolução;",
    contexto: 'res960.art21',
    fonte: 'res960',
  },
  'res960.art21.II': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 21, II',
    texto:
      "II - art. 230, inciso XV: veículo com adesivo, inscrição, legenda, painel, pictograma, pintura, símbolo, ou qualquer outro material de caráter publicitário no para-brisa ou no vidro traseiro do veículo, em desacordo com o previsto nesta Resolução;",
    contexto: 'res960.art21',
    fonte: 'res960',
  },
  'res960.art21.III': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 21, III',
    texto: 'III - art. 230, inciso XVI:',
    contexto: 'res960.art21',
    fonte: 'res960',
  },
  'res960.art21.III.a': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 21, III, "a"',
    texto: 'a) veículo com vidros total ou parcialmente cobertos por película refletiva ou opaca;',
    contexto: 'res960.art21.III',
    fonte: 'res960',
  },
  'res960.art21.III.b': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 21, III, "b"',
    texto:
      'b) veículo com vidros cobertos com película não refletiva com índice de transmitância luminosa em desacordo com o previsto nesta Resolução;',
    contexto: 'res960.art21.III',
    fonte: 'res960',
  },
  'res960.art21.III.c': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 21, III, "c"',
    texto: 'c) veículo com vidros cobertos com película não refletiva sem chancela;',
    contexto: 'res960.art21.III',
    fonte: 'res960',
  },
  'res960.art21.III.d': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 21, III, "d"',
    texto:
      'd) veículo com vidros cobertos com película não refletiva com chancela na qual não esteja legível qualquer das informações obrigatórias; e',
    contexto: 'res960.art21.III',
    fonte: 'res960',
  },
  'res960.art21.III.e': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 21, III, "e"',
    texto:
      "e) veículo com adesivo, inscrição, legenda, painel decorativo, pictograma, pintura, símbolo, ou qualquer outro material em desacordo com o previsto nesta Resolução, nas áreas envidraçadas indispensáveis à dirigibilidade.",
    contexto: 'res960.art21.III',
    fonte: 'res960',
  },
  'res960.art21.IV': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 21, IV',
    texto:
      "IV - art. 230, inciso XVII: a) veículo que não possua espelhos retrovisores em ambos os lados, em movimento, com cortinas, persianas ou similares fechadas; e b) veículo que possua espelhos retrovisores em ambos os lados, em movimento, com cortinas, persianas ou similares fechadas, em desacordo com o previsto nesta Resolução;",
    contexto: 'res960.art21',
    fonte: 'res960',
  },
  'res960.art21.V': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 21, V',
    texto: 'V - art. 230, inciso XVIII:',
    contexto: 'res960.art21',
    fonte: 'res960',
  },
  'res960.art21.V.a': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 21, V, "a"',
    texto:
      'a) veículo com dano no para-brisa além dos limites e condições estabelecidos nesta Resolução; e',
    contexto: 'res960.art21.V',
    fonte: 'res960',
  },
  'res960.art21.V.b': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 21, V, "b"',
    texto: 'b) veículo com ausência de qualquer dos vidros de segurança;',
    contexto: 'res960.art21.V',
    fonte: 'res960',
  },
  'res960.art21.VI': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 21, VI',
    texto:
      "VI - art.237: veículo com qualquer vidro de segurança em desacordo com o previsto nesta Resolução.",
    contexto: 'res960.art21',
    fonte: 'res960',
  },
  'res960.art21.pu': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 21, parágrafo único',
    texto:
      "Parágrafo único. As situações infracionais descritas nos incisos deste artigo não afastam a possibilidade de aplicação de outras penalidades previstas no CTB.",
    fonte: 'res960',
  },
  'res960.art22': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 22',
    texto:
      "Art. 22. Fica revogado o art. 3º da Resolução CONTRAN nº 786, de 18 de junho de 2020, e as Resoluções CONTRAN: I - nº 216, de 14 de dezembro de 2006; II - nº 253, de 26 de outubro de 2007; III - nº 254, de 26 de outubro de 2007; IV - nº 334, de 6 de novembro de 2009; V - nº 385, de 2 de junho de 2011; VI- nº 386, de 2 de junho de 2011; VII - nº 580, de 24 de fevereiro de 2016; VIII - nº 707, de 25 de outubro de 2017; e IX - nº 869, de 13 de setembro de 2021.",
    fonte: 'res960',
  },
  'res960.art23': {
    norma: 'res960',
    rotulo: 'Res. CONTRAN 960/2022, art. 23',
    texto:
      "Art. 23. Esta Resolução entra em vigor em 1º de junho de 2022.",
    fonte: 'res960',
  },
  'res989.art3': {
    norma: 'res989',
    rotulo: 'Res. CONTRAN 989/2022, art. 3º',
    texto:
      "Art. 3º Esta Resolução entra em vigor em 2 de janeiro de 2023.",
    fonte: 'res989',
  },

  // ---------------------------------------------------------------------------
  // CTB (Lei 9.503/1997): texto compilado do Planalto (docs/normas/ctb-planalto.html,
  // convertido em docs/normas/ctb.txt sem os trechos riscados/revogados)
  // ---------------------------------------------------------------------------
  'ctb.art111': {
    norma: 'ctb',
    rotulo: 'CTB, art. 111, caput',
    texto: 'Art. 111. É vedado, nas áreas envidraçadas do veículo:',
    fonte: 'ctb',
  },
  'ctb.art111.II': {
    norma: 'ctb',
    rotulo: 'CTB, art. 111, II',
    texto:
      "II - o uso de cortinas, persianas fechadas ou similares nos veículos em movimento, salvo nos que possuam espelhos retrovisores em ambos os lados.",
    contexto: 'ctb.art111',
    fonte: 'ctb',
  },
  'ctb.art111.III': {
    norma: 'ctb',
    rotulo: 'CTB, art. 111, III',
    texto:
      'III - aposição de inscrições, películas refletivas ou não, painéis decorativos ou pinturas, quando comprometer a segurança do veículo, na forma de regulamentação do CONTRAN.',
    contexto: 'ctb.art111',
    redacao: 'Incluído pela Lei nº 9.602/1998',
    fonte: 'ctb',
  },
  'ctb.art111.pu': {
    norma: 'ctb',
    rotulo: 'CTB, art. 111, parágrafo único',
    texto:
      'Parágrafo único. É proibido o uso de inscrição de caráter publicitário ou qualquer outra que possa desviar a atenção dos condutores em toda a extensão do pára-brisa e da traseira dos veículos, salvo se não colocar em risco a segurança do trânsito.',
    fonte: 'ctb',
  },
  'ctb.art230': {
    norma: 'ctb',
    rotulo: 'CTB, art. 230, caput',
    texto: 'Art. 230. Conduzir o veículo:',
    fonte: 'ctb',
  },
  'ctb.art230.XII': {
    norma: 'ctb',
    rotulo: 'CTB, art. 230, XII',
    texto:
      "XII - com equipamento ou acessório proibido;",
    contexto: 'ctb.art230',
    fonte: 'ctb',
  },
  'ctb.art230.XV': {
    norma: 'ctb',
    rotulo: 'CTB, art. 230, XV',
    texto:
      'XV - com inscrições, adesivos, legendas e símbolos de caráter publicitário afixados ou pintados no pára-brisa e em toda a extensão da parte traseira do veículo, excetuadas as hipóteses previstas neste Código;',
    contexto: 'ctb.art230',
    fonte: 'ctb',
  },
  'ctb.art230.XVI': {
    norma: 'ctb',
    rotulo: 'CTB, art. 230, XVI',
    texto: 'XVI - com vidros total ou parcialmente cobertos por películas refletivas ou não, painéis decorativos ou pinturas;',
    contexto: 'ctb.art230',
    fonte: 'ctb',
  },
  'ctb.art230.XVII': {
    norma: 'ctb',
    rotulo: 'CTB, art. 230, XVII',
    texto: 'XVII - com cortinas ou persianas fechadas, não autorizadas pela legislação;',
    contexto: 'ctb.art230',
    fonte: 'ctb',
  },
  'ctb.art230.XVIII': {
    norma: 'ctb',
    rotulo: 'CTB, art. 230, XVIII',
    texto:
      'XVIII - em mau estado de conservação, comprometendo a segurança, ou reprovado na avaliação de inspeção de segurança e de emissão de poluentes e ruído, prevista no art. 104;',
    contexto: 'ctb.art230',
    fonte: 'ctb',
  },
  'ctb.art230.sancao.VII-XIX': {
    norma: 'ctb',
    rotulo: 'CTB, art. 230, sanção dos incisos VII a XIX',
    texto: 'Infração - grave; Penalidade - multa; Medida administrativa - retenção do veículo para regularização;',
    fonte: 'ctb',
  },
  'ctb.art237': {
    norma: 'ctb',
    rotulo: 'CTB, art. 237',
    texto:
      "Art. 237. Transitar com o veículo em desacordo com as especificações, e com falta de inscrição e simbologia necessárias à sua identificação, quando exigidas pela legislação: Infração - grave; Penalidade - multa; Medida administrativa - retenção do veículo para regularização.",
    fonte: 'ctb',
  },
  'ctb.art258.II': {
    norma: 'ctb',
    rotulo: 'CTB, art. 258, II',
    texto:
      'II - infração de natureza grave, punida com multa no valor de R$ 195,23 (cento e noventa e cinco reais e vinte e três centavos);',
    redacao: 'Redação dada pela Lei nº 13.281/2016',
    fonte: 'ctb',
  },
  'ctb.art259.II': {
    norma: 'ctb',
    rotulo: 'CTB, art. 259, II',
    texto: 'II - grave - cinco pontos;',
    fonte: 'ctb',
  },
  // CTB, Anexo I (conceitos e definições)
  'ctb.anexoI.caminhao': {
    norma: 'ctb',
    rotulo: 'CTB, Anexo I, "caminhão"',
    texto:
      'CAMINHÃO - veículo automotor destinado ao transporte de carga com peso bruto total superior a 3.500 kg (três mil e quinhentos quilogramas), podendo tracionar ou arrastar outro veículo, respeitada a capacidade máxima de tração.',
    redacao: 'Incluído pela Lei nº 14.440/2022',
    fonte: 'ctb',
  },
  'ctb.anexoI.caminhaoTrator': {
    norma: 'ctb',
    rotulo: 'CTB, Anexo I, "caminhão-trator"',
    texto: 'CAMINHÃO-TRATOR - veículo automotor destinado a tracionar ou arrastar outro.',
    fonte: 'ctb',
  },
} satisfies Record<string, Dispositivo>;

export type DispositivoId = keyof typeof DISPOSITIVOS;

export function obterDispositivo(id: DispositivoId): Dispositivo {
  return DISPOSITIVOS[id];
}

/** Texto do dispositivo precedido do texto do "pai" (caput/inciso), quando houver. */
export function textoComContexto(id: DispositivoId): string {
  const d: Dispositivo = DISPOSITIVOS[id];
  if (!d.contexto) return d.texto;
  const pai = DISPOSITIVOS[d.contexto as DispositivoId];
  return pai ? `${pai.texto} [...] ${d.texto}` : d.texto;
}
