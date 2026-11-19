import 'server-only';
import dados from '../../docs/normas/mbft/figuras.json';

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
