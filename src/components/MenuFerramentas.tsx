'use client';

import Link from 'next/link';
import { Calculator, ChevronDown, Wrench } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FERRAMENTAS } from '@/lib/ferramentas';
import styles from './MenuFerramentas.module.css';

/** Botão "Ferramentas" do cabeçalho: abre a lista das ferramentas de apoio (ex.: calculadora roda/pneu). */
export function MenuFerramentas() {
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAberto(false);
        botao.current?.focus();
      }
    };
    document.addEventListener('pointerdown', fora);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('pointerdown', fora);
      document.removeEventListener('keydown', tecla);
    };
  }, [aberto]);

  return (
    <div className={styles.caixa} ref={caixa}>
      <button
        ref={botao}
        type="button"
        className={styles.botao}
        aria-expanded={aberto}
        aria-controls="menu-ferramentas"
        aria-label="Ferramentas"
        onClick={() => setAberto((a) => !a)}
      >
        <Wrench aria-hidden size={18} />
        <span className={styles.rotulo}>Ferramentas</span>
        <ChevronDown aria-hidden size={16} className={styles.seta} />
      </button>
      {aberto && (
        <div id="menu-ferramentas" className={styles.painel}>
          <p className={styles.titulo}>Ferramentas de apoio</p>
          <ul>
            {FERRAMENTAS.map((f) => (
              <li key={f.href}>
                <Link href={f.href} onClick={() => setAberto(false)}>
                  <Calculator aria-hidden size={20} />
                  <span>
                    <strong>{f.titulo}</strong>
                    <small>{f.descricao}</small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
