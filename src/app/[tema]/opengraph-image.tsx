import { notFound } from 'next/navigation';
import { lerSegmentos, todosOsEstados } from '@/lib/navegacao';
import { TAMANHO_PREVIA, TIPO_PREVIA, imagemPrevia } from '@/lib/imagemPrevia';

// Imagem de prévia da página da resolução (/vidros)
export const alt = 'CTB Virtual: visão geral da resolução';
export const size = TAMANHO_PREVIA;
export const contentType = TIPO_PREVIA;
export const dynamicParams = false;

type Params = { tema: string };

export function generateStaticParams(): Params[] {
  return todosOsEstados().flatMap((e): Params[] => (e.tipo === 'tema' ? [{ tema: e.tema }] : []));
}

export default async function Image({ params }: { params: Params }) {
  const estado = lerSegmentos([params.tema]);
  if (!estado) notFound();
  return imagemPrevia(estado);
}
