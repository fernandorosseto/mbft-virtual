'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { StatusRegra, ZonaId } from '@/types/conteudo';
import { ASSUNTOS, ZONAS } from '@/data/conteudo';
import {
  INICIO,
  assuntosDaPeca,
  estadoDoAssuntoNaPeca,
  estadoPai,
  lerCaminho,
  pecaDaZona,
  urlDe,
  type Estado,
} from '@/lib/navegacao';
import { CarStage, type Marcador, type NoRamificado } from '@/components/canvas/CarStage';
import { SidebarMenu } from '@/components/layout/SidebarMenu';
import { InfoPanel } from '@/components/panel/InfoPanel';
import { PanelLeftOpen } from 'lucide-react';
import { QUERY_CELULAR, useMediaQuery } from '@/lib/useMediaQuery';
import styles from './AppShell.module.css';

/** Largura padrão do painel lateral no desktop; o usuário pode alargá-lo pela alça da borda. */
const LARGURA_PAINEL = 440;
const LARGURA_PAINEL_MIN = 360;
/** Espaço mínimo que o palco do carro mantém ao lado do painel alargado. */
const PALCO_MIN = 320;
/** Deslocamento máximo (px) entre apertar e soltar para contar como clique, e não giro do carro. */
const TOLERANCIA_CLIQUE = 6;
const CHAVE_INTRO_FECHADA = 'ctbvirtual_intro_fechada';
const CHAVE_MENU_RECOLHIDO = 'ctbvirtual_menu_recolhido';

/**
 * Casco do app: menu, carro e painel. Fica no layout raiz, então permanece montado entre as
 * rotas (o carro 3D não é recarregado). O estado da tela vem só da URL.
 */
export function AppShell() {
  const caminho = usePathname();
  const router = useRouter();
  const estado = useMemo<Estado>(() => lerCaminho(caminho ?? '/') ?? INICIO, [caminho]);

  const ir = useCallback((e: Estado) => router.push(urlDe(e), { scroll: false }), [router]);
  const celular = useMediaQuery(QUERY_CELULAR);
  const [alturaPainelCelular, setAlturaPainelCelular] = useState(0);
  // Introdução da tela inicial: aberta até o visitante fechá-la (lembrado neste navegador)
  const [intro, setIntro] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem(CHAVE_INTRO_FECHADA) !== '1') setIntro(true);
    } catch {
      setIntro(true);
    }
  }, []);
  const definirIntro = useCallback((aberta: boolean) => {
    setIntro(aberta);
    try {
      localStorage.setItem(CHAVE_INTRO_FECHADA, aberta ? '0' : '1');
    } catch {
      // armazenamento indisponível: vale só nesta visita
    }
  }, []);
  const introVisivel = intro && estado.tipo === 'inicio';
  const aberto = estado.tipo !== 'inicio' || introVisivel;

  // Desktop: menu esquerdo recolhível (lembrado neste navegador)
  const [menuRecolhido, setMenuRecolhido] = useState(false);
  useEffect(() => {
    try {
      setMenuRecolhido(localStorage.getItem(CHAVE_MENU_RECOLHIDO) === '1');
    } catch {
      // sem armazenamento: menu aberto
    }
  }, []);
  const definirMenuRecolhido = useCallback((recolhido: boolean) => {
    setMenuRecolhido(recolhido);
    try {
      localStorage.setItem(CHAVE_MENU_RECOLHIDO, recolhido ? '1' : '0');
    } catch {
      // vale só nesta visita
    }
  }, []);

  // Desktop: largura do painel ajustável; o máximo deixa espaço para o carro
  const palcoRef = useRef<HTMLElement>(null);
  const [larguraPalco, setLarguraPalco] = useState(0);
  useEffect(() => {
    const el = palcoRef.current;
    if (!el) return;
    const observador = new ResizeObserver(() => setLarguraPalco(el.clientWidth));
    observador.observe(el);
    return () => observador.disconnect();
  }, []);
  const [larguraPainel, setLarguraPainel] = useState(LARGURA_PAINEL);
  const larguraMax = Math.max(LARGURA_PAINEL, larguraPalco - PALCO_MIN);
  const larguraEfetiva = Math.min(larguraPainel, larguraMax);

  // Clique no carro (sem arrastar) recolhe o painel alargado de volta ao padrão
  const inicioClique = useRef<{ x: number; y: number } | null>(null);
  const aoPressionarPalco = (e: React.PointerEvent) => {
    const alvo = e.target as HTMLElement;
    inicioClique.current = alvo.closest('[data-painel]') ? null : { x: e.clientX, y: e.clientY };
  };
  const aoSoltarPalco = (e: React.PointerEvent) => {
    const inicio = inicioClique.current;
    inicioClique.current = null;
    if (!inicio || larguraPainel === LARGURA_PAINEL) return;
    if (Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) <= TOLERANCIA_CLIQUE) setLarguraPainel(LARGURA_PAINEL);
  };

  const areaCoberta = useMemo(
    () =>
      celular
        ? { direita: 0, baixo: alturaPainelCelular }
        : { direita: aberto ? larguraEfetiva : 0, baixo: 0 },
    [celular, alturaPainelCelular, aberto, larguraEfetiva]
  );

  // Esc sobe um nível
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (estado.tipo !== 'inicio') ir(estadoPai(estado));
      else if (introVisivel) definirIntro(false);
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [estado, ir, introVisivel, definirIntro]);

  const assunto = estado.tipo === 'assunto' || estado.tipo === 'ficha' ? ASSUNTOS[estado.assunto] : null;
  const zonaDaFicha = estado.tipo === 'ficha' ? estado.zona : null;

  const pinturas = useMemo(() => {
    const p: Partial<Record<ZonaId, StatusRegra>> = {};
    assunto?.fichas.forEach((f) => (p[f.zona] = f.status));
    return p;
  }, [assunto]);

  const marcadores = useMemo<Marcador[]>(
    () =>
      assunto?.fichas.map((f) => ({
        zona: f.zona,
        titulo: ZONAS[f.zona].tituloCurto,
        resumo: f.resumoCurto,
        status: f.status,
        ativo: f.zona === zonaDaFicha,
        esmaecido: zonaDaFicha !== null && f.zona !== zonaDaFicha,
      })) ?? [],
    [assunto, zonaDaFicha]
  );

  const assuntosNaPeca = useMemo(
    () => (estado.tipo === 'peca' ? assuntosDaPeca(estado.zona) : []),
    [estado]
  );

  const no = useMemo<NoRamificado | null>(() => {
    if (estado.tipo !== 'peca') return null;
    return {
      zona: estado.zona,
      rotulo: ZONAS[estado.zona].titulo,
      itens: assuntosNaPeca.map(({ assunto: a, ficha }) => ({
        id: a.id,
        titulo: a.tituloCurto ?? a.titulo,
        badge: ficha?.resumoCurto ?? a.resumoCurto,
      })),
    };
  }, [estado, assuntosNaPeca]);

  // Câmera: ficha → a zona; assunto cujas zonas ficam todas dentro de uma peça (Danos) → perto dela;
  // peça → a peça; demais → vista geral
  const zonaFocada: ZonaId | null = (() => {
    if (estado.tipo === 'ficha' || estado.tipo === 'peca') return estado.zona;
    if (assunto && assunto.zonas.length > 0 && assunto.zonas.every((z) => ZONAS[z].subzonaDe)) return assunto.zonas[0];
    return null;
  })();

  const aoTocarZona = useCallback(
    (zona: ZonaId) => {
      if (assunto?.fichas.some((f) => f.zona === zona)) {
        ir({ tipo: 'ficha', tema: assunto.tema, assunto: assunto.id, zona });
        return;
      }
      // No caminhão, só as zonas do assunto respondem (as peças sem assunto são do automóvel)
      if (assunto?.veiculo && assunto.veiculo !== 'automovel') return;
      const peca = pecaDaZona(zona);
      if (estado.tipo === 'peca' && estado.zona === peca) {
        ir(INICIO);
        return;
      }
      if (assuntosDaPeca(peca).length > 0) ir({ tipo: 'peca', tema: 'vidros', zona: peca });
    },
    [assunto, estado, ir]
  );

  const aoEscolherMarcador = useCallback(
    (zona: ZonaId) => {
      if (assunto) ir({ tipo: 'ficha', tema: assunto.tema, assunto: assunto.id, zona });
    },
    [assunto, ir]
  );

  const aoEscolherItemDoNo = useCallback(
    (assuntoId: string) => {
      const item = assuntosNaPeca.find((x) => x.assunto.id === assuntoId);
      if (item) ir(estadoDoAssuntoNaPeca(item));
    },
    [assuntosNaPeca, ir]
  );

  return (
    <div className={styles.appContainer}>
      <SidebarMenu
        estado={estado}
        recolhido={menuRecolhido && !celular}
        onRecolher={celular ? undefined : () => definirMenuRecolhido(true)}
      />
      <main
        ref={palcoRef}
        className={styles.mainStageWrapper}
        onPointerDown={celular ? undefined : aoPressionarPalco}
        onPointerUp={celular ? undefined : aoSoltarPalco}
      >
        {menuRecolhido && !celular && (
          <button type="button" className={styles.abrirMenu} onClick={() => definirMenuRecolhido(false)}>
            <PanelLeftOpen size={18} />
            <span>Menu</span>
          </button>
        )}
        <CarStage
          pinturas={pinturas}
          marcadores={marcadores}
          no={no}
          zonaFocada={zonaFocada}
          mostrarMapaDanos={assunto?.mapa3D === 'danos'}
          veiculo={assunto?.veiculo ?? 'automovel'}
          areaCoberta={areaCoberta}
          onToqueZona={aoTocarZona}
          onMarcador={aoEscolherMarcador}
          onItemNo={aoEscolherItemDoNo}
          dica={
            estado.tipo === 'inicio' && !introVisivel ? (
              <>
                Escolha um <b>assunto</b> no menu ou toque em uma <b>parte do veículo</b>.{' '}
                <button type="button" className={styles.linkIntro} onClick={() => definirIntro(true)}>
                  Sobre a prova da PRF
                </button>
              </>
            ) : null
          }
        />
        <InfoPanel
          estado={estado}
          ir={ir}
          intro={introVisivel}
          onFechar={() => (estado.tipo === 'inicio' ? definirIntro(false) : ir(INICIO))}
          onAlturaCelular={setAlturaPainelCelular}
          largura={larguraEfetiva}
          onLargura={setLarguraPainel}
          larguraMin={LARGURA_PAINEL_MIN}
          larguraMax={larguraMax}
          larguraPadrao={LARGURA_PAINEL}
        />
      </main>
    </div>
  );
}
