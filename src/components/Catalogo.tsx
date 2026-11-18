'use client';

import Link from 'next/link';
import { List, Network, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { IndiceBusca } from '@/app/busca.json/route';
import { casa, normalizar, TERMO_EXATO } from '@/lib/texto';
import { MapaBusca } from './MapaBusca';
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

function palavrasDe(item: ItemCatalogo): string[] {
  const codigo = item.codigo.replace('-', '');
  return normalizar(`${item.codigo} ${codigo} ${item.resumo} ${item.amparo} ${item.gravidade}`).split(' ');
}

type Modo = 'lista' | 'mapa';

export function Catalogo({ grupos, total }: { grupos: GrupoCatalogo[]; total: number }) {
  const [consulta, setConsulta] = useState('');
  const [modo, setModo] = useState<Modo>('lista');
  const [indiceTexto, setIndiceTexto] = useState<IndiceBusca | null>(null);
  const [erroIndice, setErroIndice] = useState(false);
  const carregando = useRef(false);
  const campo = useRef<HTMLInputElement>(null);

  // Índice do texto completo (~100 KB): só é baixado quando a pessoa vai buscar
  const carregarIndice = useCallback(() => {
    if (carregando.current) return;
    carregando.current = true;
    fetch('/busca.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((dados: IndiceBusca) => setIndiceTexto(dados))
      .catch(() => {
        carregando.current = false;
        setErroIndice(true);
      });
  }, []);

  // A busca e o modo ficam no endereço (?q=&ver=mapa), para o "voltar" da ficha devolver a mesma tela
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) setConsulta(q);
    if (params.get('ver') === 'mapa') setModo('mapa');
  }, []);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (consulta) url.searchParams.set('q', consulta);
    else url.searchParams.delete('q');
    if (consulta && modo === 'mapa') url.searchParams.set('ver', 'mapa');
    else url.searchParams.delete('ver');
    window.history.replaceState(window.history.state, '', url);
    if (consulta) carregarIndice();
  }, [consulta, modo, carregarIndice]);

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

  const indiceTitulo = useMemo(
    () => grupos.flatMap((g) => g.itens.map((item) => ({ item, palavras: palavrasDe(item) }))),
    [grupos],
  );

  const resultado = useMemo(() => {
    const termos = normalizar(consulta).split(' ').filter(Boolean);
    if (!termos.length) return null;

    const titulo = indiceTitulo
      .filter(({ palavras }) => termos.every((t) => palavras.some((p) => casa(t, p))))
      .map(({ item }) => item);

    // No texto completo: todas as palavras buscadas na mesma ficha (termos de 1 ou 2 letras não contam)
    let texto: ItemCatalogo[] = [];
    if (indiceTexto && termos.every((t) => t.length >= 3 || TERMO_EXATO.test(t))) {
      let fichas: Set<number> | undefined;
      for (const t of termos) {
        const deste = new Set<number>();
        indiceTexto.palavras.forEach((p, i) => {
          if (casa(t, p)) indiceTexto.ocorrencias[i].forEach((f) => deste.add(f));
        });
        const anteriores: Set<number> | undefined = fichas;
        fichas = anteriores ? new Set(Array.from(anteriores).filter((f) => deste.has(f))) : deste;
      }
      const noTitulo = new Set(titulo.map((i) => i.codigo));
      texto = Array.from(fichas ?? new Set<number>())
        .sort((x, y) => x - y)
        .map((i) => indiceTexto.fichas[i])
        .filter(([codigo]) => !noTitulo.has(codigo))
        .map(([codigo, resumo, amparo, gravidade]) => ({ codigo, resumo, amparo, gravidade }));
    }
    return { titulo, texto };
  }, [consulta, indiceTitulo, indiceTexto]);

  const encontradas = resultado ? resultado.titulo.length + resultado.texto.length : 0;

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
            placeholder="Código, artigo ou palavra (ex.: 230 XVI, álcool)"
            aria-label="Buscar ficha"
            value={consulta}
            onFocus={carregarIndice}
            onChange={(e) => setConsulta(e.target.value)}
          />
          {consulta && (
            <button type="button" className={styles.limpar} onClick={() => setConsulta('')} aria-label="Limpar busca">
              <X size={18} />
            </button>
          )}
        </label>
        <div className={styles.barraInfo}>
          <p className={styles.contagem} aria-live="polite">
            {resultado
              ? `${encontradas} de ${total} fichas` +
                (resultado.texto.length ? ` (${resultado.texto.length} só no texto)` : '') +
                (!indiceTexto && !erroIndice ? ' · buscando no texto…' : '')
              : `${total} fichas`}
          </p>
          {resultado && encontradas > 0 && (
            <div className={styles.modos} role="group" aria-label="Ver resultado como">
              <button type="button" aria-pressed={modo === 'lista'} onClick={() => setModo('lista')}>
                <List aria-hidden size={16} /> Lista
              </button>
              <button type="button" aria-pressed={modo === 'mapa'} onClick={() => setModo('mapa')}>
                <Network aria-hidden size={16} /> Mapa
              </button>
            </div>
          )}
        </div>
      </div>

      {resultado ? (
        encontradas === 0 ? (
          <p className={styles.vazio}>Nenhuma ficha encontrada.</p>
        ) : modo === 'mapa' && indiceTexto ? (
          <MapaBusca
            indice={indiceTexto}
            principais={[...resultado.titulo, ...resultado.texto].map((i) => i.codigo)}
          />
        ) : (
          <>
            {resultado.titulo.length > 0 && (
              <section className={styles.grupo}>
                {resultado.texto.length > 0 && <h2>No título ou amparo legal</h2>}
                <ul className={styles.lista}>
                  {resultado.titulo.map((item) => (
                    <Linha key={item.codigo} item={item} />
                  ))}
                </ul>
              </section>
            )}
            {resultado.texto.length > 0 && (
              <section className={styles.grupo}>
                <h2>No texto da ficha</h2>
                <ul className={styles.lista}>
                  {resultado.texto.map((item) => (
                    <Linha key={item.codigo} item={item} />
                  ))}
                </ul>
              </section>
            )}
          </>
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
