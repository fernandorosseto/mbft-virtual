import type { KeyboardEvent } from 'react';
import styles from './DesenhoGrafo.module.css';

export interface NoDesenho {
  id: string;
  x: number;
  y: number;
  gravidade: string;
  papel: 'centro' | 'principal' | 'vizinho';
  /** Texto do balão ao passar o mouse. */
  titulo: string;
  /** Com link: o nó navega (grafo da ficha, sem JavaScript). */
  href?: string;
}

const COR: Record<string, string> = {
  Gravíssima: '#dc2626',
  Grave: '#ea580c',
  Média: '#eab308',
  Leve: '#16a34a',
};

const RAIO = { centro: 13, principal: 8, vizinho: 5 } as const;

/**
 * SVG de um grafo já posicionado, no estilo do Obsidian: bolinhas coloridas pela gravidade,
 * linhas finas para as citações. Serve ao servidor (nós com link) e ao cliente (seleção).
 */
export function DesenhoGrafo({
  nos,
  arestas,
  largura,
  altura,
  selecionado,
  onSelecionar,
  rotulo,
  className,
}: {
  nos: NoDesenho[];
  arestas: [string, string][];
  largura: number;
  altura: number;
  selecionado?: string | null;
  onSelecionar?: (id: string) => void;
  rotulo: string;
  className?: string;
}) {
  const pos = new Map(nos.map((n) => [n.id, n]));
  const ativo = selecionado ?? nos.find((n) => n.papel === 'centro')?.id;
  const vizinhosAtivos = new Set(
    arestas.filter(([a, b]) => a === ativo || b === ativo).flatMap(([a, b]) => [a, b]),
  );
  // Nós em destaque por último, para ficarem por cima
  const ordem = [...nos].sort((a, b) => ordemPapel(a) - ordemPapel(b) || Number(a.id === ativo) - Number(b.id === ativo));

  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      className={`${styles.grafo} ${selecionado ? styles.comSelecao : ''} ${className ?? ''}`}
      role="img"
      aria-label={rotulo}
    >
      <g>
        {arestas.map(([a, b]) => {
          const pa = pos.get(a);
          const pb = pos.get(b);
          if (!pa || !pb) return null;
          const destaque = ativo && (a === ativo || b === ativo);
          return (
            <line
              key={`${a}-${b}`}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              className={destaque ? styles.arestaAtiva : styles.aresta}
            />
          );
        })}
      </g>
      {ordem.map((n) => {
        const r = RAIO[n.papel];
        const apagado = selecionado && n.id !== selecionado && !vizinhosAtivos.has(n.id);
        const conteudo = (
          <>
            <title>{n.titulo}</title>
            {/* Área de toque maior que a bolinha */}
            <circle cx={n.x} cy={n.y} r={Math.max(r, 16)} className={styles.alvo} />
            <circle
              cx={n.x}
              cy={n.y}
              r={r}
              fill={COR[n.gravidade] ?? '#94a3b8'}
              className={n.id === ativo ? styles.bolinhaAtiva : styles.bolinha}
            />
            <text x={n.x} y={n.y + r + 13} className={n.papel === 'vizinho' ? styles.rotuloVizinho : styles.rotulo}>
              {n.id}
            </text>
          </>
        );
        const classe = `${styles.no} ${n.papel === 'vizinho' ? styles.vizinho : ''} ${apagado ? styles.apagado : ''}`;
        if (n.href) {
          return (
            <a key={n.id} href={n.href} className={classe}>
              {conteudo}
            </a>
          );
        }
        // Sem seleção (grafo do servidor): nó sem ação
        if (!onSelecionar) {
          return (
            <g key={n.id} className={classe}>
              {conteudo}
            </g>
          );
        }
        return (
          <g
            key={n.id}
            className={classe}
            role="button"
            tabIndex={0}
            aria-label={n.titulo}
            onClick={() => onSelecionar(n.id)}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelecionar(n.id);
              }
            }}
          >
            {conteudo}
          </g>
        );
      })}
    </svg>
  );
}

function ordemPapel(n: NoDesenho) {
  return n.papel === 'vizinho' ? 0 : n.papel === 'principal' ? 1 : 2;
}
