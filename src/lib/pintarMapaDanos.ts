/**
 * Pintor único do mapa de danos do para-brisa (Res. CONTRAN 960/2022, arts. 14 a 16), usado pela
 * textura do carro 3D (three/mapaDanos.ts) e pelo diagrama 2D (panel/WindshieldDamageDiagram.tsx).
 * Só roda no navegador (canvas).
 *
 * Camadas: vidro (2D) → amarelo das demais áreas → área crítica vermelha hachurada → linhas do
 * volante (só pesados) → exemplos de trinca e fratura → faixa periférica vermelha.
 */
import {
  PALHETAS,
  SIMBOLO_FRATURA,
  SIMBOLO_TRINCA,
  areaCriticaPesado,
  contornoDoSetor,
  palhetaEmRepouso,
} from './paraBrisa';

export type TipoVeiculo = 'automovel' | 'pesado';
type UV = [number, number];

export interface Moldura {
  largura: number;
  altura: number;
  /** (u, v) → px no canvas. */
  emPx: (uv: UV) => [number, number];
  /** Borda do vidro (traçada como faixa periférica). */
  borda: Path2D;
  /** 2D: recorta tudo ao vidro e pinta o vidro escuro. No 3D a própria malha recorta. */
  recortar?: Path2D;
  /** Largura da faixa periférica, em px (a borda é traçada com o dobro, metade fica para dentro). */
  faixaPx: number;
  escalaSimbolos: number;
  /** Espaçamento da hachura, em px. */
  hachuraPx: number;
  /** 2D: desenhar as palhetas em repouso (no 3D o modelo já tem). */
  palhetas?: boolean;
  /** Pesados: medidas reais do vidro em metros, para posicionar a área crítica de 40 × 50 cm. */
  vidroPesado?: { largura: number; altura: number };
}

/** Cores comuns ao 2D e ao 3D. */
export const CORES_MAPA = {
  vidro: '#233342',
  demais: 'rgba(234, 179, 8, 0.24)',
  critica: '#dc2626',
  hachura: '#7f1d1d',
  faixa: 'rgba(239, 68, 68, 0.95)',
  linhas: 'rgba(226, 232, 240, 0.7)',
};

export function pintarMapaDanos(
  ctx: CanvasRenderingContext2D,
  m: Moldura,
  tipo: TipoVeiculo,
  exemplos: { trinca: UV; fratura: UV }
) {
  ctx.save();
  if (m.recortar) {
    ctx.clip(m.recortar);
    ctx.fillStyle = CORES_MAPA.vidro;
    ctx.fillRect(0, 0, m.largura, m.altura);
  }

  // 1. Demais áreas: tolerância limitada
  ctx.fillStyle = CORES_MAPA.demais;
  ctx.fillRect(0, 0, m.largura, m.altura);

  // 2. Área crítica, pintada opaca numa camada à parte e aplicada com transparência (a
  //    sobreposição dos setores das duas palhetas não escurece)
  const camada = document.createElement('canvas');
  camada.width = m.largura;
  camada.height = m.altura;
  const c2 = camada.getContext('2d');
  if (c2) {
    c2.fillStyle = CORES_MAPA.critica;
    if (tipo === 'automovel') {
      const meio = m.emPx([0.5, 0])[0];
      const [direita] = m.emPx([1, 0]);
      // Lado do motorista (u > 0,5): entre o eixo e a borda u = 1
      c2.beginPath();
      c2.rect(Math.min(meio, direita), 0, Math.abs(direita - meio), m.altura);
      c2.clip();
      PALHETAS.forEach((p) => c2.fill(caminho(contornoDoSetor(p), m)));
    } else {
      const a = areaCriticaPesado(m.vidroPesado);
      c2.fill(caminho([[a.u0, a.v0], [a.u1, a.v0], [a.u1, a.v1], [a.u0, a.v1]], m));
    }
    c2.globalCompositeOperation = 'source-atop';
    c2.strokeStyle = CORES_MAPA.hachura;
    c2.lineWidth = Math.max(1.5, m.hachuraPx / 9);
    for (let x = -m.altura; x < m.largura; x += m.hachuraPx) {
      c2.beginPath();
      c2.moveTo(x, m.altura);
      c2.lineTo(x + m.altura, 0);
      c2.stroke();
    }
    ctx.globalAlpha = 0.5;
    ctx.drawImage(camada, 0, 0);
    ctx.globalAlpha = 1;
  }

  // 3. Linhas de referência tracejadas, só nos pesados: linha de centro do volante e tangente ao
  //    ponto mais alto do volante (nos automóveis, o próprio vermelho já mostra a metade varrida)
  if (tipo === 'pesado') {
    ctx.save();
    ctx.lineWidth = Math.max(1.5, m.hachuraPx / 12);
    ctx.setLineDash([m.hachuraPx / 2.5, m.hachuraPx / 3.5]);
    ctx.strokeStyle = CORES_MAPA.linhas;
    const a = areaCriticaPesado(m.vidroPesado);
    linha(ctx, m.emPx([a.eixo, 0]), m.emPx([a.eixo, a.v1 + 0.08]));
    linha(ctx, m.emPx([a.u0 - 0.12, a.v0]), m.emPx([a.u1 + 0.12, a.v0]));
    ctx.restore();
  }

  // 4. Exemplos de danos tolerados nas demais áreas
  const [xt, yt] = m.emPx(exemplos.trinca);
  desenharTrinca(ctx, xt, yt, m.escalaSimbolos);
  const [xf, yf] = m.emPx(exemplos.fratura);
  desenharFratura(ctx, xf, yf, m.escalaSimbolos * 1.15);

  // 6. Faixa periférica de 2,5 cm (zero dano), por dentro da borda
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = CORES_MAPA.faixa;
  ctx.lineWidth = m.faixaPx * 2;
  ctx.stroke(m.borda);
  ctx.restore();

  ctx.restore();

  // 7. Palhetas em repouso (2D), fora do recorte: o eixo fica logo abaixo do vidro
  if (m.palhetas) {
    ctx.save();
    ctx.lineCap = 'round';
    PALHETAS.forEach((p) => {
      const { eixo, ponta } = palhetaEmRepouso(p);
      const a = m.emPx(eixo);
      const b = m.emPx(ponta);
      ctx.strokeStyle = '#0b1220';
      ctx.lineWidth = m.hachuraPx / 4;
      linha(ctx, a, [b[0], b[1] - m.hachuraPx / 10]);
      ctx.fillStyle = '#0b1220';
      ctx.beginPath();
      ctx.arc(a[0], a[1], m.hachuraPx / 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

}

function caminho(pontos: UV[], m: Moldura): Path2D {
  const p = new Path2D();
  pontos.forEach((uv, i) => {
    const [x, y] = m.emPx(uv);
    if (i === 0) p.moveTo(x, y);
    else p.lineTo(x, y);
  });
  p.closePath();
  return p;
}

function linha(ctx: CanvasRenderingContext2D, [x1, y1]: [number, number], [x2, y2]: [number, number]) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/** Trinca (lib/paraBrisa.ts): halo claro + traço escuro. */
export function desenharTrinca(ctx: CanvasRenderingContext2D, x: number, y: number, escala: number) {
  const traco = new Path2D(SIMBOLO_TRINCA.traco);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(escala, escala);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 6;
  ctx.stroke(traco);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.4;
  ctx.stroke(traco);
  ctx.restore();
}

/** Fratura circular (lib/paraBrisa.ts): impacto, cone irregular e fissuras desiguais. */
export function desenharFratura(ctx: CanvasRenderingContext2D, x: number, y: number, escala: number) {
  const radiais = new Path2D(SIMBOLO_FRATURA.radiais);
  const anel = new Path2D(SIMBOLO_FRATURA.anel);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(escala, escala);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 5;
  ctx.stroke(radiais);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fill(anel);
  ctx.stroke(anel);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.8;
  ctx.stroke(radiais);
  ctx.stroke(anel);
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, 0, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
