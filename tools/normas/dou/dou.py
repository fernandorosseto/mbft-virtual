"""Busca e download de atos no DOU (in.gov.br), com cache em disco."""
import hashlib, html, json, os, re, subprocess, time, urllib.parse

AQUI = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(AQUI, '.cache')  # fora do git
os.makedirs(CACHE, exist_ok=True)

def _get(url, timeout=60):
    chave = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest() + '.html')
    if os.path.exists(chave):
        return open(chave, encoding='utf-8', errors='replace').read()
    for tentativa in range(3):
        r = subprocess.run(['curl', '-sS', '-m', str(timeout), '-A', 'Mozilla/5.0', url], capture_output=True)
        if r.returncode == 0 and r.stdout:
            txt = r.stdout.decode('utf-8', errors='replace')
            open(chave, 'w', encoding='utf-8').write(txt)
            return txt
        time.sleep(2 * (tentativa + 1))
    raise RuntimeError(f'falha ao baixar {url}: {r.stderr.decode()[:200]}')

def buscar(q, secao='do1', de='01-01-2019', ate='12-11-2026', delta=20):
    params = {'q': q, 's': secao, 'exactDate': 'personalizado', 'sortType': '0', 'publishFrom': de, 'publishTo': ate, 'delta': delta}
    url = 'https://www.in.gov.br/consulta/-/buscar/dou?' + urllib.parse.urlencode(params)
    s = _get(url)
    m = re.search(r'BuscaDouPortlet_params" type="application/json">(.*?)</script>', s, re.S)
    if not m:
        return []
    arr = json.loads(m.group(1)).get('jsonArray', [])
    for a in arr:
        a['title'] = re.sub(r'<[^>]+>', '', a.get('title', ''))
    return arr

def texto(url_title):
    s = _get('https://www.in.gov.br/web/dou/-/' + url_title, timeout=90)
    m = re.search(r'<div class="texto-dou">(.*?)</div>\s*</div>', s, re.S)
    t = m.group(1) if m else s
    t = re.sub(r'<br\s*/?>|</p>', '\n', t)
    t = re.sub(r'<[^>]+>', '', t)
    t = html.unescape(t)
    t = re.sub(r'[ \t\xa0]+', ' ', t)
    return re.sub(r'\n\s*\n+', '\n', t).strip()
