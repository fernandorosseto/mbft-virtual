"""
Converte o Manual Brasileiro de Fiscalização de Trânsito (MBFT, Res. CONTRAN 985/2022) em JSON.

Uso:  python3 tools/normas/mbft/extrair_mbft.py docs/normas/MBVT20222.pdf docs/normas/mbft

Gera:
  mbft.json   metadados, parte geral (texto por página) e uma entrada por ficha de fiscalização
  mbft.txt    texto corrido do PDF (pdftotext -layout), para conferências literais

As fichas são tabelas com bordas: cada campo é lido da célula dele (pdfplumber), não do texto
corrido, porque as colunas "Quando autuar", "Quando NÃO autuar", "Definições e procedimentos" e
"Exemplos" ficam lado a lado e continuam nas páginas seguintes.
"""
import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

import pdfplumber

FONTE = 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/mbvt20222.pdf'

# Rótulo da célula → campo do JSON. Comparação por chave() (sem acento de pontuação, espaços e
# caixa); o PDF tem variações ("Código de Enquadramento", "Medidas Administrativas",
# "Pode Configurar Infração Penal").
ROTULOS = [
    (r'tipificaçãoresumida', 'tipificacaoResumida'),
    (r'código(do|de)?enquadramento', 'codigo'),
    (r'amparolegal', 'amparoLegal'),
    (r'tipificaçãodoenquadramento', 'tipificacao'),
    (r'gravidade', 'gravidade'),
    (r'penalidades?', 'penalidade'),
    (r'medidas?administrativas?', 'medidaAdministrativa'),
    (r'podeconfigurar(crimedetrânsito|infraçãopenal)', 'crime'),
    (r'infrator', 'infrator'),
    (r'competência', 'competencia'),
    (r'pontuação', 'pontuacao'),
    (r'constataçãodainfração', 'constatacao'),
    (r'informaçõescomplementares', 'informacoesComplementares'),
]
COLUNAS = [
    ('Quando AUTUAR', 'quandoAutuar'),
    ('Quando NÃO Autuar', 'quandoNaoAutuar'),
    ('Definições e Procedimentos', 'definicoesEProcedimentos'),
    ('Exemplos do Campo de Observações do AIT:', 'exemplosObservacoes'),
]
CABECALHO = ('CONSELHO NACIONAL DE TRÂNSITO', 'MANUAL BRASILEIRO DE FISCALIZAÇÃO', 'FICHA DE FISCALIZAÇÃO')


def juntar_linhas(texto: str) -> str:
    """Desfaz a quebra de linha do PDF: hífen no fim da linha é mantido e colado à linha seguinte."""
    linhas = [l.strip() for l in texto.split('\n')]
    saida = ''
    for l in linhas:
        if not l:
            continue
        if not saida:
            saida = l
        elif saida.endswith('-'):
            saida += l
        else:
            saida += ' ' + l
    return re.sub(r'\s+', ' ', saida).strip()


ITEM = re.compile(r'^(\d+)\s?\.\s')


def em_itens(texto: str) -> list[str]:
    """Divide uma coluna em itens numerados ("1. ...", "2. ..."), respeitando a ordem."""
    blocos: list[list[str]] = []
    esperado = 1
    for l in texto.split('\n'):
        l = l.strip()
        if not l:
            continue
        m = ITEM.match(l)
        if m and int(m.group(1)) == esperado:
            blocos.append([l])
            esperado += 1
        elif blocos:
            blocos[-1].append(l)
        else:
            blocos.append([l])
    return [juntar_linhas('\n'.join(b)) for b in blocos]


def normalizar_rotulo(t: str) -> str:
    return re.sub(r'\s+', ' ', t.replace('‘', '').replace('’', '').replace("'", '')).strip()


def chave(t: str) -> str:
    """Rótulo comparável: sem pontuação, espaços nem caixa."""
    return re.sub(r'[^0-9a-zà-ú]', '', normalizar_rotulo(t).lower())


def tabelas_externas(page):
    tabs = page.find_tables()
    def dentro(a, b):
        return a.bbox[0] >= b.bbox[0] - 1 and a.bbox[1] >= b.bbox[1] - 1 and a.bbox[2] <= b.bbox[2] + 1 and a.bbox[3] <= b.bbox[3] + 1
    return [t for t in tabs if not any(o is not t and dentro(t, o) for o in tabs)]


def texto_celula(page, bbox) -> str:
    x0, y0, x1, y1 = bbox
    area = page.crop((max(x0, 0), max(y0, 0), min(x1, page.width), min(y1, page.height)))
    return area.extract_text() or ''


def extrair_fichas(pdf, primeira_pagina: int):
    fichas = []
    atual = None
    colunas = None  # [(x0, x1, campo)]
    modo = None  # 'colunas' | 'info'
    for n in range(primeira_pagina, len(pdf.pages)):
        page = pdf.pages[n]
        for tab in tabelas_externas(page):
            for row in tab.rows:
                celulas = [c for c in row.cells if c]
                textos = [(c, texto_celula(page, c)) for c in celulas]
                textos = [(c, t) for c, t in textos if t.strip()]
                if not textos:
                    continue
                cab = normalizar_rotulo(textos[0][1])
                if any(cab.startswith(h) for h in CABECALHO):
                    continue
                # Linha de títulos das colunas
                rot_col = [normalizar_rotulo(t) for _, t in textos]
                if rot_col and chave(rot_col[0]) == chave(COLUNAS[0][0]):
                    colunas = []
                    for (c, _), r in zip(textos, rot_col):
                        campo = next((k for rot, k in COLUNAS if chave(r) == chave(rot)), None)
                        if campo is None:
                            raise ValueError(f'coluna desconhecida na p. {n + 1}: {r!r}')
                        colunas.append((c[0], c[2], campo))
                    modo = 'colunas'
                    continue
                rotulada = False
                for c, t in textos:
                    plano = chave(t.split(':')[0] if ':' in t else t)
                    for rot, campo in ROTULOS:
                        if re.fullmatch(rot, plano):
                            rotulada = True
                            # Valor: o que vem depois do rótulo (que pode ocupar duas linhas)
                            resto = t.split(':', 1)[1] if ':' in t else ''
                            if campo == 'tipificacaoResumida':
                                atual = {'pagina': n + 1}
                                fichas.append(atual)
                                colunas, modo = None, None
                            if atual is None:
                                raise ValueError(f'campo antes da primeira ficha na p. {n + 1}')
                            if campo == 'informacoesComplementares':
                                modo = 'info'
                                atual['_info'] = [resto]
                            else:
                                atual[campo] = juntar_linhas(resto)
                            break
                if rotulada or atual is None:
                    continue
                if modo == 'info':
                    atual['_info'].extend(t for _, t in textos)
                elif modo == 'colunas' and colunas:
                    for c, t in textos:
                        meio = (c[0] + c[2]) / 2
                        alvo = min(colunas, key=lambda col: 0 if col[0] <= meio <= col[1] else min(abs(meio - col[0]), abs(meio - col[1])))
                        atual.setdefault('_' + alvo[2], []).append(t)
                else:
                    atual.setdefault('_sobra', []).append('\n'.join(t for _, t in textos))
    # Pós-processamento
    for f in fichas:
        for _, campo in COLUNAS:
            f[campo] = em_itens('\n'.join(f.pop('_' + campo, [])))
        f['informacoesComplementares'] = em_itens('\n'.join(f.pop('_info', [])))
        sobra = f.pop('_sobra', None)
        if sobra:
            f['textoNaoClassificado'] = [juntar_linhas(s) for s in sobra]
    return fichas


def ordenar(f: dict) -> dict:
    ordem = ['codigo', 'tipificacaoResumida', 'amparoLegal', 'tipificacao', 'gravidade', 'penalidade',
             'medidaAdministrativa', 'infrator', 'competencia', 'pontuacao', 'constatacao', 'crime',
             'quandoAutuar', 'quandoNaoAutuar', 'definicoesEProcedimentos', 'exemplosObservacoes',
             'informacoesComplementares', 'textoNaoClassificado', 'pagina']
    return {k: f[k] for k in ordem if k in f}


def main():
    pdf_path, saida = Path(sys.argv[1]), Path(sys.argv[2])
    saida.mkdir(parents=True, exist_ok=True)
    txt = subprocess.run(['pdftotext', '-layout', str(pdf_path), '-'], capture_output=True, text=True, check=True).stdout
    (saida / 'mbft.txt').write_text(txt, encoding='utf-8')

    with pdfplumber.open(pdf_path) as pdf:
        primeira = next(i for i, p in enumerate(pdf.pages) if 'FICHA DE FISCALIZAÇÃO' in (p.extract_text() or ''))
        parte_geral = [{'pagina': i + 1, 'texto': (pdf.pages[i].extract_text() or '').strip()} for i in range(primeira)]
        fichas = [ordenar(f) for f in extrair_fichas(pdf, primeira)]

    dados = {
        'titulo': 'Manual Brasileiro de Fiscalização de Trânsito (MBFT)',
        'norma': 'Resolução CONTRAN nº 985/2022 (anexo), com as atualizações do arquivo de origem',
        'fonte': FONTE,
        'arquivo': pdf_path.name,
        'extraidoEm': date.today().isoformat(),
        'aviso': 'Extração automática do PDF oficial. Em caso de divergência, vale o texto publicado.',
        'campos': {
            'codigo': 'Código do enquadramento (infração e desdobramento)',
            'tipificacaoResumida': 'Conduta conforme portaria do órgão máximo executivo de trânsito da União',
            'amparoLegal': 'Dispositivo do CTB',
            'tipificacao': 'Conduta conforme o CTB',
            'crime': 'Pode configurar crime de trânsito (Capítulo XIX do CTB)',
            'constatacao': 'Se a abordagem é ou não necessária',
            'quandoAutuar': 'Situações que configuram a infração',
            'quandoNaoAutuar': 'Situações que não configuram a infração ou remetem a outro enquadramento',
            'definicoesEProcedimentos': 'Dispositivos legais, definições e procedimentos',
            'exemplosObservacoes': 'Exemplos para o campo de observações do AIT',
            'informacoesComplementares': 'Situações específicas, normas aplicáveis e sinalização',
            'pagina': 'Página do PDF onde a ficha começa',
        },
        'parteGeral': parte_geral,
        'fichas': fichas,
    }
    (saida / 'mbft.json').write_text(json.dumps(dados, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(fichas)} fichas, parte geral com {len(parte_geral)} páginas')


if __name__ == '__main__':
    main()
