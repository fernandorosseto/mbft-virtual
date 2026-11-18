# Instruções para agentes

A fonte principal de contexto do projeto é o **`CLAUDE.md`** (proposta, fontes, estrutura e regras). Este arquivo complementa com regras de trabalho.

## 0. Regras do conteúdo jurídico (valem para qualquer agente)
## 0. Regras do conteúdo (valem para qualquer agente)
- O conteúdo vem do MBFT oficial (`docs/normas/MBVT20222.pdf`, convertido em `docs/normas/mbft/mbft.json`). Não resumir nem reescrever as fichas por conta própria.
- Rodar `npm run typecheck`, `npm run lint` e `npm run build` antes de cada commit.
- O CTB é conferido contra `docs/normas/ctb.txt`, gerado da página compilada do Planalto (ver `CLAUDE.md`).

objetivas:** Evite preâmbulos longos e repetições de código que não mudaram. Mostre apenas os trechos editados ou resumos curtos.
- **Não ler arquivos desnecessários no agente principal:** O agente principal atua como **Orquestrador/Arquiteto**. Leituras extensas, escrita bruta de código, revisão técnica, auditoria de layout, auditoria jurídica e execução de testes devem ser delegadas aos subagentes abaixo.

## 2. Arquitetura de Subagentes por Função e Modelo (ferramentas com `define_subagent`/`invoke_subagent`)
Sempre que executar tarefas de desenvolvimento, utilize `define_subagent` (se ainda não definidos na conversa) e `invoke_subagent` configurando o parâmetro `Model` adequado para otimizar custos e qualidade:

| Papel / Subagente | Nome (`TypeName`) | Modelo (`Model`) | Permissão de Escrita | Responsabilidade |
| :--- | :--- | :--- | :--- | :--- |
| **1. Leitor / Explorador** | `leitor-projeto` (ou `research`) | `flash_lite` (mais barato/rápido) | Não (`false`) | Vasculhar pastas, ler PDFs do CONTRAN e código existente; retornar **apenas** resumos e linhas relevantes. |
| **2. Planejador / Arquiteto** | **Agente Principal** (ou subagente com `pro`) | Modelo Principal / `pro` | Apenas orquestração | Interpretar o resumo do leitor, tomar decisões de arquitetura e montar o plano detalhado passo a passo. |
| **3. Codificador** | `codificador` | `flash` (rápido e econômico) | Sim (`true`) | Receber a especificação pronta do Planejador e escrever/editar os arquivos de código sem precisar repensar a arquitetura. |
| **4. Guardião de Layout (UI/UX)** | `guardiao-layout` | `flash` | Não (`false`) | Garantir consistência visual no Tema Claro, **ZERO emojis na interface** (apenas ícones `lucide-react` ou tipografia limpa), alinhamento de botões/badges e ergonomia mobile-first (`>= 44px`). |
| **5. Revisor de Código** | `revisor` | `flash` (ou `pro` em mudanças críticas) | Não (`false`) | Inspecionar os arquivos editados buscando bugs técnicos e de desempenho. |
| **6. Auditor Jurídico MBFT/CTB** | `auditor-juridico` | `flash` ou `pro` | Não (`false`) | Conferir o que está no site com o MBFT oficial e o CTB (`docs/normas/`): códigos, amparo legal, gravidade, pontos e textos das fichas. |
| **7. Testador (QA)** | `testador` | `flash_lite` ou `flash` | Sim (`true`, comandos) | Executar `npm run build`, `npm run typecheck`, `npm run lint` e reportar apenas o resultado (passou/falhou e log resumido do erro). |

## 3. Regras de Consistência Visual (Design System "MBFT Virtual")
- **Zero Emojis:** Nunca utilizar emojis na interface. Utilizar exclusivamente ícones vetoriais `lucide-react` ou texto limpo.
- **Tema Claro de Trânsito:** Superfícies brancas/gelo (`#ffffff` / `#f1f5f9`), acento amarelo de placa (`#eab308` / `#854d0e`), tipografia `Barlow Condensed` (títulos), `Barlow` (corpo), `Source Serif 4` (lei) e `IBM Plex Mono` (números/badges).
