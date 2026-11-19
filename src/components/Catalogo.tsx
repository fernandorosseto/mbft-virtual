'use client';

import Link from 'next/link';
import { List, Network, Search, SlidersHorizontal, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { IndiceBusca } from '@/app/busca.json/route';
import { buscarNoTexto, carregarIndice as baixarIndice, casaTodos, palavrasDoTitulo, termosDe } from '@/lib/busca';
import { SINONIMOS } from '@/lib/sinonimos';
import { MapaBusca } from './MapaBusca';
import { Ref, RefOutra } from './Ref';
import styles from './Catalogo.module.css';

export interface ItemCatalogo {
  codigo: string;
  resumo: string;
  amparo: string;
  gravidade: string;
  infrator: string;
  competencia: string[];
  constatacao: string;
  /** Rótulo pelo artigo ("Art. 230, XVI"). */
  artigo: string;
  tema: string;
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
  return palavrasDoTitulo(item.codigo, item.resumo, item.amparo, item.gravidade);
}

type Modo = 'lista' | 'mapa';

/** Filtros: opções em OU dentro do grupo e E entre grupos. A chave vai para o endereço. */
const FILTROS = [
  {
    chave: 'g',
    nome: 'Gravidade',
    campo: 'gravidade',
    opcoes: ['Gravíssima', 'Grave', 'Média', 'Leve', 'Não aplicável'],
  },
  {
    chave: 'i',
    nome: 'Infrator',
    campo: 'infrator',
    opcoes: ['Condutor', 'Proprietário', 'Pessoa física ou jurídica', 'Embarcador ou transportador'],
  },
  { chave: 'c', nome: 'Competência', campo: 'competencia', opcoes: ['Municipal', 'Estadual', 'Rodoviário'] },
  {
    chave: 'a',
    nome: 'Constatação',
    campo: 'constatacao',
    opcoes: ['Sem abordagem', 'Mediante abordagem', 'Vide procedimentos'],
  },
] as const;

type ChaveFiltro = (typeof FILTROS)[number]['chave'];
type Selecao = Partial<Record<ChaveFiltro, string[]>>;

function passa(item: ItemCatalogo, selecao: Selecao): boolean {
  return FILTROS.every(({ chave, campo }) => {
    const escolhidas = selecao[chave];
    if (!escolhidas?.length) return true;
    const valor = item[campo];
    return Array.isArray(valor) ? valor.some((v) => escolhidas.includes(v)) : escolhidas.includes(valor);
  });
}

export function Catalogo({ grupos, total }: { grupos: GrupoCatalogo[]; total: number }) {
  const [consulta, setConsulta] = useState('');
  const [modo, setModo] = useState<Modo>('lista');
  const [selecao, setSelecao] = useState<Selecao>({});
  const [painel, setPainel] = useState(false);
  const [indiceTexto, setIndiceTexto] = useState<IndiceBusca | null>(null);
  const [erroIndice, setErroIndice] = useState(false);
  const carregando = useRef(false);
  const campo = useRef<HTMLInputElement>(null);

  // Índice do texto completo (~100 KB): só é baixado quando a pessoa vai buscar ou abrir o mapa
  const carregarIndice = useCallback(() => {
    if (carregando.current) return;
    carregando.current = true;
    baixarIndice()
      .then((dados) => setIndiceTexto(dados))
      .catch(() => {
        carregando.current = false;
        setErroIndice(true);
      });
  }, []);

  const qtdFiltros = Object.values(selecao).reduce((n, v) => n + (v?.length ?? 0), 0);
  const ativo = consulta.trim() !== '' || qtdFiltros > 0;

  // Busca, filtros e modo ficam no endereço (?q=&g=&i=&c=&a=&ver=mapa): o "voltar" da ficha devolve a mesma tela
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) setConsulta(q);
    const inicial: Selecao = {};
    for (const { chave, opcoes } of FILTROS) {
      const v = params
        .get(chave)
        ?.split(',')
        .filter((x) => (opcoes as readonly string[]).includes(x));
      if (v?.length) inicial[chave] = v;
    }
    setSelecao(inicial);
    if (params.get('ver') === 'mapa') setModo('mapa');
  }, []);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (consulta) url.searchParams.set('q', consulta);
    else url.searchParams.delete('q');
    for (const { chave } of FILTROS) {
      const v = selecao[chave];
      if (v?.length) url.searchParams.set(chave, v.join(','));
      else url.searchParams.delete(chave);
    }
    if (ativo && modo === 'mapa') url.searchParams.set('ver', 'mapa');
    else url.searchParams.delete('ver');
    window.history.replaceState(window.history.state, '', url);
    if (consulta || (ativo && modo === 'mapa')) carregarIndice();
  }, [consulta, selecao, modo, ativo, carregarIndice]);

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
  const porCodigo = useMemo(() => new Map(indiceTitulo.map(({ item }) => [item.codigo, item])), [indiceTitulo]);

  const alternar = (chave: ChaveFiltro, opcao: string) =>
    setSelecao((s) => {
      const atual = s[chave] ?? [];
      return { ...s, [chave]: atual.includes(opcao) ? atual.filter((o) => o !== opcao) : [...atual, opcao] };
    });

  const resultado = useMemo(() => {
    const termos = termosDe(consulta);
    if (!termos.length) return null;

    const titulo = indiceTitulo
      .filter(({ item, palavras }) => passa(item, selecao) && casaTodos(termos, palavras))
      .map(({ item }) => item);

    // No texto completo: todas as palavras buscadas na mesma ficha
    const noTitulo = new Set(titulo.map((i) => i.codigo));
    const texto: ItemCatalogo[] = indiceTexto
      ? buscarNoTexto(indiceTexto, termos)
          .map((i) => porCodigo.get(indiceTexto.fichas[i][0]))
          .filter((item): item is ItemCatalogo => !!item && !noTitulo.has(item.codigo) && passa(item, selecao))
      : [];
    return { titulo, texto };
  }, [consulta, indiceTitulo, indiceTexto, porCodigo, selecao]);

  // Sem busca: a lista por artigo, só com as fichas que passam nos filtros
  const gruposFiltrados = useMemo(
    () =>
      qtdFiltros
        ? grupos.map((g) => ({ ...g, itens: g.itens.filter((i) => passa(i, selecao)) })).filter((g) => g.itens.length)
        : grupos,
    [grupos, selecao, qtdFiltros],
  );

  const encontradas = resultado
    ? resultado.titulo.length + resultado.texto.length
    : gruposFiltrados.reduce((n, g) => n + g.itens.length, 0);
  const principais = resultado
    ? [...resultado.titulo, ...resultado.texto].map((i) => i.codigo)
    : gruposFiltrados.flatMap((g) => g.itens.map((i) => i.codigo));

  return (
    <div className={styles.catalogo}>
      <div className={styles.barraBusca}>
        <div className={styles.linhaBusca}>
          <label className={styles.busca}>
            <Search aria-hidden size={20} />
            <input
              ref={campo}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              spellCheck={false}
              placeholder="Código, artigo ou palavra"
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
          <button
            type="button"
            className={styles.botaoFiltros}
            aria-expanded={painel}
            aria-controls="painel-filtros"
            onClick={() => setPainel((p) => !p)}
          >
            <SlidersHorizontal aria-hidden size={18} />
            <span className={styles.textoFiltros}>Filtros</span>
            {qtdFiltros > 0 && <span className={styles.qtdFiltros}>{qtdFiltros}</span>}
          </button>
        </div>
        <div className={styles.barraInfo}>
          <div className={styles.infoBusca}>
            <p className={styles.contagem} aria-live="polite">
              {ativo
                ? `${encontradas} de ${total} fichas` +
                  (resultado?.texto.length ? ` (${resultado.texto.length} só no texto)` : '') +
                  (resultado && !indiceTexto && !erroIndice ? ' · buscando no texto…' : '')
                : `${total} fichas`}
            </p>
            {/* Termos do dia a dia que também buscaram pelo termo do manual */}
            {consulta &&
              termosDe(consulta)
                .filter((t) => SINONIMOS[t])
                .map((t) => (
                  <p key={t} className={styles.sinonimo}>
                    “{t}” também busca: {SINONIMOS[t].join(', ')}
                  </p>
                ))}
          </div>
          {ativo && encontradas > 0 && (
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

      {painel && (
        <div id="painel-filtros" className={styles.painel}>
          {FILTROS.map(({ chave, nome, opcoes }) => (
            <fieldset key={chave}>
              <legend>{nome}</legend>
              <div className={styles.opcoes}>
                {opcoes.map((o) => (
                  <button
                    key={o}
                    type="button"
                    className={styles.opcao}
                    aria-pressed={selecao[chave]?.includes(o) ?? false}
                    onClick={() => alternar(chave, o)}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          <div className={styles.painelRodape}>
            {qtdFiltros > 0 && (
              <button type="button" className={styles.limparFiltros} onClick={() => setSelecao({})}>
                Limpar filtros
              </button>
            )}
            <button type="button" className={styles.fecharPainel} onClick={() => setPainel(false)}>
              Ver {encontradas} {encontradas === 1 ? 'ficha' : 'fichas'}
            </button>
          </div>
        </div>
      )}

      {!painel && qtdFiltros > 0 && (
        <div className={styles.ativos} aria-label="Filtros ativos">
          {FILTROS.flatMap(({ chave }) =>
            (selecao[chave] ?? []).map((o) => (
              <button key={chave + o} type="button" className={styles.ativo} onClick={() => alternar(chave, o)}>
                {o} <X aria-hidden size={14} />
                <span className="sr-only">(remover filtro)</span>
              </button>
            )),
          )}
          <button type="button" className={styles.limparFiltros} onClick={() => setSelecao({})}>
            Limpar
          </button>
        </div>
      )}

      {encontradas === 0 ? (
        <p className={styles.vazio}>Nenhuma ficha encontrada.</p>
      ) : ativo && modo === 'mapa' ? (
        indiceTexto ? (
          <MapaBusca indice={indiceTexto} principais={principais} />
        ) : (
          <p className={styles.vazio}>Carregando o mapa…</p>
        )
      ) : resultado ? (
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
      ) : (
        gruposFiltrados.map((g) => (
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
        <span className={`${styles.codigo} ${COR[item.gravidade] ?? ''}`}>
          <Ref codigo={item.codigo} artigo={item.artigo} />
        </span>
        <span className={styles.resumo}>{item.resumo}</span>
        <span className={styles.amparo}>
          <RefOutra codigo={item.codigo} artigo={item.artigo} />
        </span>
      </Link>
    </li>
  );
}
