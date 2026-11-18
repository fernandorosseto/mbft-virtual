import 'server-only';
import indice from '../../docs/normas/contran-indice.json';
import { textoCompleto, type Ficha } from './mbft';

export interface ResolucaoCitada {
  /** Órgão escrito na ficha (Contran, DNIT, ANTT...), ou null se a ficha não diz. */
  orgao: string | null;
  numero: number;
  ano: number;
  /** Publicação no DOU, quando a resolução está no índice (Contran, nº 700 em diante). */
  url?: string;
  data?: string;
}

// "Resolução (do) Contran nº 882/2021", "Res. nº 798/20", "Resolução do Contran nº 764, de 20 de dezembro de 2018"
const PADRAO =
  /\b(?:Resolu[çc][ãa]o|Res\.)\s+(?:do\s+)?(Contran|CONTRAN|DNIT|ANTT|Conama|CONAMA|Denatran|DENATRAN)?\s*n?\s*[sº°o]*\s*º?\s*(\d{1,4}(?:\.\d{3})?)(?:\s*\/\s*(\d{2,4})\b|,\s*de\s+(?:\d{1,2}º?\s+de\s+[a-zç]+\s+de\s+)?(\d{4})\b)/gi;

type Entrada = { titulo: string; data: string; url: string } | null;

/** Resoluções citadas no texto da ficha, sem repetir, na ordem do número. */
export function resolucoesDa(f: Ficha): ResolucaoCitada[] {
  const vistas = new Map<string, ResolucaoCitada>();
  for (const m of textoCompleto(f).matchAll(PADRAO)) {
    const orgao = m[1] ? (m[1].toUpperCase() === 'CONTRAN' ? 'Contran' : m[1].toUpperCase()) : null;
    if (orgao && !['Contran', 'DNIT', 'ANTT', 'CONAMA', 'DENATRAN'].includes(orgao)) continue;
    const numero = Number(m[2].replace('.', ''));
    let ano = Number(m[3] ?? m[4]);
    if (ano < 100) ano += ano > 50 ? 1900 : 2000;
    const chave = `${orgao ?? 'Contran'}-${numero}-${ano}`;
    const existente = vistas.get(chave);
    if (existente) {
      if (!existente.orgao && orgao) existente.orgao = orgao;
      continue;
    }
    const r: ResolucaoCitada = { orgao, numero, ano };
    // Link do DOU só quando o índice tem a resolução com o mesmo número e ano
    if (!orgao || orgao === 'Contran') {
      const e = (indice as Record<string, Entrada>)[String(numero)];
      if (e && e.titulo.includes(String(ano))) {
        r.url = e.url;
        r.data = e.data;
      }
    }
    vistas.set(chave, r);
  }
  return Array.from(vistas.values()).sort((a, b) => a.ano - b.ano || a.numero - b.numero);
}
