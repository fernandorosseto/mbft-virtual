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

/**
 * Termos curtos que são começo de outras palavras do manual e por isso casam só a palavra inteira
 * (ou o plural): "som" achava "somente" e "soma"; "moto", "motor" e "motorizado".
 */
export const PALAVRA_INTEIRA = new Set(['som', 'moto']);

export function casa(termo: string, palavra: string): boolean {
  if (TERMO_EXATO.test(termo)) return palavra === termo;
  if (PALAVRA_INTEIRA.has(termo)) return palavra === termo || palavra === `${termo}s`;
  return palavra.startsWith(termo);
}
