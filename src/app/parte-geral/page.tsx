import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { TextoMbft } from '@/components/TextoMbft';
import { metadataDe } from '@/lib/metadados';
import { SECOES, type Bloco } from '@/lib/parteGeral';
import { URL_MBFT_OFICIAL } from '@/lib/site';
import styles from './parteGeral.module.css';

export const metadata = metadataDe({
  titulo: 'Parte Geral do MBFT | MBFT Virtual',
  descricao:
    'Parte Geral do Manual Brasileiro de Fiscalização de Trânsito: agente da autoridade de trânsito, responsabilidade pela infração, autuação, infrações concorrentes e concomitantes, medidas administrativas e habilitação.',
  caminho: '/parte-geral',
});

function rotulo(numero: string | null, titulo: string) {
  return numero ? `${numero}. ${titulo}` : titulo;
}

export default function ParteGeral() {
  const sumario = (
    <ol className={styles.sumarioLista}>
      {SECOES.map((s) => (
        <li key={s.id} className={s.nivel === 2 ? styles.sub : undefined}>
          <a href={`#${s.id}`}>{rotulo(s.numero, s.titulo)}</a>
        </li>
      ))}
    </ol>
  );

  return (
    <main className={styles.pagina}>
      <aside className={styles.lateral} aria-label="Sumário">
        <p className={styles.sumarioTitulo}>Sumário</p>
        {sumario}
      </aside>

      <article className={styles.texto}>
        <nav className={styles.trilha} aria-label="Navegação">
          <Link href="/">Fichas</Link>
          <span aria-hidden>/</span>
          <span>Parte geral</span>
        </nav>
        <h1>Parte geral</h1>
        <p className={styles.intro}>
          Normas, conceitos e definições que valem para todas as fichas de fiscalização.
        </p>

        <details className={styles.sumarioCelular}>
          <summary>Sumário</summary>
          {sumario}
        </details>

        {SECOES.map((s) => {
          const Titulo = s.nivel === 1 ? 'h2' : 'h3';
          return (
            <section key={s.id} id={s.id} className={styles.secao}>
              <Titulo>
                {s.numero && <span className={styles.numero}>{s.numero}.</span>} {s.titulo}
              </Titulo>
              <Blocos blocos={s.blocos} />
              {s.blocos.length > 0 && (
                <a
                  className={styles.pdf}
                  href={`${URL_MBFT_OFICIAL}#page=${s.pagina}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PDF oficial, pág. {s.pagina} <ExternalLink aria-hidden size={13} />
                </a>
              )}
            </section>
          );
        })}
      </article>
    </main>
  );
}

/** Agrupa itens e siglas seguidos em listas; parágrafos ficam soltos. */
function Blocos({ blocos }: { blocos: Bloco[] }) {
  const grupos: Bloco[][] = [];
  for (const b of blocos) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && b.tipo !== 'p' && ultimo[0].tipo === b.tipo) ultimo.push(b);
    else grupos.push([b]);
  }
  return (
    <>
      {grupos.map((g, i) => {
        if (g[0].tipo === 'sigla') {
          return (
            <dl key={i} className={styles.siglas}>
              {g.map((b) => (
                <div key={b.marcador}>
                  <dt>{b.marcador}</dt>
                  <dd>{b.texto}</dd>
                </div>
              ))}
            </dl>
          );
        }
        if (g[0].tipo === 'item') {
          return (
            <ul key={i} className={styles.itens}>
              {g.map((b, j) => (
                <li key={j}>
                  <span className={styles.marcador}>{b.marcador === '●' ? '•' : b.marcador}</span>
                  <p>
                    <Paragrafo texto={b.texto} />
                  </p>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className={styles.paragrafo}>
            <Paragrafo texto={g[0].texto} />
          </p>
        );
      })}
    </>
  );
}

/** Destaca o rótulo inicial ("Exemplo 1:", "Observação:", "Caso 2:"), sem mudar o texto. */
function Paragrafo({ texto }: { texto: string }) {
  const m = texto.match(/^((?:Exemplo|Caso)(?: \d+)?:|Observação:)\s*([\s\S]*)$/);
  if (!m) return <TextoMbft texto={texto} />;
  return (
    <>
      <strong>{m[1]}</strong> <TextoMbft texto={m[2]} />
    </>
  );
}
