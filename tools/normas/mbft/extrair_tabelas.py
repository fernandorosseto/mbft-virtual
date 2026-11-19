#!/usr/bin/env python3
"""Tabelas das fichas do MBFT, tiradas do PDF oficial.

Uso: python3 tools/normas/mbft/extrair_tabelas.py docs/normas/MBVT20222.pdf docs/normas/mbft/mbft.json public/tabelas docs/normas/mbft/tabelas.json

O texto da ficha (mbft.json) traz a tabela achatada num parágrafo. Para cada tabela listada em
TABELAS (escolhidas à mão, conferindo as páginas da ficha), o site troca o trecho entre `inicio`
e `fim` do item pela tabela:
- tabela simples (linhas e colunas sem mesclas): células lidas com pdfplumber, juntando a
  continuação na página seguinte (mesmo número de colunas, no topo da página);
- tabela com muitas células mescladas: recorte da página em WebP (como os desenhos), porque
  montar em HTML arriscaria trocar uma célula de lugar.
Tabela que já aparece num desenho recortado (ex.: 683-11, Res. 547/2015) não entra.
"""
import json
import os
import subprocess
import sys
import tempfile

import pdfplumber
from PIL import Image

CNH = {
    'campo': 'informacoesComplementares',
    'item': 0,
    'inicio': 'TABELA DE CÓDIGOS',
    'fim': 'Outras restrições X',
    'tipo': 'celulas',
}
TABELAS = {
    '505-31': [{**CNH, 'paginas': [50, 51]}],
    '505-32': [{**CNH, 'paginas': [53, 54]}],
    '505-33': [{**CNH, 'paginas': [55, 56]}],
    '505-34': [{**CNH, 'paginas': [58, 59]}],
    '675-00': [
        {
            'campo': 'informacoesComplementares',
            'item': 1,
            'inicio': 'Resolução 562/80',
            'fim': '( p a c ( p ( n',
            'tipo': 'imagem',
            # página, topo e fim do recorte em pontos do PDF (595 × 841)
            'recortes': [[610, 135, 767], [611, 39, 779], [612, 39, 102]],
        }
    ],
}
ESCALA = 2.75  # 595 pt → ~1636 px, a mesma largura dos desenhos


def limpa(c):
    return ' '.join((c or '').split())


def celulas(pdf, paginas):
    linhas, colunas = [], None
    for p in paginas:
        for t in pdf.pages[p - 1].find_tables():
            rows = t.extract()
            n = max(len(r) for r in rows)
            if any('Tipificação' in (c or '') for r in rows for c in r):
                continue  # moldura da ficha
            if colunas is None and any('TABELA' in (c or '') for c in rows[0]):
                colunas = n
                linhas += rows
            elif colunas == n and linhas:
                linhas += rows  # continuação na página seguinte
    if not linhas:
        raise SystemExit(f'tabela não encontrada nas páginas {paginas}')
    titulo = limpa(linhas[0][0])
    cab = [limpa(c) for c in linhas[1]]
    corpo = [[limpa(c) for c in r] for r in linhas[2:]]
    return {'titulo': titulo, 'cabecalho': cab, 'linhas': corpo}


def imagens(pdf_caminho, codigo, recortes, pasta):
    saida = []
    with tempfile.TemporaryDirectory() as tmp:
        for n, (p, topo, fim) in enumerate(recortes, 1):
            base = os.path.join(tmp, f'p{p}')
            subprocess.run(['pdftoppm', '-f', str(p), '-l', str(p), '-r', str(round(72 * ESCALA)), '-png', '-singlefile', pdf_caminho, base], check=True)
            img = Image.open(base + '.png').convert('RGB')
            fx = img.width / 595.0
            rec = img.crop((int(36 * fx), int(topo * fx), int(560 * fx), int(fim * fx)))
            nome = f'{codigo}-{n}.webp'
            rec.save(os.path.join(pasta, nome), 'WEBP', quality=72, method=6)
            saida.append({'arquivo': f'/tabelas/{nome}', 'pagina': p, 'largura': rec.width, 'altura': rec.height})
    return saida


def principal(pdf_caminho, mbft, pasta, destino):
    fichas = {f['codigo']: f for f in reversed(json.load(open(mbft, encoding='utf-8'))['fichas'])}
    os.makedirs(pasta, exist_ok=True)
    for antigo in os.listdir(pasta):
        if antigo.endswith('.webp'):
            os.remove(os.path.join(pasta, antigo))
    pdf = pdfplumber.open(pdf_caminho)
    resultado = {}
    for codigo, lista in TABELAS.items():
        for t in lista:
            texto = fichas[codigo][t['campo']][t['item']]
            if t['inicio'] not in texto or t['fim'] not in texto:
                raise SystemExit(f'{codigo}: início ou fim da tabela não está no texto da ficha')
            item = {k: t[k] for k in ('campo', 'item', 'inicio', 'fim')}
            if t['tipo'] == 'celulas':
                item.update(pagina=t['paginas'][0], **celulas(pdf, t['paginas']))
            else:
                item.update(pagina=t['recortes'][0][0], imagens=imagens(pdf_caminho, codigo, t['recortes'], pasta))
            resultado.setdefault(codigo, []).append(item)
    with open(destino, 'w', encoding='utf-8') as f:
        json.dump(
            {
                'aviso': 'Tabelas das fichas, do PDF oficial (tools/normas/mbft/extrair_tabelas.py). O site troca o trecho entre inicio e fim do item pela tabela.',
                'fichas': resultado,
            },
            f,
            ensure_ascii=False,
            indent=1,
        )
        f.write('\n')
    print(sum(len(v) for v in resultado.values()), 'tabelas em', len(resultado), 'fichas')


if __name__ == '__main__':
    principal(*sys.argv[1:5])
