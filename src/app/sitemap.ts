import type { MetadataRoute } from 'next';
import { todasAsFichas } from '@/lib/mbft';
import { URL_SITE } from '@/lib/site';

// Telas com endereço próprio, para os buscadores
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${URL_SITE}/`, changeFrequency: 'monthly', priority: 1 },
    ...todasAsFichas().map((f) => ({
      url: `${URL_SITE}/fichas/${f.codigo}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
