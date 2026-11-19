import { expect, test, type Page } from '@playwright/test';

/** Nada passa da largura da tela (o bug de 1 px em 320 px foi pego assim). */
async function semRolagemLateral(page: Page) {
  const { largura, conteudo } = await page.evaluate(() => ({
    largura: window.innerWidth,
    conteudo: document.documentElement.scrollWidth,
  }));
  expect(conteudo, 'conteúdo mais largo que a tela').toBeLessThanOrEqual(largura);
}

test('catálogo: busca no título, no texto e por sinônimo', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Fichas de fiscalização' })).toBeVisible();
  const busca = page.getByRole('searchbox', { name: 'Buscar ficha' });
  await busca.fill('230 XVI');
  await expect(page.locator('main ul a[href="/fichas/670-00"]').first()).toBeVisible();
  await busca.fill('insulfilm');
  await expect(page.getByText('“insulfilm” também busca')).toBeVisible();
  await expect(page.locator('main ul a[href="/fichas/670-00"]').first()).toBeVisible();
  await busca.fill('alcool');
  await expect(page.getByText('No texto da ficha')).toBeVisible();
  await page.getByRole('button', { name: 'Mapa' }).click();
  await expect(page.locator('svg[role="img"]')).toBeVisible();
  await semRolagemLateral(page);
});

test('ficha: seções, CTB, ligações, desenho e copiar', async ({ page }) => {
  await page.goto('/fichas/539-80');
  for (const id of ['enquadramento', 'quando-autuar', 'quando-nao-autuar', 'exemplos', 'informacoes', 'ctb']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  await expect(page.locator('#informacoes figure img').first()).toHaveAttribute('src', /\/figuras\/539-80-1\.webp/);
  await expect(page.locator('#ctb')).toContainText('Art. 181');
  await expect(page.getByText('Não autue aqui, use')).toBeVisible();
  await expect(page.locator('#exemplos').getByRole('button', { name: /Copiar/ }).first()).toBeVisible();
  await semRolagemLateral(page);
});

test('ficha: tabela do PDF em vez do texto achatado', async ({ page }) => {
  await page.goto('/fichas/505-31');
  const tabela = page.locator('#informacoes table');
  await expect(tabela.locator('caption')).toHaveText('TABELA DE CÓDIGOS E ABREVIATURAS A CONSTAREM NA CNH');
  await expect(tabela.locator('tbody tr')).toHaveCount(30);
  await expect(tabela.locator('tbody tr').last()).toContainText('Outras restrições');
  await expect(page.locator('#informacoes')).not.toContainText('CETPP Habilitado');
  await semRolagemLateral(page);
  await page.goto('/fichas/675-00');
  const consulta = page.getByLabel('Situação do veículo');
  await expect(page.locator('#informacoes ol[aria-live] > li')).toHaveCount(5);
  await consulta.selectOption({ label: 'Reboque ou semirreboque novo' });
  await expect(page.locator('#informacoes ol[aria-live] > li').last()).toContainText('PESO P/ EIXO');
  await page.getByText('Ver a tabela completa').click();
  await expect(page.locator('#informacoes [role="region"] tbody tr')).toHaveCount(9);
  await expect(page.locator('#informacoes')).toContainText('(1) Conforme o art. 47');
  await semRolagemLateral(page);
});

test('ficha: tabela longa abre em página própria', async ({ page }) => {
  await page.goto('/fichas/518-51');
  await expect(page.locator('#informacoes')).not.toContainText('DIANTEIROS LATERAIS');
  await expect(page.locator('#informacoes')).toContainText('III - OBSERVAÇÕES');
  await page.getByRole('link', { name: /Resumo das normas e requisitos do cinto de segurança/ }).click();
  await expect(page).toHaveURL(/\/tabela\/cinto-de-seguranca$/);
  await expect(page.locator('main figure img')).toHaveCount(5);
  await expect(page.getByRole('link', { name: 'Voltar à ficha 518-52' })).toBeVisible();
  await semRolagemLateral(page);
});

test('ficha: favorita aparece na página inicial', async ({ page }) => {
  await page.goto('/fichas/552-50');
  await page.getByRole('button', { name: 'Guardar nas favoritas' }).click();
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Favoritas' }).getByRole('link')).toContainText('552-50');
});

test('preferências: guiar por artigo e tema escuro', async ({ page, isMobile }) => {
  await page.goto('/fichas/516-91');
  await page.getByRole('button', { name: /Preferências de leitura/ }).click();
  await page.locator('#painel-preferencias').getByRole('button', { name: 'Artigo do CTB' }).click();
  await page.locator('#painel-preferencias').getByRole('button', { name: 'Escuro' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-ref', 'artigo');
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'escuro');
  if (!isMobile) await expect(page.locator('[class*="linhaCodigo"]')).toContainText('Art. 165');
});

test('páginas leves sem estouro de largura', async ({ page }) => {
  for (const caminho of ['/', '/parte-geral', '/fichas/510-01', '/fichas/626-20', '/fichas/669-61', '/offline']) {
    await page.goto(caminho);
    await semRolagemLateral(page);
  }
});

test('cabeçalhos de segurança e arquivos gerados', async ({ request }) => {
  const r = await request.get('/fichas/552-50');
  expect(r.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(r.headers()['x-content-type-options']).toBe('nosniff');
  for (const arquivo of ['/busca.json', '/sw.js', '/manifest.webmanifest', '/fichas/552-50/opengraph-image', '/sitemap.xml']) {
    expect((await request.get(arquivo)).ok(), arquivo).toBeTruthy();
  }
});
