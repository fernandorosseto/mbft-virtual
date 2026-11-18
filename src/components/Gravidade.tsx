import styles from './Gravidade.module.css';

const CLASSE: Record<string, string> = {
  Gravíssima: styles.gravissima,
  Grave: styles.grave,
  Média: styles.media,
  Leve: styles.leve,
};

/** Selo da natureza da infração, com a cor da gravidade. */
export function Gravidade({ valor }: { valor: string }) {
  return <span className={`${styles.selo} ${CLASSE[valor] ?? styles.outra}`}>{valor}</span>;
}
