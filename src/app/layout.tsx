import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Barlow, Source_Serif_4, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { URL_SITE } from '@/lib/site';
import { metadataDe } from '@/lib/metadados';
import { INICIO } from '@/lib/navegacao';
import { Analytics } from '@vercel/analytics/next';
import { AppShell } from '@/components/app/AppShell';

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
  ...metadataDe(INICIO),
  keywords: [
    'CTB Virtual',
    'concurso PRF',
    'legislação de trânsito PRF',
    'resoluções do CONTRAN para concurso',
    'Código de Trânsito Brasileiro',
    'CONTRAN',
    'Resolução 989',
    'Resolução 960',
    'Película automotiva',
    'Insulfilm',
    'Transmitância luminosa',
    'CTB art 230',
    'Para-brisa',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f1f5f9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${barlowCondensed.variable} ${barlow.variable} ${sourceSerif.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        {/* O casco (menu, carro, painel) fica no layout para o carro 3D não ser recarregado entre rotas */}
        <AppShell />
        {children}
        {/* Vercel Web Analytics: visitas por página, sem cookies */}
        <Analytics />
      </body>
    </html>
  );
}
