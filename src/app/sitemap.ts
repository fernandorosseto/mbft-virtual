import type { MetadataRoute } from 'next';
import { paginasDeTabela } from '@/lib/figuras';
import { todasAsFichas } from '@/lib/mbft';
import { URL_SITE } from '@/lib/site';

// Telas com endereço próprio, para os buscadores
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${URL_SITE}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${URL_SITE}/parte-geral`, changeFrequency: 'monthly', priority: 0.9 },
    ...todasAsFichas().map((f) => ({
      url: `${URL_SITE}/fichas/${f.codigo}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...paginasDeTabela().map((p) => ({
      url: `${URL_SITE}/tabela/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
