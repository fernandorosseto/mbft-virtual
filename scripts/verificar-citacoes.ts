/**
 * Confere o conteúdo normativo do site.
 *
 * 1. Cada dispositivo com `fonte` preenchida precisa aparecer, letra por letra, no texto
 *    extraído do PDF oficial correspondente (docs/normas/<fonte>.txt).
 * 2. Dispositivos com `fonte: null` são listados como pendentes de conferência.
 * 3. validarConteudo() confere a consistência interna (ids, zonas, fichas, rótulos curtos) e o
 *    mínimo do padrão de conteúdo (PLANO.md, seção 3.4) nos assuntos publicados.
 * 4. Cobertura integral: todo artigo da norma principal de cada tema aparece no mapa da página
 *    da resolução.
 *
 * Para regenerar os .txt após trocar um PDF:
 *   pdftotext -layout docs/normas/Resolucao9602022.pdf docs/normas/res960.txt
 *   pdftotext -layout docs/normas/Resolucao-CONTRAN-989-2022.pdf docs/normas/res989.txt
 *   python3 tools/normas/extrair-ctb.py docs/normas/ctb-planalto.html docs/normas/ctb.txt
 *
 * Uso: npm run verificar:citacoes   (sai com código 1 se houver erro)
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DISPOSITIVOS, TEMAS, validarConteudo } from '../src/data/conteudo';
import type { Dispositivo } from '../src/types/conteudo';

const PASTA = join(__dirname, '..', 'docs', 'normas');

/** Remove cabeçalhos/rodapés de página do DOU e normaliza espaços. */
function normalizar(texto: string): string {
  return texto
    .split('\n')
    .filter((linha) => !/^\s*https?:\/\//.test(linha)) // rodapé com URL e paginação
    .filter((linha) => !/^\s*\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}\s/.test(linha)) // cabeçalho de impressão
    .join('\n')
    // Palavra com hífen partida no fim da linha ("dar-\nse-á"): junta mantendo o hífen
    .replace(/(\S)-\n\s*/g, '$1-')
    .replace(/\s+/g, ' ')
    .trim();
}

const cache = new Map<string, string>();
function textoDaFonte(fonte: string): string {
  if (!cache.has(fonte)) cache.set(fonte, normalizar(readFileSync(join(PASTA, `${fonte}.txt`), 'utf8')));
  return cache.get(fonte)!;
}

const erros: string[] = [];
const pendentes: string[] = [];
let conferidos = 0;

for (const [id, d] of Object.entries(DISPOSITIVOS) as [string, Dispositivo][]) {
  if (d.fonte === null) {
    pendentes.push(`${id}  (${d.rotulo})`);
    continue;
  }
  if (textoDaFonte(d.fonte).includes(normalizar(d.texto))) {
    conferidos++;
  } else {
    erros.push(`${id}: texto não encontrado literalmente em docs/normas/${d.fonte}.txt`);
  }
}

erros.push(...validarConteudo());

// Cobertura integral: artigos da norma principal (linhas que começam com "Art. N") × mapa da página
for (const tema of Object.values(TEMAS)) {
  if (!tema.pagina) continue;
  const bruto = readFileSync(join(PASTA, `${tema.pagina.norma}.txt`), 'utf8');
  const artigos = new Set(Array.from(bruto.matchAll(/^\s*Art\. (\d+)/gm), (m) => Number(m[1])));
  const cobertos = new Set(tema.pagina.mapa.flatMap((item) => item.artigos));
  for (const n of Array.from(artigos).sort((a, b) => a - b)) {
    if (!cobertos.has(n)) erros.push(`tema ${tema.id}: art. ${n} da ${tema.pagina.norma} fora do mapa da resolução`);
  }
  for (const n of Array.from(cobertos)) {
    if (!artigos.has(n)) erros.push(`tema ${tema.id}: mapa cita o art. ${n}, que não existe na ${tema.pagina.norma}`);
  }
  console.log(`Cobertura da ${tema.pagina.norma}: ${artigos.size} artigos, ${cobertos.size} no mapa`);
}

console.log(`Citações conferidas com o texto oficial: ${conferidos}`);
if (pendentes.length) {
  console.log(`\nPendentes de conferência (sem cópia oficial no repositório): ${pendentes.length}`);
  for (const p of pendentes) console.log(`  - ${p}`);
}
if (erros.length) {
  console.error(`\nErros: ${erros.length}`);
  for (const e of erros) console.error(`  x ${e}`);
  process.exit(1);
}
console.log('\nNenhum erro encontrado.');
