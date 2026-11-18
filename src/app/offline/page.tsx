import Link from 'next/link';
import type { Metadata } from 'next';
import styles from '../not-found.module.css';

export const metadata: Metadata = { title: 'Sem internet | MBFT Virtual', robots: { index: false } };

/** Mostrada pelo service worker quando não há internet e a página pedida não foi salva. */
export default function SemInternet() {
  return (
    <div className={styles.aviso} role="alert">
      <strong>Sem internet</strong>
      <span>Esta página ainda não foi salva neste aparelho. As fichas já abertas e as salvas continuam disponíveis.</span>
      <Link href="/">Voltar ao catálogo</Link>
    </div>
  );
}
