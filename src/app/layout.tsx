import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Barlow, Source_Serif_4, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { URL_SITE } from '@/lib/site';
import { metadataDe } from '@/lib/metadados';
import { Analytics } from '@vercel/analytics/next';
import { Cabecalho, Rodape } from '@/components/Casco';
import { SCRIPT_PREFERENCIAS } from '@/components/Preferencias';

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-barlow',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
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
