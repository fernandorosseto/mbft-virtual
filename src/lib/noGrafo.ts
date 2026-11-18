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

/**
 * Sentido de uma citação entre fichas (ver ligacoesDaFicha em mbft.ts): `emVez` (quando não
 * autuar: use a outra ficha), `tambem` (pede outro auto), `referencia` (o resto).
 */
export type TipoLigacao = 'emVez' | 'tambem' | 'referencia';

/** Ordem dos tipos no índice de busca (número no terceiro campo de cada citação). */
export const TIPOS_LIGACAO: TipoLigacao[] = ['emVez', 'tambem', 'referencia'];

/** Quando um par tem mais de um tipo, vale o mais forte. */
export const PRIORIDADE_LIGACAO: Record<TipoLigacao, number> = { tambem: 3, emVez: 2, referencia: 1 };

export const NOME_LIGACAO: Record<TipoLigacao, string> = {
  emVez: 'Em vez desta',
  tambem: 'Autuar também',
  referencia: 'Referência',
};

/** Motivo de uma ligação: o item do PDF que faz a citação. */
export interface Motivo {
  de: string;
  para: string;
  item: string;
}

/** Ligação do grafo: um par de fichas, com o tipo em cada sentido (ida e volta numa linha só). */
export interface ArestaGrafo {
  a: string;
  b: string;
  /** a cita b. */
  ab?: TipoLigacao;
  /** b cita a. */
  ba?: TipoLigacao;
  /** Itens que fazem a citação (só nas ligações da ficha aberta, para a página continuar leve). */
  motivos?: Motivo[];
}

/** Junta citações dirigidas em ligações de par (a → b e b → a viram uma linha com duas setas). */
export function juntarArestas(
  dirigidas: { de: string; para: string; tipo: TipoLigacao }[],
  presentes: Set<string>,
  motivos?: Motivo[],
): ArestaGrafo[] {
  const pares = new Map<string, ArestaGrafo>();
  for (const { de, para, tipo } of dirigidas) {
    if (!presentes.has(de) || !presentes.has(para) || de === para) continue;
    const [a, b] = de < para ? [de, para] : [para, de];
    const chave = `${a}|${b}`;
    const aresta = pares.get(chave) ?? { a, b };
    if (de === a) aresta.ab = tipo;
    else aresta.ba = tipo;
    pares.set(chave, aresta);
  }
  if (motivos) {
    for (const m of motivos) {
      const [a, b] = m.de < m.para ? [m.de, m.para] : [m.para, m.de];
      const aresta = pares.get(`${a}|${b}`);
      if (aresta) (aresta.motivos ??= []).push(m);
    }
  }
  return Array.from(pares.values());
}

/** Tipo que dá a cor da linha: o mais forte dos dois sentidos. */
export function tipoPrincipal(aresta: ArestaGrafo): TipoLigacao {
  const tipos = [aresta.ab, aresta.ba].filter((t): t is TipoLigacao => !!t);
  return tipos.sort((x, y) => PRIORIDADE_LIGACAO[y] - PRIORIDADE_LIGACAO[x])[0] ?? 'referencia';
}
