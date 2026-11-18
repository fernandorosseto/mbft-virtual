import type { Norma, NormaId } from '@/types/conteudo';

export const NORMAS: Record<NormaId, Norma> = {
  res960: {
    id: 'res960',
    titulo:
      'Resolução CONTRAN nº 960, de 17 de maio de 2022: requisitos de segurança de vidros, visibilidade, vidros em veículos blindados e medidores de transmitância luminosa',
    sigla: 'Res. CONTRAN 960/2022',
    publicacao: 'DOU de 25/05/2022',
    vigencia: 'Em vigor desde 01/06/2022',
    url: 'https://www.in.gov.br/web/dou/-/resolucao-contran-n-960-de-17-de-maio-de-2022-402813379',
  },
  res989: {
    id: 'res989',
    titulo: 'Resolução CONTRAN nº 989, de 15 de dezembro de 2022: altera a Resolução CONTRAN nº 960/2022',
    sigla: 'Res. CONTRAN 989/2022',
    publicacao: 'DOU de 26/12/2022 (edição extra)',
    vigencia: 'Em vigor desde 02/01/2023',
    url: 'https://www.in.gov.br/en/web/dou/-/resolucao-contran-n-989-de-15-de-dezembro-de-2022-453303681',
  },
  ctb: {
    id: 'ctb',
    titulo: 'Código de Trânsito Brasileiro (Lei nº 9.503, de 23 de setembro de 1997)',
    sigla: 'CTB',
    publicacao: 'DOU de 24/09/1997',
    vigencia: 'Texto compilado do Planalto, cópia de 06/11/2026',
    url: 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
  },
};
