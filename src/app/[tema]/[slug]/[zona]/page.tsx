import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { lerSegmentos, todosOsEstados } from '@/lib/navegacao';
import { metadataDe } from '@/lib/metadados';

// Estado 2 (/vidros/peliculas/para-brisa). O conteúdo é desenhado pelo AppShell no layout;
// esta página só valida o endereço e define os metadados.
export const dynamicParams = false;

type Params = { tema: string; slug: string; zona: string };

export function generateStaticParams(): Params[] {
  return todosOsEstados().flatMap((e): Params[] =>
    e.tipo === 'ficha' ? [{ tema: e.tema, slug: e.assunto, zona: e.zona }] : []
  );
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const estado = lerSegmentos([params.tema, params.slug, params.zona]);
  return estado ? metadataDe(estado) : {};
}

export default function PaginaFicha({ params }: { params: Params }) {
  if (!lerSegmentos([params.tema, params.slug, params.zona])) notFound();
  return null;
}
