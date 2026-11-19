import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ligacoesDaFicha, type Ficha, type ItemLigado, type TipoLigacao } from '@/lib/mbft';
import { Ref } from './Ref';
import { TextoMbft, dividirItem } from './TextoMbft';
import styles from './LigacoesFicha.module.css';

const GRUPOS: { tipo: TipoLigacao; titulo: string; explicacao: string }[] = [
  {
    tipo: 'emVez',
    titulo: 'Não autue aqui, use',
    explicacao: 'Situações do “Quando não autuar” desta ficha e o enquadramento indicado para cada uma.',
  },
  {
    tipo: 'tambem',
    titulo: 'Autue também',
    explicacao: 'Itens desta ficha que pedem outro auto de infração além deste (junto ou antes dele).',
  },
  {
    tipo: 'referencia',
    titulo: 'Outras referências',
    explicacao: 'Demais fichas citadas nas definições, procedimentos e informações desta ficha.',
  },
];

/** Quantas fichas de origem aparecem antes do "ver todas". */
const VISIVEIS = 6;

/** Texto do item com número e subitens, sem mudar o texto. */
function Situacao({ item, atual }: { item: string; atual: string }) {
  const { numero, texto, subitens } = dividirItem(item);
  return (
    <p className={styles.situacao}>
      {numero && <span className={styles.numero}>{numero}.</span>} <TextoMbft texto={texto} atual={atual} />
      {subitens.map((s, i) => (
        <span key={i} className={styles.subitem}>
          {s.numero} <TextoMbft texto={s.texto} atual={atual} />
        </span>
      ))}
    </p>
  );
}

function Destino({ ficha }: { ficha: Ficha }) {
  return (
    <Link href={`/fichas/${ficha.codigo}`} className={styles.destino}>
      <ArrowRight aria-hidden size={16} className={styles.seta} />
      <b>
        <Ref codigo={ficha.codigo} artigo={ficha.rotuloArtigo} />
        <span className={`so-artigo ${styles.codigoJunto}`}>{ficha.codigo}</span>
      </b>
      <span>{ficha.tipificacaoResumida}</span>
    </Link>
  );
}

/**
 * Ligações da ficha agrupadas pelo sentido (em vez desta, também, referência), cada destino com
 * a situação que leva a ele, e as fichas que mandam para esta com a situação de lá.
 */
export function LigacoesFicha({ ficha }: { ficha: Ficha }) {
  const { saidas, recebidas } = ligacoesDaFicha(ficha.codigo);
  if (!saidas.length && !recebidas.length) return null;

  return (
    <div className={styles.ligacoes}>
      <div className={styles.coluna}>
        {GRUPOS.map(({ tipo, titulo, explicacao }) => {
          const itens = saidas.filter((s) => s.tipo === tipo);
          if (!itens.length) return null;
          return (
            <section key={tipo} className={`${styles.grupo} ${styles[tipo]}`} aria-label={titulo}>
              <h3>
                {titulo} <span className={styles.qtd}>{itens.length}</span>
              </h3>
              <p className={styles.explicacao}>{explicacao}</p>
              <ul className={styles.itens}>
                {itens.map((i, k) => (
                  <li key={k}>
                    <Situacao item={i.item} atual={ficha.codigo} />
                    <div className={styles.destinos}>
                      {i.destinos.map((d) => (
                        <Destino key={d.codigo} ficha={d} />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {!saidas.length && (
          <section className={styles.grupo} aria-label="Esta ficha não cita outras">
            <h3>Não autue aqui, use</h3>
            <p className={styles.explicacao}>Esta ficha não indica outro enquadramento.</p>
          </section>
        )}
      </div>

      {recebidas.length > 0 && (
        <section className={`${styles.grupo} ${styles.recebidas}`} aria-label="Fichas que mandam para esta">
          <h3>
            Fichas que mandam para esta <span className={styles.qtd}>{recebidas.length}</span>
          </h3>
          <p className={styles.explicacao}>Situações que outras fichas indicam enquadrar aqui.</p>
          <Recebidas lista={recebidas.slice(0, VISIVEIS)} atual={ficha.codigo} />
          {recebidas.length > VISIVEIS && (
            <details className={styles.mais}>
              <summary>Ver mais {recebidas.length - VISIVEIS}</summary>
              <Recebidas lista={recebidas.slice(VISIVEIS)} atual={ficha.codigo} />
            </details>
          )}
        </section>
      )}
    </div>
  );
}

function Recebidas({ lista, atual }: { lista: { origem: Ficha; itens: ItemLigado[] }[]; atual: string }) {
  return (
    <ul className={styles.itens}>
      {lista.map(({ origem, itens }) => (
        <li key={origem.codigo}>
          <Link href={`/fichas/${origem.codigo}`} className={styles.origem}>
            <b>
              <Ref codigo={origem.codigo} artigo={origem.rotuloArtigo} />
              <span className={`so-artigo ${styles.codigoJunto}`}>{origem.codigo}</span>
            </b>
            <span>{origem.tipificacaoResumida}</span>
          </Link>
          {itens.map((i, k) => (
            <div key={k} className={styles.citacao}>
              <span className={`${styles.selo} ${styles[`selo_${i.tipo}`]}`}>
                {i.tipo === 'emVez'
                  ? 'Autuar aqui em vez de lá'
                  : i.tipo === 'tambem'
                    ? 'Autuar também aqui'
                    : 'Referência'}
              </span>
              <Situacao item={i.item} atual={atual} />
            </div>
          ))}
        </li>
      ))}
    </ul>
  );
}
