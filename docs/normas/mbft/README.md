# MBFT em JSON

Manual Brasileiro de Fiscalização de Trânsito (MBFT), anexo da Resolução CONTRAN nº 985/2022, convertido do PDF oficial (`docs/normas/MBVT20222.pdf`, baixado de https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/mbvt20222.pdf).

| Arquivo | Conteúdo |
|---|---|
| `mbft.json` | metadados, parte geral (texto por página, págs. 1 a 31) e as 412 fichas de fiscalização |
| `parte-geral.json` | Parte Geral (págs. 5 a 30) em seções (títulos do sumário) e blocos: parágrafo, item com marcador, sigla; gerada do `mbft.txt` |
| `mbft.txt` | texto corrido do PDF (`pdftotext -layout`), para conferir citações literais |

## Ficha

```json
{
  "codigo": "670-00",
  "tipificacaoResumida": "...",
  "amparoLegal": "Art. 230, XVI.",
  "tipificacao": "...",
  "gravidade": "Grave",
  "penalidade": "Multa",
  "medidaAdministrativa": "...",
  "infrator": "Proprietário",
  "competencia": "...",
  "pontuacao": "5",
  "constatacao": "Vide procedimentos.",
  "crime": "NÃO",
  "quandoAutuar": ["1. ...", "2. ..."],
  "quandoNaoAutuar": ["1. ..."],
  "definicoesEProcedimentos": ["1. ..."],
  "exemplosObservacoes": ["1. ..."],
  "informacoesComplementares": ["1. ..."],
  "pagina": 593
}
```

- As colunas viram listas, um elemento por item numerado (subitens como "1.1." ficam dentro do item). Coluna sem itens numerados vira um único elemento (ex.: "Não há.").
- Os textos são os do PDF, com as quebras de linha desfeitas. Valores como `gravidade`, `pontuacao` e `crime` não foram padronizados (o PDF alterna "Não computável" e "Não Computável", "NÃO" e "Não").
- Figuras e tabelas desenhadas nas Informações complementares não são extraídas; tabelas em texto vêm como texto corrido.
- O texto fora das molduras da ficha (páginas de texto corrido que continuam as Informações complementares, como a lista de resoluções da 664-50) entra no campo, na ordem da página. No corpo em colunas, cada coluna é lida pela largura dela, de cima a baixo (o PDF nem sempre fecha as bordas das células). Célula aninhada já lida dentro de outra não é lida de novo.
- Itens de lista dentro de um item (resoluções "nº 037/1998: ...", marcadores "- ", incisos "I - ", alíneas "a) ", "Art. 105.", "§ 1º", "Parágrafo único", "Pena:") ficam em linha própria: o texto traz "\n" antes deles (`LISTA` e `comeca_item` no extrator), só quando a linha anterior do PDF fecha frase ou item (".", ":", ";", "(...)"; alínea também depois de título). O site mostra a quebra (`white-space: pre-line`).
- Correções feitas à vista no PDF, em `CORRECOES` do extrator: glifos sem tradução ("e(cid:373) rodovias" nas 515-01 a 515-03) e letras separadas pelo espaçamento ("e ntre", "d istância" na 580-00; "s e r" na 600-92).

## Conferência

```bash
python3 tools/normas/mbft/conferir_mbft.py docs/normas/MBVT20222.pdf docs/normas/mbft/mbft.json
```

Compara, ficha por ficha, as palavras do PDF (pdftotext) com as do JSON: aponta texto perdido na extração e texto a mais (lixo, repetição). Diferenças conferidas à vista ficam em `ESPERADAS`. Não confere a ordem das palavras.
- O código 542-81 aparece em duas fichas no próprio PDF (págs. 190 e 192).
- Campos vazios no PDF ficam vazios no JSON (ex.: "Definições e procedimentos" da pág. 142).

## Gerar de novo

```bash
pip install pdfplumber   # e poppler-utils (pdftotext)
python3 tools/normas/mbft/extrair_mbft.py docs/normas/MBVT20222.pdf docs/normas/mbft
python3 tools/normas/mbft/extrair_parte_geral.py docs/normas/mbft/mbft.txt docs/normas/mbft/parte-geral.json
```

Extração automática: em caso de divergência, vale o texto publicado.
