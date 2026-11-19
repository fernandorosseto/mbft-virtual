// Confere os dados extraídos do PDF e os arquivos derivados (roda no CI e antes de cada commit).
// Uso: npm run verificar:dados
import { existsSync, readFileSync } from 'node:fs';

const ler = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url)));
const erros = [];
const conferir = (ok, msg) => {
  if (!ok) erros.push(msg);
};
const normalizar = (t) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const mbft = ler('docs/normas/mbft/mbft.json');
const codigos = [...new Set(mbft.fichas.map((f) => f.codigo))];
conferir(mbft.fichas.length === 412, `mbft.json: esperava 412 fichas no PDF, achei ${mbft.fichas.length}`);
conferir(codigos.length === 411, `mbft.json: esperava 411 códigos distintos, achei ${codigos.length}`);
for (const f of mbft.fichas) {
  for (const campo of ['codigo', 'tipificacaoResumida', 'amparoLegal', 'gravidade', 'pagina']) {
    conferir(f[campo] !== undefined && f[campo] !== '', `ficha ${f.codigo}: campo ${campo} vazio`);
  }
  conferir(/^\d{3}-\d{2}$/.test(f.codigo), `código fora do padrão: ${f.codigo}`);
}

const temas = ler('docs/normas/mbft/temas.json').temas;
for (const c of codigos) conferir(temas[c], `temas.json: falta o tema da ficha ${c}`);

const pg = ler('docs/normas/mbft/parte-geral.json');
conferir(pg.secoes.length === 30, `parte-geral.json: esperava 30 seções, achei ${pg.secoes.length}`);

const tabelas = ler('docs/normas/mbft/tabelas.json').fichas;
for (const c of Object.keys(tabelas)) conferir(codigos.includes(c), `tabelas.json: ficha inexistente ${c}`);
const figuras = ler('docs/normas/mbft/figuras.json').figuras;
for (const [c, lista] of Object.entries(figuras)) {
  conferir(codigos.includes(c), `figuras.json: ficha inexistente ${c}`);
  for (const fig of lista) conferir(existsSync(new URL(`../public${fig.arquivo}`, import.meta.url)), `figura sem arquivo: ${fig.arquivo}`);
}

const ctb = ler('docs/normas/ctb-artigos.json').artigos;
for (const f of mbft.fichas) {
  for (const parte of f.amparoLegal.split(/c\/c|\be Art\./)) {
    if (/Lei/.test(parte)) continue;
    const m = parte.match(/(\d+)(-[A-Z])?/);
    if (m) conferir(ctb[m[1] + (m[2] ?? '')], `ctb-artigos.json: falta o art. ${m[0]} (ficha ${f.codigo})`);
  }
}

// Sinônimos: toda palavra de destino precisa existir no texto das fichas
const vocabulario = new Set();
for (const f of mbft.fichas) {
  const texto = [f.codigo, f.tipificacaoResumida, f.tipificacao, f.amparoLegal, f.medidaAdministrativa, f.crime ?? '',
    ...f.quandoAutuar, ...f.quandoNaoAutuar, ...f.definicoesEProcedimentos, ...f.exemplosObservacoes, ...f.informacoesComplementares].join(' ');
  normalizar(texto).split(' ').forEach((p) => vocabulario.add(p));
}
const fonteSinonimos = readFileSync(new URL('../src/lib/sinonimos.ts', import.meta.url), 'utf8');
for (const [, chave, valores] of fonteSinonimos.matchAll(/^\s+(\w+): \[([^\]]*)\]/gm)) {
  for (const [, alt] of valores.matchAll(/'([^']*)'/g)) {
    for (const p of normalizar(alt).split(' ')) {
      conferir([...vocabulario].some((v) => v.startsWith(p)), `sinônimo "${chave}": "${p}" não aparece em nenhuma ficha`);
    }
  }
}

if (erros.length) {
  console.error(`${erros.length} problema(s):\n- ${erros.slice(0, 40).join('\n- ')}`);
  process.exit(1);
}
console.log(`Dados ok: ${codigos.length} fichas, ${Object.keys(temas).length} temas, ${pg.secoes.length} seções da parte geral, ${Object.values(figuras).flat().length} desenhos.`);
