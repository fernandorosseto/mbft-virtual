import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { lerSegmentos, todosOsEstados } from '@/lib/navegacao';
import { metadataDe } from '@/lib/metadados';

// Página da resolução (/vidros). O conteúdo é desenhado pelo AppShell no layout; esta página só
// valida o endereço e define os metadados.
export const dynamicParams = false;

type Params = { tema: string };

export function generateStaticParams(): Params[] {
  return todosOsEstados().flatMap((e): Params[] => (e.tipo === 'tema' ? [{ tema: e.tema }] : []));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const estado = lerSegmentos([params.tema]);
  return estado ? metadataDe(estado) : {};
}

export default function PaginaResolucao({ params }: { params: Params }) {
  if (!lerSegmentos([params.tema])) notFound();
  return null;
}
