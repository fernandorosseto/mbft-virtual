/**
 * Disposição de grafo por forças (Fruchterman-Reingold), sem bibliotecas. Determinística: as
 * posições iniciais saem da ordem dos nós, então o mesmo grafo sempre fica igual. Serve ao
 * build (grafo da ficha) e ao navegador (mapa da busca); até ~100 nós roda em poucos ms.
 */
export interface Ponto {
  x: number;
  y: number;
}

/** Espaço que cada nó ocupa com o rótulo embaixo: largura e altura (a partir da bolinha). */
export interface Tamanho {
  l: number;
  a: number;
}

interface Opcoes {
  largura: number;
  altura: number;
  centro?: string;
  iteracoes?: number;
  /** Tamanho de cada nó; sem ele, um rótulo de código (44 × 32). */
  tamanhos?: Map<string, Tamanho>;
}

const PADRAO: Tamanho = { l: 44, a: 32 };

/**
 * Grafo com partes soltas: as partes maiores ocupam quase todo o quadro e as pequenas ficam numa faixa
 * (à direita no quadro largo, embaixo no alto). Sem isso, as partes soltas se afastam e espremem
 * a principal.
 */
export function posicionar(ids: string[], arestas: [string, string][], opcoes: Opcoes): Map<string, Ponto> {
  const partes = componentes(ids, arestas);
  // Partes de até 3 fichas vão para a faixa; as maiores ficam juntas no quadro principal
  const soltas = partes.slice(1).filter((p) => p.length <= 3);
  if (!soltas.length) return dispor(ids, arestas, opcoes);
  const principal = partes.filter((p) => !soltas.includes(p)).flat();

  const { largura, altura } = opcoes;
  const deitado = largura >= altura;
  const faixa = deitado ? Math.round(largura * 0.24) : Math.round(altura * 0.24);
  const pos = dispor(principal, arestas, {
    ...opcoes,
    largura: deitado ? largura - faixa : largura,
    altura: deitado ? altura : altura - faixa,
  });

  // Faixa em grade, uma célula por parte solta
  const [fx, fy, fl, fa] = deitado ? [largura - faixa, 0, faixa, altura] : [0, altura - faixa, largura, faixa];
  const colunas = Math.max(1, Math.round(Math.sqrt((soltas.length * fl) / fa)));
  const linhas = Math.ceil(soltas.length / colunas);
  const cl = fl / colunas;
  const ca = fa / linhas;
  soltas.forEach((parte, i) => {
    const ox = fx + (i % colunas) * cl;
    const oy = fy + Math.floor(i / colunas) * ca;
    const local = parte.length === 1 ? new Map([[parte[0], { x: cl / 2, y: Math.min(ca / 2, 18) }]]) : dispor(parte, arestas, { ...opcoes, largura: cl, altura: ca, centro: undefined });
    for (const [id, p] of local) pos.set(id, { x: ox + p.x, y: oy + p.y });
  });
  return pos;
}

/** Partes conexas, da maior para a menor (empate: ordem dos ids). */
function componentes(ids: string[], arestas: [string, string][]): string[][] {
  const vizinhos = new Map(ids.map((id) => [id, [] as string[]]));
  for (const [a, b] of arestas) {
    if (vizinhos.has(a) && vizinhos.has(b)) {
      vizinhos.get(a)!.push(b);
      vizinhos.get(b)!.push(a);
    }
  }
  const visto = new Set<string>();
  const partes: string[][] = [];
  for (const id of ids) {
    if (visto.has(id)) continue;
    const parte: string[] = [];
    const fila = [id];
    visto.add(id);
    while (fila.length) {
      const atual = fila.shift()!;
      parte.push(atual);
      for (const v of vizinhos.get(atual)!) {
        if (!visto.has(v)) {
          visto.add(v);
          fila.push(v);
        }
      }
    }
    partes.push(parte);
  }
  return partes.sort((a, b) => b.length - a.length);
}

function dispor(
  ids: string[],
  arestas: [string, string][],
  { largura, altura, centro, iteracoes = 300, tamanhos }: Opcoes,
): Map<string, Ponto> {
  const tam = (id: string) => tamanhos?.get(id) ?? PADRAO;
  const n = ids.length;
  const pos = new Map<string, Ponto>();
  if (!n) return pos;
  const cx = largura / 2;
  const cy = altura / 2;
  const outros = ids.filter((id) => id !== centro);
  outros.forEach((id, i) => {
    const a = (2 * Math.PI * i) / outros.length;
    const r = Math.min(largura, altura) * (0.25 + 0.1 * (i % 3));
    pos.set(id, { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  });
  if (centro) pos.set(centro, { x: cx, y: cy });

  const k = Math.sqrt((largura * altura) / n) * 0.75;
  const ligadas = arestas.filter(([a, b]) => pos.has(a) && pos.has(b) && a !== b);
  const grau = new Map<string, number>();
  for (const [a, b] of ligadas) {
    grau.set(a, (grau.get(a) ?? 0) + 1);
    grau.set(b, (grau.get(b) ?? 0) + 1);
  }
  let temperatura = largura / 8;

  for (let it = 0; it < iteracoes; it++) {
    const desloc = new Map(ids.map((id) => [id, { x: 0, y: 0 }]));
    for (let i = 0; i < n; i++) {
      const pi = pos.get(ids[i])!;
      for (let j = i + 1; j < n; j++) {
        const pj = pos.get(ids[j])!;
        const dx = pi.x - pj.x;
        const dy = pi.y - pj.y;
        const d = Math.max(Math.hypot(dx, dy), 0.5);
        const f = (k * k) / d;
        const di = desloc.get(ids[i])!;
        const dj = desloc.get(ids[j])!;
        di.x += (dx / d) * f;
        di.y += (dy / d) * f;
        dj.x -= (dx / d) * f;
        dj.y -= (dy / d) * f;
      }
    }
    for (const [a, b] of ligadas) {
      const pa = pos.get(a)!;
      const pb = pos.get(b)!;
      const dx = pa.x - pb.x;
      const dy = pa.y - pb.y;
      const d = Math.max(Math.hypot(dx, dy), 0.5);
      // Atração mais fraca entre fichas muito ligadas: grupos densos não viram um bolo
      const f = (d * d) / k / Math.sqrt(Math.max(1, ((grau.get(a) ?? 1) + (grau.get(b) ?? 1)) / 2));
      const da = desloc.get(a)!;
      const db = desloc.get(b)!;
      da.x -= (dx / d) * f;
      da.y -= (dy / d) * f;
      db.x += (dx / d) * f;
      db.y += (dy / d) * f;
    }
    for (const id of ids) {
      if (id === centro) continue;
      const p = pos.get(id)!;
      const d = desloc.get(id)!;
      // Gravidade leve para o centro: nós soltos não se perdem nas bordas
      d.x += (cx - p.x) * 0.3;
      d.y += (cy - p.y) * 0.3;
      const t = Math.hypot(d.x, d.y);
      if (t > 0) {
        p.x += (d.x / t) * Math.min(t, temperatura);
        p.y += (d.y / t) * Math.min(t, temperatura);
      }
    }
    temperatura = Math.max(temperatura * 0.97, 0.5);
  }

  // Encaixa no quadro, com margem para os rótulos (menor em células pequenas)
  const margem = Math.min(28, largura / 4, altura / 4);
  const xs = ids.map((id) => pos.get(id)!.x);
  const ys = ids.map((id) => pos.get(id)!.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const escala = Math.min((largura - 2 * margem) / Math.max(x1 - x0, 1), (altura - 2 * margem) / Math.max(y1 - y0, 1), 4);
  const ox = (largura - (x1 - x0) * escala) / 2;
  const oy = (altura - (y1 - y0) * escala) / 2;
  for (const p of pos.values()) {
    p.x = ox + (p.x - x0) * escala;
    p.y = oy + (p.y - y0) * escala;
  }

  // Afasta nós colados: cada um precisa do retângulo do seu rótulo (embaixo da bolinha), então a
  // distância mínima é elíptica, com as medidas somadas dos dois nós
  for (let passo = 0; passo < 500; passo++) {
    let mexeu = false;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const pi = pos.get(ids[i])!;
        const pj = pos.get(ids[j])!;
        const ti = tam(ids[i]);
        const tj = tam(ids[j]);
        const minX = (ti.l + tj.l) / 2;
        const minY = (ti.a + tj.a) / 2;
        const nx = (pj.x - pi.x) / minX;
        const ny = (pj.y - pi.y) / minY;
        const d = Math.hypot(nx, ny);
        if (d >= 1) continue;
        mexeu = true;
        const empurrao = (1 - d) * 0.6 + 0.01;
        const ux = d > 0.001 ? nx / d : 1;
        const uy = d > 0.001 ? ny / d : 0;
        // O centro fica parado; o outro nó leva o empurrão inteiro
        const fi = ids[i] === centro ? 0 : ids[j] === centro ? 2 : 1;
        const fj = 2 - fi;
        pi.x -= ux * empurrao * minX * fi;
        pi.y -= uy * empurrao * minY * fi;
        pj.x += ux * empurrao * minX * fj;
        pj.y += uy * empurrao * minY * fj;
      }
    }
    for (const id of ids) {
      const p = pos.get(id)!;
      const t = tam(id);
      // Rótulo inteiro dentro do quadro: meia largura nos lados, altura do rótulo embaixo
      const mx = Math.min(t.l / 2 + 2, largura / 2);
      p.x = Math.min(largura - mx, Math.max(mx, p.x));
      p.y = Math.min(altura - Math.min(t.a - 8, altura / 2), Math.max(16, p.y));
    }
    if (!mexeu) break;
  }
  return pos;
}

/** Menor distância entre nós, em unidades de "rótulo encostado no outro" (1 = encostado). */
function folgaMinima(pos: Map<string, Ponto>, tamanhos: Map<string, Tamanho> | undefined): number {
  const ids = Array.from(pos.keys());
  let minimo = Infinity;
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const ti = tamanhos?.get(ids[i]) ?? PADRAO;
      const tj = tamanhos?.get(ids[j]) ?? PADRAO;
      const p = pos.get(ids[i])!;
      const q = pos.get(ids[j])!;
      minimo = Math.min(minimo, Math.hypot((p.x - q.x) / ((ti.l + tj.l) / 2), (p.y - q.y) / ((ti.a + tj.a) / 2)));
    }
  }
  return minimo;
}

/**
 * Posiciona e escolhe a altura: começa pela estimativa da área dos rótulos e, se ainda houver
 * rótulos encostados, aumenta a altura (até `maximo`) e refaz.
 */
export function posicionarComAltura(
  ids: string[],
  arestas: [string, string][],
  opcoes: Omit<Opcoes, 'altura'> & { minimo: number; maximo: number },
): { pos: Map<string, Ponto>; altura: number } {
  const { minimo, ...resto } = opcoes;
  // Grafo pequeno não cresce muito: mais altura não resolve rótulo largo demais para a largura
  const maximo = Math.min(opcoes.maximo, minimo + ids.length * 70);
  const area = ids.reduce((s, id) => {
    const t = resto.tamanhos?.get(id) ?? PADRAO;
    return s + t.l * t.a;
  }, 0);
  let altura = alturaPara(resto.largura, area, minimo, maximo);
  let melhor = { pos: posicionar(ids, arestas, { ...resto, altura }), altura };
  let folga = folgaMinima(melhor.pos, resto.tamanhos);
  for (let tentativa = 0; tentativa < 3 && altura < maximo && folga < 0.97; tentativa++) {
    altura = Math.min(maximo, Math.round(altura * 1.3));
    const pos = posicionar(ids, arestas, { ...resto, altura });
    const nova = folgaMinima(pos, resto.tamanhos);
    // Só troca se melhorar de verdade
    if (nova > folga + 0.03) {
      melhor = { pos, altura };
      folga = nova;
    }
  }
  return melhor;
}

/** Altura do quadro para caber `area` (soma das áreas dos rótulos) com folga, entre um mínimo e um máximo. */
export function alturaPara(largura: number, area: number, minimo: number, maximo: number): number {
  return Math.round(Math.min(maximo, Math.max(minimo, (area * 2.4) / largura)));
}
