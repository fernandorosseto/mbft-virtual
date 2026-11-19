import type { IndiceBusca } from '@/app/busca.json/route';
import { alternativasDe } from './sinonimos';
import { casa, normalizar, TERMO_EXATO } from './texto';

/** Palavras da consulta, normalizadas. */
export function termosDe(consulta: string): string[] {
  return normalizar(consulta).split(' ').filter(Boolean);
}

/** Palavras do título de uma ficha: código (com e sem hífen), tipificação resumida, amparo, gravidade. */
export function palavrasDoTitulo(codigo: string, resumo: string, amparo: string, gravidade: string): string[] {
  return normalizar(`${codigo} ${codigo.replace('-', '')} ${resumo} ${amparo} ${gravidade}`).split(' ');
}

/** Todas as palavras buscadas aparecem nessas palavras (cada uma pelo próprio termo ou por um sinônimo). */
export function casaTodos(termos: string[], palavras: string[]): boolean {
  return alternativasDe(termos).every((alternativas) =>
    alternativas.some((alt) => alt.every((t) => palavras.some((p) => casa(t, p)))),
  );
}

/** Termos de 1 ou 2 letras que não sejam número ou romano não buscam no texto (achariam quase tudo). */
const buscavel = (t: string) => t.length >= 3 || TERMO_EXATO.test(t);

/**
 * Fichas (índices em `indice.fichas`) com todas as palavras buscadas no texto completo; cada palavra
 * vale pelo próprio termo ou por um sinônimo (src/lib/sinonimos.ts).
 */
export function buscarNoTexto(indice: IndiceBusca, termos: string[]): number[] {
  if (!termos.length || !termos.every(buscavel)) return [];
  const comPalavra = (t: string) => {
    const deste = new Set<number>();
    indice.palavras.forEach((p, i) => {
      if (casa(t, p)) indice.ocorrencias[i].forEach((f) => deste.add(f));
    });
    return deste;
  };
  const intersecao = (a: Set<number>, b: Set<number>) => new Set(Array.from(a).filter((f) => b.has(f)));
  let fichas: Set<number> | undefined;
  for (const alternativas of alternativasDe(termos)) {
    // Fichas que têm o termo ou alguma alternativa (com todas as palavras dela)
    const deste = new Set<number>();
    for (const alt of alternativas) {
      if (!alt.every(buscavel)) continue;
      let comTodas: Set<number> | undefined;
      for (const t of alt) comTodas = comTodas ? intersecao(comTodas, comPalavra(t)) : comPalavra(t);
      comTodas?.forEach((f) => deste.add(f));
    }
    fichas = fichas ? intersecao(fichas, deste) : deste;
  }
  return Array.from(fichas ?? new Set<number>()).sort((a, b) => a - b);
}

/** Busca completa no índice: primeiro título/amparo, depois só no texto. */
export function buscarFichas(indice: IndiceBusca, consulta: string): { titulo: number[]; texto: number[] } {
  const termos = termosDe(consulta);
  if (!termos.length) return { titulo: [], texto: [] };
  const titulo: number[] = [];
  indice.fichas.forEach(([codigo, resumo, amparo, gravidade], i) => {
    if (casaTodos(termos, palavrasDoTitulo(codigo, resumo, amparo, gravidade))) titulo.push(i);
  });
  const noTitulo = new Set(titulo);
  return { titulo, texto: buscarNoTexto(indice, termos).filter((i) => !noTitulo.has(i)) };
}

/** Seções da parte geral cujo título casa com a consulta. */
export function buscarSecoes(indice: IndiceBusca, consulta: string): [string, string][] {
  const termos = termosDe(consulta);
  if (!termos.length) return [];
  return indice.secoes.filter(([, rotulo]) => casaTodos(termos, normalizar(rotulo).split(' ')));
}

let carregamento: Promise<IndiceBusca> | null = null;

/** Baixa o índice uma vez por visita (o navegador ainda guarda em cache entre páginas). */
export function carregarIndice(): Promise<IndiceBusca> {
  if (!carregamento) {
    carregamento = fetch('/busca.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .catch((erro) => {
        carregamento = null;
        throw erro;
      });
  }
  return carregamento;
}
