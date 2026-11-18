import type { MetadataRoute } from 'next';

// Site instalável na tela inicial do celular
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MBFT Virtual',
    short_name: 'MBFT',
    description: 'Consulta às fichas do Manual Brasileiro de Fiscalização de Trânsito, também sem internet.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f1f5f9',
    theme_color: '#f1f5f9',
    lang: 'pt-BR',
    icons: [
      { src: '/icones/icone-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icones/icone-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icones/icone-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
