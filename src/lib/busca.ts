import type { IndiceBusca } from '@/app/busca.json/route';
import { alternativasDe } from './sinonimos';
import { casa, normalizar, TERMO_EXATO } from './texto';

/** Formato do /busca.json: subir quando o índice ganhar ou mudar campos que a busca usa. */
export const VERSAO_INDICE = 2;

/** Palavras da consulta, normalizadas. */
export function termosDe(consulta: string): string[] {
  return normalizar(consulta).split(' ').filter(Boolean);
}

/**
 * Junta as palavras da consulta que formam uma palavra composta do manual ("para choque",
 * "para-choque" ou "parachoque" → ["para", "choque"]): o grupo é buscado como frase, com as
 * palavras juntas, e não cada uma em qualquer lugar da ficha ("para" está em quase todas).
 * `compostos`: as compostas do manual, normalizadas ("para choque", "por do sol").
 */
export function agruparTermos(termos: string[], compostos: readonly string[] = []): string[][] {
  const lista = new Set(compostos);
  const semEspaco = new Map(compostos.map((c) => [c.replace(/ /g, ''), c.split(' ')]));
  const grupos: string[][] = [];
  for (let i = 0; i < termos.length; ) {
    let k = 0;
    for (let n = Math.min(3, termos.length - i); n >= 2 && !k; n--) {
      if (lista.has(termos.slice(i, i + n).join(' '))) k = n;
    }
    if (k) {
      grupos.push(termos.slice(i, i + k));
      i += k;
    } else {
      grupos.push(semEspaco.get(termos[i]) ?? [termos[i]]);
      i++;
    }
  }
  return grupos;
}

/** Palavras do título de uma ficha: código (com e sem hífen), tipificação resumida, amparo, gravidade. */
export function palavrasDoTitulo(codigo: string, resumo: string, amparo: string, gravidade: string): string[] {
  return normalizar(`${codigo} ${codigo.replace('-', '')} ${resumo} ${amparo} ${gravidade}`).split(' ');
}

/** A frase aparece nas palavras, em sequência e na ordem (cada palavra pelo começo, como na busca). */
export function temFrase(frase: string[], palavras: string[]): boolean {
  for (let i = 0; i + frase.length <= palavras.length; i++) {
    if (frase.every((t, k) => casa(t, palavras[i + k]))) return true;
  }
  return false;
}

/**
 * Todas as palavras buscadas aparecem nessas palavras (cada uma pelo próprio termo ou por um
 * sinônimo). Sinônimo de mais de uma palavra ("descarga livre") vale só com as palavras juntas.
 */
export function casaTodos(termos: string[], palavras: string[], compostos?: readonly string[]): boolean {
  return alternativasDe(agruparTermos(termos, compostos)).every((alternativas) =>
    alternativas.some((alt) => (alt.length > 1 ? temFrase(alt, palavras) : palavras.some((p) => casa(alt[0], p)))),
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
  for (const alternativas of alternativasDe(agruparTermos(termos, indice.compostos))) {
    // Fichas que têm o termo ou alguma alternativa (com todas as palavras dela)
    const deste = new Set<number>();
    for (const alt of alternativas) {
      if (alt.length > 1) {
        // Frase (sinônimo ou palavra composta): fichas com as palavras juntas, calculadas no build
        indice.frases?.[alt.join(' ')]?.forEach((f) => deste.add(f));
        continue;
      }
      if (buscavel(alt[0])) comPalavra(alt[0]).forEach((f) => deste.add(f));
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
    if (casaTodos(termos, palavrasDoTitulo(codigo, resumo, amparo, gravidade), indice.compostos)) titulo.push(i);
  });
  const noTitulo = new Set(titulo);
  return { titulo, texto: buscarNoTexto(indice, termos).filter((i) => !noTitulo.has(i)) };
}

/** Seções da parte geral cujo título casa com a consulta. */
export function buscarSecoes(indice: IndiceBusca, consulta: string): [string, string][] {
  const termos = termosDe(consulta);
  if (!termos.length) return [];
  return indice.secoes.filter(([, rotulo]) => casaTodos(termos, normalizar(rotulo).split(' '), indice.compostos));
}

let carregamento: Promise<IndiceBusca> | null = null;

/**
 * Baixa o índice uma vez por visita. O uso sem internet entrega primeiro a cópia salva no aparelho;
 * se ela for de uma versão anterior do índice (sem os campos novos), pede a atual à rede
 * (`?versao=`, que o service worker busca na rede).
 */
export function carregarIndice(): Promise<IndiceBusca> {
  if (!carregamento) {
    const baixar = (url: string) =>
      fetch(url).then((r) => (r.ok ? (r.json() as Promise<IndiceBusca>) : Promise.reject(new Error(String(r.status)))));
    carregamento = baixar('/busca.json')
      .then((indice) => (indice.versao === VERSAO_INDICE ? indice : baixar(`/busca.json?versao=${VERSAO_INDICE}`)))
      .catch((erro) => {
        carregamento = null;
        throw erro;
      });
  }
  return carregamento;
}
