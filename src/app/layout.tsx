import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { URL_SITE } from '@/lib/site';
import { metadataDe } from '@/lib/metadados';
import { Analytics } from '@vercel/analytics/next';
import { Cabecalho, Rodape } from '@/components/Casco';
import { SCRIPT_PREFERENCIAS } from '@/components/Preferencias';

// Fontes guardadas no projeto (src/fontes, licença OFL): a montagem não depende do Google Fonts,
// que às vezes falha no download e derrubava o build
const barlowCondensed = localFont({
  src: [
    { path: '../fontes/barlow-condensed-latin-500-normal.woff2', weight: '500' },
    { path: '../fontes/barlow-condensed-latin-600-normal.woff2', weight: '600' },
    { path: '../fontes/barlow-condensed-latin-700-normal.woff2', weight: '700' },
  ],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

const barlow = localFont({
  src: [
    { path: '../fontes/barlow-latin-400-normal.woff2', weight: '400' },
    { path: '../fontes/barlow-latin-500-normal.woff2', weight: '500' },
    { path: '../fontes/barlow-latin-600-normal.woff2', weight: '600' },
  ],
  variable: '--font-barlow',
  display: 'swap',
});

const sourceSerif = localFont({
  src: [
    { path: '../fontes/source-serif-4-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fontes/source-serif-4-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: '../fontes/source-serif-4-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../fontes/source-serif-4-latin-600-italic.woff2', weight: '600', style: 'italic' },
  ],
  variable: '--font-source-serif',
  display: 'swap',
});

const ibmPlexMono = localFont({
  src: [
    { path: '../fontes/ibm-plex-mono-latin-500-normal.woff2', weight: '500' },
    { path: '../fontes/ibm-plex-mono-latin-600-normal.woff2', weight: '600' },
  ],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  // Base para os endereços absolutos (canônico, og:image) de todas as rotas
  metadataBase: new URL(URL_SITE),
  ...metadataDe({
    titulo: 'MBFT Virtual: Manual Brasileiro de Fiscalização de Trânsito para consulta',
    descricao:
      'Consulta rápida às fichas de fiscalização do MBFT (Res. CONTRAN nº 985/2022): enquadramento, quando autuar, quando não autuar e procedimentos, no celular e no computador.',
    caminho: '/',
  }),
  icons: { apple: '/icones/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: 'MBFT', statusBarStyle: 'default' },
  keywords: [
    'MBFT',
    'Manual Brasileiro de Fiscalização de Trânsito',
    'Resolução CONTRAN 985',
    'fichas de fiscalização',
    'enquadramento de infrações',
    'agente de trânsito',
    'Código de Trânsito Brasileiro',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f1f5f9' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${barlowCondensed.variable} ${barlow.variable} ${sourceSerif.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        {/* Preferências de leitura antes da primeira pintura (código/artigo e tamanho do texto) */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_PREFERENCIAS }} />
      </head>
      <body>
        <Cabecalho />
        {children}
        <Rodape />
        {/* Vercel Web Analytics: visitas por página, sem cookies */}
        <Analytics />
      </body>
    </html>
  );
}
