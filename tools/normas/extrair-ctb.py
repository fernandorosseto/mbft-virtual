"""Extrai o texto vigente do CTB a partir da página compilada do Planalto.

Uso:
    python3 tools/normas/extrair-ctb.py docs/normas/ctb-planalto.html docs/normas/ctb.txt

- A página do Planalto vem em windows-1252.
- Trechos revogados ou com redação substituída aparecem riscados (<strike>/<s>/<del>)
  e são descartados: o .txt contém apenas a redação vigente.
- Cada parágrafo (<p>) vira uma linha.
"""
import html
import re
import sys
from html.parser import HTMLParser

RISCADO = {"strike", "s", "del"}
QUEBRA = {"p", "br", "div", "tr", "li", "h1", "h2", "h3", "h4"}


class Extrator(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.riscado = 0
        self.ignorar = 0
        self.partes = []

    def handle_starttag(self, tag, attrs):
        if tag in RISCADO:
            self.riscado += 1
        elif tag in ("script", "style", "head"):
            self.ignorar += 1
        elif tag in QUEBRA:
            self.partes.append("\n")

    def handle_endtag(self, tag):
        if tag in RISCADO and self.riscado:
            self.riscado -= 1
        elif tag in ("script", "style", "head") and self.ignorar:
            self.ignorar -= 1
        elif tag in QUEBRA:
            self.partes.append("\n")

    def handle_data(self, data):
        if not self.riscado and not self.ignorar:
            self.partes.append(data)


def main(entrada, saida):
    with open(entrada, "rb") as f:
        bruto = f.read().decode("cp1252", errors="replace")
    ex = Extrator()
    ex.feed(bruto)
    texto = html.unescape("".join(ex.partes)).replace("\xa0", " ")
    linhas = [re.sub(r"\s+", " ", l).strip() for l in texto.split("\n")]
    linhas = [l for l in linhas if l]
    with open(saida, "w", encoding="utf-8") as f:
        f.write("\n".join(linhas) + "\n")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
