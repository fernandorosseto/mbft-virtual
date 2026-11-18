import type { Assunto, Enquadramento, Ficha } from '@/types/conteudo';

const VIDRO_EM_DESACORDO: Enquadramento = {
  situacao: 'Vidro de segurança em desacordo com a Resolução',
  infracao: 'ctb.237',
  base: 'res960.art21.VI',
};
const AUSENCIA_DE_VIDRO: Enquadramento = {
  situacao: 'Ausência de qualquer dos vidros de segurança',
  infracao: 'ctb.230.XVIII',
  base: 'res960.art21.V.b',
};

const MARCACAO =
  'A marcação indelével, em local de fácil visualização, traz no mínimo a marca do fabricante do vidro e o símbolo de conformidade do INMETRO (art. 5º).';

const PONTOS_COMUNS = [
  'Vidro em desacordo com a Resolução: art. 237 do CTB (art. 21, VI). Ausência de vidro de segurança: art. 230, XVIII (art. 21, V, "b"). As duas são graves, com retenção.',
];

/** Fichas das laterais e da vigia: temperado ou laminado. */
function fichaDemaisVidros(zona: Ficha['zona'], nome: string): Ficha {
  return {
    assunto: 'vidro-seguranca',
    zona,
    status: 'exigencia',
    resumoCurto: 'temp./lamin.',
    destaque: {
      valor: 'Temperado ou laminado',
      rotulo: 'Vidro de segurança exigido',
      detalhe: 'Temperado uniformemente protendido, ou laminado',
    },
    essencial: {
      explicacao: `${nome} pode ser de vidro de segurança temperado (uniformemente protendido) ou laminado. Vidro comum, sem ser de segurança, não é admitido.`,
      pode: ['Vidro de segurança temperado, uniformemente protendido.', 'Vidro de segurança laminado.'],
      naoPode: ['Vidro que não seja de segurança.', 'Circular sem o vidro.'],
      naFiscalizacao: [MARCACAO],
    },
    prova: {
      pontosDeProva: [
        'Nas demais partes envidraçadas (fora o para-brisa), exige-se vidro de segurança temperado, uniformemente protendido, ou laminado (art. 3º).',
        ...PONTOS_COMUNS,
      ],
    },
    dispositivos: ['res960.art3', 'res960.art5', 'res960.art21.V.b', 'res960.art21.VI'],
    enquadramentos: [VIDRO_EM_DESACORDO, AUSENCIA_DE_VIDRO],
  };
}

export const vidroSeguranca: Assunto = {
  id: 'vidro-seguranca',
  tema: 'vidros',
  titulo: 'Vidro de segurança',
  tituloCurto: 'Segurança',
  subtitulo: 'Laminado, temperado, marcação e veículos blindados',
  zonas: ['para-brisa', 'laterais-dianteiros', 'laterais-traseiros', 'vigia'],

  visaoGeral: {
    resumo:
      'Todo veículo sai de fábrica com vidros de segurança. Para circular, o para-brisa tem de ser laminado; os demais vidros, temperado ou laminado. Os vidros trazem marcação com a marca do fabricante e o símbolo do INMETRO.',
    destaque: {
      valor: 'Laminado',
      rotulo: 'Obrigatório no para-brisa de todos os veículos',
      detalhe: 'Nos demais vidros: temperado (uniformemente protendido) ou laminado',
    },
    essencial: {
      explicacao:
        'Os veículos automotores, os reboques e os semirreboques saem de fábrica com vidros de segurança, e os vidros de reposição seguem a mesma exigência. Para circular, o para-brisa precisa ser de vidro laminado; os demais vidros podem ser temperados ou laminados. Os blindados têm regra própria.',
      pode: [
        'Vidro temperado (uniformemente protendido) ou laminado nas laterais e na vigia.',
        'Nos blindados, vidros conforme a ABNT NBR 16218, no lugar dos vidros de segurança do art. 2º.',
      ],
      naoPode: [
        'Para-brisa que não seja de vidro de segurança laminado.',
        'Vidro de reposição que não atenda à Resolução e à ABNT NBR 9491.',
        'Circular sem qualquer dos vidros de segurança.',
      ],
      naFiscalizacao: [
        MARCACAO,
        'Quando admitidos ensaios feitos no exterior, a marcação pode trazer o símbolo europeu ("E" maiúsculo com número, num círculo, ou "e" minúsculo com número, num retângulo) ou a sigla "DOT", dos Estados Unidos (art. 6º, § 2º).',
      ],
    },
    prova: {
      pontosDeProva: [
        'A exigência de fábrica alcança veículos automotores, **reboques e semirreboques**, e também os **vidros de reposição** (art. 2º e parágrafo único).',
        'Laminado no para-brisa de **todos** os veículos; temperado, uniformemente protendido, **ou** laminado nas demais partes (art. 3º).',
        'Marcação: "no mínimo" a marca do **fabricante do vidro** e o símbolo de conformidade do **INMETRO** (art. 5º).',
        'Ensaios do exterior: admitidos a critério do órgão máximo executivo de trânsito da União, só para os vidros de segurança; aceitos os de órgãos reconhecidos pela Comissão ou Comunidade Europeia e pelos EUA (art. 6º e § 1º).',
        'Fabricante, representante e importador do veículo devem certificar-se do cumprimento da Resolução e poder comprová-lo quando solicitados pelo órgão máximo executivo de trânsito da União (art. 7º).',
        'Blindados: isentos dos vidros de segurança do art. 2º e dos requisitos do **inciso I** do art. 4º, aplicando-se a ABNT NBR 16218; a isenção alcança os vidros de reposição (art. 12, com redação da Res. 989/2022, e parágrafo único).',
        ...PONTOS_COMUNS,
      ],
      historico: [
        'Na redação original, o art. 12 isentava os blindados dos requisitos do art. 4º como um todo.',
        'Desde 02/01/2023 (Res. 989/2022), a isenção é dos requisitos do inciso I do art. 4º.',
      ],
      atencao: [
        'Com a nova redação, o art. 12 não diz expressamente como o inciso II do art. 4º se aplica aos vidros dos blindados.',
      ],
    },
    dispositivos: [
      'res960.art2',
      'res960.art2.pu',
      'res960.art3',
      'res960.art5',
      'res960.art6',
      'res960.art6.par1',
      'res960.art6.par2',
      'res960.art7',
      'res960.art12',
      'res960.art12.pu',
      'res960.art12.original',
      'res960.art21.V.b',
      'res960.art21.VI',
    ],
    enquadramentos: [VIDRO_EM_DESACORDO, AUSENCIA_DE_VIDRO],
  },

  aula: {
    teoria: [
      {
        titulo: 'Vidro de segurança desde a fábrica',
        paragrafos: [
          'Os veículos automotores, os reboques e os semirreboques devem sair de fábrica com as partes envidraçadas equipadas com **vidros de segurança** que atendam à Resolução e à ABNT NBR 9491 (art. 2º).',
          'A exigência vale também para os **vidros de reposição** (art. 2º, parágrafo único): trocar um vidro não autoriza usar vidro comum.',
        ],
      },
      {
        titulo: 'Laminado no para-brisa; temperado ou laminado nos demais',
        paragrafos: [
          'Para circular nas vias públicas, o para-brisa de **todos os veículos** deve ser de vidro de segurança **laminado**. Nas demais partes envidraçadas, o vidro pode ser **temperado**, uniformemente protendido, **ou laminado** (art. 3º).',
        ],
      },
      {
        titulo: 'Marcação e ensaios no exterior',
        paragrafos: [
          'Cada vidro de segurança traz **marcação indelével**, em local de fácil visualização, com no mínimo a marca do **fabricante do vidro** e o símbolo de conformidade do **INMETRO** (art. 5º).',
          'O órgão máximo executivo de trânsito da União pode admitir, só para os vidros de segurança, resultados de ensaios feitos no exterior (art. 6º). São aceitos os admitidos por órgãos reconhecidos pela Comissão ou Comunidade Europeia e pelos Estados Unidos (§ 1º). Nesses casos, a marcação traz a marca do fabricante e o símbolo europeu ("E" maiúsculo num círculo ou "e" minúsculo num retângulo, com o número do país) ou, se dos EUA, a sigla **"DOT"** (§ 2º).',
          'Fabricante, representante e importador do veículo devem certificar-se de que os produtos cumprem a Resolução e manter condição de comprovar isso quando o órgão máximo executivo de trânsito da União pedir (art. 7º).',
        ],
      },
      {
        titulo: 'Veículos blindados',
        paragrafos: [
          'Os blindados são isentos dos vidros de segurança exigidos no art. 2º e dos requisitos do **inciso I do art. 4º** (o mínimo de 70%). Nas suas áreas envidraçadas aplica-se a **ABNT NBR 16218** (art. 12, com redação da Res. 989/2022).',
          'A isenção também vale para os vidros de reposição (art. 12, parágrafo único). Na redação original, a isenção era dos requisitos do art. 4º inteiro.',
        ],
      },
      {
        titulo: 'Enquadramento: dois artigos diferentes',
        paragrafos: ['A Resolução separa duas situações:'],
        itens: [
          '**Ausência** de qualquer dos vidros de segurança: art. 230, XVIII, do CTB (art. 21, V, "b").',
          'Vidro de segurança **em desacordo** com a Resolução: art. 237 do CTB (art. 21, VI).',
        ],
      },
    ],
    visuais: [
      {
        tipo: 'tabela',
        titulo: 'Qual vidro em cada área',
        colunas: ['Área', 'Exigência', 'Base'],
        linhas: [
          ['Para-brisa', 'Vidro de segurança **laminado**, em todos os veículos', 'Art. 3º'],
          ['Demais vidros', 'Vidro de segurança **temperado**, uniformemente protendido, **ou laminado**', 'Art. 3º'],
          ['Vidros de reposição', 'Mesma exigência dos vidros de fábrica', 'Art. 2º, parágrafo único'],
          ['Blindados', 'ABNT NBR 16218, com isenção dos vidros do art. 2º e do inciso I do art. 4º', 'Art. 12'],
        ],
      },
      {
        tipo: 'tabela',
        titulo: 'Situação × enquadramento no CTB',
        colunas: ['Situação', 'CTB', 'Base na Res. 960'],
        linhas: [
          ['Falta de qualquer vidro de segurança', 'Art. 230, **XVIII**', 'Art. 21, V, "b"'],
          ['Vidro de segurança em desacordo', 'Art. **237**', 'Art. 21, VI'],
        ],
        nota: 'Nos dois casos: infração grave, 5 pontos, multa de R$ 195,23 e retenção do veículo para regularização.',
      },
    ],
    conexoes: [
      {
        titulo: 'Art. 237 do CTB',
        texto: 'Transitar com o veículo em desacordo com as especificações: é o enquadramento do vidro de segurança irregular.',
        dispositivos: ['ctb.art237'],
      },
      {
        titulo: 'Películas',
        texto: 'Os limites de transmitância do art. 4º (70% e demais vidros) estão no assunto Películas.',
        dispositivos: ['res960.art4.I'],
      },
      {
        titulo: 'Danos no para-brisa',
        texto: 'Trincas e fraturas no para-brisa laminado têm limites próprios: veja o assunto Danos no para-brisa.',
      },
    ],
    revisao: [
      'Vidro de segurança desde a fábrica: automotores, **reboques e semirreboques**, inclusive na **reposição**.',
      'Para-brisa: **laminado** em todos os veículos. Demais vidros: **temperado ou laminado**.',
      'Marcação: marca do **fabricante do vidro** + símbolo do **INMETRO**, no mínimo.',
      'Ensaios do exterior: Comissão ou Comunidade Europeia ("E"/"e") e EUA ("DOT").',
      'Blindados: **ABNT NBR 16218**; isentos do art. 2º e do **inciso I** do art. 4º (redação da 989).',
      'Falta de vidro de segurança: **230, XVIII**. Vidro em desacordo: **237**.',
    ],
    questoes: [
      {
        id: 'seguranca-01',
        enunciado:
          'Para circular nas vias públicas, é obrigatório o vidro de segurança laminado no para-brisa apenas dos veículos de carga e de transporte coletivo.',
        gabarito: 'E',
        comentario: 'O laminado é obrigatório no para-brisa de **todos** os veículos (art. 3º).',
        dispositivos: ['res960.art3'],
      },
      {
        id: 'seguranca-02',
        enunciado:
          'Nas partes envidraçadas que não o para-brisa, admite-se vidro de segurança temperado, uniformemente protendido, ou laminado.',
        gabarito: 'C',
        comentario: 'Texto do art. 3º.',
        dispositivos: ['res960.art3'],
      },
      {
        id: 'seguranca-03',
        enunciado: 'A exigência de vidros de segurança que atendam à ABNT NBR 9491 aplica-se também aos vidros destinados a reposição.',
        gabarito: 'C',
        comentario: 'Art. 2º, parágrafo único.',
        dispositivos: ['res960.art2', 'res960.art2.pu'],
      },
      {
        id: 'seguranca-04',
        enunciado:
          'A marcação dos vidros de segurança deve conter, no mínimo, a marca do fabricante do veículo e o símbolo de conformidade do órgão máximo executivo de trânsito da União.',
        gabarito: 'E',
        comentario: 'A marcação traz a marca do fabricante **do vidro** e o símbolo de conformidade definido pelo **INMETRO** (art. 5º).',
        dispositivos: ['res960.art5'],
      },
      {
        id: 'seguranca-05',
        enunciado:
          'Com a redação dada pela Res. 989/2022, os veículos blindados são isentos dos vidros de segurança exigidos no art. 2º e dos requisitos do inciso I do art. 4º, aplicando-se às suas áreas envidraçadas a ABNT NBR 16218.',
        gabarito: 'C',
        comentario: 'Texto atual do art. 12. Na redação original, a isenção era dos requisitos do art. 4º inteiro.',
        dispositivos: ['res960.art12', 'res960.art12.original'],
      },
      {
        id: 'seguranca-06',
        enunciado: 'Veículo com vidro de segurança em desacordo com a Res. 960/2022 é enquadrado no art. 230, XVIII, do CTB.',
        gabarito: 'E',
        comentario:
          'Vidro **em desacordo** vai para o art. **237** (art. 21, VI). O art. 230, XVIII, é o da **ausência** de vidro de segurança (art. 21, V, "b").',
        dispositivos: ['res960.art21.VI', 'res960.art21.V.b', 'ctb.art237'],
      },
      {
        id: 'seguranca-07',
        enunciado: 'A Res. 960/2022 não se aplica às máquinas agrícolas, rodoviárias e florestais.',
        gabarito: 'C',
        comentario:
          'Art. 11, que também exclui os veículos destinados à circulação exclusivamente fora das vias públicas e os incompletos, inacabados e destinados à exportação.',
        dispositivos: ['res960.art11'],
      },
    ],
  },

  fichas: [
    {
      assunto: 'vidro-seguranca',
      zona: 'para-brisa',
      status: 'exigencia',
      resumoCurto: 'laminado',
      destaque: {
        valor: 'Laminado',
        rotulo: 'Vidro de segurança obrigatório',
        detalhe: 'Em todos os veículos, para circular nas vias públicas',
      },
      essencial: {
        explicacao:
          'O para-brisa de todos os veículos precisa ser de vidro de segurança laminado. Não basta ser temperado: o temperado só é admitido nas demais partes envidraçadas.',
        pode: ['Vidro de segurança laminado, com a marcação do fabricante e do INMETRO.'],
        naoPode: ['Para-brisa de vidro temperado ou de vidro comum.', 'Circular sem o para-brisa.'],
        naFiscalizacao: [MARCACAO],
      },
      prova: {
        pontosDeProva: ['Laminado no para-brisa de **todos** os veículos (art. 3º).', ...PONTOS_COMUNS],
      },
      dispositivos: ['res960.art3', 'res960.art5', 'res960.art21.V.b', 'res960.art21.VI'],
      enquadramentos: [VIDRO_EM_DESACORDO, AUSENCIA_DE_VIDRO],
    },
    fichaDemaisVidros('laterais-dianteiros', 'O vidro das portas da frente'),
    fichaDemaisVidros('laterais-traseiros', 'O vidro das portas de trás'),
    fichaDemaisVidros('vigia', 'O vidro traseiro (vigia)'),
  ],
};
