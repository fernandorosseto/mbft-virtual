import type { Enquadramento, NormaId } from '@/types/conteudo';
import { INFRACOES, NORMAS, type DispositivoId } from '@/data/conteudo';
import { obterDispositivo } from '@/data/normas/dispositivos';

export interface Fonte {
  rotulo: string;
  url: string;
}

/** Normas citadas por um conjunto de dispositivos e enquadramentos, para a lista de fontes. */
export function fontesDe(dispositivos: DispositivoId[], enquadramentos: Enquadramento[]): Fonte[] {
  const normas = new Set<NormaId>();
  const incluir = (id: DispositivoId) => {
    const d = obterDispositivo(id);
    normas.add(d.norma);
    // Redação dada por outra norma: ela também é fonte
    if (d.fonte === 'res989') normas.add('res989');
  };
  dispositivos.forEach(incluir);
  for (const e of enquadramentos) {
    const inf = INFRACOES[e.infracao];
    incluir(inf.dispositivo);
    inf.fundamentos.forEach(incluir);
    if (e.base) incluir(e.base);
  }
  return Array.from(normas).map((n) => ({ rotulo: NORMAS[n].titulo, url: NORMAS[n].url }));
}
