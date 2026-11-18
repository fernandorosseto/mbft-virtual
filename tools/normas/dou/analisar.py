"""Cruza as resoluções dos editais PRF 2018 e 2021 com as revogações coletadas no DOU.

Gera .cache/mapa.json (insumo de docs/editais/mapeamento-resolucoes.md)."""
import json, os, re, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(AQUI, '..', '..', '..'))

def lista(caminho, marcador):
    t = open(caminho, encoding='utf-8').read()
    linha = [l for l in t.split('\n') if l.startswith('LEGISLAÇÃO DE TRÂNSITO:')][0]
    parte = linha.split(marcador, 1)[1]
    itens = []
    for m in re.finditer(r'(\d{1,3})/(\d{4})\s*(\([^)]*\)|,\s*(exceto[^;.]*|Anexo I))?', parte):
        obs = (m.group(3) or '').strip(' ,()')
        itens.append((int(m.group(1)), int(m.group(2)), obs))
    return itens

e2018 = lista(f'{REPO}/docs/editais/prf-2018/edital-1-2018.txt', '(CONTRAN) e suas alterações:')
e2021 = lista(f'{REPO}/docs/editais/prf-2021/edital-1-2021.txt', '(CONTRAN) e suas alterações:')
d = json.load(open(os.path.join(REPO, 'docs', 'normas', 'contran-indice.json')))
res = {int(k): v for k, v in d.items() if v}

# quem revoga cada (numero, ano)
revogadores = {}
for n, v in res.items():
    ano_n = int(v['data'][-4:])
    for r in v['revoga']:
        # Chave só pelo número: a numeração do CONTRAN é contínua (o ano fica no registro, para conferência)
        revogadores.setdefault(r['numero'], []).append({'por': n, 'ano_citado': r['ano'], 'parcial': r['parcial'], 'trecho': r['trecho']})

def ano_publicacao(n):
    v = res.get(n)
    return int(re.search(r'DE (\d{4})', v['titulo'].upper()).group(1)) if v and re.search(r'DE (\d{4})', v['titulo'].upper()) else None

def destino(n, ano, profundidade=0):
    """Segue a cadeia: retorna lista de (resolução vigente que substitui, caminho)."""
    # O ano tem de bater: Deliberações e Portarias do CONTRAN reaproveitam os mesmos números
    anos_validos = anos.get(n, {ano}) if profundidade == 0 else {ano}
    revs = [r for r in revogadores.get(n, []) if not r['parcial'] and r['por'] != n and r['ano_citado'] in anos_validos]
    if not revs or profundidade > 5:
        return None
    r = revs[0]
    por = r['por']
    ano_por = ano_publicacao(por)
    seguinte = destino(por, ano_por, profundidade + 1) if ano_por else None
    return {'por': por, 'titulo': res[por]['titulo'], 'data': res[por]['data'], 'ementa': res[por]['ementa'],
            'url': res[por]['url'], 'ano_citado': r['ano_citado'], 'depois': seguinte}

# Um item por número (os editais divergem no ano de algumas: 92/1999 x 92/1998, 210/2006 x 210/2011)
anos = {}
for n, a, _ in e2018 + e2021:
    anos.setdefault(n, set()).add(a)
todos = sorted((n, min(anos[n])) for n in anos)
saida = []
for n, a in todos:
    obs18 = next((o for x, y, o in e2018 if x == n), None)
    obs21 = next((o for x, y, o in e2021 if x == n), None)
    saida.append({'numero': n, 'ano': a, 'anos_nos_editais': sorted(anos[n]), 'em2018': obs18 is not None, 'em2021': obs21 is not None,
                  'obs2018': obs18, 'obs2021': obs21, 'destino': destino(n, a),
                  'parciais': [x for x in revogadores.get(n, []) if x['parcial'] and x['ano_citado'] in anos[n]]})
json.dump(saida, open(os.path.join(AQUI, '.cache', 'mapa.json'), 'w'), ensure_ascii=False, indent=1)
print('2018:', len(e2018), '2021:', len(e2021), 'união:', len(todos))
print('resoluções coletadas:', len(res))
sem = [f"{s['numero']}/{s['ano']}" for s in saida if not s['destino']]
print('com revogação total encontrada:', len(saida) - len(sem), '| sem:', len(sem), sem)
