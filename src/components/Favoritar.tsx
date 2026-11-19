'use client';

import { Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { alternarFavorita, ehFavorita, registrarVisita, type FichaGuardada } from '@/lib/minhasFichas';
import styles from './Favoritar.module.css';

/** Estrela da ficha (favorita, guardada no aparelho) e registro da visita nas recentes. */
export function Favoritar({ ficha }: { ficha: FichaGuardada }) {
  const [favorita, setFavorita] = useState(false);

  // Uma vez por ficha aberta (o objeto `ficha` é recriado a cada desenho da página)
  const { codigo } = ficha;
  const fichaAtual = useRef(ficha);
  fichaAtual.current = ficha;
  useEffect(() => {
    registrarVisita(fichaAtual.current);
    setFavorita(ehFavorita(codigo));
  }, [codigo]);

  return (
    <button
      type="button"
      className={`${styles.estrela} ${favorita ? styles.ativa : ''}`}
      aria-pressed={favorita}
      aria-label={favorita ? 'Tirar das favoritas' : 'Guardar nas favoritas'}
      title={favorita ? 'Tirar das favoritas' : 'Guardar nas favoritas'}
      onClick={() => setFavorita(alternarFavorita(ficha))}
      data-fora-da-busca
    >
      <Star aria-hidden size={22} fill={favorita ? 'currentColor' : 'none'} />
    </button>
  );
}
