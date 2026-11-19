'use client';

import Link from 'next/link';
import styles from './not-found.module.css';

/**
 * Erro no navegador dentro de uma página (ex.: cópia antiga do índice de busca salva no aparelho):
 * em vez da tela em inglês do Next, um aviso com "Tentar de novo" e "Recarregar".
 */
export default function Erro({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className={styles.aviso} role="alert">
      <strong>Algo deu errado</strong>
      <span>A página não carregou direito. Tente de novo; se continuar, recarregue a página.</span>
      <button type="button" className={styles.botao} onClick={reset}>
        Tentar de novo
      </button>
      <button type="button" className={styles.botao} onClick={() => window.location.reload()}>
        Recarregar a página
      </button>
      <Link href="/">Voltar ao início</Link>
    </div>
  );
}
