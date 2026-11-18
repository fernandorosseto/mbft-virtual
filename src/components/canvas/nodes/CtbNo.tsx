'use client';

import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  m,
  AnimatePresence,
  useAnimationFrame,
  useMotionValue,
  useTime,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';
import { sortear, caminho, caixaDosRamos, AMP_MAX, AMP_X_COMPACTO, type Geo, type Ramo } from './geometria';
import { QUERY_CELULAR, useMediaQuery } from '@/lib/useMediaQuery';
import styles from './CtbNo.module.css';

export type CtbTopico = {
  id: string;
  titulo: string;
  badge?: string;
};

export type CtbNoData = {
  id: string;
  rotulo: string;
  topicos: CtbTopico[];
};

type Props = {
  no: CtbNoData;
  aberto: boolean;
  topicoAtivoId?: string | null;
  onTopico: (topicoId: string) => void;
  anchorRef?: React.RefObject<HTMLDivElement>;
};

export const CtbNo = memo(function CtbNo({
  no,
  aberto,
  topicoAtivoId,
  onTopico,
  anchorRef,
}: Props) {
  const [geo, setGeo] = useState<Geo | null>(null);
  const compacto = useMediaQuery(QUERY_CELULAR);

  // Novo sorteio toda vez que o nó abre (aberto muda para true)
  useEffect(() => {
    if (aberto) {
      setGeo(sortear(no.topicos.length, compacto));
    }
  }, [aberto, no.topicos.length, compacto]);

  return (
    <div ref={anchorRef} className={styles.ctbNo}>
      <AnimatePresence>
        {aberto && geo && (
          <Ramos
            key="ramos"
            geo={geo}
            no={no}
            topicoAtivoId={topicoAtivoId}
            onTopico={onTopico}
            anchorRef={anchorRef}
            compacto={compacto}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

// Só existe com o nó aberto → o relógio da animação só roda aqui
/** Margem mínima entre os botões e a borda do palco. */
const MARGEM_PALCO = 8;

function Ramos({
  geo,
  no,
  topicoAtivoId,
  onTopico,
  anchorRef,
  compacto,
}: {
  geo: Geo;
  no: CtbNoData;
  topicoAtivoId?: string | null;
  onTopico: Props['onTopico'];
  anchorRef?: React.RefObject<HTMLDivElement>;
  compacto: boolean;
}) {
  const amp = useReducedMotion() ? 0 : AMP_MAX;
  const time = useTime();

  // Desloca o grupo de botões para dentro do palco quando o ponto fica perto de uma borda
  // (o início das linhas continua no vidro).
  const deslocX = useMotionValue(0);
  const deslocY = useMotionValue(0);
  const caixa = useMemo(() => caixaDosRamos(geo), [geo]);
  useAnimationFrame(() => {
    const ancora = anchorRef?.current;
    const palco = ancora?.offsetParent as HTMLElement | null | undefined;
    if (!ancora || !palco) return;
    const a = ancora.getBoundingClientRect();
    const pr = palco.getBoundingClientRect();
    const ax = a.left - pr.left;
    const ay = a.top - pr.top;
    let alvoX = 0;
    if (caixa.x1 - caixa.x0 > pr.width - 2 * MARGEM_PALCO) {
      alvoX = pr.width / 2 - (ax + (caixa.x0 + caixa.x1) / 2);
    } else if (ax + caixa.x0 < MARGEM_PALCO) {
      alvoX = MARGEM_PALCO - (ax + caixa.x0);
    } else if (ax + caixa.x1 > pr.width - MARGEM_PALCO) {
      alvoX = pr.width - MARGEM_PALCO - (ax + caixa.x1);
    }
    const alvoY = Math.max(0, MARGEM_PALCO - (ay + caixa.y0));
    deslocX.set(deslocX.get() + (alvoX - deslocX.get()) * 0.25);
    deslocY.set(deslocY.get() + (alvoY - deslocY.get()) * 0.25);
  });
  return (
    <>
      {no.topicos.map((topico, idx) => {
        const ramo = geo[idx];
        if (!ramo) return null;
        return (
          <Galho
            key={topico.id}
            r={ramo}
            t={topico}
            time={time}
            amp={amp}
            isAtivo={topicoAtivoId === topico.id}
            onClick={() => onTopico(topico.id)}
            deslocX={deslocX}
            deslocY={deslocY}
            compacto={compacto}
          />
        );
      })}
    </>
  );
}

function Galho({
  r,
  t,
  time,
  amp,
  isAtivo,
  onClick,
  deslocX,
  deslocY,
  compacto,
}: {
  r: Ramo;
  t: CtbTopico;
  time: MotionValue<number>;
  amp: number;
  isAtivo: boolean;
  onClick: () => void;
  deslocX: MotionValue<number>;
  deslocY: MotionValue<number>;
  compacto: boolean;
}) {
  const mv = r.m;
  // motion values: escrevem direto no DOM, sem re-render do React
  const ampX = compacto ? Math.min(amp, AMP_X_COMPACTO) : amp;
  const x = useTransform([time, deslocX], ([ms, dx]: number[]) => ampX * mv.sx * Math.sin(ms * 0.001 * mv.fx + mv.px) + dx);
  const y = useTransform([time, deslocY], ([ms, dy]: number[]) => amp * mv.sy * Math.sin(ms * 0.001 * mv.fy + mv.py) + dy);
  const d = useTransform([x, y], ([ox, oy]: number[]) => caminho(r, ox, oy));

  return (
    <>
      <svg className={styles.ctbLinhas} width="1" height="1" aria-hidden="true">
        <m.path
          d={d}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] } }}
          exit={{ pathLength: 0, transition: { duration: 0.5, delay: 0.15 } }}
        />
        <m.circle
          cx={r.c.sx}
          cy={r.c.sy}
          r={4}
          className={styles.pontoParaBrisa}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { duration: 0.25 } }}
          exit={{ scale: 0, opacity: 0, transition: { duration: 0.2, delay: 0.45 } }}
        />
      </svg>
      <m.button
        type="button"
        className={`${styles.ctbBtn} ${styles.ctbFilho} ${compacto ? styles.ctbFilhoCompacto : ''} ${isAtivo ? styles.ctbFilhoAtivo : ''}`}
        style={{ left: r.p.x, top: r.p.y, x, y, width: compacto ? r.w : undefined }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: { delay: 0.55, type: 'spring', stiffness: 300, damping: 18 },
        }}
        exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.96 }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <span>{t.titulo}</span>
        {t.badge && <span className={styles.ctbBadge}>{t.badge}</span>}
      </m.button>
    </>
  );
}
