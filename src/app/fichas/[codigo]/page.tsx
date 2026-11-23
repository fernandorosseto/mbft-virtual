import type { Metadata } from 'next';
import Link from 'next/link';
import { Fragment } from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Calculator, ExternalLink, Table2 } from 'lucide-react';
import { FERRAMENTAS } from '@/lib/ferramentas';
import { AmparoCtb } from '@/components/AmparoCtb';
import { AtalhosFicha, type Secao } from '@/components/AtalhosFicha';
import { BotaoCopiar } from '@/components/BotaoCopiar';
import { Favoritar } from '@/components/Favoritar';
import { trechosDoAmparo } from '@/lib/ctb';
import { resolucoesDa } from '@/lib/resolucoes';
import { figurasDa, fimDoTrecho, paginaDeTabela, tabelasDa, type Figura, type Tabela } from '@/lib/figuras';
import { BuscaNaFicha } from '@/components/BuscaNaFicha';
import { ConexoesFicha } from '@/components/ConexoesFicha';
import { ConsultaTabela } from '@/components/ConsultaTabela';
import { IrPara } from '@/components/IrPara';
import { Ref, RefOutra } from '@/components/Ref';
import { ResolucoesCitadas } from '@/components/ResolucoesCitadas';
import barra from '@/components/BarraFicha.module.css';
import { Gravidade } from '@/components/Gravidade';
import { TextoMbft, dividirItem } from '@/components/TextoMbft';
import { conexoes, obterFicha, todasAsFichas, vizinhas, type Ficha } from '@/lib/mbft';
import { metadataDe } from '@/lib/metadados';
import { secoesDaMedida } from '@/lib/parteGeral';
import { URL_MBFT_OFICIAL } from '@/lib/site';
import styles from './ficha.module.css';

interface Props {
  // Next 15: os parâmetros da rota chegam como Promise
  params: Promise<{ codigo: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return todasAsFichas().map((f) => ({ codigo: f.codigo }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = obterFicha((await params).codigo);
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

export default async function PaginaFicha({ params }: Props) {
  const f = obterFicha((await params).codigo);
  if (!f) notFound();
  const { anterior, seguinte } = vizinhas(f.codigo);
  const ligadas = conexoes(f.codigo);
  const figuras = figurasDa(f.codigo);
  const tabelas = tabelasDa(f.codigo);
  const tabelasNaFicha = tabelas.filter((t) => !t.link);
  // Atalhos do botão flutuante: só as seções que esta ficha tem
  const secoes: Secao[] = [
    { id: 'enquadramento', rotulo: 'Enquadramento' },
    { id: 'quando-autuar', rotulo: 'Quando autuar' },
    { id: 'quando-nao-autuar', rotulo: 'Quando não autuar' },
    { id: 'definicoes', rotulo: 'Definições e procedimentos' },
    { id: 'exemplos', rotulo: 'Exemplos do campo de observações' },
    { id: 'informacoes', rotulo: figuras.length ? 'Informações e desenhos' : 'Informações complementares' },
    ...(ligadas.cita.length || ligadas.citadaPor.length ? [{ id: 'conexoes', rotulo: 'Conexões' }] : []),
    ...(resolucoesDa(f).length ? [{ id: 'resolucoes', rotulo: 'Resoluções citadas' }] : []),
    ...(trechosDoAmparo(f.amparoLegal).length ? [{ id: 'ctb', rotulo: 'Texto do CTB' }] : []),
  ];

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
          {/* Dois selos do mesmo tamanho: o principal (escuro) e o outro (amarelo), conforme "guiar por" */}
          <span className={styles.codigo}>
            <Ref codigo={f.codigo} artigo={f.rotuloArtigo} />
          </span>
          <span className={styles.outraRef}>
            <RefOutra codigo={`Ficha ${f.codigo}`} artigo={f.rotuloArtigo} />
          </span>
          <Gravidade valor={f.gravidade} />
          <Favoritar
            ficha={{ codigo: f.codigo, artigo: f.rotuloArtigo, resumo: f.tipificacaoResumida, gravidade: f.gravidade }}
          />
        </div>
        <h1>
          {/* Permite quebrar depois de cada barra ("inscr/adesivo/legenda") em vez de no meio da palavra */}
          {f.tipificacaoResumida.split('/').map((parte, i, partes) => (
            <Fragment key={i}>
              {parte}
              {i < partes.length - 1 && (
                <>
                  /<wbr />
                </>
              )}
            </Fragment>
          ))}
        </h1>
      </header>

      <dl className={styles.quadro} id="enquadramento">
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
        <Coluna id="quando-autuar" atual={f.codigo} titulo="Quando autuar" itens={f.quandoAutuar} tom="sim" />
        <Coluna
          id="quando-nao-autuar"
          atual={f.codigo}
          titulo="Quando não autuar"
          itens={f.quandoNaoAutuar}
          tom="nao"
        />
      </div>
      {FERRAMENTAS.filter((fe) => fe.fichas.includes(f.codigo)).map((fe) => (
        <Link key={fe.href} href={fe.href} className={styles.tabelaLink}>
          <Calculator aria-hidden size={22} />
          <span>
            <strong>{fe.titulo}</strong>
            <small>{fe.descricao}</small>
          </span>
          <ArrowRight aria-hidden size={18} />
        </Link>
      ))}
      <Coluna id="definicoes" atual={f.codigo} titulo="Definições e procedimentos" itens={f.definicoesEProcedimentos} />
      <Coluna
        id="exemplos"
        atual={f.codigo}
        titulo="Exemplos do campo de observações"
        itens={f.exemplosObservacoes}
        copiar
      />
      <Coluna
        id="informacoes"
        atual={f.codigo}
        titulo="Informações complementares"
        itens={f.informacoesComplementares}
        figuras={figuras}
        tabelas={tabelas.filter((t) => t.campo === 'informacoesComplementares')}
      />

      <ConexoesFicha ficha={f} />
      <ResolucoesCitadas ficha={f} />
      <AmparoCtb amparo={f.amparoLegal} />

      <p className={styles.fonte}>
        {figuras.length && tabelasNaFicha.length
          ? 'Os desenhos e a tabela acima vêm do PDF oficial; o texto original está lá.'
          : figuras.length
            ? 'Os desenhos acima são recortes do PDF oficial; o texto original está lá.'
            : tabelasNaFicha.length
              ? 'A tabela acima foi copiada do PDF oficial; o texto original está lá.'
              : 'Texto original no PDF oficial.'}{' '}
        <a href={`${URL_MBFT_OFICIAL}#page=${f.pagina}`} target="_blank" rel="noopener noreferrer">
          Abrir na página {f.pagina} <ExternalLink aria-hidden size={14} />
        </a>
      </p>

      <AtalhosFicha secoes={secoes} />

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
  id,
  titulo,
  itens,
  tom,
  atual,
  copiar,
  figuras = [],
  tabelas = [],
}: {
  id: string;
  titulo: string;
  itens: string[];
  tom?: 'sim' | 'nao';
  atual: string;
  /** Botão de copiar em cada item (exemplos para o campo de observações do AIT). */
  copiar?: boolean;
  /** Desenhos recortados do PDF, depois dos itens. */
  figuras?: Figura[];
  /** Tabelas do PDF que entram no lugar do trecho achatado do item. */
  tabelas?: Tabela[];
}) {
  const validos = itens.map((texto, indice) => ({ texto, indice })).filter((t) => t.texto.trim());
  return (
    <section id={id} className={`${styles.coluna} ${tom === 'sim' ? styles.sim : tom === 'nao' ? styles.nao : ''}`}>
      <h2>{titulo}</h2>
      {validos.length ? (
        <ol>
          {validos.map(({ texto: item, indice }) => {
            const { numero, texto, subitens } = dividirItem(item);
            const doItem = tabelas.filter((t) => t.item === indice);
            return (
              <li key={indice}>
                {numero && <span className={styles.numero}>{numero}</span>}
                <div>
                  <Trecho texto={texto} atual={atual} tabelas={doItem} recuo={numero ? RECUO_ITEM : 0} />
                  {subitens.length > 0 && (
                    <ol className={styles.subitens}>
                      {subitens.map((s, j) => (
                        <li key={j}>
                          <span className={styles.numero}>{s.numero}</span>
                          <div>
                            <Trecho
                              texto={s.texto}
                              atual={atual}
                              tabelas={doItem}
                              recuo={(numero ? RECUO_ITEM : 0) + RECUO_SUBITEM}
                            />
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
                {copiar && !/^n[ãa]o h[áa]/i.test(texto) && (
                  <BotaoCopiar
                    texto={[texto, ...subitens.map((s) => `${s.numero} ${s.texto}`)].join(' ')}
                    rotulo="Copiar"
                  />
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className={styles.semConteudo}>Campo em branco no PDF.</p>
      )}
      {figuras.map((fig) => (
        <figure key={fig.arquivo} className={styles.figura}>
          {/* Toque abre a imagem inteira (dá para ampliar) */}
          <a href={fig.arquivo} target="_blank" rel="noopener">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem estática já otimizada (WebP), sem servidor de imagens */}
            <img
              src={fig.arquivo}
              width={fig.largura}
              height={fig.altura}
              loading="lazy"
              decoding="async"
              alt={`Desenho ilustrativo da ficha ${atual}, recortado do PDF oficial (página ${fig.pagina})`}
            />
          </a>
          <figcaption>Recorte do PDF oficial, pág. {fig.pagina}. Toque para ampliar.</figcaption>
        </figure>
      ))}
    </section>
  );
}

/** Texto do item; o trecho em que o PDF tem uma tabela (achatada na extração) vira a tabela. */
/** Recuo do texto de um item e de um subitem (largura mínima do número + espaço; ver ficha.module.css). */
const RECUO_ITEM = 22 + 10;
const RECUO_SUBITEM = 4 + 34 + 10;

function Trecho({ texto, atual, tabelas, recuo }: { texto: string; atual: string; tabelas: Tabela[]; recuo: number }) {
  const t = tabelas.find((x) => texto.includes(x.inicio) && fimDoTrecho(texto, x, texto.indexOf(x.inicio)) >= 0);
  if (!t) {
    return (
      <p>
        <TextoMbft texto={texto} atual={atual} />
      </p>
    );
  }
  const i = texto.indexOf(t.inicio);
  const j = fimDoTrecho(texto, t, i);
  const antes = texto.slice(0, i).trim();
  const depois = texto.slice(j).trim();
  return (
    <>
      {antes && (
        <p>
          <TextoMbft texto={antes} atual={atual} />
        </p>
      )}
      <TabelaMbft tabela={t} atual={atual} recuo={recuo} />
      {depois && (
        <p>
          <TextoMbft texto={depois} atual={atual} />
        </p>
      )}
    </>
  );
}

function TabelaMbft({ tabela: t, atual, recuo }: { tabela: Tabela; atual: string; recuo: number }) {
  if (t.link) {
    const pagina = paginaDeTabela(t.link);
    if (!pagina) return null;
    const pags = pagina.imagens.map((img) => img.pagina);
    return (
      <Link href={`/tabela/${t.link}`} className={styles.tabelaLink}>
        <Table2 aria-hidden size={22} />
        <span>
          <strong>{pagina.titulo}</strong>
          <small>Tabela do PDF em página própria ({pags.length} páginas). Abrir a tabela</small>
        </span>
        <ArrowRight aria-hidden size={18} />
      </Link>
    );
  }
  if (t.consulta) return <ConsultaTabela consulta={t.consulta} pagina={t.pagina} recuo={recuo} />;
  if (t.imagens) {
    return (
      <figure className={`${styles.figura} ${styles.tabelaImagem}`}>
        {/* Uma imagem por página do PDF; cada uma abre inteira ao tocar (dá para ampliar) */}
        {t.imagens.map((img) => (
          <a key={img.arquivo} href={img.arquivo} target="_blank" rel="noopener">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem estática já otimizada (WebP), sem servidor de imagens */}
            <img
              src={img.arquivo}
              width={img.largura}
              height={img.altura}
              loading="lazy"
              decoding="async"
              alt={`Tabela da ficha ${atual}, recortada do PDF oficial (página ${img.pagina})`}
            />
          </a>
        ))}
        <figcaption>
          Tabela recortada do PDF oficial, págs. {t.imagens[0].pagina} a {t.imagens[t.imagens.length - 1].pagina}. Toque
          em cada parte para ampliar.
        </figcaption>
      </figure>
    );
  }
  return (
    <div className={styles.tabela}>
      <table>
        {t.titulo && <caption>{t.titulo}</caption>}
        {t.cabecalho && (
          <thead>
            <tr>
              {t.cabecalho.map((c, i) => (
                <th key={i} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {t.linhas?.map((linha, i) => (
            <tr key={i}>
              {linha.map((c, k) => (
                <td key={k}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
