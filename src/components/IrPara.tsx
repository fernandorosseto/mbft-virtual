'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, CornerDownLeft, Search, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { IndiceBusca } from '@/app/busca.json/route';
import { buscarFichas, buscarSecoes, carregarIndice } from '@/lib/busca';
import { QUERY_CELULAR, useMediaQuery } from '@/lib/useMediaQuery';
import styles from './BarraFicha.module.css';
import { Ref, RefOutra } from './Ref';

interface Sugestao {
  href: string;
  codigo?: string;
  artigo?: string;
  titulo: string;
  detalhe: string;
  secao?: boolean;
}

const MAX = 8;

/** Campo "ir para": sugere fichas e seções da parte geral enquanto digita. */
export function IrPara({ atual }: { atual?: string }) {
  const router = useRouter();
  const celular = useMediaQuery(QUERY_CELULAR);
  const lista = useId();
  const [consulta, setConsulta] = useState('');
  const [indice, setIndice] = useState<IndiceBusca | null>(null);
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(-1);
  const caixa = useRef<HTMLDivElement>(null);

  const carregar = () => {
    if (!indice) carregarIndice().then(setIndice, () => undefined);
  };

  // Fecha ao tocar fora
  useEffect(() => {
    const fora = (e: PointerEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener('pointerdown', fora);
    return () => document.removeEventListener('pointerdown', fora);
  }, []);

  const sugestoes = useMemo<Sugestao[]>(() => {
    if (!indice || !consulta.trim()) return [];
    const secoes: Sugestao[] = buscarSecoes(indice, consulta)
      .slice(0, 3)
      .map(([id, rotulo]) => ({ href: `/parte-geral#${id}`, titulo: rotulo, detalhe: 'Parte geral', secao: true }));
    const { titulo, texto } = buscarFichas(indice, consulta);
    const fichas: Sugestao[] = [...titulo, ...texto]
      .map((i) => indice.fichas[i])
      .filter(([codigo]) => codigo !== atual)
      .slice(0, MAX - secoes.length)
      .map(([codigo, resumo, , , artigo]) => ({
        href: `/fichas/${codigo}`,
        codigo,
        artigo,
        titulo: resumo,
        detalhe: '',
      }));
    return [...secoes, ...fichas];
  }, [indice, consulta, atual]);

  const ir = (href: string) => {
    setAberto(false);
    setConsulta('');
    router.push(href);
  };
  const todos = `/?q=${encodeURIComponent(consulta.trim())}`;

  return (
    <div className={styles.irPara} ref={caixa} data-fora-da-busca>
      <label className={styles.campo}>
        <Search aria-hidden size={19} />
        <input
          type="search"
          enterKeyHint="go"
          autoComplete="off"
          spellCheck={false}
          placeholder={celular ? 'Outra ficha' : 'Ir para outra ficha ou tema'}
          aria-label="Ir para outra ficha ou tema"
          role="combobox"
          aria-expanded={aberto && consulta.trim() !== ''}
          aria-controls={lista}
          aria-activedescendant={ativo >= 0 ? `${lista}-${ativo}` : undefined}
          value={consulta}
          onFocus={() => {
            carregar();
            setAberto(true);
          }}
          onChange={(e) => {
            setConsulta(e.target.value);
            setAberto(true);
            setAtivo(-1);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setAtivo((a) => Math.min(a + 1, sugestoes.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setAtivo((a) => Math.max(a - 1, -1));
            } else if (e.key === 'Enter' && consulta.trim()) {
              e.preventDefault();
              ir(sugestoes[Math.max(ativo, 0)]?.href ?? todos);
            } else if (e.key === 'Escape') {
              setAberto(false);
            }
          }}
        />
        {consulta && (
          <button type="button" className={styles.botao} onClick={() => setConsulta('')} aria-label="Limpar">
            <X size={18} />
          </button>
        )}
      </label>

      {aberto && consulta.trim() && (
        <div className={styles.sugestoes}>
          {!indice ? (
            <p className={styles.aviso}>Carregando…</p>
          ) : sugestoes.length === 0 ? (
            <p className={styles.aviso}>Nenhuma ficha ou tema encontrado.</p>
          ) : (
            <ul id={lista} role="listbox">
              {sugestoes.map((s, i) => (
                <li key={s.href} id={`${lista}-${i}`} role="option" aria-selected={i === ativo}>
                  <Link
                    href={s.href}
                    className={i === ativo ? styles.sugestaoAtiva : undefined}
                    onClick={() => {
                      setAberto(false);
                      setConsulta('');
                    }}
                  >
                    {s.secao ? (
                      <BookOpen aria-hidden size={16} className={styles.iconeSecao} />
                    ) : (
                      <b>
                        <Ref codigo={s.codigo ?? ''} artigo={s.artigo ?? ''} />
                      </b>
                    )}
                    <span className={styles.sugestaoTitulo}>{s.titulo}</span>
                    <span className={styles.sugestaoDetalhe}>
                      {s.secao ? s.detalhe : <RefOutra codigo={s.codigo ?? ''} artigo={s.artigo ?? ''} />}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href={todos} className={styles.todos} onClick={() => setAberto(false)}>
            <CornerDownLeft aria-hidden size={15} /> Ver todos os resultados no catálogo
          </Link>
        </div>
      )}
    </div>
  );
}
