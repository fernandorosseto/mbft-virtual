#!/usr/bin/env python3
"""Separa os artigos do CTB citados nas fichas do MBFT em blocos (caput, inciso, alínea,
parágrafo, sanção), juntando as linhas quebradas do texto extraído do Planalto.

Uso: python3 tools/normas/extrair_artigos_ctb.py docs/normas/ctb.txt docs/normas/mbft/mbft.json docs/normas/ctb-artigos.json
"""
import json
import re
import sys

ARTIGO = re.compile(r'^Art\.\s*(\d+)(?:º|o)?(-[A-Z])?\.?\s*(.*)$')
INCISO = re.compile(r'^([IVXL]+)\s*(?:[-–]\s*(.*)|$)')
ALINEA = re.compile(r'^([a-z])\)\s*(.*)$')
PARAGRAFO = re.compile(r'^(§\s*\d+(?:º|o)?(?:-[A-Z])?\.?|Parágrafo único\.?)\s*(.*)$')
SANCAO = re.compile(r'^(Infração|Penalidade|Medida administrativa)\s*[-–]\s*(.*)$')
# Título de capítulo ou seção: só maiúsculas (ex.: "CAPÍTULO XV", "DAS INFRAÇÕES")
TITULO = re.compile(r'^[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9 ,\-–]+$')


def espacos(t):
    return re.sub(r'\s+', ' ', t).strip()


def artigos_citados(fichas):
    citados = set()
    for f in fichas:
        amparo = f['amparoLegal']
        for parte in re.split(r'c/c|\be Art\.', amparo):
            if 'Lei' in parte:
                continue
            m = re.search(r'(\d+)(-[A-Z])?', parte)
            if m:
                citados.add(m.group(1) + (m.group(2) or ''))
    return citados


def principal(ctb, mbft, destino):
    brutas = [l.strip() for l in open(ctb, encoding='utf-8').read().split('\n')]
    # "Art." e "§" sozinhos na linha: o número vem na linha seguinte
    linhas = []
    for linha in brutas:
        if linhas and linhas[-1] in ('Art.', '§') and linha:
            linhas[-1] = linhas[-1] + ' ' + linha
        else:
            linhas.append(linha)
    fichas = json.load(open(mbft, encoding='utf-8'))['fichas']
    citados = artigos_citados(fichas)

    artigos = {}
    atual = None
    for bruta in linhas:
        linha = bruta.strip()
        if not linha:
            continue
        m = ARTIGO.match(linha)
        if m:
            numero = m.group(1) + (m.group(2) or '')
            atual = numero if numero in citados and numero not in artigos else None
            if atual:
                artigos[atual] = [{'tipo': 'caput', 'rotulo': f'Art. {numero}.', 'texto': m.group(3)}]
            continue
        if atual is None:
            continue
        if TITULO.match(linha) and len(linha) > 3 and not INCISO.fullmatch(linha):
            atual = None  # capítulo ou seção seguinte: o artigo acabou
            continue
        blocos = artigos[atual]
        for tipo, padrao in (('sancao', SANCAO), ('paragrafo', PARAGRAFO), ('alinea', ALINEA), ('inciso', INCISO)):
            m = padrao.match(linha)
            if m:
                rotulo = m.group(1)
                if tipo in ('inciso', 'sancao'):
                    rotulo = rotulo + ' -'
                blocos.append({'tipo': tipo, 'rotulo': espacos(rotulo), 'texto': m.group(2) or ''})
                break
        else:
            # Continuação; um inciso sozinho na linha recebe o texto que vem com "- " na seguinte
            ultimo = blocos[-1]
            ultimo['texto'] = espacos(ultimo['texto'] + ' ' + re.sub(r'^[-–]\s*', '', linha) if not ultimo['texto'] else ultimo['texto'] + ' ' + linha)

    for blocos in artigos.values():
        for b in blocos:
            b['texto'] = espacos(b['texto'])

    faltando = sorted(citados - set(artigos), key=lambda a: int(re.match(r'\d+', a).group()))
    if faltando:
        print('artigos não encontrados no CTB:', faltando, file=sys.stderr)
    with open(destino, 'w', encoding='utf-8') as f:
        json.dump({
            'fonte': 'docs/normas/ctb.txt (página compilada do Planalto, sem redações revogadas)',
            'aviso': 'Extração automática. Em caso de divergência, vale o texto publicado.',
            'artigos': artigos,
        }, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print(len(artigos), 'artigos')


if __name__ == '__main__':
    principal(*sys.argv[1:4])
