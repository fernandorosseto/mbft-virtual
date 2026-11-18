import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/servidor/firebase';

/**
 * Lista de espera: grava o e-mail na coleção `lista_espera` do Firestore, pelo Firebase Admin
 * (só no servidor; as regras em firestore.rules bloqueiam qualquer acesso pelo navegador).
 * Sem as credenciais, em desenvolvimento apenas registra no console; em produção responde 503.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ORIGENS = new Set(['inicio']);
/** Código gRPC ALREADY_EXISTS: o e-mail já está na lista. */
const JA_EXISTE = 6;

export async function POST(req: Request) {
  let corpo: { email?: unknown; origem?: unknown };
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: 'Requisição inválida.' }, { status: 400 });
  }
  const email = typeof corpo.email === 'string' ? corpo.email.trim().toLowerCase() : '';
  const origem = typeof corpo.origem === 'string' && ORIGENS.has(corpo.origem) ? corpo.origem : 'inicio';
  if (!email || email.length > 254 || !EMAIL.test(email)) {
    return NextResponse.json({ erro: 'Confira o e-mail digitado.' }, { status: 400 });
  }

  let db: ReturnType<typeof firestore>;
  try {
    db = firestore();
  } catch (erro) {
    console.error('[lista-espera] credenciais do Firebase inválidas', erro);
    return NextResponse.json({ erro: 'Não foi possível registrar agora. Tente de novo mais tarde.' }, { status: 502 });
  }
  if (!db) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[lista-espera] ${email} (${origem}) — Firebase não configurado, nada gravado`);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ erro: 'A lista de espera ainda não está ativa. Tente de novo em breve.' }, { status: 503 });
  }

  // Id do documento = hash do e-mail: evita duplicados sem consulta prévia
  const id = createHash('sha256').update(email).digest('hex');
  try {
    await db.collection('lista_espera').doc(id).create({ email, origem, criadoEm: new Date() });
  } catch (erro) {
    // E-mail repetido não é erro: quem já está na lista recebe a mesma confirmação
    if ((erro as { code?: number }).code !== JA_EXISTE) {
      console.error('[lista-espera] falha ao gravar no Firestore', erro);
      return NextResponse.json({ erro: 'Não foi possível registrar agora. Tente de novo mais tarde.' }, { status: 502 });
    }
  }
  return NextResponse.json({ ok: true });
}
