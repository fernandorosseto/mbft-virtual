#!/usr/bin/env python3
"""Recorta os desenhos das fichas do MBFT (com a legenda colorida, ex.: quadradinho vermelho
"AUTUAR 552-50") a partir do PDF oficial e liga cada recorte à ficha da página.

Uso: python3 tools/normas/mbft/extrair_figuras.py docs/normas/MBVT20222.pdf docs/normas/mbft/mbft.json public/figuras docs/normas/mbft/figuras.json

- Posições: pdftohtml -xml (coordenadas da página em 892 × 1261, zoom 1,5 do A4).
- Imagens que se repetem em quase todas as páginas (cabeçalho) e as minúsculas (fios) ficam de fora.
- O recorte começa logo abaixo da linha "Desenho ilustrativo"/"Figura" (ou um pouco acima da
  primeira imagem, quando o desenho continua de outra página) e vai até o fim da última imagem,
  na largura da tabela da ficha. Página renderizada em 2x (pdftoppm) e salva em WebP.
"""
import json
import os
import re
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from collections import Counter

from PIL import Image

ESCALA = 2  # renderiza em 2x as coordenadas do pdftohtml
LEGENDA = re.compile(r'desenho|ilustra|figura|imagem|exemplo ilustrativo', re.I)


def paginas_com_imagem(pdf):
    saida = subprocess.run(['pdfimages', '-list', pdf], capture_output=True, text=True, check=True).stdout
    linhas = [l.split() for l in saida.splitlines()[2:] if l.split()[2:3] == ['image']]
    repetidos = {o for o, n in Counter(l[10] for l in linhas).items() if n > 100}  # cabeçalho
    paginas = set()
    for l in linhas:
        if l[10] in repetidos:
            continue
        if int(l[3]) >= 120 and int(l[4]) >= 60:
            paginas.add(int(l[0]))
    return sorted(paginas)


def caixas(pdf, pagina, pasta):
    base = os.path.join(pasta, f'p{pagina}')
    subprocess.run(['pdftohtml', '-xml', '-q', '-f', str(pagina), '-l', str(pagina), pdf, base], check=True, capture_output=True)
    raiz = ET.parse(base + '.xml').getroot()
    pg = raiz.find('page')
    imagens, textos = [], []
    for el in pg:
        if el.tag not in ('image', 'text'):
            continue  # fontspec e outros
        top, left = float(el.get('top')), float(el.get('left'))
        w, h = float(el.get('width')), float(el.get('height'))
        if el.tag == 'image':
            # fora: cabeçalho (canto de cima) e fios/sobras
            if w < 90 or h < 45 or (top < 150 and w < 120):
                continue
            imagens.append((top, left, w, h))
        elif el.tag == 'text':
            texto = ''.join(el.itertext()).strip()
            if texto:
                textos.append((top, left, h, texto))
    return float(pg.get('width')), float(pg.get('height')), imagens, textos


def faixas(imagens, textos):
    """Agrupa imagens próximas na vertical (um desenho pode ter várias partes) e acha o topo do recorte."""
    imagens = sorted(imagens)
    grupos = []
    for img in imagens:
        if grupos and img[0] <= grupos[-1]['fim'] + 60:
            g = grupos[-1]
            g['fim'] = max(g['fim'], img[0] + img[3])
        else:
            grupos.append({'ini': img[0], 'fim': img[0] + img[3]})
    for g in grupos:
        # Embaixo: legendas curtas coladas na imagem ("Placa R-8a") entram inteiras; texto longo
        # que começa logo abaixo fica de fora (corte antes dele)
        fim = g['fim']
        for t in sorted(textos):
            if fim - 6 <= t[0] <= fim + 30:
                if len(t[3]) <= 40:
                    fim = max(fim, t[0] + t[2] + 2)
                else:
                    g['corte'] = t[0] - 2
                    break
        g['fim'] = min(fim, g.get('corte', fim + 8))
        acima = [t for t in textos if t[0] + t[2] <= g['ini'] + 2]
        legenda = [t for t in acima if LEGENDA.search(t[3]) and g['ini'] - t[0] < 260]
        if legenda:
            ultimo = max(legenda, key=lambda t: t[0])
            g['topo'] = ultimo[0] + ultimo[2] + 2
        else:
            # sem a linha "Desenho...": pega as linhas curtas logo acima (legendas coloridas)
            perto = [t for t in acima if g['ini'] - t[0] < 70]
            g['topo'] = min([t[0] for t in perto], default=g['ini']) - 6
    return grupos


def principal(pdf, mbft, pasta_saida, destino):
    fichas = json.load(open(mbft, encoding='utf-8'))['fichas']
    vistas, inicio = set(), []
    for f in fichas:  # a 542-81 aparece duas vezes: vale a primeira
        if f['codigo'] in vistas:
            continue
        vistas.add(f['codigo'])
        inicio.append((f['pagina'], f['codigo']))
    inicio.sort()

    def ficha_da(pagina):
        dona = None
        for p, c in inicio:
            if p <= pagina:
                dona = c
        return dona

    os.makedirs(pasta_saida, exist_ok=True)
    for antigo in os.listdir(pasta_saida):
        if antigo.endswith('.webp'):
            os.remove(os.path.join(pasta_saida, antigo))
    resultado = {}
    with tempfile.TemporaryDirectory() as tmp:
        for pagina in paginas_com_imagem(pdf):
            if pagina < inicio[0][0]:
                continue  # parte geral
            codigo = ficha_da(pagina)
            larg, alt, imagens, textos = caixas(pdf, pagina, tmp)
            if not imagens:
                continue
            render = os.path.join(tmp, f'r{pagina}')
            dpi = round(72 * (larg / 595.0) * ESCALA)  # mesma escala do pdftohtml, vezes 2
            subprocess.run(['pdftoppm', '-f', str(pagina), '-l', str(pagina), '-r', str(dpi), '-png', '-singlefile', pdf, render], check=True)
            img = Image.open(render + '.png').convert('RGB')
            fx = img.width / larg
            for g in faixas(imagens, textos):
                caixa = (int(40 * fx), int(max(0, g['topo']) * fx), int((larg - 40) * fx), int(min(alt, g['fim'] + 4) * fx))
                recorte = img.crop(caixa)
                if recorte.height < 40:
                    continue
                n = len(resultado.get(codigo, [])) + 1
                nome = f'{codigo}-{n}.webp'
                recorte.save(os.path.join(pasta_saida, nome), 'WEBP', quality=72, method=6)
                resultado.setdefault(codigo, []).append(
                    {'arquivo': f'/figuras/{nome}', 'pagina': pagina, 'largura': recorte.width, 'altura': recorte.height}
                )
    with open(destino, 'w', encoding='utf-8') as f:
        json.dump({'fonte': 'Recortes do PDF oficial (MBVT20222.pdf)', 'figuras': resultado}, f, ensure_ascii=False, indent=1)
        f.write('\n')
    total = sum(len(v) for v in resultado.values())
    print(total, 'figuras em', len(resultado), 'fichas')


if __name__ == '__main__':
    principal(*sys.argv[1:5])
