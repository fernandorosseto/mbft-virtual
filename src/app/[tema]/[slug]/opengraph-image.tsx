import { notFound } from 'next/navigation';
import { lerSegmentos, todosOsEstados } from '@/lib/navegacao';
import { TAMANHO_PREVIA, TIPO_PREVIA, imagemPrevia } from '@/lib/imagemPrevia';

// Imagem de prévia do assunto (/vidros/peliculas) ou da peça (/vidros/para-brisa)
export const alt = 'CTB Virtual: o que a norma diz';
export const size = TAMANHO_PREVIA;
export const contentType = TIPO_PREVIA;
export const dynamicParams = false;

type Params = { tema: string; slug: string };

export function generateStaticParams(): Params[] {
  return todosOsEstados().flatMap((e): Params[] =>
    e.tipo === 'assunto' ? [{ tema: e.tema, slug: e.assunto }] : e.tipo === 'peca' ? [{ tema: e.tema, slug: e.zona }] : []
  );
}

export default async function Image({ params }: { params: Params }) {
  const estado = lerSegmentos([params.tema, params.slug]);
  if (!estado) notFound();
  return imagemPrevia(estado);
}
