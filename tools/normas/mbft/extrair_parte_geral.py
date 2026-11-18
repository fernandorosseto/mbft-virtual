#!/usr/bin/env python3
"""Separa a Parte Geral do MBFT em seções e parágrafos.

Lê o texto do pdftotext -layout (docs/normas/mbft/mbft.txt), que preserva os espaços entre
as palavras (o texto por página do mbft.json, extraído com pdfplumber, cola palavras nas
linhas justificadas). Os títulos vêm do sumário do próprio manual.

Uso: python3 tools/normas/mbft/extrair_parte_geral.py docs/normas/mbft/mbft.txt docs/normas/mbft/parte-geral.json
"""
import json
import re
import sys
import unicodedata

# Sumário do manual (pág. 4): (número, título, nível). Número None = subtítulo sem número.
SUMARIO = [
    ('1', 'APRESENTAÇÃO', 1),
    ('1.1', 'A Segurança Viária e o Manual Brasileiro de Fiscalização de Trânsito (MBFT)', 2),
    ('1.2', 'MBFT - Divisão e Modo de Utilização', 2),
    ('2', 'LISTA DE ABREVIATURAS E SIGLAS', 1),
    ('3', 'INTRODUÇÃO', 1),
    ('4', 'AGENTE DA AUTORIDADE DE TRÂNSITO', 1),
    ('5', 'INFRAÇÃO DE TRÂNSITO', 1),
    ('6', 'RESPONSABILIDADE PELA INFRAÇÃO', 1),
    ('6.1', 'Proprietário', 2),
    ('6.2', 'Condutor', 2),
    ('6.3', 'Embarcador', 2),
    ('6.4', 'Transportador', 2),
    ('6.5', 'Responsabilidade Solidária', 2),
    ('7', 'AUTUAÇÃO', 1),
    (None, 'Infrações Concorrentes', 2),
    (None, 'Infrações Concomitantes', 2),
    (None, 'Infrações Continuadas', 2),
    (None, 'Infrações Sucessivas', 2),
    ('7.1', 'Fiscalização de Veículos de Emergência por Equipamentos Eletrônicos', 2),
    ('8', 'MEDIDAS ADMINISTRATIVAS', 1),
    ('8.1', 'Retenção do Veículo', 2),
    ('8.2', 'Remoção do Veículo', 2),
    ('8.3', 'Recolhimento do Documento de Habilitação', 2),
    ('8.4', 'Recolhimento do Certificado de Licenciamento Anual (CLA/CRLV-e)', 2),
    ('8.5', 'Transbordo do Excesso de Carga', 2),
    ('8.6', 'Recolhimento de Animais que se Encontrem Soltos nas Vias e na Faixa de Domínio das Vias de Circulação', 2),
    ('8.7', 'Medidas Administrativas Inominadas', 2),
    ('9', 'HABILITAÇÃO', 1),
    ('9.1', 'Condutor Oriundo de País Estrangeiro', 2),
    ('10', 'DISPOSIÇÕES FINAIS', 1),
]

MARCADOR = re.compile(r'^(●|[a-z]\)|[IVX]+\s*[.\-–])\s+(.*)$')
SIGLA = re.compile(r'^([A-Za-z][A-Za-z.\-]*):\s+(.*)$')
FIM_DE_FRASE = re.compile(r'[.;:!?)”"]$')


def espacos(t):
    return re.sub(r'\s+', ' ', t).strip()


def slug(t):
    t = unicodedata.normalize('NFD', t).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def principal(origem, destino):
    linhas = open(origem, encoding='utf-8').read().replace('\f', '\n').split('\n')
    inicio = next(i for i, l in enumerate(linhas) if i > 140 and l.strip() == '1. APRESENTAÇÃO')
    fim = next(i for i, l in enumerate(linhas) if i > inicio and l.strip() == '11. FICHAS DE FISCALIZAÇÃO')

    secoes = []
    pagina = 5
    proximo = 0  # índice do próximo título do sumário
    i = inicio
    while i < fim:
        bruta = linhas[i]
        texto = bruta.strip()
        i += 1
        if not texto:
            continue
        if re.fullmatch(r'\d+', texto):  # número da página, no pé
            pagina = int(texto) + 1
            continue

        # Título: número + início do título do sumário, juntando as linhas até completá-lo
        if proximo < len(SUMARIO):
            numero, titulo, nivel = SUMARIO[proximo]
            esperado = espacos(f'{numero}. {titulo}' if numero else titulo)
            if esperado.startswith(espacos(texto)):
                lido = espacos(texto)
                while lido != esperado:
                    lido = espacos(lido + ' ' + linhas[i])
                    i += 1
                    if len(lido) > len(esperado):
                        raise SystemExit(f'título não confere: {esperado!r} x {lido!r}')
                secoes.append({
                    'id': slug(numero) if numero else slug(titulo),
                    'numero': numero,
                    'titulo': titulo,
                    'nivel': nivel,
                    'pagina': pagina,
                    'blocos': [],
                })
                proximo += 1
                continue

        blocos = secoes[-1]['blocos']
        recuo = len(bruta) - len(bruta.lstrip())
        if secoes[-1]['numero'] == '2' and SIGLA.match(texto):
            m = SIGLA.match(texto)
            blocos.append({'tipo': 'sigla', 'marcador': m.group(1), 'texto': m.group(2), 'pagina': pagina})
            continue
        m = MARCADOR.match(texto)
        if m:
            blocos.append({'tipo': 'item', 'marcador': espacos(m.group(1)), 'texto': espacos(m.group(2)), 'pagina': pagina})
            continue
        anterior = blocos[-1] if blocos else None
        # Linha recuada depois de frase terminada abre parágrafo; o resto continua o bloco anterior.
        # Não abre se o bloco anterior tem parêntese aberto ou se a linha começa em minúscula ou
        # número (frase partida na quebra de página).
        abre = (
            anterior is None
            or (
                recuo >= 5
                and FIM_DE_FRASE.search(anterior['texto'])
                and anterior['texto'].count('(') <= anterior['texto'].count(')')
                and not re.match(r'[a-z0-9]', texto)
            )
        )
        if abre:
            blocos.append({'tipo': 'p', 'texto': espacos(texto), 'pagina': pagina})
        else:
            anterior['texto'] = espacos(anterior['texto'] + ' ' + texto)

    if proximo != len(SUMARIO):
        raise SystemExit(f'títulos não encontrados a partir de {SUMARIO[proximo]}')

    with open(destino, 'w', encoding='utf-8') as f:
        json.dump({
            'titulo': 'Manual Brasileiro de Fiscalização de Trânsito (MBFT): Parte Geral',
            'fonte': 'docs/normas/mbft/mbft.txt (pdftotext -layout de MBVT20222.pdf), págs. 5 a 30',
            'aviso': 'Extração automática do PDF oficial. Em caso de divergência, vale o texto publicado.',
            'secoes': secoes,
        }, f, ensure_ascii=False, indent=1)
        f.write('\n')


if __name__ == '__main__':
    principal(sys.argv[1], sys.argv[2])
