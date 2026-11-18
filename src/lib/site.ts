/**
 * Endereço público do site, usado nos links canônicos, no Open Graph e no sitemap.
 * Defina NEXT_PUBLIC_SITE_URL no ambiente de produção.
 * Na Vercel, sem a variável, usa o domínio de produção do projeto.
 */
export const URL_SITE = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')
).replace(/\/$/, '');

export const NOME_SITE = 'MBFT Virtual';

/** PDF oficial do MBFT (anexo da Res. CONTRAN nº 985/2022). */
export const URL_MBFT_OFICIAL =
  'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/mbvt20222.pdf';
