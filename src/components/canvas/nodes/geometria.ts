export const CW = 220, CH = 52;
const R = 280;   // alcance lateral dos filhos
const GAP = 30;  // meio corredor central → A e B sempre ≥ 60px separados
export const AMP_MAX = 12; // vai-e-vem máx; com GAP 30 ainda sobram ≥ 36px

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export type Ramo = {
  /** Canto superior esquerdo do botão, relativo ao ponto no vidro. */
  p: { x: number; y: number };
  /** Largura do botão (a linha chega no centro da base). */
  w: number;
  c: { sx: number; sy: number; c1x: number; c1y: number; c2dx: number; c2dy: number };
  m: { fx: number; fy: number; px: number; py: number; sx: number; sy: number };
};

/** Distância vertical entre botões empilhados: altura + folga que cobre o sorteio (12) e o vai-e-vem (2 × AMP_MAX). */
const PASSO_PILHA = CH + 12 + 2 * AMP_MAX + 8;

/**
 * `nivel` > 0 empilha o botão acima dos anteriores do mesmo lado (nó com 3+ itens), com a
 * variação aleatória limitada para os botões nunca se tocarem.
 */
function ramo(lado: -1 | 0 | 1, nivel = 0, empilhado = false, compacto = false): Ramo {
  const w = compacto ? CW_COMPACTO : CW;
  let p: { x: number; y: number };
  if (compacto) {
    // Celular: duas colunas coladas ao ponto, linhas de baixo para cima (cabe em ~360 px)
    const y = -84 - nivel * PASSO_PILHA - rnd(0, 6);
    p = lado === 0 ? { x: -w / 2, y: -120 } : { x: lado < 0 ? -w - GAP_COMPACTO : GAP_COMPACTO, y };
  } else {
    // Se lado === 0 (nó com 1 único botão filho), sorteia acima do vidro levemente deslocado
    const y = empilhado ? -130 - nivel * PASSO_PILHA - rnd(0, 12) : rnd(-240, -130);
    p =
      lado === 0
        ? { x: -CW / 2 + rnd(-55, 55), y: rnd(-220, -130) }
        : { x: lado < 0 ? rnd(-R, -GAP - CW) : rnd(GAP, R - CW), y };
  }

  const sx = lado * (compacto ? 6 : 20), sy = 0, dy = sy - (p.y + CH);
  const lim = (x: number) =>
    lado === 0 ? x : lado < 0 ? Math.min(x, -10) : Math.max(x, 10);

  return {
    p,
    w,
    // No compacto a linha sobe quase reta até o botão (sem laçadas laterais)
    c: compacto
      ? { sx, sy, c1x: sx + lado * 8, c1y: sy - dy * 0.45, c2dx: 0, c2dy: dy * 0.35 }
      : {
          sx,
          sy,
          c1x: lim(sx + rnd(-60, 60)),
          c1y: sy - dy * rnd(0.2, 0.5),
          c2dx: rnd(-70, 70),
          c2dy: dy * rnd(0.3, 0.6),
        },
    m: {
      fx: rnd(0.5, 1.1),
      fy: rnd(0.6, 1.3),
      px: rnd(0, 6.28),
      py: rnd(0, 6.28),
      sx: rnd(0.6, 1),
      sy: rnd(0.6, 1),
    },
  };
}

/** Largura dos botões no arranjo compacto (celular) e folga entre as duas colunas. */
export const CW_COMPACTO = 168;
const GAP_COMPACTO = 6;
/** Vai-e-vem horizontal no compacto: 2 × amplitude < 2 × GAP_COMPACTO, as colunas nunca se tocam. */
export const AMP_X_COMPACTO = 4;

/**
 * Um ramo por item: 1 item acima do vidro; 2+ alternando esquerda e direita, empilhados.
 * `compacto`: arranjo do celular, em duas colunas estreitas logo acima do ponto.
 */
export const sortear = (qtd = 2, compacto = false): Ramo[] => {
  if (qtd <= 1) return [ramo(0, 0, false, compacto)];
  const empilhado = qtd > 2;
  return Array.from({ length: qtd }, (_, i) => ramo(i % 2 === 0 ? -1 : 1, Math.floor(i / 2), empilhado, compacto));
};

/** Caixa que contém todos os botões, relativa ao ponto no vidro (com a margem do vai-e-vem). */
export function caixaDosRamos(geo: Ramo[]) {
  return {
    x0: Math.min(...geo.map((r) => r.p.x)) - AMP_MAX,
    x1: Math.max(...geo.map((r) => r.p.x + r.w)) + AMP_MAX,
    y0: Math.min(...geo.map((r) => r.p.y)) - AMP_MAX,
  };
}

export type Geo = ReturnType<typeof sortear>;

export function caminho(r: Ramo, ox: number, oy: number) {
  const { c } = r;
  const ex = r.p.x + r.w / 2 + ox, ey = r.p.y + CH + oy;
  return `M${c.sx} ${c.sy}C${c.c1x.toFixed(1)} ${c.c1y.toFixed(1)} ${(ex + c.c2dx).toFixed(1)} ${(ey + c.c2dy).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
}
