import type { Infracao } from '@/types/conteudo';

/**
 * Infrações do CTB usadas pelo site. Sanção, valor e pontos têm fundamento em dispositivos
 * conferidos com o texto compilado do Planalto (ver `fundamentos`).
 */
export const INFRACOES = {
  'ctb.230.XII': {
    dispositivo: 'ctb.art230.XII',
    natureza: 'Grave',
    pontos: 5,
    valor: 'R$ 195,23',
    penalidade: 'Multa',
    medida: 'Retenção do veículo para regularização',
    fundamentos: ['ctb.art230.sancao.VII-XIX', 'ctb.art258.II', 'ctb.art259.II'],
  },
  'ctb.230.XV': {
    dispositivo: 'ctb.art230.XV',
    natureza: 'Grave',
    pontos: 5,
    valor: 'R$ 195,23',
    penalidade: 'Multa',
    medida: 'Retenção do veículo para regularização',
    fundamentos: ['ctb.art230.sancao.VII-XIX', 'ctb.art258.II', 'ctb.art259.II'],
  },
  'ctb.230.XVI': {
    dispositivo: 'ctb.art230.XVI',
    natureza: 'Grave',
    pontos: 5,
    valor: 'R$ 195,23',
    penalidade: 'Multa',
    medida: 'Retenção do veículo para regularização',
    fundamentos: ['ctb.art230.sancao.VII-XIX', 'ctb.art258.II', 'ctb.art259.II'],
  },
  'ctb.230.XVII': {
    dispositivo: 'ctb.art230.XVII',
    natureza: 'Grave',
    pontos: 5,
    valor: 'R$ 195,23',
    penalidade: 'Multa',
    medida: 'Retenção do veículo para regularização',
    fundamentos: ['ctb.art230.sancao.VII-XIX', 'ctb.art258.II', 'ctb.art259.II'],
  },
  'ctb.230.XVIII': {
    dispositivo: 'ctb.art230.XVIII',
    natureza: 'Grave',
    pontos: 5,
    valor: 'R$ 195,23',
    penalidade: 'Multa',
    medida: 'Retenção do veículo para regularização',
    fundamentos: ['ctb.art230.sancao.VII-XIX', 'ctb.art258.II', 'ctb.art259.II'],
  },
  'ctb.237': {
    dispositivo: 'ctb.art237',
    natureza: 'Grave',
    pontos: 5,
    valor: 'R$ 195,23',
    penalidade: 'Multa',
    medida: 'Retenção do veículo para regularização',
    fundamentos: ['ctb.art237', 'ctb.art258.II', 'ctb.art259.II'],
  },
} satisfies Record<string, Infracao>;

export type InfracaoId = keyof typeof INFRACOES;
