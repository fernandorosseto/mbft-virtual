import { BookOpen, FileText, Search } from 'lucide-react';
import { URL_MBFT_OFICIAL } from '@/lib/site';
import styles from './page.module.css';

export default function Inicio() {
  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <span className={styles.marca}>MBFT Virtual</span>
      </header>

      <main className={styles.conteudo}>
        <section className={styles.abertura}>
          <h1>Manual Brasileiro de Fiscalização de Trânsito</h1>
          <p>
            Consulta rápida às fichas de fiscalização do MBFT (anexo da Resolução CONTRAN nº 985/2022), feita para o
            trabalho do agente de trânsito, no celular e no computador.
          </p>
          <p className={styles.aviso}>Em construção.</p>
        </section>

        <ul className={styles.recursos}>
          <li>
            <Search aria-hidden size={22} />
            <strong>Busca</strong>
            <span>Por código de enquadramento, artigo do CTB ou palavra.</span>
          </li>
          <li>
            <FileText aria-hidden size={22} />
            <strong>Fichas</strong>
            <span>Tipificação, amparo legal, quando autuar, quando não autuar e procedimentos.</span>
          </li>
          <li>
            <BookOpen aria-hidden size={22} />
            <strong>Parte geral</strong>
            <span>Procedimentos gerais de fiscalização e preenchimento do auto de infração.</span>
          </li>
        </ul>
      </main>

      <footer className={styles.rodape}>
        <p>Conteúdo informativo. Não substitui o texto publicado no Diário Oficial da União.</p>
        <p>
          Site independente, sem vínculo com órgãos de trânsito. Fonte:{' '}
          <a href={URL_MBFT_OFICIAL} target="_blank" rel="noopener noreferrer">
            MBFT oficial (PDF)
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
