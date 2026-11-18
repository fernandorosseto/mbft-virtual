'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePainelArrastavel } from './usePainelArrastavel';
import { QUERY_CELULAR, useMediaQuery } from '@/lib/useMediaQuery';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronRight, MapPin, X } from 'lucide-react';
import type { AssuntoId, ZonaId } from '@/types/conteudo';
import { ASSUNTOS, NORMAS, TEMAS, ZONAS, obterFicha } from '@/data/conteudo';
import { STATUS } from '@/data/status';
import { assuntosDaPeca, estadoDoAssuntoNaPeca, estadoPai, pecaDaZona, urlDe, type Estado } from '@/lib/navegacao';
import {
  Aviso,
  BlocoDestaque,
  BlocoEssencial,
  BlocoFiscalizacao,
  BlocoFontes,
  BlocoInfracoes,
  BlocoLei,
  BlocoProva,
} from './Blocos';
import { Conexoes, PaginaDaResolucao, Questoes, Revisao, Teoria, Visuais } from './Aula';
import { Introducao } from './Introducao';
import styles from './InfoPanel.module.css';
import aulaStyles from './Aula.module.css';

interface InfoPanelProps {
  estado: Estado;
  ir: (e: Estado) => void;
  onFechar: () => void;
  /** Celular: altura ocupada pelo painel inferior (o carro se reposiciona acima dele). */
  onAlturaCelular?: (px: number) => void;
  /** Tela inicial com a introdução aberta (o × a fecha). */
  intro: boolean;
  /** Desktop: largura do painel, ajustável pela alça na borda esquerda. */
  largura?: number;
  onLargura?: (px: number) => void;
  /** Desktop: limites da largura (o palco do carro precisa de espaço). */
  larguraMin?: number;
  larguraMax?: number;
  larguraPadrao?: number;
}

/** Abas do assunto (a aula). A ficha da peça é curta e fica em rolagem única. */
type Aba = 'resumo' | 'teoria' | 'lei' | 'questoes';
const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'resumo', rotulo: 'Resumo' },
  { id: 'teoria', rotulo: 'Teoria' },
  { id: 'lei', rotulo: 'Lei' },
  { id: 'questoes', rotulo: 'Questões' },
];

/**
 * Painel direito (desktop) / inferior (celular). Variações conforme o estado da URL:
 * introdução (início), página da resolução, assunto (abas), ficha de uma peça e resumo de uma peça.
 */
export const InfoPanel: React.FC<InfoPanelProps> = ({
  estado,
  ir,
  onFechar,
  onAlturaCelular,
  intro,
  largura,
  onLargura,
  larguraMin = 360,
  larguraMax = 900,
  larguraPadrao = 440,
}) => {
  // Mantém o último conteúdo durante a animação de fechamento
  const ultimo = useRef<Estado | null>(null);
  if (estado.tipo !== 'inicio' || intro) ultimo.current = estado;
  const atual = ultimo.current;
  const aberto = estado.tipo !== 'inicio' || intro;
  const chave = `${urlDe(estado)}${intro ? '#intro' : ''}`;

  // Celular: painel inferior arrastável. Assunto e peça abrem baixo (o carro fica visível);
  // a ficha, a resolução e a introdução abrem na metade.
  const celular = useMediaQuery(QUERY_CELULAR);
  const painel = usePainelArrastavel({
    ativo: celular,
    aberto,
    nivelInicial: estado.tipo === 'assunto' || estado.tipo === 'peca' ? 'baixo' : 'meio',
    chave,
    onAltura: onAlturaCelular,
  });

  // Aba do assunto: volta para "Resumo" a cada navegação
  const [aba, setAba] = useState<Aba>('resumo');
  const corpoRef = useRef<HTMLDivElement>(null);
  useEffect(() => setAba('resumo'), [chave]);
  useEffect(() => {
    corpoRef.current?.scrollTo({ top: 0 });
  }, [aba, chave]);

  if (!atual) return <section ref={painel.ref} className={styles.panel} aria-hidden="true" />;

  let eyebrow = '';
  let titulo = '';
  let corpo: React.ReactNode = null;
  let voltar: { rotulo: string; estado: Estado } | null = null;
  let abas: React.ReactNode = null;

  if (atual.tipo === 'inicio') {
    eyebrow = 'Concurso PRF · legislação de trânsito';
    titulo = 'As resoluções do edital, no carro';
    corpo = <Introducao />;
  } else if (atual.tipo === 'tema') {
    const tema = TEMAS[atual.tema];
    eyebrow = `${tema.titulo} · visão geral da resolução`;
    titulo = NORMAS[tema.pagina!.norma].sigla;
    corpo = <PaginaDaResolucao tema={tema} />;
  } else if (atual.tipo === 'assunto') {
    const assunto = ASSUNTOS[atual.assunto];
    const pai = estadoPai(atual);
    eyebrow = `${TEMAS[atual.tema].titulo} · ${assunto.subtitulo}`;
    titulo = assunto.titulo;
    if (pai.tipo === 'tema') voltar = { rotulo: `${NORMAS[TEMAS[pai.tema].pagina!.norma].sigla}: visão geral`, estado: pai };
    if (assunto.aula) {
      abas = (
        <AbasDoAssunto
          aba={aba}
          escolher={(a) => {
            setAba(a);
            painel.mostrarConteudo();
          }}
          totalQuestoes={assunto.aula.questoes.length}
        />
      );
    }
    corpo = <AulaDoAssunto assuntoId={atual.assunto} aba={assunto.aula ? aba : 'resumo'} />;
  } else if (atual.tipo === 'ficha') {
    const assunto = ASSUNTOS[atual.assunto];
    const ficha = obterFicha(atual.assunto, atual.zona)!;
    const zona = ZONAS[atual.zona];
    eyebrow = `${assunto.titulo} · ${ficha.descricaoZona ?? zona.descricao}`;
    titulo = zona.titulo;
    voltar = { rotulo: `${assunto.titulo}: todas as áreas`, estado: { tipo: 'assunto', tema: atual.tema, assunto: atual.assunto } };
    abas = <AbasDaPeca zona={atual.zona} assuntoAtual={atual.assunto} ir={ir} />;
    corpo = (
      <>
        <BlocoDestaque destaque={ficha.destaque} />
        <BlocoEssencial essencial={ficha.essencial} />
        <BlocoProva prova={ficha.prova} />
        <BlocoLei dispositivos={ficha.dispositivos} enquadramentos={ficha.enquadramentos} />
        <BlocoFiscalizacao itens={ficha.essencial.naFiscalizacao} />
        <BlocoInfracoes enquadramentos={ficha.enquadramentos} />
        {assunto.aula && (
          <Link href={urlDe({ tipo: 'assunto', tema: atual.tema, assunto: assunto.id })} scroll={false} className={aulaStyles.linkAula}>
            <span>Aula completa de {assunto.titulo}: teoria, lei e questões</span>
            <ArrowRight size={18} />
          </Link>
        )}
        <BlocoFontes dispositivos={ficha.dispositivos} enquadramentos={ficha.enquadramentos} />
        <Aviso />
      </>
    );
  } else {
    const zona = ZONAS[atual.zona];
    eyebrow = zona.descricao;
    titulo = zona.titulo;
    corpo = <ResumoDaPeca zona={atual.zona} />;
  }

  return (
    <section
      ref={painel.ref}
      className={`${styles.panel} ${aberto ? styles.open : ''} ${painel.arrastando ? styles.arrastando : ''} ${
        painel.nivel === 'baixo' ? styles.nivelBaixo : ''
      }`}
      style={celular ? { height: painel.altura } : largura ? { width: largura } : undefined}
      aria-labelledby="panel-title"
      aria-hidden={!aberto}
      data-painel
    >
      {!celular && onLargura && largura && aberto && (
        <AlcaLargura
          largura={largura}
          min={larguraMin}
          max={larguraMax}
          padrao={larguraPadrao}
          onLargura={onLargura}
        />
      )}
      <div className={styles.zonaArrasto} {...painel.zonaDeArrasto}>
        <button
          type="button"
          className={styles.alca}
          onClick={painel.alternar}
          aria-label={painel.nivel === 'alto' ? 'Recolher o painel' : 'Expandir o painel'}
        >
          <span />
        </button>
        <header className={styles.head}>
          <div>
            {voltar && (
              <Link href={urlDe(voltar.estado)} scroll={false} className={styles.voltar}>
                <ArrowLeft size={14} />
                <span>{voltar.rotulo}</span>
              </Link>
            )}
            <div className={styles.eyebrow}>{eyebrow}</div>
            <h2 id="panel-title" className={styles.title}>
              {titulo}
            </h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onFechar} aria-label="Fechar painel">
            <X size={20} />
          </button>
        </header>
        {abas}
      </div>
      <div ref={corpoRef} className={styles.body} role={abas && atual.tipo === 'assunto' ? 'tabpanel' : undefined}>
        {corpo}
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// Alça de largura (desktop)
// ---------------------------------------------------------------------------

/**
 * Borda esquerda do painel: arrastar muda a largura (mais área de leitura); clique duplo volta
 * ao padrão; setas do teclado ajustam de 40 em 40 px.
 */
function AlcaLargura({
  largura,
  min,
  max,
  padrao,
  onLargura,
}: {
  largura: number;
  min: number;
  max: number;
  padrao: number;
  onLargura: (px: number) => void;
}) {
  const [arrastando, setArrastando] = useState(false);
  const limitar = (px: number) => Math.round(Math.min(max, Math.max(min, px)));

  const aoPressionar = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const alca = e.currentTarget;
    alca.setPointerCapture(e.pointerId);
    // A borda direita do painel é fixa: a largura é a distância do ponteiro até ela
    const direita = (alca.parentElement as HTMLElement).getBoundingClientRect().right;
    setArrastando(true);
    const mover = (ev: PointerEvent) => onLargura(limitar(direita - ev.clientX));
    const soltar = () => {
      setArrastando(false);
      alca.removeEventListener('pointermove', mover);
      alca.removeEventListener('pointerup', soltar);
      alca.removeEventListener('pointercancel', soltar);
    };
    alca.addEventListener('pointermove', mover);
    alca.addEventListener('pointerup', soltar);
    alca.addEventListener('pointercancel', soltar);
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Largura do painel: arraste para ajustar"
      aria-valuenow={largura}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      title="Arraste para ajustar a largura. Clique duplo volta ao tamanho padrão."
      className={`${styles.alcaLargura} ${arrastando ? styles.alcaLarguraAtiva : ''}`}
      onPointerDown={aoPressionar}
      onDoubleClick={() => onLargura(padrao)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') onLargura(limitar(largura + 40));
        else if (e.key === 'ArrowRight') onLargura(limitar(largura - 40));
        else return;
        e.preventDefault();
      }}
    >
      <span />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Abas
// ---------------------------------------------------------------------------

function AbasDoAssunto({ aba, escolher, totalQuestoes }: { aba: Aba; escolher: (a: Aba) => void; totalQuestoes: number }) {
  return (
    <div className={styles.tabsHeaderWrapper}>
      <div className={`${styles.siblingTabsBar} ${styles.abasAula}`} role="tablist" aria-label="Partes da aula">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={aba === a.id}
            className={`${styles.siblingTabBtn} ${aba === a.id ? styles.activeTab : ''}`}
            onClick={() => escolher(a.id)}
          >
            <span className={styles.siblingTabText}>
              {a.rotulo}
              {a.id === 'questoes' && <span className={styles.contagemAba}>{totalQuestoes}</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Abas da ficha: outros assuntos da mesma peça. */
function AbasDaPeca({ zona, assuntoAtual, ir }: { zona: ZonaId; assuntoAtual: string; ir: (e: Estado) => void }) {
  const itens = assuntosDaPeca(pecaDaZona(zona));
  if (itens.length < 2) return null;
  return (
    <div className={styles.tabsHeaderWrapper}>
      <div className={styles.siblingTabsBar} role="tablist" aria-label="Assuntos desta peça">
        {itens.map((item) => {
          const atual = item.assunto.id === assuntoAtual;
          return (
            <button
              key={item.assunto.id}
              type="button"
              role="tab"
              aria-selected={atual}
              className={`${styles.siblingTabBtn} ${atual ? styles.activeTab : ''}`}
              onClick={() => !atual && ir(estadoDoAssuntoNaPeca(item))}
            >
              <span className={styles.siblingTabText}>{item.assunto.tituloCurto ?? item.assunto.titulo}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Assunto (aula)
// ---------------------------------------------------------------------------

function AulaDoAssunto({ assuntoId, aba }: { assuntoId: AssuntoId; aba: Aba }) {
  const assunto = ASSUNTOS[assuntoId];
  const vg = assunto.visaoGeral;
  if (!vg) return null;
  const aula = assunto.aula;

  switch (aba) {
    case 'resumo':
      return (
        <>
          <p className={styles.lead}>{vg.resumo}</p>
          {assunto.fichas.length > 0 && (
            <div>
              <h3 className={styles.sectionTitle}>
                <MapPin size={18} />
                <span>Onde se aplica</span>
              </h3>
              <ul className={styles.listaZonas}>
                {assunto.fichas.map((f) => (
                  <li key={f.zona}>
                    <Link
                      href={urlDe({ tipo: 'ficha', tema: assunto.tema, assunto: assunto.id, zona: f.zona })}
                      scroll={false}
                      className={styles.itemZona}
                    >
                      <span className={styles.statusDot} style={{ background: STATUS[f.status].cor }} />
                      <span className={styles.itemZonaTexto}>
                        <b>{ZONAS[f.zona].titulo}</b>
                        {STATUS[f.status].rotulo.toLowerCase() !== f.resumoCurto.toLowerCase() && (
                          <small>{STATUS[f.status].rotulo}</small>
                        )}
                      </span>
                      <span className={styles.itemZonaResumo}>{f.resumoCurto}</span>
                      <ChevronRight size={16} color="var(--muted)" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <BlocoDestaque destaque={vg.destaque} />
          <BlocoEssencial essencial={vg.essencial} />
          {aula && <Revisao frases={aula.revisao} />}
          {!aula && (
            <>
              <BlocoProva prova={vg.prova} />
              <BlocoLei dispositivos={vg.dispositivos} enquadramentos={vg.enquadramentos} />
              <BlocoInfracoes enquadramentos={vg.enquadramentos} />
              <BlocoFontes dispositivos={vg.dispositivos} enquadramentos={vg.enquadramentos} />
            </>
          )}
          <Aviso />
        </>
      );
    case 'teoria':
      return (
        <>
          <Teoria topicos={aula!.teoria} />
          <Visuais visuais={aula!.visuais} assunto={assunto} />
          <BlocoProva prova={vg.prova} />
          <BlocoFiscalizacao itens={vg.essencial.naFiscalizacao} />
          <Conexoes assunto={assunto} />
          <Aviso />
        </>
      );
    case 'lei':
      return (
        <>
          <BlocoLei dispositivos={vg.dispositivos} enquadramentos={vg.enquadramentos} />
          <BlocoInfracoes enquadramentos={vg.enquadramentos} />
          <BlocoFontes dispositivos={vg.dispositivos} enquadramentos={vg.enquadramentos} />
          <Aviso />
        </>
      );
    case 'questoes':
      return (
        <>
          <Questoes key={assunto.id} questoes={aula!.questoes} />
          <Aviso />
        </>
      );
  }
}

// ---------------------------------------------------------------------------
// Peça
// ---------------------------------------------------------------------------

function ResumoDaPeca({ zona }: { zona: ZonaId }) {
  const itens = assuntosDaPeca(zona);
  return (
    <>
      <p className={styles.lead}>O que a norma diz sobre esta peça. Escolha um assunto:</p>
      <ul className={styles.listaZonas}>
        {itens.map((item) => {
          const resumo = item.ficha?.resumoCurto ?? item.assunto.resumoCurto;
          return (
            <li key={item.assunto.id}>
              <Link href={urlDe(estadoDoAssuntoNaPeca(item))} scroll={false} className={styles.itemZona}>
                {item.ficha && <span className={styles.statusDot} style={{ background: STATUS[item.ficha.status].cor }} />}
                <span className={styles.itemZonaTexto}>
                  <b>{item.assunto.titulo}</b>
                  <small>{item.assunto.subtitulo}</small>
                </span>
                {resumo && <span className={styles.itemZonaResumo}>{resumo}</span>}
                <ChevronRight size={16} color="var(--muted)" />
              </Link>
            </li>
          );
        })}
      </ul>
      <Aviso />
    </>
  );
}
