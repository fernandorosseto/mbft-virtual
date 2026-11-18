import type { MetadataRoute } from 'next';

// Site instalável na tela inicial do celular
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MBFT Virtual',
    short_name: 'MBFT',
    description: 'Consulta às fichas do Manual Brasileiro de Fiscalização de Trânsito, também sem internet.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f1f5f9',
    theme_color: '#f1f5f9',
    lang: 'pt-BR',
    categories: ['reference', 'productivity'],
    // Atalhos ao segurar o ícone instalado
    shortcuts: [
      { name: 'Fichas', url: '/', description: 'Catálogo e busca das fichas' },
      { name: 'Parte geral', url: '/parte-geral', description: 'Parte geral do manual' },
    ],
    icons: [
      { src: '/icones/icone-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icones/icone-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icones/icone-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
