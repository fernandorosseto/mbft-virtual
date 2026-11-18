import { ExternalLink } from 'lucide-react';
import { Fragment } from 'react';
import { trechosDoAmparo, URL_CTB_PLANALTO, type BlocoCtb } from '@/lib/ctb';
import styles from './AmparoCtb.module.css';

/** Notas de redação do Planalto ("(Redação dada pela Lei ...)", "(Vigência)") ficam discretas. */
const NOTA = /(\((?:Redação dada|Incluíd|Incluid|Vigência|Renumerad|Vide|Acrescid|Revogad|Regulamento)[^)]*\))/g;

function Texto({ texto }: { texto: string }) {
  const partes = texto.split(NOTA);
  return (
    <>
      {partes.map((p, i) => (i % 2 === 1 ? <span key={i} className={styles.nota}>{p}</span> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

function Bloco({ bloco, citado }: { bloco: BlocoCtb; citado: boolean }) {
  return (
    <p className={`${styles.bloco} ${styles[bloco.tipo]} ${citado ? styles.citado : ''}`}>
      <span className={styles.rotulo}>{bloco.rotulo}</span> <Texto texto={bloco.texto} />
    </p>
  );
}

/** Texto do CTB citado no amparo legal: caput, dispositivo e sanção; o artigo inteiro fica recolhido. */
export function AmparoCtb({ amparo }: { amparo: string }) {
  const trechos = trechosDoAmparo(amparo);
  if (!trechos.length) return null;
  return (
    <section className={styles.ctb} id="ctb" aria-labelledby="ctb-titulo">
      <h2 id="ctb-titulo">Texto do CTB</h2>
      {trechos.map((t) => {
        const temMais = t.trecho.length < t.completo.length;
        return (
          <div key={t.rotulo} className={styles.artigo}>
            <h3>{t.rotulo}</h3>
            {t.trecho.map(({ bloco, indice, citado }, k) => (
              <Fragment key={indice}>
                {k > 0 && indice > t.trecho[k - 1].indice + 1 && (
                  <p className={styles.salto} aria-hidden>
                    [...]
                  </p>
                )}
                <Bloco bloco={bloco} citado={citado} />
              </Fragment>
            ))}
            {temMais && (
              <details className={styles.inteiro}>
                <summary>Ver o art. {t.ref.artigo} inteiro</summary>
                {t.completo.map(({ bloco, citado }, j) => (
                  <Bloco key={j} bloco={bloco} citado={citado} />
                ))}
              </details>
            )}
          </div>
        );
      })}
      <p className={styles.fonte}>
        Redação vigente, da página compilada do Planalto.{' '}
        <a href={URL_CTB_PLANALTO} target="_blank" rel="noopener noreferrer">
          CTB no Planalto <ExternalLink aria-hidden size={13} />
        </a>
      </p>
    </section>
  );
}
