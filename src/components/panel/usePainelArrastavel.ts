'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** Alturas em que o painel do celular para. */
export type NivelPainel = 'baixo' | 'meio' | 'alto';

const ORDEM: NivelPainel[] = ['baixo', 'meio', 'alto'];
const LIMIAR_ARRASTO = 6; // px até o toque virar arrasto (abaixo disso é clique)
const VELOCIDADE_TROCA = 0.5; // px/ms: arrasto rápido muda um nível na direção do gesto

interface Opcoes {
  /** Layout de celular ativo (no desktop o painel é lateral e não arrasta). */
  ativo: boolean;
  aberto: boolean;
  /** Nível ao abrir e a cada navegação (mudança de `chave`). */
  nivelInicial: NivelPainel;
  chave: string;
  /** Altura ocupada pelo painel, para o carro se reposicionar acima dele. */
  onAltura?: (px: number) => void;
}

/**
 * Painel inferior arrastável do celular (bottom sheet) com três alturas.
 * O arrasto começa na alça/cabeçalho; ao soltar, para no nível mais próximo
 * ou, se o gesto foi rápido, no próximo nível na direção do gesto.
 */
export function usePainelArrastavel({ ativo, aberto, nivelInicial, chave, onAltura }: Opcoes) {
  const ref = useRef<HTMLElement>(null);
  const [disponivel, setDisponivel] = useState(0);
  const [nivel, setNivel] = useState<NivelPainel>(nivelInicial);
  const [arrasto, setArrasto] = useState<number | null>(null);
  const acabouDeArrastar = useRef(false);

  // Altura do espaço onde o painel vive (a área do carro)
  useEffect(() => {
    const pai = ref.current?.parentElement;
    if (!pai) return;
    const obs = new ResizeObserver(() => setDisponivel(pai.clientHeight));
    obs.observe(pai);
    setDisponivel(pai.clientHeight);
    return () => obs.disconnect();
  }, []);

  // Cada navegação reabre no nível indicado
  useEffect(() => setNivel(nivelInicial), [chave, nivelInicial]);

  const alturas = useMemo<Record<NivelPainel, number>>(
    () => ({
      baixo: Math.min(196, disponivel * 0.42),
      meio: Math.round(disponivel * 0.56),
      alto: Math.max(0, disponivel - 12),
    }),
    [disponivel]
  );
  const altura = !aberto || !disponivel ? 0 : arrasto ?? alturas[nivel];

  useEffect(() => {
    onAltura?.(ativo ? altura : 0);
  }, [ativo, altura, onAltura]);

  const aoPressionar = useCallback(
    (e: React.PointerEvent) => {
      if (!ativo || !aberto || e.button !== 0) return;
      const inicioY = e.clientY;
      const alturaInicial = altura;
      let arrastando = false;
      let ultimoY = e.clientY;
      let ultimoT = performance.now();
      let velocidade = 0; // px/ms, positiva para cima

      const mover = (ev: PointerEvent) => {
        const dy = inicioY - ev.clientY;
        if (!arrastando && Math.abs(dy) < LIMIAR_ARRASTO) return;
        arrastando = true;
        const agora = performance.now();
        velocidade = (ultimoY - ev.clientY) / Math.max(1, agora - ultimoT);
        ultimoY = ev.clientY;
        ultimoT = agora;
        setArrasto(Math.min(alturas.alto, Math.max(alturas.baixo * 0.8, alturaInicial + dy)));
      };
      const soltar = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', mover);
        window.removeEventListener('pointerup', soltar);
        window.removeEventListener('pointercancel', soltar);
        if (!arrastando) return;
        acabouDeArrastar.current = true;
        const final = Math.min(alturas.alto, Math.max(alturas.baixo, alturaInicial + (inicioY - ev.clientY)));
        let escolhido: NivelPainel;
        if (Math.abs(velocidade) > VELOCIDADE_TROCA) {
          // Gesto rápido: próximo nível na direção do movimento, a partir de onde parou
          const acima = ORDEM.filter((n) => alturas[n] > final + 1);
          const abaixo = ORDEM.filter((n) => alturas[n] < final - 1);
          escolhido = velocidade > 0 ? acima[0] ?? 'alto' : abaixo[abaixo.length - 1] ?? 'baixo';
        } else {
          escolhido = ORDEM.reduce((a, b) => (Math.abs(alturas[b] - final) < Math.abs(alturas[a] - final) ? b : a));
        }
        setNivel(escolhido);
        setArrasto(null);
      };
      window.addEventListener('pointermove', mover);
      window.addEventListener('pointerup', soltar);
      window.addEventListener('pointercancel', soltar);
    },
    [ativo, aberto, altura, alturas]
  );

  /** Depois de um arrasto, o clique que o navegador dispara no fim do gesto é ignorado. */
  const aoClicarCaptura = useCallback((e: React.MouseEvent) => {
    if (acabouDeArrastar.current) {
      acabouDeArrastar.current = false;
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  /** Toque na alça: sobe um nível; no alto, volta ao baixo. */
  const alternar = useCallback(() => {
    setNivel((n) => (n === 'baixo' ? 'meio' : n === 'meio' ? 'alto' : 'baixo'));
  }, []);

  /** Sobe para o meio se estiver no nível baixo (ex.: ao trocar de aba, para o conteúdo aparecer). */
  const mostrarConteudo = useCallback(() => setNivel((n) => (n === 'baixo' ? 'meio' : n)), []);

  return {
    ref,
    altura,
    mostrarConteudo,
    nivel: arrasto !== null ? null : nivel,
    arrastando: arrasto !== null,
    zonaDeArrasto: { onPointerDown: aoPressionar, onClickCapture: aoClicarCaptura },
    alternar,
  };
}
