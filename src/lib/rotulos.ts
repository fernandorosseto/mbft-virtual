/**
 * Rótulos de navegação, usados no servidor e no navegador. O site pode se guiar pelo código da
 * ficha (516-91) ou pelo artigo do CTB (Art. 165): os dois são desenhados e o CSS mostra um só,
 * conforme `data-ref` no <html> (ver Preferencias).
 */

/** Amparo legal como rótulo curto: "Art. 230, XVI." → "Art. 230, XVI"; "193." → "Art. 193". */
export function rotuloArtigo(amparo: string): string {
  let t = amparo.trim().replace(/\.$/, '');
  if (/^\d/.test(t)) t = `Art. ${t}`;
  // Remissão a outra lei fica fora do rótulo (a ficha mostra o amparo completo)
  return t.replace(/\s+e Art\.\s*1º.*Lei.*$/i, '');
}

/** Tema em até duas linhas de ~14 caracteres, quebrando entre palavras. */
export function linhasDoTema(tema: string, largura = 14): string[] {
  const linhas: string[] = [];
  for (const palavra of tema.split(' ')) {
    const ultima = linhas[linhas.length - 1];
    if (ultima !== undefined && (ultima + ' ' + palavra).length <= largura) linhas[linhas.length - 1] = ultima + ' ' + palavra;
    else linhas.push(palavra);
  }
  if (linhas.length > 2) return [linhas[0], linhas.slice(1).join(' ')];
  return linhas;
}
