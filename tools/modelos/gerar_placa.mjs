/**
 * Gera a imagem da placa Mercosul do caminhão (tools/modelos/placa-mercosul.png) com o mesmo
 * desenho do site (src/lib/placaMercosul.ts), num navegador sem tela, na fonte Barlow Condensed.
 * A imagem vai para dentro do caminhao.glb (preparar_caminhao.mjs).
 *
 * Precisa do Playwright com o Chromium (global ou no projeto).
 *
 *   node tools/modelos/gerar_placa.mjs [TEXTO]      (padrão: CTB1V26)
 */
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Playwright instalado globalmente (require usa NODE_PATH; import não)
const { chromium } = createRequire(import.meta.url)('playwright');
const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const texto = process.argv[2] ?? 'CTB1V26';

const pacote = await build({
  entryPoints: [join(raiz, 'src/lib/placaMercosul.ts')],
  bundle: true,
  format: 'iife',
  globalName: 'Placa',
  write: false,
});
const fonte = (peso) =>
  readFileSync(join(raiz, `node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-${peso}-normal.woff2`)).toString('base64');

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
await pagina.setContent(`<!doctype html><style>
  @font-face { font-family: 'Barlow Condensed'; font-weight: 600; src: url(data:font/woff2;base64,${fonte(600)}) format('woff2'); }
  @font-face { font-family: 'Barlow Condensed'; font-weight: 700; src: url(data:font/woff2;base64,${fonte(700)}) format('woff2'); }
  :root { --f-display: 'Barlow Condensed'; }
</style><body>`);
await pagina.addScriptTag({ content: pacote.outputFiles[0].text });
const dados = await pagina.evaluate(async (t) => {
  await document.fonts.load("700 100px 'Barlow Condensed'");
  await document.fonts.load("600 100px 'Barlow Condensed'");
  return window.Placa.desenharPlacaMercosul(t).toDataURL('image/png');
}, texto);
await navegador.close();
const saida = join(raiz, 'tools/modelos/placa-mercosul.png');
writeFileSync(saida, Buffer.from(dados.split(',')[1], 'base64'));
console.log('placa', texto, '→', saida);
