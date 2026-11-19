import { obterFicha, todasAsFichas } from '@/lib/mbft';
import { imagemPrevia, TAMANHO_PREVIA } from '@/lib/imagemPrevia';

// Uma prévia por ficha, gerada no build
export const size = TAMANHO_PREVIA;
export const contentType = 'image/png';
export const alt = 'Ficha do MBFT: código, artigo do CTB, gravidade e tipificação';
export const dynamicParams = false;

export function generateStaticParams() {
  return todasAsFichas().map((f) => ({ codigo: f.codigo }));
}

export default async function Imagem({ params }: { params: Promise<{ codigo: string }> }) {
  const f = obterFicha((await params).codigo)!;
  return imagemPrevia({ codigo: f.codigo, artigo: f.rotuloArtigo, gravidade: f.gravidade, titulo: f.tipificacaoResumida });
}
