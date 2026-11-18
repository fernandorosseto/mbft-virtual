# MBFT Virtual

Site de **consulta** ao Manual Brasileiro de Fiscalização de Trânsito (MBFT, anexo da Res. CONTRAN nº 985/2022) para **agentes de fiscalização de trânsito**. A proposta é melhorar a leitura do PDF oficial: achar a ficha certa rápido, ler bem no celular e no computador, com o site leve.

Nasceu como cópia do CTB Virtual (site para concurseiros, com carro 3D); o 3D e o conteúdo de concurso foram removidos em 18/11/2026. Plano e registro de decisões em **`PLANO.md`**: leia antes de mudar funcionalidades ou textos, e registre lá cada decisão nova.

## Comandos

```bash
npm run dev         # servidor de desenvolvimento
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint (next/core-web-vitals)
npm run build
```

Rode `typecheck`, `lint` e `build` antes de cada commit.

## Princípios

- **Leve:** páginas estáticas (`generateStaticParams`), quase nada de JavaScript no cliente, sem bibliotecas pesadas. Nada de 3D.
- **Celular e computador:** o agente consulta em campo, no celular; layout próprio para os dois (`QUERY_CELULAR` em `src/lib/useMediaQuery.ts`, ≤ 860 px). Toque ≥ 44 px.
- **Fiel ao texto:** o conteúdo vem do PDF oficial; não resumir nem reescrever as fichas por conta própria. Em caso de divergência, vale o texto publicado.

## Fontes (`docs/normas/`)

- `MBVT20222.pdf`: PDF oficial do MBFT.
- `mbft/mbft.json`: o MBFT convertido (parte geral por página e as 412 fichas, com os campos do PDF); `mbft/mbft.txt`: texto corrido para conferência. Formato e limitações em `docs/normas/mbft/README.md`; gerado por `tools/normas/mbft/extrair_mbft.py`.
- `ctb.txt`: CTB vigente, extraído de `ctb-planalto.html` (página compilada do Planalto salva pelo navegador) por `tools/normas/extrair-ctb.py`, descartando redações revogadas. Serve para mostrar o artigo citado no amparo legal.
- `contran-indice.json`: índice das resoluções do CONTRAN no DOU (nº 700 em diante), de `tools/normas/dou/coletar.py`. Serve para ligar as resoluções citadas nas fichas.

## Estrutura

```
src/app/            layout, página inicial, not-found, robots, sitemap, tokens em globals.css
src/lib/site.ts     URL_SITE, NOME_SITE, URL_MBFT_OFICIAL
src/lib/metadados.ts  metadataDe({ titulo, descricao, caminho })
src/lib/useMediaQuery.ts
```

Em produção, defina `NEXT_PUBLIC_SITE_URL`.

## Regras

- Rodapé obrigatório: "Conteúdo informativo. Não substitui o texto publicado no Diário Oficial da União."
- Site independente: nunca usar marca, brasão ou nome de órgão de trânsito como se fosse oficial.

## Identidade visual

- Tema claro com acento amarelo de sinalização: `--sign: #eab308; --sign-text: #854d0e;`.
- Tokens: `--asphalt: #f1f5f9` (fundo), `--asphalt-2: #ffffff` (superfícies), `--asphalt-3: #cbd5e1` (bordas), `--paint: #0f172a` (texto), `--muted: #475569`, `--ok: #15803d`, `--bad: #dc2626`.
- Fontes: Barlow Condensed (títulos), Barlow (texto), Source Serif 4 (texto da norma), IBM Plex Mono (códigos e números).
- Zero emojis na interface: só ícones `lucide-react` ou texto.
