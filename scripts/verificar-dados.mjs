// Confere os dados extraídos do PDF e os arquivos derivados (roda no CI e antes de cada commit).
// Uso: npm run verificar:dados
import { existsSync, readFileSync } from 'node:fs';

const ler = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url)));
const erros = [];
const conferir = (ok, msg) => {
  if (!ok) erros.push(msg);
};
const normalizar = (t) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const mbft = ler('docs/normas/mbft/mbft.json');
const codigos = [...new Set(mbft.fichas.map((f) => f.codigo))];
conferir(mbft.fichas.length === 412, `mbft.json: esperava 412 fichas no PDF, achei ${mbft.fichas.length}`);
conferir(codigos.length === 411, `mbft.json: esperava 411 códigos distintos, achei ${codigos.length}`);
for (const f of mbft.fichas) {
  for (const campo of ['codigo', 'tipificacaoResumida', 'amparoLegal', 'gravidade', 'pagina']) {
    conferir(f[campo] !== undefined && f[campo] !== '', `ficha ${f.codigo}: campo ${campo} vazio`);
  }
  conferir(/^\d{3}-\d{2}$/.test(f.codigo), `código fora do padrão: ${f.codigo}`);
  // Todo campo do PDF presente (pode ser vazio, como o "crime" da 638-60, em branco no PDF);
  // na extração antiga, a 679-30 ficou sem "crime" porque o rótulo não tem dois-pontos
  for (const campo of [
    'tipificacao',
    'penalidade',
    'medidaAdministrativa',
    'infrator',
    'competencia',
    'pontuacao',
    'constatacao',
    'crime',
  ]) {
    conferir(typeof f[campo] === 'string', `ficha ${f.codigo}: falta o campo ${campo}`);
  }
  for (const campo of [
    'quandoAutuar',
    'quandoNaoAutuar',
    'definicoesEProcedimentos',
    'exemplosObservacoes',
    'informacoesComplementares',
  ]) {
    conferir(Array.isArray(f[campo]), `ficha ${f.codigo}: falta a lista ${campo}`);
  }
  conferir(!f.textoNaoClassificado, `ficha ${f.codigo}: texto do PDF sem campo (textoNaoClassificado)`);
  conferir(!JSON.stringify(f).includes('(cid:'), `ficha ${f.codigo}: glifo sem tradução "(cid:...)" no texto`);
}

const temas = ler('docs/normas/mbft/temas.json').temas;
for (const c of codigos) conferir(temas[c], `temas.json: falta o tema da ficha ${c}`);

const pg = ler('docs/normas/mbft/parte-geral.json');
conferir(pg.secoes.length === 30, `parte-geral.json: esperava 30 seções, achei ${pg.secoes.length}`);

const tabelas = ler('docs/normas/mbft/tabelas.json').fichas;
const fichaPorCodigo = new Map([...mbft.fichas].reverse().map((f) => [f.codigo, f]));
const semEspaco = (t) => t.replace(/\s+/g, '');
for (const [c, lista] of Object.entries(tabelas)) {
  conferir(codigos.includes(c), `tabelas.json: ficha inexistente ${c}`);
  for (const t of lista) {
    const texto = fichaPorCodigo.get(c)?.[t.campo]?.[t.item] ?? '';
    const i = texto.indexOf(t.inicio);
    const j = texto.indexOf(t.fim, i);
    conferir(i >= 0 && j >= 0, `tabelas.json: ${c} sem o trecho da tabela no item ${t.item}`);
    if (t.linhas) {
      // As células têm de ser o mesmo texto do trecho achatado, na mesma ordem
      const celulas = [t.titulo ?? '', ...(t.cabecalho ?? []), ...t.linhas.flat()].join(' ');
      conferir(
        semEspaco(celulas) === semEspaco(texto.slice(i, j + t.fim.length)),
        `tabelas.json: ${c} células diferentes do texto da ficha`,
      );
    }
    if (t.consulta) {
      // Transcrição à mão: mesmas palavras do trecho achatado (sem contar ':' e '---')
      const q = t.consulta;
      const textos = [q.cantoColunas, q.cantoLinhas, ...q.colunas.map((c) => `${c.resolucao} ${c.periodo}`)];
      for (const l of q.linhas) {
        textos.push(l.situacao);
        for (const cel of l.celulas) for (const b of cel) textos.push(...(b.titulo ? [b.titulo] : []), ...b.itens);
      }
      const palavras = (x) => x.replace(/:/g, ' ').replace(/---/g, ' ').split(/\s+/).filter(Boolean).sort().join(' ');
      conferir(
        palavras(textos.join(' ')) === palavras(texto.slice(i, j + t.fim.length)),
        `tabelas.json: ${c} transcrição diferente do texto da ficha`,
      );
      conferir(
        q.linhas.every((l) => l.celulas.length === q.colunas.length),
        `tabelas.json: ${c} linha com número errado de células`,
      );
    }
    for (const img of t.imagens ?? [])
      conferir(existsSync(new URL(`../public${img.arquivo}`, import.meta.url)), `tabela sem arquivo: ${img.arquivo}`);
  }
}
const figuras = ler('docs/normas/mbft/figuras.json').figuras;
for (const [c, lista] of Object.entries(figuras)) {
  conferir(codigos.includes(c), `figuras.json: ficha inexistente ${c}`);
  for (const fig of lista)
    conferir(existsSync(new URL(`../public${fig.arquivo}`, import.meta.url)), `figura sem arquivo: ${fig.arquivo}`);
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
  const texto = [
    f.codigo,
    f.tipificacaoResumida,
    f.tipificacao,
    f.amparoLegal,
    f.medidaAdministrativa,
    f.crime ?? '',
    ...f.quandoAutuar,
    ...f.quandoNaoAutuar,
    ...f.definicoesEProcedimentos,
    ...f.exemplosObservacoes,
    ...f.informacoesComplementares,
  ].join(' ');
  normalizar(texto)
    .split(' ')
    .forEach((p) => vocabulario.add(p));
}
const fonteSinonimos = readFileSync(new URL('../src/lib/sinonimos.ts', import.meta.url), 'utf8');
for (const [, chave, valores] of fonteSinonimos.matchAll(/^\s+(\w+): \[([^\]]*)\]/gm)) {
  for (const [, alt] of valores.matchAll(/'([^']*)'/g)) {
    for (const p of normalizar(alt).split(' ')) {
      conferir(
        [...vocabulario].some((v) => v.startsWith(p)),
        `sinônimo "${chave}": "${p}" não aparece em nenhuma ficha`,
      );
    }
  }
}

if (erros.length) {
  console.error(`${erros.length} problema(s):\n- ${erros.slice(0, 40).join('\n- ')}`);
  process.exit(1);
}
console.log(
  `Dados ok: ${codigos.length} fichas, ${Object.keys(temas).length} temas, ${pg.secoes.length} seções da parte geral, ${Object.values(figuras).flat().length} desenhos, ${Object.values(tabelas).flat().length} tabelas.`,
);
