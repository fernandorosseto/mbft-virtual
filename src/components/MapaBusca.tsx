'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { GrafoVivo } from './GrafoVivo';
import { desambiguarArtigos, juntarArestas, tamanhoDoNo, TIPOS_LIGACAO, type NoGrafo } from '@/lib/noGrafo';
import { Ref, RefOutra } from './Ref';
import type { IndiceBusca } from '@/app/busca.json/route';
import { posicionarComAltura } from '@/lib/grafo';
import { QUERY_CELULAR, useMediaQuery } from '@/lib/useMediaQuery';
import styles from './MapaBusca.module.css';

const MAX_PRINCIPAIS = 40;
const MAX_NOS = 55;
/** Com muitas fichas encontradas, menos vizinhas, para o mapa continuar legível. */
const maxVizinhos = (principais: number) => Math.max(0, Math.min(MAX_NOS - principais, principais >= 15 ? 20 : 40));

/**
 * Mapa da busca, no estilo do grafo do Obsidian: as fichas encontradas (bolinhas maiores) e as
 * fichas ligadas a elas por citação (menores). Tocar numa bolinha mostra a ficha embaixo.
 */
export function MapaBusca({ indice, principais }: { indice: IndiceBusca; principais: string[] }) {
  const celular = useMediaQuery(QUERY_CELULAR);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const largura = celular ? 360 : 900;

  const porCodigo = useMemo(() => new Map(indice.fichas.map((f, i) => [f[0], i])), [indice]);

  const grafo = useMemo(() => {
    const principal = principais.slice(0, MAX_PRINCIPAIS);
    const noMapa = new Set(principal);
    const todas: [string, string][] = indice.citacoes.map(([a, b]) => [indice.fichas[a][0], indice.fichas[b][0]]);
    const tipadas = indice.citacoes.map(([a, b, t]) => ({
      de: indice.fichas[a][0],
      para: indice.fichas[b][0],
      tipo: TIPOS_LIGACAO[t],
    }));

    // Vizinhos por citação, primeiro os mais ligados aos resultados
    const ligacoes = new Map<string, number>();
    for (const [a, b] of todas) {
      if (noMapa.has(a) && !noMapa.has(b)) ligacoes.set(b, (ligacoes.get(b) ?? 0) + 1);
      if (noMapa.has(b) && !noMapa.has(a)) ligacoes.set(a, (ligacoes.get(a) ?? 0) + 1);
    }
    const vizinhos = Array.from(ligacoes)
      .sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))
      .slice(0, maxVizinhos(principal.length))
      .map(([c]) => c);

    const ids = [...principal, ...vizinhos];
    const presentes = new Set(ids);
    const arestas = juntarArestas(tipadas, presentes);
    const pares = arestas.map((a): [string, string] => [a.a, a.b]);
    const base = desambiguarArtigos(
      ids.map((id) => {
        const f = indice.fichas[porCodigo.get(id)!];
        return {
          id,
          artigo: f[4],
          tema: f[5],
          gravidade: f[3],
          papel: (noMapa.has(id) ? 'principal' : 'vizinho') as NoGrafo['papel'],
          titulo: `${f[0]} · ${f[4]} · ${f[1]}`,
        };
      }),
    );
    const tamanhos = new Map(base.map((b) => [b.id, tamanhoDoNo(b)]));
    const { pos, altura } = posicionarComAltura(ids, pares, {
      largura,
      minimo: celular ? 420 : 460,
      maximo: celular ? 1400 : 1000,
      tamanhos,
    });
    const nos: NoGrafo[] = base.map((b) => ({ ...b, x: pos.get(b.id)!.x, y: pos.get(b.id)!.y }));
    return { nos, arestas, altura, cortados: principais.length - principal.length, vizinhos: vizinhos.length };
  }, [indice, principais, porCodigo, largura, celular]);

  const escolhida = selecionado != null ? indice.fichas[porCodigo.get(selecionado)!] : null;
  const ligadas = selecionado ? grafo.arestas.filter(({ a, b }) => a === selecionado || b === selecionado).length : 0;

  return (
    <div className={styles.mapa}>
      <GrafoVivo
        nos={grafo.nos}
        arestas={grafo.arestas}
        largura={largura}
        altura={grafo.altura}
        selecionado={selecionado}
        onSelecionar={(id) => setSelecionado((atual) => (atual === id ? null : id))}
        rotulo="Mapa das fichas encontradas e das fichas ligadas a elas por citação"
      />

      {escolhida ? (
        <div className={styles.cartao}>
          <div className={styles.cartaoTopo}>
            <b>
              <Ref codigo={escolhida[0]} artigo={escolhida[4]} />
            </b>
            <span>{escolhida[3]}</span>
            <span className={styles.amparo}>
              <RefOutra codigo={escolhida[0]} artigo={escolhida[4]} />
            </span>
          </div>
          <p>{escolhida[1]}</p>
          <div className={styles.cartaoRodape}>
            <span>
              {ligadas} {ligadas === 1 ? 'ligação' : 'ligações'} no mapa
            </span>
            <Link href={`/fichas/${escolhida[0]}`} className={styles.abrir}>
              Abrir ficha
            </Link>
          </div>
        </div>
      ) : (
        <p className={styles.legenda}>
          Bolinhas maiores: fichas encontradas. Menores: fichas ligadas a elas por citação de código ({grafo.vizinhos}).
          Cor: gravidade. A seta aponta para a ficha indicada: vermelha, autuar lá em vez daqui; verde, autuar também;
          cinza tracejada, referência. Toque na linha para ver o tipo; arraste as bolinhas; toque nelas para ver a
          ficha.
          {grafo.cortados > 0 && ` O mapa mostra as primeiras ${MAX_PRINCIPAIS} fichas encontradas.`}
        </p>
      )}
    </div>
  );
}
