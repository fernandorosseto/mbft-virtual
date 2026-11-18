'use client';

import { useRouter } from 'next/navigation';
import { LocateFixed, Maximize2, Minimize2, Minus, Plus } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import Link from 'next/link';
import {
  NOME_LIGACAO,
  RAIO,
  TIPOS_LIGACAO,
  tamanhoDoNo,
  tipoPrincipal,
  type ArestaGrafo,
  type NoGrafo,
  type TipoLigacao,
} from '@/lib/noGrafo';
import { linhasDoTema } from '@/lib/rotulos';
import { QUERY_CELULAR, useMediaQuery } from '@/lib/useMediaQuery';
import styles from './GrafoVivo.module.css';

const COR: Record<string, string> = {
  Gravíssima: '#dc2626',
  Grave: '#ea580c',
  Média: '#eab308',
  Leve: '#16a34a',
};

/** Forças da simulação (no estilo da d3-force, que o grafo do Obsidian usa). */
const REPULSAO = -320;
const ATRITO = 0.6;
const ALFA_INICIAL = 0.12;
const ALFA_ARRASTO = 0.3;
const ALFA_MINIMO = 0.004;
const ZOOM_MIN = 0.35;
const ZOOM_MAX = 4;
/** Abaixo deste zoom os temas somem e ficam só os códigos, como os rótulos do Obsidian. */
const ZOOM_TEMAS = 0.75;

interface Camera {
  k: number;
  tx: number;
  ty: number;
}

interface Simulacao {
  x: Float64Array;
  y: Float64Array;
  vx: Float64Array;
  vy: Float64Array;
  fixo: Int8Array;
  fx: Float64Array;
  fy: Float64Array;
  alfa: number;
  alvo: number;
  quadro: number;
  visivel: boolean;
}

/**
 * Grafo interativo no estilo do Obsidian, sem bibliotecas:
 * - física ao vivo (repulsão, molas nas ligações, colisão pelo tamanho do rótulo);
 * - arrastar uma bolinha puxa as ligadas; passar o mouse destaca a ficha e as vizinhas;
 * - zoom (roda com Ctrl no quadro, roda livre em tela cheia, pinça em tela cheia, botões) e
 *   arrastar o fundo; com zoom afastado, os temas somem;
 * - tocar abre a ficha (`href`) ou seleciona (`onSelecionar`).
 * O SVG inicial sai do servidor com as posições calculadas: sem JavaScript, continua legível e
 * com links. Posições e câmera são atualizadas direto no DOM (sem re-render a cada quadro).
 */
export function GrafoVivo({
  nos: nosPc,
  arestas,
  largura: larguraPc,
  altura: alturaPc,
  celular: versaoCelular,
  rotulo,
  selecionado,
  onSelecionar,
  className,
}: {
  nos: NoGrafo[];
  arestas: ArestaGrafo[];
  largura: number;
  altura: number;
  /**
   * Outra disposição para o celular (quadro estreito): posições x, y em sequência, na ordem de
   * `nos`. Assim o grafo vai uma vez só na página, com as duas disposições.
   */
  celular?: { largura: number; altura: number; xy: number[] };
  rotulo: string;
  selecionado?: string | null;
  onSelecionar?: (id: string) => void;
  className?: string;
}) {
  const router = useRouter();
  const noCelular = useMediaQuery(QUERY_CELULAR) && !!versaoCelular;
  const largura = noCelular ? versaoCelular!.largura : larguraPc;
  const altura = noCelular ? versaoCelular!.altura : alturaPc;
  const nos = useMemo(
    () =>
      noCelular && versaoCelular
        ? nosPc.map((n, i) => ({ ...n, x: versaoCelular.xy[2 * i], y: versaoCelular.xy[2 * i + 1] }))
        : nosPc,
    [noCelular, versaoCelular, nosPc],
  );
  const svg = useRef<SVGSVGElement>(null);
  const camada = useRef<SVGGElement>(null);
  const elNos = useRef(new Map<string, SVGGElement>());
  const elLinhas = useRef<(SVGLineElement | null)[]>([]);
  const elAlvos = useRef<(SVGLineElement | null)[]>([]);
  const idMarcas = useId().replace(/:/g, '');
  const sim = useRef<Simulacao | null>(null);
  const camera = useRef<Camera>({ k: 1, tx: 0, ty: 0 });
  const arrasto = useRef<{ i: number; x0: number; y0: number; moveu: boolean; dx: number; dy: number } | null>(null);
  const panoramica = useRef<{ x0: number; y0: number; tx: number; ty: number } | null>(null);
  const toques = useRef(new Map<number, { x: number; y: number }>());
  const pinca = useRef<{ d0: number; k0: number; cx: number; cy: number; tx: number; ty: number } | null>(null);
  const ignorarClique = useRef(false);
  const [foco, setFoco] = useState<string | null>(null);
  const [telaCheia, setTelaCheia] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  // Tipos de ligação visíveis (legenda) e ligação tocada (cartão com o motivo)
  const [visiveis, setVisiveis] = useState<Record<TipoLigacao, boolean>>({ emVez: true, tambem: true, referencia: true });
  const [ligacaoAberta, setLigacaoAberta] = useState<number | null>(null);

  const indice = useMemo(() => new Map(nos.map((n, i) => [n.id, i])), [nos]);
  const tamanhos = useMemo(() => nos.map((n) => tamanhoDoNo(n)), [nos]);
  // Só as ligações entre nós presentes; `dados` guarda a ligação de cada par de índices
  const { ligacoes, dados } = useMemo(() => {
    const ligacoes: (readonly [number, number])[] = [];
    const dados: ArestaGrafo[] = [];
    for (const ar of arestas) {
      const i = indice.get(ar.a);
      const j = indice.get(ar.b);
      if (i === undefined || j === undefined) continue;
      ligacoes.push([i, j]);
      dados.push(ar);
    }
    return { ligacoes, dados };
  }, [arestas, indice]);
  const contagem = useMemo(() => {
    const c: Record<TipoLigacao, number> = { emVez: 0, tambem: 0, referencia: 0 };
    for (const ar of dados) c[tipoPrincipal(ar)]++;
    return c;
  }, [dados]);
  const vizinhos = useMemo(() => {
    const mapa = new Map<string, Set<string>>();
    for (const { a, b } of arestas) {
      if (!mapa.has(a)) mapa.set(a, new Set());
      if (!mapa.has(b)) mapa.set(b, new Set());
      mapa.get(a)!.add(b);
      mapa.get(b)!.add(a);
    }
    return mapa;
  }, [arestas]);

  // ---- câmera ----
  const aplicarCamera = useCallback(() => {
    const { k, tx, ty } = camera.current;
    camada.current?.setAttribute('transform', `translate(${tx} ${ty}) scale(${k})`);
    svg.current?.classList.toggle(styles.longe, k < ZOOM_TEMAS);
  }, []);

  /** Ponto da tela em coordenadas do viewBox. */
  const noQuadro = useCallback((clientX: number, clientY: number) => {
    const ctm = svg.current?.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }, []);

  /** Ponto da tela em coordenadas da camada (já descontados zoom e deslocamento). */
  const naCamada = useCallback(
    (clientX: number, clientY: number) => {
      const p = noQuadro(clientX, clientY);
      const { k, tx, ty } = camera.current;
      return { x: (p.x - tx) / k, y: (p.y - ty) / k };
    },
    [noQuadro],
  );

  const zoomEm = useCallback(
    (fator: number, cx = largura / 2, cy = altura / 2) => {
      const c = camera.current;
      const k = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, c.k * fator));
      // O ponto sob o cursor fica parado
      c.tx = cx - ((cx - c.tx) * k) / c.k;
      c.ty = cy - ((cy - c.ty) * k) / c.k;
      c.k = k;
      aplicarCamera();
    },
    [largura, altura, aplicarCamera],
  );

  const recentralizar = useCallback(() => {
    camera.current = { k: 1, tx: 0, ty: 0 };
    aplicarCamera();
  }, [aplicarCamera]);

  // ---- simulação ----
  const desenhar = useCallback(() => {
    const s = sim.current;
    if (!s) return;
    nos.forEach((n, i) => elNos.current.get(n.id)?.setAttribute('transform', `translate(${s.x[i]} ${s.y[i]})`));
    ligacoes.forEach(([a, b], k) => {
      const [x1, y1, x2, y2] = pontas(s.x[a], s.y[a], s.x[b], s.y[b], RAIO[nos[a].papel], RAIO[nos[b].papel]);
      for (const l of [elLinhas.current[k], elAlvos.current[k]]) {
        if (!l) continue;
        l.setAttribute('x1', String(x1));
        l.setAttribute('y1', String(y1));
        l.setAttribute('x2', String(x2));
        l.setAttribute('y2', String(y2));
      }
    });
  }, [nos, ligacoes]);

  const passo = useCallback(() => {
    const s = sim.current;
    if (!s) return;
    const n = nos.length;
    s.alfa += (s.alvo - s.alfa) * 0.0228;
    const a = s.alfa;
    const { x, y, vx, vy } = s;

    // Molas nas ligações: comprimento pelo tamanho dos rótulos; fichas muito ligadas puxam menos
    const grau = new Float64Array(n);
    for (const [i, j] of ligacoes) {
      grau[i]++;
      grau[j]++;
    }
    for (const [i, j] of ligacoes) {
      const comprimento = 50 + (tamanhos[i].l + tamanhos[j].l) / 4;
      const forca = 1 / Math.min(grau[i], grau[j]);
      let dx = x[j] + vx[j] - x[i] - vx[i];
      let dy = y[j] + vy[j] - y[i] - vy[i];
      const d = Math.hypot(dx, dy) || 1;
      const f = ((d - comprimento) / d) * a * forca;
      dx *= f;
      dy *= f;
      const peso = grau[i] / (grau[i] + grau[j]);
      vx[j] -= dx * peso;
      vy[j] -= dy * peso;
      vx[i] += dx * (1 - peso);
      vy[i] += dy * (1 - peso);
    }
    // Repulsão entre todos (até ~70 nós, n² é barato)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = x[j] - x[i];
        const dy = y[j] - y[i];
        const d2 = Math.max(dx * dx + dy * dy, 25);
        const f = (REPULSAO * a) / d2;
        vx[i] += dx * f;
        vy[i] += dy * f;
        vx[j] -= dx * f;
        vy[j] -= dy * f;
      }
    }
    // Gravidade leve para o meio
    for (let i = 0; i < n; i++) {
      vx[i] += (largura / 2 - x[i]) * 0.012 * a;
      vy[i] += (altura / 2 - y[i]) * 0.012 * a;
    }
    // Movimento com atrito; nó arrastado fica onde o dedo está
    for (let i = 0; i < n; i++) {
      if (s.fixo[i]) {
        x[i] = s.fx[i];
        y[i] = s.fy[i];
        vx[i] = 0;
        vy[i] = 0;
      } else {
        vx[i] *= ATRITO;
        vy[i] *= ATRITO;
        x[i] += vx[i];
        y[i] += vy[i];
      }
    }
    // Colisão: o rótulo de um não cobre o outro
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const minX = (tamanhos[i].l + tamanhos[j].l) / 2;
        const minY = (tamanhos[i].a + tamanhos[j].a) / 2;
        const nx = (x[j] - x[i]) / minX;
        const ny = (y[j] - y[i]) / minY;
        const d = Math.hypot(nx, ny);
        if (d >= 1) continue;
        const emp = (1 - d) * 0.5;
        const ux = d > 0.001 ? nx / d : 1;
        const uy = d > 0.001 ? ny / d : 0;
        const fi = s.fixo[i] ? 0 : s.fixo[j] ? 2 : 1;
        const fj = 2 - fi;
        x[i] -= ux * emp * minX * fi * 0.5;
        y[i] -= uy * emp * minY * fi * 0.5;
        x[j] += ux * emp * minX * fj * 0.5;
        y[j] += uy * emp * minY * fj * 0.5;
      }
    }
    // Dentro do quadro (com zoom e arraste do fundo, nada se perde)
    for (let i = 0; i < n; i++) {
      const mx = tamanhos[i].l / 2;
      x[i] = Math.min(largura - mx, Math.max(mx, x[i]));
      y[i] = Math.min(altura - tamanhos[i].a + 8, Math.max(RAIO[nos[i].papel] + 4, y[i]));
    }
    desenhar();
  }, [nos, ligacoes, tamanhos, largura, altura, desenhar]);

  const rodar = useCallback(() => {
    const s = sim.current;
    if (!s || s.quadro || !s.visivel) return;
    const laco = () => {
      passo();
      if (s.alfa < ALFA_MINIMO && s.alvo === 0) {
        s.quadro = 0;
        return;
      }
      s.quadro = requestAnimationFrame(laco);
    };
    s.quadro = requestAnimationFrame(laco);
  }, [passo]);

  const reaquecer = useCallback(
    (alfa: number, alvo = 0) => {
      const s = sim.current;
      if (!s) return;
      s.alfa = Math.max(s.alfa, alfa);
      s.alvo = alvo;
      rodar();
    },
    [rodar],
  );

  // Começa nas posições do servidor e se acomoda de leve; só anima quando o grafo está visível
  useEffect(() => {
    const n = nos.length;
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sim.current = {
      x: Float64Array.from(nos, (no) => no.x),
      y: Float64Array.from(nos, (no) => no.y),
      vx: new Float64Array(n),
      vy: new Float64Array(n),
      fixo: new Int8Array(n),
      fx: new Float64Array(n),
      fy: new Float64Array(n),
      alfa: calmo ? 0 : ALFA_INICIAL,
      alvo: 0,
      quadro: 0,
      visivel: false,
    };
    elLinhas.current.length = ligacoes.length;
    elAlvos.current.length = ligacoes.length;
    const alvo = svg.current;
    if (!alvo) return;
    const observador = new IntersectionObserver(([e]) => {
      const s = sim.current;
      if (!s) return;
      s.visivel = e.isIntersecting;
      if (s.visivel) rodar();
      else if (s.quadro) {
        cancelAnimationFrame(s.quadro);
        s.quadro = 0;
      }
    });
    observador.observe(alvo);
    return () => {
      observador.disconnect();
      if (sim.current?.quadro) cancelAnimationFrame(sim.current.quadro);
      sim.current = null;
    };
  }, [nos, ligacoes, rodar]);

  // Roda do mouse: no quadro, só com Ctrl (ou pinça do trackpad), para não prender a rolagem da página
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const roda = (e: WheelEvent) => {
      if (!telaCheia && !e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const p = noQuadro(e.clientX, e.clientY);
      // Roda do mouse dá saltos de ~100; a pinça do trackpad (Ctrl) dá passos pequenos
      const passo = Math.max(-1, Math.min(1, -e.deltaY / (Math.abs(e.deltaY) > 40 ? 100 : 25)));
      zoomEm(Math.exp(passo * 0.25), p.x, p.y);
    };
    el.addEventListener('wheel', roda, { passive: false });
    return () => el.removeEventListener('wheel', roda);
  }, [telaCheia, noQuadro, zoomEm]);

  // Tela cheia: Esc fecha e a página atrás não rola
  useEffect(() => {
    if (!telaCheia) return;
    const tecla = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setTelaCheia(false);
    };
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', tecla);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener('keydown', tecla);
    };
  }, [telaCheia]);

  // ---- ponteiro ----
  const aoApertarNo = (e: ReactPointerEvent, i: number) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const s = sim.current;
    if (!s) return;
    const p = naCamada(e.clientX, e.clientY);
    // Guarda a diferença entre o dedo e o centro da bolinha, para ela não pular
    arrasto.current = { i, x0: e.clientX, y0: e.clientY, moveu: false, dx: s.x[i] - p.x, dy: s.y[i] - p.y };
    ignorarClique.current = false;
    s.fixo[i] = 1;
    s.fx[i] = s.x[i];
    s.fy[i] = s.y[i];
  };

  const aoMover = (e: ReactPointerEvent) => {
    const s = sim.current;
    const ar = arrasto.current;
    if (ar && s) {
      if (!ar.moveu && Math.hypot(e.clientX - ar.x0, e.clientY - ar.y0) > 4) {
        ar.moveu = true;
        setArrastando(true);
        reaquecer(ALFA_ARRASTO, ALFA_ARRASTO);
      }
      if (ar.moveu) {
        const p = naCamada(e.clientX, e.clientY);
        s.fx[ar.i] = p.x + ar.dx;
        s.fy[ar.i] = p.y + ar.dy;
      }
      return;
    }
    if (toques.current.has(e.pointerId)) {
      toques.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (toques.current.size === 2 && pinca.current) {
        const [t1, t2] = Array.from(toques.current.values());
        const d = Math.hypot(t1.x - t2.x, t1.y - t2.y);
        const meio = noQuadro((t1.x + t2.x) / 2, (t1.y + t2.y) / 2);
        const c = camera.current;
        const k = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, (pinca.current.k0 * d) / pinca.current.d0));
        // Pinça: zoom em volta do meio dos dedos e arraste junto
        c.tx = meio.x - ((pinca.current.cx - pinca.current.tx) * k) / pinca.current.k0;
        c.ty = meio.y - ((pinca.current.cy - pinca.current.ty) * k) / pinca.current.k0;
        c.k = k;
        aplicarCamera();
        return;
      }
    }
    const pan = panoramica.current;
    if (pan) {
      const p = noQuadro(e.clientX, e.clientY);
      camera.current.tx = pan.tx + (p.x - pan.x0);
      camera.current.ty = pan.ty + (p.y - pan.y0);
      aplicarCamera();
    }
  };

  const aoSoltar = (e: ReactPointerEvent) => {
    const s = sim.current;
    const ar = arrasto.current;
    if (ar && s) {
      s.fixo[ar.i] = 0; // como no Obsidian, a bolinha solta volta para a física
      ignorarClique.current = ar.moveu;
      arrasto.current = null;
      setArrastando(false);
      reaquecer(0.1, 0);
    }
    toques.current.delete(e.pointerId);
    if (toques.current.size < 2) pinca.current = null;
    if (toques.current.size === 0) panoramica.current = null;
  };

  // Fundo: mouse arrasta a vista; no toque, só em tela cheia (no quadro, o dedo rola a página)
  const aoApertarFundo = (e: ReactPointerEvent) => {
    if (e.pointerType === 'touch' && !telaCheia) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    if (e.pointerType === 'touch') {
      toques.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (toques.current.size === 2) {
        const [t1, t2] = Array.from(toques.current.values());
        const meio = noQuadro((t1.x + t2.x) / 2, (t1.y + t2.y) / 2);
        const c = camera.current;
        pinca.current = { d0: Math.hypot(t1.x - t2.x, t1.y - t2.y) || 1, k0: c.k, cx: meio.x, cy: meio.y, tx: c.tx, ty: c.ty };
        panoramica.current = null;
        return;
      }
    }
    const p = noQuadro(e.clientX, e.clientY);
    panoramica.current = { x0: p.x, y0: p.y, tx: camera.current.tx, ty: camera.current.ty };
  };

  const acionar = (n: NoGrafo) => {
    if (n.href) router.push(n.href);
    else onSelecionar?.(n.id);
  };

  // ---- desenho ----
  const destaque = foco ?? selecionado ?? nos.find((n) => n.papel === 'centro')?.id ?? null;
  const ligadosAoDestaque = destaque ? vizinhos.get(destaque) ?? new Set<string>() : new Set<string>();
  const esmaecer = foco != null || selecionado != null;

  return (
    <div className={`${styles.quadro} ${telaCheia ? styles.telaCheia : ''} ${className ?? ''}`}>
      {telaCheia && (
        <div className={styles.barraTelaCheia}>
          <span>{rotulo}</span>
        </div>
      )}
      <div className={styles.legendaLigacoes} role="group" aria-label="Tipos de ligação">
        {TIPOS_LIGACAO.filter((t) => contagem[t] > 0).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={visiveis[t]}
            className={styles.tipoLigacao}
            onClick={() => setVisiveis((v) => ({ ...v, [t]: !v[t] }))}
          >
            <svg width="26" height="10" aria-hidden>
              <line x1="1" y1="5" x2="19" y2="5" className={`${styles.amostra} ${styles[`l_${t}`]}`} />
              {t !== 'referencia' && <path d="M17,1 L25,5 L17,9 z" className={`${styles.ponta} ${styles[`p_${t}`]}`} />}
            </svg>
            {NOME_LIGACAO[t]} <span className={styles.qtdLigacoes}>{contagem[t]}</span>
          </button>
        ))}
      </div>
      <div className={styles.palco}>
      <svg
        ref={svg}
        viewBox={`0 0 ${largura} ${altura}`}
        className={`${styles.grafo} ${arrastando ? styles.arrastando : ''}`}
        role="img"
        aria-label={rotulo}
        onPointerDown={aoApertarFundo}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
      >
        <defs>
          {TIPOS_LIGACAO.flatMap((t) =>
            [false, true].map((ativa) => (
              <marker
                key={`${t}${ativa}`}
                id={`${idMarcas}-${t}${ativa ? '-a' : ''}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth={ativa ? 9 : 7}
                markerHeight={ativa ? 9 : 7}
                markerUnits="userSpaceOnUse"
                orient="auto-start-reverse"
              >
                <path d="M0,1 L10,5 L0,9 z" className={`${styles.ponta} ${styles[`p_${t}`]} ${ativa ? styles.pontaAtiva : ''}`} />
              </marker>
            )),
          )}
        </defs>
        <g ref={camada}>
          <g>
            {ligacoes.map(([a, b], k) => {
              const na = nos[a];
              const nb = nos[b];
              const ar = dados[k];
              const tipo = tipoPrincipal(ar);
              const mostrar = [ar.ab, ar.ba].some((t) => t && visiveis[t]);
              if (!mostrar) return null;
              const ativa = ligacaoAberta === k || (destaque != null && (na.id === destaque || nb.id === destaque));
              const [x1, y1, x2, y2] = pontas(na.x, na.y, nb.x, nb.y, RAIO[na.papel], RAIO[nb.papel]);
              const titulo = descreverLigacao(ar, nos[a], nos[b]);
              return (
                <g key={`${na.id}-${nb.id}`} className={styles.ligacao}>
                  <line
                    ref={(el) => {
                      elLinhas.current[k] = el;
                    }}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    className={`${styles.aresta} ${styles[`l_${tipo}`]} ${ativa ? styles.arestaAtiva : ''} ${
                      esmaecer && !ativa ? styles.arestaApagada : ''
                    }`}
                    markerEnd={ar.ab ? `url(#${idMarcas}-${ar.ab}${ativa ? '-a' : ''})` : undefined}
                    markerStart={ar.ba ? `url(#${idMarcas}-${ar.ba}${ativa ? '-a' : ''})` : undefined}
                    style={
                      {
                        '--comprimento': Math.ceil(Math.hypot(x2 - x1, y2 - y1)),
                        '--atraso': `${250 + Math.min(k * 6, 500)}ms`,
                      } as CSSProperties
                    }
                  />
                  {/* Faixa invisível e larga: passar o mouse mostra o motivo; tocar abre o cartão */}
                  <line
                    ref={(el) => {
                      elAlvos.current[k] = el;
                    }}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    className={styles.alvoLigacao}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setLigacaoAberta((atual) => (atual === k ? null : k))}
                  >
                    <title>{titulo}</title>
                  </line>
                </g>
              );
            })}
          </g>
          {nos.map((n, i) => {
            const r = RAIO[n.papel];
            const vizinho = n.papel === 'vizinho';
            const linhas = linhasDoTema(n.tema);
            const apagado = esmaecer && n.id !== destaque && !ligadosAoDestaque.has(n.id);
            const corpo = (
              <g
                className={`${styles.no} ${vizinho ? styles.vizinho : ''} ${apagado ? styles.apagado : ''} ${
                  n.id === destaque ? styles.noDestaque : ''
                }`}
                style={{ '--atraso': `${Math.min(i * 15, 450)}ms` } as CSSProperties}
              >
                <title>{n.titulo}</title>
                <circle r={Math.max(r, 16)} className={styles.alvo} />
                <circle r={r} fill={COR[n.gravidade] ?? '#94a3b8'} className={styles.bolinha} />
                <text y={r + 13} className={vizinho ? styles.rotuloVizinho : styles.rotulo}>
                  <tspan className="so-codigo">{n.id}</tspan>
                  <tspan className="so-artigo">{n.artigo}</tspan>
                </text>
                {linhas.length > 0 && (
                  <text y={r + (vizinho ? 24 : 26)} className={vizinho ? styles.temaVizinho : styles.tema}>
                    {linhas.map((l, j) => (
                      <tspan key={j} x={0} dy={j === 0 ? 0 : vizinho ? 11 : 12}>
                        {l}
                      </tspan>
                    ))}
                  </text>
                )}
              </g>
            );
            const comum = {
              ref: (el: SVGGElement | null) => {
                if (el) elNos.current.set(n.id, el);
                else elNos.current.delete(n.id);
              },
              transform: `translate(${n.x} ${n.y})`,
              className: styles.posicao,
              onPointerDown: (e: ReactPointerEvent) => aoApertarNo(e, i),
              onPointerEnter: (e: ReactPointerEvent) => e.pointerType === 'mouse' && setFoco(n.id),
              onPointerLeave: () => setFoco((f) => (f === n.id ? null : f)),
              onClick: (e: ReactMouseEvent) => {
                e.preventDefault();
                if (ignorarClique.current) {
                  ignorarClique.current = false;
                  return;
                }
                acionar(n);
              },
            };
            if (n.href) {
              // O link fica dentro do grupo posicionado: o clique sobe até `onClick` do grupo,
              // que decide (arrastou ou tocou); sem JavaScript, o link funciona sozinho
              return (
                <g key={n.id} {...comum}>
                  <a href={n.href} aria-label={n.titulo}>
                    {corpo}
                  </a>
                </g>
              );
            }
            return (
              <g
                key={n.id}
                {...comum}
                role={onSelecionar ? 'button' : undefined}
                tabIndex={onSelecionar ? 0 : undefined}
                aria-label={onSelecionar ? n.titulo : undefined}
                onKeyDown={(e: KeyboardEvent) => {
                  if (onSelecionar && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelecionar(n.id);
                  }
                }}
              >
                {corpo}
              </g>
            );
          })}
        </g>
      </svg>

      <div className={styles.controles} role="toolbar" aria-label="Controles do grafo">
        <button type="button" onClick={() => zoomEm(1.3)} aria-label="Aproximar">
          <Plus size={18} />
        </button>
        <button type="button" onClick={() => zoomEm(1 / 1.3)} aria-label="Afastar">
          <Minus size={18} />
        </button>
        <button type="button" onClick={recentralizar} aria-label="Centralizar">
          <LocateFixed size={18} />
        </button>
        <button
          type="button"
          onClick={() => setTelaCheia((t) => !t)}
          aria-label={telaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
          aria-pressed={telaCheia}
        >
          {telaCheia ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>
      </div>

      {ligacaoAberta != null && dados[ligacaoAberta] && (
        <CartaoLigacao
          aresta={dados[ligacaoAberta]}
          noA={nos[ligacoes[ligacaoAberta][0]]}
          noB={nos[ligacoes[ligacaoAberta][1]]}
          fechar={() => setLigacaoAberta(null)}
        />
      )}
    </div>
  );
}

/** Pontas da linha na borda das bolinhas (a seta encosta na bolinha, não no centro). */
function pontas(x1: number, y1: number, x2: number, y2: number, r1: number, r2: number): [number, number, number, number] {
  const d = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / d;
  const uy = (y2 - y1) / d;
  const f1 = Math.min(r1 + 2, d / 2);
  const f2 = Math.min(r2 + 2, d / 2);
  return [x1 + ux * f1, y1 + uy * f1, x2 - ux * f2, y2 - uy * f2];
}

const FRASE: Record<TipoLigacao, (de: string, para: string) => string> = {
  emVez: (de, para) => `${de} manda autuar em ${para} (quando não autuar)`,
  tambem: (de, para) => `${de} pede autuar também em ${para}`,
  referencia: (de, para) => `${de} cita ${para}`,
};

/** Texto do balão da linha: sentido(s); o item do PDF fica no cartão (não repete o texto na página). */
function descreverLigacao(ar: ArestaGrafo, a: NoGrafo, b: NoGrafo): string {
  const partes: string[] = [];
  if (ar.ab) partes.push(FRASE[ar.ab](a.id, b.id));
  if (ar.ba) partes.push(FRASE[ar.ba](b.id, a.id));
  if (ar.motivos?.length) partes.push('Toque para ver o motivo.');
  return partes.join('\n');
}

/** Cartão aberto ao tocar numa linha: sentido de cada citação e o item que a faz. */
function CartaoLigacao({ aresta, noA, noB, fechar }: { aresta: ArestaGrafo; noA: NoGrafo; noB: NoGrafo; fechar: () => void }) {
  const sentidos: { de: NoGrafo; para: NoGrafo; tipo: TipoLigacao }[] = [];
  if (aresta.ab) sentidos.push({ de: noA, para: noB, tipo: aresta.ab });
  if (aresta.ba) sentidos.push({ de: noB, para: noA, tipo: aresta.ba });
  return (
    <div className={styles.cartaoLigacao} role="dialog" aria-label="Ligação entre fichas">
      <button type="button" className={styles.fecharCartao} onClick={fechar} aria-label="Fechar">
        ×
      </button>
      {sentidos.map(({ de, para, tipo }) => {
        const motivos = (aresta.motivos ?? []).filter((m) => m.de === de.id && m.para === para.id);
        return (
          <div key={de.id} className={styles.sentido}>
            <p className={styles.sentidoTopo}>
              <span className={`${styles.seloLigacao} ${styles[`s_${tipo}`]}`}>{NOME_LIGACAO[tipo]}</span>
              <Link href={`/fichas/${de.id}`}>
                <span className="so-codigo">{de.id}</span>
                <span className="so-artigo">{de.artigo}</span>
              </Link>
              <span aria-hidden>→</span>
              <Link href={`/fichas/${para.id}`}>
                <span className="so-codigo">{para.id}</span>
                <span className="so-artigo">{para.artigo}</span>
              </Link>
            </p>
            {motivos.map((m, i) => (
              <p key={i} className={styles.motivo}>
                {m.item}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}
