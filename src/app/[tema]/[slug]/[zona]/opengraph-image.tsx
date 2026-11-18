import { notFound } from 'next/navigation';
import { lerSegmentos, todosOsEstados } from '@/lib/navegacao';
import { TAMANHO_PREVIA, TIPO_PREVIA, imagemPrevia } from '@/lib/imagemPrevia';

// Imagem de prévia da ficha (/vidros/peliculas/para-brisa)
export const alt = 'CTB Virtual: o que a norma diz sobre esta parte do carro';
export const size = TAMANHO_PREVIA;
export const contentType = TIPO_PREVIA;
export const dynamicParams = false;

type Params = { tema: string; slug: string; zona: string };

export function generateStaticParams(): Params[] {
  return todosOsEstados().flatMap((e): Params[] =>
    e.tipo === 'ficha' ? [{ tema: e.tema, slug: e.assunto, zona: e.zona }] : []
  );
}

export default async function Image({ params }: { params: Params }) {
  const estado = lerSegmentos([params.tema, params.slug, params.zona]);
  if (!estado) notFound();
  return imagemPrevia(estado);
}
