'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import styles from './BotaoCopiar.module.css';

/** Copia o texto (ex.: exemplo do campo de observações do AIT) com um toque. */
export function BotaoCopiar({ texto, rotulo = 'Copiar' }: { texto: string; rotulo?: string }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      // Sem permissão da área de transferência: seleciona um campo temporário e copia
      const campo = document.createElement('textarea');
      campo.value = texto;
      campo.setAttribute('readonly', '');
      campo.style.position = 'fixed';
      campo.style.opacity = '0';
      document.body.appendChild(campo);
      campo.select();
      document.execCommand('copy');
      campo.remove();
    }
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 1800);
  };
  return (
    <button
      type="button"
      className={`${styles.botao} ${copiado ? styles.copiado : ''}`}
      onClick={copiar}
      aria-label={copiado ? 'Copiado' : `${rotulo}: ${texto}`}
      data-fora-da-busca
    >
      {copiado ? <Check aria-hidden size={16} /> : <Copy aria-hidden size={16} />}
      <span>{copiado ? 'Copiado' : rotulo}</span>
    </button>
  );
}
