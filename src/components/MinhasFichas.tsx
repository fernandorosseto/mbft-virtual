'use client';

import Link from 'next/link';
import { Clock, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EVENTO, favoritas, limparRecentes, recentes, type FichaGuardada } from '@/lib/minhasFichas';
import { Ref } from './Ref';
import styles from './MinhasFichas.module.css';

const COR: Record<string, string> = {
  Gravíssima: styles.gravissima,
  Grave: styles.grave,
  Média: styles.media,
  Leve: styles.leve,
};

/** Favoritas e recentes do aparelho, na página inicial. Nada aparece até haver alguma. */
export function MinhasFichas() {
  const [listas, setListas] = useState<{ favoritas: FichaGuardada[]; recentes: FichaGuardada[] } | null>(null);

  useEffect(() => {
    const atualizar = () => setListas({ favoritas: favoritas(), recentes: recentes() });
    atualizar();
    window.addEventListener(EVENTO, atualizar);
    window.addEventListener('storage', atualizar);
    return () => {
      window.removeEventListener(EVENTO, atualizar);
      window.removeEventListener('storage', atualizar);
    };
  }, []);

  if (!listas || (!listas.favoritas.length && !listas.recentes.length)) return null;

  return (
    <div className={styles.minhas}>
      {listas.favoritas.length > 0 && (
        <Grupo titulo="Favoritas" icone={<Star aria-hidden size={16} />} fichas={listas.favoritas} />
      )}
      {listas.recentes.length > 0 && (
        <Grupo
          titulo="Vistas por último"
          icone={<Clock aria-hidden size={16} />}
          fichas={listas.recentes}
          acao={
            <button type="button" className={styles.limpar} onClick={limparRecentes}>
              Limpar
            </button>
          }
        />
      )}
    </div>
  );
}

function Grupo({
  titulo,
  icone,
  fichas,
  acao,
}: {
  titulo: string;
  icone: React.ReactNode;
  fichas: FichaGuardada[];
  acao?: React.ReactNode;
}) {
  return (
    <section className={styles.grupo} aria-label={titulo}>
      <h2>
        {icone} {titulo}
        {acao}
      </h2>
      <ul>
        {fichas.map((f) => (
          <li key={f.codigo}>
            <Link href={`/fichas/${f.codigo}`} className={`${styles.cartao} ${COR[f.gravidade] ?? ''}`}>
              <b>
                <Ref codigo={f.codigo} artigo={f.artigo} />
              </b>
              <span>{f.resumo}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
