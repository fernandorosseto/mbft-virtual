import Link from 'next/link';
import { URL_MBFT_OFICIAL } from '@/lib/site';
import { todasAsFichas, versaoDoManual } from '@/lib/mbft';
import styles from './Casco.module.css';
import { MenuFerramentas } from './MenuFerramentas';
import { Preferencias } from './Preferencias';
import { AvisoSemRede, UsoOffline } from './UsoOffline';

export function Cabecalho() {
  return (
    <>
    <header className={styles.cabecalho}>
      <Link href="/" className={styles.marca}>
        MBFT<span className={styles.marcaResto}> Virtual</span>
      </Link>
      <span className={styles.subtitulo}>Manual Brasileiro de Fiscalização de Trânsito</span>
      <nav className={styles.menu} aria-label="Seções">
        <Link href="/">Fichas</Link>
        <Link href="/parte-geral">Parte geral</Link>
      </nav>
      <MenuFerramentas />
      <Preferencias />
    </header>
    <AvisoSemRede />
    </>
  );
}

export function Rodape() {
  return (
    <footer className={styles.rodape}>
      <UsoOffline total={todasAsFichas().length} />
      <p>Conteúdo informativo. Não substitui o texto publicado no Diário Oficial da União.</p>
      <p>
        Texto conforme o PDF oficial do MBFT obtido em {versaoDoManual()}; o site confere toda semana se saiu
        versão nova.
      </p>
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
