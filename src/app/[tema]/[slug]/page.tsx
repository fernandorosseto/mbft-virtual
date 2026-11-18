import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { lerSegmentos, todosOsEstados } from '@/lib/navegacao';
import { metadataDe } from '@/lib/metadados';

// Estado 1 (/vidros/peliculas) ou estado 3 (/vidros/para-brisa). O conteúdo é desenhado pelo
// AppShell no layout; esta página só valida o endereço e define os metadados.
export const dynamicParams = false;

type Params = { tema: string; slug: string };

export function generateStaticParams(): Params[] {
  return todosOsEstados().flatMap((e): Params[] =>
    e.tipo === 'assunto'
      ? [{ tema: e.tema, slug: e.assunto }]
      : e.tipo === 'peca'
        ? [{ tema: e.tema, slug: e.zona }]
        : []
  );
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const estado = lerSegmentos([params.tema, params.slug]);
  return estado ? metadataDe(estado) : {};
}

export default function PaginaAssuntoOuPeca({ params }: { params: Params }) {
  if (!lerSegmentos([params.tema, params.slug])) notFound();
  return null;
}
