#!/usr/bin/env python3
"""Confere o mbft.json contra o PDF oficial, palavra por palavra, ficha por ficha.

Uso: python3 tools/normas/mbft/conferir_mbft.py docs/normas/MBVT20222.pdf docs/normas/mbft/mbft.json

Para cada ficha, compara as palavras do texto do PDF nas páginas dela (pdftotext -raw, sem
cabeçalho e rótulos dos campos) com as palavras dos campos do JSON. Aponta texto do PDF que não
entrou no JSON (perdido na extração) e texto do JSON que não está no PDF (lixo ou repetição).
Diferenças conhecidas e conferidas à vista ficam em ESPERADAS. Sai com erro se houver outras.

Limitação: compara palavras, não a ordem. Texto trocado de lugar dentro da ficha não aparece.
"""
import collections
import json
import re
import subprocess
import sys

ROTULOS = [
    'CONSELHO NACIONAL DE TRÂNSITO', 'MANUAL BRASILEIRO DE FISCALIZAÇÃO DE TRÂNSITO – MBFT', 'FICHA DE FISCALIZAÇÃO',
    'Tipificação Resumida:', 'Código do Enquadramento:', 'Código de Enquadramento:', 'Código Enquadramento:',
    'Amparo Legal:', 'Tipificação do Enquadramento:', 'Gravidade:', 'Penalidade:', 'Penalidades:',
    'Medida Administrativa:', 'Medidas Administrativas:', 'Infrator:', 'Competência:', 'Pontuação:',
    'Constatação da Infração:', 'Quando Autuar:', 'Quando AUTUAR', 'Quando NÃO Autuar:', 'Quando NÃO Autuar',
    'Definições e Procedimentos:', 'Definições e Procedimentos', 'Exemplos do Campo de Observações do AIT:',
    'Informações Complementares:', 'Pode Configurar Crime de Trânsito:', 'Pode Configurar Crime de Trânsito',
    'Pode Configurar Infração Penal:', 'Exemplos do Campo de Observações do AIT',
    # títulos das colunas, numa linha só
    'Quando AUTUAR Quando NÃO Autuar Definições e Procedimentos',
    'Quando AUTUAR Quando NÃO Autuar Definições e Procedimentos Exemplos do Campo de Observações do AIT',
]
CAMPOS = ['codigo', 'tipificacaoResumida', 'amparoLegal', 'tipificacao', 'gravidade', 'penalidade',
          'medidaAdministrativa', 'infrator', 'competencia', 'pontuacao', 'constatacao', 'crime', 'quandoAutuar',
          'quandoNaoAutuar', 'definicoesEProcedimentos', 'exemplosObservacoes', 'informacoesComplementares']
# Legendas dos desenhos ("AUTUAR 552-50", "NÃO AUTUAR") ficam nas imagens recortadas
IGNORAR = {'AUTUAR', 'NÃO'}
# Conferidas à vista no PDF
ESPERADAS = {
    # glifos sem tradução no PDF ("e rodovias", "ap s o p r-do-sol"), corrigidos no extrator
    '515-01': ({'e', 'ap', 's', 'p', 'r'}, {'em', 'após', 'pôr'}),
    '515-02': ({'e', 'ap', 's', 'p', 'r'}, {'em', 'após', 'pôr'}),
    '515-03': ({'e', 'ap', 's', 'p', 'r'}, {'em', 'após', 'pôr'}),
    # números de imagens no pé da página
    '639-43': ({'1', '2'}, set()),
    '672-63': ({'1'}, set()),
}
LIGADURAS = str.maketrans({'ﬁ': 'fi', 'ﬂ': 'fl'})


def palavras(t):
    return collections.Counter(re.findall(r'[\wÀ-ÿº°ª§%$]+', t.translate(LIGADURAS)))


def principal(pdf, mbft):
    paginas = subprocess.run(['pdftotext', '-raw', pdf, '-'], capture_output=True, text=True, check=True).stdout.split('\f')
    fichas = json.load(open(mbft, encoding='utf-8'))['fichas']
    inicio = sorted({(f['pagina'], f['codigo']) for f in fichas})
    problemas = 0
    for k, (p, codigo) in enumerate(inicio):
        fim = inicio[k + 1][0] - 1 if k + 1 < len(inicio) else len(paginas)
        texto = '\n'.join(paginas[p - 1 : fim])
        # Rótulos só quando ocupam a linha toda (no meio do texto, "Definições e Procedimentos" é
        # referência e fica), com ou sem dois-pontos
        for r in sorted(ROTULOS, key=len, reverse=True):
            corpo = r':?\s+'.join(map(re.escape, r.rstrip(':').split()))
            # sem diferenciar caixa ("Quando AUTUAR", "crime"), mas começando com maiúscula: em
            # minúsculas é texto da ficha ("...pelas / informações complementares / da sinalização")
            texto = re.sub(
                rf'(?im)^[ \t]*{corpo}[ \t]*:?[ \t]*$', lambda m: ' ' if m.group(0).strip()[0].isupper() else m.group(0), texto
            )
        ficha = next(f for f in fichas if f['codigo'] == codigo and f['pagina'] == p)
        js = ' '.join(' '.join(v) if isinstance(v, list) else str(v) for v in (ficha.get(c, '') for c in CAMPOS))
        a, b = palavras(texto), palavras(js)
        falta = {w for w in a - b if w not in IGNORAR}
        sobra = set(b - a)
        esp = ESPERADAS.get(codigo, (set(), set()))
        falta -= esp[0]
        sobra -= esp[1]
        if falta or sobra:
            problemas += 1
            print(f'{codigo} (pág. {p}): só no PDF {sorted(falta)[:15]} | só no JSON {sorted(sobra)[:15]}')
    print(f'{len(inicio)} fichas conferidas, {problemas} com diferença')
    return problemas


if __name__ == '__main__':
    sys.exit(1 if principal(*sys.argv[1:3]) else 0)
