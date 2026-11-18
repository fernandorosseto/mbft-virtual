import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import type { StatusRegra } from '@/types/conteudo';
import { ASSUNTOS, NORMAS, TEMAS, ZONAS, obterFicha } from '@/data/conteudo';
import { STATUS } from '@/data/status';
import { assuntoPublicado, assuntosDaPeca, type Estado } from './navegacao';

/**
 * Imagem de prévia (Open Graph) de cada tela: aparece quando o link é compartilhado no
 * WhatsApp, redes sociais etc. Gerada no build, uma por rota.
 */
export const TAMANHO_PREVIA = { width: 1200, height: 630 };
export const TIPO_PREVIA = 'image/png';

const COR = {
  fundo: '#f1f5f9',
  superficie: '#ffffff',
  borda: '#cbd5e1',
  texto: '#0f172a',
  suave: '#475569',
  placa: '#eab308',
  placaTexto: '#854d0e',
};

interface Conteudo {
  rotuloSuperior: string;
  titulo: string;
  texto?: string;
  destaque?: { valor: string; rotulo: string; status?: StatusRegra };
  itens?: { titulo: string; resumo?: string; status?: StatusRegra }[];
  rodape: string;
}

function conteudoDe(e: Estado): Conteudo {
  const normasVidros = TEMAS.vidros.normas.map((n) => NORMAS[n].sigla).join(' · ');
  switch (e.tipo) {
    case 'inicio':
      return {
        rotuloSuperior: 'Concurso PRF · legislação de trânsito',
        titulo: 'As resoluções do edital, no carro 3D',
        texto: 'Pontos de prova, letra da lei e enquadramento, em cada peça do veículo.',
        itens: Object.values(ASSUNTOS)
          .filter(assuntoPublicado)
          .map((a) => ({ titulo: a.titulo, resumo: a.subtitulo })),
        rodape: normasVidros,
      };
    case 'tema': {
      const t = TEMAS[e.tema];
      return {
        rotuloSuperior: `${t.titulo} · visão geral da resolução`,
        titulo: NORMAS[t.pagina!.norma].sigla,
        texto: t.pagina!.resumo,
        itens: t.assuntos
          .map((id) => ASSUNTOS[id])
          .filter(assuntoPublicado)
          .slice(0, 5)
          .map((a) => ({ titulo: a.titulo, resumo: a.subtitulo })),
        rodape: normasVidros,
      };
    }
    case 'assunto': {
      const a = ASSUNTOS[e.assunto];
      return {
        rotuloSuperior: `${TEMAS[e.tema].titulo} · visão geral`,
        titulo: a.titulo,
        texto: a.visaoGeral?.resumo,
        destaque: a.visaoGeral ? { valor: a.visaoGeral.destaque.valor, rotulo: a.visaoGeral.destaque.rotulo } : undefined,
        rodape: normasVidros,
      };
    }
    case 'ficha': {
      const a = ASSUNTOS[e.assunto];
      const f = obterFicha(e.assunto, e.zona)!;
      return {
        rotuloSuperior: `${TEMAS[e.tema].titulo} · ${a.titulo}`,
        titulo: ZONAS[e.zona].titulo,
        texto: f.destaque.detalhe,
        destaque: { valor: f.destaque.valor, rotulo: f.destaque.rotulo, status: f.status },
        rodape: normasVidros,
      };
    }
    case 'peca': {
      const z = ZONAS[e.zona];
      return {
        rotuloSuperior: `${TEMAS[e.tema].titulo} · ${z.descricao}`,
        titulo: z.titulo,
        itens: assuntosDaPeca(e.zona).map(({ assunto, ficha }) => ({
          titulo: assunto.titulo,
          resumo: ficha?.resumoCurto ?? assunto.resumoCurto,
          status: ficha?.status,
        })),
        rodape: normasVidros,
      };
    }
  }
}

// O número do destaque ocupa uma linha só no cartão: o tamanho cai conforme o comprimento
// (Barlow Condensed tem ~0,47 em de largura média por caractere).
const LARGURA_UTIL_CARTAO = 320;
const tamanhoDoValor = (valor: string) => Math.min(150, Math.floor(LARGURA_UTIL_CARTAO / (valor.length * 0.47)));

// Fontes do site (licença OFL), lidas dos pacotes @fontsource no build
const PASTA_FONTES = join(process.cwd(), 'node_modules', '@fontsource');
async function carregarFontes() {
  const ler = (arquivo: string) => readFile(join(PASTA_FONTES, arquivo));
  const [titulo, tituloMedio, texto, textoMedio] = await Promise.all([
    ler('barlow-condensed/files/barlow-condensed-latin-700-normal.woff'),
    ler('barlow-condensed/files/barlow-condensed-latin-600-normal.woff'),
    ler('barlow/files/barlow-latin-400-normal.woff'),
    ler('barlow/files/barlow-latin-500-normal.woff'),
  ]);
  return [
    { name: 'Barlow Condensed', data: titulo, weight: 700 as const, style: 'normal' as const },
    { name: 'Barlow Condensed', data: tituloMedio, weight: 600 as const, style: 'normal' as const },
    { name: 'Barlow', data: texto, weight: 400 as const, style: 'normal' as const },
    { name: 'Barlow', data: textoMedio, weight: 500 as const, style: 'normal' as const },
  ];
}

const CONDENSADA = 'Barlow Condensed';

export async function imagemPrevia(estado: Estado): Promise<ImageResponse> {
  const c = conteudoDe(estado);
  const fonts = await carregarFontes();
  const corStatus = c.destaque?.status ? STATUS[c.destaque.status].cor : COR.placa;

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: COR.fundo, color: COR.texto, fontFamily: 'Barlow' }}>
        {/* Faixa amarela de sinalização */}
        <div style={{ display: 'flex', width: 24, height: '100%', background: COR.placa }} />

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '56px 64px 44px 56px' }}>
          {/* Marca */}
          <div style={{ display: 'flex', alignItems: 'center', fontFamily: CONDENSADA, fontSize: 40, fontWeight: 700, letterSpacing: 2 }}>
            <span>CTB</span>
            <span style={{ color: COR.placaTexto, marginLeft: 12 }}>VIRTUAL</span>
          </div>

          <div style={{ display: 'flex', flex: 1, alignItems: 'center', marginTop: 16, marginBottom: 16, overflow: 'hidden' }}>
            {/* Textos */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: c.destaque ? 40 : 0 }}>
              <div
                style={{
                  display: 'flex',
                  fontFamily: CONDENSADA,
                  fontWeight: 600,
                  fontSize: 28,
                  color: COR.suave,
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                }}
              >
                {c.rotuloSuperior}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontFamily: CONDENSADA,
                  fontSize: c.titulo.length > 16 ? 64 : 84,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  marginTop: 8,
                }}
              >
                {c.titulo}
              </div>
              {c.texto && (
                <div style={{ display: 'flex', fontSize: 30, color: COR.suave, lineHeight: 1.35, marginTop: 20 }}>{c.texto}</div>
              )}
              {c.itens && (
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: 18 }}>
                  {c.itens.map((item) => (
                    <div
                      key={item.titulo}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: 12,
                        padding: '10px 20px',
                        background: COR.superficie,
                        border: `2px solid ${COR.borda}`,
                        borderLeft: `10px solid ${item.status ? STATUS[item.status].cor : COR.placa}`,
                        borderRadius: 14,
                        fontSize: 27,
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{item.titulo}</span>
                      {item.resumo && <span style={{ marginLeft: 18, color: COR.suave }}>{item.resumo}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Destaque da regra */}
            {c.destaque && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  width: 400,
                  padding: '34px 36px',
                  background: COR.superficie,
                  border: `2px solid ${COR.borda}`,
                  borderTop: `12px solid ${corStatus}`,
                  borderRadius: 20,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontFamily: CONDENSADA,
                    fontSize: tamanhoDoValor(c.destaque.valor),
                    fontWeight: 700,
                    color: COR.placaTexto,
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.destaque.valor}
                </div>
                <div style={{ display: 'flex', fontSize: 26, fontWeight: 500, lineHeight: 1.3, marginTop: 16 }}>{c.destaque.rotulo}</div>
                {c.destaque.status && (
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 18, fontSize: 24, color: COR.suave }}>
                    <div style={{ display: 'flex', width: 22, height: 22, borderRadius: 5, background: corStatus, marginRight: 12 }} />
                    {STATUS[c.destaque.status].rotulo}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rodapé */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: `2px solid ${COR.borda}`,
              paddingTop: 20,
              fontSize: 22,
              color: COR.suave,
            }}
          >
            <span>{c.rodape}</span>
            <span>Conteúdo informativo</span>
          </div>
        </div>
      </div>
    ),
    { ...TAMANHO_PREVIA, fonts }
  );
}
