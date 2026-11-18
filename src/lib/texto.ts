/** Minúsculas, sem acentos, pontuação vira espaço. Usado no índice (build) e na busca (navegador). */
export function normalizar(t: string): string {
  return t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Números e algarismos romanos curtos casam com a palavra inteira (XVI não acha XVII); o resto, pelo começo. */
export const TERMO_EXATO = /^(\d{1,3}|[ivxl]{1,5})$/;

export function casa(termo: string, palavra: string): boolean {
  return TERMO_EXATO.test(termo) ? palavra === termo : palavra.startsWith(termo);
}
