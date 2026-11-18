'use client';

import { ChevronDown, ChevronUp, TextSearch, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { QUERY_CELULAR, useMediaQuery } from '@/lib/useMediaQuery';
import styles from './BarraFicha.module.css';

const MARCA = 'busca-ficha';
const MARCA_ATUAL = 'busca-ficha-atual';

/** Um caractere sem acento e em minúscula, mantendo o mesmo tamanho do texto original. */
function simplificar(c: string): string {
  return c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()[0] ?? c;
}

/** Trechos do texto do elemento que contêm a consulta (sem diferenciar acentos e maiúsculas). */
function encontrar(raiz: HTMLElement, consulta: string): Range[] {
  const alvo = Array.from(consulta.trim().replace(/\s+/g, ' ')).map(simplificar).join('');
  if (alvo.length < 2) return [];
  const trechos: Range[] = [];
  const caminhante = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
    // Fora: rótulos do grafo e a própria barra de busca
    acceptNode: (no) =>
      no.parentElement?.closest('svg, [data-fora-da-busca]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  for (let no = caminhante.nextNode(); no; no = caminhante.nextNode()) {
    const original = no.textContent ?? '';
    const texto = Array.from(original).map(simplificar).join('').replace(/\s/g, ' ');
    let i = texto.indexOf(alvo);
    while (i !== -1) {
      const r = document.createRange();
      r.setStart(no, i);
      r.setEnd(no, i + alvo.length);
      trechos.push(r);
      i = texto.indexOf(alvo, i + alvo.length);
    }
  }
  return trechos;
}

const temDestaque = () => typeof CSS !== 'undefined' && 'highlights' in CSS;

/**
 * Busca dentro da ficha, como o "Localizar" do navegador: marca as ocorrências (CSS Custom
 * Highlight, sem mexer no HTML), conta e anda entre elas. Sem suporte ao destaque, seleciona a atual.
 */
export function BuscaNaFicha({ alvo }: { alvo: string }) {
  const celular = useMediaQuery(QUERY_CELULAR);
  const [consulta, setConsulta] = useState('');
  const [trechos, setTrechos] = useState<Range[]>([]);
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    const raiz = document.getElementById(alvo);
    setTrechos(raiz ? encontrar(raiz, consulta) : []);
    setAtual(0);
  }, [consulta, alvo]);

  useEffect(() => {
    if (temDestaque()) {
      CSS.highlights.set(MARCA, new Highlight(...trechos));
      if (trechos[atual]) CSS.highlights.set(MARCA_ATUAL, new Highlight(trechos[atual]));
      else CSS.highlights.delete(MARCA_ATUAL);
    }
    const r = trechos[atual];
    if (!r) return;
    if (!temDestaque()) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(r);
    }
    const caixa = r.getBoundingClientRect();
    // Só rola se a ocorrência estiver fora da faixa confortável da tela
    if (caixa.top < 90 || caixa.bottom > window.innerHeight - 90) {
      window.scrollTo({ top: window.scrollY + caixa.top - window.innerHeight / 3, behavior: 'smooth' });
    }
  }, [trechos, atual]);

  useEffect(
    () => () => {
      if (temDestaque()) {
        CSS.highlights.delete(MARCA);
        CSS.highlights.delete(MARCA_ATUAL);
      }
    },
    [],
  );

  const andar = useCallback(
    (passo: number) => setAtual((a) => (trechos.length ? (a + passo + trechos.length) % trechos.length : 0)),
    [trechos.length],
  );
  const limpar = () => setConsulta('');
  const ativa = consulta.trim().length >= 2;
  const contagem = !ativa ? '' : trechos.length ? `${atual + 1} de ${trechos.length}` : 'Nenhuma';

  return (
    <>
      <label className={styles.campo} data-fora-da-busca>
        <TextSearch aria-hidden size={19} />
        <input
          type="search"
          enterKeyHint="next"
          autoComplete="off"
          spellCheck={false}
          placeholder={celular ? 'Nesta ficha' : 'Buscar nesta ficha'}
          aria-label="Buscar nesta ficha"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              andar(e.shiftKey ? -1 : 1);
            } else if (e.key === 'Escape') {
              limpar();
            }
          }}
        />
        {ativa && (
          <span className={styles.contagem} aria-live="polite">
            {contagem}
          </span>
        )}
        {consulta && (
          <button type="button" className={styles.botao} onClick={limpar} aria-label="Limpar busca na ficha">
            <X size={18} />
          </button>
        )}
      </label>

      {/* Barra fixa embaixo: anda entre as ocorrências depois de rolar a ficha */}
      {ativa && trechos.length > 0 && (
        <div className={styles.navegacao} data-fora-da-busca role="toolbar" aria-label="Ocorrências na ficha">
          <span className={styles.navTexto}>
            <b>“{consulta.trim()}”</b> {atual + 1} de {trechos.length}
          </span>
          <button type="button" onClick={() => andar(-1)} aria-label="Ocorrência anterior">
            <ChevronUp size={20} />
          </button>
          <button type="button" onClick={() => andar(1)} aria-label="Próxima ocorrência">
            <ChevronDown size={20} />
          </button>
          <button type="button" onClick={limpar} aria-label="Fechar busca na ficha">
            <X size={20} />
          </button>
        </div>
      )}
    </>
  );
}
