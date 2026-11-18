/**
 * Endereço público do site, usado nos links canônicos, no Open Graph e no sitemap.
 * Defina NEXT_PUBLIC_SITE_URL no ambiente de produção (ex.: https://ctbvirtual.com.br).
 * Na Vercel, sem a variável, usa o domínio de produção do projeto.
 */
export const URL_SITE = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')
).replace(/\/$/, '');

export const NOME_SITE = 'CTB Virtual';
