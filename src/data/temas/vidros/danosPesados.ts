import type { Assunto, Enquadramento } from '@/types/conteudo';

const DANO_ALEM_DOS_LIMITES: Enquadramento = {
  situacao: 'Dano no para-brisa além dos limites da Resolução',
  infracao: 'ctb.230.XVIII',
  base: 'res960.art21.V.a',
};

const NOTA_3D = 'Veículo do 3D: caminhão de carga ilustrativo; a regra vale para ônibus, micro-ônibus e caminhões.';

export const danosPesados: Assunto = {
  id: 'danos-pesados',
  tema: 'vidros',
  titulo: 'Danos: ônibus, micro-ônibus e caminhões',
  tituloCurto: 'Danos pesados',
  subtitulo: 'Área crítica de 50 × 40 cm alinhada ao volante, até 3 danos',
  veiculo: 'caminhao',
  mapa3D: 'danos',
  resumoCurto: 'até 3 danos',
  zonas: ['para-brisa-area-critica', 'para-brisa-faixa-periferica', 'para-brisa-demais-areas'],

  visaoGeral: {
    resumo:
      'Nos ônibus, micro-ônibus e caminhões, a área crítica é um retângulo de 50 cm de altura por 40 cm de largura alinhado ao volante. Ali e na faixa de 2,5 cm das bordas, nenhum dano. No resto do vidro, até 3 danos: trinca de até 20 cm e fratura circular de até 4 cm.',
    destaque: {
      valor: '50 × 40 cm',
      rotulo: 'Área crítica de visão nos pesados',
      detalhe: 'Eixo na linha de centro do volante; base na tangente ao ponto mais alto do volante',
    },
    essencial: {
      explicacao:
        'Os pesados têm regra própria para a área crítica e para a tolerância. Em vez da metade da área varrida pelo limpador, a área crítica é um retângulo à esquerda do veículo, de 50 cm de altura por 40 cm de largura, centrado na linha do volante, com a base na altura do ponto mais alto do volante. Nela e na faixa de 2,5 cm das bordas, nenhuma trinca ou fratura circular, e o dano não pode ser recuperado. Fora delas, até 3 danos, com trinca de até 20 cm e fratura circular de até 4 cm.',
      pode: [
        'Até 3 danos fora da área crítica e da faixa de 2,5 cm.',
        'Trinca de até 20 cm e fratura circular de até 4 cm de diâmetro, nessas áreas.',
      ],
      naoPode: [
        'Qualquer trinca ou fratura circular no retângulo de 50 × 40 cm.',
        'Qualquer trinca ou fratura circular na faixa de 2,5 cm das bordas externas.',
        'Recuperar (consertar) dano na área crítica ou na faixa periférica.',
        'Mais de 3 danos, trinca maior que 20 cm ou fratura circular maior que 4 cm.',
      ],
      naFiscalizacao: [
        'Localizar a área crítica pelo volante: retângulo à esquerda, eixo vertical na projeção da linha de centro do volante e base na linha tangente ao ponto mais alto do volante (art. 15 e figura do Anexo II).',
        'Contar os danos e medir trincas e fraturas fora da área crítica e da faixa periférica (art. 15, parágrafo único).',
      ],
    },
    prova: {
      pontosDeProva: [
        'Área crítica dos pesados: retângulo de **50 cm de altura por 40 cm de largura**, à esquerda do veículo, com eixo de simetria vertical na projeção da linha de centro do volante e base na tangente ao ponto mais alto do volante (art. 15).',
        'Trocar as medidas é pegadinha clássica: **50 é a altura**, **40 é a largura**.',
        'Fora da área crítica e da faixa periférica: no máximo **3 danos**; trinca até **20 cm**; fratura circular até **4 cm** de diâmetro (art. 15, parágrafo único).',
        'A faixa periférica de 2,5 cm e a proibição de recuperar danos valem para todos os veículos (art. 14).',
        'Enquadramento igual ao dos automóveis: art. 230, XVIII, do CTB (art. 21, V, "a").',
      ],
    },
    dispositivos: [
      'res960.art13',
      'res960.art14',
      'res960.art15',
      'res960.art15.pu',
      'res960.art16',
    ],
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
        titulo: 'Quem segue o art. 15',
        paragrafos: [
          'O art. 15 trata dos para-brisas de **ônibus, micro-ônibus e caminhões**. Os demais veículos automotores seguem o art. 16 (área crítica na metade esquerda da varredura das palhetas e até 2 danos).',
        ],
      },
      {
        titulo: 'A área crítica: um retângulo amarrado ao volante',
        paragrafos: [
          'A área crítica de visão do condutor fica à esquerda do veículo e é um retângulo de **50 cm de altura por 40 cm de largura** (art. 15, com figura no Anexo II). Para posicioná-lo:',
        ],
        itens: [
          'o **eixo de simetria vertical** é a projeção da linha de centro do volante, paralela à linha de centro do veículo;',
          'a **base** coincide com a linha tangente ao ponto mais alto do volante.',
        ],
      },
      {
        titulo: 'Onde não pode haver nenhum dano',
        paragrafos: [
          'Na área crítica e na **faixa periférica de 2,5 cm** das bordas externas, não devem existir trincas nem fraturas de configuração circular, e, se ocorrerem, **não podem ser recuperadas** (art. 14). A regra é a mesma dos automóveis.',
        ],
      },
      {
        titulo: 'Fora dessas regiões: a tolerância maior',
        paragrafos: ['Nos pesados, fora da área crítica e da faixa periférica (art. 15, parágrafo único):'],
        itens: [
          'no máximo **três** danos;',
          'trinca de até **20 cm** de comprimento;',
          'fratura circular de até **4 cm** de diâmetro.',
        ],
      },
      {
        titulo: 'Comparando com os automóveis',
        paragrafos: [
          'Muda a forma da área crítica (retângulo × metade da varredura), o número de danos (3 × 2) e a trinca (20 cm × 10 cm). **Não muda** o diâmetro da fratura circular (4 cm), a faixa de 2,5 cm, a proibição de recuperar e o enquadramento (art. 230, XVIII).',
        ],
      },
    ],
    visuais: [
      { tipo: 'mapaDanos' },
      {
        tipo: 'tabela',
        titulo: 'Pesados × automóveis',
        colunas: ['', 'Ônibus, micro-ônibus e caminhões', 'Demais veículos'],
        linhas: [
          ['Área crítica', 'Retângulo de **50 × 40 cm** no eixo do volante (art. 15)', 'Metade esquerda da varredura das palhetas (art. 16)'],
          ['Máximo de danos', '**3**', '**2**'],
          ['Trinca', 'Até **20 cm**', 'Até **10 cm**'],
          ['Fratura circular', 'Até **4 cm**', 'Até **4 cm**'],
          ['Faixa de 2,5 cm', 'Nenhum dano (art. 14)', 'Nenhum dano (art. 14)'],
        ],
        nota: NOTA_3D,
      },
    ],
    conexoes: [
      {
        titulo: 'Danos nos automóveis',
        texto: 'A regra dos demais veículos (art. 16) está no assunto Danos no para-brisa.',
        dispositivos: ['res960.art16'],
      },
      {
        titulo: 'Tipificação',
        texto: 'Dano além dos limites: art. 230, XVIII, do CTB (art. 21, V, "a").',
        dispositivos: ['ctb.art230.XVIII', 'res960.art21.V.a'],
      },
    ],
    revisao: [
      'Pesados (ônibus, micro-ônibus e caminhões): área crítica de **50 cm de altura × 40 cm de largura**.',
      'Retângulo à **esquerda**, eixo na **linha de centro do volante**, base na **tangente ao topo do volante**.',
      'Fora da área crítica e da faixa: até **3** danos, trinca até **20 cm**, fratura até **4 cm**.',
      'Faixa de **2,5 cm** e proibição de **recuperar**: iguais às dos automóveis (art. 14).',
      'Enquadramento: **art. 230, XVIII** (art. 21, V, "a").',
    ],
    questoes: [
      {
        id: 'pesados-01',
        enunciado:
          'Nos para-brisas de ônibus, micro-ônibus e caminhões, a área crítica de visão do condutor é um retângulo de 40 cm de altura por 50 cm de largura.',
        gabarito: 'E',
        comentario: 'As medidas estão invertidas: **50 cm de altura por 40 cm de largura** (art. 15).',
        dispositivos: ['res960.art15'],
      },
      {
        id: 'pesados-02',
        enunciado:
          'O eixo de simetria vertical da área crítica dos pesados é demarcado pela projeção da linha de centro do volante, e a base do retângulo coincide com a linha tangente ao ponto mais alto do volante.',
        gabarito: 'C',
        comentario: 'É a descrição do art. 15, ilustrada na figura do Anexo II.',
        dispositivos: ['res960.art15'],
      },
      {
        id: 'pesados-03',
        enunciado:
          'Nos caminhões, fora da área crítica e da faixa periférica, admitem-se até três danos, com trinca de até 20 cm e fratura circular de até 4 cm de diâmetro.',
        gabarito: 'C',
        comentario: 'Art. 15, parágrafo único.',
        dispositivos: ['res960.art15.pu'],
      },
      {
        id: 'pesados-04',
        enunciado: 'Nos ônibus, a fratura circular tolerada fora das áreas proibidas pode ter até 20 cm de diâmetro.',
        gabarito: 'E',
        comentario: 'Os 20 cm são o limite da **trinca**. A fratura circular vai até **4 cm** de diâmetro, como nos automóveis (art. 15, parágrafo único, II).',
        dispositivos: ['res960.art15.pu'],
      },
      {
        id: 'pesados-05',
        enunciado:
          'Por tolerarem mais danos, os pesados podem ter a trinca da faixa periférica de 2,5 cm recuperada, desde que não ultrapasse 20 cm.',
        gabarito: 'E',
        comentario: 'Na faixa periférica de 2,5 cm não devem existir trincas nem fraturas circulares, e as que ocorrerem não podem ser recuperadas, em qualquer veículo (art. 14).',
        dispositivos: ['res960.art14'],
      },
      {
        id: 'pesados-06',
        enunciado: 'Veículo de carga com dano no para-brisa além dos limites da Res. 960/2022 é enquadrado no art. 230, XVIII, do CTB.',
        gabarito: 'C',
        comentario: 'Art. 21, V, "a", da Res. 960/2022, que remete ao art. 230, XVIII, do CTB.',
        dispositivos: ['res960.art21.V.a', 'ctb.art230.XVIII'],
      },
    ],
  },

  fichas: [
    {
      assunto: 'danos-pesados',
      zona: 'para-brisa-area-critica',
      descricaoZona: 'Retângulo de 50 × 40 cm alinhado ao volante',
      status: 'proibido',
      resumoCurto: 'zero dano',
      destaque: {
        valor: '50 × 40 cm',
        rotulo: 'Nenhuma trinca ou fratura circular',
        detalhe: 'E o dano que ocorrer não pode ser recuperado',
      },
      essencial: {
        explicacao:
          'É o retângulo de 50 cm de altura por 40 cm de largura diante do motorista, alinhado à linha de centro do volante e com a base na altura do ponto mais alto do volante. Ali não pode haver nenhuma trinca nem fratura circular, e o dano que ocorrer não pode ser recuperado.',
        pode: [],
        naoPode: ['Qualquer trinca, de qualquer tamanho.', 'Qualquer fratura circular.', 'Recuperar (consertar) o dano.'],
        naFiscalizacao: [
          'O retângulo é localizado pelo volante: eixo vertical na linha de centro do volante e base na tangente ao seu ponto mais alto (art. 15).',
        ],
      },
      prova: {
        pontosDeProva: [
          '50 cm de **altura** por 40 cm de **largura**, à esquerda do veículo (art. 15).',
          'Nenhum dano e proibido o reparo (art. 14).',
        ],
        },
      dispositivos: ['res960.art14', 'res960.art15'],
      enquadramentos: [DANO_ALEM_DOS_LIMITES],
    },
    {
      assunto: 'danos-pesados',
      zona: 'para-brisa-faixa-periferica',
      status: 'proibido',
      resumoCurto: 'zero dano',
      destaque: {
        valor: '2,5 cm',
        rotulo: 'Faixa junto às bordas externas',
        detalhe: 'Nenhuma trinca ou fratura circular, sem reparo',
      },
      essencial: {
        explicacao:
          'Em toda a volta do para-brisa, numa faixa de 2,5 cm a partir das bordas externas, não pode haver nenhuma trinca nem fratura circular. A regra é a mesma dos automóveis.',
        pode: [],
        naoPode: ['Qualquer trinca ou fratura circular na faixa de 2,5 cm.', 'Recuperar (consertar) o dano.'],
      },
      prova: {
        pontosDeProva: ['A faixa periférica de 2,5 cm vale para todos os veículos (art. 14).'],
      },
      dispositivos: ['res960.art14'],
      enquadramentos: [DANO_ALEM_DOS_LIMITES],
    },
    {
      assunto: 'danos-pesados',
      zona: 'para-brisa-demais-areas',
      status: 'limite',
      resumoCurto: 'até 3 danos',
      destaque: {
        valor: '3 danos',
        rotulo: 'Trinca até 20 cm; fratura circular até 4 cm',
        detalhe: 'Fora da área crítica e da faixa de 2,5 cm',
      },
      essencial: {
        explicacao:
          'Fora da área crítica e da faixa das bordas, o para-brisa dos pesados pode ter até 3 danos: trinca de até 20 cm ou fratura circular de até 4 cm de diâmetro.',
        pode: ['Até 3 danos.', 'Trinca de até 20 cm.', 'Fratura circular de até 4 cm de diâmetro.'],
        naoPode: ['Mais de 3 danos.', 'Trinca maior que 20 cm.', 'Fratura circular maior que 4 cm.'],
      },
      prova: {
        pontosDeProva: [
          'Até 3 danos; trinca até 20 cm; fratura circular até 4 cm (art. 15, parágrafo único).',
          'O limite da fratura (4 cm) é o mesmo dos automóveis; mudam o número de danos e a trinca.',
        ],
      },
      dispositivos: ['res960.art15.pu'],
      enquadramentos: [DANO_ALEM_DOS_LIMITES],
    },
  ],
};
