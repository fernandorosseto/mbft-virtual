# Coleta de resoluções do CONTRAN no DOU

Gera o índice das resoluções do CONTRAN publicadas no DOU (`docs/normas/contran-indice.json`).

```bash
# 1. Coleta (do nº 700 até o fim da numeração): grava docs/normas/contran-indice.json
python3 tools/normas/dou/coletar.py 700 1200
```

- `dou.py`: busca e download no DOU (`in.gov.br`), com cache em `.cache/` (fora do git).
- Busca por número em todas as edições (inclusive extras) e junta todas as publicações de cada resolução (original, republicação, retificação).
- Uma resolução antiga só conta como revogada se aparecer com número **e ano** num artigo de revogação total: Deliberações e Portarias do CONTRAN reaproveitam os mesmos números.
- Rodar de novo quando o CONTRAN publicar resoluções novas; as buscas ficam em cache.
