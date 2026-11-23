/**
 * Ferramentas de apoio (páginas próprias, fora do texto do MBFT). Comum ao servidor e ao cliente.
 * `fichas`: onde a ficha mostra um cartão com o link; `palavras`: termos da busca do catálogo que
 * mostram o atalho (normalizados, sem acento; o termo digitado casa pelo começo).
 */
export interface Ferramenta {
  href: string;
  titulo: string;
  descricao: string;
  fichas: string[];
  palavras: string[];
}

export const FERRAMENTAS: Ferramenta[] = [
  {
    href: '/ferramentas/roda-pneu',
    titulo: 'Calculadora roda/pneu',
    descricao: 'Diâmetro do conjunto instalado × original, tolerância de ± 3% (Res. CONTRAN nº 916/2022, art. 10)',
    fichas: ['661-02'],
    palavras: ['roda', 'rodas', 'pneu', 'pneus', 'aro', 'diametro', 'calculadora'],
  },
];

/** Ferramentas cujo atalho aparece para esses termos da busca (termos com 3 letras ou mais). */
export function ferramentasDaBusca(termos: string[]): Ferramenta[] {
  return FERRAMENTAS.filter((f) =>
    termos.some((t) => t.length >= 3 && f.palavras.some((p) => p.startsWith(t) || t.startsWith(p))),
  );
}
