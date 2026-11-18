/**
 * Modelo de conteúdo do CTB Virtual.
 *
 * Hierarquia de navegação:  Tema → Assunto → Zona  (a combinação Assunto × Zona é uma Ficha)
 *
 * - Tema:        grande área do veículo coberta por uma ou mais normas (ex.: Vidros).
 * - Assunto:     recorte temático extraído das normas (ex.: Películas, Danos no para-brisa).
 * - Zona:        região do carro onde a regra se aplica. Pode ser uma peça inteira
 *                (para-brisa, vigia) ou uma região dentro de uma peça (área crítica do para-brisa).
 * - Ficha:       o conteúdo completo de um assunto numa zona (ex.: Películas no para-brisa).
 * - Dispositivo: trecho literal de uma norma (artigo, inciso, parágrafo), cadastrado uma única vez
 *                em src/data/normas/dispositivos.ts e apenas referenciado pelas fichas.
 * - Infração:    enquadramento no CTB (natureza, pontos, multa, medida administrativa).
 *
 * Conteúdo único, voltado ao candidato da PRF: resumo essencial, pontos de prova e letra da lei.
 */

import type { DispositivoId } from '@/data/normas/dispositivos';
import type { InfracaoId } from '@/data/normas/infracoes';

export type NormaId = 'res960' | 'res989' | 'ctb';

export interface Norma {
  id: NormaId;
  titulo: string;
  /** Rótulo curto para citações: "Res. CONTRAN 960/2022" */
  sigla: string;
  publicacao: string;
  vigencia: string;
  url: string;
}

/**
 * Arquivo de texto (em docs/normas/) contra o qual o texto literal do dispositivo é conferido
 * por `npm run verificar:citacoes`. `null` significa que ainda não há cópia oficial no
 * repositório, e o dispositivo aparece como pendente de conferência.
 */
export type FonteTexto = 'res960' | 'res989' | 'ctb' | null;

export interface Dispositivo {
  norma: NormaId;
  /** Citação completa: "Res. CONTRAN 960/2022, art. 4º, I" */
  rotulo: string;
  /** Texto literal, exatamente como publicado. */
  texto: string;
  /**
   * Id do dispositivo "pai" (caput, inciso) exibido antes do texto para dar contexto.
   * É `string` (e não DispositivoId) para evitar referência circular de tipos;
   * a existência do id é conferida por validarConteudo().
   */
  contexto?: string;
  /** Ex.: "Redação dada pela Res. CONTRAN 989/2022". */
  redacao?: string;
  /** Preenchido quando o texto não está mais em vigor. */
  revogadoPor?: string;
  vigencia?: string;
  fonte: FonteTexto;
}

export interface Infracao {
  /** Dispositivo do CTB que tipifica a conduta. */
  dispositivo: DispositivoId;
  natureza: 'Leve' | 'Média' | 'Grave' | 'Gravíssima';
  pontos: number;
  valor: string;
  penalidade: string;
  medida: string;
  /** Dispositivos que fixam a sanção, o valor da multa e a pontuação. */
  fundamentos: DispositivoId[];
}

/** Situação concreta que gera autuação, ligando a ficha à infração e à regra da Resolução que a enquadra. */
export interface Enquadramento {
  situacao: string;
  infracao: InfracaoId;
  /** Dispositivo da Resolução que remete ao CTB (ex.: Res. 960, art. 21, III, "b"). */
  base?: DispositivoId;
}

export type TemaId = 'vidros';

export type AssuntoId =
  | 'peliculas'
  | 'danos'
  // Ainda sem conteúdo:
  | 'medicao'
  | 'vidro-seguranca'
  | 'inscricoes'
  | 'danos-pesados';

/**
 * Veículo mostrado no palco 3D. O caminhão (de carga, com carroceria) aparece só nos assuntos com
 * regra própria para pesados. O `caminhao-trator` (cavalo mecânico) fica disponível, mas nenhum
 * assunto o usa hoje.
 */
export type Veiculo = 'automovel' | 'caminhao' | 'caminhao-trator';

export type ZonaId =
  | 'para-brisa'
  | 'laterais-dianteiros'
  | 'laterais-traseiros'
  | 'vigia'
  | 'teto'
  | 'para-brisa-area-critica'
  | 'para-brisa-faixa-periferica'
  | 'para-brisa-demais-areas';

/** Malhas de vidro do carro 3D (`teto` é o teto solar criado em three/carro.ts). */
export type Malha3D = 'parabrisa' | 'vidros-dianteiros' | 'vidros-traseiros' | 'vigia' | 'teto';

/** Como a regra se apresenta na zona; usado para colorir o carro e o botão. */
export type StatusRegra =
  | 'limite' //            há um mínimo/limite objetivo a cumprir (ex.: 70%)
  | 'livre-condicional' // liberado se cumprida uma condição (ex.: retrovisores dos dois lados)
  | 'livre' //             fora dos limites da norma
  | 'proibido' //          nada é tolerado (ex.: dano na área crítica)
  | 'exigencia'; //        exigência de material ou característica (ex.: vidro laminado no para-brisa)

export interface Vetor3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Enquadramento da câmera ao focar a zona. No celular, o CarStage usa o mesmo alvo e recua a
 * câmera (tela estreita); a vista é deslocada para a área que o painel não cobre.
 */
export interface EnquadramentoCamera {
  posicao: Vetor3;
  alvo: Vetor3;
}

export interface Zona {
  id: ZonaId;
  titulo: string;
  /** Até ~12 caracteres, para botões e abas no celular. */
  tituloCurto: string;
  descricao: string;
  /** Peça física onde a zona fica; zonas internas do para-brisa apontam para 'parabrisa'. */
  malha: Malha3D;
  /** Zona "mãe" quando esta é uma região dentro de uma peça (ex.: área crítica → para-brisa). */
  subzonaDe?: ZonaId;
  camera: EnquadramentoCamera;
}

export interface Destaque {
  valor: string;
  rotulo: string;
  detalhe: string;
}

/** O essencial da regra, em linguagem direta, para fixar antes dos detalhes de prova. */
export interface ConteudoEssencial {
  /** Explicação em linguagem simples, sem citação de artigos no meio do texto. */
  explicacao: string;
  pode: string[];
  naoPode: string[];
  /** O que se verifica na fiscalização, sempre com base no texto da norma. */
  naFiscalizacao?: string[];
}

export interface ConteudoProva {
  /** Pontos de prova e pegadinhas, já com a referência normativa. */
  pontosDeProva: string[];
  /** Mudanças de redação ao longo do tempo. */
  historico?: string[];
  /** Pontos em que a norma é omissa ou ambígua. */
  atencao?: string[];
}

export interface Ficha {
  assunto: AssuntoId;
  zona: ZonaId;
  /** Substitui a descrição da zona no cabeçalho, quando ela muda com o veículo. */
  descricaoZona?: string;
  status: StatusRegra;
  /** Texto do botão no carro: o cerne da regra em até ~12 caracteres ("mín. 70%"). */
  resumoCurto: string;
  destaque: Destaque;
  essencial: ConteudoEssencial;
  prova: ConteudoProva;
  /** Fundamentos, do principal para o acessório. */
  dispositivos: DispositivoId[];
  enquadramentos: Enquadramento[];
}

export interface RegraDanoPorVeiculo {
  rotulo: string;
  areaCritica: string;
  maxDanos: string;
  maxTrinca: string;
  maxFraturaCircular: string;
  faixaPeriferica: string;
  base: string;
}

export interface VisaoGeralAssunto {
  /** A regra em uma frase. */
  resumo: string;
  destaque: Destaque;
  essencial: ConteudoEssencial;
  prova: ConteudoProva;
  dispositivos: DispositivoId[];
  enquadramentos: Enquadramento[];
  comparativoVeiculos?: {
    passeio: RegraDanoPorVeiculo;
    pesados: RegraDanoPorVeiculo;
  };
}

// ---------------------------------------------------------------------------
// Aula do assunto (padrão de conteúdo, PLANO.md seção 3.4)
// ---------------------------------------------------------------------------

/**
 * Tópico da teoria. Os textos aceitam **negrito** (dois asteriscos) e citam o dispositivo
 * entre parênteses, no padrão "(art. 4º, I)".
 */
export interface TopicoTeoria {
  titulo: string;
  paragrafos: string[];
  itens?: string[];
}

/** Itens visuais do painel (quadros, esquemas e ferramentas interativas). */
export type Visual =
  | {
      tipo: 'tabela';
      titulo: string;
      colunas: string[];
      linhas: string[][];
      nota?: string;
    }
  | { tipo: 'linhaDoTempo'; titulo: string; eventos: { data: string; texto: string }[] }
  /** Comparativo de danos no para-brisa (usa `visaoGeral.comparativoVeiculos`). */
  | { tipo: 'mapaDanos' }
  /** Simulador do Valor Considerado (VC = MR + 7%). */
  | { tipo: 'calculadoraVC' };

export interface Questao {
  /** Estável: servirá para guardar o progresso do aluno. */
  id: string;
  /** Afirmação a julgar, no estilo da banca (Certo ou Errado). */
  enunciado: string;
  gabarito: 'C' | 'E';
  comentario: string;
  dispositivos: DispositivoId[];
}

export interface Conexao {
  titulo: string;
  texto: string;
  dispositivos?: DispositivoId[];
}

export interface Aula {
  teoria: TopicoTeoria[];
  visuais: Visual[];
  conexoes: Conexao[];
  /** Frases-chave para a véspera da prova (base dos flashcards). */
  revisao: string[];
  questoes: Questao[];
}

export interface Assunto {
  id: AssuntoId;
  tema: TemaId;
  titulo: string;
  /** Nome curto para botões e abas quando a peça já está clara (ex.: "Danos", no para-brisa). */
  tituloCurto?: string;
  subtitulo: string;
  /** Camada visual extra no carro (ex.: mapa de áreas de danos sobre o para-brisa). */
  mapa3D?: 'danos';
  /** Veículo do palco (padrão: automóvel). Ao trocar de assunto, o palco faz a transição. */
  veiculo?: Veiculo;
  /**
   * Resumo de até ~12 caracteres do assunto como um todo, usado quando ele aparece como item de
   * uma peça sem ter ficha própria nela (ex.: Danos, no para-brisa).
   */
  resumoCurto?: string;
  /** Ordem dos botões no carro. */
  zonas: ZonaId[];
  visaoGeral: VisaoGeralAssunto | null;
  /** Aula completa (abas Teoria, Lei e Questões). */
  aula?: Aula;
  fichas: Ficha[];
}

/**
 * Gratuito ou pago. Por enquanto só marca a interface; antes de cobrar, o conteúdo pago precisa
 * vir do servidor (ver PLANO.md).
 */
export type Acesso = 'gratis' | 'pago';

/** Um trecho da norma no mapa da resolução: onde cada artigo é explicado. */
export interface ItemMapa {
  /** Rótulo exibido: "Arts. 13 a 16". */
  rotulo: string;
  /** Números dos artigos cobertos (conferidos contra o texto oficial). */
  artigos: number[];
  resumo: string;
  /** Assunto que explica o trecho; `null` = explicado na própria página da resolução. */
  assunto: AssuntoId | null;
}

/** Página da resolução (porta de entrada da norma). */
export interface PaginaResolucao {
  /** Norma principal; o mapa precisa cobrir todos os artigos dela. */
  norma: NormaId;
  resumo: string;
  fichaTecnica: { rotulo: string; valor: string }[];
  porQueCai: string[];
  /** Alcance da norma e disposições gerais, explicados na própria página. */
  alcance: TopicoTeoria[];
  mapa: ItemMapa[];
  linhaDoTempo: { data: string; texto: string }[];
  /** Letra da lei mostrada na página (objeto, alcance, revogações, vigência). */
  dispositivos: DispositivoId[];
}

export interface Tema {
  id: TemaId;
  titulo: string;
  subtitulo: string;
  acesso: Acesso;
  normas: NormaId[];
  assuntos: AssuntoId[];
  pagina?: PaginaResolucao;
}

/** Temas previstos que ainda não têm conteúdo, exibidos como "em breve" no menu. */
export interface TemaFuturo {
  id: string;
  titulo: string;
  subtitulo: string;
  normaPrevista: string;
  acesso: Acesso;
}
