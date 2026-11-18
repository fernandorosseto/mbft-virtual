import { INICIO } from '@/lib/navegacao';
import { TAMANHO_PREVIA, TIPO_PREVIA, imagemPrevia } from '@/lib/imagemPrevia';

// Imagem de prévia da página inicial (Open Graph / X)
export const alt = 'CTB Virtual: resoluções do CONTRAN e CTB num carro 3D';
export const size = TAMANHO_PREVIA;
export const contentType = TIPO_PREVIA;

export default async function Image() {
  return imagemPrevia(INICIO);
}
