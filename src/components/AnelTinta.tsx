'use client';

import { useEffect, useId, useRef } from 'react';
import styles from './AnelTinta.module.css';

const C = 50; // centro do viewBox 0 0 100 100
const R = 38; // raio do anel

function ponto(graus: number, r = R): [number, number] {
  const a = ((graus - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}

function arco(de: number, ate: number): string {
  const [x1, y1] = ponto(de);
  const [x2, y2] = ponto(ate);
  const grande = ate - de > 180 ? 1 : 0;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 ${grande} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** Trechos do anel: começo e fim (graus) e espessura; as falhas entre eles são de propósito. */
const TRECHOS: [number, number, number][] = [
  [-12, 68, 6],
  [76, 148, 3.6],
  [155, 232, 7],
  [239, 298, 3.2],
  [305, 342, 5.4],
];

/** Respingos de tinta para fora do anel: ângulo, distância do centro e raio. */
const RESPINGOS: [number, number, number][] = [
  [38, R + 7, 3],
  [112, R + 8, 1.8],
  [198, R + 6.5, 3.4],
  [266, R + 9, 2.2],
  [328, R + 7, 1.8],
  [205, R + 12, 1.2],
];

/** Fios que escorrem do anel: ângulo e comprimento. */
const FIOS: [number, number][] = [
  [92, 9],
  [248, 11],
  [12, 6],
];

/**
 * Anel de tinta irregular em volta do botão (inspirado nos logogramas circulares da ficção
 * científica, desenho próprio): trechos de espessuras diferentes, falhas, respingos e fios.
 * Um filtro de turbulência ondula o traço devagar, como tinta na água; a animação para quando o
 * anel não está visível e com prefers-reduced-motion.
 */
export function AnelTinta({ ativo }: { ativo: boolean }) {
  const id = useId().replace(/:/g, '');
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (ativo && !calmo) el.unpauseAnimations();
    else el.pauseAnimations();
  }, [ativo]);

  return (
    <svg ref={svg} viewBox="0 0 100 100" className={`${styles.anel} ${ativo ? '' : styles.parado}`} aria-hidden>
      <defs>
        <filter id={`${id}-tinta`} x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="ruido">
            <animate attributeName="baseFrequency" dur="9s" values="0.035;0.055;0.04;0.035" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="ruido" scale="7" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="0.35" />
        </filter>
      </defs>
      <g filter={`url(#${id}-tinta)`} className={styles.tinta}>
        {TRECHOS.map(([de, ate, largura]) => (
          <path key={de} d={arco(de, ate)} strokeWidth={largura} />
        ))}
        {FIOS.map(([graus, comprimento]) => {
          const [x1, y1] = ponto(graus, R + 2);
          const [x2, y2] = ponto(graus + 4, R + comprimento);
          return <path key={graus} d={`M${x1} ${y1} Q${ponto(graus + 1, R + comprimento / 2).join(' ')} ${x2} ${y2}`} strokeWidth={1.6} />;
        })}
        {RESPINGOS.map(([graus, dist, raio]) => {
          const [x, y] = ponto(graus, dist);
          return <circle key={`${graus}-${dist}`} cx={x} cy={y} r={raio} />;
        })}
      </g>
    </svg>
  );
}
