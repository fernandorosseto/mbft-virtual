import 'server-only';
import dados from '../../docs/normas/mbft/mbft.json';

/** Ficha de fiscalização do MBFT, com os campos como estão no PDF (ver docs/normas/mbft/README.md). */
export interface Ficha {
  codigo: string;
  tipificacaoResumida: string;
  amparoLegal: string;
  tipificacao: string;
  gravidade: string;
  penalidade: string;
  medidaAdministrativa: string;
  infrator: string;
  competencia: string;
  pontuacao: string;
  constatacao: string;
  crime?: string;
  quandoAutuar: string[];
  quandoNaoAutuar: string[];
  definicoesEProcedimentos: string[];
  exemplosObservacoes: string[];
  informacoesComplementares: string[];
  /** Página do PDF onde a ficha começa. */
  pagina: number;
  /** Outras páginas do PDF com a mesma ficha repetida (ex.: 542-81). */
  paginasRepetidas: number[];
  /** Artigo do CTB que agrupa a ficha (ex.: '181', '165-A'). */
  artigo: string;
}

export interface GrupoArtigo {
  artigo: string;
  fichas: Ficha[];
}

/** Artigo principal do amparo legal: o primeiro número citado ("Art. 163 c/c 162, I." → 163). */
function artigoDe(amparo: string): string {
  const m = amparo.match(/(\d+)(-[A-Z])?/);
  return m ? m[1] + (m[2] ?? '') : '?';
}

function ordemArtigo(a: string): number {
  const m = a.match(/^(\d+)(?:-([A-Z]))?$/);
  if (!m) return Infinity;
  return Number(m[1]) * 100 + (m[2] ? m[2].charCodeAt(0) - 64 : 0);
}

const FICHAS: Ficha[] = (() => {
  const porCodigo = new Map<string, Ficha>();
  for (const bruta of dados.fichas as Omit<Ficha, 'artigo' | 'paginasRepetidas'>[]) {
    const existente = porCodigo.get(bruta.codigo);
    // O PDF repete a ficha 542-81 (págs. 190 e 192) com o mesmo conteúdo: fica uma só
    if (existente) {
      existente.paginasRepetidas.push(bruta.pagina);
      continue;
    }
    porCodigo.set(bruta.codigo, { ...bruta, artigo: artigoDe(bruta.amparoLegal), paginasRepetidas: [] });
  }
  return Array.from(porCodigo.values()).sort((a, b) => a.pagina - b.pagina);
})();

const POR_CODIGO = new Map(FICHAS.map((f) => [f.codigo, f]));

export function todasAsFichas(): Ficha[] {
  return FICHAS;
}

export function obterFicha(codigo: string): Ficha | undefined {
  return POR_CODIGO.get(codigo);
}

export function existeFicha(codigo: string): boolean {
  return POR_CODIGO.has(codigo);
}

/** Fichas agrupadas pelo artigo do CTB, em ordem de artigo; dentro do grupo, na ordem do PDF. */
export function fichasPorArtigo(): GrupoArtigo[] {
  const grupos = new Map<string, Ficha[]>();
  for (const f of FICHAS) {
    const lista = grupos.get(f.artigo) ?? [];
    lista.push(f);
    grupos.set(f.artigo, lista);
  }
  return Array.from(grupos, ([artigo, fichas]) => ({ artigo, fichas })).sort(
    (a, b) => ordemArtigo(a.artigo) - ordemArtigo(b.artigo),
  );
}

/** Ficha anterior e seguinte na ordem do manual. */
export function vizinhas(codigo: string): { anterior?: Ficha; seguinte?: Ficha } {
  const i = FICHAS.findIndex((f) => f.codigo === codigo);
  return { anterior: FICHAS[i - 1], seguinte: FICHAS[i + 1] };
}

/** Texto completo da ficha, para o índice de busca e as citações. */
export function textoCompleto(f: Ficha): string {
  return [
    f.codigo,
    f.tipificacaoResumida,
    f.tipificacao,
    f.amparoLegal,
    f.medidaAdministrativa,
    f.crime ?? '',
    ...f.quandoAutuar,
    ...f.quandoNaoAutuar,
    ...f.definicoesEProcedimentos,
    ...f.exemplosObservacoes,
    ...f.informacoesComplementares,
  ].join(' ');
}

/** Citações entre fichas: [a, b] quando o texto de a cita o código de b (ex.: "utilizar 565-70"). */
const ARESTAS: [string, string][] = (() => {
  const lista: [string, string][] = [];
  for (const f of FICHAS) {
    const citados = new Set(textoCompleto(f).match(/\b\d{3}-\d{2}\b/g) ?? []);
    for (const c of Array.from(citados).sort()) {
      if (c !== f.codigo && POR_CODIGO.has(c)) lista.push([f.codigo, c]);
    }
  }
  return lista;
})();

export function citacoes(): [string, string][] {
  return ARESTAS;
}

/** Fichas que esta cita e fichas que a citam, na ordem do manual. */
export function conexoes(codigo: string): { cita: Ficha[]; citadaPor: Ficha[] } {
  const cita = new Set(ARESTAS.filter(([a]) => a === codigo).map(([, b]) => b));
  const citadaPor = new Set(ARESTAS.filter(([, b]) => b === codigo).map(([a]) => a));
  return {
    cita: FICHAS.filter((f) => cita.has(f.codigo)),
    citadaPor: FICHAS.filter((f) => citadaPor.has(f.codigo)),
  };
}
