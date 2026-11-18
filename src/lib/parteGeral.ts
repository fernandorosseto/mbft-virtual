import 'server-only';
import dados from '../../docs/normas/mbft/parte-geral.json';

export interface Bloco {
  tipo: 'p' | 'item' | 'sigla';
  /** Marcador do item ("a)", "I -", "●") ou a sigla. */
  marcador?: string;
  texto: string;
  pagina: number;
}

export interface Secao {
  /** Âncora: número com hífen ("8-2") ou título sem acento ("infracoes-concorrentes"). */
  id: string;
  numero: string | null;
  titulo: string;
  nivel: 1 | 2;
  pagina: number;
  blocos: Bloco[];
}

/** Parte Geral do MBFT, gerada por tools/normas/mbft/extrair_parte_geral.py. */
export const SECOES = dados.secoes as Secao[];

const MEDIDAS: { rotulo: string; secao: string; teste: RegExp }[] = [
  { rotulo: 'Retenção', secao: '8-1', teste: /retenção/i },
  { rotulo: 'Remoção', secao: '8-2', teste: /remoção/i },
  { rotulo: 'Recolhimento da habilitação', secao: '8-3', teste: /recolhimento d[oa] (documento de habilitação|carteira)/i },
  { rotulo: 'Recolhimento do CLA/CRLV-e', secao: '8-4', teste: /licenciamento anual|crlv/i },
  { rotulo: 'Transbordo', secao: '8-5', teste: /transbordo/i },
  { rotulo: 'Medidas inominadas', secao: '8-7', teste: /placas/i },
];

/** Seções da parte geral que tratam das medidas administrativas citadas na ficha. */
export function secoesDaMedida(medida: string): { rotulo: string; secao: string }[] {
  return MEDIDAS.filter((m) => m.teste.test(medida)).map(({ rotulo, secao }) => ({ rotulo, secao }));
}
