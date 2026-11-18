import type { Assunto } from '@/types/conteudo';

/** Assunto sem peça no carro: o visual é o simulador do Valor Considerado, no painel. */
export const medicao: Assunto = {
  id: 'medicao',
  tema: 'vidros',
  titulo: 'Medidor de transmitância luminosa (MTL)',
  tituloCurto: 'Medição',
  subtitulo: 'Medição, valor considerado e auto de infração',
  zonas: [],

  visaoGeral: {
    resumo:
      'A transmitância é verificada com o medidor de transmitância luminosa (MTL), de modelo aprovado pelo INMETRO e com verificação metrológica em dia. Na autuação, soma-se 7% à medição: VC = MR + 7%.',
    destaque: {
      valor: 'VC = MR + 7%',
      rotulo: 'Valor Considerado para aplicar a penalidade',
      detalhe: 'Soma-se 7% à Medição Realizada pelo MTL',
    },
    essencial: {
      explicacao:
        'O agente mede a transmitância com o MTL. O resultado não é usado direto: soma-se 7% à medição, e é esse Valor Considerado que se compara com o limite da área. No para-brisa e nas laterais dianteiras, só há infração se a medição ficar abaixo de 63%.',
      pode: [
        'Autuar com MTL de modelo aprovado pelo INMETRO e aprovado na verificação metrológica periódica.',
        'Usar o registro impresso do MTL, quando o aparelho tiver impressora.',
      ],
      naoPode: [
        'Autuar pela medição bruta, sem somar os 7%.',
        'Lavrar o auto sem a medição, o valor considerado, o limite e a identificação da área envidraçada.',
      ],
      naFiscalizacao: [
        'O auto de infração e a notificação da autuação trazem, em percentuais: a medição realizada, o valor considerado e o limite da área fiscalizada (art. 19, I a III).',
        'O auto informa também qual área envidraçada foi autuada (art. 19, § 2º).',
        'Com impressora, o registro traz: data e hora, placa, transmitância medida, área fiscalizada, identificação do instrumento e do agente (art. 20).',
      ],
    },
    prova: {
      pontosDeProva: [
        'A verificação da transmitância **deve** ser feita por MTL (art. 17), instrumento que mede, em valores percentuais, a transmitância de vidros, películas, filmes e outros materiais simples ou compostos (parágrafo único).',
        'O MTL precisa de **modelo aprovado pelo INMETRO** e de aprovação na **verificação metrológica** periódica (art. 18).',
        '**VC = MR + 7%**: soma, não subtração (art. 19, § 1º).',
        'O auto traz três números em percentual (medição, valor considerado e limite) e a identificação da área (art. 19, I a III, e § 2º).',
        'Registro impresso: seis dados, entre eles a placa e a identificação do agente (art. 20).',
      ],
      atencao: [
        'O art. 20 só fixa o conteúdo do registro quando o MTL tiver dispositivo impressor; a Resolução não exige impressora.',
      ],
    },
    dispositivos: [
      'res960.art17',
      'res960.art17.pu',
      'res960.art18',
      'res960.art19',
      'res960.art19.par1',
      'res960.art19.par2',
      'res960.art20',
    ],
    enquadramentos: [
      {
        situacao: 'Valor Considerado abaixo do limite da área (conjunto vidro-película em desacordo)',
        infracao: 'ctb.230.XVI',
        base: 'res960.art21.III.b',
      },
    ],
  },

  aula: {
    teoria: [
      {
        titulo: 'O instrumento',
        paragrafos: [
          'A verificação dos índices de transmitância luminosa **deve** ser feita com o **medidor de transmitância luminosa (MTL)** (art. 17). É o instrumento que mede, em valores percentuais, a transmitância de vidros, películas, filmes e outros materiais simples ou compostos (art. 17, parágrafo único).',
        ],
      },
      {
        titulo: 'Requisitos do aparelho',
        paragrafos: [
          'O MTL precisa ter **modelo aprovado pelo INMETRO** e ser **aprovado na verificação metrológica**, na periodicidade da regulamentação metrológica em vigor (art. 18).',
        ],
      },
      {
        titulo: 'Valor Considerado: VC = MR + 7%',
        paragrafos: [
          'Para obter o **Valor Considerado (VC)**, soma-se 7% à **Medição Realizada (MR)** (art. 19, § 1º). É o VC que se compara com o limite.',
          'No para-brisa e nas laterais dianteiras (mínimo de 70%): MR de 62% dá VC de 69%, abaixo do limite; MR de 63% dá VC de 70%, que não é inferior a 70% (art. 4º, I).',
        ],
      },
      {
        titulo: 'O que o auto de infração precisa conter',
        paragrafos: [
          'Além do exigido pelo CTB e pela legislação complementar, o auto e a notificação da autuação trazem, em termos percentuais (art. 19):',
        ],
        itens: [
          'a medição realizada pelo instrumento (I);',
          'o valor considerado para aplicar a penalidade (II);',
          'o limite regulamentado para a área fiscalizada (III);',
          'e a identificação da área envidraçada objeto da autuação (§ 2º).',
        ],
      },
      {
        titulo: 'Registro impresso',
        paragrafos: ['Quando o MTL tem dispositivo impressor, o registro traz (art. 20):'],
        itens: [
          'data e hora;',
          'placa do veículo;',
          'transmitância medida pelo instrumento;',
          'área envidraçada fiscalizada;',
          'identificação do instrumento;',
          'identificação do agente.',
        ],
      },
    ],
    visuais: [
      { tipo: 'calculadoraVC' },
      {
        tipo: 'tabela',
        titulo: 'Exemplos em área indispensável (mínimo de 70%)',
        colunas: ['Medição (MR)', 'Valor Considerado (VC)', 'Resultado'],
        linhas: [
          ['60%', '67%', 'Infração'],
          ['62%', '69%', 'Infração'],
          ['63%', '70%', 'Regular'],
          ['66%', '73%', 'Regular'],
        ],
        nota: 'VC = MR + 7% (art. 19, § 1º); limite do art. 4º, I.',
      },
    ],
    conexoes: [
      {
        titulo: 'Películas',
        texto: 'Os limites que o MTL verifica (70% e demais vidros) estão no assunto Películas.',
        dispositivos: ['res960.art4.I', 'res960.art4.II'],
      },
      {
        titulo: 'Enquadramento',
        texto: 'Transmitância em desacordo é o art. 230, XVI, do CTB (art. 21, III, "b").',
        dispositivos: ['res960.art21.III.b', 'ctb.art230.XVI'],
      },
    ],
    revisao: [
      'A verificação **deve** ser feita por **MTL** (art. 17).',
      'MTL: **modelo aprovado pelo INMETRO** + **verificação metrológica** em dia (art. 18).',
      '**VC = MR + 7%** (soma). Área de 70%: infração com medição **abaixo de 63%**.',
      'Auto: **medição, valor considerado e limite**, em percentual, e a **área** autuada (art. 19).',
      'Registro impresso (se houver impressora): data e hora, placa, transmitância, área, instrumento e agente (art. 20).',
    ],
    questoes: [
      {
        id: 'medicao-01',
        enunciado:
          'A verificação dos índices de transmitância luminosa das áreas envidraçadas deve ser efetuada por meio do medidor de transmitância luminosa (MTL).',
        gabarito: 'C',
        comentario: 'Texto do art. 17.',
        dispositivos: ['res960.art17'],
      },
      {
        id: 'medicao-02',
        enunciado:
          'O MTL deve ter seu modelo aprovado pelo INMETRO e ser aprovado na verificação metrológica, na periodicidade da regulamentação metrológica em vigor.',
        gabarito: 'C',
        comentario: 'Texto do art. 18.',
        dispositivos: ['res960.art18'],
      },
      {
        id: 'medicao-03',
        enunciado: 'Para obter o Valor Considerado, subtrai-se 7% da medição realizada pelo instrumento.',
        gabarito: 'E',
        comentario: 'O percentual é **somado**: VC = MR + 7% (art. 19, § 1º).',
        dispositivos: ['res960.art19.par1'],
      },
      {
        id: 'medicao-04',
        enunciado:
          'O auto de infração deve conter, em termos percentuais, a medição realizada, o valor considerado e o limite regulamentado para a área envidraçada fiscalizada.',
        gabarito: 'C',
        comentario: 'Art. 19, I a III.',
        dispositivos: ['res960.art19'],
      },
      {
        id: 'medicao-05',
        enunciado: 'Medição de 62% na lateral dianteira resulta em valor considerado de 69% e caracteriza infração.',
        gabarito: 'C',
        comentario: '62% + 7% = 69%, abaixo do mínimo de 70% das áreas indispensáveis (art. 19, § 1º, e art. 4º, I).',
        dispositivos: ['res960.art19.par1', 'res960.art4.I'],
      },
      {
        id: 'medicao-06',
        enunciado:
          'Quando o MTL for dotado de dispositivo impressor, o registro impresso deve conter, entre outros dados, a placa do veículo e a identificação do agente.',
        gabarito: 'C',
        comentario: 'Art. 20, II e VI.',
        dispositivos: ['res960.art20'],
      },
      {
        id: 'medicao-07',
        enunciado: 'No auto de infração lavrado com base no MTL, dispensa-se a identificação da área envidraçada, bastando o percentual medido.',
        gabarito: 'E',
        comentario: 'O auto deve informar a área envidraçada objeto da autuação (art. 19, § 2º), além dos três percentuais do caput.',
        dispositivos: ['res960.art19.par2', 'res960.art19'],
      },
    ],
  },

  fichas: [],
};
