'use client';

import { CloudDownload, CloudOff, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { carregarIndice } from '@/lib/busca';
import styles from './UsoOffline.module.css';

type Estado =
  | { fase: 'indisponivel' }
  | { fase: 'parado'; salvas: number }
  | { fase: 'salvando'; feitas: number; total: number }
  | { fase: 'pronto'; salvas: number; falhas: number };

/**
 * Uso sem internet: registra o service worker (/sw.js), mostra quantas fichas estão salvas no
 * aparelho, oferece salvar todas e avisa quando a conexão cai.
 */
function useSemRede(): boolean {
  const [semRede, setSemRede] = useState(false);
  useEffect(() => {
    const atualizar = () => setSemRede(!navigator.onLine);
    atualizar();
    window.addEventListener('online', atualizar);
    window.addEventListener('offline', atualizar);
    return () => {
      window.removeEventListener('online', atualizar);
      window.removeEventListener('offline', atualizar);
    };
  }, []);
  return semRede;
}

/** Faixa logo abaixo do cabeçalho quando a conexão cai. */
export function AvisoSemRede() {
  const semRede = useSemRede();
  if (!semRede) return null;
  return (
    <div className={styles.semRede} role="status">
      <CloudOff aria-hidden size={16} /> Sem internet. As fichas salvas neste aparelho continuam disponíveis.
    </div>
  );
}

export function UsoOffline({ total }: { total: number }) {
  const [estado, setEstado] = useState<Estado>({ fase: 'indisponivel' });
  const semRede = useSemRede();

  useEffect(() => {
    // Só em produção: em desenvolvimento o cache atrapalharia ver as mudanças
    if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return;
    const aoReceber = (e: MessageEvent) => {
      const m = e.data ?? {};
      if (m.tipo === 'contagem') {
        setEstado(m.salvando ? { fase: 'salvando', feitas: 0, total } : { fase: 'parado', salvas: m.salvas });
      } else if (m.tipo === 'progresso') setEstado({ fase: 'salvando', feitas: m.feitas, total: m.total });
      else if (m.tipo === 'concluido') setEstado({ fase: 'pronto', salvas: m.salvas, falhas: m.falhas });
    };
    navigator.serviceWorker.addEventListener('message', aoReceber);
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => reg.active?.postMessage({ tipo: 'contar' }))
      .catch(() => undefined);
    return () => navigator.serviceWorker.removeEventListener('message', aoReceber);
  }, [total]);

  const salvarTodas = async () => {
    const reg = await navigator.serviceWorker.ready;
    const indice = await carregarIndice();
    setEstado({ fase: 'salvando', feitas: 0, total: indice.fichas.length });
    reg.active?.postMessage({ tipo: 'salvar-todas', urls: ['/parte-geral', ...indice.fichas.map(([c]) => `/fichas/${c}`)] });
  };

  return (
    <>
      {estado.fase !== 'indisponivel' && (
        <div className={styles.painel}>
          {estado.fase === 'salvando' ? (
            <>
              <span className={styles.texto}>
                Salvando para usar sem internet… {estado.feitas} de {estado.total}
              </span>
              <progress max={estado.total} value={estado.feitas} className={styles.barra} />
            </>
          ) : estado.fase === 'pronto' && estado.falhas === 0 ? (
            <span className={styles.texto}>
              <Check aria-hidden size={16} /> Todas as fichas estão salvas e funcionam sem internet.
            </span>
          ) : estado.salvas >= total ? (
            <span className={styles.texto}>
              <Check aria-hidden size={16} /> Todas as fichas estão salvas e funcionam sem internet.
            </span>
          ) : (
            <>
              <span className={styles.texto}>
                Para usar sem internet: {estado.salvas} de {total} fichas salvas neste aparelho
                {estado.fase === 'pronto' && estado.falhas > 0 && ` (${estado.falhas} não baixaram; tente de novo)`}.
              </span>
              <button type="button" className={styles.botao} onClick={salvarTodas} disabled={semRede}>
                <CloudDownload aria-hidden size={16} /> Salvar todas
              </button>
              <span className={styles.nota}>Baixa ~11 MB (fichas e desenhos) e ocupa ~50 MB no aparelho.</span>
            </>
          )}
        </div>
      )}
    </>
  );
}
