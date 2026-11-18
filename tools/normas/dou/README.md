# Coleta de resoluções do CONTRAN no DOU

Scripts usados para o mapeamento em `docs/editais/mapeamento-resolucoes.md`.

```bash
# 1. Coleta (do nº 700 até o fim da numeração): grava docs/normas/contran-indice.json
python3 tools/normas/dou/coletar.py 700 1200

# 2. Cruza com os editais da PRF (docs/editais/prf-2018 e prf-2021): grava .cache/mapa.json
python3 tools/normas/dou/analisar.py
```

- `dou.py`: busca e download no DOU (`in.gov.br`), com cache em `.cache/` (fora do git).
- Busca por número em todas as edições (inclusive extras) e junta todas as publicações de cada resolução (original, republicação, retificação).
- Uma resolução antiga só conta como revogada se aparecer com número **e ano** num artigo de revogação total: Deliberações e Portarias do CONTRAN reaproveitam os mesmos números.
- Rodar de novo quando o CONTRAN publicar resoluções novas; as buscas ficam em cache.
