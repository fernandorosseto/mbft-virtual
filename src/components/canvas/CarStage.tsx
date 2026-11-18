'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { LazyMotion, domAnimation } from 'framer-motion';
import type { StatusRegra, Veiculo, ZonaId } from '@/types/conteudo';
import { ZONAS } from '@/data/zonas';
import { STATUS } from '@/data/status';
import { CtbNo, type CtbNoData } from './nodes/CtbNo';
import { Marcadores, type MarcadorVisual, type RegistroMarcadores } from './nodes/Marcadores';
import {
  contornoConvexo,
  disporMarcadores,
  separarCards,
  type CardExibido,
  type EntradaDisposicao,
  type Ponto,
  type Posicionado,
} from './nodes/disposicao';
import { cameraInicial, criarCena } from './three/cena';
import { carregarCarro, type Carro, type Enquadramento, type MalhaVidro } from './three/carro';
import { carregarCaminhao } from './three/caminhao';
import { carregarCaminhaoTrator } from './three/caminhaoTrator';
import { prepararRaios } from './three/raios';
import styles from './CarStage.module.css';

/** Botão numa zona do carro, ligado ao vidro por uma linha animada. */
export type { MarcadorVisual as Marcador } from './nodes/Marcadores';

/** Nó com ramos animados saindo de uma zona, um botão por item (ex.: assuntos de uma peça). */
export interface NoRamificado {
  zona: ZonaId;
  rotulo: string;
  itens: { id: string; titulo: string; badge?: string }[];
}

export interface CarStageProps {
  /** Status de cada zona, usado para colorir os vidros e montar a legenda. */
  pinturas?: Partial<Record<ZonaId, StatusRegra>>;
  marcadores?: MarcadorVisual[];
  no?: NoRamificado | null;
  itemAtivoId?: string | null;
  /** A câmera voa até esta zona; `null` volta à vista geral. */
  zonaFocada?: ZonaId | null;
  /** Exibe o mapa de áreas de danos sobre o para-brisa e passa a classificar toques nele. */
  mostrarMapaDanos?: boolean;
  /**
   * Parte do palco coberta pelo painel, em px: à direita no desktop, embaixo no celular.
   * A vista é deslocada para o carro ficar centrado na área livre, e marcadores que cairiam
   * sob o painel são escondidos.
   */
  areaCoberta?: { direita: number; baixo: number };
  dica?: React.ReactNode;
  /** Veículo no palco. Ao mudar, um sai pela estrada e o outro chega (transição animada). */
  veiculo?: Veiculo;
  onToqueZona: (zona: ZonaId) => void;
  onMarcador?: (zona: ZonaId) => void;
  onItemNo?: (itemId: string) => void;
}

const COR_DESTAQUE = new THREE.Color(0xf2c230);

const ZONA_DA_MALHA: Record<MalhaVidro, ZonaId> = {
  parabrisa: 'para-brisa',
  'vidros-dianteiros': 'laterais-dianteiros',
  'vidros-traseiros': 'laterais-traseiros',
  vigia: 'vigia',
  teto: 'teto',
};

const ehCelular = () =>
  window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches;

/** Quanto a câmera recua, no celular, em relação ao enquadramento da zona. */
const RECUO_CAMERA_CELULAR = 1.35;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const suave = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

/** Troca de veículo: duração e distância percorrida na estrada (o chão tem 9 m de raio). */
const DURACAO_TROCA = 1500;
const DISTANCIA_TROCA = 9;
const ARQUIVOS: Record<Veiculo, string> = {
  automovel: '/models/carro.glb',
  caminhao: '/models/caminhao.glb',
  // Guardado para uso futuro: nenhum assunto usa hoje (ver PLANO.md)
  'caminhao-trator': '/models/cavalo-mecanico.glb',
};
const CARREGADORES: Record<Veiculo, (url: string, onProgresso?: (f: number) => void) => Promise<Carro>> = {
  automovel: (url, p) => carregarCarro(url, p ?? (() => {})),
  caminhao: carregarCaminhao,
  'caminhao-trator': carregarCaminhaoTrator,
};

/** Para onde a câmera vai: a zona focada (enquadramento do veículo, ou o do sedã) ou a vista geral. */
function destinoCamera(c: Carro, zona: ZonaId | null, celular: boolean): Enquadramento {
  if (zona) {
    const proprio = c.enquadrar?.(zona);
    const { posicao: p0, alvo: a0 } = ZONAS[zona].camera;
    const posicao = proprio ? proprio.posicao.clone() : new THREE.Vector3(p0.x, p0.y, p0.z);
    const alvo = proprio ? proprio.alvo.clone() : new THREE.Vector3(a0.x, a0.y, a0.z);
    // Celular em pé: mesmo ângulo, mais distante, para a peça caber na largura
    if (celular) posicao.sub(alvo).multiplyScalar(c.recuoCelular ?? RECUO_CAMERA_CELULAR).add(alvo);
    return { posicao, alvo };
  }
  const vista = c.vista?.(celular) ?? cameraInicial(celular);
  return { posicao: vista.posicao.clone(), alvo: vista.alvo.clone() };
}

// Flutuação dos botões dos marcadores (mesma amplitude dos ramos do nó)
const AMPLITUDE_FLUTUACAO = 6;
const fase = (zona: ZonaId) => Object.keys(ZONAS).indexOf(zona) * 1.7;

export const CarStage: React.FC<CarStageProps> = (props) => {
  const {
    pinturas = {},
    marcadores = [],
    no = null,
    itemAtivoId = null,
    zonaFocada = null,
    areaCoberta,
    dica,
    onMarcador,
    onItemNo,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ancoraNoRef = useRef<HTMLDivElement>(null);
  const legendaRef = useRef<HTMLUListElement>(null);
  const registroRef = useRef<RegistroMarcadores>(new Map());

  const [carregando, setCarregando] = useState(true);
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState(false);
  const [sobreVidro, setSobreVidro] = useState(false);
  // Veículo que está de fato no palco. Enquanto ele difere do pedido (carregando o outro ou na
  // troca), nada do assunto novo aparece: marcadores, nó, legenda e dica esperam o veículo chegar.
  const [veiculoExibido, setVeiculoExibido] = useState<Veiculo>(props.veiculo ?? 'automovel');
  const emTroca = (props.veiculo ?? 'automovel') !== veiculoExibido;

  // Props lidas pelo loop de animação sem recriar a cena
  const propsRef = useRef(props);
  propsRef.current = props;

  // Estado do voo de câmera, alterado quando a zona focada muda
  const vooRef = useRef({
    /** Novo destino a calcular no próximo quadro (zona ou veículo mudou). */
    pendente: true,
    ativo: false,
    inicio: 0,
    duracao: 900,
    posDe: new THREE.Vector3(),
    posPara: new THREE.Vector3(),
    alvoDe: new THREE.Vector3(),
    alvoPara: new THREE.Vector3(),
  });

  // O destino depende do veículo (enquadramentos próprios do caminhão): é calculado no loop
  useEffect(() => {
    vooRef.current.pendente = true;
  }, [zonaFocada]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let montado = true;
    let frame = 0;
    let contadorQuadros = 0;
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduzirMovimento) vooRef.current.duracao = 1;

    const celular = ehCelular();
    const { renderer, scene, camera, controls, sol, sombraContato, dispose: descartarCena } = criarCena(canvas, celular);
    // O voo parte da câmera inicial (a do celular difere da do desktop)
    vooRef.current.posDe.copy(camera.position);
    vooRef.current.alvoDe.copy(controls.target);
    let carro: Carro | null = null;
    // Veículos carregados (o outro vem em segundo plano depois do primeiro)
    const veiculos = new Map<Veiculo, Carro>();
    const pedidos = new Map<Veiculo, Promise<Carro | null>>();
    // Raios acelerados (BVH) do teste de oclusão, montados aos poucos depois do carregamento
    const raiosProntos = new Map<Carro, ReturnType<typeof prepararRaios>>();
    let veiculoAtivo: Veiculo = propsRef.current.veiculo ?? 'automovel';
    let transicao: { inicio: number; saindo: Carro; entrando: Carro; para: Veiculo } | null = null;
    const opacidadesOriginais = new Map<THREE.Material, { opacity: number; transparent: boolean; depthWrite: boolean }>();
    let deslocamentoX = 0;
    let deslocamentoY = 0;
    let malhaSobCursor: MalhaVidro | null = null;
    const registroMarcadores = registroRef.current;
    const ocultos = new Map<ZonaId, boolean>();
    // Posição suavizada de cada botão (evita saltos quando a disposição muda de nível)
    const posicaoBotoes = new Map<ZonaId, { bx: number; by: number; dx: number; dy: number }>();
    // Última posição escolhida por card (a disposição prefere ficar perto dela: estabilidade)
    const escolhaAnterior = new Map<ZonaId, { bx: number; by: number }>();
    let silhueta: Ponto[] = [];
    const memoriaDisposicao = { ordem: 0 };
    // Reaproveita a disposição enquanto pontos e cards não se movem (câmera parada)
    let assinaturaAnterior = '';
    let disposicaoAnterior: Map<ZonaId, Posicionado | null> = new Map();

    const carregarVeiculo = (v: Veiculo, onProgresso?: (f: number) => void): Promise<Carro | null> => {
      const existente = pedidos.get(v);
      if (existente) return existente;
      const carregar = CARREGADORES[v](ARQUIVOS[v], onProgresso);
      const promessa = carregar
        .then((c): Carro | null => {
          if (!montado) {
            c.dispose();
            return null;
          }
          veiculos.set(v, c);
          raiosProntos.set(c, prepararRaios(c.malhas));
          return c;
        })
        .catch((e) => {
          console.error(`Erro ao carregar o modelo 3D (${v}):`, e);
          pedidos.delete(v);
          return null;
        });
      pedidos.set(v, promessa);
      return promessa;
    };

    /** Sombra de contato do tamanho do veículo (a geometria base tem 5,2 × 2,6 m). */
    const ajustarSombra = (c: Carro, x = 0) => {
      sombraContato.scale.set(c.sombra[0] / 5.2, c.sombra[1] / 2.6, 1);
      sombraContato.position.x = x;
    };

    carregarVeiculo(veiculoAtivo, (f) => montado && setProgresso(f)).then((c) => {
      if (!montado) return;
      if (!c) {
        setErro(true);
        setCarregando(false);
        return;
      }
      carro = c;
      scene.add(c.grupo);
      controls.maxDistance = c.distanciaMaxima;
      ajustarSombra(c);
      vooRef.current.pendente = true;
      setCarregando(false);
      // O outro veículo vem em segundo plano, para a troca ser imediata
      window.setTimeout(() => {
        if (montado) carregarVeiculo(veiculoAtivo === 'automovel' ? 'caminhao' : 'automovel');
      }, 1500);
    });

    // ---------- Troca de veículo ----------
    const materiaisDe = (c: Carro) => {
      const lista: THREE.Material[] = [];
      c.grupo.traverse((o) => {
        const objeto = o as THREE.Mesh;
        const ehLinha = (o as THREE.LineSegments).isLineSegments;
        if ((!objeto.isMesh && !ehLinha) || objeto === c.mapaDanos?.malha) return;
        const mats = Array.isArray(objeto.material) ? objeto.material : [objeto.material];
        mats.forEach((m) => m && lista.push(m));
      });
      return lista;
    };
    const prepararTransparencia = (c: Carro) => {
      for (const m of materiaisDe(c)) {
        if (!opacidadesOriginais.has(m)) {
          opacidadesOriginais.set(m, { opacity: m.opacity, transparent: m.transparent, depthWrite: m.depthWrite });
        }
        m.transparent = true;
        m.needsUpdate = true;
      }
    };
    const aplicarOpacidade = (c: Carro, alfa: number) => {
      // Invisível de fato perto de zero (com profundidade ligada, ele ainda taparia o outro)
      c.grupo.visible = alfa > 0.01;
      for (const m of materiaisDe(c)) {
        const o = opacidadesOriginais.get(m);
        if (!o) continue;
        m.opacity = o.opacity * alfa;
        // Mantém a escrita de profundidade: sem ela o veículo semitransparente aparece em
        // "raio-X" (peças internas e de trás atravessando a carroceria)
        m.depthWrite = o.depthWrite;
      }
    };
    const restaurar = (c: Carro) => {
      c.grupo.visible = true;
      for (const m of materiaisDe(c)) {
        const o = opacidadesOriginais.get(m);
        if (!o) continue;
        m.opacity = o.opacity;
        m.transparent = o.transparent;
        m.depthWrite = o.depthWrite;
        m.needsUpdate = true;
        opacidadesOriginais.delete(m);
      }
    };

    const iniciarTransicao = (para: Veiculo, entrando: Carro, agora: number) => {
      if (!carro) return;
      const saindo = carro;
      if (saindo.mapaDanos) {
        saindo.mapaDanos.material.opacity = 0;
        saindo.mapaDanos.malha.visible = false;
      }
      prepararTransparencia(saindo);
      prepararTransparencia(entrando);
      aplicarOpacidade(entrando, 0);
      entrando.grupo.position.x = -DISTANCIA_TROCA;
      scene.add(entrando.grupo);
      controls.maxDistance = Math.max(saindo.distanciaMaxima, entrando.distanciaMaxima);
      transicao = { inicio: agora, saindo, entrando, para };
      // Vidros do que chega partem neutros e ganham as cores do assunto junto com ele
      for (const v of entrando.vidros.values()) {
        v.material.emissiveIntensity = 0;
        (v.borda.material as THREE.LineBasicMaterial).opacity = 0.15;
      }
      if (entrando.mapaDanos) entrando.mapaDanos.material.opacity = 0;
      // A câmera segue para o enquadramento do novo veículo (no lugar final dele) no mesmo tempo
      // e com a mesma curva da chegada, para os dois pararem juntos
      vooRef.current.duracao = reduzirMovimento ? 1 : DURACAO_TROCA;
      vooRef.current.pendente = true;
      setSobreVidro(false);
    };

    const atualizarTransicao = (agora: number) => {
      const t = transicao;
      if (!t) return;
      const k = reduzirMovimento ? 1 : Math.min(1, (agora - t.inicio) / DURACAO_TROCA);
      // Um segue pela estrada e sai; o outro chega por trás e para no centro
      t.saindo.grupo.position.x = easeInCubic(k) * DISTANCIA_TROCA;
      t.entrando.grupo.position.x = -DISTANCIA_TROCA * (1 - easeOutCubic(k));
      // Em sequência, sem os dois semitransparentes ao mesmo tempo: o que sai some primeiro, o que
      // chega aparece nos últimos metros
      aplicarOpacidade(t.saindo, 1 - suave(0.05, 0.42, k));
      const alfaEntrando = suave(0.4, 0.82, k);
      aplicarOpacidade(t.entrando, alfaEntrando);
      // Sombras (do sol e de contato): o mapa de sombras ignora a transparência, então elas somem
      // enquanto os veículos estão em movimento e voltam quando o novo já está no lugar
      const fatorSombra = 1 - suave(0, 0.2, k) + suave(0.75, 1, k);
      sol.shadow.intensity = fatorSombra;
      const referencia = k < 0.5 ? t.saindo : t.entrando;
      ajustarSombra(referencia, referencia.grupo.position.x);
      sombraContato.material.opacity = fatorSombra;
      // Mapa de danos do que chega aparece com ele
      if (t.entrando.mapaDanos) {
        const m = t.entrando.mapaDanos.material;
        m.opacity = propsRef.current.mostrarMapaDanos ? alfaEntrando : 0;
        t.entrando.mapaDanos.malha.visible = m.opacity > 0.01;
      }
      if (k >= 1) {
        scene.remove(t.saindo.grupo);
        t.saindo.grupo.position.x = 0;
        t.entrando.grupo.position.x = 0;
        restaurar(t.saindo);
        restaurar(t.entrando);
        sombraContato.material.opacity = 1;
        sol.shadow.intensity = 1;
        vooRef.current.duracao = reduzirMovimento ? 1 : 900;
        ajustarSombra(t.entrando);
        carro = t.entrando;
        veiculoAtivo = t.para;
        controls.maxDistance = t.entrando.distanciaMaxima;
        transicao = null;
        setVeiculoExibido(t.para);
        // Marcadores recomeçam do zero no veículo novo
        silhueta = [];
        assinaturaAnterior = '';
        ocultos.clear();
        posicaoBotoes.clear();
        escolhaAnterior.clear();
      }
    };

    // ---------- Toque e hover ----------
    const raycaster = new THREE.Raycaster();
    const ponteiro = new THREE.Vector2();
    let toqueInicial: [number, number] | null = null;

    const vidroSobPonteiro = (e: PointerEvent): { malha: MalhaVidro; ponto: THREE.Vector3 } | null => {
      if (!carro || transicao) return null;
      const r = canvas.getBoundingClientRect();
      ponteiro.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      raycaster.setFromCamera(ponteiro, camera);
      const alvos = Array.from(carro.vidros.values()).map((v) => v.malha);
      const hit = raycaster.intersectObjects(alvos, false)[0];
      if (!hit) return null;
      for (const [chave, v] of carro.vidros) if (v.malha === hit.object) return { malha: chave, ponto: hit.point };
      return null;
    };

    const aoPressionar = (e: PointerEvent) => {
      toqueInicial = [e.clientX, e.clientY];
    };
    const aoSoltar = (e: PointerEvent) => {
      if (!toqueInicial) return;
      const arrastou = Math.hypot(e.clientX - toqueInicial[0], e.clientY - toqueInicial[1]) >= 6;
      toqueInicial = null;
      if (arrastou) return;
      const alvo = vidroSobPonteiro(e);
      if (!alvo) return;
      let zona = ZONA_DA_MALHA[alvo.malha];
      if (alvo.malha === 'parabrisa' && propsRef.current.mostrarMapaDanos && carro?.paraBrisa && carro.mapaDanos) {
        zona = carro.mapaDanos.classificar(carro.paraBrisa.worldToLocal(alvo.ponto.clone()));
      }
      propsRef.current.onToqueZona(zona);
    };
    const aoMover = (e: PointerEvent) => {
      malhaSobCursor = vidroSobPonteiro(e)?.malha ?? null;
      setSobreVidro(malhaSobCursor !== null);
    };
    const aoSair = () => {
      malhaSobCursor = null;
      setSobreVidro(false);
    };
    canvas.addEventListener('pointerdown', aoPressionar);
    canvas.addEventListener('pointerup', aoSoltar);
    canvas.addEventListener('pointermove', aoMover);
    canvas.addEventListener('pointerleave', aoSair);

    // ---------- Redimensionamento ----------
    const redimensionar = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const observador = new ResizeObserver(redimensionar);
    observador.observe(container);
    redimensionar();

    // ---------- Loop ----------
    const proj = new THREE.Vector3();
    const corAlvo = new THREE.Color();
    const direcao = new THREE.Vector3();
    const raioOclusao = new THREE.Raycaster();

    /** Posiciona um elemento na projeção do ponto 3D; devolve false se o ponto está fora da tela. */
    const posicionar = (el: HTMLElement, ponto: THREE.Vector3, w: number, h: number) => {
      proj.copy(ponto).project(camera);
      const visivel = proj.z < 1 && Math.abs(proj.x) <= 1.2 && Math.abs(proj.y) <= 1.2;
      el.style.transform = `translate3d(${((proj.x + 1) / 2) * w}px, ${((1 - proj.y) / 2) * h}px, 0)`;
      el.style.visibility = visivel ? 'visible' : 'hidden';
      return visivel;
    };

    raioOclusao.firstHitOnly = true;
    const estaEscondido = (ponto: THREE.Vector3) => {
      // Sem as árvores prontas o teste custaria caro demais (veículo recém-carregado): pula
      if (!carro || !raiosProntos.get(carro)?.pronta()) return false;
      direcao.copy(ponto).sub(camera.position);
      const distancia = direcao.length();
      raioOclusao.set(camera.position, direcao.normalize());
      raioOclusao.far = distancia;
      const hit = raioOclusao.intersectObjects(carro.malhas, false)[0];
      return !!hit && hit.distance < distancia - 0.06;
    };

    const animar = (agora: number) => {
      const p = propsRef.current;
      const voo = vooRef.current;
      const w = container.clientWidth;
      const h = container.clientHeight;

      // Troca de veículo pedida: começa quando o novo estiver carregado. Até lá, o veículo atual
      // fica neutro (sem cores, mapa ou marcadores do assunto novo, que é do outro veículo)
      const pedido = p.veiculo ?? 'automovel';
      const aguardando = !!carro && !transicao && pedido !== veiculoAtivo;
      if (carro && !transicao && pedido !== veiculoAtivo) {
        const novo = veiculos.get(pedido);
        if (novo) iniciarTransicao(pedido, novo, agora);
        else carregarVeiculo(pedido);
      }
      atualizarTransicao(agora);

      // Novo destino da câmera (zona ou veículo mudou), calculado com o veículo que fica em cena
      const destino = transicao?.entrando ?? carro;
      if (voo.pendente && destino) {
        const { posicao, alvo } = destinoCamera(destino, p.zonaFocada ?? null, celular);
        voo.posPara.copy(posicao);
        voo.alvoPara.copy(alvo);
        voo.posDe.copy(camera.position);
        voo.alvoDe.copy(controls.target);
        voo.inicio = agora;
        voo.ativo = true;
        voo.pendente = false;
      }

      // Voo da câmera
      // posDe/alvoDe acompanham a câmera enquanto não há voo, então o voo parte de onde ela está.
      if (voo.ativo) {
        const t = easeOutCubic(Math.min(1, (agora - voo.inicio) / voo.duracao));
        camera.position.lerpVectors(voo.posDe, voo.posPara, t);
        controls.target.lerpVectors(voo.alvoDe, voo.alvoPara, t);
        if (t >= 1) voo.ativo = false;
      } else {
        voo.posDe.copy(camera.position);
        voo.alvoDe.copy(controls.target);
      }
      controls.update();

      // Desloca a vista para o carro ficar centrado na área que o painel não cobre:
      // renderiza uma imagem maior (w + dx, h + dy) e mostra só a parte livre.
      const coberta = p.areaCoberta ?? { direita: 0, baixo: 0 };
      const suavizarVista = reduzirMovimento ? 1 : 0.12;
      deslocamentoX += (coberta.direita - deslocamentoX) * suavizarVista;
      deslocamentoY += (coberta.baixo - deslocamentoY) * suavizarVista;
      if (deslocamentoX > 1 || deslocamentoY > 1) {
        camera.setViewOffset(w + deslocamentoX, h + deslocamentoY, deslocamentoX, deslocamentoY, w, h);
      } else {
        camera.clearViewOffset();
      }
      // Limite inferior da área livre (marcadores abaixo dele ficariam sob o painel)
      const limiteVisivel = h - coberta.baixo - 8;
      const larguraLivre = w - coberta.direita;

      if (transicao || aguardando) {
        // Durante a troca, nada fica preso ao veículo: marcadores e nó somem
        registroMarcadores.forEach((el) => el.atualizar({ ax: 0, ay: 0, bx: 0, by: 0, ex: 0, ey: 0, visivel: false, oculto: false }));
        if (ancoraNoRef.current) ancoraNoRef.current.style.visibility = 'hidden';
        if (aguardando && carro) {
          for (const v of carro.vidros.values()) v.material.emissiveIntensity *= 0.85;
          if (carro.mapaDanos) {
            const m = carro.mapaDanos.material;
            m.opacity *= 0.8;
            carro.mapaDanos.malha.visible = m.opacity > 0.01;
          }
        }
      } else if (carro) {
        const pinturasAtuais = p.pinturas ?? {};
        const zonaEmFoco = p.zonaFocada ?? p.no?.zona ?? null;
        const malhaEmFoco = zonaEmFoco ? ZONAS[zonaEmFoco].malha : null;
        const algumaPintura = Object.keys(pinturasAtuais).length > 0;

        // Vidros: cor por status, destaque na zona focada/hover, mapa de danos no para-brisa
        for (const [chave, vidro] of carro.vidros) {
          const zonaPrincipal = ZONA_DA_MALHA[chave];
          const status = pinturasAtuais[zonaPrincipal];
          const destacado = chave === malhaEmFoco || chave === malhaSobCursor;
          const mapaAtivo = chave === 'parabrisa' && !!p.mostrarMapaDanos;
          let intensidade = 0;
          if (mapaAtivo) {
            corAlvo.copy(COR_DESTAQUE);
          } else if (status) {
            corAlvo.set(STATUS[status].cor);
            intensidade = destacado ? 0.75 : malhaEmFoco ? 0.3 : 0.5;
          } else {
            corAlvo.copy(COR_DESTAQUE);
            intensidade = destacado ? 0.35 : 0;
          }
          vidro.material.emissive.lerp(corAlvo, 0.15);
          vidro.material.emissiveIntensity += (intensidade - vidro.material.emissiveIntensity) * 0.15;
          const bordaMat = vidro.borda.material as THREE.LineBasicMaterial;
          const opacidadeBorda = destacado ? 1 : status && algumaPintura ? 0.5 : 0.15;
          bordaMat.opacity += (opacidadeBorda - bordaMat.opacity) * 0.15;
        }

        if (carro.mapaDanos) {
          const m = carro.mapaDanos.material;
          m.opacity += ((p.mostrarMapaDanos ? 1 : 0) - m.opacity) * 0.18;
          carro.mapaDanos.malha.visible = m.opacity > 0.01;
        }

        // Elementos HTML presos ao carro
        const lado: 1 | -1 = camera.position.z >= 0 ? 1 : -1;
        const testarOclusao = contadorQuadros++ % 8 === 0;

        if (p.no && ancoraNoRef.current) {
          const ponto = carro.ancora(p.no.zona, lado);
          if (ponto && posicionar(ancoraNoRef.current, ponto, w, h)) {
            proj.copy(ponto).project(camera);
            if (((1 - proj.y) / 2) * h > limiteVisivel) ancoraNoRef.current.style.visibility = 'hidden';
          }
        }

        // Marcadores: ponto no vidro → linha → botão disposto sem sobreposição
        const entradas: EntradaDisposicao<ZonaId>[] = [];
        const pontos = new Map<ZonaId, { ax: number; ay: number; visivel: boolean }>();
        registroMarcadores.forEach((el, zona) => {
          const ponto = carro!.ancora(zona, lado);
          if (!ponto) {
            pontos.set(zona, { ax: 0, ay: 0, visivel: false });
            return;
          }
          proj.copy(ponto).project(camera);
          const ax = ((proj.x + 1) / 2) * w;
          const ay = ((1 - proj.y) / 2) * h;
          const visivel = proj.z < 1 && ax > 0 && ax < larguraLivre && ay > 0 && ay < limiteVisivel;
          pontos.set(zona, { ax, ay, visivel });
          if (visivel) {
            if (testarOclusao) ocultos.set(zona, estaEscondido(ponto));
            entradas.push({
              chave: zona,
              ax,
              ay,
              w: el.botao?.offsetWidth ?? 120,
              h: el.botao?.offsetHeight ?? 48,
              atras: !!ocultos.get(zona),
              ativo: !!p.marcadores?.find((m) => m.zona === zona)?.ativo,
            });
          }
        });
        const leg = legendaRef.current;
        const areaLegenda = leg ? { x: leg.offsetLeft, y: leg.offsetTop, w: leg.offsetWidth, h: leg.offsetHeight } : null;
        // Silhueta do carro na tela (recalculada junto com a oclusão, a cada 8 quadros)
        if (testarOclusao || silhueta.length === 0) {
          silhueta = contornoConvexo(
            carro.amostraSilhueta.map((v) => {
              proj.copy(v).project(camera);
              return { x: ((proj.x + 1) / 2) * w, y: ((1 - proj.y) / 2) * h };
            })
          );
        }
        // Flutuação menor no celular, para a folga entre cards poder ser menor na tela estreita
        const amplitude = reduzirMovimento ? 0 : larguraLivre < 600 ? AMPLITUDE_FLUTUACAO / 2 : AMPLITUDE_FLUTUACAO;
        const assinatura =
          entradas.map((e) => `${e.chave}${Math.round(e.ax)},${Math.round(e.ay)},${e.w},${e.h},${e.atras ? 1 : 0}${e.ativo ? 1 : 0}`).join('|') +
          `#${Math.round(larguraLivre)},${Math.round(limiteVisivel)},${areaLegenda ? `${areaLegenda.x},${areaLegenda.y}` : ''}`;
        const explorarOrdens = contadorQuadros % 15 === 0;
        const disposicao =
          assinatura === assinaturaAnterior && !explorarOrdens
            ? disposicaoAnterior
            : disporMarcadores(entradas, {
                folga: amplitude * 2 + 4,
                memoria: memoriaDisposicao,
                explorarOrdens,
                largura: larguraLivre,
                limiteInferior: limiteVisivel,
                reservadas: areaLegenda ? [areaLegenda] : [],
                carro: silhueta,
                anteriores: escolhaAnterior,
              });
        assinaturaAnterior = assinatura;
        disposicaoAnterior = disposicao;
        const suavizar = reduzirMovimento ? 1 : 0.2;

        // 1) posição suavizada + flutuação de cada card visível
        const exibidos: CardExibido<ZonaId>[] = [];
        const t = agora * 0.001;
        registroMarcadores.forEach((el, zona) => {
          const alvo = disposicao.get(zona);
          let atual = posicaoBotoes.get(zona);
          if (!alvo) {
            escolhaAnterior.delete(zona);
            return;
          }
          escolhaAnterior.set(zona, { bx: alvo.bx, by: alvo.by });
          if (!atual) {
            atual = { ...alvo };
            posicaoBotoes.set(zona, atual);
          }
          atual.bx += (alvo.bx - atual.bx) * suavizar;
          atual.by += (alvo.by - atual.by) * suavizar;
          atual.dx += (alvo.dx - atual.dx) * suavizar;
          atual.dy += (alvo.dy - atual.dy) * suavizar;
          const entrada = entradas.find((e) => e.chave === zona);
          exibidos.push({
            chave: zona,
            x: atual.bx + amplitude * Math.sin(t * 0.8 + fase(zona)),
            y: atual.by + amplitude * Math.sin(t * 0.95 + fase(zona) * 1.3),
            w: entrada?.w ?? 120,
            h: entrada?.h ?? 48,
            // ativo > visível > atrás da carroceria
            prioridade: entrada?.ativo ? 2 : entrada?.atras ? 0 : 1,
          });
        });

        // 2) garantia: nenhum card encosta em outro na tela, nem durante o movimento
        let ocultosPorFaltaDeEspaco = separarCards(exibidos, 6, larguraLivre, limiteVisivel);
        if (ocultosPorFaltaDeEspaco.size > 0) {
          // A separação não resolveu (cards espremidos no caminho): em vez de esconder alguém,
          // encaixa todos direto nas posições-alvo, que nunca se tocam.
          for (const c of exibidos) {
            const alvo = disposicao.get(c.chave);
            const atual = posicaoBotoes.get(c.chave);
            if (!alvo || !atual) continue;
            Object.assign(atual, alvo);
            c.x = alvo.bx + amplitude * Math.sin(t * 0.8 + fase(c.chave));
            c.y = alvo.by + amplitude * Math.sin(t * 0.95 + fase(c.chave) * 1.3);
          }
          ocultosPorFaltaDeEspaco = separarCards(exibidos, 6, larguraLivre, limiteVisivel);
        }

        // 3) aplica; a correção volta para a posição suavizada (o próximo quadro parte dela)
        registroMarcadores.forEach((el, zona) => {
          const pt = pontos.get(zona)!;
          const card = ocultosPorFaltaDeEspaco.has(zona) ? undefined : exibidos.find((c) => c.chave === zona);
          const atual = posicaoBotoes.get(zona);
          if (card && atual) {
            const ox = amplitude * Math.sin(t * 0.8 + fase(zona));
            const oy = amplitude * Math.sin(t * 0.95 + fase(zona) * 1.3);
            atual.bx = card.x - ox;
            atual.by = card.y - oy;
          }
          el.atualizar({
            ax: pt.ax,
            ay: pt.ay,
            bx: card?.x ?? 0,
            by: card?.y ?? 0,
            ex: (card?.x ?? 0) + (atual?.dx ?? 0),
            ey: (card?.y ?? 0) + (atual?.dy ?? 0),
            visivel: pt.visivel && !!card,
            oculto: !!ocultos.get(zona),
          });
        });
      }

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animar);
    };
    frame = requestAnimationFrame(animar);

    return () => {
      montado = false;
      cancelAnimationFrame(frame);
      observador.disconnect();
      canvas.removeEventListener('pointerdown', aoPressionar);
      canvas.removeEventListener('pointerup', aoSoltar);
      canvas.removeEventListener('pointermove', aoMover);
      canvas.removeEventListener('pointerleave', aoSair);
      raiosProntos.forEach((r) => r.cancelar());
      veiculos.forEach((c) => {
        scene.remove(c.grupo);
        c.dispose();
      });
      descartarCena();
    };
  }, []);

  const areaBaixo = areaCoberta?.baixo ?? 0;
  const statusNaLegenda = Array.from(new Set(Object.values(pinturas))).filter(Boolean) as StatusRegra[];
  const dadosNo: CtbNoData | null = no
    ? { id: no.zona, rotulo: no.rotulo, topicos: no.itens.map((i) => ({ id: i.id, titulo: i.titulo, badge: i.badge })) }
    : null;

  return (
    <div ref={containerRef} className={styles.stageContainer}>
      <canvas
        ref={canvasRef}
        className={`${styles.canvas} ${sobreVidro ? styles.canvasHover : ''}`}
        aria-label="Visualizador 3D do veículo. Toque nos vidros para ver as regras do CONTRAN."
      />

      {carregando && (
        <div className={styles.loadingOverlay} role="status">
          <span>Carregando o veículo 3D</span>
          <div className={styles.barraProgresso} aria-hidden="true">
            <div className={styles.barraPreenchida} style={{ transform: `scaleX(${progresso})` }} />
          </div>
          <span className={styles.percentual}>{Math.round(progresso * 100)}%</span>
        </div>
      )}
      {erro && (
        <div className={styles.loadingOverlay} role="alert">
          <span>Não foi possível carregar o veículo 3D. Recarregue a página.</span>
        </div>
      )}

      <LazyMotion features={domAnimation} strict>
        {!carregando && !emTroca && (
          <Marcadores
            marcadores={marcadores}
            registro={registroRef.current}
            onMarcador={onMarcador}
          />
        )}
        <CtbNo
          anchorRef={ancoraNoRef}
          no={dadosNo ?? { id: 'vazio', rotulo: '', topicos: [] }}
          aberto={!carregando && !emTroca && !!dadosNo}
          topicoAtivoId={itemAtivoId}
          onTopico={(id) => onItemNo?.(id)}
        />
      </LazyMotion>

      {!carregando && !emTroca && statusNaLegenda.length > 0 && (
        <ul
          ref={legendaRef}
          className={styles.legenda}
          aria-label="Legenda das cores"
          // Com o painel embaixo (celular), a legenda vai para o pé da área livre: o topo fica para os botões
          style={areaBaixo > 0 ? { top: 'auto', bottom: areaBaixo + 10 } : undefined}
        >
          {statusNaLegenda.map((s) => (
            <li key={s}>
              <span className={styles.legendaCor} style={{ background: STATUS[s].cor }} />
              {STATUS[s].rotulo}
            </li>
          ))}
        </ul>
      )}

      {!carregando && !emTroca && dica && <div className={styles.hint}>{dica}</div>}
    </div>
  );
};
