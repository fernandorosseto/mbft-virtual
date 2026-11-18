/**
 * Disposição dos cards dos marcadores na tela (recalculada a cada quadro, porque a câmera se move).
 *
 * Para cada card são testadas posições ao redor do seu ponto no vidro (acima, diagonais e
 * laterais, em várias distâncias) e escolhida a de menor custo:
 * - REGRA RÍGIDA: um card nunca encosta em outro card nem em área reservada (legenda), e nunca
 *   sai da área livre do palco. Sem posição válida, o card fica oculto em vez de sobrepor.
 * - Custos: distância até o ponto; ficar sobre a silhueta do carro (empurra os cards para o alto
 *   e as laterais); cobrir o ponto de outra zona; a linha atravessar outro card ou cruzar outra
 *   linha; ficar abaixo do ponto; afastar-se da posição do quadro anterior (estabilidade).
 *
 * A linha liga o ponto ao lado do card voltado para ele (base, topo ou lateral).
 */

export type Ponto = { x: number; y: number };

export interface Retangulo {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface EntradaDisposicao<K> {
  chave: K;
  /** Ponto no vidro, em px do palco. */
  ax: number;
  ay: number;
  /** Tamanho do card. */
  w: number;
  h: number;
  /** Zona atrás da carroceria: posicionada por último e a primeira a ser ocultada. */
  atras?: boolean;
  /** Card em foco (ficha aberta): escolhe posição antes dos demais. */
  ativo?: boolean;
}

export interface Posicionado {
  /** Canto superior esquerdo do card. */
  bx: number;
  by: number;
  /** Onde a linha encontra o card, relativo ao canto superior esquerdo. */
  dx: number;
  dy: number;
}

export interface OpcoesDisposicao<K> {
  largura: number;
  /** Limite inferior da área livre (acima do painel, no celular). */
  limiteInferior: number;
  /** Áreas que nenhum card pode cobrir (ex.: legenda). */
  reservadas?: Retangulo[];
  /** Contorno convexo do carro na tela (pontos em ordem): os cards evitam ficar sobre ele. */
  carro?: Ponto[] | null;
  /** Posição escolhida no quadro anterior, para os cards não pularem entre quadros. */
  anteriores?: Map<K, { bx: number; by: number }>;
  /** Espaço mínimo entre cards; deve superar a flutuação somada de dois cards. */
  folga?: number;
  /**
   * Memória entre quadros: guarda a ordem de escolha que venceu, para não alternar entre ordens
   * de custo parecido (o que faria os cards mudarem de lugar sem parar).
   */
  memoria?: { ordem: number };
  /**
   * Avaliar também as ordens alternativas (caro). Quando falso, usa só a ordem vencedora guardada
   * na memória, com o refinamento. O CarStage explora a cada poucos quadros.
   */
  explorarOrdens?: boolean;
}

const BORDA = 8; // distância mínima das bordas do palco
const FOLGA_PADRAO = 16; // espaço mínimo entre cards (maior que a flutuação somada de dois cards)
// Graus (negativo = acima): todo o semicírculo de cima a cada 15°, mais as diagonais de baixo
const ANGULOS = [-90, -75, -105, -60, -120, -45, -135, -30, -150, -15, -165, 0, 180, 25, 155];
const RAIOS = [56, 72, 90, 110, 130, 155, 180, 210, 240, 280, 330, 390];

const CUSTO = {
  distancia: 1,
  abaixoDoPonto: 120,
  sobreCarro: 260, // multiplicado pela fração do card sobre o carro
  cobrePonto: 900,
  linhaAtravessaCard: 900,
  cardCobreLinha: 500,
  linhaCruzaLinha: 450,
  estabilidade: 0.35, // por px de distância da posição anterior
  trocarPosicao: 60, // a posição anterior ganha este desconto: só troca se a nova for claramente melhor
};

// Direções pré-calculadas
const DIRECOES = ANGULOS.map((g) => ({ cos: Math.cos((g * Math.PI) / 180), sin: Math.sin((g * Math.PI) / 180) }));

function sobrepoe(a: Retangulo, b: Retangulo, folga = 0): boolean {
  return a.x < b.x + b.w + folga && a.x + a.w + folga > b.x && a.y < b.y + b.h + folga && a.y + a.h + folga > b.y;
}

/** Fração do card sobre o polígono convexo (amostra 4 × 3 pontos do card). */
function fracaoSobre(r: Retangulo, poligono: Ponto[]): number {
  if (poligono.length < 3) return 0;
  let dentro = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      if (dentroDoConvexo(r.x + (r.w * (i + 0.5)) / 4, r.y + (r.h * (j + 0.5)) / 3, poligono)) dentro++;
    }
  }
  return dentro / 12;
}

function dentroDoConvexo(x: number, y: number, p: Ponto[]): boolean {
  let sinal = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i];
    const b = p[(i + 1) % p.length];
    const v = (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x);
    if (v !== 0) {
      if (sinal === 0) sinal = Math.sign(v);
      else if (Math.sign(v) !== sinal) return false;
    }
  }
  return true;
}

/** Contorno convexo (cadeia monótona de Andrew), em ordem. */
export function contornoConvexo(pontos: Ponto[]): Ponto[] {
  if (pontos.length < 3) return pontos.slice();
  const ps = [...pontos].sort((a, b) => a.x - b.x || a.y - b.y);
  const cruz = (o: Ponto, a: Ponto, b: Ponto) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const inferior: Ponto[] = [];
  for (const p of ps) {
    while (inferior.length >= 2 && cruz(inferior[inferior.length - 2], inferior[inferior.length - 1], p) <= 0) inferior.pop();
    inferior.push(p);
  }
  const superior: Ponto[] = [];
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i];
    while (superior.length >= 2 && cruz(superior[superior.length - 2], superior[superior.length - 1], p) <= 0) superior.pop();
    superior.push(p);
  }
  return inferior.slice(0, -1).concat(superior.slice(0, -1));
}

function contem(r: Retangulo, x: number, y: number, folga = 0): boolean {
  return x >= r.x - folga && x <= r.x + r.w + folga && y >= r.y - folga && y <= r.y + r.h + folga;
}


function segmentosCruzam(p1: Ponto, p2: Ponto, p3: Ponto, p4: Ponto): boolean {
  const d = (a: Ponto, b: Ponto, c: Ponto) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const d1 = d(p3, p4, p1);
  const d2 = d(p3, p4, p2);
  const d3 = d(p1, p2, p3);
  const d4 = d(p1, p2, p4);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

function segmentoAtravessa(r: Retangulo, a: Ponto, b: Ponto): boolean {
  if (contem(r, a.x, a.y) || contem(r, b.x, b.y)) return true;
  const c = [
    { x: r.x, y: r.y },
    { x: r.x + r.w, y: r.y },
    { x: r.x + r.w, y: r.y + r.h },
    { x: r.x, y: r.y + r.h },
  ];
  return c.some((p, i) => segmentosCruzam(a, b, p, c[(i + 1) % 4]));
}

/** Ponto do card onde a linha chega: base ou topo (se o ponto está abaixo/acima), senão a lateral. */
function pontoDeEncaixe(r: Retangulo, ax: number, ay: number): Ponto {
  const meio = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
  if (ay >= r.y + r.h) return { x: meio(ax, r.x + r.w * 0.25, r.x + r.w * 0.75), y: r.y + r.h };
  if (ay <= r.y) return { x: meio(ax, r.x + r.w * 0.25, r.x + r.w * 0.75), y: r.y };
  return { x: ax < r.x ? r.x : r.x + r.w, y: r.y + r.h / 2 };
}

interface Resultado<K> {
  posicoes: Map<K, Posicionado | null>;
  visiveis: number;
  custoTotal: number;
}

interface Colocado {
  r: Retangulo;
  linha: [Ponto, Ponto];
}

/**
 * Melhor posição livre para o card `e`, dados os cards já colocados (`outros`). `null` se nenhuma
 * posição respeita as regras rígidas.
 */
function melhorPosicao<K>(
  e: EntradaDisposicao<K>,
  outros: Colocado[],
  todas: EntradaDisposicao<K>[],
  opcoes: OpcoesDisposicao<K>
): { r: Retangulo; encaixe: Ponto; custo: number } | null {
  const { largura, limiteInferior, reservadas = [], carro, anteriores, folga = FOLGA_PADRAO } = opcoes;
  const ponto = { x: e.ax, y: e.ay };
  const anterior = anteriores?.get(e.chave);
  let melhor: { r: Retangulo; encaixe: Ponto; custo: number } | null = null;

  for (const raio of RAIOS) {
    for (const { cos, sin } of DIRECOES) {
      const r: Retangulo = { x: e.ax + raio * cos - e.w / 2, y: e.ay + raio * sin - e.h / 2, w: e.w, h: e.h };

      // Regras rígidas
      if (r.x < BORDA || r.x + r.w > largura - BORDA || r.y < BORDA || r.y + r.h > limiteInferior) continue;
      if (contem(r, e.ax, e.ay, 6)) continue;
      if (outros.some((o) => sobrepoe(r, o.r, folga))) continue;
      if (reservadas.some((c) => sobrepoe(r, c, folga))) continue;

      const encaixe = pontoDeEncaixe(r, e.ax, e.ay);
      let custo = Math.hypot(encaixe.x - e.ax, encaixe.y - e.ay) * CUSTO.distancia;
      if (sin > 0.1) custo += CUSTO.abaixoDoPonto;
      if (carro) custo += fracaoSobre(r, carro) * CUSTO.sobreCarro;
      for (const outra of todas) {
        if (outra !== e && contem(r, outra.ax, outra.ay, 12)) custo += CUSTO.cobrePonto;
      }
      for (const o of outros) {
        if (segmentoAtravessa(o.r, ponto, encaixe)) custo += CUSTO.linhaAtravessaCard;
        if (segmentoAtravessa(r, o.linha[0], o.linha[1])) custo += CUSTO.cardCobreLinha;
        if (segmentosCruzam(ponto, encaixe, o.linha[0], o.linha[1])) custo += CUSTO.linhaCruzaLinha;
      }
      if (anterior) {
        const afastamento = Math.hypot(r.x - anterior.bx, r.y - anterior.by);
        custo += afastamento * CUSTO.estabilidade;
        if (afastamento < 4) custo -= CUSTO.trocarPosicao;
      }

      if (!melhor || custo < melhor.custo) melhor = { r, encaixe, custo };
    }
  }
  return melhor;
}

const RODADAS_DE_REFINAMENTO = 3;

/**
 * Posiciona os cards um a um, na ordem dada (escolha gulosa), e depois refina: em cada rodada,
 * cada card reavalia sua posição conhecendo a de todos os outros e muda se achar uma melhor.
 * Isso desfaz pares trocados e linhas cruzadas que a escolha gulosa deixa. Cards que ficaram
 * sem lugar ganham nova chance a cada rodada.
 */
function disporNaOrdem<K>(ordem: EntradaDisposicao<K>[], todas: EntradaDisposicao<K>[], opcoes: OpcoesDisposicao<K>): Resultado<K> {
  const colocados = new Map<K, Colocado & { encaixe: Ponto; custo: number }>();
  const outrosQue = (chave: K) => Array.from(colocados.entries()).filter(([k]) => k !== chave).map(([, c]) => c);

  const posicionar = (e: EntradaDisposicao<K>) => {
    const m = melhorPosicao(e, outrosQue(e.chave), todas, opcoes);
    if (m) colocados.set(e.chave, { r: m.r, linha: [{ x: e.ax, y: e.ay }, m.encaixe], encaixe: m.encaixe, custo: m.custo });
    else colocados.delete(e.chave);
  };

  for (const e of ordem) posicionar(e);

  for (let rodada = 0; rodada < RODADAS_DE_REFINAMENTO; rodada++) {
    let mudou = false;
    for (const e of ordem) {
      const antes = colocados.get(e.chave);
      const m = melhorPosicao(e, outrosQue(e.chave), todas, opcoes);
      if (!m) continue; // mantém onde está (ou continua oculto)
      if (!antes || m.custo < antes.custo - 1) {
        colocados.set(e.chave, { r: m.r, linha: [{ x: e.ax, y: e.ay }, m.encaixe], encaixe: m.encaixe, custo: m.custo });
        mudou = true;
      } else {
        // Recalcula o custo atual com os vizinhos novos, para a comparação entre ordens ser justa
        antes.custo = Math.min(antes.custo, m.custo);
      }
    }
    if (!mudou) break;
  }

  const posicoes = new Map<K, Posicionado | null>();
  let custoTotal = 0;
  for (const e of ordem) {
    const c = colocados.get(e.chave);
    if (!c) {
      posicoes.set(e.chave, null);
      continue;
    }
    custoTotal += c.custo;
    posicoes.set(e.chave, { bx: c.r.x, by: c.r.y, dx: c.encaixe.x - c.r.x, dy: c.encaixe.y - c.r.y });
  }
  return { posicoes, visiveis: colocados.size, custoTotal };
}

/**
 * Tenta algumas ordens de escolha (quem escolhe primeiro pega o melhor lugar) e fica com a que
 * deixa mais cards visíveis; no empate, a de menor custo total. Card em foco escolhe sempre
 * primeiro e zonas escondidas sempre por último.
 */
export function disporMarcadores<K>(
  entradas: EntradaDisposicao<K>[],
  opcoes: OpcoesDisposicao<K>
): Map<K, Posicionado | null> {
  const camada = (e: EntradaDisposicao<K>) => (e.ativo ? 0 : e.atras ? 2 : 1);
  const cx = opcoes.largura / 2;
  const criterios: ((a: EntradaDisposicao<K>, b: EntradaDisposicao<K>) => number)[] = [
    (a, b) => a.ax - b.ax,
    (a, b) => b.ax - a.ax,
    (a, b) => a.ay - b.ay,
    (a, b) => b.ay - a.ay,
    (a, b) => Math.abs(a.ax - cx) - Math.abs(b.ax - cx),
    (a, b) => Math.abs(b.ax - cx) - Math.abs(a.ax - cx),
  ];
  const avaliar = (i: number) =>
    disporNaOrdem([...entradas].sort((a, b) => camada(a) - camada(b) || criterios[i](a, b)), entradas, opcoes);

  // A ordem vencedora do quadro anterior é a referência; outra só a substitui se deixar mais cards
  // visíveis ou for claramente mais barata.
  const anterior = opcoes.memoria?.ordem ?? 0;
  let melhorIndice = anterior;
  let melhor = avaliar(anterior);
  const explorar = opcoes.explorarOrdens ?? true;
  for (let i = 0; i < criterios.length && explorar; i++) {
    if (i === anterior) continue;
    const r = avaliar(i);
    if (r.visiveis > melhor.visiveis || (r.visiveis === melhor.visiveis && r.custoTotal < melhor.custoTotal * 0.85)) {
      melhor = r;
      melhorIndice = i;
    }
  }
  if (opcoes.memoria) opcoes.memoria.ordem = melhorIndice;
  return melhor.posicoes;
}

export interface CardExibido<K> extends Retangulo {
  chave: K;
  /** Maior prioridade fica parado; o de menor prioridade é que se afasta. */
  prioridade: number;
}

/**
 * Garantia na tela: afasta cards que estejam encostando nas posições EXIBIDAS (com a suavização e
 * a flutuação aplicadas). As posições-alvo da disposição já não se sobrepõem, mas no caminho entre
 * duas posições um card pode cruzar outro; este passo impede o encontro também durante o movimento.
 * Modifica os retângulos recebidos. Se ainda restar contato (cards espremidos contra a borda),
 * devolve as chaves dos cards de menor prioridade que devem ficar ocultos neste quadro.
 */
export function separarCards<K>(
  cards: CardExibido<K>[],
  folga: number,
  largura: number,
  limiteInferior: number
): Set<K> {
  for (let iteracao = 0; iteracao < 6; iteracao++) {
    let mexeu = false;
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const a = cards[i];
        const b = cards[j];
        const px = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) + folga;
        const py = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) + folga;
        if (px <= 0 || py <= 0) continue;
        mexeu = true;
        // Quem se move: o de menor prioridade inteiro; empate, metade cada
        const [fixo, movel, fracao] = a.prioridade > b.prioridade ? [a, b, 1] : b.prioridade > a.prioridade ? [b, a, 1] : [a, b, 0.5];
        if (px < py) {
          const sinal = movel.x + movel.w / 2 >= fixo.x + fixo.w / 2 ? 1 : -1;
          movel.x += sinal * px * fracao;
          if (fracao < 1) fixo.x -= sinal * px * fracao;
        } else {
          const sinal = movel.y + movel.h / 2 >= fixo.y + fixo.h / 2 ? 1 : -1;
          movel.y += sinal * py * fracao;
          if (fracao < 1) fixo.y -= sinal * py * fracao;
        }
      }
    }
    for (const c of cards) {
      c.x = Math.min(Math.max(c.x, BORDA), Math.max(BORDA, largura - c.w - BORDA));
      c.y = Math.min(Math.max(c.y, BORDA), Math.max(BORDA, limiteInferior - c.h));
    }
    if (!mexeu) break;
  }

  // Último recurso: o que ainda encosta, some (o de menor prioridade), em vez de sobrepor
  const ocultos = new Set<K>();
  const porPrioridade = [...cards].sort((a, b) => b.prioridade - a.prioridade);
  const mantidos: CardExibido<K>[] = [];
  for (const c of porPrioridade) {
    if (mantidos.some((m) => sobrepoe(c, m))) ocultos.add(c.chave);
    else mantidos.push(c);
  }
  return ocultos;
}
