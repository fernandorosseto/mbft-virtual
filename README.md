# MBFT Virtual

Consulta rápida ao **Manual Brasileiro de Fiscalização de Trânsito** (MBFT, anexo da Resolução CONTRAN nº 985/2022) para agentes de fiscalização de trânsito, no celular e no computador.

Plano e decisões: `PLANO.md`. Instruções para agentes: `CLAUDE.md`.

## Executar

```bash
npm install
npm run dev     # http://localhost:3000
npm run typecheck
npm run lint
npm run build
```

Em produção, defina `NEXT_PUBLIC_SITE_URL` com o endereço público do site.

## Tecnologias

Next.js 14 (App Router, páginas estáticas), TypeScript, CSS Modules, Lucide React.

## Fontes

- MBFT: PDF oficial em `docs/normas/MBVT20222.pdf`, convertido em `docs/normas/mbft/mbft.json`.
- CTB: `docs/normas/ctb.txt`, extraído da página compilada do Planalto.

## Aviso legal

Conteúdo informativo. Não substitui o texto publicado no Diário Oficial da União. Site independente, sem vínculo com órgãos de trânsito.
