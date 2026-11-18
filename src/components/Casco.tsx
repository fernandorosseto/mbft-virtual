import Link from 'next/link';
import { URL_MBFT_OFICIAL } from '@/lib/site';
import styles from './Casco.module.css';

export function Cabecalho() {
  return (
    <header className={styles.cabecalho}>
      <Link href="/" className={styles.marca}>
        MBFT Virtual
      </Link>
      <span className={styles.subtitulo}>Manual Brasileiro de Fiscalização de Trânsito</span>
    </header>
  );
}

export function Rodape() {
  return (
    <footer className={styles.rodape}>
      <p>Conteúdo informativo. Não substitui o texto publicado no Diário Oficial da União.</p>
      <p>
        Site independente, sem vínculo com órgãos de trânsito. Fonte:{' '}
        <a href={URL_MBFT_OFICIAL} target="_blank" rel="noopener noreferrer">
          MBFT oficial (PDF)
        </a>
        , anexo da Resolução CONTRAN nº 985/2022.
      </p>
    </footer>
  );
}
