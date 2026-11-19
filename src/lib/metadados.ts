import type { Metadata } from 'next';
import { NOME_SITE } from './site';

interface Tela {
  titulo: string;
  descricao: string;
  /** Caminho da rota, ex.: '/' ou '/fichas/670-00'. */
  caminho: string;
}

/** Metadados completos de uma tela: título, descrição, endereço canônico, Open Graph e cartão do X. */
export function metadataDe({ titulo, descricao, caminho }: Tela): Metadata {
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: caminho },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      siteName: NOME_SITE,
      url: caminho,
      title: titulo,
      description: descricao,
    },
    twitter: { card: 'summary_large_image', title: titulo, description: descricao },
  };
}
