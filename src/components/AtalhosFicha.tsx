"use client";

import { ArrowUpToLine, TableOfContents, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnelTinta } from "./AnelTinta";
import styles from "./AtalhosFicha.module.css";

export interface Secao {
  id: string;
  rotulo: string;
}

/**
 * Botão flutuante com atalhos para as seções da ficha (só as que a ficha tem). Aparece depois de
 * rolar um pouco; marca a seção em que a pessoa está; sobe quando a barra da busca na ficha
 * está aberta (CSS).
 */
export function AtalhosFicha({ secoes }: { secoes: Secao[] }) {
  const [visivel, setVisivel] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [atual, setAtual] = useState<string | null>(null);
  const caixa = useRef<HTMLDivElement>(null);

  // A cada rolagem (uma vez por quadro): mostra o botão depois de rolar um pouco e acha a seção
  // atual, a última cujo topo já passou do primeiro terço da tela (no fim da página, a última)
  useEffect(() => {
    let quadro = 0;
    const calcular = () => {
      quadro = 0;
      setVisivel(window.scrollY > window.innerHeight * 0.6);
      let corrente: string | null = null;
      for (const s of secoes) {
        const e = document.getElementById(s.id);
        if (e && e.getBoundingClientRect().top < window.innerHeight * 0.35)
          corrente = s.id;
      }
      const noFim =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (noFim) {
        for (const s of secoes) {
          const e = document.getElementById(s.id);
          if (e && e.getBoundingClientRect().top < window.innerHeight)
            corrente = s.id;
        }
      }
      setAtual(corrente);
    };
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(calcular);
    };
    calcular();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
      if (quadro) cancelAnimationFrame(quadro);
    };
  }, [secoes]);

  // Fecha ao tocar fora ou com Esc
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("pointerdown", fora);
    window.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fora);
      window.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  const ir = (id: string | null) => {
    setAberto(false);
    if (!id) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search,
      );
      return;
    }
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(window.history.state, "", `#${id}`);
  };

  if (!secoes.length) return null;

  return (
    <div
      ref={caixa}
      className={`${styles.atalhos} ${visivel || aberto ? styles.visivel : ""}`}
      data-fora-da-busca
    >
      {aberto && (
        <nav
          id="atalhos-ficha"
          className={styles.menu}
          aria-label="Seções da ficha"
        >
          <p className={styles.titulo}>Ir para</p>
          <ul>
            {secoes.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => ir(s.id)}
                  aria-current={atual === s.id ? "location" : undefined}
                  className={atual === s.id ? styles.atual : undefined}
                >
                  {s.rotulo}
                </button>
              </li>
            ))}
            <li className={styles.topo}>
              <button type="button" onClick={() => ir(null)}>
                <ArrowUpToLine aria-hidden size={16} /> Voltar ao topo
              </button>
            </li>
          </ul>
        </nav>
      )}
      <span className={styles.comAnel}>
        <AnelTinta ativo={visivel || aberto} />
        <button
          type="button"
          className={styles.botao}
          aria-expanded={aberto}
          aria-controls="atalhos-ficha"
          aria-label={
            aberto
              ? "Fechar atalhos das seções"
              : "Atalhos para as seções da ficha"
          }
          onClick={() => setAberto((a) => !a)}
          tabIndex={visivel || aberto ? 0 : -1}
        >
          {aberto ? (
            <X aria-hidden size={22} />
          ) : (
            <IconeCaminhos />
          )}
        </button>
      </span>
    </div>
  );
}

/**
 * Seta que segue em frente ou vira à direita, como nas placas de trânsito: o botão leva a
 * caminhos dentro da ficha. Desenho próprio no traço dos ícones do lucide (24 × 24, linha 2,
 * pontas arredondadas), porque o lucide não tem essa seta.
 */
function IconeCaminhos() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 21V4" />
      <path d="M4 8l4-4 4 4" />
      <path d="M8 15c0-3.3 2.7-5 6-5h6" />
      <path d="M17 7l3 3-3 3" />
    </svg>
  );
}
