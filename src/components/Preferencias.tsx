'use client';

import { ALargeSmall, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styles from './Preferencias.module.css';

type Ref = 'codigo' | 'artigo';
type Fonte = '0' | '1' | '2';
type Tema = 'auto' | 'claro' | 'escuro';

const TEMAS: { valor: Tema; rotulo: string }[] = [
  { valor: 'auto', rotulo: 'Automático' },
  { valor: 'claro', rotulo: 'Claro' },
  { valor: 'escuro', rotulo: 'Escuro' },
];

const FONTES: { valor: Fonte; rotulo: string; descricao: string }[] = [
  { valor: '0', rotulo: 'A', descricao: 'Normal' },
  { valor: '1', rotulo: 'A+', descricao: 'Grande' },
  { valor: '2', rotulo: 'A++', descricao: 'Maior' },
];

/**
 * Lido no <head> antes da página aparecer (sem piscar): aplica as preferências guardadas.
 * `data-ref` troca código ↔ artigo em todo o site só com CSS; `data-fonte` amplia o conteúdo.
 */
export const SCRIPT_PREFERENCIAS = `try{var d=document.documentElement,r=localStorage.getItem('mbft_ref'),f=localStorage.getItem('mbft_fonte'),t=localStorage.getItem('mbft_tema');if(r==='artigo')d.dataset.ref='artigo';if(f==='1'||f==='2')d.dataset.fonte=f;if(t==='claro'||t==='escuro')d.dataset.tema=t;}catch(e){}`;

function aplicar(ref: Ref, fonte: Fonte, tema: Tema) {
  const d = document.documentElement;
  if (tema === 'auto') delete d.dataset.tema;
  else d.dataset.tema = tema;
  if (ref === 'artigo') d.dataset.ref = 'artigo';
  else delete d.dataset.ref;
  if (fonte === '0') delete d.dataset.fonte;
  else d.dataset.fonte = fonte;
  try {
    localStorage.setItem('mbft_ref', ref);
    localStorage.setItem('mbft_fonte', fonte);
    localStorage.setItem('mbft_tema', tema);
  } catch {
    // navegador sem armazenamento: vale só nesta visita
  }
}

function Alternador({ atual, mudar, compacto }: { atual: Ref; mudar: (r: Ref) => void; compacto?: boolean }) {
  return (
    <div className={styles.alternador} role="group" aria-label="Guiar por">
      <button type="button" aria-pressed={atual === 'codigo'} onClick={() => mudar('codigo')}>
        {compacto ? 'Código da ficha' : 'Nº da ficha'}
      </button>
      <button type="button" aria-pressed={atual === 'artigo'} onClick={() => mudar('artigo')}>
        {compacto ? 'Artigo do CTB' : 'Artigo'}
      </button>
    </div>
  );
}

/** Preferências de leitura no cabeçalho: guiar por código ou artigo, tamanho do texto e tema (claro, escuro ou do aparelho). */
export function Preferencias() {
  const [ref, setRef] = useState<Ref>('codigo');
  const [fonte, setFonte] = useState<Fonte>('0');
  const [tema, setTema] = useState<Tema>('auto');
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = document.documentElement;
    setRef(d.dataset.ref === 'artigo' ? 'artigo' : 'codigo');
    setFonte((d.dataset.fonte as Fonte) ?? '0');
    setTema((d.dataset.tema as Tema) ?? 'auto');
    const fora = (e: PointerEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener('pointerdown', fora);
    return () => document.removeEventListener('pointerdown', fora);
  }, []);

  const mudarRef = (r: Ref) => {
    setRef(r);
    aplicar(r, fonte, tema);
  };
  const mudarFonte = (f: Fonte) => {
    setFonte(f);
    aplicar(ref, f, tema);
  };
  const mudarTema = (t: Tema) => {
    setTema(t);
    aplicar(ref, fonte, t);
  };

  return (
    <div className={styles.preferencias} ref={caixa}>
      {/* No computador, a troca código ↔ artigo fica à vista */}
      <div className={styles.soPc}>
        <Alternador atual={ref} mudar={mudarRef} />
      </div>
      <button
        type="button"
        className={styles.botao}
        aria-expanded={aberto}
        aria-controls="painel-preferencias"
        aria-label="Preferências de leitura: guiar por código ou artigo, tamanho do texto e tema"
        onClick={() => setAberto((a) => !a)}
      >
        <ALargeSmall aria-hidden size={20} />
      </button>
      {aberto && (
        <div id="painel-preferencias" className={styles.painel}>
          <p className={styles.titulo}>Guiar por</p>
          <Alternador atual={ref} mudar={mudarRef} compacto />
          <p className={styles.dica}>
            {ref === 'artigo'
              ? 'Listas, mapas e fichas mostram primeiro o artigo do CTB.'
              : 'Listas, mapas e fichas mostram primeiro o código da ficha.'}
          </p>
          <p className={styles.titulo}>Tamanho do texto</p>
          <div className={styles.fontes} role="group" aria-label="Tamanho do texto">
            {FONTES.map((f) => (
              <button
                key={f.valor}
                type="button"
                aria-pressed={fonte === f.valor}
                aria-label={`Texto ${f.descricao.toLowerCase()}`}
                onClick={() => mudarFonte(f.valor)}
                className={styles[`fonte${f.valor}`]}
              >
                {f.rotulo}
                {fonte === f.valor && <Check aria-hidden size={14} />}
              </button>
            ))}
          </div>
          <p className={styles.titulo}>Tema</p>
          <div className={styles.temas} role="group" aria-label="Tema">
            {TEMAS.map((t) => (
              <button key={t.valor} type="button" aria-pressed={tema === t.valor} onClick={() => mudarTema(t.valor)}>
                {t.rotulo}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
