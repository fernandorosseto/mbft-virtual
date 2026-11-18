---
name: pesquisador-contran
description: Analisa documentos jurídicos do CONTRAN, PDFs e códigos do projeto de forma isolada, extraindo apenas trechos relevantes para economizar tokens na conversa principal.
---

# Pesquisador de Normas e Código (Token-Efficient)

Esta skill orienta o agente a delegar tarefas de busca pesada e leitura de PDFs/códigos a subagentes isolados, garantindo que a conversa principal permaneça leve.

## Diretrizes de Uso de Subagentes
1. **Invocar Subagente `research` ou `self` com modelo `flash` / `flash_lite`:**
   - Ao analisar PDFs na pasta `docs/` ou vasculhar o código em `src/`.
2. **Instrução obrigatória no prompt do subagente:**
   - "Extraia estritamente os artigos, incisos, penalidades ou variáveis solicitadas. Não reproduza o documento inteiro nem traga texto irrelevante."
3. **Comunicação com a sessão principal:**
   - Devolver apenas tabela ou tópicos consolidados.

