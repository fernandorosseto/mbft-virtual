import type {
  Assunto,
  AssuntoId,
  Ficha,
  Tema,
  TemaFuturo,
  TemaId,
  ZonaId,
} from '@/types/conteudo';
import { DISPOSITIVOS, type DispositivoId } from './normas/dispositivos';
import { INFRACOES } from './normas/infracoes';
import { ZONAS } from './zonas';
import { vidros, assuntosVidros } from './temas/vidros';

export { ZONAS } from './zonas';
export { NORMAS } from './normas/normas';
export { DISPOSITIVOS, textoComContexto, type DispositivoId } from './normas/dispositivos';
export { INFRACOES, type InfracaoId } from './normas/infracoes';

export const TEMAS: Record<TemaId, Tema> = { vidros };

/** Próximos temas, na ordem do roteiro (PLANO.md, seção 8). Gratuitos: Vidros, Placas e Iluminação. */
export const TEMAS_FUTUROS: TemaFuturo[] = [
  {
    id: 'placas-identificacao',
    titulo: 'Placas de identificação (PIV)',
    subtitulo: 'Padrão Mercosul, QR Code e lacres',
    normaPrevista: 'Res. CONTRAN 969/2022',
    acesso: 'gratis',
  },
  {
    id: 'iluminacao-sinalizacao',
    titulo: 'Sinalização e iluminação',
    subtitulo: 'Faróis, luzes de rodagem diurna (DRL) e lanternas',
    normaPrevista: 'Res. CONTRAN 970/2022',
    acesso: 'gratis',
  },
  {
    id: 'alcool',
    titulo: 'Álcool e fiscalização',
    subtitulo: 'Fiscalização do consumo de álcool e outras substâncias',
    normaPrevista: 'Res. CONTRAN 1.031/2026',
    acesso: 'pago',
  },
  {
    id: 'equipamentos-obrigatorios',
    titulo: 'Equipamentos obrigatórios',
    subtitulo: 'Retrovisores, pneus, estepe, buzina e cinto',
    normaPrevista: 'Res. CONTRAN 993/2023',
    acesso: 'pago',
  },
];

export const ASSUNTOS: Record<AssuntoId, Assunto> = Object.fromEntries(
  assuntosVidros.map((a) => [a.id, a])
) as Record<AssuntoId, Assunto>;

export function obterAssunto(id: AssuntoId): Assunto {
  return ASSUNTOS[id];
}

export function obterFicha(assunto: AssuntoId, zona: ZonaId): Ficha | undefined {
  return ASSUNTOS[assunto]?.fichas.find((f) => f.zona === zona);
}

/** Assuntos do tema, na ordem do menu. */
export function assuntosDoTema(tema: TemaId): Assunto[] {
  return TEMAS[tema].assuntos.map((id) => ASSUNTOS[id]);
}

/** Todas as fichas de uma zona (para o toque direto no carro, sem assunto escolhido). */
export function fichasDaZona(zona: ZonaId): Ficha[] {
  return Object.values(ASSUNTOS).flatMap((a) => a.fichas.filter((f) => f.zona === zona));
}

const LIMITE_ROTULO_CURTO = 12;
const MIN_QUESTOES = 5;
const MIN_REVISAO = 5;

/**
 * Confere a consistência interna do conteúdo. Retorna a lista de problemas encontrados
 * (vazia quando está tudo certo). Usado por `npm run verificar:citacoes`.
 */
export function validarConteudo(): string[] {
  const erros: string[] = [];
  const ids = new Set(Object.keys(DISPOSITIVOS));

  for (const [id, d] of Object.entries(DISPOSITIVOS) as [DispositivoId, (typeof DISPOSITIVOS)[DispositivoId]][]) {
    const extra = d as { contexto?: string; revogadoPor?: string };
    if (extra.contexto && !ids.has(extra.contexto)) erros.push(`${id}: contexto inexistente "${extra.contexto}"`);
    if (extra.revogadoPor && !ids.has(extra.revogadoPor))
      erros.push(`${id}: revogadoPor inexistente "${extra.revogadoPor}"`);
  }

  for (const [id, infracao] of Object.entries(INFRACOES)) {
    if (!ids.has(infracao.dispositivo)) erros.push(`infração ${id}: dispositivo inexistente`);
    for (const f of infracao.fundamentos) {
      if (!ids.has(f)) erros.push(`infração ${id}: fundamento inexistente "${f}"`);
    }
  }

  for (const z of Object.values(ZONAS)) {
    if (z.tituloCurto.length > LIMITE_ROTULO_CURTO)
      erros.push(`zona ${z.id}: tituloCurto com mais de ${LIMITE_ROTULO_CURTO} caracteres`);
  }

  for (const tema of Object.values(TEMAS)) {
    for (const item of tema.pagina?.mapa ?? []) {
      if (item.assunto && !ASSUNTOS[item.assunto]?.visaoGeral)
        erros.push(`tema ${tema.id}: mapa aponta para assunto não publicado "${item.assunto}"`);
    }
    for (const assuntoId of tema.assuntos) {
      const assunto = ASSUNTOS[assuntoId];
      if (!assunto) {
        erros.push(`tema ${tema.id}: assunto inexistente "${assuntoId}"`);
        continue;
      }
      if (assunto.tema !== tema.id) erros.push(`assunto ${assunto.id}: tema divergente`);
    }
  }

  const questoesVistas = new Set<string>();
  for (const assunto of Object.values(ASSUNTOS)) {
    const zonasComFicha = assunto.fichas.map((f) => f.zona);
    for (const zona of assunto.zonas) {
      if (!zonasComFicha.includes(zona)) erros.push(`assunto ${assunto.id}: zona "${zona}" sem ficha`);
    }
    for (const ficha of assunto.fichas) {
      const rotulo = `${assunto.id}/${ficha.zona}`;
      if (ficha.assunto !== assunto.id) erros.push(`${rotulo}: ficha aponta para outro assunto`);
      if (!assunto.zonas.includes(ficha.zona)) erros.push(`${rotulo}: zona fora da lista do assunto`);
      if (zonasComFicha.filter((z) => z === ficha.zona).length > 1) erros.push(`${rotulo}: ficha duplicada`);
      if (ficha.resumoCurto.length > LIMITE_ROTULO_CURTO)
        erros.push(`${rotulo}: resumoCurto com mais de ${LIMITE_ROTULO_CURTO} caracteres`);
      if (ficha.dispositivos.length === 0) erros.push(`${rotulo}: sem dispositivos`);
    }
    if (assunto.resumoCurto && assunto.resumoCurto.length > LIMITE_ROTULO_CURTO)
      erros.push(`assunto ${assunto.id}: resumoCurto com mais de ${LIMITE_ROTULO_CURTO} caracteres`);
    if (!assunto.visaoGeral && assunto.fichas.length > 0)
      erros.push(`assunto ${assunto.id}: fichas sem visão geral`);

    // Padrão de conteúdo (PLANO.md, seção 3.4): mínimo exigido de cada assunto publicado
    if (assunto.visaoGeral) {
      const aula = assunto.aula;
      if (!aula) {
        erros.push(`assunto ${assunto.id}: publicado sem aula`);
      } else {
        if (aula.teoria.length === 0) erros.push(`assunto ${assunto.id}: aula sem teoria`);
        if (aula.visuais.length === 0) erros.push(`assunto ${assunto.id}: aula sem item visual`);
        if (aula.revisao.length < MIN_REVISAO) erros.push(`assunto ${assunto.id}: revisão rápida com menos de ${MIN_REVISAO} frases`);
        if (aula.questoes.length < MIN_QUESTOES) erros.push(`assunto ${assunto.id}: menos de ${MIN_QUESTOES} questões`);
        if (aula.visuais.some((v) => v.tipo === 'mapaDanos') && !assunto.visaoGeral.comparativoVeiculos)
          erros.push(`assunto ${assunto.id}: visual mapaDanos sem comparativoVeiculos`);
        for (const q of aula.questoes) {
          if (questoesVistas.has(q.id)) erros.push(`questão ${q.id}: id repetido`);
          questoesVistas.add(q.id);
          if (q.dispositivos.length === 0) erros.push(`questão ${q.id}: sem dispositivo`);
        }
      }
    }
  }

  return erros;
}
