'use client';

import { useEffect, useState } from 'react';

/** Layout de celular: menu e painel mudam de forma abaixo desta largura. */
export const QUERY_CELULAR = '(max-width: 860px)';

export function useMediaQuery(query: string): boolean {
  const [corresponde, setCorresponde] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const atualizar = () => setCorresponde(mq.matches);
    atualizar();
    mq.addEventListener('change', atualizar);
    return () => mq.removeEventListener('change', atualizar);
  }, [query]);
  return corresponde;
}
