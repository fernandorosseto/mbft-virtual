'use client';

/** Resumo de uma ficha guardado no aparelho (para listar sem baixar o índice). */
export interface FichaGuardada {
  codigo: string;
  artigo: string;
  resumo: string;
  gravidade: string;
}

const RECENTES = 'mbft_recentes';
const FAVORITAS = 'mbft_favoritas';
const MAX_RECENTES = 8;
/** Avisa as outras partes da página (e outras abas) que as listas mudaram. */
export const EVENTO = 'mbft-minhas-fichas';

function ler(chave: string): FichaGuardada[] {
  try {
    const v = JSON.parse(localStorage.getItem(chave) ?? '[]');
    return Array.isArray(v) ? v.filter((f) => f && typeof f.codigo === 'string') : [];
  } catch {
    return [];
  }
}

function gravar(chave: string, lista: FichaGuardada[]) {
  try {
    localStorage.setItem(chave, JSON.stringify(lista));
  } catch {
    // navegador sem armazenamento: vale só nesta visita
  }
  window.dispatchEvent(new Event(EVENTO));
}

export const recentes = () => ler(RECENTES);
export const favoritas = () => ler(FAVORITAS);

export function registrarVisita(f: FichaGuardada) {
  gravar(RECENTES, [f, ...recentes().filter((r) => r.codigo !== f.codigo)].slice(0, MAX_RECENTES));
}

export function ehFavorita(codigo: string): boolean {
  return favoritas().some((f) => f.codigo === codigo);
}

export function alternarFavorita(f: FichaGuardada): boolean {
  const atual = favoritas();
  const ja = atual.some((x) => x.codigo === f.codigo);
  gravar(FAVORITAS, ja ? atual.filter((x) => x.codigo !== f.codigo) : [f, ...atual]);
  return !ja;
}

export function limparRecentes() {
  gravar(RECENTES, []);
}
