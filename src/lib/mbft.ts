import 'server-only';
import dados from '../../docs/normas/mbft/mbft.json';
import temas from '../../docs/normas/mbft/temas.json';
import { rotuloArtigo } from './rotulos';
import { PRIORIDADE_LIGACAO, type TipoLigacao } from './noGrafo';

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
  /** Rótulo pelo artigo, para o modo "guiar por artigo" (ex.: 'Art. 230, XVI'). */
  rotuloArtigo: string;
  /** Uma ou duas palavras da tipificação que resumem o tema (docs/normas/mbft/temas.json). */
  tema: string;
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
  for (const bruta of dados.fichas as Omit<Ficha, 'artigo' | 'paginasRepetidas' | 'rotuloArtigo' | 'tema'>[]) {
    const existente = porCodigo.get(bruta.codigo);
    // O PDF repete a ficha 542-81 (págs. 190 e 192) com o mesmo conteúdo: fica uma só
    if (existente) {
      existente.paginasRepetidas.push(bruta.pagina);
      continue;
    }
    porCodigo.set(bruta.codigo, {
      ...bruta,
      artigo: artigoDe(bruta.amparoLegal),
      rotuloArtigo: rotuloArtigo(bruta.amparoLegal),
      tema: (temas.temas as Record<string, string>)[bruta.codigo] ?? '',
      paginasRepetidas: [],
    });
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

/** Categorias para os filtros do catálogo. O PDF escreve o mesmo valor de vários jeitos. */
export interface Categorias {
  gravidade: string;
  infrator: string;
  /** Órgãos citados na competência: Municipal, Estadual, Rodoviário. */
  competencia: string[];
  constatacao: string;
}

export function categoriasDe(f: Ficha): Categorias {
  const inf = f.infrator.toLowerCase();
  const infrator = inf.includes('pessoa')
    ? 'Pessoa física ou jurídica'
    : inf.includes('embarcador') || inf.includes('transportador')
      ? 'Embarcador ou transportador'
      : inf.includes('propriet')
        ? 'Proprietário'
        : 'Condutor';
  const comp = f.competencia.toLowerCase();
  const competencia = (['Municipal', 'Estadual', 'Rodoviário'] as const).filter((o) =>
    comp.includes(o.toLowerCase()),
  );
  const cons = f.constatacao.toLowerCase();
  const constatacao = cons.includes('sem abordagem')
    ? 'Sem abordagem'
    : cons.includes('mediante')
      ? 'Mediante abordagem'
      : 'Vide procedimentos';
  return { gravidade: f.gravidade, infrator, competencia, constatacao };
}

/**
 * Sentido de uma citação entre fichas, pelo lugar e pelo texto do item:
 * - `emVez`: item do "Quando não autuar" (ex.: "utilizar enquadramento específico: 565-70"):
 *   nesta situação, não se autua nesta ficha, e sim na citada;
 * - `tambem`: item que pede outro auto além deste ("autua-se também", "concomitantemente", "deve ser
 *   precedida pela lavratura do auto no enquadramento...");
 * - `referencia`: demais citações (definições, informações complementares, quando autuar).
 */
export type { TipoLigacao } from './noGrafo';

export interface ItemLigado {
  tipo: TipoLigacao;
  campo: 'quandoAutuar' | 'quandoNaoAutuar' | 'definicoesEProcedimentos' | 'informacoesComplementares';
  /** Texto do item, como está no PDF. */
  item: string;
  /** Fichas citadas no item, na ordem do texto. */
  destinos: Ficha[];
}

const CAMPOS_LIGADOS = ['quandoNaoAutuar', 'quandoAutuar', 'definicoesEProcedimentos', 'informacoesComplementares'] as const;
// "autua-se também", "autuar também", "lavrar outro auto de infração", "lavrar também outro AIT", "utilizar, concomitantemente, enquadramento específico",
// "a autuação neste enquadramento deve ser precedida pela lavratura do auto no enquadramento 502-91"
const PEDE_OUTRO_AUTO =
  /autua-se tamb[ée]m|autuar tamb[ée]m|tamb[ée]m autuar|lavra(?:r|-se) tamb[ée]m|lavrar outro auto|tamb[ée]m (?:outro )?AIT|cumulativamente|concomitantemente|precedid[ao] (?:d[ae]|pel[ao]) lavratura/i;

const ITENS_LIGADOS: Map<string, ItemLigado[]> = (() => {
  const mapa = new Map<string, ItemLigado[]>();
  for (const f of FICHAS) {
    const itens: ItemLigado[] = [];
    for (const campo of CAMPOS_LIGADOS) {
      for (const item of f[campo]) {
        const codigos = Array.from(new Set(item.match(/\b\d{3}-\d{2}\b/g) ?? [])).filter(
          (c) => c !== f.codigo && POR_CODIGO.has(c),
        );
        if (!codigos.length) continue;
        const tipo: TipoLigacao = PEDE_OUTRO_AUTO.test(item) ? 'tambem' : campo === 'quandoNaoAutuar' ? 'emVez' : 'referencia';
        itens.push({ tipo, campo, item, destinos: codigos.map((c) => POR_CODIGO.get(c)!) });
      }
    }
    mapa.set(f.codigo, itens);
  }
  return mapa;
})();

/**
 * Ligações da ficha com o sentido e a situação: os itens desta ficha que citam outras (`saidas`)
 * e, para cada ficha que cita esta, os itens dela que a citam (`recebidas`).
 */
export function ligacoesDaFicha(codigo: string): {
  saidas: ItemLigado[];
  recebidas: { origem: Ficha; itens: ItemLigado[] }[];
} {
  const saidas = ITENS_LIGADOS.get(codigo) ?? [];
  const recebidas: { origem: Ficha; itens: ItemLigado[] }[] = [];
  for (const f of FICHAS) {
    if (f.codigo === codigo) continue;
    const itens = (ITENS_LIGADOS.get(f.codigo) ?? []).filter((i) => i.destinos.some((d) => d.codigo === codigo));
    if (itens.length) recebidas.push({ origem: f, itens });
  }
  return { saidas, recebidas };
}

/**
 * Citações com o sentido: para cada par (a cita b), o tipo mais forte entre os itens de a que
 * citam b ("autuar também" > "em vez desta" > "referência"). Citações fora dos itens ligados
 * (ex.: tipificação, medida) contam como referência.
 */
export function citacoesTipadas(): { de: string; para: string; tipo: TipoLigacao }[] {
  return ARESTAS.map(([de, para]) => {
    const tipos = (ITENS_LIGADOS.get(de) ?? [])
      .filter((i) => i.destinos.some((d) => d.codigo === para))
      .map((i) => i.tipo);
    const tipo = tipos.sort((x, y) => PRIORIDADE_LIGACAO[y] - PRIORIDADE_LIGACAO[x])[0] ?? 'referencia';
    return { de, para, tipo };
  });
}

/** Data em que o PDF oficial usado no site foi obtido (dd/mm/aaaa). */
export function versaoDoManual(): string {
  const [a, m, d] = String((dados as { extraidoEm?: string }).extraidoEm ?? '').split('-');
  return a && m && d ? `${d}/${m}/${a}` : 'data não informada';
}
