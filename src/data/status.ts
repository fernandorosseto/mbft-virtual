import type { StatusRegra } from '@/types/conteudo';

/** Rótulo da legenda e cor usada para pintar a zona no carro e no botão. */
export const STATUS: Record<StatusRegra, { rotulo: string; cor: string }> = {
  limite: { rotulo: 'Tem limite', cor: '#eab308' },
  'livre-condicional': { rotulo: 'Liberado com condição', cor: '#0ea5e9' },
  livre: { rotulo: 'Sem limite', cor: '#16a34a' },
  proibido: { rotulo: 'Proibido', cor: '#dc2626' },
  exigencia: { rotulo: 'Exigência', cor: '#7c3aed' },
};
