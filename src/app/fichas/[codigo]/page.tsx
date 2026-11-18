import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { AmparoCtb } from '@/components/AmparoCtb';
import { BuscaNaFicha } from '@/components/BuscaNaFicha';
import { ConexoesFicha } from '@/components/ConexoesFicha';
import { IrPara } from '@/components/IrPara';
import { Ref, RefOutra } from '@/components/Ref';
import { ResolucoesCitadas } from '@/components/ResolucoesCitadas';
import barra from '@/components/BarraFicha.module.css';
import { Gravidade } from '@/components/Gravidade';
import { TextoMbft, dividirItem } from '@/components/TextoMbft';
import { obterFicha, todasAsFichas, vizinhas, type Ficha } from '@/lib/mbft';
import { metadataDe } from '@/lib/metadados';
import { secoesDaMedida } from '@/lib/parteGeral';
import { URL_MBFT_OFICIAL } from '@/lib/site';
import styles from './ficha.module.css';

interface Props {
  params: { codigo: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return todasAsFichas().map((f) => ({ codigo: f.codigo }));
}

export function generateMetadata({ params }: Props): Metadata {
  const f = obterFicha(params.codigo);
  if (!f) return {};
  return metadataDe({
    titulo: `${f.codigo} · ${f.tipificacaoResumida} | MBFT Virtual`,
    descricao: `Ficha ${f.codigo} do MBFT: ${f.tipificacao} ${f.amparoLegal} ${f.gravidade}. Quando autuar, quando não autuar e procedimentos.`,
    caminho: `/fichas/${f.codigo}`,
  });
}

/** Campos do quadro, na ordem do PDF. */
function quadro(f: Ficha): [string, string][] {
  const linhas: [string, string][] = [
    ['Tipificação', f.tipificacao],
    ['Amparo legal', f.amparoLegal],
    ['Penalidade', f.penalidade],
    ['Medida administrativa', f.medidaAdministrativa],
    ['Infrator', f.infrator],
    ['Competência', f.competencia],
    ['Pontuação', f.pontuacao],
    ['Constatação', f.constatacao],
  ];
  if (f.crime) linhas.push(['Crime de trânsito', f.crime]);
  return linhas;
}

export default function PaginaFicha({ params }: Props) {
  const f = obterFicha(params.codigo);
  if (!f) notFound();
  const { anterior, seguinte } = vizinhas(f.codigo);

  return (
    <main className={styles.pagina} id="ficha">
      <nav className={styles.trilha} aria-label="Navegação" data-fora-da-busca>
        <Link href="/">Fichas</Link>
        <span aria-hidden>/</span>
        <Link href={`/#art-${f.artigo}`}>Art. {f.artigo}</Link>
      </nav>

      <div className={barra.barra} role="search">
        <BuscaNaFicha alvo="ficha" />
        <IrPara atual={f.codigo} />
      </div>

      <header className={styles.topo}>
        <div className={styles.linhaCodigo}>
          <span className={styles.codigo}>
            <Ref codigo={f.codigo} artigo={f.rotuloArtigo} />
          </span>
          <Gravidade valor={f.gravidade} />
          <span className={styles.outraRef}>
            <RefOutra codigo={`Ficha ${f.codigo}`} artigo={f.rotuloArtigo} />
          </span>
        </div>
        <h1>{f.tipificacaoResumida}</h1>
      </header>

      <dl className={styles.quadro}>
        {quadro(f).map(([rotulo, valor], i, todos) => (
          // Tipificação ocupa a linha toda; com número ímpar de campos, o último também
          <div
            key={rotulo}
            className={i === 0 || (i === todos.length - 1 && (todos.length - 1) % 2 === 1) ? styles.largo : undefined}
          >
            <dt>{rotulo}</dt>
            <dd>
              <TextoMbft texto={valor} atual={f.codigo} />
              {rotulo === 'Amparo legal' && (
                <>
                  {' '}
                  <a href="#ctb" className={styles.verCtb}>
                    Ver texto do CTB
                  </a>
                </>
              )}
              {rotulo === 'Medida administrativa' && secoesDaMedida(valor).length > 0 && (
                <span className={styles.medidas}>
                  Na parte geral:{' '}
                  {secoesDaMedida(valor).map((m, i) => (
                    <span key={m.secao}>
                      {i > 0 && ' · '}
                      <Link href={`/parte-geral#${m.secao}`}>{m.rotulo}</Link>
                    </span>
                  ))}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className={styles.autuar}>
        <Coluna atual={f.codigo} titulo="Quando autuar" itens={f.quandoAutuar} tom="sim" />
        <Coluna atual={f.codigo} titulo="Quando não autuar" itens={f.quandoNaoAutuar} tom="nao" />
      </div>
      <Coluna atual={f.codigo} titulo="Definições e procedimentos" itens={f.definicoesEProcedimentos} />
      <Coluna atual={f.codigo} titulo="Exemplos do campo de observações" itens={f.exemplosObservacoes} />
      <Coluna atual={f.codigo} titulo="Informações complementares" itens={f.informacoesComplementares} />

      <ConexoesFicha ficha={f} />
      <ResolucoesCitadas ficha={f} />
      <AmparoCtb amparo={f.amparoLegal} />

      <p className={styles.fonte}>
        Figuras e tabelas da ficha estão no PDF oficial.{' '}
        <a href={`${URL_MBFT_OFICIAL}#page=${f.pagina}`} target="_blank" rel="noopener noreferrer">
          Abrir na página {f.pagina} <ExternalLink aria-hidden size={14} />
        </a>
      </p>

      <nav className={styles.vizinhas} aria-label="Fichas vizinhas" data-fora-da-busca>
        {anterior ? (
          <Link href={`/fichas/${anterior.codigo}`} className={styles.anterior}>
            <ArrowLeft aria-hidden size={18} />
            <span>
              <b>
                <Ref codigo={anterior.codigo} artigo={anterior.rotuloArtigo} />
              </b>{' '}
              {anterior.tipificacaoResumida}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {seguinte && (
          <Link href={`/fichas/${seguinte.codigo}`} className={styles.seguinte}>
            <span>
              <b>
                <Ref codigo={seguinte.codigo} artigo={seguinte.rotuloArtigo} />
              </b>{' '}
              {seguinte.tipificacaoResumida}
            </span>
            <ArrowRight aria-hidden size={18} />
          </Link>
        )}
      </nav>
    </main>
  );
}

function Coluna({
  titulo,
  itens,
  tom,
  atual,
}: {
  titulo: string;
  itens: string[];
  tom?: 'sim' | 'nao';
  atual: string;
}) {
  const validos = itens.filter((t) => t.trim());
  return (
    <section className={`${styles.coluna} ${tom === 'sim' ? styles.sim : tom === 'nao' ? styles.nao : ''}`}>
      <h2>{titulo}</h2>
      {validos.length ? (
        <ol>
          {validos.map((item, i) => {
            const { numero, texto, subitens } = dividirItem(item);
            return (
              <li key={i}>
                {numero && <span className={styles.numero}>{numero}</span>}
                <div>
                  <p>
                    <TextoMbft texto={texto} atual={atual} />
                  </p>
                  {subitens.length > 0 && (
                    <ol className={styles.subitens}>
                      {subitens.map((s, j) => (
                        <li key={j}>
                          <span className={styles.numero}>{s.numero}</span>
                          <p>
                            <TextoMbft texto={s.texto} atual={atual} />
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className={styles.semConteudo}>Campo em branco no PDF.</p>
      )}
    </section>
  );
}
