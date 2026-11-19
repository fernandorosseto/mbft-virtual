import { ImageResponse } from 'next/og';

export const TAMANHO_PREVIA = { width: 1200, height: 630 };

const COR_GRAVIDADE: Record<string, [string, string]> = {
  Gravíssima: ['#fee2e2', '#991b1b'],
  Grave: ['#ffedd5', '#9a3412'],
  Média: ['#fef9c3', '#854d0e'],
  Leve: ['#dcfce7', '#166534'],
};

/**
 * Imagem de prévia (WhatsApp, redes) gerada no build: selos do código e do artigo, gravidade e a
 * tipificação resumida, nas cores do site. Fonte padrão do next/og (sem baixar fontes).
 */
export function imagemPrevia({
  codigo,
  artigo,
  gravidade,
  titulo,
}: {
  codigo?: string;
  artigo?: string;
  gravidade?: string;
  titulo: string;
}) {
  const [fundoGrav, textoGrav] = (gravidade && COR_GRAVIDADE[gravidade]) || ['#f1f5f9', '#475569'];
  const selo = { fontSize: 46, fontWeight: 700, padding: '6px 22px', borderRadius: 12 } as const;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f1f5f9',
          padding: '56px 64px',
          borderLeft: '22px solid #eab308',
          color: '#0f172a',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, letterSpacing: 2 }}>MBFT VIRTUAL</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {codigo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ ...selo, background: '#0f172a', color: '#ffffff' }}>{codigo}</div>
              {artigo && <div style={{ ...selo, background: '#eab308', color: '#0f172a' }}>{artigo}</div>}
              {gravidade && (
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    padding: '6px 16px',
                    borderRadius: 10,
                    background: fundoGrav,
                    color: textoGrav,
                  }}
                >
                  {gravidade}
                </div>
              )}
            </div>
          )}
          <div style={{ display: 'flex', fontSize: titulo.length > 70 ? 50 : 60, fontWeight: 700, lineHeight: 1.15 }}>
            {titulo}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: '#475569' }}>
          Consulta ao Manual Brasileiro de Fiscalização de Trânsito · site independente
        </div>
      </div>
    ),
    TAMANHO_PREVIA,
  );
}
