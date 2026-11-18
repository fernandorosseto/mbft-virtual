import { ExternalLink } from 'lucide-react';
import { resolucoesDa } from '@/lib/resolucoes';
import type { Ficha } from '@/lib/mbft';
import styles from './ResolucoesCitadas.module.css';

/** Resoluções citadas no texto da ficha, com link para o DOU quando a publicação é conhecida. */
export function ResolucoesCitadas({ ficha }: { ficha: Ficha }) {
  const lista = resolucoesDa(ficha);
  if (!lista.length) return null;
  return (
    <section className={styles.resolucoes} aria-labelledby="resolucoes">
      <h2 id="resolucoes">Resoluções citadas</h2>
      <ul>
        {lista.map((r) => {
          const nome = `Resolução${r.orgao ? ` ${r.orgao}` : ''} nº ${r.numero.toLocaleString('pt-BR')}/${r.ano}`;
          return (
            <li key={`${r.orgao}-${r.numero}-${r.ano}`}>
              {r.url ? (
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  {nome}
                  <span className={styles.dou}>
                    DOU {r.data} <ExternalLink aria-hidden size={13} />
                  </span>
                </a>
              ) : (
                <span className={styles.semLink}>{nome}</span>
              )}
            </li>
          );
        })}
      </ul>
      <p className={styles.nota}>Como estão escritas no texto da ficha. Link para o Diário Oficial quando a publicação foi localizada.</p>
    </section>
  );
}
