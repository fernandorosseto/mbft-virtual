/**
 * Geometria didática do para-brisa, compartilhada pelo mapa 3D (three/mapaDanos.ts) e pelo
 * diagrama 2D (panel/WindshieldDamageDiagram.tsx), para os dois mostrarem a mesma coisa.
 *
 * Coordenadas normalizadas (u, v):
 *   u de 0 (borda do lado do passageiro) a 1 (borda do lado do motorista, à esquerda do veículo);
 *   v de 0 (borda inferior, junto ao capô) a 1 (borda superior).
 * Na vista de fora (como no carro 3D), o lado do motorista fica à direita de quem olha.
 *
 * Res. CONTRAN 960/2022, art. 16: nos automóveis (demais veículos automotores), a área crítica de
 * visão do condutor é a **metade esquerda da região de varredura das palhetas**. Não é o lado
 * esquerdo inteiro do vidro: os cantos que as palhetas não alcançam ficam nas demais áreas
 * (exceto a faixa periférica de 2,5 cm, art. 14).
 *
 * A região varrida real depende de cada modelo; aqui ela é ilustrativa, com medidas típicas de um
 * sedã. Ela ocupa toda a largura do vidro, então a "metade esquerda" é o lado u > 0,5.
 */

/** Medidas de referência, em metros. */
export const AUTOMOVEL = {
  /** Largura na base e no topo, e altura ao longo do vidro. */
  larguraBase: 1.42,
  larguraTopo: 1.2,
  altura: 0.92,
};

export const PESADO = {
  largura: 2.3,
  altura: 0.95,
  /** Área crítica (art. 15): retângulo de 40 cm de largura por 50 cm de altura. */
  areaCritica: { largura: 0.4, altura: 0.5 },
  /** Linha de centro do volante, a partir da borda do lado do motorista (ilustrativa). */
  eixoVolante: 0.55,
  /** Altura da tangente ao ponto mais alto do volante, projetada no vidro (ilustrativa). */
  baseAreaCritica: 0.1,
};

export interface Palheta {
  /** Eixo da palheta, em (u, v). */
  u: number;
  v: number;
  /** Alcance (fim da palheta), em metros a partir do eixo. */
  raio: number;
}

/**
 * Palhetas de um sedã: a do motorista maior (~60 cm) e a do passageiro menor (~48 cm), com eixos
 * logo abaixo da borda inferior. Em repouso, deitadas na base, apontando para o lado do passageiro.
 */
export const PALHETAS: Palheta[] = [
  { u: 0.3, v: -0.03, raio: 0.48 },
  { u: 0.72, v: -0.03, raio: 0.62 },
];

/** Onde ficam os exemplos de trinca e fratura no automóvel (demais áreas), iguais no 3D e no 2D. */
export const EXEMPLOS_DANOS: { trinca: [number, number]; fratura: [number, number] } = {
  trinca: [0.22, 0.38],
  fratura: [0.42, 0.8],
};

/** Trecho do braço sem palheta (não varre) e ângulos de varredura, em graus a partir da horizontal. */
export const VARREDURA = { raioInterno: 0.14, anguloInicial: 5, anguloFinal: 175 };

const L = AUTOMOVEL.larguraBase;
const H = AUTOMOVEL.altura;

/** O ponto está na região varrida por alguma palheta? */
export function dentroDaVarredura(u: number, v: number): boolean {
  return PALHETAS.some((p) => {
    const dx = (u - p.u) * L;
    const dy = (v - p.v) * H;
    const r = Math.hypot(dx, dy);
    if (r < VARREDURA.raioInterno || r > p.raio) return false;
    // Ângulo medido a partir do lado do passageiro
    const angulo = (Math.atan2(dy, -dx) * 180) / Math.PI;
    return angulo >= VARREDURA.anguloInicial && angulo <= VARREDURA.anguloFinal;
  });
}

/** Área crítica de visão nos automóveis: metade esquerda (lado do motorista) da região varrida. */
export function naAreaCriticaAutomovel(u: number, v: number): boolean {
  return u > 0.5 && dentroDaVarredura(u, v);
}

/** Contorno do setor varrido por uma palheta, como polígono em (u, v). */
export function contornoDoSetor(p: Palheta, passos = 56): [number, number][] {
  const { raioInterno, anguloInicial, anguloFinal } = VARREDURA;
  const ponto = (r: number, graus: number): [number, number] => {
    const a = (graus * Math.PI) / 180;
    return [p.u - (Math.cos(a) * r) / L, p.v + (Math.sin(a) * r) / H];
  };
  const pontos: [number, number][] = [];
  for (let i = 0; i <= passos; i++) pontos.push(ponto(p.raio, anguloInicial + ((anguloFinal - anguloInicial) * i) / passos));
  for (let i = passos; i >= 0; i--) pontos.push(ponto(raioInterno, anguloInicial + ((anguloFinal - anguloInicial) * i) / passos));
  return pontos;
}

/** Palheta em repouso, para desenho: deitada na base, sem passar da lateral do vidro. */
export function palhetaEmRepouso(p: Palheta): { eixo: [number, number]; ponta: [number, number] } {
  const a = (VARREDURA.anguloInicial * Math.PI) / 180;
  const maior = Math.max(...PALHETAS.map((q) => q.raio));
  const altura = p.raio === maior ? 0.06 : 0.028;
  return {
    // Para o desenho, eixo e ponta rente à borda inferior (o eixo real fica logo abaixo do vidro);
    // a palheta maior (motorista) repousa um pouco acima da outra, como no carro
    eixo: [p.u, altura],
    ponta: [Math.max(0.03, p.u - (Math.cos(a) * p.raio) / L), altura],
  };
}

/** Contorno do para-brisa do automóvel em (u, v): trapézio, mais estreito no alto. */
export function contornoAutomovel(): [number, number][] {
  const recuo = (AUTOMOVEL.larguraBase - AUTOMOVEL.larguraTopo) / 2 / AUTOMOVEL.larguraBase;
  return [
    [0, 0],
    [1, 0],
    [1 - recuo, 1],
    [recuo, 1],
  ];
}

/**
 * Área crítica dos pesados em (u, v): retângulo 40 × 50 cm na linha de centro do volante.
 * `vidro`: medidas reais do para-brisa em metros (padrão: as de PESADO; o caminhão 3D usa as dele).
 */
export function areaCriticaPesado(
  vidro: { largura: number; altura: number } = PESADO
): { u0: number; u1: number; v0: number; v1: number; eixo: number } {
  const { largura, altura } = vidro;
  const { areaCritica, eixoVolante, baseAreaCritica } = PESADO;
  const eixo = 1 - eixoVolante / largura;
  const meia = areaCritica.largura / 2 / largura;
  return {
    u0: eixo - meia,
    u1: eixo + meia,
    v0: baseAreaCritica / altura,
    v1: (baseAreaCritica + areaCritica.altura) / altura,
    eixo,
  };
}

// ---------------------------------------------------------------------------
// Símbolos de dano (mesmo desenho no 2D e no 3D)
// ---------------------------------------------------------------------------

/**
 * Traços em coordenadas locais (unidade ≈ 1 px no tamanho de referência), centrados na origem.
 * Desenhados em duas passadas: halo claro largo e traço escuro fino, legíveis sobre vidro claro
 * ou escuro.
 */
export const SIMBOLO_TRINCA = {
  largura: 64,
  /** Trinca principal em zigue-zague, com duas ramificações curtas. */
  traco:
    'M-32 9 L-20 5 L-13 -1 L-4 1 L5 -6 L14 -5 L22 -12 L32 -15 ' +
    'M-13 -1 L-10 -9 L-12 -14 M5 -6 L9 3 L7 9',
};

export const SIMBOLO_FRATURA = {
  largura: 40,
  raio: 8,
  /** Contorno irregular do cone de impacto ("olho de boi"). */
  anel: 'M0 -8 Q5 -8 7 -4 Q9 1 6 5 Q3 9 -2 8 Q-7 7 -8 2 Q-9 -4 -4 -7 Z',
  /** Fissuras que partem do impacto e passam do anel, com comprimentos e dobras desiguais. */
  radiais:
    'M1 -7 L2 -13 L1 -19 M6 -5 L11 -9 M7 3 L13 5 L19 4 M2 8 L4 13 M-5 6 L-10 11 L-12 16 M-8 0 L-15 -1 M-5 -6 L-9 -11',
};
