import type { PaginaResolucao } from '@/types/conteudo';

/**
 * Página da Res. CONTRAN 960/2022 (porta de entrada do tema Vidros).
 * O mapa precisa cobrir todos os artigos da norma: `npm run verificar:citacoes` confere.
 */
export const paginaRes960: PaginaResolucao = {
  norma: 'res960',
  resumo:
    'A Res. 960/2022 reúne as regras sobre os vidros dos veículos: vidro de segurança, transmitância luminosa (películas), inscrições e cortinas, danos no para-brisa, medição com o medidor de transmitância luminosa (MTL) e o enquadramento de cada situação no CTB.',
  fichaTecnica: [
    { rotulo: 'Norma', valor: 'Resolução CONTRAN nº 960, de 17 de maio de 2022' },
    { rotulo: 'Publicação', valor: 'DOU de 25/05/2022, Seção 1, p. 442' },
    { rotulo: 'Vigência', valor: 'Desde 1º de junho de 2022 (art. 23)' },
    {
      rotulo: 'Alterada por',
      valor: 'Res. CONTRAN 989/2022, em vigor desde 02/01/2023: nova redação do art. 4º, II, do art. 12 e da Figura 1 do Anexo I',
    },
    {
      rotulo: 'Revogou',
      valor:
        'Art. 3º da Res. 786/2020 e as Res. 216/2006, 253/2007, 254/2007, 334/2009, 385/2011, 386/2011, 580/2016, 707/2017 e 869/2021 (art. 22)',
    },
    { rotulo: 'Estrutura', valor: '23 artigos em 4 capítulos: áreas envidraçadas, danos, medidores de transmitância luminosa (MTL) e disposições finais' },
    { rotulo: 'Base legal', valor: 'Competência do CONTRAN (art. 12, I, do CTB); vedações do art. 111 do CTB' },
  ],
  porQueCai: [
    'Os editais da PRF de 2018 e de 2021 cobraram as Res. **216/2006**, **253/2007** e **254/2007**. As três foram revogadas pela 960 (art. 22): quem estuda por elas estuda texto que não vale mais.',
    'A Res. 989/2022 mudou o art. 4º, II, depois da publicação: o mínimo de 28% dos vidros traseiros deixou de existir. Mudança recente é alvo clássico de item Certo/Errado.',
    'Os enquadramentos se espalham por cinco incisos do art. 230 do CTB (XII, XV, XVI, XVII e XVIII) e pelo art. 237. Trocar um inciso pelo outro é pegadinha frequente.',
  ],
  alcance: [
    {
      titulo: 'Objeto e alcance da Resolução',
      paragrafos: [
        'A Resolução trata de quatro temas: requisitos de segurança dos vidros, visibilidade para fins de circulação, vidros em veículos blindados e uso de medidores de transmitância luminosa (art. 1º).',
        'Ela **não se aplica** às máquinas agrícolas, rodoviárias e florestais, aos veículos destinados à circulação exclusivamente fora das vias públicas e aos veículos incompletos, inacabados e destinados à exportação (art. 11).',
      ],
    },
    {
      titulo: 'Infrações: o rol do art. 21 não é fechado',
      paragrafos: [
        'O art. 21 liga cada descumprimento a um dispositivo do CTB. O parágrafo único avisa que essas situações **não afastam** a aplicação de outras penalidades previstas no CTB.',
      ],
    },
    {
      titulo: 'Revogações e vigência',
      paragrafos: [
        'A 960 entrou em vigor em 1º de junho de 2022 (art. 23) e revogou nove resoluções anteriores e o art. 3º da Res. 786/2020 (art. 22). A Res. 989/2022 entrou em vigor em 2 de janeiro de 2023 (art. 3º da 989).',
      ],
    },
  ],
  mapa: [
    { rotulo: 'Art. 1º', artigos: [1], resumo: 'Objeto da Resolução', assunto: null },
    {
      rotulo: 'Arts. 2º, 3º, 5º a 7º e 12',
      artigos: [2, 3, 5, 6, 7, 12],
      resumo: 'Vidro de segurança, marcação e blindados',
      assunto: 'vidro-seguranca',
    },
    { rotulo: 'Arts. 4º e 8º', artigos: [4, 8], resumo: 'Transmitância luminosa e películas', assunto: 'peliculas' },
    { rotulo: 'Art. 9º', artigos: [9], resumo: 'Inscrições fora das áreas indispensáveis', assunto: 'inscricoes' },
    { rotulo: 'Art. 10, I e II', artigos: [10], resumo: 'Película refletiva e película com bolhas', assunto: 'peliculas' },
    { rotulo: 'Art. 10, III a V', artigos: [10], resumo: 'Inscrições, cortinas e painéis luminosos', assunto: 'inscricoes' },
    { rotulo: 'Art. 11', artigos: [11], resumo: 'Veículos aos quais a Resolução não se aplica', assunto: null },
    { rotulo: 'Arts. 13, 14 e 16', artigos: [13, 14, 16], resumo: 'Danos no para-brisa dos automóveis', assunto: 'danos' },
    { rotulo: 'Art. 15', artigos: [15], resumo: 'Danos no para-brisa de ônibus, micro-ônibus e caminhões', assunto: 'danos-pesados' },
    { rotulo: 'Arts. 17 a 20', artigos: [17, 18, 19, 20], resumo: 'Medidor de transmitância luminosa (MTL)', assunto: 'medicao' },
    { rotulo: 'Art. 21, III, "a" a "d"', artigos: [21], resumo: 'Infrações com película', assunto: 'peliculas' },
    { rotulo: 'Art. 21, V, "a"', artigos: [21], resumo: 'Infração por dano no para-brisa', assunto: 'danos' },
    { rotulo: 'Art. 21, V, "b", e VI', artigos: [21], resumo: 'Infrações com vidro de segurança', assunto: 'vidro-seguranca' },
    {
      rotulo: 'Art. 21, I, II, III, "e", e IV',
      artigos: [21],
      resumo: 'Infrações com inscrições, publicidade, painéis e cortinas',
      assunto: 'inscricoes',
    },
    { rotulo: 'Art. 21, parágrafo único', artigos: [21], resumo: 'Outras penalidades do CTB', assunto: null },
    { rotulo: 'Arts. 22 e 23', artigos: [22, 23], resumo: 'Revogações e vigência', assunto: null },
  ],
  linhaDoTempo: [
    { data: '19/01/2021', texto: 'Edital da PRF publicado no DOU, ainda com as Res. 216/2006, 253/2007 e 254/2007.' },
    { data: '17/05/2022', texto: 'CONTRAN aprova a Res. 960/2022.' },
    { data: '25/05/2022', texto: 'Publicação no DOU.' },
    { data: '01/06/2022', texto: 'A 960 entra em vigor e revoga as resoluções anteriores (arts. 22 e 23).' },
    { data: '15/12/2022', texto: 'CONTRAN aprova a Res. 989/2022, que altera a 960.' },
    {
      data: '02/01/2023',
      texto:
        'A 989 entra em vigor: os vidros que não interferem na dirigibilidade perdem o mínimo de 28% (art. 4º, II), e a isenção dos blindados passa a ser só do inciso I do art. 4º (art. 12).',
    },
  ],
  dispositivos: ['res960.art1', 'res960.art11', 'res960.art21.pu', 'res960.art22', 'res960.art23', 'res989.art3'],
};
