import 'server-only';
import dados from '../../docs/normas/mbft/figuras.json';
import tabelas from '../../docs/normas/mbft/tabelas.json';

export interface Figura {
  /** Caminho público (public/figuras/...). */
  arquivo: string;
  pagina: number;
  largura: number;
  altura: number;
}

const FIGURAS = dados.figuras as Record<string, Figura[]>;

/** Desenhos da ficha recortados do PDF oficial (tools/normas/mbft/extrair_figuras.py). */
export function figurasDa(codigo: string): Figura[] {
  return FIGURAS[codigo] ?? [];
}

export interface Tabela {
  campo: string;
  /** Índice do item (na lista do campo, antes de tirar os vazios) cujo trecho vira tabela. */
  item: number;
  /** Começo e fim do trecho achatado no texto do item: `fim` inclusive ou `ate` exclusive. */
  inicio: string;
  fim?: string;
  ate?: string;
  /** Tabela longa demais para a ficha: slug da página própria (/tabela/<slug>). */
  link?: string;
  pagina: number;
  titulo?: string;
  cabecalho?: string[];
  linhas?: string[][];
  /** Recortes da página (tipo sem uso hoje). */
  imagens?: Figura[];
  /** Tabela situação × período transcrita (mostrada como consulta). */
  consulta?: Consulta;
}

export interface BlocoCelula {
  /** "INSCRIÇÃO ORIGINAL:", "INSCRIÇÃO COMPLEMENTAR:" ou null (itens soltos, como no PDF). */
  titulo: string | null;
  itens: string[];
}

export interface Consulta {
  cantoColunas: string;
  cantoLinhas: string;
  colunas: { resolucao: string; periodo: string }[];
  linhas: { situacao: string; celulas: BlocoCelula[][] }[];
}

const TABELAS = tabelas.fichas as Record<string, Tabela[]>;

/** Tabelas da ficha tiradas do PDF oficial (tools/normas/mbft/extrair_tabelas.py). */
export function tabelasDa(codigo: string): Tabela[] {
  return TABELAS[codigo] ?? [];
}

export interface PaginaTabela {
  slug: string;
  titulo: string;
  /** Fichas que trazem esta tabela. */
  fichas: string[];
  /** Recortes das páginas do PDF, na ordem. */
  imagens: Figura[];
}

const PAGINAS = (tabelas as unknown as { paginas: Record<string, Omit<PaginaTabela, 'slug'>> }).paginas;

/** Tabelas com página própria (/tabela/<slug>), com os recortes do PDF. */
export function paginasDeTabela(): PaginaTabela[] {
  return Object.entries(PAGINAS).map(([slug, d]) => ({ slug, ...d }));
}

export function paginaDeTabela(slug: string): PaginaTabela | undefined {
  return paginasDeTabela().find((p) => p.slug === slug);
}

/** Onde o trecho da tabela termina no texto do item (exclusive), a partir de `i`. */
export function fimDoTrecho(texto: string, t: Tabela, i: number): number {
  if (t.ate) return texto.indexOf(t.ate, i);
  const j = texto.indexOf(t.fim ?? '', i);
  return j < 0 ? -1 : j + (t.fim ?? '').length;
}
