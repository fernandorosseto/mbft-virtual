import Link from 'next/link';
import styles from './not-found.module.css';

export default function NaoEncontrado() {
  return (
    <div className={styles.aviso} role="alert">
      <strong>Página não encontrada</strong>
      <span>Esse endereço não corresponde a nenhuma página do manual.</span>
      <Link href="/">Voltar ao início</Link>
    </div>
  );
}
