import type { CSSProperties, KeyboardEvent } from 'react';
import type { Tamanho } from '@/lib/grafo';
import { linhasDoTema } from '@/lib/rotulos';
import styles from './DesenhoGrafo.module.css';

export interface NoDesenho {
  /** Código da ficha. */
  id: string;
  /** Rótulo pelo artigo ("Art. 230, XVI"), mostrado no modo "guiar por artigo". */
  artigo: string;
  /** Uma ou duas palavras do tema, embaixo do código (menor nos vizinhos). */
  tema: string;
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

/** Espaço do nó com o rótulo (para o posicionamento não sobrepor rótulos). */
export function tamanhoDoNo(no: Pick<NoDesenho, 'id' | 'artigo' | 'tema' | 'papel'>): Tamanho {
  const r = RAIO[no.papel];
  const linhas = linhasDoTema(no.tema);
  if (no.papel === 'vizinho') {
    const l = Math.max(Math.max(no.id.length, no.artigo.length) * 6.1, Math.max(0, ...linhas.map((x) => x.length)) * 5.2);
    return { l: l + 8, a: r + 22 + linhas.length * 11 };
  }
  const larguraTema = Math.max(0, ...linhas.map((l) => l.length)) * 5.7;
  const larguraRef = Math.max(no.id.length, no.artigo.length) * 7.3;
  return { l: Math.max(larguraRef, larguraTema) + 10, a: r + 26 + linhas.length * 12 };
}

/**
 * SVG de um grafo já posicionado, no estilo do Obsidian: bolinhas coloridas pela gravidade,
 * rótulo com código (ou artigo) e tema, linhas finas para as citações. Ao aparecer, as bolinhas
 * surgem e as linhas se desenham; as linhas do nó em destaque correm no sentido da citação
 * (de quem cita para a ficha citada). Serve ao servidor (nós com link) e ao cliente (seleção).
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
  const indice = new Map(nos.map((n, i) => [n.id, i]));

  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      className={`${styles.grafo} ${selecionado ? styles.comSelecao : ''} ${className ?? ''}`}
      role="img"
      aria-label={rotulo}
    >
      <g>
        {arestas.map(([a, b], k) => {
          const pa = pos.get(a);
          const pb = pos.get(b);
          if (!pa || !pb) return null;
          const destaque = ativo && (a === ativo || b === ativo);
          const comprimento = Math.ceil(Math.hypot(pb.x - pa.x, pb.y - pa.y));
          return (
            <line
              key={`${a}-${b}`}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              className={destaque ? styles.arestaAtiva : styles.aresta}
              style={{ '--comprimento': comprimento, '--atraso': `${250 + Math.min(k * 6, 500)}ms` } as CSSProperties}
            />
          );
        })}
      </g>
      {ordem.map((n) => {
        const r = RAIO[n.papel];
        const apagado = selecionado && n.id !== selecionado && !vizinhosAtivos.has(n.id);
        const linhas = linhasDoTema(n.tema);
        const vizinho = n.papel === 'vizinho';
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
              <tspan className="so-codigo">{n.id}</tspan>
              <tspan className="so-artigo">{n.artigo}</tspan>
            </text>
            {linhas.length > 0 && (
              <text x={n.x} y={n.y + r + (vizinho ? 24 : 26)} className={vizinho ? styles.temaVizinho : styles.tema}>
                {linhas.map((l, i) => (
                  <tspan key={i} x={n.x} dy={i === 0 ? 0 : vizinho ? 11 : 12}>
                    {l}
                  </tspan>
                ))}
              </text>
            )}
          </>
        );
        const classe = `${styles.no} ${n.papel === 'vizinho' ? styles.vizinho : ''} ${apagado ? styles.apagado : ''}`;
        const estilo = { '--atraso': `${Math.min((indice.get(n.id) ?? 0) * 15, 450)}ms` } as CSSProperties;
        if (n.href) {
          return (
            <a key={n.id} href={n.href} className={classe} style={estilo}>
              {conteudo}
            </a>
          );
        }
        // Sem seleção (grafo do servidor): nó sem ação
        if (!onSelecionar) {
          return (
            <g key={n.id} className={classe} style={estilo}>
              {conteudo}
            </g>
          );
        }
        return (
          <g
            key={n.id}
            className={classe}
            style={estilo}
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
