import type { Tamanho } from './grafo';
import { linhasDoTema } from './rotulos';

/** Nó de grafo pronto para desenhar (serve ao servidor e ao cliente). */
export interface NoGrafo {
  /** Código da ficha. */
  id: string;
  /** Rótulo pelo artigo ("Art. 230, XVI"), mostrado no modo "guiar por artigo". */
  artigo: string;
  /** Uma ou duas palavras do tema, embaixo do código. */
  tema: string;
  /** Posição inicial (já calculada por posicionar). */
  x: number;
  y: number;
  gravidade: string;
  papel: 'centro' | 'principal' | 'vizinho';
  /** Texto do balão ao passar o mouse. */
  titulo: string;
  /** Com link: tocar abre a ficha (e funciona sem JavaScript). */
  href?: string;
}

export const RAIO = { centro: 13, principal: 8, vizinho: 5 } as const;

/** Espaço do nó com o rótulo embaixo (para nenhum rótulo cobrir outro). */
export function tamanhoDoNo(no: Pick<NoGrafo, 'id' | 'artigo' | 'tema' | 'papel'>): Tamanho {
  const r = RAIO[no.papel];
  const linhas = linhasDoTema(no.tema);
  if (no.papel === 'vizinho') {
    const l = Math.max(Math.max(no.id.length, no.artigo.length) * 6.1, Math.max(0, ...linhas.map((x) => x.length)) * 5.2);
    return { l: l + 8, a: r + 22 + linhas.length * 11 };
  }
  const larguraTema = Math.max(0, ...linhas.map((l) => l.length)) * 5.7;
  const larguraRef = Math.max(no.id.length, no.artigo.length) * 7.3;
  return { l: Math.max(larguraRef, larguraTema) + 10, a: r + 26 + linhas.length * 12 };
}
