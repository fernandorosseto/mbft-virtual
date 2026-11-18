import { citacoes, textoCompleto, todasAsFichas } from '@/lib/mbft';
import { SECOES } from '@/lib/parteGeral';
import { normalizar } from '@/lib/texto';

// Gerado no build: o navegador só baixa quando a pessoa começa a buscar
export const dynamic = 'force-static';

export interface IndiceBusca {
  /** Fichas na ordem do manual: código, tipificação resumida, amparo legal, gravidade, rótulo do artigo, tema. */
  fichas: [string, string, string, string, string, string][];
  /** Palavras (normalizadas) do texto completo das fichas, em ordem alfabética. */
  palavras: string[];
  /** Para cada palavra, as fichas (índices em `fichas`) que a contêm. */
  ocorrencias: number[][];
  /** Citações [a, b]: a ficha a cita a ficha b (índices em `fichas`). */
  citacoes: [number, number][];
  /** Seções da parte geral: âncora e título ("8.2. Remoção do Veículo"). */
  secoes: [string, string][];
}

export function GET() {
  const fichas = todasAsFichas();
  const indice = new Map(fichas.map((f, i) => [f.codigo, i]));
  const porPalavra = new Map<string, number[]>();
  fichas.forEach((f, i) => {
    const palavras = new Set(normalizar(textoCompleto(f)).split(' '));
    for (const p of palavras) {
      // Palavras curtas só valem se forem número (artigos, incisos em algarismos)
      if (p.length < 3 && !/^\d+$/.test(p)) continue;
      const lista = porPalavra.get(p) ?? [];
      lista.push(i);
      porPalavra.set(p, lista);
    }
  });
  const palavras = Array.from(porPalavra.keys()).sort();
  const corpo: IndiceBusca = {
    fichas: fichas.map((f) => [f.codigo, f.tipificacaoResumida, f.amparoLegal, f.gravidade, f.rotuloArtigo, f.tema]),
    palavras,
    ocorrencias: palavras.map((p) => porPalavra.get(p)!),
    citacoes: citacoes().map(([a, b]) => [indice.get(a)!, indice.get(b)!]),
    secoes: SECOES.map((s) => [s.id, s.numero ? `${s.numero}. ${s.titulo}` : s.titulo]),
  };
  return Response.json(corpo);
}
