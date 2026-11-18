'use client';

import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './Catalogo.module.css';

export interface ItemCatalogo {
  codigo: string;
  resumo: string;
  amparo: string;
  gravidade: string;
}

export interface GrupoCatalogo {
  artigo: string;
  itens: ItemCatalogo[];
}

const COR: Record<string, string> = {
  Gravíssima: styles.gravissima,
  Grave: styles.grave,
  Média: styles.media,
  Leve: styles.leve,
};

/** Minúsculas, sem acentos, pontuação vira espaço. */
function normalizar(t: string): string {
  return t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Números e algarismos romanos curtos casam com a palavra inteira (XVI não acha XVII); o resto, pelo começo. */
const EXATO = /^(\d{1,3}|[ivxl]{1,5})$/;

function palavrasDe(item: ItemCatalogo): string[] {
  const codigo = item.codigo.replace('-', '');
  return normalizar(`${item.codigo} ${codigo} ${item.resumo} ${item.amparo} ${item.gravidade}`).split(' ');
}

export function Catalogo({ grupos, total }: { grupos: GrupoCatalogo[]; total: number }) {
  const [consulta, setConsulta] = useState('');
  const campo = useRef<HTMLInputElement>(null);

  // A busca fica no endereço (?q=), para o "voltar" da ficha devolver a mesma lista
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setConsulta(q);
  }, []);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (consulta) url.searchParams.set('q', consulta);
    else url.searchParams.delete('q');
    window.history.replaceState(window.history.state, '', url);
  }, [consulta]);

  // "/" leva à busca no computador
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== campo.current) {
        e.preventDefault();
        campo.current?.focus();
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  const indice = useMemo(
    () => grupos.flatMap((g) => g.itens.map((item) => ({ item, palavras: palavrasDe(item) }))),
    [grupos],
  );

  const resultado = useMemo(() => {
    const termos = normalizar(consulta).split(' ').filter(Boolean);
    if (!termos.length) return null;
    return indice
      .filter(({ palavras }) =>
        termos.every((t) => palavras.some((p) => (EXATO.test(t) ? p === t : p.startsWith(t)))),
      )
      .map(({ item }) => item);
  }, [consulta, indice]);

  return (
    <div className={styles.catalogo}>
      <div className={styles.barraBusca}>
        <label className={styles.busca}>
          <Search aria-hidden size={20} />
          <input
            ref={campo}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Código, artigo ou palavra (ex.: 230 XVI, película)"
            aria-label="Buscar ficha"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
          />
          {consulta && (
            <button type="button" className={styles.limpar} onClick={() => setConsulta('')} aria-label="Limpar busca">
              <X size={18} />
            </button>
          )}
        </label>
        <p className={styles.contagem} aria-live="polite">
          {resultado ? `${resultado.length} de ${total} fichas` : `${total} fichas`}
        </p>
      </div>

      {resultado ? (
        resultado.length ? (
          <ul className={styles.lista}>
            {resultado.map((item) => (
              <Linha key={item.codigo} item={item} />
            ))}
          </ul>
        ) : (
          <p className={styles.vazio}>Nenhuma ficha encontrada.</p>
        )
      ) : (
        grupos.map((g) => (
          <section key={g.artigo} className={styles.grupo} aria-labelledby={`art-${g.artigo}`}>
            <h2 id={`art-${g.artigo}`}>Art. {g.artigo}</h2>
            <ul className={styles.lista}>
              {g.itens.map((item) => (
                <Linha key={item.codigo} item={item} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

function Linha({ item }: { item: ItemCatalogo }) {
  return (
    <li>
      <Link href={`/fichas/${item.codigo}`} className={styles.linha}>
        <span className={`${styles.codigo} ${COR[item.gravidade] ?? ''}`}>{item.codigo}</span>
        <span className={styles.resumo}>{item.resumo}</span>
        <span className={styles.amparo}>{item.amparo.replace(/\.$/, '')}</span>
      </Link>
    </li>
  );
}
