import type { IndiceBusca } from '@/app/busca.json/route';
import { casa, normalizar, TERMO_EXATO } from './texto';

/** Palavras da consulta, normalizadas. */
export function termosDe(consulta: string): string[] {
  return normalizar(consulta).split(' ').filter(Boolean);
}

/** Palavras do título de uma ficha: código (com e sem hífen), tipificação resumida, amparo, gravidade. */
export function palavrasDoTitulo(codigo: string, resumo: string, amparo: string, gravidade: string): string[] {
  return normalizar(`${codigo} ${codigo.replace('-', '')} ${resumo} ${amparo} ${gravidade}`).split(' ');
}

/** Todas as palavras buscadas aparecem nessas palavras. */
export function casaTodos(termos: string[], palavras: string[]): boolean {
  return termos.every((t) => palavras.some((p) => casa(t, p)));
}

/**
 * Fichas (índices em `indice.fichas`) com todas as palavras buscadas no texto completo.
 * Termos de 1 ou 2 letras que não sejam número ou romano não buscam no texto (achariam quase tudo).
 */
export function buscarNoTexto(indice: IndiceBusca, termos: string[]): number[] {
  if (!termos.length || !termos.every((t) => t.length >= 3 || TERMO_EXATO.test(t))) return [];
  let fichas: Set<number> | undefined;
  for (const t of termos) {
    const deste = new Set<number>();
    indice.palavras.forEach((p, i) => {
      if (casa(t, p)) indice.ocorrencias[i].forEach((f) => deste.add(f));
    });
    const anteriores: Set<number> | undefined = fichas;
    fichas = anteriores ? new Set(Array.from(anteriores).filter((f) => deste.has(f))) : deste;
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
