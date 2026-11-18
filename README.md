# CTB Virtual

**Legislação de trânsito para o concurso da PRF, em 3D: as resoluções do CONTRAN e o CTB do edital sobre um carro.**

O **CTB Virtual** é uma plataforma de estudo (*mobile-first*) para candidatos da PRF. Cada resolução do edital aparece sobre um veículo 3D: ao escolher um assunto ou tocar numa peça, o candidato vê onde a regra se aplica, o resumo, os pontos de prova, a letra da lei e o enquadramento da infração. Plano de produto e registro de decisões: `PLANO.md`.

---

## Público e acesso

- **Público:** candidatos ao concurso da PRF (Bloco II, Legislação de Trânsito; números dos editais em `docs/editais/`).
- **Conteúdo único por ficha:** em resumo, pode / não pode, pontos de prova (com histórico da redação e pontos que a norma não resolve), letra da lei, na fiscalização, infração e penalidade.
- **Freemium:** Vidros (Res. 960/2022), Placas (969/2022) e Sinalização e iluminação (970/2022) grátis; o restante na versão completa. `Tema.acesso` (`'gratis' | 'pago'`) só marca a interface por enquanto: antes de cobrar, o conteúdo pago precisa vir do servidor.
- **Lista de espera:** formulário na tela inicial → `POST /api/lista-espera` → coleção `lista_espera` do Firestore, gravada pelo servidor com o Firebase Admin (`src/lib/servidor/firebase.ts`; regras em `firestore.rules`; variáveis em `.env.example`).

---

## Funcionalidades Atuais

- **Inspeção 3D Interativa (Three.js / WebGL):**
  - Modelo 3D otimizado (`public/models/carro.glb`) com separação geométrica por zona normativa (`parabrisa`, `vidros-dianteiros` na coluna B e `vidros-traseiros`).
  - Destaque luminoso e contorno técnico (`EdgesGeometry`) por peça selecionada ou sob *hover*.
  - Voo suave de câmera (`fly`) com compensação automática de enquadramento (`camera.setViewOffset`) quando o painel lateral está aberto no desktop.
- **Nós Ramificados Animados (`Framer Motion`):**
  - Ao clicar em uma região de vidro no carro 3D, linhas curvas em Bézier brotam diretamente da superfície do vidro com botões flutuantes animados para escolha do subtema.
- **Visualização 3D e Diagrama Técnico de Trincas e Fissuras:**
  - Projeção visual sobre o para-brisa 3D demarcando a **Área Crítica de Visão do Motorista** e a **faixa periférica de 2,5 cm** (tolerância zero), além dos limites tolerados no lado do passageiro.
  - Comparador interativo entre **Carros de Passeio (Art. 16 / Anexo I)** e **Ônibus, Micro-ônibus e Caminhões (Art. 15 / Anexo II)**.

---

## Escopo Normativo Implementado

Conteúdo organizado em **Tema → Assunto → Zona** (ver `CLAUDE.md`). Todo texto de lei citado é conferido automaticamente contra o texto oficial (`npm run verificar:citacoes`).

- **Tema Vidros: Res. CONTRAN 960/2022, alterada pela Res. CONTRAN 989/2022**
  - **Películas:** para-brisa e laterais dianteiros com mínimo de 70% no conjunto vidro + película (art. 4º, I); laterais traseiros e vigia sem mínimo, com retrovisores externos dos dois lados (art. 4º, II e § 2º, redação da Res. 989/2022); teto fora dos limites (art. 4º, § 3º); chancela (art. 8º); película refletiva e bolhas (art. 10, I e II); tolerância de medição VC = MR + 7% (art. 19, § 1º); enquadramento no CTB, art. 230, XVI (art. 21, III).
  - **Danos no para-brisa:** área crítica e faixa de 2,5 cm sem dano e sem reparo (art. 14); limites para automóveis (art. 16) e para ônibus, micro-ônibus e caminhões (art. 15); enquadramento no CTB, art. 230, XVIII (art. 21, V).
  - **Vidro de segurança:** laminado no para-brisa, temperado ou laminado nos demais (art. 3º); marcação (arts. 5º e 6º); blindados (art. 12, redação da Res. 989/2022); enquadramento nos arts. 230, XVIII, e 237 do CTB.
  - **Inscrições, adesivos e cortinas:** arts. 9º e 10, III a V; enquadramento no art. 230, XII, XV, XVI e XVII.
  - **Medidor de transmitância luminosa (MTL):** arts. 17 a 20, com simulador do Valor Considerado.
  - Página da resolução em `/vidros` com o mapa dos 23 artigos; cada assunto com teoria, itens visuais, revisão rápida e questões Certo/Errado.
- **Próximos temas:** Placas (Res. 969/2022) e Sinalização e iluminação (Res. 970/2022), grátis; Álcool (Res. 1.031/2026) e Equipamentos obrigatórios (Res. 993/2023), na versão completa.

---

## Tecnologias Utilizadas

- **[Next.js 14](https://nextjs.org/)** (App Router)
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Three.js](https://threejs.org/)** (`GLTFLoader`, `OrbitControls`, `Raycaster`, `CanvasTexture`)
- **[Framer Motion](https://www.framer.com/motion/)** (`LazyMotion`, `domAnimation`, `useTime`, `useTransform`)
- **[Lucide React](https://lucide.dev/)** (Ícones vetoriais)
- **CSS Modules** (Design System próprio em Tema Claro de Trânsito)

---

## Estrutura de Pastas

```text
├── docs/normas/                 # PDFs/HTML oficiais e texto extraído (res960.txt, res989.txt, ctb.txt)
├── docs/editais/                # Editais PRF 2018 e 2021 e mapeamento das resoluções para as normas atuais
├── firestore.rules              # Regras do Firestore (navegador sem acesso; o servidor grava)
├── public/models/carro.glb      # Modelo 3D do veículo
├── scripts/                     # verificar-citacoes.ts
├── src/
│   ├── app/                     # Rotas (/[tema]/[slug]/[zona]), api/lista-espera, layout global e tokens CSS
│   ├── components/              # app (AppShell), canvas (CarStage), layout (SidebarMenu), panel (InfoPanel, Introducao)
│   ├── data/
│   │   ├── conteudo.ts          # Índice do conteúdo e validação
│   │   ├── normas/              # Normas, texto literal dos dispositivos, infrações
│   │   ├── temas/vidros/        # Assuntos: películas, danos
│   │   ├── status.ts            # Cores e rótulos dos status das regras
│   │   └── zonas.ts             # Zonas do carro e câmera
│   ├── lib/                     # navegacao.ts (estado ↔ URL), metadados, imagem de prévia, fontes.ts
│   └── types/                   # conteudo.ts (modelo de conteúdo)
├── tools/blender/               # Scripts de preparação do modelo 3D
└── tools/normas/                # extrair-ctb.py (texto vigente do CTB a partir do Planalto)
```

---

## Como Executar Localmente

```bash
npm install
npm run dev                  # http://localhost:3000
npm run typecheck
npm run lint
npm run verificar:citacoes   # confere citações das normas e consistência do conteúdo
npm run build
```

Em produção, defina `NEXT_PUBLIC_SITE_URL` com o endereço público do site (usado nos links canônicos, nas imagens de prévia e no sitemap).

---

## Créditos e Aviso Legal

- **Modelo 3D:** Baseado em [*Generic passenger car pack*](https://sketchfab.com/3d-models/generic-passenger-car-pack-20f9af9b8a404d5cb022ac6fe87f21f5) por [Comrade1280](https://sketchfab.com/comrade1280), licenciado sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (recortado e adaptado).
- **Aviso Legal:** Conteúdo informativo e educacional. Não substitui o texto oficial publicado no Diário Oficial da União (DOU).

