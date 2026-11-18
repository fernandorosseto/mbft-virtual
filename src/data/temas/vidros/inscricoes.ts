import type { Assunto, Enquadramento, Ficha } from '@/types/conteudo';

const MATERIAL_NAS_INDISPENSAVEIS: Enquadramento = {
  situacao: 'Adesivo, inscrição, pictograma ou outro material nas áreas indispensáveis à dirigibilidade',
  infracao: 'ctb.230.XVI',
  base: 'res960.art21.III.e',
};
const PUBLICIDADE: Enquadramento = {
  situacao: 'Material de caráter publicitário no para-brisa ou no vidro traseiro, em desacordo com a Resolução',
  infracao: 'ctb.230.XV',
  base: 'res960.art21.II',
};
const CORTINAS: Enquadramento = {
  situacao: 'Cortinas, persianas ou similares fechadas com o veículo em movimento, sem retrovisores em ambos os lados ou em desacordo com a Resolução',
  infracao: 'ctb.230.XVII',
  base: 'res960.art21.IV',
};
const PAINEIS_LUMINOSOS: Enquadramento = {
  situacao: 'Painéis luminosos em desacordo com a Resolução',
  infracao: 'ctb.230.XII',
  base: 'res960.art21.I',
};

const CONFERIR_AREA =
  'Primeiro se identifica a área: indispensável à dirigibilidade (para-brisa e laterais dianteiras) ou não. Nas indispensáveis, nada pode ser afixado ou pintado.';
const CONFERIR_RETROVISORES =
  'Fora das áreas indispensáveis, a condição a verificar são os espelhos retrovisores externos dos dois lados (art. 9º e art. 10, IV).';

function fichaIndispensavel(zona: Ficha['zona'], nome: string): Ficha {
  return {
    assunto: 'inscricoes',
    zona,
    status: 'proibido',
    resumoCurto: 'vedado',
    destaque: {
      valor: 'Vedado',
      rotulo: 'Inscrição, adesivo, legenda ou símbolo',
      detalhe: 'Cortina fechada com o veículo em movimento também é vedada',
    },
    essencial: {
      explicacao: `${nome} é área indispensável à dirigibilidade. Ali é vedado qualquer inscrição, adesivo, legenda ou símbolo, pintado ou afixado, e cortinas ou persianas não podem ficar fechadas com o veículo em movimento.`,
      pode: [],
      naoPode: [
        'Qualquer inscrição, adesivo, legenda ou símbolo, pintado ou afixado.',
        'Cortinas, persianas ou similares fechadas com o veículo em movimento.',
      ],
      naFiscalizacao: [CONFERIR_AREA],
    },
    prova: {
      pontosDeProva: [
        'Vedado o uso de **qualquer** inscrição, adesivo, legenda ou símbolo nas áreas indispensáveis (art. 10, III). Enquadramento: art. 230, XVI, do CTB (art. 21, III, "e").',
        'Cortinas fechadas em movimento só são admitidas nas áreas **não** indispensáveis, com retrovisores em ambos os lados (art. 10, IV). Fora disso: art. 230, XVII (art. 21, IV).',
      ],
    },
    dispositivos: ['res960.art10.III', 'res960.art10.IV', 'res960.art21.III.e', 'res960.art21.IV'],
    enquadramentos: [MATERIAL_NAS_INDISPENSAVEIS, CORTINAS],
  };
}

function fichaDemais(zona: Ficha['zona'], nome: string, extraProva: string[] = []): Ficha {
  return {
    assunto: 'inscricoes',
    zona,
    status: 'livre-condicional',
    resumoCurto: 'c/ retrovis.',
    destaque: {
      valor: 'Permitido',
      rotulo: 'Inscrições, pictogramas e cortinas',
      detalhe: 'Com espelhos retrovisores externos dos dois lados',
    },
    essencial: {
      explicacao: `${nome} não é área indispensável à dirigibilidade. Inscrições, pictogramas e painéis decorativos são permitidos se o veículo tiver retrovisores externos dos dois lados e o conjunto atender às condições de transmitância do art. 4º. Cortinas podem ficar fechadas em movimento, também com retrovisores em ambos os lados.`,
      pode: [
        'Inscrições, pictogramas ou painéis decorativos, com retrovisores externos dos dois lados e transmitância conforme o art. 4º.',
        'Cortinas ou persianas fechadas em movimento, com retrovisores em ambos os lados.',
      ],
      naoPode: ['Inscrições ou cortinas fechadas em movimento sem os retrovisores dos dois lados.'],
      naFiscalizacao: [CONFERIR_RETROVISORES],
    },
    prova: {
      pontosDeProva: [
        'Inscrições, pictogramas ou painéis decorativos fora das áreas indispensáveis: permitidos com retrovisores externos de ambos os lados e transmitância do art. 4º no conjunto vidro-pictograma/inscrição (art. 9º).',
        'Cortinas fechadas em movimento: permitidas nas áreas não indispensáveis, com retrovisores em ambos os lados (art. 10, IV).',
        ...extraProva,
      ],
    },
    dispositivos: ['res960.art9', 'res960.art10.IV', 'res960.art21.IV'],
    enquadramentos: [CORTINAS],
  };
}

export const inscricoes: Assunto = {
  id: 'inscricoes',
  tema: 'vidros',
  titulo: 'Inscrições, adesivos e cortinas',
  tituloCurto: 'Inscrições',
  subtitulo: 'Adesivos, pictogramas, cortinas e painéis luminosos',
  zonas: ['para-brisa', 'laterais-dianteiros', 'laterais-traseiros', 'vigia'],

  visaoGeral: {
    resumo:
      'No para-brisa e nas laterais dianteiras é vedada qualquer inscrição, adesivo, legenda ou símbolo, e cortinas não podem ficar fechadas com o veículo em movimento. Nos demais vidros, inscrições e cortinas são permitidas se o veículo tiver retrovisores nos dois lados.',
    destaque: {
      valor: 'Vedado',
      rotulo: 'Inscrição ou adesivo nas áreas indispensáveis à dirigibilidade',
      detalhe: 'Para-brisa e laterais dianteiras (art. 10, III)',
    },
    essencial: {
      explicacao:
        'A regra divide os vidros em dois grupos. Nas áreas indispensáveis à dirigibilidade (para-brisa e laterais dianteiras), nada pode ser pintado ou afixado, e cortinas não podem ficar fechadas em movimento. Nos demais vidros, inscrições, pictogramas e cortinas são permitidos com retrovisores externos dos dois lados. Painéis luminosos com mensagens são vedados, salvo no transporte coletivo para informar o serviço da linha.',
      pode: [
        'Inscrições, pictogramas ou painéis decorativos fora das áreas indispensáveis, com retrovisores externos dos dois lados e transmitância conforme o art. 4º.',
        'Cortinas ou persianas fechadas em movimento nas áreas não indispensáveis, com retrovisores em ambos os lados.',
        'Painel luminoso no transporte coletivo de passageiros, para informar o serviço ao usuário da linha.',
      ],
      naoPode: [
        'Inscrição, adesivo, legenda ou símbolo no para-brisa e nas laterais dianteiras.',
        'Cortinas ou persianas fechadas em movimento no para-brisa e nas laterais dianteiras, ou sem retrovisores dos dois lados.',
        'Painéis luminosos com mensagens dinâmicas ou estáticas, fora da exceção do transporte coletivo.',
      ],
      naFiscalizacao: [CONFERIR_AREA, CONFERIR_RETROVISORES],
    },
    prova: {
      pontosDeProva: [
        'Áreas indispensáveis: vedado **qualquer** inscrição, adesivo, legenda ou símbolo, pintado ou afixado (art. 10, III).',
        'Fora delas, inscrições, pictogramas ou painéis decorativos "de qualquer espécie" são permitidos, com **dois requisitos**: retrovisores externos de ambos os lados e transmitância do art. 4º no conjunto vidro-pictograma/inscrição (art. 9º).',
        'Cortinas, persianas fechadas ou similares em movimento: vedadas, **salvo** nas áreas não indispensáveis com retrovisores em ambos os lados (art. 10, IV; CTB, art. 111, II).',
        'Painéis luminosos com mensagens dinâmicas ou estáticas: vedados, **exceto** no transporte coletivo, para informar o serviço ao usuário da linha (art. 10, V).',
        'Quatro enquadramentos diferentes: painel luminoso, art. 230, **XII**; publicidade no para-brisa ou vidro traseiro, **XV**; material nas áreas indispensáveis, **XVI**; cortinas, **XVII** (art. 21, I a IV).',
      ],
      atencao: [
        'O art. 9º remete às condições de transmitância do art. 4º; para os vidros do inciso II, a redação atual não fixa percentual mínimo.',
        'Publicidade no vidro traseiro: o CTB proíbe inscrição publicitária em toda a extensão da traseira, salvo se não colocar em risco a segurança do trânsito (art. 111, parágrafo único), e o art. 21, II, enquadra o material publicitário "em desacordo com o previsto nesta Resolução". A Resolução não traz regra específica para publicidade.',
      ],
    },
    dispositivos: [
      'res960.art9',
      'res960.art10.III',
      'res960.art10.IV',
      'res960.art10.V',
      'res960.art21.I',
      'res960.art21.II',
      'res960.art21.III.e',
      'res960.art21.IV',
      'ctb.art111.II',
      'ctb.art111.pu',
    ],
    enquadramentos: [MATERIAL_NAS_INDISPENSAVEIS, PUBLICIDADE, CORTINAS, PAINEIS_LUMINOSOS],
  },

  aula: {
    teoria: [
      {
        titulo: 'A divisão que decide tudo',
        paragrafos: [
          'Como nas películas, a regra separa as **áreas indispensáveis à dirigibilidade** (para-brisa, com as exclusões do art. 4º, § 1º, I, e laterais dianteiras) dos **demais vidros**. Saber em qual grupo o vidro está resolve a maioria dos itens de prova.',
        ],
      },
      {
        titulo: 'Inscrições, adesivos e pictogramas',
        paragrafos: [
          'Nas áreas indispensáveis é vedado o uso de **qualquer** inscrição, adesivo, legenda ou símbolo, pintados ou afixados (art. 10, III).',
          'Fora delas, inscrições, pictogramas ou painéis decorativos de qualquer espécie são permitidos, desde que o veículo tenha **espelhos retrovisores externos de ambos os lados** e o conjunto vidro-pictograma/inscrição atenda às condições de transmitância do art. 4º (art. 9º).',
        ],
      },
      {
        titulo: 'Cortinas e persianas',
        paragrafos: [
          'Com o veículo em movimento, é vedado o uso de cortinas, persianas fechadas ou similares, **salvo** nas áreas não indispensáveis à dirigibilidade, desde que haja retrovisores em ambos os lados (art. 10, IV).',
          'O CTB já trazia a regra: é vedado nas áreas envidraçadas o uso de cortinas, persianas fechadas ou similares nos veículos em movimento, salvo nos que possuam espelhos retrovisores em ambos os lados (art. 111, II).',
        ],
      },
      {
        titulo: 'Painéis luminosos',
        paragrafos: [
          'São vedados painéis luminosos que reproduzam mensagens dinâmicas ou estáticas. A exceção é o **transporte coletivo de passageiros**, quando a mensagem informa o serviço ao usuário da linha (art. 10, V).',
        ],
      },
      {
        titulo: 'Publicidade',
        paragrafos: [
          'O CTB proíbe inscrição de caráter publicitário, ou qualquer outra que possa desviar a atenção dos condutores, em toda a extensão do para-brisa e da traseira, salvo se não colocar em risco a segurança do trânsito (art. 111, parágrafo único). A Res. 960 enquadra o material publicitário no para-brisa ou no vidro traseiro, em desacordo com a Resolução, no art. 230, **XV** (art. 21, II).',
        ],
      },
      {
        titulo: 'Enquadramento: quatro incisos',
        paragrafos: ['Cada situação tem o seu inciso do art. 230 do CTB (art. 21 da Res. 960):'],
        itens: [
          'painéis luminosos em desacordo: **XII** (equipamento ou acessório proibido);',
          'material publicitário no para-brisa ou vidro traseiro: **XV**;',
          'adesivo, inscrição ou outro material nas áreas indispensáveis: **XVI**;',
          'cortinas, persianas ou similares fechadas em movimento, sem retrovisores ou em desacordo: **XVII**.',
        ],
      },
    ],
    visuais: [
      {
        tipo: 'tabela',
        titulo: 'O que pode em cada vidro',
        colunas: ['Área', 'Inscrições e adesivos', 'Cortinas fechadas em movimento'],
        linhas: [
          ['Para-brisa', '**Vedado** (art. 10, III)', '**Vedado** (art. 10, IV)'],
          ['Laterais dianteiras', '**Vedado** (art. 10, III)', '**Vedado** (art. 10, IV)'],
          [
            'Laterais traseiras e vigia',
            'Permitido com retrovisores externos dos dois lados e transmitância do art. 4º (art. 9º)',
            'Permitido com retrovisores em ambos os lados (art. 10, IV)',
          ],
        ],
      },
      {
        tipo: 'tabela',
        titulo: 'Situação × inciso do art. 230 do CTB',
        colunas: ['Situação', 'CTB', 'Res. 960'],
        linhas: [
          ['Painéis luminosos em desacordo', 'XII', 'Art. 21, I'],
          ['Publicidade no para-brisa ou vidro traseiro', 'XV', 'Art. 21, II'],
          ['Material nas áreas indispensáveis', 'XVI', 'Art. 21, III, "e"'],
          ['Cortinas fechadas em movimento', 'XVII', 'Art. 21, IV'],
        ],
        nota: 'Todas são infrações graves (sanção comum aos incisos VII a XIX do art. 230): 5 pontos, R$ 195,23 e retenção do veículo para regularização.',
      },
    ],
    conexoes: [
      {
        titulo: 'CTB, art. 111',
        texto: 'As vedações nas áreas envidraçadas (cortinas, inscrições, películas) e a proibição de publicidade no para-brisa e na traseira estão no art. 111 do CTB.',
        dispositivos: ['ctb.art111.II', 'ctb.art111.III', 'ctb.art111.pu'],
      },
      {
        titulo: 'Películas',
        texto: 'As áreas indispensáveis à dirigibilidade e os limites de transmitância citados pelo art. 9º estão no assunto Películas.',
        dispositivos: ['res960.art4.par1'],
      },
    ],
    revisao: [
      'Para-brisa e laterais dianteiras: **nada** pintado ou afixado (art. 10, III).',
      'Demais vidros: inscrições e pictogramas com **retrovisores dos dois lados** e **transmitância do art. 4º** (art. 9º).',
      'Cortinas fechadas em movimento: só nas áreas **não indispensáveis**, com retrovisores em ambos os lados (art. 10, IV).',
      'Painel luminoso com mensagem: vedado, **exceto** no transporte coletivo para informar o serviço da linha (art. 10, V).',
      'Incisos do art. 230: painel **XII**, publicidade **XV**, material nas indispensáveis **XVI**, cortinas **XVII**.',
    ],
    questoes: [
      {
        id: 'inscricoes-01',
        enunciado:
          'É vedado o uso de qualquer inscrição, adesivo, legenda ou símbolo pintados ou afixados nas áreas envidraçadas indispensáveis à dirigibilidade.',
        gabarito: 'C',
        comentario: 'Texto do art. 10, III.',
        dispositivos: ['res960.art10.III'],
      },
      {
        id: 'inscricoes-02',
        enunciado:
          'Fora das áreas indispensáveis à dirigibilidade, a aplicação de pictogramas é permitida independentemente da existência de espelhos retrovisores externos.',
        gabarito: 'E',
        comentario: 'O art. 9º exige retrovisores externos de ambos os lados e as condições de transmitância do art. 4º.',
        dispositivos: ['res960.art9'],
      },
      {
        id: 'inscricoes-03',
        enunciado:
          'O uso de cortinas fechadas com o veículo em movimento é permitido nas áreas não indispensáveis à dirigibilidade, desde que o veículo possua espelhos retrovisores em ambos os lados.',
        gabarito: 'C',
        comentario: 'É a exceção do art. 10, IV.',
        dispositivos: ['res960.art10.IV'],
      },
      {
        id: 'inscricoes-04',
        enunciado: 'Painéis luminosos com mensagens dinâmicas são vedados em qualquer caso, inclusive no transporte coletivo de passageiros.',
        gabarito: 'E',
        comentario: 'O art. 10, V, excetua os painéis do transporte coletivo usados para informar o serviço ao usuário da linha.',
        dispositivos: ['res960.art10.V'],
      },
      {
        id: 'inscricoes-05',
        enunciado:
          'Conduzir veículo sem espelhos retrovisores em ambos os lados, em movimento, com cortinas fechadas configura a infração do art. 230, XVII, do CTB.',
        gabarito: 'C',
        comentario: 'Art. 21, IV, "a", da Res. 960/2022.',
        dispositivos: ['res960.art21.IV', 'ctb.art230.XVII'],
      },
      {
        id: 'inscricoes-06',
        enunciado: 'Veículo com painéis luminosos em desacordo com a Res. 960/2022 é enquadrado no art. 230, XVI, do CTB.',
        gabarito: 'E',
        comentario: 'Painéis luminosos vão para o art. 230, **XII** (art. 21, I). O XVI é das películas e do material nas áreas indispensáveis.',
        dispositivos: ['res960.art21.I', 'ctb.art230.XII'],
      },
      {
        id: 'inscricoes-07',
        enunciado:
          'Adesivo sem caráter publicitário afixado no para-brisa é enquadrado no art. 230, XVI, do CTB, conforme a Res. 960/2022.',
        gabarito: 'C',
        comentario:
          'Art. 21, III, "e": adesivo, inscrição ou outro material nas áreas envidraçadas indispensáveis à dirigibilidade. Se o material for publicitário, o art. 21, II, remete ao inciso XV.',
        dispositivos: ['res960.art21.III.e', 'res960.art21.II'],
      },
    ],
  },

  fichas: [
    fichaIndispensavel('para-brisa', 'O para-brisa'),
    fichaIndispensavel('laterais-dianteiros', 'O vidro das portas da frente'),
    fichaDemais('laterais-traseiros', 'O vidro das portas de trás'),
    fichaDemais('vigia', 'O vidro traseiro (vigia)', [
      'Publicidade no vidro traseiro tem enquadramento próprio: art. 230, XV, do CTB (art. 21, II).',
    ]),
  ],
};
