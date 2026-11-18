'use client';

import { useEffect, useId, useRef } from 'react';
import styles from './AnelTinta.module.css';

/** Raio do corpo da gota (o botão tem 52 px; o desenho usa a mesma escala, em px). */
const CORPO = 26;
/** Quantas pontas de líquido tentam sair do círculo. */
const PONTAS = 7;

interface Ponta {
  angulo: number;
  deriva: number;
  dist: number;
  alvo: number;
  raio: number;
  raioAlvo: number;
  pressa: number;
}

/** Sorteio com semente fixa no servidor (o primeiro desenho precisa ser igual dos dois lados). */
function inicial(i: number): Ponta {
  const angulo = (360 / PONTAS) * i + (i % 3) * 9;
  return { angulo, deriva: 0, dist: CORPO - 8, alvo: CORPO - 8, raio: 7, raioAlvo: 7, pressa: 0.03 };
}

/** Folga máxima entre a borda do corpo e a borda de dentro de uma ponta: 0 = encostadas. */
const FOLGA = 1.2;

function sortear(p: Ponta) {
  // Quase sempre um empurrão curto; às vezes uma tentativa de escapar, mais longe e mais fina.
  // A ponta nunca se solta: o centro dela fica a no máximo (raio + FOLGA) da borda do corpo.
  const escapar = Math.random() < 0.3;
  p.raioAlvo = escapar ? 4.5 + Math.random() * 2 : 5.5 + Math.random() * 3.5;
  const maximo = CORPO + p.raioAlvo + FOLGA - 1.5;
  // Sem escapar, a ponta só ondula a borda (fica quase toda dentro do corpo)
  p.alvo = escapar ? maximo - Math.random() * 1.5 : CORPO - 12 + Math.random() * 8;
  p.pressa = 0.012 + Math.random() * (escapar ? 0.03 : 0.05);
  p.deriva = (Math.random() - 0.5) * 0.6;
}

/**
 * O próprio botão como uma gota de líquido: um corpo redondo e pontas da mesma cor que empurram a
 * borda para fora em lugares e ritmos aleatórios, como se o líquido tentasse sair do círculo.
 * As bolhas se fundem num desenho só (filtro "metaball": desfoque + corte do alfa), sem espaço
 * entre o corpo e as pontas. Anima só visível e sem prefers-reduced-motion; parado, é um círculo.
 */
export function AnelTinta({ ativo }: { ativo: boolean }) {
  const id = useId().replace(/:/g, '');
  const bolhas = useRef<(SVGCircleElement | null)[]>([]);
  const pontas = useRef<Ponta[]>(Array.from({ length: PONTAS }, (_, i) => inicial(i)));

  useEffect(() => {
    if (!ativo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let quadro = 0;
    const passo = () => {
      pontas.current.forEach((p, i) => {
        p.raio += (p.raioAlvo - p.raio) * p.pressa * 1.5;
        p.dist += (p.alvo - p.dist) * p.pressa;
        // Enquanto o raio muda, a ponta continua presa ao corpo
        p.dist = Math.min(p.dist, CORPO + p.raio + FOLGA - 1.5);
        p.angulo += p.deriva;
        if (Math.abs(p.alvo - p.dist) < 0.4) {
          // Depois de chegar, volta para dentro ou tenta de novo
          if (p.alvo > CORPO) {
            p.alvo = CORPO - 6 - Math.random() * 6;
            p.raioAlvo = 6 + Math.random() * 3;
            p.pressa = 0.02 + Math.random() * 0.03;
          } else sortear(p);
        }
        const a = ((p.angulo - 90) * Math.PI) / 180;
        const el = bolhas.current[i];
        if (el) {
          el.setAttribute('cx', (p.dist * Math.cos(a)).toFixed(2));
          el.setAttribute('cy', (p.dist * Math.sin(a)).toFixed(2));
          el.setAttribute('r', p.raio.toFixed(2));
        }
      });
      quadro = requestAnimationFrame(passo);
    };
    pontas.current.forEach(sortear);
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [ativo]);

  return (
    <svg viewBox="-40 -40 80 80" className={styles.gota} aria-hidden>
      <defs>
        <filter id={`${id}-liquido`} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="borrado" />
          {/* Corta o alfa borrado: as bolhas que se tocam viram uma superfície só, de borda lisa */}
          <feColorMatrix in="borrado" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
        </filter>
      </defs>
      <g filter={`url(#${id}-liquido)`} className={styles.liquido}>
        <circle r={CORPO} />
        {pontas.current.map((p, i) => {
          const a = ((p.angulo - 90) * Math.PI) / 180;
          return (
            <circle
              key={i}
              ref={(el) => {
                bolhas.current[i] = el;
              }}
              cx={(p.dist * Math.cos(a)).toFixed(2)}
              cy={(p.dist * Math.sin(a)).toFixed(2)}
              r={p.raio}
            />
          );
        })}
      </g>
    </svg>
  );
}
