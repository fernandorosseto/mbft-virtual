"""Coleta no DOU as resoluções do CONTRAN a partir do nº 700 e extrai ementa e revogações."""
import json, os, re, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dou

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
SAIDA = os.path.join(REPO, 'docs', 'normas', 'contran-indice.json')
dados = json.load(open(SAIDA)) if os.path.exists(SAIDA) else {}

def fmt(n):
    return f'{n // 1000}.{n % 1000:03d}' if n >= 1000 else str(n)

def achar(n):
    """Todas as publicações da resolução nº n do CONTRAN (original, republicações, retificações)."""
    f = fmt(n)
    titulo = re.compile(r'^\s*RESOLU[ÇC][ÃA]O\s+(CONTRAN\s+)?N[º°o]\.?\s*' + re.escape(f) + r'\s*[,-]', re.I)
    achadas = {}
    # 'todos' inclui as edições extras do DOU (ex.: Res. 989/2022 saiu na Seção 1 - Extra B)
    for secao in ('do1', 'todos'):
        for q in (f'"Resolução Contran nº {f}"', f'"Resolução nº {f}"'):
            # 75 resultados: o mesmo número existe em resoluções de outros órgãos, que vêm antes
            for a in dou.buscar(q, secao=secao, de='01-01-2016', ate='12-11-2026', delta=75):
                if 'Conselho Nacional de Trânsito' in a.get('hierarchyStr', '') and titulo.search(a['title']):
                    achadas[a['urlTitle']] = a
    return list(achadas.values())

MESES = 'janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro'
REF = re.compile(r'n[º°o]\.?\s*([\d.]+)\s*,\s*de\s*(\d{1,2})[º°o]?\s*de\s*(' + MESES + r')\s*de\s*(\d{4})', re.I)

def revogacoes(texto):
    """Lista (numero, ano, parcial, trecho) citados em artigos de revogação."""
    achados = []
    # Artigos de revogação: do 'Fica(m) revogad' até o próximo 'Art.'
    for m in re.finditer(r'(Fica[m]?\s+revogad[ao]s?.*?)(?=\nArt\.|\Z)', texto, re.S | re.I):
        trecho = m.group(1)
        for r in REF.finditer(trecho):
            antes = trecho[max(0, r.start() - 60):r.start()].lower()
            parcial = bool(re.search(r'(\bart\.|\barts\.|\bincisos?\b|§|\bpar[áa]grafo|\banexos?\b|\bal[íi]neas?\b)[^;:]*$', antes))
            achados.append({'numero': int(r.group(1).replace('.', '')), 'ano': int(r.group(4)), 'parcial': parcial,
                            'trecho': re.sub(r'\s+', ' ', trecho[max(0, r.start() - 80):r.end() + 5])})
    return achados

def processar(n):
    pubs = achar(n)
    if not pubs:
        return n, None
    textos = [(p, dou.texto(p['urlTitle'])) for p in pubs]
    # A publicação mais longa é o ato completo; republicações costumam trazer só um anexo
    principal, t = max(textos, key=lambda x: len(x[1]))
    linhas = [l.strip() for l in t.split('\n') if l.strip()]
    ementa = next((l for l in linhas[1:6] if not l.upper().startswith('O CONSELHO') and not l.startswith('(') and len(l) > 20), '')
    revoga, vistos = [], set()
    for _, tx in textos:
        for r in revogacoes(tx):
            if (r['numero'], r['ano'], r['parcial']) not in vistos:
                vistos.add((r['numero'], r['ano'], r['parcial']))
                revoga.append(r)
    return n, {'titulo': principal['title'], 'data': principal['pubDate'],
               'url': 'https://www.in.gov.br/web/dou/-/' + principal['urlTitle'], 'ementa': ementa, 'revoga': revoga,
               'publicacoes': [{'data': p['pubDate'], 'edicao': p['pubName'], 'url': 'https://www.in.gov.br/web/dou/-/' + p['urlTitle']} for p in pubs]}

from concurrent.futures import ThreadPoolExecutor
inicio_n = int(sys.argv[1]) if len(sys.argv) > 1 else 700
fim = int(sys.argv[2]) if len(sys.argv) > 2 else 1200
inicio = time.time()
lote = 24
n = inicio_n
with ThreadPoolExecutor(max_workers=6) as pool:
    while n <= fim:
        numeros = [k for k in range(n, min(n + lote, fim + 1)) if dados.get(str(k)) is None]
        for k, v in pool.map(processar, numeros):
            dados[str(k)] = v
        json.dump(dados, open(SAIDA, 'w'), ensure_ascii=False, indent=1)
        n += lote
        achados = sum(1 for v in dados.values() if v)
        print(f'{n - 1}: {achados} resoluções, {time.time() - inicio:.0f}s', flush=True)
        # Fim da numeração: um lote inteiro sem nenhuma resolução depois do nº 1000
        if n > 1000 and all(dados.get(str(k)) is None for k in range(n - lote, n)):
            break
print('fim', n - 1, sum(1 for v in dados.values() if v), flush=True)
