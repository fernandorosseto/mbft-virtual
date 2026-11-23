'use client';

import { ArrowLeftRight, Check, Copy, RotateCcw, TriangleAlert, X } from 'lucide-react';
import { useState } from 'react';
import styles from './CalculadoraRodaPneu.module.css';

/**
 * Conferência do conjunto roda/pneu (Res. CONTRAN nº 916/2022, art. 10, II): diâmetro externo do
 * instalado contra o original, tolerância de ± 3%. Medida métrica (largura/perfil R aro) ou em
 * polegadas (diâmetro x largura R aro, ex.: 33x12.50R15). Tudo no navegador, sem rede.
 */

type Unidade = 'mm' | 'pol';

interface Entrada {
  unidade: Unidade;
  /** mm: largura (mm); pol: diâmetro (pol) */
  a: string;
  /** mm: perfil (%); pol: largura (pol) */
  b: string;
  /** aro (pol) */
  r: string;
}

interface Pneu {
  /** diâmetro externo, largura e altura do flanco em mm; aro em polegadas */
  d: number;
  w: number;
  flanco: number;
  aro: number;
  rotulo: string;
}

const POL = 25.4;
const num = (t: string) => parseFloat(t.replace(',', '.'));
const f0 = (n: number) => Math.round(n).toLocaleString('pt-BR');
const f1 = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const f2 = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const sinal = (n: number, f: (n: number) => string) => (n > 0 ? '+' : n < 0 ? '−' : '') + f(Math.abs(n));
const mmPol = (mm: number) => `${f0(mm)} mm · ${f1(mm / POL)}"`;
const rotuloPol = (n: number) => String(n).replace('.', ',');

function lerPneu(e: Entrada): Pneu | null {
  const a = num(e.a);
  const b = num(e.b);
  const aro = num(e.r);
  if (!(a > 0 && b > 0 && aro > 0)) return null;
  if (e.unidade === 'mm') {
    // largura em mm, perfil em %
    if (a < 100 || a > 455 || b < 20 || b > 95 || aro < 10 || aro > 30) return null;
    const flanco = (a * b) / 100;
    return { d: aro * POL + 2 * flanco, w: a, flanco, aro, rotulo: `${a}/${b} R${rotuloPol(aro)}` };
  }
  // em polegadas: diâmetro x largura R aro
  if (a < 20 || a > 48 || b < 5 || b > 20 || aro < 12 || aro > 26 || a <= aro) return null;
  const d = a * POL;
  return {
    d,
    w: b * POL,
    flanco: (d - aro * POL) / 2,
    aro,
    rotulo: `${rotuloPol(a)}x${rotuloPol(b)} R${rotuloPol(aro)}`,
  };
}

const CHECKLIST = [
  {
    id: 'c1',
    texto: 'Conjunto roda/pneu ultrapassa os limites externos dos para-lamas.',
    ref: 'Art. 10, I, “a”',
    resumo: 'Ultrapassa os para-lamas (art. 10, I, a)',
  },
  {
    id: 'c2',
    texto:
      'Conjunto toca ou pode tocar carroceria, suspensão ou outra parte do veículo (esterçamento máximo para os dois lados, curso máximo e mínimo da suspensão).',
    ref: 'Art. 10, I, “b”',
    resumo: 'Contato com o veículo (art. 10, I, b)',
  },
  {
    id: 'c3',
    texto: 'Diâmetro externo fora dos ± 3% do original (marcado pela calculadora).',
    ref: 'Art. 10, II',
    resumo: 'Diâmetro fora dos ± 3% (art. 10, II)',
  },
  {
    id: 'c4',
    texto:
      'Extensão de para-lama (alargadores) que não abriga o conjunto, permite projeção de detritos ou não atende a Res. CONTRAN nº 888/2021.',
    ref: 'Art. 10, § 3º',
    resumo: 'Extensão de para-lama irregular (art. 10, § 3º)',
  },
  {
    id: 'c5',
    texto:
      'Suspensão alterada (PBT até 3.500 kg) com altura livre menor que 100 mm, contato no esterçamento ou altura livre não anotada no CRLV-e.',
    ref: 'Art. 8º, I, “b” e “c”, e § 1º',
    resumo: 'Suspensão irregular (art. 8º)',
  },
  {
    id: 'c6',
    texto: 'Modificação sem autorização prévia do órgão de trânsito.',
    ref: 'Art. 4º, I; art. 17, I (art. 230, VII, do CTB)',
    resumo: 'Sem autorização prévia (art. 4º, I)',
  },
] as const;

type IdItem = (typeof CHECKLIST)[number]['id'];

function CampoPneu({
  titulo,
  valor,
  aoMudar,
  pneu,
}: {
  titulo: string;
  valor: Entrada;
  aoMudar: (e: Entrada) => void;
  pneu: Pneu | null;
}) {
  const mm = valor.unidade === 'mm';
  const trocar = (unidade: Unidade) =>
    aoMudar(unidade === 'mm' ? { unidade, a: '265', b: '70', r: '17' } : { unidade, a: '31', b: '10.5', r: '15' });
  return (
    <fieldset className={styles.pneu}>
      <legend>{titulo}</legend>
      <div className={styles.unidade} role="group" aria-label={`Unidade do pneu ${titulo.toLowerCase()}`}>
        <button type="button" aria-pressed={mm} onClick={() => trocar('mm')}>
          Métrico
        </button>
        <button type="button" aria-pressed={!mm} onClick={() => trocar('pol')}>
          Polegadas
        </button>
      </div>
      <div className={`${styles.medida} ${pneu ? '' : styles.invalida}`}>
        <input
          inputMode="decimal"
          aria-label={mm ? 'Largura (mm)' : 'Diâmetro (pol)'}
          value={valor.a}
          onChange={(e) => aoMudar({ ...valor, a: e.target.value })}
          onFocus={(e) => e.target.select()}
        />
        <span aria-hidden>{mm ? '/' : 'x'}</span>
        <input
          inputMode="decimal"
          aria-label={mm ? 'Perfil (%)' : 'Largura (pol)'}
          value={valor.b}
          onChange={(e) => aoMudar({ ...valor, b: e.target.value })}
          onFocus={(e) => e.target.select()}
        />
        <span aria-hidden>R</span>
        <input
          inputMode="decimal"
          aria-label="Aro (pol)"
          value={valor.r}
          onChange={(e) => aoMudar({ ...valor, r: e.target.value })}
          onFocus={(e) => e.target.select()}
        />
      </div>
      <div className={styles.legendas} aria-hidden>
        <span>{mm ? 'largura (mm)' : 'diâmetro (pol)'}</span>
        <i>{mm ? '/' : 'x'}</i>
        <span>{mm ? 'perfil (%)' : 'largura (pol)'}</span>
        <i>R</i>
        <span>aro (pol)</span>
      </div>
      <p className={`${styles.dica} ${pneu ? '' : styles.erro}`} aria-live="polite">
        {pneu ? `${pneu.rotulo} · Ø ${mmPol(pneu.d)}` : 'Medida não reconhecida'}
      </p>
    </fieldset>
  );
}

/** Célula com mm e, embaixo, polegadas. */
function MmPol({ mm }: { mm: number }) {
  return (
    <td>
      {f0(mm)} mm<small>{f1(mm / POL)}&quot;</small>
    </td>
  );
}

function Desenho({ pneu, escala, legenda }: { pneu: Pneu; escala: number; legenda: string }) {
  const R = (pneu.d / 2) * escala;
  const r = ((pneu.aro * POL) / 2) * escala;
  const s = Math.ceil(R * 2 + 4);
  return (
    <figure>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden>
        <circle cx={s / 2} cy={s / 2} r={R} className={styles.borracha} />
        <circle cx={s / 2} cy={s / 2} r={r} className={styles.roda} />
        <circle cx={s / 2} cy={s / 2} r={r * 0.25} className={styles.cubo} />
      </svg>
      <figcaption>{legenda}</figcaption>
    </figure>
  );
}

export function CalculadoraRodaPneu() {
  const [original, setOriginal] = useState<Entrada>({ unidade: 'mm', a: '265', b: '70', r: '17' });
  const [instalado, setInstalado] = useState<Entrada>({ unidade: 'mm', a: '265', b: '40', r: '23' });
  const [jipe, setJipe] = useState(false);
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});
  const [aviso, setAviso] = useState('');

  const o = lerPneu(original);
  const i = lerPneu(instalado);

  // Conta barata: refeita a cada digitação
  const r = (() => {
    if (!o || !i) return null;
    const dif = i.d - o.d;
    const pct = (dif / o.d) * 100;
    const min = o.d * 0.97;
    const max = o.d * 1.03;
    const dentro = Math.abs(pct) <= 3 + 1e-9;
    // Medidas no aro instalado dentro da faixa
    const metricas: { rotulo: string; pct: number; e: Entrada }[] = [];
    for (let w = 155; w <= 355; w += 10) {
      for (const a of [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85]) {
        const d = i.aro * POL + (2 * w * a) / 100;
        const p = ((d - o.d) / o.d) * 100;
        if (Math.abs(p) <= 3)
          metricas.push({
            rotulo: `${w}/${a}R${rotuloPol(i.aro)}`,
            pct: p,
            e: { unidade: 'mm', a: String(w), b: String(a), r: String(i.aro) },
          });
      }
    }
    metricas.sort((x, y) => Math.abs(x.pct) - Math.abs(y.pct));
    // Em polegadas o diâmetro é o primeiro número: a largura não muda a conta (um botão por diâmetro)
    const larguraPol = instalado.unidade === 'pol' ? instalado.b : '10.5';
    const polegadas: typeof metricas = [];
    for (let D = Math.ceil(i.aro + 6); D <= 44; D++) {
      const p = ((D * POL - o.d) / o.d) * 100;
      if (Math.abs(p) <= 3)
        polegadas.push({
          rotulo: `${D}" (${D}x…R${rotuloPol(i.aro)})`,
          pct: p,
          e: { unidade: 'pol', a: String(D), b: larguraPol, r: String(i.aro) },
        });
    }
    return { dif, pct, min, max, dentro, metricas: metricas.slice(0, 18), polegadas: polegadas.slice(0, 14) };
  })();

  // O item do diâmetro é marcado pela própria conta (no jipe, não se aplica)
  const marcado = (id: IdItem) => (id === 'c3' ? !!r && !jipe && !r.dentro : !!marcados[id]);
  const irregulares = CHECKLIST.filter((c) => marcado(c.id));

  const copiar = async () => {
    if (!o || !i || !r) {
      setAviso('Informe as duas medidas primeiro.');
      return;
    }
    const texto = [
      'Conferência roda/pneu (Res. CONTRAN nº 916/2022, art. 10)',
      `Original: ${o.rotulo} (Ø ${mmPol(o.d)})`,
      `Instalado: ${i.rotulo} (Ø ${mmPol(i.d)})`,
      `Diferença: ${sinal(r.dif, f0)} mm (${sinal(r.pct, f2)}%); faixa de ± 3%: ${f0(r.min)} a ${f0(r.max)} mm`,
      jipe
        ? 'Misto, utilitário, carroçaria jipe: exceção do art. 10, § 2º (limite de diâmetro do fabricante).'
        : r.dentro
          ? 'Diâmetro dentro da tolerância de ± 3% (art. 10, II).'
          : 'Diâmetro FORA da tolerância de ± 3% (art. 10, II).',
      irregulares.length
        ? `Irregularidades marcadas:\n${irregulares.map((c) => `- ${c.resumo}`).join('\n')}`
        : 'Nenhuma irregularidade marcada.',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(texto);
      setAviso('Resumo copiado.');
    } catch {
      setAviso('Não foi possível copiar neste navegador.');
    }
  };

  const posicao = (p: number) => Math.max(0, Math.min(100, ((p + 5) / 10) * 100));
  const escala = o && i ? 132 / Math.max(o.d, i.d) : 1;

  return (
    <div className={styles.calc}>
      <section className={styles.cartao}>
        <h2>Medidas</h2>
        <div className={styles.pneus}>
          <CampoPneu titulo="Original de fábrica" valor={original} aoMudar={setOriginal} pneu={o} />
          <CampoPneu titulo="Instalado no veículo" valor={instalado} aoMudar={setInstalado} pneu={i} />
        </div>
        <button
          type="button"
          className={styles.inverter}
          onClick={() => {
            setOriginal(instalado);
            setInstalado(original);
          }}
        >
          <ArrowLeftRight aria-hidden size={16} /> Inverter
        </button>
        <label className={styles.jipe}>
          <input type="checkbox" checked={jipe} onChange={(e) => setJipe(e.target.checked)} />
          <span>
            <strong>Misto, tipo utilitário, carroçaria jipe</strong>
            <small>
              Art. 10, § 2º: não se aplica a tolerância de ± 3%; valem os limites de diâmetro fixados pelo fabricante.
            </small>
          </span>
        </label>
      </section>

      {!o || !i || !r ? (
        <div className={`${styles.veredito} ${styles.atencao}`} role="status">
          <p className={styles.grande}>Informe as duas medidas</p>
        </div>
      ) : (
        <>
          <div
            className={`${styles.veredito} ${jipe ? styles.atencao : r.dentro ? styles.ok : styles.fora}`}
            role="status"
            aria-live="polite"
          >
            <p className={styles.grande}>
              {jipe ? (
                <>
                  <TriangleAlert aria-hidden size={22} /> Exceção do art. 10, § 2º
                </>
              ) : r.dentro ? (
                <>
                  <Check aria-hidden size={22} /> Dentro da tolerância
                </>
              ) : (
                <>
                  <X aria-hidden size={22} /> Fora da tolerância de ± 3%
                </>
              )}
            </p>
            <p className={styles.pct}>{sinal(r.pct, f2)}%</p>
            <p className={styles.explica}>
              {jipe
                ? `Misto, utilitário, carroçaria jipe não se sujeita aos ± 3%. Conferir se o diâmetro de ${mmPol(i.d)} está dentro do limite fixado pelo fabricante.`
                : r.dentro
                  ? `Diâmetro instalado ${mmPol(i.d)}; faixa permitida de ${f0(r.min)} a ${f0(r.max)} mm (art. 10, II). Conferir também para-lamas e contato (inciso I).`
                  : `Diâmetro instalado ${mmPol(i.d)}; faixa permitida de ${f0(r.min)} a ${f0(r.max)} mm. Passa ${f0(r.dif > 0 ? i.d - r.max : r.min - i.d)} mm do limite (art. 10, II).`}
            </p>
          </div>

          <section className={styles.cartao}>
            <h2>Diâmetro externo e tolerância</h2>
            <div className={styles.faixa} aria-hidden>
              <span className={styles.marcaZero} style={{ left: `${posicao(0)}%` }} />
              <span className={styles.rotulo} style={{ left: '20%' }}>
                −3%
              </span>
              <span className={styles.rotulo} style={{ left: '50%' }}>
                0
              </span>
              <span className={styles.rotulo} style={{ left: '80%' }}>
                +3%
              </span>
              <span
                className={`${styles.marca} ${r.dentro || jipe ? styles.marcaOk : styles.marcaFora}`}
                style={{ left: `${posicao(r.pct)}%` }}
              />
            </div>
            <div className={styles.rolagem}>
              <table className={styles.tabela}>
                <thead>
                  <tr>
                    <th scope="col" />
                    <th scope="col">Original</th>
                    <th scope="col">Instalado</th>
                    <th scope="col">Diferença</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Diâmetro externo</th>
                    <MmPol mm={o.d} />
                    <MmPol mm={i.d} />
                    <td>
                      {sinal(r.dif, f0)} mm<small>{sinal(r.dif / POL, f1)}&quot;</small>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Largura</th>
                    <MmPol mm={o.w} />
                    <MmPol mm={i.w} />
                    <td>{sinal(i.w - o.w, f0)} mm</td>
                  </tr>
                  <tr>
                    <th scope="row">Altura do flanco</th>
                    <MmPol mm={o.flanco} />
                    <MmPol mm={i.flanco} />
                    <td>{sinal(i.flanco - o.flanco, f0)} mm</td>
                  </tr>
                  <tr>
                    <th scope="row">Aro</th>
                    <td>{rotuloPol(o.aro)}&quot;</td>
                    <td>{rotuloPol(i.aro)}&quot;</td>
                    <td>{sinal(i.aro - o.aro, (n) => rotuloPol(n))}&quot;</td>
                  </tr>
                  <tr>
                    <th scope="row">Circunferência</th>
                    <td>{f0(o.d * Math.PI)} mm</td>
                    <td>{f0(i.d * Math.PI)} mm</td>
                    <td>{sinal((i.d - o.d) * Math.PI, f0)} mm</td>
                  </tr>
                  <tr>
                    <th scope="row">Vão livre (eixo)</th>
                    <td>—</td>
                    <td>—</td>
                    <td>{sinal(r.dif / 2, f0)} mm</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={styles.desenhos}>
              <Desenho pneu={o} escala={escala} legenda="Original" />
              <Desenho pneu={i} escala={escala} legenda="Instalado" />
            </div>
          </section>

          <section className={styles.cartao}>
            <h2>Velocímetro</h2>
            <p className={styles.nota}>Velocidade real quando o painel (calibrado para o pneu original) indica:</p>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th scope="col">Indicado</th>
                  <th scope="col">Real</th>
                  <th scope="col">Diferença</th>
                </tr>
              </thead>
              <tbody>
                {[40, 60, 80, 100, 120].map((v) => {
                  const real = (v * i.d) / o.d;
                  return (
                    <tr key={v}>
                      <th scope="row">{v} km/h</th>
                      <td>{f1(real)} km/h</td>
                      <td>{sinal(real - v, f1)} km/h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section className={styles.cartao}>
            <h2>Medidas dentro dos ± 3% no aro {rotuloPol(i.aro)}</h2>
            <p className={styles.nota}>
              Diâmetro entre {f0(r.min)} e {f0(r.max)} mm. Toque numa medida para conferir como instalada.
            </p>
            {r.metricas.length + r.polegadas.length === 0 && <p>Nenhuma medida comum nesse aro cabe na faixa.</p>}
            {r.metricas.length > 0 && (
              <>
                <h3>Métricas</h3>
                <div className={styles.opcoes}>
                  {r.metricas.map((m) => (
                    <button key={m.rotulo} type="button" onClick={() => setInstalado(m.e)}>
                      <strong>{m.rotulo}</strong> {sinal(m.pct, f1)}%
                    </button>
                  ))}
                </div>
              </>
            )}
            {r.polegadas.length > 0 && (
              <>
                <h3>Em polegadas (a largura não muda o diâmetro)</h3>
                <div className={styles.opcoes}>
                  {r.polegadas.map((m) => (
                    <button key={m.rotulo} type="button" onClick={() => setInstalado(m.e)}>
                      <strong>{m.rotulo}</strong> {sinal(m.pct, f1)}%
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
        </>
      )}

      <section className={styles.cartao}>
        <h2>Checklist de fiscalização</h2>
        <p className={styles.nota}>Marque só o que estiver irregular.</p>
        <ul className={styles.checklist}>
          {CHECKLIST.map((c) => (
            <li key={c.id} className={marcado(c.id) ? styles.irregular : undefined}>
              <label>
                <input
                  type="checkbox"
                  checked={marcado(c.id)}
                  disabled={c.id === 'c3'}
                  onChange={(e) => setMarcados((m) => ({ ...m, [c.id]: e.target.checked }))}
                />
                <span>
                  {c.texto}
                  <small>{c.ref}</small>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <p className={`${styles.soma} ${irregulares.length ? styles.somaFora : styles.somaOk}`}>
          {irregulares.length
            ? `${irregulares.length} irregularidade${irregulares.length > 1 ? 's' : ''} marcada${irregulares.length > 1 ? 's' : ''}`
            : 'Nenhuma irregularidade marcada'}
        </p>
        <div className={styles.acoes}>
          <button type="button" className={styles.principal} onClick={copiar}>
            <Copy aria-hidden size={16} /> Copiar resumo
          </button>
          <button type="button" className={styles.secundario} onClick={() => setMarcados({})}>
            <RotateCcw aria-hidden size={16} /> Desmarcar tudo
          </button>
        </div>
        <p className={styles.dica} aria-live="polite">
          {aviso}
        </p>
      </section>
    </div>
  );
}
