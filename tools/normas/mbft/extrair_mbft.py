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


# Correções conferidas à vista no PDF (págs. 94, 96, 98, 313 e 383): o pdfplumber devolve
# glifos sem tradução (cid) e separa letras com espaçamento maior.
CORRECOES = [
    ('e(cid:373) rodovias', 'em rodovias'),
    ('ap(cid:383)s o p(cid:384)r-do-sol', 'após o pôr-do-sol'),
    ('restrições”(cid:856)', 'restrições”.'),
    ('transitava e ntre as faixas', 'transitava entre as faixas'),
    ('mantendo d istância segura', 'mantendo distância segura'),
    ('deverá s e r feita', 'deverá ser feita'),
]


def corrigir(texto: str) -> str:
    for errado, certo in CORRECOES:
        texto = texto.replace(errado, certo)
    return texto


# Começo de linha que, no PDF, é item de lista (resoluções "nº 037/1998: ...", marcadores "- ",
# incisos "I - ", alíneas "a) ", títulos de artigo "Art. 105. São", parágrafos "§ 1º", "Pena:").
# Nos campos em lista, a linha fica separada (quebra "\n") em vez de colada no parágrafo.
LISTA = re.compile(
    r'^(?:'
    r'(?:Resolução (?:do )?Contran |Portaria [\w ]+?|Deliberação (?:do )?Contran )?[nN][º°o]\.?\s*\d[\d.]*/\d{2,4}\s*[:–-]'
    r'|[-–•]\s+\S'
    r'|[IVXL]+\s*[-–]\s'
    r'|[a-z]\)\s'
    r'|Art\.\s*\d+[º°]?(?:-[A-Z])?\.?\s+[A-ZÀ-Ú]'
    r'|§\s*\d+[º°]?\s'
    r'|Parágrafo único'
    r'|\*\s'
    r'|Pena\s*[:–-]'
    r')'
)
ALINEA = re.compile(r'^[a-z]\)\s')
# ...e só quando a linha anterior fecha uma frase ou um item (senão é frase que só mudou de linha:
# "TÍTULO / - definição", "art. 95, caput / - 751-02.")
FIM_DE_ITEM = re.compile(r'([.:;*]|\[\.{3,4}\]|\(\.{3}\)|\d{4}\)|\bou|\be)\s*$')


def comeca_item(anterior: str, linha: str) -> bool:
    if not LISTA.match(linha):
        return False
    if ALINEA.match(linha):
        return not anterior.endswith(',')  # alínea depois de título ("PLACA R-17 / a) ...")
    return bool(FIM_DE_ITEM.search(anterior))


def juntar_linhas(texto: str, listas: bool = False) -> str:
    """Desfaz a quebra de linha do PDF: hífen no fim da linha é mantido e colado à linha seguinte.
    Com `listas`, linha que começa item de lista fica em linha própria ("\n")."""
    linhas = [l.strip() for l in texto.split('\n')]
    saida = ''
    anterior = ''
    for l in linhas:
        if not l:
            continue
        if not saida:
            saida = l
        elif listas and comeca_item(anterior, l):
            saida += '\n' + l
        elif saida.endswith('-'):
            saida += l
        else:
            saida += ' ' + l
        anterior = l
    return corrigir(re.sub(r'[ \t]+', ' ', re.sub(r'[ \t]*\n[ \t]*', '\n', saida)).strip())


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
    return [juntar_linhas('\n'.join(b), listas=True) for b in blocos]


def dentro_de(a, b) -> bool:
    return a[0] >= b[0] - 1 and a[1] >= b[1] - 1 and a[2] <= b[2] + 1 and a[3] <= b[3] + 1


def separar_rotulo(t: str) -> tuple[str, str]:
    """Rótulo e valor da célula. Normalmente separados por ':'; sem ele, o rótulo são as primeiras
    linhas que formam um rótulo conhecido (na 679-30: "Pode Configurar Crime de / Trânsito / NÃO")."""
    if ':' in t:
        rotulo, resto = t.split(':', 1)
        return rotulo, resto
    linhas = t.split('\n')
    for i in range(1, len(linhas)):
        if any(re.fullmatch(rot, chave(' '.join(linhas[:i]))) for rot, _ in ROTULOS):
            return ' '.join(linhas[:i]), '\n'.join(linhas[i:])
    return t, ''


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


def linhas_soltas(page) -> list[tuple[float, str]]:
    """Linhas de texto fora de qualquer tabela (sem a numeração da página no rodapé)."""
    caixas = [t.bbox for t in page.find_tables()]
    linhas: dict[int, list] = {}
    for w in page.extract_words():
        cx, cy = (w['x0'] + w['x1']) / 2, (w['top'] + w['bottom']) / 2
        if any(b[0] - 1 <= cx <= b[2] + 1 and b[1] - 1 <= cy <= b[3] + 1 for b in caixas):
            continue
        chave_linha = next((k for k in linhas if abs(k - w['top']) <= 3), round(w['top']))
        linhas.setdefault(chave_linha, []).append(w)
    saida = []
    for topo in sorted(linhas):
        texto = ' '.join(w['text'] for w in sorted(linhas[topo], key=lambda w: w['x0']))
        if re.fullmatch(r'\d{1,3}', texto) and topo > page.height - 70:
            continue  # número da página ou de imagem no pé
        saida.append((topo, texto))
    return saida


def texto_celula(page, bbox) -> str:
    x0, y0, x1, y1 = bbox
    # Só os caracteres dentro da célula (com 1 pt de folga): o crop pegava letras de células
    # vizinhas que encostam na borda ("N Não há. ." na 722-61)
    area = page.within_bbox((max(x0 - 1, 0), max(y0 - 1, 0), min(x1 + 1, page.width), min(y1 + 1, page.height)))
    return area.extract_text() or ''


def extrair_fichas(pdf, primeira_pagina: int):
    fichas = []
    atual = None
    colunas = None  # [(x0, x1, campo)]
    modo = None  # 'colunas' | 'info'
    for n in range(primeira_pagina, len(pdf.pages)):
        page = pdf.pages[n]
        # Linhas das tabelas e texto solto fora delas, na ordem em que aparecem na página
        trechos = [(row.bbox[1], row) for tab in tabelas_externas(page) for row in tab.rows]
        trechos += linhas_soltas(page)
        trechos.sort(key=lambda t: t[0])
        faixa = None  # [topo, fundo] do corpo em colunas nesta página
        lidas: list[tuple] = []  # células já lidas nesta página

        def descarregar():
            # Corpo em colunas: cada coluna é lida pela largura dela, de cima a baixo da faixa,
            # e não célula por célula (o PDF nem sempre fecha as bordas: na 584-34 a célula de
            # "Definições e procedimentos" tinha 13 pt e os itens 2 a 4 ficavam de fora)
            nonlocal faixa
            if faixa and atual is not None and colunas:
                for x0, x1, campo in colunas:
                    t = texto_celula(page, (x0, faixa[0], x1, faixa[1]))
                    if t.strip():
                        atual.setdefault('_' + campo, []).append(t)
            faixa = None

        for _, row in trechos:
            if isinstance(row, str):
                # Texto fora das molduras: continuação das informações complementares (págs. de
                # texto corrido, como as listas de resoluções da 664-50) ou trecho sem campo
                if atual is None:
                    continue
                if modo == 'info':
                    atual['_info'].append(row)
                else:
                    descarregar()
                    atual.setdefault('_sobra', []).append(row)
                continue
            if True:
                # Célula dentro de outra já lida nesta página (tabela aninhada cuja célula de fora
                # já traz o texto): ficaria repetida (518-52, resumo do cinto de segurança)
                celulas = [c for c in row.cells if c and not any(dentro_de(c, v) for v in lidas)]
                lidas.extend(celulas)
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
                if modo == 'colunas' and colunas and not any(
                    re.fullmatch(rot, chave(separar_rotulo(t)[0])) for _, t in textos for rot, _ in ROTULOS
                ):
                    faixa = [min(faixa[0], row.bbox[1]), max(faixa[1], row.bbox[3])] if faixa else [row.bbox[1], row.bbox[3]]
                    continue
                descarregar()
                for c, t in textos:
                    rotulo, resto = separar_rotulo(t)
                    plano = chave(rotulo)
                    for rot, campo in ROTULOS:
                        if re.fullmatch(rot, plano):
                            rotulada = True
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
                else:
                    atual.setdefault('_sobra', []).append('\n'.join(t for _, t in textos))
        descarregar()
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
