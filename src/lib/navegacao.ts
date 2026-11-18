/**
 * Estados de tela e URLs do CTB Virtual.
 *
 * | Estado            | URL                              |
 * |-------------------|----------------------------------|
 * | 0. início         | /                                |
 * | resolução         | /vidros                          |
 * | 1. assunto        | /vidros/peliculas                |
 * | 2. ficha          | /vidros/peliculas/para-brisa     |
 * | 3. peça           | /vidros/para-brisa               |
 *
 * `/[tema]/[slug]` é assunto ou peça conforme o slug: ids de assunto e de zona nunca coincidem.
 */
import type { Assunto, AssuntoId, Ficha, TemaId, ZonaId } from '@/types/conteudo';
import { ASSUNTOS, NORMAS, TEMAS, ZONAS, obterFicha } from '@/data/conteudo';

export type Estado =
  | { tipo: 'inicio' }
  /** Página da resolução do tema (ficha técnica, mapa da norma, linha do tempo). */
  | { tipo: 'tema'; tema: TemaId }
  | { tipo: 'assunto'; tema: TemaId; assunto: AssuntoId }
  | { tipo: 'ficha'; tema: TemaId; assunto: AssuntoId; zona: ZonaId }
  | { tipo: 'peca'; tema: TemaId; zona: ZonaId };

export const INICIO: Estado = { tipo: 'inicio' };

const ehTema = (s: string): s is TemaId => s in TEMAS;
const ehAssunto = (s: string): s is AssuntoId => s in ASSUNTOS;
const ehZona = (s: string): s is ZonaId => s in ZONAS;

/** Assunto com conteúdo publicado (visão geral escrita). */
export const assuntoPublicado = (a: Assunto) => a.visaoGeral !== null;

/** Zona que é uma peça inteira do carro (não uma região dentro de outra). */
export const ehPeca = (zona: ZonaId) => !ZONAS[zona].subzonaDe;

/** Peça à qual a zona pertence (ela mesma, se já for uma peça). */
export const pecaDaZona = (zona: ZonaId): ZonaId => ZONAS[zona].subzonaDe ?? zona;

/** Converte segmentos da URL em estado; `null` se a combinação não existe. */
export function lerSegmentos(segmentos: string[]): Estado | null {
  const s = segmentos.map((x) => decodeURIComponent(x)).filter(Boolean);
  if (s.length === 0) return INICIO;
  const [tema, slug, zona] = s;
  if (!ehTema(tema) || s.length > 3) return null;
  if (!slug) return TEMAS[tema].pagina ? { tipo: 'tema', tema } : null;

  if (ehAssunto(slug)) {
    const assunto = ASSUNTOS[slug];
    if (assunto.tema !== tema || !assuntoPublicado(assunto)) return null;
    if (!zona) return { tipo: 'assunto', tema, assunto: slug };
    if (!ehZona(zona) || !obterFicha(slug, zona)) return null;
    return { tipo: 'ficha', tema, assunto: slug, zona };
  }
  if (ehZona(slug) && !zona && ehPeca(slug) && assuntosDaPeca(slug).length > 0) {
    return { tipo: 'peca', tema, zona: slug };
  }
  return null;
}

export function lerCaminho(caminho: string): Estado | null {
  return lerSegmentos(caminho.split('?')[0].split('/'));
}

export function urlDe(e: Estado): string {
  switch (e.tipo) {
    case 'inicio':
      return '/';
    case 'tema':
      return `/${e.tema}`;
    case 'assunto':
      return `/${e.tema}/${e.assunto}`;
    case 'ficha':
      return `/${e.tema}/${e.assunto}/${e.zona}`;
    case 'peca':
      return `/${e.tema}/${e.zona}`;
  }
}

/** Um nível acima (Esc e "voltar"): ficha → assunto → resolução → início; peça → início. */
export function estadoPai(e: Estado): Estado {
  if (e.tipo === 'ficha') return { tipo: 'assunto', tema: e.tema, assunto: e.assunto };
  if (e.tipo === 'assunto' && TEMAS[e.tema].pagina) return { tipo: 'tema', tema: e.tema };
  return INICIO;
}

export interface AssuntoNaPeca {
  assunto: Assunto;
  /** Ficha do assunto exatamente nesta peça (ex.: Películas no para-brisa). */
  ficha?: Ficha;
}

/**
 * Assuntos que tratam de uma peça: os que têm ficha nela e os que têm fichas em regiões
 * dentro dela (ex.: Danos, nas áreas do para-brisa).
 */
export function assuntosDaPeca(peca: ZonaId): AssuntoNaPeca[] {
  return Object.values(ASSUNTOS)
    // A peça é tocada no automóvel: assuntos do caminhão ficam de fora
    .filter((a) => assuntoPublicado(a) && (a.veiculo ?? 'automovel') === 'automovel')
    .map((a) => ({ assunto: a, ficha: a.fichas.find((f) => f.zona === peca) }))
    .filter(({ assunto, ficha }) => ficha || assunto.zonas.some((z) => ZONAS[z].subzonaDe === peca));
}

/** Para onde levar quem escolhe um assunto a partir de uma peça. */
export function estadoDoAssuntoNaPeca({ assunto, ficha }: AssuntoNaPeca): Estado {
  return ficha
    ? { tipo: 'ficha', tema: assunto.tema, assunto: assunto.id, zona: ficha.zona }
    : { tipo: 'assunto', tema: assunto.tema, assunto: assunto.id };
}

/** Todos os caminhos válidos, para geração estática das páginas. */
export function todosOsEstados(): Estado[] {
  const estados: Estado[] = [INICIO];
  for (const t of Object.values(TEMAS)) if (t.pagina) estados.push({ tipo: 'tema', tema: t.id });
  for (const a of Object.values(ASSUNTOS)) {
    if (!assuntoPublicado(a)) continue;
    estados.push({ tipo: 'assunto', tema: a.tema, assunto: a.id });
    for (const f of a.fichas) estados.push({ tipo: 'ficha', tema: a.tema, assunto: a.id, zona: f.zona });
  }
  for (const z of Object.values(ZONAS)) {
    if (!ehPeca(z.id) || assuntosDaPeca(z.id).length === 0) continue;
    for (const tema of Object.keys(TEMAS) as TemaId[]) estados.push({ tipo: 'peca', tema, zona: z.id });
  }
  return estados;
}

/** Título e descrição de cada estado (aba do navegador e buscadores). */
export function metadadosDe(e: Estado): { titulo: string; descricao: string } {
  switch (e.tipo) {
    case 'inicio':
      return {
        titulo: 'CTB Virtual · Legislação de trânsito para a PRF, em 3D',
        descricao:
          'Resoluções do CONTRAN e o CTB cobrados no concurso da PRF, explicados sobre um carro 3D: pontos de prova, letra da lei e enquadramento de cada infração.',
      };
    case 'tema': {
      const t = TEMAS[e.tema];
      const norma = NORMAS[t.pagina!.norma];
      return {
        titulo: `${norma.sigla}: ${t.titulo} · CTB Virtual`,
        descricao: t.pagina!.resumo,
      };
    }
    case 'assunto': {
      const a = ASSUNTOS[e.assunto];
      return {
        titulo: `${a.titulo} · ${TEMAS[e.tema].titulo} · CTB Virtual`,
        descricao: a.visaoGeral?.resumo ?? a.subtitulo,
      };
    }
    case 'ficha': {
      const a = ASSUNTOS[e.assunto];
      const f = obterFicha(e.assunto, e.zona)!;
      return {
        titulo: `${a.titulo} · ${ZONAS[e.zona].titulo} · CTB Virtual`,
        descricao: `${f.destaque.valor}: ${f.destaque.rotulo}. ${f.essencial.explicacao}`.slice(0, 300),
      };
    }
    case 'peca': {
      const z = ZONAS[e.zona];
      const nomes = assuntosDaPeca(e.zona).map((x) => x.assunto.titulo.toLowerCase());
      return {
        titulo: `${z.titulo} · CTB Virtual`,
        descricao: `O que a norma diz sobre ${z.titulo.toLowerCase()}: ${nomes.join(', ')}.`,
      };
    }
  }
}
