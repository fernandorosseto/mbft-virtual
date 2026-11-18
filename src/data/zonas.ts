import type { EnquadramentoCamera, Zona, ZonaId } from '@/types/conteudo';

// Enquadramentos de câmera. A frente do carro aponta para +X, Y para cima, chão em y = 0.
// No celular, o CarStage recua a câmera mantendo o mesmo alvo.
const CAMERA_PARA_BRISA: EnquadramentoCamera = {
  posicao: { x: 6.3, y: 3.4, z: 4.0 },
  alvo: { x: 0.3, y: 1.0, z: 0 },
};

const CAMERA_PARA_BRISA_PROXIMA: EnquadramentoCamera = {
  posicao: { x: 4.2, y: 2.3, z: 1.6 },
  alvo: { x: 0.45, y: 1.08, z: 0 },
};

export const ZONAS: Record<ZonaId, Zona> = {
  'para-brisa': {
    id: 'para-brisa',
    titulo: 'Para-brisa',
    tituloCurto: 'Para-brisa',
    descricao: 'Vidro indispensável à dirigibilidade',
    malha: 'parabrisa',
    camera: CAMERA_PARA_BRISA,
  },
  'laterais-dianteiros': {
    id: 'laterais-dianteiros',
    titulo: 'Vidros laterais dianteiros',
    tituloCurto: 'Dianteiros',
    descricao: 'Vidros indispensáveis à dirigibilidade',
    malha: 'vidros-dianteiros',
    camera: {
      posicao: { x: 5.4, y: 2.8, z: 4.8 },
      alvo: { x: 0.2, y: 0.9, z: 0.4 },
    },
  },
  'laterais-traseiros': {
    id: 'laterais-traseiros',
    titulo: 'Vidros laterais traseiros',
    tituloCurto: 'Traseiros',
    descricao: 'Vidros que não interferem na dirigibilidade',
    malha: 'vidros-traseiros',
    camera: {
      posicao: { x: -5.8, y: 3.2, z: 4.6 },
      alvo: { x: -0.6, y: 0.9, z: 0.2 },
    },
  },
  vigia: {
    id: 'vigia',
    titulo: 'Vigia (vidro traseiro)',
    tituloCurto: 'Vigia',
    descricao: 'Vidro traseiro, que não interfere na dirigibilidade',
    malha: 'vigia',
    camera: {
      posicao: { x: -6.4, y: 3.0, z: 2.2 },
      alvo: { x: -1.0, y: 1.0, z: 0 },
    },
  },
  teto: {
    id: 'teto',
    titulo: 'Vidros do teto (teto solar)',
    tituloCurto: 'Teto',
    descricao: 'Fora dos limites de transmitância',
    malha: 'teto',
    camera: {
      posicao: { x: 3.0, y: 6.5, z: 3.5 },
      alvo: { x: 0, y: 1.2, z: 0 },
    },
  },
  'para-brisa-area-critica': {
    id: 'para-brisa-area-critica',
    titulo: 'Área crítica de visão do condutor',
    tituloCurto: 'Área crítica',
    descricao: 'Nos carros, metade esquerda da área varrida pelo limpador',
    malha: 'parabrisa',
    subzonaDe: 'para-brisa',
    camera: CAMERA_PARA_BRISA_PROXIMA,
  },
  'para-brisa-faixa-periferica': {
    id: 'para-brisa-faixa-periferica',
    titulo: 'Faixa periférica de 2,5 cm',
    tituloCurto: 'Borda 2,5 cm',
    descricao: 'Faixa junto às bordas externas do para-brisa',
    malha: 'parabrisa',
    subzonaDe: 'para-brisa',
    camera: CAMERA_PARA_BRISA_PROXIMA,
  },
  'para-brisa-demais-areas': {
    id: 'para-brisa-demais-areas',
    titulo: 'Demais áreas do para-brisa',
    tituloCurto: 'Demais áreas',
    descricao: 'Fora da área crítica e da faixa periférica',
    malha: 'parabrisa',
    subzonaDe: 'para-brisa',
    camera: CAMERA_PARA_BRISA_PROXIMA,
  },
};
