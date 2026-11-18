/**
 * Disposição de grafo por forças (Fruchterman-Reingold), sem bibliotecas. Determinística: as
 * posições iniciais saem da ordem dos nós, então o mesmo grafo sempre fica igual. Serve ao
 * build (grafo da ficha) e ao navegador (mapa da busca); até ~100 nós roda em poucos ms.
 */
export interface Ponto {
  x: number;
  y: number;
}

interface Opcoes {
  largura: number;
  altura: number;
  centro?: string;
  iteracoes?: number;
}

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
    const local = parte.length === 1 ? new Map([[parte[0], { x: cl / 2, y: ca / 2 - 6 }]]) : dispor(parte, arestas, { ...opcoes, largura: cl, altura: ca, centro: undefined });
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
  { largura, altura, centro, iteracoes = 300 }: Opcoes,
): Map<string, Ponto> {
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

  // Afasta bolinhas coladas: cada uma precisa de um retângulo do tamanho do rótulo (código de
  // 6 caracteres embaixo), então a distância mínima é elíptica, maior na horizontal
  const [minX, minY] = [44, 32];
  const margemX = Math.min(26, largura / 2);
  for (let passo = 0; passo < 120; passo++) {
    let mexeu = false;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const pi = pos.get(ids[i])!;
        const pj = pos.get(ids[j])!;
        const nx = (pj.x - pi.x) / minX;
        const ny = (pj.y - pi.y) / minY;
        const d = Math.hypot(nx, ny);
        if (d >= 1) continue;
        mexeu = true;
        const empurrao = (1 - d) / 2 + 0.01;
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
    for (const p of pos.values()) {
      // Na horizontal, meia largura de rótulo de folga para o código não cortar na borda
      p.x = Math.min(largura - margemX, Math.max(margemX, p.x));
      p.y = Math.min(altura - margem, Math.max(margem / 2, p.y));
    }
    if (!mexeu) break;
  }
  return pos;
}
