import type { MetadataRoute } from 'next';
import { todosOsEstados, urlDe } from '@/lib/navegacao';
import { URL_SITE } from '@/lib/site';

// Todas as telas com endereço próprio, para os buscadores
export default function sitemap(): MetadataRoute.Sitemap {
  return todosOsEstados().map((e) => ({
    url: `${URL_SITE}${urlDe(e)}`,
    changeFrequency: 'monthly',
    priority: e.tipo === 'inicio' ? 1 : e.tipo === 'tema' || e.tipo === 'assunto' ? 0.9 : e.tipo === 'ficha' ? 0.8 : 0.6,
  }));
}
