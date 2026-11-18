'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { RegraDanoPorVeiculo } from '@/types/conteudo';
import { Eye } from 'lucide-react';
import { AUTOMOVEL, EXEMPLOS_DANOS, PESADO, areaCriticaPesado } from '@/lib/paraBrisa';
import { pintarMapaDanos, type Moldura, type TipoVeiculo } from '@/lib/pintarMapaDanos';
import styles from './WindshieldDamageDiagram.module.css';

interface WindshieldDamageDiagramProps {
  comparison: {
    passeio: RegraDanoPorVeiculo;
    pesados: RegraDanoPorVeiculo;
  };
  /** Aba aberta de início (o assunto dos pesados abre em "Ônibus e caminhão"). */
  inicial?: 'passeio' | 'pesados';
}

/**
 * Diagrama do para-brisa visto de fora, como no carro 3D (motorista à direita de quem olha),
 * Res. CONTRAN 960/2022, arts. 14 a 16. Desenhado pelo mesmo pintor da textura 3D
 * (lib/pintarMapaDanos.ts), com as proporções de lib/paraBrisa.ts.
 */
export const WindshieldDamageDiagram: React.FC<WindshieldDamageDiagramProps> = ({ comparison, inicial = 'passeio' }) => {
  const [veiculo, setVeiculo] = useState<'passeio' | 'pesados'>(inicial);
  const regra = veiculo === 'passeio' ? comparison.passeio : comparison.pesados;

  return (
    <div className={styles.diagramCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.cardTitle}>
            <span>Mapa de danos no para-brisa</span>
          </div>
          <div className={styles.viewBadge}>
            <Eye size={12} />
            <span>Vista de fora, como no carro: motorista à direita</span>
          </div>
        </div>

        <div className={styles.selectorNav} role="tablist" aria-label="Tipo de veículo">
          <button
            type="button"
            role="tab"
            aria-selected={veiculo === 'passeio'}
            className={`${styles.selectorBtn} ${veiculo === 'passeio' ? styles.active : ''}`}
            onClick={() => setVeiculo('passeio')}
          >
            Automóvel
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={veiculo === 'pesados'}
            className={`${styles.selectorBtn} ${veiculo === 'pesados' ? styles.active : ''}`}
            onClick={() => setVeiculo('pesados')}
          >
            Ônibus e caminhão
          </button>
        </div>
      </div>

      <div className={styles.svgWrapper}>
        <MapaDanosCanvas tipo={veiculo === 'passeio' ? 'automovel' : 'pesado'} />
      </div>

      <div className={styles.legendRow}>
        <div className={styles.legendItem}>
          <span className={styles.legendDotRed} />
          <span>Área crítica e faixa de 2,5 cm: nenhum dano, sem reparo</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDotYellow} />
          <span>Demais áreas: danos dentro dos limites</span>
        </div>
        {veiculo === 'passeio' && (
          <div className={styles.legendItem}>
            <span className={styles.legendDash} />
            <span>Região varrida pelas palhetas (ilustrativa)</span>
          </div>
        )}
      </div>

      <p className={styles.notaDiagrama}>
        Medidas proporcionais a um sedã (para-brisa de 1,42 × 0,92 m, palhetas de 60 e 48 cm) e a um caminhão
        (2,3 × 0,95 m). Ilustrativo: a região varrida e a posição do volante variam conforme o veículo.
      </p>

      <table className={styles.summaryTable}>
        <thead>
          <tr>
            <th>Requisito</th>
            <th>{regra.rotulo}</th>
          </tr>
        </thead>
        <tbody>
          <tr className={styles.highlightRow}>
            <td>
              <b>Área crítica</b>
            </td>
            <td>
              <b>{regra.areaCritica}</b>
            </td>
          </tr>
          <tr>
            <td>
              <b>Quantidade máxima</b>
            </td>
            <td>{regra.maxDanos}</td>
          </tr>
          <tr>
            <td>
              <b>Trinca</b>
            </td>
            <td>{regra.maxTrinca}</td>
          </tr>
          <tr>
            <td>
              <b>Fratura circular</b>
            </td>
            <td>{regra.maxFraturaCircular}</td>
          </tr>
          <tr>
            <td>
              <b>Faixa periférica</b>
            </td>
            <td>{regra.faixaPeriferica}</td>
          </tr>
          <tr>
            <td>
              <b>Fundamento</b>
            </td>
            <td>
              <span className={styles.legalBadge}>{regra.base}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Peças comuns aos dois diagramas
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Canvas: mesmo pintor do mapa 3D, em proporção real
// ---------------------------------------------------------------------------

/** Resolução interna (2×) para ficar nítido em telas de alta densidade. */
const K = 2;

interface Leiaute {
  largura: number;
  altura: number;
  moldura: Moldura;
  exemplos: { trinca: [number, number]; fratura: [number, number] };
}

/** Caminho do vidro com cantos arredondados, a partir dos vértices em px. */
function contornoArredondado(pontos: [number, number][], raio: number): Path2D {
  const p = new Path2D();
  const n = pontos.length;
  const meio = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const inicio = meio(pontos[n - 1], pontos[0]);
  p.moveTo(inicio[0], inicio[1]);
  for (let i = 0; i < n; i++) {
    const atual = pontos[i];
    const proximo = pontos[(i + 1) % n];
    p.arcTo(atual[0], atual[1], proximo[0], proximo[1], raio);
  }
  p.closePath();
  return p;
}

function leiaute(tipo: TipoVeiculo): Leiaute {
  if (tipo === 'automovel') {
    // ~535 px por metro
    const escala = 535 * K;
    const w = AUTOMOVEL.larguraBase * escala;
    const h = AUTOMOVEL.altura * escala;
    const x0 = 60 * K;
    const y0 = 52 * K + h;
    const recuo = ((AUTOMOVEL.larguraBase - AUTOMOVEL.larguraTopo) / 2) * escala;
    const vidro = contornoArredondado(
      [
        [x0, y0],
        [x0 + recuo, y0 - h],
        [x0 + w - recuo, y0 - h],
        [x0 + w, y0],
      ],
      22 * K
    );
    return {
      largura: w + 120 * K,
      altura: h + 110 * K,
      exemplos: EXEMPLOS_DANOS,
      moldura: {
        largura: w + 120 * K,
        altura: h + 110 * K,
        emPx: ([u, v]) => [x0 + u * w, y0 - v * h],
        borda: vidro,
        recortar: vidro,
        faixaPx: 0.025 * escala,
        escalaSimbolos: 1.1 * K,
        hachuraPx: 18 * K,
        palhetas: true,
      },
    };
  }
  // Caminhão: ~339 px por metro
  const escala = 339 * K;
  const w = PESADO.largura * escala;
  const h = PESADO.altura * escala;
  const x0 = 50 * K;
  const y0 = 52 * K + h;
  const vidro = contornoArredondado(
    [
      [x0, y0],
      [x0, y0 - h],
      [x0 + w, y0 - h],
      [x0 + w, y0],
    ],
    18 * K
  );
  return {
    largura: w + 100 * K,
    altura: h + 112 * K,
    exemplos: { trinca: [0.22, 0.42], fratura: [0.45, 0.3] },
    moldura: {
      largura: w + 100 * K,
      altura: h + 112 * K,
      emPx: ([u, v]) => [x0 + u * w, y0 - v * h],
      borda: vidro,
      recortar: vidro,
      faixaPx: 0.025 * escala,
      escalaSimbolos: 1.1 * K,
      hachuraPx: 18 * K,
    },
  };
}

function MapaDanosCanvas({ tipo }: { tipo: TipoVeiculo }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const l = useMemo(() => leiaute(tipo), [tipo]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const fonte = getComputedStyle(document.body).fontFamily;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pintarMapaDanos(ctx, l.moldura, tipo, l.exemplos);
    rotular(ctx, tipo, l, fonte);
  }, [tipo, l]);

  const descricao =
    tipo === 'automovel'
      ? 'Para-brisa de automóvel visto de fora: área crítica em vermelho na metade da região varrida pelas palhetas do lado do motorista; faixa vermelha de 2,5 cm na borda; demais áreas em amarelo, com até 2 danos.'
      : 'Para-brisa de ônibus e caminhão visto de fora: área crítica em vermelho, retângulo de 40 por 50 centímetros na linha de centro do volante; faixa vermelha de 2,5 cm na borda; demais áreas em amarelo, com até 3 danos.';
  return (
    <canvas
      ref={ref}
      width={l.largura}
      height={l.altura}
      className={styles.svgDiagram}
      style={{ aspectRatio: `${l.largura} / ${l.altura}` }}
      role="img"
      aria-label={descricao}
    />
  );
}

/** Textos sobre o desenho: brancos com contorno escuro no vidro; cinza fora dele. */
function rotular(ctx: CanvasRenderingContext2D, tipo: TipoVeiculo, l: Leiaute, fonte: string) {
  const { emPx } = l.moldura;
  const texto = (
    linhas: string[],
    [x, y]: [number, number],
    { tamanho = 15, cor = '#ffffff', contorno = 'rgba(15, 23, 42, 0.85)', peso = 700, alinhar = 'center' as CanvasTextAlign } = {}
  ) => {
    ctx.save();
    ctx.font = `${peso} ${tamanho * K}px ${fonte}`;
    ctx.textAlign = alinhar;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    linhas.forEach((linha, i) => {
      const yy = y + (i - (linhas.length - 1) / 2) * tamanho * 1.25 * K;
      if (contorno) {
        ctx.strokeStyle = contorno;
        ctx.lineWidth = 4 * K;
        ctx.strokeText(linha, x, yy);
      }
      ctx.fillStyle = cor;
      ctx.fillText(linha, x, yy);
    });
    ctx.restore();
  };
  const cinza = { cor: '#475569', contorno: '', tamanho: 13, peso: 600 };
  const vermelho = { cor: '#b91c1c', contorno: '', tamanho: 13, peso: 700 };
  const [xEsq, yBase] = emPx([0, 0]);
  const [xDir] = emPx([1, 0]);
  const [, yTopo] = emPx([0, 1]);
  const meio = (xEsq + xDir) / 2;

  texto(['faixa de 2,5 cm em toda a borda: zero dano'], [meio, yTopo - 24 * K], vermelho);
  texto(['lado do passageiro'], [xEsq + 70 * K, yBase + 40 * K], cinza);
  texto(['lado do motorista'], [xDir - 70 * K, yBase + 40 * K], cinza);

  const [xt, yt] = emPx(l.exemplos.trinca);
  const [xf, yf] = emPx(l.exemplos.fratura);
  if (tipo === 'automovel') {
    texto(['ÁREA CRÍTICA', 'zero dano'], emPx([0.79, 0.3]), { tamanho: 17 });
    texto(['DEMAIS ÁREAS', 'até 2 danos'], emPx([0.2, 0.68]), { tamanho: 16, cor: '#fde68a' });
    texto(['fora da varredura:', 'demais áreas'], emPx([0.82, 0.83]), { tamanho: 12, cor: '#fde68a', peso: 600 });
    texto(['trinca até 10 cm'], [xt, yt + 30 * K], { tamanho: 12, cor: '#fde68a', peso: 600 });
    texto(['fratura Ø até 4 cm'], [xf + 26 * K, yf], { tamanho: 12, cor: '#fde68a', peso: 600, alinhar: 'left' });
  } else {
    const a = areaCriticaPesado();
    texto(['ÁREA', 'CRÍTICA', '40 × 50 cm'], emPx([a.eixo, (a.v0 + a.v1) / 2]), { tamanho: 13 });
    texto(['DEMAIS ÁREAS', 'até 3 danos'], emPx([0.27, 0.78]), { tamanho: 16, cor: '#fde68a' });
    texto(['linha de centro', 'do volante'], emPx([a.eixo - 0.015, a.v1 + 0.13]), { tamanho: 11, cor: '#e2e8f0', peso: 600, alinhar: 'right' });
    texto(['tangente ao topo do volante'], emPx([a.u0 - 0.13, a.v0 + 0.06]), { tamanho: 11, cor: '#e2e8f0', peso: 600 });
    texto(['trinca até 20 cm'], [xt, yt + 30 * K], { tamanho: 12, cor: '#fde68a', peso: 600 });
    texto(['fratura Ø até 4 cm'], [xf + 26 * K, yf], { tamanho: 12, cor: '#fde68a', peso: 600, alinhar: 'left' });
  }
}
