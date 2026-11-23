import 'server-only';
import dados from '../../docs/normas/res916-trechos.json';

/** Trechos da Res. CONTRAN nº 916/2022 copiados do DOU (conferidos por `npm run verificar:dados`). */
export const FONTE_RES916 = dados.fonte;

const TRECHOS = new Map(dados.trechos.map((t) => [t.ref, t.texto]));

export function trecho916(ref: string): string {
  const t = TRECHOS.get(ref);
  if (!t) throw new Error(`Res. 916: trecho não cadastrado: ${ref}`);
  return t;
}
