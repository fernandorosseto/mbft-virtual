import type { Metadata } from 'next';
import { NOME_SITE } from './site';
import { metadadosDe, urlDe, type Estado } from './navegacao';

/**
 * Metadados completos de uma tela: título, descrição, endereço canônico, Open Graph e cartão
 * do X/Twitter. A imagem de prévia vem do `opengraph-image.tsx` de cada rota (o Next a liga
 * sozinho ao og:image e ao twitter:image).
 */
export function metadataDe(estado: Estado): Metadata {
  const { titulo, descricao } = metadadosDe(estado);
  const url = urlDe(estado);
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      siteName: NOME_SITE,
      url,
      title: titulo,
      description: descricao,
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descricao,
    },
  };
}
