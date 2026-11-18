'use client';

import React, { memo, useEffect, useRef } from 'react';
import { m, AnimatePresence, useMotionValue } from 'framer-motion';
import type { StatusRegra, ZonaId } from '@/types/conteudo';
import { STATUS } from '@/data/status';
import styles from './Marcadores.module.css';

export interface MarcadorVisual {
  zona: ZonaId;
  titulo: string;
  resumo: string;
  status?: StatusRegra;
  ativo?: boolean;
  /** Outra zona está em foco: o marcador fica apagado, mas continua clicável. */
  esmaecido?: boolean;
}

/** Posição calculada a cada quadro pelo CarStage, em px relativos ao palco. */
export interface PosicaoMarcador {
  /** Ponto no vidro (início da linha). */
  ax: number;
  ay: number;
  /** Canto superior esquerdo do botão. */
  bx: number;
  by: number;
  /** Onde a linha encontra o botão (base, topo ou lateral voltada para o ponto). */
  ex: number;
  ey: number;
  visivel: boolean;
  /** Zona atrás da carroceria: o conjunto fica esmaecido. */
  oculto: boolean;
}

export interface ElementoMarcador {
  botao: HTMLButtonElement | null;
  atualizar: (p: PosicaoMarcador) => void;
}

/** Registro preenchido pelos marcadores montados e lido pelo loop de animação do CarStage. */
export type RegistroMarcadores = Map<ZonaId, ElementoMarcador>;

/**
 * Curva da linha: sai do vidro subindo e chega por baixo no centro do botão,
 * no mesmo estilo dos ramos do nó (CtbNo).
 */
export function caminhoMarcador(ax: number, ay: number, ex: number, ey: number): string {
  // A curva sai do vidro na direção predominante (vertical ou horizontal) e chega ao card
  // perpendicular ao lado onde encaixa.
  const dx = ex - ax;
  const dy = ey - ay;
  const vertical = Math.abs(dy) >= Math.abs(dx) * 0.6;
  const c1x = vertical ? ax + dx * 0.1 : ax + dx * 0.45;
  const c1y = vertical ? ay + dy * 0.45 : ay + dy * 0.1;
  const c2x = vertical ? ex - dx * 0.15 : ex - dx * 0.45;
  const c2y = vertical ? ey - dy * 0.45 : ey;
  const f = (n: number) => n.toFixed(1);
  return `M${f(ax)} ${f(ay)}C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(ex)} ${f(ey)}`;
}

interface Props {
  marcadores: MarcadorVisual[];
  registro: RegistroMarcadores;
  onMarcador?: (zona: ZonaId) => void;
}

export function Marcadores({ marcadores, registro, onMarcador }: Props) {
  return (
    <div className={styles.camada}>
      <AnimatePresence>
        {marcadores.map((mk) => (
          <RamoMarcador key={mk.zona} marcador={mk} registro={registro} onMarcador={onMarcador} />
        ))}
      </AnimatePresence>
    </div>
  );
}

const RamoMarcador = memo(function RamoMarcador({
  marcador,
  registro,
  onMarcador,
}: {
  marcador: MarcadorVisual;
  registro: RegistroMarcadores;
  onMarcador?: (zona: ZonaId) => void;
}) {
  const grupoRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  /** Já recebeu posição no quadro anterior (ver atualizar). */
  const posicionado = useRef(false);
  // Motion values: o loop do CarStage escreve direto no DOM, sem re-render do React
  const ax = useMotionValue(0);
  const ay = useMotionValue(0);
  const bx = useMotionValue(0);
  const by = useMotionValue(0);
  const d = useMotionValue('M0 0');

  useEffect(() => {
    const zona = marcador.zona;
    registro.set(zona, {
      botao: botaoRef.current,
      atualizar: (p) => {
        ax.set(p.ax);
        ay.set(p.ay);
        bx.set(p.bx);
        by.set(p.by);
        d.set(caminhoMarcador(p.ax, p.ay, p.ex, p.ey));
        const g = grupoRef.current;
        if (g) {
          // O Framer Motion aplica a posição no quadro seguinte. Ao reaparecer, o card só fica
          // visível um quadro depois, já no lugar (senão pisca no canto e cobre os outros).
          const mostrar = p.visivel && posicionado.current;
          posicionado.current = p.visivel;
          g.style.visibility = mostrar ? 'visible' : 'hidden';
          g.dataset.oculto = p.oculto ? 'sim' : 'nao';
        }
      },
    });
    return () => {
      registro.delete(zona);
    };
  }, [marcador.zona, registro, ax, ay, bx, by, d]);

  const cor = marcador.status ? STATUS[marcador.status].cor : 'var(--sign)';

  return (
    <div
      ref={grupoRef}
      className={styles.grupo}
      style={{ '--cor-status': cor, visibility: 'hidden' } as React.CSSProperties}
    >
      <svg className={styles.linhas} width="1" height="1" aria-hidden="true">
        <m.path
          d={d}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] } }}
          exit={{ pathLength: 0, transition: { duration: 0.4, delay: 0.1 } }}
        />
        <m.circle
          cx={ax}
          cy={ay}
          r={4.5}
          className={styles.ponto}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { duration: 0.25 } }}
          exit={{ scale: 0, opacity: 0, transition: { duration: 0.2, delay: 0.35 } }}
        />
      </svg>
      <m.button
        ref={botaoRef}
        type="button"
        className={`${styles.botao} ${marcador.ativo ? styles.ativo : ''} ${marcador.esmaecido ? styles.esmaecido : ''}`}
        style={{ x: bx, y: by }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1, transition: { delay: 0.55, type: 'spring', stiffness: 300, damping: 18 } }}
        exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.96 }}
        aria-pressed={!!marcador.ativo}
        onClick={(e) => {
          e.stopPropagation();
          onMarcador?.(marcador.zona);
        }}
      >
        <small>{marcador.titulo}</small>
        <b>{marcador.resumo}</b>
      </m.button>
    </div>
  );
});
