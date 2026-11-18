/**
 * Desenho de uma placa no padrão Mercosul (PIV, Res. CONTRAN 969/2022), para o 3D.
 * Ilustrativo: proporções de 400 × 130 mm, faixa azul com "BRASIL" e bandeira, "BR" à esquerda
 * e os 7 caracteres (3 letras, 1 número, 1 letra, 2 números). Não reproduz a fonte, o QR code
 * nem os elementos de segurança oficiais.
 * Só roda no navegador (canvas).
 */

/** Medidas reais, em metros. */
export const PLACA = { largura: 0.4, altura: 0.13 };

export type CorCaracteres = 'particular' | 'comercial';

const CORES: Record<CorCaracteres, string> = {
  particular: '#111111',
  comercial: '#c1121f',
};

/** Fonte condensada do site (Barlow Condensed), com alternativas. */
function fonteCondensada(): string {
  if (typeof document === 'undefined') return '"Arial Narrow", sans-serif';
  const v = getComputedStyle(document.documentElement).getPropertyValue('--f-display').trim();
  return v || '"Barlow Condensed", "Arial Narrow", sans-serif';
}

/**
 * Pinta a placa num canvas (px por milímetro = `escala`) e devolve o canvas.
 * `texto`: 7 caracteres, ex.: "CTB1V26".
 */
export function desenharPlacaMercosul(texto: string, cor: CorCaracteres = 'particular', escala = 2.5): HTMLCanvasElement {
  const L = 400 * escala;
  const A = 130 * escala;
  const mm = (n: number) => n * escala;
  const canvas = document.createElement('canvas');
  canvas.width = L;
  canvas.height = A;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const fonte = fonteCondensada();

  // Fundo branco com cantos arredondados e moldura preta
  const r = mm(8);
  const contorno = new Path2D();
  contorno.roundRect(mm(1.5), mm(1.5), L - mm(3), A - mm(3), r);
  ctx.fillStyle = '#ffffff';
  ctx.fill(contorno);
  ctx.save();
  ctx.clip(contorno);

  // Faixa azul no alto
  const faixa = mm(30);
  ctx.fillStyle = '#003399';
  ctx.fillRect(0, 0, L, faixa);

  // "BRASIL" no centro da faixa
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${mm(20)}px ${fonte}`;
  ctx.fillText('BRASIL', L / 2, faixa / 2 + mm(1));

  // Emblema à esquerda (simplificado: círculo com estrelas) e bandeira à direita
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = mm(1.2);
  ctx.beginPath();
  ctx.arc(mm(22), faixa / 2, mm(9), 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 4; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 2.6;
    ctx.beginPath();
    ctx.arc(mm(22) + Math.cos(a) * mm(4.5), faixa / 2 + Math.sin(a) * mm(4.5), mm(1.3), 0, Math.PI * 2);
    ctx.fill();
  }
  const bx = L - mm(42);
  const by = mm(7);
  const bw = mm(26);
  const bh = mm(17);
  ctx.fillStyle = '#009c3b';
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = '#ffdf00';
  ctx.beginPath();
  ctx.moveTo(bx + bw / 2, by + mm(1.6));
  ctx.lineTo(bx + bw - mm(2), by + bh / 2);
  ctx.lineTo(bx + bw / 2, by + bh - mm(1.6));
  ctx.lineTo(bx + mm(2), by + bh / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#002776';
  ctx.beginPath();
  ctx.arc(bx + bw / 2, by + bh / 2, mm(4.3), 0, Math.PI * 2);
  ctx.fill();

  // "BR" à esquerda, abaixo da faixa
  ctx.fillStyle = '#111111';
  ctx.font = `700 ${mm(14)}px ${fonte}`;
  ctx.textAlign = 'left';
  ctx.fillText('BR', mm(9), faixa + mm(20));

  // Caracteres
  ctx.fillStyle = CORES[cor];
  ctx.textAlign = 'center';
  ctx.font = `700 ${mm(78)}px ${fonte}`;
  ctx.save();
  ctx.translate(L / 2 + mm(10), faixa + (A - faixa) / 2 + mm(3));
  ctx.scale(1.08, 1);
  ctx.fillText(texto.toUpperCase(), 0, 0);
  ctx.restore();

  ctx.restore();
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = mm(2.2);
  ctx.stroke(contorno);
  return canvas;
}
