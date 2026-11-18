'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, GraduationCap, Lock, Menu, PanelLeftClose, X } from 'lucide-react';
import type { Acesso } from '@/types/conteudo';
import { NORMAS, TEMAS, TEMAS_FUTUROS, ZONAS, assuntosDoTema } from '@/data/conteudo';
import { STATUS } from '@/data/status';
import { assuntoPublicado, urlDe, type Estado } from '@/lib/navegacao';
import styles from './SidebarMenu.module.css';

interface SidebarMenuProps {
  estado: Estado;
  /** Desktop: menu lateral recolhido (o palco do carro ocupa o espaço). */
  recolhido?: boolean;
  onRecolher?: () => void;
}

/** Selo do público do site: candidato da PRF. */
function SeloPrf({ compacto = false }: { compacto?: boolean }) {
  return (
    <div className={`${styles.seloPrf} ${compacto ? styles.seloPrfCompacto : ''}`}>
      <GraduationCap size={compacto ? 14 : 16} />
      <span>{compacto ? 'PRF' : 'Foco no concurso da PRF'}</span>
    </div>
  );
}

function SeloAcesso({ acesso }: { acesso: Acesso }) {
  return acesso === 'gratis' ? (
    <span className={styles.seloGratis}>Grátis</span>
  ) : (
    <span className={styles.seloPago}>
      <Lock size={11} />
      <span>Completo</span>
    </span>
  );
}

/** Menu de temas e assuntos: lateral no desktop; gaveta + chips no celular. */
export const SidebarMenu: React.FC<SidebarMenuProps> = ({ estado, recolhido = false, onRecolher }) => {
  // Recolhido: fora da ordem de tabulação e dos leitores de tela (inert ainda não está nos tipos do React 18)
  const asideRef = useRef<HTMLElement>(null);
  useEffect(() => {
    asideRef.current?.toggleAttribute('inert', recolhido);
  }, [recolhido]);
  const [temasAbertos, setTemasAbertos] = useState<Record<string, boolean>>({ vidros: true });
  const [gavetaAberta, setGavetaAberta] = useState(false);
  // Lista de peças do assunto aberto: recolhível pela seta; volta a abrir ao trocar de assunto
  const [listaRecolhida, setListaRecolhida] = useState(false);

  // Fecha a gaveta do celular a cada navegação
  const url = urlDe(estado);
  useEffect(() => setGavetaAberta(false), [url]);

  const assuntoAtual = estado.tipo === 'assunto' || estado.tipo === 'ficha' ? estado.assunto : null;
  const zonaAtual = estado.tipo === 'ficha' ? estado.zona : null;
  useEffect(() => setListaRecolhida(false), [assuntoAtual]);
  const temas = Object.values(TEMAS);
  const assuntosPublicados = temas.flatMap((t) => assuntosDoTema(t.id).filter(assuntoPublicado));

  return (
    <>
      {/* Celular: cabeçalho compacto numa linha (marca, selo, menu) */}
      <header className={styles.mobileBar}>
        <Link href="/" className={styles.brand} aria-label="CTB Virtual: início">
          <div className={styles.brandTitle}>
            CTB <span>Virtual</span>
          </div>
        </Link>
        <SeloPrf compacto />
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={() => setGavetaAberta(!gavetaAberta)}
          aria-label={gavetaAberta ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={gavetaAberta}
        >
          {gavetaAberta ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Celular: barra de assuntos fixa embaixo */}
      <nav className={styles.barraInferior} aria-label="Assuntos">
        {assuntosPublicados.map((a) => {
          const ativo = assuntoAtual === a.id;
          return (
            <Link
              key={a.id}
              href={urlDe({ tipo: 'assunto', tema: a.tema, assunto: a.id })}
              scroll={false}
              className={`${styles.abaInferior} ${ativo ? styles.abaInferiorAtiva : ''}`}
              aria-current={ativo ? 'page' : undefined}
            >
              <span className={styles.abaInferiorTema}>{TEMAS[a.tema].titulo}</span>
              <span className={styles.abaInferiorTitulo}>{a.tituloCurto ?? a.titulo}</span>
            </Link>
          );
        })}
      </nav>

      {gavetaAberta && (
        <div className={styles.mobileBackdrop} onClick={() => setGavetaAberta(false)} aria-hidden="true" />
      )}

      <aside
        className={`${styles.side} ${gavetaAberta ? styles.open : ''} ${recolhido ? styles.recolhido : ''}`}
        aria-label="Temas e assuntos"
        ref={asideRef}
      >
        {onRecolher && (
          <button type="button" className={styles.recolherBtn} onClick={onRecolher} aria-label="Recolher o menu" title="Recolher o menu">
            <PanelLeftClose size={18} />
          </button>
        )}
        <Link href="/" className={styles.brand}>
          <div className={styles.brandTitle}>
            CTB <span>Virtual</span>
          </div>
          <div className={styles.brandSubtitle}>CTB e Resoluções do CONTRAN de forma interativa e fácil de entender.</div>
        </Link>

        <SeloPrf />

        <nav className={styles.navSection} aria-label="Temas">
          {temas.map((tema) => {
            const aberto = !!temasAbertos[tema.id];
            return (
              <div key={tema.id} className={styles.categoryGroup}>
                <button
                  type="button"
                  className={styles.categoryHeader}
                  onClick={() => setTemasAbertos((t) => ({ ...t, [tema.id]: !aberto }))}
                  aria-expanded={aberto}
                >
                  <div className={styles.categoryTitleBox}>
                    <span className={styles.categoryTitle}>{tema.titulo}</span>
                    <span className={styles.categoryRes}>{tema.normas.map((n) => NORMAS[n].sigla).join(' · ')}</span>
                  </div>
                  <SeloAcesso acesso={tema.acesso} />
                  {aberto ? <ChevronDown size={18} color="var(--muted)" /> : <ChevronRight size={18} color="var(--muted)" />}
                </button>

                {aberto && (
                  <div className={styles.subList}>
                    {tema.pagina && (
                      <Link
                        href={urlDe({ tipo: 'tema', tema: tema.id })}
                        scroll={false}
                        className={`${styles.subItemBtn} ${estado.tipo === 'tema' && estado.tema === tema.id ? styles.active : ''}`}
                        aria-current={estado.tipo === 'tema' && estado.tema === tema.id ? 'page' : undefined}
                      >
                        <div className={styles.subItemText}>
                          <span className={styles.subItemTitle}>Visão geral da resolução</span>
                          <span className={styles.subItemSubtitulo}>Ficha técnica, mapa da norma e linha do tempo</span>
                        </div>
                        <ChevronRight size={16} color="var(--muted)" />
                      </Link>
                    )}
                    {assuntosDoTema(tema.id).map((a) => {
                      if (!assuntoPublicado(a)) {
                        return (
                          <div key={a.id} className={`${styles.subItemBtn} ${styles.subItemDesativado}`}>
                            <div className={styles.subItemText}>
                              <span className={styles.subItemTitle}>{a.titulo}</span>
                              <span className={styles.subItemSubtitulo}>{a.subtitulo}</span>
                            </div>
                            <span className={styles.badgeSoon}>Em breve</span>
                          </div>
                        );
                      }
                      const ativo = assuntoAtual === a.id;
                      const expandido = ativo && !listaRecolhida;
                      return (
                        <div key={a.id} className={ativo ? styles.partGroupBlock : undefined}>
                          <Link
                            href={urlDe({ tipo: 'assunto', tema: a.tema, assunto: a.id })}
                            scroll={false}
                            className={`${styles.subItemBtn} ${ativo && !zonaAtual ? styles.active : ''}`}
                            aria-current={ativo && !zonaAtual ? 'page' : undefined}
                            aria-expanded={ativo ? expandido : undefined}
                            onClick={(e) => {
                              // Na seta, ou no próprio assunto já aberto: só recolhe ou abre a lista de peças
                              const naSeta = (e.target as HTMLElement).closest('[data-seta]');
                              if (ativo && (naSeta || !zonaAtual)) {
                                e.preventDefault();
                                setListaRecolhida((r) => !r);
                              }
                            }}
                          >
                            <div className={styles.subItemText}>
                              <span className={styles.subItemTitle}>{a.titulo}</span>
                              <span className={styles.subItemSubtitulo}>{a.subtitulo}</span>
                            </div>
                            <span data-seta className={styles.setaAssunto} aria-hidden="true">
                              {expandido ? <ChevronDown size={16} color="var(--muted)" /> : <ChevronRight size={16} color="var(--muted)" />}
                            </span>
                          </Link>

                          {expandido && (
                            <div className={styles.partGroupSubList}>
                              {a.fichas.map((f) => {
                                const zonaAtiva = zonaAtual === f.zona;
                                return (
                                  <Link
                                    key={f.zona}
                                    href={urlDe({ tipo: 'ficha', tema: a.tema, assunto: a.id, zona: f.zona })}
                                    scroll={false}
                                    className={`${styles.subItemBtn} ${styles.nestedSubItemBtn} ${zonaAtiva ? styles.active : ''}`}
                                    aria-current={zonaAtiva ? 'page' : undefined}
                                  >
                                    <span
                                      className={styles.statusDot}
                                      style={{ background: STATUS[f.status].cor }}
                                      title={STATUS[f.status].rotulo}
                                    />
                                    <span className={styles.subItemTitle}>{ZONAS[f.zona].titulo}</span>
                                    <span className={styles.subItemBadge}>{f.resumoCurto}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {TEMAS_FUTUROS.map((t) => (
            <div key={t.id} className={styles.categoryGroup}>
              <div className={`${styles.categoryHeader} ${styles.categoryFuturo}`}>
                <div className={styles.categoryTitleBox}>
                  <span className={styles.categoryTitle}>{t.titulo}</span>
                  <span className={styles.categoryRes}>{t.normaPrevista} · em breve</span>
                </div>
                <SeloAcesso acesso={t.acesso} />
              </div>
            </div>
          ))}
        </nav>

        <div className={styles.sideFooter}>
          <p>
            <strong>Como usar:</strong> escolha um assunto para ver no carro onde cada regra se aplica, ou toque
            direto numa peça. Cada ficha traz os pontos de prova, a letra da lei e o enquadramento. Arraste para
            girar o carro.
          </p>
          <p style={{ marginTop: '10px', fontSize: '11.5px', lineHeight: '1.4' }}>
            Modelo 3D:{' '}
            <a
              href="https://sketchfab.com/3d-models/generic-passenger-car-pack-20f9af9b8a404d5cb022ac6fe87f21f5"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--paint)', textDecoration: 'underline' }}
            >
              Generic passenger car pack
            </a>{' '}
            de{' '}
            <a
              href="https://sketchfab.com/comrade1280"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--paint)', textDecoration: 'underline' }}
            >
              Comrade1280
            </a>
            , sob licença{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--sign-text)', textDecoration: 'underline' }}
            >
              CC BY 4.0
            </a>{' '}
            (recortado e adaptado). Caminhão 3D:{' '}
            <a
              href="https://skfb.ly/pCvqD"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--paint)', textDecoration: 'underline' }}
            >
              FORD CARGO MAX TRUCK 2428e - RICK MODDING
            </a>{' '}
            de{' '}
            <a
              href="https://sketchfab.com/Rick_modding_"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--paint)', textDecoration: 'underline' }}
            >
              Rick_modding
            </a>
            , sob licença{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--sign-text)', textDecoration: 'underline' }}
            >
              CC BY 4.0
            </a>{' '}
            (adaptado: inscrições da marca removidas).
          </p>
        </div>
      </aside>
    </>
  );
};
