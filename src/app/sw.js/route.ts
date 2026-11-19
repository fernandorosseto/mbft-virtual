// Service worker do uso sem internet, gerado no build (sem bibliotecas).
// - Arquivos de /_next/static/ (nome com hash): cache primeiro.
// - Páginas: rede primeiro (sempre atualizadas com internet); sem rede, a cópia salva; sem cópia, /offline.
// - /busca.json: cópia salva na hora e atualização em segundo plano.
// - Pedidos RSC da navegação do Next: só rede; se falhar, o Next recarrega a página e ela sai do cache.
// - Mensagem "salvar-todas": baixa as páginas pedidas e os arquivos que elas usam, avisando o progresso.
// Um cache só, que não é apagado a cada versão: páginas antigas continuam com os arquivos delas.
export const dynamic = 'force-static';

const CODIGO = String.raw`
const CACHE = 'mbft-v1';
const INICIAIS = ['/', '/parte-geral', '/offline', '/busca.json', '/manifest.webmanifest'];

async function salvar(cache, url) {
  const resposta = await fetch(url, { cache: 'no-cache' });
  if (!resposta.ok) return false;
  await cache.put(url, resposta.clone());
  const tipo = resposta.headers.get('content-type') || '';
  if (tipo.includes('text/html') || tipo.includes('text/css')) {
    const texto = await resposta.text();
    const arquivos = new Set(Array.from(texto.matchAll(/\/(?:_next\/static|figuras|tabelas)\/[^"'\s)\\]+/g), (m) => m[0]));
    for (const arquivo of arquivos) {
      if (!(await cache.match(arquivo))) await salvar(cache, arquivo).catch(() => false);
    }
  }
  return true;
}

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.all(INICIAIS.map((u) => salvar(cache, u).catch(() => false))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (evento) => evento.waitUntil(self.clients.claim()));

async function primeiroCache(pedido) {
  const salvo = await caches.match(pedido);
  if (salvo) return salvo;
  const resposta = await fetch(pedido);
  if (resposta.ok) (await caches.open(CACHE)).put(pedido, resposta.clone());
  return resposta;
}

async function primeiroRede(pedido) {
  const url = new URL(pedido.url);
  const chave = url.pathname;
  try {
    const resposta = await Promise.race([
      fetch(pedido),
      new Promise((_, falha) => setTimeout(() => falha(new Error('tempo')), 6000)),
    ]);
    if (resposta.ok) (await caches.open(CACHE)).put(chave, resposta.clone());
    return resposta;
  } catch (erro) {
    return (await caches.match(chave)) || (await caches.match('/offline')) || Response.error();
  }
}

async function salvoEAtualiza(pedido) {
  const cache = await caches.open(CACHE);
  const salvo = await cache.match(pedido, { ignoreSearch: true });
  const rede = fetch(pedido)
    .then((r) => {
      if (r.ok) cache.put(new URL(pedido.url).pathname, r.clone());
      return r;
    })
    .catch(() => salvo);
  return salvo || rede;
}

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  if (pedido.method !== 'GET') return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/_next/static/')) return evento.respondWith(primeiroCache(pedido));
  if (pedido.headers.get('RSC') || url.searchParams.has('_rsc')) return;
  if (pedido.mode === 'navigate') return evento.respondWith(primeiroRede(pedido));
  if (url.pathname === '/busca.json') return evento.respondWith(salvoEAtualiza(pedido));
  if (url.pathname.startsWith('/icones/') || url.pathname.startsWith('/figuras/') || url.pathname.startsWith('/tabelas/') || url.pathname === '/manifest.webmanifest' || url.pathname === '/icon.svg') {
    return evento.respondWith(primeiroCache(pedido));
  }
});

async function contar() {
  const cache = await caches.open(CACHE);
  const chaves = await cache.keys();
  return chaves.filter((r) => new URL(r.url).pathname.startsWith('/fichas/')).length;
}

let salvando = false;

self.addEventListener('message', (evento) => {
  const dados = evento.data || {};
  const responder = (m) => self.clients.matchAll().then((cs) => cs.forEach((c) => c.postMessage(m)));
  if (dados.tipo === 'contar') {
    evento.waitUntil(contar().then((salvas) => responder({ tipo: 'contagem', salvas, salvando })));
  }
  if (dados.tipo === 'salvar-todas' && !salvando) {
    salvando = true;
    evento.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE);
        const urls = dados.urls || [];
        let feitas = 0;
        let falhas = 0;
        const fila = urls.slice();
        const trabalhador = async () => {
          while (fila.length) {
            const url = fila.shift();
            const ok = (await cache.match(url)) || (await salvar(cache, url).catch(() => false));
            if (!ok) falhas++;
            feitas++;
            if (feitas % 10 === 0 || feitas === urls.length) responder({ tipo: 'progresso', feitas, total: urls.length });
          }
        };
        await Promise.all([trabalhador(), trabalhador(), trabalhador(), trabalhador()]);
        salvando = false;
        responder({ tipo: 'concluido', salvas: await contar(), falhas });
      })(),
    );
  }
});
`;

export function GET() {
  return new Response(CODIGO, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
