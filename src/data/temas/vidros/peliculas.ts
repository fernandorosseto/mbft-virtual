import type { Assunto, Enquadramento } from '@/types/conteudo';

// Enquadramentos comuns às películas (Res. 960/2022, art. 21, III → CTB, art. 230, XVI).
const PELICULA_REFLETIVA: Enquadramento = {
  situacao: 'Película refletiva (espelhada) ou opaca',
  infracao: 'ctb.230.XVI',
  base: 'res960.art21.III.a',
};
const PELICULA_ABAIXO_DO_LIMITE: Enquadramento = {
  situacao: 'Conjunto vidro + película abaixo de 70%',
  infracao: 'ctb.230.XVI',
  base: 'res960.art21.III.b',
};
const PELICULA_SEM_CHANCELA: Enquadramento = {
  situacao: 'Película sem chancela',
  infracao: 'ctb.230.XVI',
  base: 'res960.art21.III.c',
};
const CHANCELA_ILEGIVEL: Enquadramento = {
  situacao: 'Chancela com alguma informação ilegível',
  infracao: 'ctb.230.XVI',
  base: 'res960.art21.III.d',
};

const CONFERIR_TOLERANCIA =
  'A autuação usa o Valor Considerado: VC = MR + 7% (art. 19, § 1º). Com mínimo de 70%, só há infração se a medição ficar abaixo de 63%.';
const CONFERIR_CHANCELA =
  'Nas áreas indispensáveis à dirigibilidade, verifica-se a chancela: gravação indelével com a marca do instalador e o índice de transmitância, legível pelo lado externo (art. 8º, §§ 1º e 2º).';
const CONFERIR_CONJUNTO =
  'Mede-se o conjunto vidro + película já aplicado, não a película isolada. O vidro de fábrica também reduz a passagem de luz.';

export const peliculas: Assunto = {
  id: 'peliculas',
  tema: 'vidros',
  titulo: 'Películas',
  subtitulo: 'Transmitância luminosa, chancela e películas proibidas',
  zonas: ['para-brisa', 'laterais-dianteiros', 'laterais-traseiros', 'vigia', 'teto'],

  visaoGeral: {
    resumo:
      'Na frente, o conjunto vidro + película precisa deixar passar pelo menos 70% da luz. Atrás, não há mínimo, desde que o carro tenha retrovisores externos dos dois lados.',
    destaque: {
      valor: '70%',
      rotulo: 'Mínimo no para-brisa e nos vidros das portas da frente',
      detalhe: 'Medido no conjunto: vidro + película juntos',
    },
    essencial: {
      explicacao:
        'A regra separa os vidros que o motorista usa para dirigir (o para-brisa e os vidros das portas da frente) dos demais. Nos da frente, o conjunto vidro + película precisa deixar passar pelo menos 70% da luz. Nos de trás e no vidro traseiro, pode escurecer mais, sem limite, se o carro tiver retrovisor externo dos dois lados. Película espelhada é proibida em qualquer vidro.',
      pode: [
        'Película não espelhada nos vidros da frente, se o conjunto ficar em 70% ou mais.',
        'Película mais escura nos vidros de trás e no vidro traseiro, com retrovisores externos dos dois lados.',
      ],
      naoPode: [
        'Película espelhada (refletiva) em qualquer vidro.',
        'Conjunto abaixo de 70% no para-brisa ou nos vidros das portas da frente.',
        'Película sem chancela, ou com chancela ilegível, nos vidros da frente.',
        'Película com bolhas na área de visão do motorista e nos vidros da frente.',
      ],
      naFiscalizacao: [CONFERIR_CONJUNTO, CONFERIR_CHANCELA, CONFERIR_TOLERANCIA],
    },
    prova: {
      pontosDeProva: [
        'O limite de 70% é do conjunto vidro-película, não da película isolada (art. 8º, caput, c/c art. 4º, I).',
        'Áreas indispensáveis à dirigibilidade (art. 4º, § 1º): o para-brisa, com exclusões, e as laterais dianteiras. Nelas o mínimo é 70% (art. 4º, I).',
        'Demais vidros: podem ficar abaixo de 70%, sem piso, se o veículo tiver retrovisores externos em ambos os lados (art. 4º, II, com redação da Res. 989/2022). A vigia segue a mesma regra (art. 4º, § 2º).',
        'Vidros do teto: excluídos dos limites do art. 4º (art. 4º, § 3º).',
        'Valor Considerado: VC = MR + 7% (art. 19, § 1º). A autuação usa o VC, não a medição bruta.',
        'Película refletiva é vedada em qualquer área envidraçada (art. 10, I). Bolhas são vedadas na área crítica de visão e nas áreas indispensáveis (art. 10, II).',
        'Enquadramento: art. 230, XVI, do CTB, nas hipóteses do art. 21, III, "a" a "d", da Res. 960/2022. Infração grave, 5 pontos, multa de R$ 195,23 e retenção do veículo para regularização.',
      ],
      historico: [
        'A Res. 960/2022 entrou em vigor em 01/06/2022 e revogou, entre outras, a Res. 254/2007 (art. 22, III).',
        'Na redação original, o art. 4º, II, fixava mínimo de 28% para os vidros que não interferem na dirigibilidade.',
        'A Res. 989/2022, em vigor desde 02/01/2023, deu nova redação ao art. 4º, II: esses vidros podem ficar abaixo de 70%, sem piso, se houver retrovisores externos em ambos os lados. Também alterou o art. 12 e a Figura 1 do Anexo I.',
      ],
    },
    dispositivos: ['res960.art4.I', 'res960.art4.II', 'res960.art8', 'res960.art10.I', 'res960.art19.par1'],
    enquadramentos: [PELICULA_ABAIXO_DO_LIMITE, PELICULA_REFLETIVA, PELICULA_SEM_CHANCELA, CHANCELA_ILEGIVEL],
  },

  aula: {
    teoria: [
      {
        titulo: 'Transmitância luminosa: o que se mede',
        paragrafos: [
          'Transmitância luminosa é a porcentagem de luz que atravessa a área envidraçada. Quem mede é o **medidor de transmitância luminosa (MTL)**, em valores percentuais (art. 17, parágrafo único).',
          'Com película, conta o **conjunto vidro-película**, e não a película sozinha (art. 8º). O vidro de fábrica já reduz a passagem de luz, então uma película "de 70%" costuma deixar o conjunto abaixo de 70%.',
        ],
      },
      {
        titulo: 'Áreas indispensáveis à dirigibilidade: mínimo de 70%',
        paragrafos: [
          'O para-brisa e as demais áreas envidraçadas indispensáveis à dirigibilidade não podem ter transmitância inferior a **70%** (art. 4º, I).',
          'São indispensáveis à dirigibilidade (art. 4º, § 1º):',
        ],
        itens: [
          '**o para-brisa**, excluídas a faixa periférica de serigrafia, a banda degradê (se existir, conforme a ABNT NBR 9491) e, nos veículos de carga com PBT acima de 3.500 kg, nos micro-ônibus e nos ônibus, a faixa de 20 cm na parte inferior (inciso I);',
          '**as laterais dianteiras**, respeitando o campo de visão do condutor (inciso II).',
        ],
      },
      {
        titulo: 'Demais vidros: sem mínimo, com retrovisores',
        paragrafos: [
          'Nos vidros que não interferem nas áreas indispensáveis, a transmitância **pode ser inferior** à do inciso I, desde que o veículo tenha espelhos retrovisores externos em ambos os lados (art. 4º, II, com redação da Res. 989/2022).',
          'Na redação original, esse inciso fixava mínimo de **28%**. A Res. 989/2022 trocou o piso pela condição dos retrovisores a partir de 02/01/2023.',
          'A **vigia** (vidro traseiro) segue o inciso II, desde que o veículo tenha espelho retrovisor em ambos os lados (art. 4º, § 2º). Os vidros de segurança do **teto** ficam excluídos dos limites (art. 4º, § 3º).',
        ],
      },
      {
        titulo: 'Película permitida e chancela',
        paragrafos: [
          'A película **não refletiva** é permitida, desde que o conjunto vidro-película atenda às mesmas condições de transmitância do art. 4º (art. 8º).',
          'Nas áreas indispensáveis à dirigibilidade, cada conjunto vidro-película leva uma **chancela**: a marca do instalador e o índice de transmitância luminosa, gravados de forma indelével na película (art. 8º, § 1º) e legíveis pelos lados externos dos vidros (art. 8º, § 2º).',
        ],
      },
      {
        titulo: 'O que é vedado',
        paragrafos: [
          'Película **refletiva**: vedada em todas as áreas envidraçadas do veículo, inclusive nas que não têm mínimo de transmitância (art. 10, I).',
          'Película com **bolhas**: vedada a manutenção na área crítica de visão do condutor e nas áreas indispensáveis à dirigibilidade (art. 10, II).',
        ],
      },
      {
        titulo: 'Da medição à infração',
        paragrafos: [
          'Na autuação, soma-se 7% à medição realizada: **VC = MR + 7%** (art. 19, § 1º). Com o mínimo de 70%, só há infração se a medição ficar abaixo de 63%.',
          'As infrações com película são enquadradas no **art. 230, XVI, do CTB** (art. 21, III, "a" a "d"): película refletiva ou opaca, transmitância em desacordo, película sem chancela e chancela ilegível. Infração grave: 5 pontos, multa de R$ 195,23 e retenção do veículo para regularização.',
        ],
      },
    ],
    visuais: [
      {
        tipo: 'tabela',
        titulo: 'Transmitância por área envidraçada',
        colunas: ['Área', 'Regra', 'Base'],
        linhas: [
          ['Para-brisa', 'Mínimo de **70%** no conjunto vidro-película, fora as faixas excluídas', 'Art. 4º, I, e § 1º, I'],
          ['Laterais dianteiras', 'Mínimo de **70%**', 'Art. 4º, I, e § 1º, II'],
          ['Laterais traseiras', 'Pode ser **inferior a 70%**, sem piso, com retrovisores externos dos dois lados', 'Art. 4º, II'],
          ['Vigia', 'Segue o inciso II, com espelho retrovisor em ambos os lados', 'Art. 4º, § 2º'],
          ['Teto', 'Fora dos limites de transmitância', 'Art. 4º, § 3º'],
        ],
        nota: 'Película refletiva é vedada em todas as áreas (art. 10, I).',
      },
      {
        tipo: 'linhaDoTempo',
        titulo: 'O inciso II do art. 4º ao longo do tempo',
        eventos: [
          { data: '01/06/2022 a 01/01/2023', texto: 'Redação original: mínimo de **28%** nos vidros que não interferem na dirigibilidade.' },
          { data: 'Desde 02/01/2023', texto: 'Redação da Res. 989/2022: **sem mínimo**, se houver retrovisores externos em ambos os lados.' },
        ],
      },
      { tipo: 'calculadoraVC' },
    ],
    conexoes: [
      {
        titulo: 'Base no CTB',
        texto: 'O art. 111, III, do CTB veda películas refletivas ou não, painéis decorativos ou pinturas quando comprometerem a segurança do veículo, na forma da regulamentação do CONTRAN. A Res. 960 é essa regulamentação.',
        dispositivos: ['ctb.art111.III'],
      },
      {
        titulo: 'Medidor de transmitância luminosa (MTL)',
        texto: 'Como o aparelho é usado e o que o auto de infração precisa conter: veja o assunto do MTL.',
      },
      {
        titulo: 'Veículos blindados',
        texto: 'Os blindados são isentos dos requisitos do inciso I do art. 4º (art. 12, com redação da Res. 989/2022): veja o assunto Vidro de segurança.',
        dispositivos: ['res960.art12'],
      },
    ],
    revisao: [
      '**70%** no para-brisa e nas laterais dianteiras, medido no **conjunto vidro-película**.',
      'Laterais traseiras e vigia: **sem mínimo** desde 02/01/2023, com retrovisores externos dos dois lados.',
      'Os **28%** são da redação original do art. 4º, II, revogada pela Res. 989/2022.',
      'Vidros do **teto**: fora dos limites de transmitância.',
      '**Chancela**: marca do **instalador** e índice de transmitância, legível pelo lado **externo**, nas áreas indispensáveis.',
      'Película **refletiva**: vedada em **qualquer** vidro. **Bolhas**: vedadas na área crítica e nas áreas indispensáveis.',
      '**VC = MR + 7%**: infração se o VC ficar abaixo de 70% (medição abaixo de 63%).',
      'Enquadramento: **art. 230, XVI**, do CTB. Grave, 5 pontos, R$ 195,23, retenção.',
    ],
    questoes: [
      {
        id: 'peliculas-01',
        enunciado:
          'O índice mínimo de 70% de transmitância luminosa exigido para o para-brisa refere-se à película isoladamente considerada.',
        gabarito: 'E',
        comentario: 'O limite vale para o **conjunto vidro-película** (art. 8º, que remete ao art. 4º, I).',
        dispositivos: ['res960.art8', 'res960.art4.I'],
      },
      {
        id: 'peliculas-02',
        enunciado:
          'Pela redação vigente da Res. 960/2022, os vidros laterais traseiros de veículo dotado de espelhos retrovisores externos em ambos os lados podem ter transmitância luminosa inferior a 70%.',
        gabarito: 'C',
        comentario: 'É a redação dada pela Res. 989/2022 ao art. 4º, II: pode ser inferior à do inciso I, com retrovisores externos dos dois lados.',
        dispositivos: ['res960.art4.II'],
      },
      {
        id: 'peliculas-03',
        enunciado:
          'Atualmente, a transmitância luminosa dos vidros que não interferem nas áreas indispensáveis à dirigibilidade não pode ser inferior a 28%.',
        gabarito: 'E',
        comentario: 'O mínimo de 28% era da redação original do art. 4º, II. Desde 02/01/2023 (Res. 989/2022), não há piso, desde que haja retrovisores externos em ambos os lados.',
        dispositivos: ['res960.art4.II', 'res960.art4.II.original'],
      },
      {
        id: 'peliculas-04',
        enunciado: 'Os vidros de segurança situados no teto dos veículos ficam excluídos dos limites de transmitância luminosa.',
        gabarito: 'C',
        comentario: 'Texto do art. 4º, § 3º.',
        dispositivos: ['res960.art4.par3'],
      },
      {
        id: 'peliculas-05',
        enunciado:
          'A chancela deve conter a marca do fabricante do vidro e o índice de transmitância luminosa, legíveis pelo lado interno do veículo.',
        gabarito: 'E',
        comentario:
          'Dois erros: a chancela traz a marca do **instalador** (art. 8º, § 1º) e deve ser legível pelos lados **externos** dos vidros (art. 8º, § 2º). A marca do fabricante do vidro é exigência da marcação do vidro de segurança (art. 5º).',
        dispositivos: ['res960.art8.par1', 'res960.art8.par2'],
      },
      {
        id: 'peliculas-06',
        enunciado:
          'Película refletiva é admitida nos vidros traseiros, desde que o veículo possua espelhos retrovisores externos em ambos os lados.',
        gabarito: 'E',
        comentario: 'A película refletiva é vedada em todas as áreas envidraçadas do veículo (art. 10, I). A condição dos retrovisores libera apenas a transmitância abaixo de 70%.',
        dispositivos: ['res960.art10.I'],
      },
      {
        id: 'peliculas-07',
        enunciado:
          'Se o medidor registra 64% no para-brisa, o valor considerado para fins de penalidade é 71%, e não há infração por transmitância.',
        gabarito: 'C',
        comentario: 'VC = MR + 7% (art. 19, § 1º): 64% + 7% = 71%, acima do mínimo de 70% (art. 4º, I).',
        dispositivos: ['res960.art19.par1', 'res960.art4.I'],
      },
      {
        id: 'peliculas-08',
        enunciado:
          'Conduzir veículo com película não refletiva sem chancela no para-brisa configura infração de natureza média, punida apenas com multa.',
        gabarito: 'E',
        comentario:
          'É o art. 230, XVI, do CTB (art. 21, III, "c", da Res. 960): infração **grave**, com multa e retenção do veículo para regularização.',
        dispositivos: ['res960.art21.III.c', 'ctb.art230.XVI', 'ctb.art230.sancao.VII-XIX'],
      },
      {
        id: 'peliculas-09',
        enunciado:
          'Nos veículos de carga com PBT superior a 3.500 kg, a faixa de 20 cm na parte inferior do para-brisa não integra a área envidraçada indispensável à dirigibilidade.',
        gabarito: 'C',
        comentario: 'O art. 4º, § 1º, I, exclui essa faixa nos veículos de carga com PBT acima de 3.500 kg e nos micro-ônibus e ônibus.',
        dispositivos: ['res960.art4.par1.I'],
      },
    ],
  },

  fichas: [
    {
      assunto: 'peliculas',
      zona: 'para-brisa',
      status: 'limite',
      resumoCurto: 'mín. 70%',
      destaque: {
        valor: '70%',
        rotulo: 'Transmitância luminosa mínima',
        detalhe: 'Medida no conjunto: vidro + película juntos',
      },
      essencial: {
        explicacao:
          'O para-brisa precisa deixar passar pelo menos 70% da luz, somando o vidro e a película. Como o vidro de fábrica já bloqueia parte da luz, a maioria das películas escuras (fumê) deixa o conjunto abaixo do limite. A faixa degradê de fábrica no alto do vidro e a borda serigrafada não entram nessa conta.',
        pode: [
          'Película não espelhada, com chancela, se o conjunto ficar em 70% ou mais.',
          'Faixa degradê de fábrica no alto do para-brisa.',
        ],
        naoPode: [
          'Película que deixe o conjunto abaixo de 70%.',
          'Película espelhada (refletiva).',
          'Película sem chancela ou com chancela ilegível.',
          'Película com bolhas.',
        ],
        naFiscalizacao: [CONFERIR_CONJUNTO, CONFERIR_CHANCELA, CONFERIR_TOLERANCIA],
      },
      prova: {
        pontosDeProva: [
          'O para-brisa é área indispensável à dirigibilidade (art. 4º, § 1º, I), com mínimo de 70% (art. 4º, I).',
          'Ficam fora da área indispensável do para-brisa: a faixa periférica de serigrafia, a banda degradê (conforme ABNT NBR 9491) e, nos veículos de carga com PBT acima de 3.500 kg, micro-ônibus e ônibus, a faixa de 20 cm na parte inferior (art. 4º, § 1º, I).',
          'Chancela obrigatória, com marca do instalador e índice de transmitância, gravada indelevelmente e legível pelo lado externo (art. 8º, §§ 1º e 2º). A falta da chancela e a chancela ilegível são enquadradas no art. 21, III, "c" e "d".',
          'Bolhas na área crítica de visão e nas áreas indispensáveis são vedadas (art. 10, II).',
        ],
        atencao: [
          'O art. 21 não traz alínea específica para película com bolhas; o parágrafo único do art. 21 ressalva a aplicação de outras penalidades previstas no CTB.',
        ],
      },
      dispositivos: [
        'res960.art4.I',
        'res960.art4.par1.I',
        'res960.art8.par1',
        'res960.art8.par2',
        'res960.art10.I',
        'res960.art10.II',
        'res960.art19.par1',
      ],
      enquadramentos: [PELICULA_ABAIXO_DO_LIMITE, PELICULA_REFLETIVA, PELICULA_SEM_CHANCELA, CHANCELA_ILEGIVEL],
    },
    {
      assunto: 'peliculas',
      zona: 'laterais-dianteiros',
      status: 'limite',
      resumoCurto: 'mín. 70%',
      destaque: {
        valor: '70%',
        rotulo: 'Transmitância luminosa mínima',
        detalhe: 'Medida no conjunto vidro + película das portas da frente',
      },
      essencial: {
        explicacao:
          'Os vidros das portas da frente seguem a mesma regra do para-brisa: o conjunto vidro + película precisa deixar passar pelo menos 70% da luz. É por eles que o motorista enxerga os retrovisores externos e o trânsito ao lado.',
        pode: ['Película não espelhada, com chancela, se o conjunto ficar em 70% ou mais.'],
        naoPode: [
          'Película que deixe o conjunto abaixo de 70%.',
          'Película espelhada (refletiva).',
          'Película sem chancela ou com chancela ilegível.',
          'Película com bolhas.',
        ],
        naFiscalizacao: [CONFERIR_CONJUNTO, CONFERIR_CHANCELA, CONFERIR_TOLERANCIA],
      },
      prova: {
        pontosDeProva: [
          'As laterais dianteiras são áreas indispensáveis à dirigibilidade, "respeitando o campo de visão do condutor" (art. 4º, § 1º, II).',
          'Mínimo de 70%, igual ao do para-brisa (art. 4º, I). Afirmar que as laterais dianteiras admitem limite menor que o para-brisa está errado.',
          'Aplicam-se a chancela obrigatória (art. 8º, § 1º) e a vedação de bolhas (art. 10, II).',
        ],
      },
      dispositivos: [
        'res960.art4.I',
        'res960.art4.par1.II',
        'res960.art8.par1',
        'res960.art10.I',
        'res960.art10.II',
        'res960.art19.par1',
      ],
      enquadramentos: [PELICULA_ABAIXO_DO_LIMITE, PELICULA_REFLETIVA, PELICULA_SEM_CHANCELA, CHANCELA_ILEGIVEL],
    },
    {
      assunto: 'peliculas',
      zona: 'laterais-traseiros',
      status: 'livre-condicional',
      resumoCurto: 'sem mínimo',
      destaque: {
        valor: 'Sem mínimo',
        rotulo: 'Pode ficar abaixo de 70%',
        detalhe: 'Se o carro tiver retrovisores externos dos dois lados',
      },
      essencial: {
        explicacao:
          'Os vidros das portas de trás não são usados diretamente para dirigir. Por isso, podem receber película mais escura, sem limite mínimo, desde que o carro tenha retrovisor externo dos dois lados. Película espelhada continua proibida.',
        pode: ['Película escura, sem limite mínimo, com retrovisores externos dos dois lados.'],
        naoPode: [
          'Película espelhada (refletiva).',
          'Escurecer abaixo de 70% se o carro não tiver os dois retrovisores externos.',
        ],
        naFiscalizacao: [
          'A condição a verificar são os espelhos retrovisores externos em ambos os lados: é ela que permite ficar abaixo de 70% (art. 4º, II).',
        ],
      },
      prova: {
        pontosDeProva: [
          'Art. 4º, II, com redação da Res. 989/2022: a transmitância pode ser inferior à do inciso I nos vidros que não interferem na dirigibilidade do veículo dotado de espelhos retrovisores externos em ambos os lados.',
          'Não há piso: o mínimo de 28% da redação original foi suprimido pela Res. 989/2022.',
          'A exigência de chancela do art. 8º, § 1º, refere-se às áreas envidraçadas indispensáveis à dirigibilidade.',
          'A vedação de película refletiva alcança todas as áreas envidraçadas (art. 10, I).',
        ],
        historico: [
          'De 01/06/2022 a 01/01/2023: mínimo de 28% (art. 4º, II, redação original).',
          'Desde 02/01/2023: sem mínimo, condicionado aos retrovisores externos (Res. 989/2022).',
        ],
        atencao: [
          'O art. 21, III, "a", continua tipificando película "opaca" sem distinguir a área do vidro, e a Resolução não define o que é película opaca.',
          'A nova redação do inciso II não diz qual percentual se aplica aos vidros traseiros de veículo sem retrovisores externos em ambos os lados.',
        ],
      },
      dispositivos: ['res960.art4.II', 'res960.art4.II.original', 'res960.art10.I'],
      enquadramentos: [PELICULA_REFLETIVA],
    },
    {
      assunto: 'peliculas',
      zona: 'vigia',
      status: 'livre-condicional',
      resumoCurto: 'sem mínimo',
      destaque: {
        valor: 'Sem mínimo',
        rotulo: 'Pode ficar abaixo de 70%',
        detalhe: 'Se o carro tiver retrovisores dos dois lados',
      },
      essencial: {
        explicacao:
          'O vidro traseiro (vigia) segue a mesma regra dos vidros das portas de trás: pode receber película mais escura, sem limite mínimo, se o carro tiver retrovisor dos dois lados. Película espelhada continua proibida.',
        pode: ['Película escura, sem limite mínimo, com retrovisores dos dois lados.'],
        naoPode: [
          'Película espelhada (refletiva).',
          'Escurecer abaixo de 70% se o carro não tiver os dois retrovisores externos.',
        ],
        naFiscalizacao: [
          'A condição a verificar é o espelho retrovisor em ambos os lados (art. 4º, § 2º).',
        ],
      },
      prova: {
        pontosDeProva: [
          'A vigia tem dispositivo próprio: aplica-se a ela o inciso II do art. 4º, desde que o veículo tenha espelho retrovisor em ambos os lados (art. 4º, § 2º).',
          'Com a redação da Res. 989/2022, o inciso II não tem piso: a vigia pode ficar abaixo de 70%.',
        ],
        atencao: [
          'O art. 21, III, "a", continua tipificando película "opaca" sem distinguir a área do vidro, e a Resolução não define o que é película opaca.',
        ],
      },
      dispositivos: ['res960.art4.par2', 'res960.art4.II', 'res960.art10.I'],
      enquadramentos: [PELICULA_REFLETIVA],
    },
    {
      assunto: 'peliculas',
      zona: 'teto',
      status: 'livre',
      resumoCurto: 'sem limite',
      destaque: {
        valor: 'Sem limite',
        rotulo: 'Fora dos limites de transmitância',
        detalhe: 'Vale para vidros no teto, como o teto solar',
      },
      essencial: {
        explicacao:
          'Se o carro tiver teto solar ou outro vidro no teto, ele não precisa cumprir nenhum limite de passagem de luz.',
        pode: ['Película escura no vidro do teto, sem limite mínimo.'],
        naoPode: ['Película espelhada (refletiva).'],
      },
      prova: {
        pontosDeProva: [
          'Os vidros de segurança situados no teto ficam excluídos dos limites do art. 4º (art. 4º, § 3º).',
          'A exclusão é dos limites de transmitância. A vedação de película refletiva do art. 10, I, refere-se às áreas envidraçadas do veículo, sem exceção para o teto.',
        ],
      },
      dispositivos: ['res960.art4.par3', 'res960.art10.I'],
      enquadramentos: [PELICULA_REFLETIVA],
    },
  ],
};
