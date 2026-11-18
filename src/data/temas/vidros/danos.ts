import type { Assunto, Enquadramento } from '@/types/conteudo';

const DANO_ALEM_DOS_LIMITES: Enquadramento = {
  situacao: 'Dano no para-brisa além dos limites da Resolução',
  infracao: 'ctb.230.XVIII',
  base: 'res960.art21.V.a',
};

const SO_TRINCA_E_FRATURA =
  'Para a Resolução, só contam como dano as trincas (rachaduras em linha) e as fraturas circulares, como a marca de pedrada chamada de "olho de boi".';

export const danos: Assunto = {
  id: 'danos',
  tema: 'vidros',
  titulo: 'Danos no para-brisa',
  tituloCurto: 'Danos',
  subtitulo: 'Trincas, fraturas circulares e áreas sem tolerância',
  mapa3D: 'danos',
  resumoCurto: 'até 2 danos',
  zonas: ['para-brisa-area-critica', 'para-brisa-faixa-periferica', 'para-brisa-demais-areas'],

  visaoGeral: {
    resumo:
      'Na área crítica (nos carros, a metade esquerda da região varrida pelo limpador) e numa faixa de 2,5 cm junto às bordas, o para-brisa não pode ter nenhuma trinca ou fratura circular. No resto do vidro, carros toleram até 2 danos pequenos.',
    destaque: {
      valor: '10 cm / Ø 4 cm',
      rotulo: 'Limites de cada dano fora das áreas proibidas (carros)',
      detalhe: 'Zero dano na área crítica e na faixa de 2,5 cm das bordas',
    },
    essencial: {
      explicacao:
        'Nem toda trinca no para-brisa dá multa. O que importa é onde ela está e o tamanho. Na área crítica (nos carros, a metade da área varrida pelo limpador do lado do motorista) e na borda do vidro não pode haver nenhum dano, nem consertado. No resto do para-brisa, o carro pode ter até 2 danos: trinca de até 10 cm ou marca circular de até 4 cm de diâmetro. Ônibus, micro-ônibus e caminhões têm regras próprias.',
      pode: [
        'Até 2 danos fora da área crítica e da borda de 2,5 cm.',
        'Trinca de até 10 cm e marca circular de até 4 cm de diâmetro, nessas áreas permitidas.',
      ],
      naoPode: [
        'Qualquer trinca ou fratura circular na área crítica de visão do condutor.',
        'Qualquer trinca ou fratura circular na faixa de 2,5 cm junto às bordas.',
        'Recuperar danos na área crítica ou na faixa de 2,5 cm da borda.',
        'Mais de 2 danos, trinca maior que 10 cm ou marca circular maior que 4 cm.',
      ],
      naFiscalizacao: [SO_TRINCA_E_FRATURA],
    },
    prova: {
      pontosDeProva: [
        'São danos ao para-brisa apenas as trincas e as fraturas de configuração circular (art. 13).',
        'Área crítica de visão e faixa periférica de 2,5 cm das bordas externas: não devem existir trincas e fraturas circulares, e, caso ocorram, não podem ser recuperadas (art. 14).',
        'Área crítica: nos ônibus, micro-ônibus e caminhões, retângulo de 50 cm de altura por 40 cm de largura, com eixo na linha de centro do volante e base na tangente do ponto mais alto do volante (art. 15, figura do Anexo II). Nos demais veículos automotores, metade esquerda da região de varredura das palhetas do limpador (art. 16).',
        'Fora dessas regiões: no máximo 3 danos nos pesados (trinca até 20 cm; fratura circular até 4 cm), conforme art. 15, parágrafo único; no máximo 2 danos nos demais (trinca até 10 cm; fratura circular até 4 cm), conforme art. 16, parágrafo único.',
        'Enquadramento diferente das películas: dano além dos limites é art. 230, XVIII, do CTB (art. 21, V, "a"), e não o inciso XVI. Ambas são infrações graves, com retenção.',
        'A ausência de qualquer dos vidros de segurança também é enquadrada no art. 230, XVIII (art. 21, V, "b").',
      ],
    },
    dispositivos: ['res960.art13', 'res960.art14', 'res960.art15', 'res960.art15.pu', 'res960.art16', 'res960.art16.pu'],
    enquadramentos: [DANO_ALEM_DOS_LIMITES],
    comparativoVeiculos: {
      passeio: {
        rotulo: 'Automóveis e demais veículos automotores',
        areaCritica: 'Metade esquerda da região de varredura das palhetas do limpador',
        maxDanos: 'Até 2 danos fora da área crítica e da faixa periférica',
        maxTrinca: 'Trinca de até 10 cm de comprimento',
        maxFraturaCircular: 'Fratura circular de até 4 cm de diâmetro',
        faixaPeriferica: 'Faixa de 2,5 cm das bordas externas: nenhum dano',
        base: 'Res. CONTRAN 960/2022, arts. 14 e 16',
      },
      pesados: {
        rotulo: 'Ônibus, micro-ônibus e caminhões',
        areaCritica: 'Retângulo de 50 cm (altura) × 40 cm (largura) alinhado ao centro do volante',
        maxDanos: 'Até 3 danos fora da área crítica e da faixa periférica',
        maxTrinca: 'Trinca de até 20 cm de comprimento',
        maxFraturaCircular: 'Fratura circular de até 4 cm de diâmetro',
        faixaPeriferica: 'Faixa de 2,5 cm das bordas externas: nenhum dano',
        base: 'Res. CONTRAN 960/2022, arts. 14 e 15 e Anexo II',
      },
    },
  },

  aula: {
    teoria: [
      {
        titulo: 'O que conta como dano',
        paragrafos: [
          'Para a Resolução, dano ao para-brisa são as **trincas** e as **fraturas de configuração circular** (art. 13). A fratura circular é a marca arredondada, típica de pedrada.',
        ],
      },
      {
        titulo: 'Onde não pode haver nenhum dano',
        paragrafos: [
          'Na **área crítica de visão do condutor** e numa **faixa periférica de 2,5 cm** das bordas externas do para-brisa, não devem existir trincas nem fraturas circulares. E, se ocorrerem, **não podem ser recuperadas** (art. 14): o reparo não regulariza.',
        ],
      },
      {
        titulo: 'A área crítica depende do veículo',
        paragrafos: [
          'Nos **ônibus, micro-ônibus e caminhões**, a área crítica é um retângulo à esquerda do veículo, de **50 cm de altura por 40 cm de largura**. O eixo vertical segue a projeção da linha de centro do volante, e a base coincide com a tangente do ponto mais alto do volante (art. 15, com figura no Anexo II).',
          'Nos **demais veículos automotores**, a área crítica é a **metade esquerda da região varrida pelas palhetas** do limpador de para-brisa (art. 16).',
          'Atenção ao alcance da regra: nos automóveis, a área crítica **não é o lado esquerdo inteiro** do vidro. É só a parte do lado do motorista que as palhetas alcançam. Os cantos que o limpador não varre ficam nas demais áreas, com a tolerância do parágrafo único, salvo a faixa periférica de 2,5 cm, onde nenhum dano é admitido (art. 14).',
        ],
      },
      {
        titulo: 'Fora das áreas proibidas: quantos danos e de que tamanho',
        paragrafos: [
          'Fora da área crítica e da faixa periférica, a tolerância muda conforme o veículo:',
        ],
        itens: [
          '**Ônibus, micro-ônibus e caminhões**: no máximo **três** danos; trinca de até **20 cm**; fratura circular de até **4 cm** de diâmetro (art. 15, parágrafo único).',
          '**Demais veículos**: no máximo **dois** danos; trinca de até **10 cm**; fratura circular de até **4 cm** de diâmetro (art. 16, parágrafo único).',
        ],
      },
      {
        titulo: 'Enquadramento',
        paragrafos: [
          'Dano além dos limites e condições da Resolução é enquadrado no **art. 230, XVIII, do CTB** (art. 21, V, "a"): conduzir o veículo em mau estado de conservação, comprometendo a segurança. Infração grave: 5 pontos, multa de R$ 195,23 e retenção do veículo para regularização.',
          'Atenção à troca de incisos: película é XVI; dano no para-brisa é **XVIII**.',
        ],
      },
    ],
    visuais: [
      { tipo: 'mapaDanos' },
      {
        tipo: 'tabela',
        titulo: 'Danos tolerados por tipo de veículo',
        colunas: ['', 'Ônibus, micro-ônibus e caminhões', 'Demais veículos'],
        linhas: [
          ['Área crítica', 'Retângulo de 50 × 40 cm alinhado ao volante (art. 15)', 'Metade esquerda da varredura das palhetas (art. 16)'],
          ['Área crítica e faixa de 2,5 cm', 'Nenhum dano; sem reparo (art. 14)', 'Nenhum dano; sem reparo (art. 14)'],
          ['Máximo de danos fora delas', '**3**', '**2**'],
          ['Trinca', 'Até **20 cm**', 'Até **10 cm**'],
          ['Fratura circular', 'Até **4 cm** de diâmetro', 'Até **4 cm** de diâmetro'],
        ],
        nota: 'O limite da fratura circular (4 cm) é o mesmo nas duas colunas; mudam o número de danos e o comprimento da trinca.',
      },
    ],
    conexoes: [
      {
        titulo: 'Tipificação no CTB',
        texto: 'O art. 230, XVIII, trata do veículo em mau estado de conservação, comprometendo a segurança. A Res. 960 diz quando o dano no para-brisa se encaixa nele (art. 21, V, "a").',
        dispositivos: ['ctb.art230.XVIII', 'res960.art21.V.a'],
      },
      {
        titulo: 'Vidro de segurança',
        texto: 'O para-brisa de todos os veículos deve ser de vidro de segurança laminado (art. 3º). A ausência de qualquer vidro de segurança também cai no art. 230, XVIII (art. 21, V, "b"): veja o assunto Vidro de segurança.',
        dispositivos: ['res960.art3', 'res960.art21.V.b'],
      },
    ],
    revisao: [
      'Dano = **trinca** ou **fratura de configuração circular** (art. 13).',
      'Área crítica e faixa de **2,5 cm** das bordas: **nenhum** dano e **proibido o reparo** (art. 14).',
      'Ônibus, micro-ônibus e caminhões: área crítica de **50 × 40 cm**; até **3** danos; trinca até **20 cm**.',
      'Demais veículos: área crítica na **metade esquerda da varredura das palhetas** (não no lado esquerdo inteiro do vidro); até **2** danos; trinca até **10 cm**.',
      'Fratura circular: até **4 cm** de diâmetro **nas duas categorias**.',
      'Enquadramento: **art. 230, XVIII** (não XVI). Grave, 5 pontos, R$ 195,23, retenção.',
    ],
    questoes: [
      {
        id: 'danos-01',
        enunciado: 'Para efeito da Res. 960/2022, as trincas e as fraturas de configuração circular são consideradas dano ao para-brisa.',
        gabarito: 'C',
        comentario: 'Texto do art. 13.',
        dispositivos: ['res960.art13'],
      },
      {
        id: 'danos-02',
        enunciado:
          'Trinca de 5 cm na área crítica de visão do condutor de um automóvel pode ser recuperada, desde que o reparo não prejudique a visibilidade.',
        gabarito: 'E',
        comentario: 'Na área crítica e na faixa periférica de 2,5 cm não devem existir trincas e fraturas circulares, e, caso ocorram, **não podem ser recuperadas** (art. 14).',
        dispositivos: ['res960.art14'],
      },
      {
        id: 'danos-03',
        enunciado:
          'Nos automóveis, admitem-se até dois danos fora da área crítica e da faixa periférica, desde que a trinca não supere 10 cm e a fratura circular não supere 4 cm de diâmetro.',
        gabarito: 'C',
        comentario: 'É o parágrafo único do art. 16, que vale para os demais veículos automotores.',
        dispositivos: ['res960.art16.pu'],
      },
      {
        id: 'danos-04',
        enunciado: 'Nos ônibus, a fratura de configuração circular tolerada fora das áreas proibidas pode ter até 20 cm de diâmetro.',
        gabarito: 'E',
        comentario: 'Os 20 cm são o limite da **trinca**. A fratura circular vai até 4 cm de diâmetro (art. 15, parágrafo único, II).',
        dispositivos: ['res960.art15.pu'],
      },
      {
        id: 'danos-05',
        enunciado: 'Nos caminhões, a área crítica de visão do condutor é a metade esquerda da região de varredura das palhetas do limpador.',
        gabarito: 'E',
        comentario:
          'Nos ônibus, micro-ônibus e caminhões, a área crítica é o retângulo de 50 cm por 40 cm alinhado ao volante (art. 15). A metade esquerda da varredura vale para os demais veículos (art. 16).',
        dispositivos: ['res960.art15', 'res960.art16'],
      },
      {
        id: 'danos-06',
        enunciado: 'Veículo com dano no para-brisa além dos limites da Res. 960/2022 enquadra-se no art. 230, XVI, do CTB.',
        gabarito: 'E',
        comentario: 'O enquadramento é o art. 230, **XVIII** (art. 21, V, "a"). O inciso XVI é o das películas.',
        dispositivos: ['res960.art21.V.a', 'ctb.art230.XVIII'],
      },
      {
        id: 'danos-08',
        enunciado:
          'Nos automóveis, toda a metade esquerda do para-brisa, do lado do condutor, constitui a área crítica de visão.',
        gabarito: 'E',
        comentario:
          'A área crítica é a metade esquerda da **região de varredura das palhetas** do limpador (art. 16), e não a metade esquerda do vidro inteiro. Fora da varredura valem os limites do parágrafo único, exceto na faixa periférica de 2,5 cm (art. 14).',
        dispositivos: ['res960.art16', 'res960.art16.pu', 'res960.art14'],
      },
      {
        id: 'danos-07',
        enunciado:
          'Na faixa periférica de 2,5 cm de largura das bordas externas do para-brisa não devem existir trincas nem fraturas de configuração circular.',
        gabarito: 'C',
        comentario: 'Art. 14: a regra da faixa periférica é a mesma da área crítica.',
        dispositivos: ['res960.art14'],
      },
    ],
  },

  fichas: [
    {
      assunto: 'danos',
      zona: 'para-brisa-area-critica',
      status: 'proibido',
      resumoCurto: 'zero dano',
      destaque: {
        valor: 'Zero',
        rotulo: 'Nenhuma trinca ou fratura circular',
        detalhe: 'E danos nessa área não podem ser consertados',
      },
      essencial: {
        explicacao:
          'É a parte do para-brisa diante do motorista. Nos carros, corresponde à metade esquerda da área que o limpador varre, e não ao lado esquerdo inteiro do vidro. Ali não pode haver nenhuma trinca nem marca de pedrada, por menor que seja, e o dano que ocorrer não pode ser recuperado.',
        pode: [],
        naoPode: [
          'Qualquer trinca, de qualquer tamanho.',
          'Qualquer fratura circular (marca de pedrada).',
          'Recuperar (consertar) o dano.',
        ],
        naFiscalizacao: [
          'Nos demais veículos, a área crítica é a metade esquerda da região varrida pelas palhetas do limpador (art. 16). Qualquer trinca ou fratura circular ali basta para a irregularidade.',
        ],
      },
      prova: {
        pontosDeProva: [
          'Demais veículos automotores: metade esquerda da região de varredura das palhetas do limpador (art. 16, caput).',
          'Ônibus, micro-ônibus e caminhões: retângulo de 50 cm × 40 cm à esquerda, com eixo vertical na linha de centro do volante e base na tangente do ponto mais alto do volante (art. 15, caput, e Anexo II).',
          'Proibição dupla: não devem existir danos e, caso ocorram, não podem ser recuperados (art. 14).',
        ],
      },
      dispositivos: ['res960.art14', 'res960.art16', 'res960.art15'],
      enquadramentos: [DANO_ALEM_DOS_LIMITES],
    },
    {
      assunto: 'danos',
      zona: 'para-brisa-faixa-periferica',
      status: 'proibido',
      resumoCurto: 'zero dano',
      destaque: {
        valor: '2,5 cm',
        rotulo: 'Faixa junto às bordas sem nenhum dano',
        detalhe: 'Vale para todos os veículos, e não pode ser consertada',
      },
      essencial: {
        explicacao:
          'Em toda a volta do para-brisa, numa faixa de 2,5 cm a partir da borda externa, não pode haver trinca nem marca de pedrada. Danos na borda enfraquecem o vidro inteiro e também não podem ser consertados.',
        pode: [],
        naoPode: [
          'Qualquer trinca ou fratura circular a até 2,5 cm da borda externa.',
          'Consertar o dano nessa faixa.',
        ],
      },
      prova: {
        pontosDeProva: [
          'A faixa periférica de 2,5 cm das bordas externas tem o mesmo tratamento da área crítica: sem danos e sem recuperação (art. 14).',
          'A regra vale para todos os veículos; os arts. 15 e 16 ressalvam expressamente as regiões do art. 14.',
        ],
      },
      dispositivos: ['res960.art14'],
      enquadramentos: [DANO_ALEM_DOS_LIMITES],
    },
    {
      assunto: 'danos',
      zona: 'para-brisa-demais-areas',
      status: 'limite',
      resumoCurto: 'até 2 danos',
      destaque: {
        valor: '2 danos',
        rotulo: 'Máximo em carros: trinca até 10 cm, fratura até Ø 4 cm',
        detalhe: 'Ônibus, micro-ônibus e caminhões: 3 danos, trinca até 20 cm',
      },
      essencial: {
        explicacao:
          'Fora da área crítica e da borda, o para-brisa do carro pode ter até 2 danos pequenos: trinca de até 10 cm ou marca circular de até 4 cm de diâmetro. Passou disso, o veículo está irregular.',
        pode: [
          'Até 2 danos no total.',
          'Trinca de até 10 cm de comprimento.',
          'Fratura circular (marca de pedrada) de até 4 cm de diâmetro.',
        ],
        naoPode: [
          'Três danos ou mais.',
          'Trinca maior que 10 cm.',
          'Fratura circular maior que 4 cm de diâmetro.',
        ],
        naFiscalizacao: [SO_TRINCA_E_FRATURA],
      },
      prova: {
        pontosDeProva: [
          'Demais veículos automotores: no máximo dois danos; trinca não superior a 10 cm; fratura circular não superior a 4 cm de diâmetro (art. 16, parágrafo único).',
          'Ônibus, micro-ônibus e caminhões: no máximo três danos; trinca não superior a 20 cm; fratura circular não superior a 4 cm de diâmetro (art. 15, parágrafo único).',
          'O limite de diâmetro da fratura circular (4 cm) é o mesmo para as duas categorias; mudam o número de danos e o comprimento da trinca.',
        ],
        atencao: [
          'A proibição de recuperar danos (art. 14) refere-se à área crítica e à faixa periférica. A Resolução não trata da recuperação de danos nas demais áreas.',
        ],
      },
      dispositivos: ['res960.art16.pu', 'res960.art15.pu'],
      enquadramentos: [DANO_ALEM_DOS_LIMITES],
    },
  ],
};
