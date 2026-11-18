import 'server-only';
import dados from '../../docs/normas/ctb-artigos.json';

export interface BlocoCtb {
  tipo: 'caput' | 'inciso' | 'alinea' | 'paragrafo' | 'sancao';
  rotulo: string;
  texto: string;
}

export interface Referencia {
  artigo: string;
  inciso?: string;
  alinea?: string;
  /** '1', '2'... ou 'unico'. */
  paragrafos: string[];
}

export interface TrechoCtb {
  ref: Referencia;
  /** Como aparece no título: "Art. 230, XVI". */
  rotulo: string;
  /** Trecho: caput, dispositivo citado e sanção. `indice` é a posição no artigo (para marcar saltos). */
  trecho: { bloco: BlocoCtb; indice: number; citado: boolean }[];
  /** Artigo inteiro, com o dispositivo citado marcado. */
  completo: { bloco: BlocoCtb; citado: boolean }[];
}

const ARTIGOS = dados.artigos as Record<string, BlocoCtb[]>;

export const URL_CTB_PLANALTO = 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm';

/** Lê o amparo legal da ficha ("Art. 163 c/c 162, I.", "Art. 250, I, a.", "Art. 330, § 5º e § 6º."). */
export function referenciasDe(amparo: string): Referencia[] {
  const refs: Referencia[] = [];
  for (const parte of amparo.split(/c\/c|\be Art\./)) {
    if (/Lei/.test(parte)) continue; // outra lei (ex.: Lei 13.711/2018)
    const m = parte.match(/(\d+)(-[A-Z])?(.*)$/);
    if (!m) continue;
    const resto = m[3];
    const paragrafos = /par[áa]grafo único|§\s*único/i.test(resto)
      ? ['unico']
      : Array.from(resto.matchAll(/§\s*(\d+)/g), (x) => x[1]);
    const inc = resto.match(/^,\s*([IVXL]+)\b(?:,\s*([a-z])\b)?/);
    refs.push({ artigo: m[1] + (m[2] ?? ''), inciso: inc?.[1], alinea: inc?.[2], paragrafos });
  }
  return refs;
}

function numeroDoParagrafo(rotulo: string): string {
  if (/único/i.test(rotulo)) return 'unico';
  return rotulo.match(/\d+/)?.[0] ?? '';
}

function rotuloDe(ref: Referencia): string {
  const partes = [`Art. ${ref.artigo}`];
  if (ref.inciso) partes.push(ref.inciso);
  if (ref.alinea) partes.push(`"${ref.alinea}"`);
  if (ref.paragrafos.length) {
    partes.push(ref.paragrafos.map((p) => (p === 'unico' ? 'parágrafo único' : `§ ${p}º`)).join(' e '));
  }
  return partes.join(', ');
}

/** Trecho do CTB para cada artigo citado no amparo legal. */
export function trechosDoAmparo(amparo: string): TrechoCtb[] {
  const trechos: TrechoCtb[] = [];
  for (const ref of referenciasDe(amparo)) {
    const blocos = ARTIGOS[ref.artigo];
    if (!blocos) continue;
    const citados = new Set<number>();
    const mostrar = new Set<number>([0]);

    if (ref.inciso) {
      const i = blocos.findIndex((b) => b.tipo === 'inciso' && b.rotulo === `${ref.inciso} -`);
      if (i >= 0) {
        citados.add(i);
        mostrar.add(i);
        // Alíneas do inciso: só a citada, ou todas
        for (let j = i + 1; j < blocos.length && blocos[j].tipo === 'alinea'; j++) {
          if (!ref.alinea || blocos[j].rotulo === ref.alinea) {
            mostrar.add(j);
            if (ref.alinea) citados.add(j);
          }
        }
        // Sanção: o primeiro grupo "Infração / Penalidade / Medida" depois do inciso
        let s = blocos.findIndex((b, j) => j > i && b.tipo === 'sancao');
        while (s >= 0 && s < blocos.length && blocos[s].tipo === 'sancao') mostrar.add(s++);
      }
    }
    if (ref.paragrafos.length) {
      blocos.forEach((b, j) => {
        if (b.tipo === 'paragrafo' && ref.paragrafos.includes(numeroDoParagrafo(b.rotulo))) {
          citados.add(j);
          mostrar.add(j);
        }
      });
    }
    if (!ref.inciso && !ref.paragrafos.length) {
      // Artigo sem dispositivo: o caput é o citado; artigo curto vai inteiro, longo só com a primeira sanção
      if (blocos.length <= 8) blocos.forEach((_, j) => mostrar.add(j));
      else {
        let s = blocos.findIndex((b) => b.tipo === 'sancao');
        while (s >= 0 && s < blocos.length && blocos[s].tipo === 'sancao') mostrar.add(s++);
      }
      citados.add(0);
    }

    trechos.push({
      ref,
      rotulo: rotuloDe(ref),
      trecho: Array.from(mostrar)
        .sort((a, b) => a - b)
        .map((indice) => ({ bloco: blocos[indice], indice, citado: citados.has(indice) })),
      completo: blocos.map((bloco, j) => ({ bloco, citado: citados.has(j) })),
    });
  }
  return trechos;
}
