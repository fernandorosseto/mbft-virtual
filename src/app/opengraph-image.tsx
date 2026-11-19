import { imagemPrevia, TAMANHO_PREVIA } from '@/lib/imagemPrevia';

export const size = TAMANHO_PREVIA;
export const contentType = 'image/png';
export const alt = 'MBFT Virtual: consulta às fichas do Manual Brasileiro de Fiscalização de Trânsito';

export default function Imagem() {
  return imagemPrevia({ titulo: 'Fichas de fiscalização do MBFT, no celular e no computador' });
}
