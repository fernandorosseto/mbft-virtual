"""Remove as letras 'DAF' e 'XF' (malha cromada) do modelo e grava um GLB sem a marca."""
import sys, json, struct, numpy as np
sys.path.insert(0, sys.argv[1])
from glb import ler, acessor
j, b = ler(sys.argv[2])
saida = sys.argv[3]
mi = next(i for i, m in enumerate(j['meshes']) if m['name'] == 'Plane_chrome_0')
p = j['meshes'][mi]['primitives'][0]
pos = acessor(j, b, p['attributes']['POSITION'])
ia = j['accessors'][p['indices']]
idx = acessor(j, b, p['indices']).reshape(-1, 3).copy()
chave = {}; rep = np.array([chave.setdefault(tuple(np.round(v, 4)), len(chave)) for v in pos])
pai = list(range(len(chave)))
def f(x):
    while pai[x] != x:
        pai[x] = pai[pai[x]]; x = pai[x]
    return x
for t in idx:
    a, b2, c = rep[t]; ra = f(a); pai[f(b2)] = ra; pai[f(c)] = ra
comp = {}
for ti, t in enumerate(idx): comp.setdefault(f(rep[t[0]]), []).append(ti)
removidos = 0; letras = 0
for v in comp.values():
    mn = pos[idx[v].ravel()].min(0); mx = pos[idx[v].ravel()].max(0)
    na_porta = mn[0] < -0.39 or mx[0] > 0.39
    na_porta = na_porta and abs(mx[0] - mn[0]) < 0.01 and 0.47 < mn[2] and mx[2] < 0.5
    na_grade = mx[1] < -0.69 and 0.53 < mn[2] and mx[2] < 0.57
    if len(v) < 100 and (na_porta or na_grade):
        letras += 1
        for ti in v:
            idx[ti] = idx[ti][0]  # triângulo degenerado: não desenha nada
            removidos += 1
print('letras removidas:', letras, 'triângulos:', removidos)
assert letras == 11, 'esperava 11 letras (DAF x3, XF)'
# grava os índices de volta no buffer
bv = j['bufferViews'][ia['bufferView']]
ini = bv.get('byteOffset', 0) + ia.get('byteOffset', 0)
tipo = {5123: np.uint16, 5125: np.uint32}[ia['componentType']]
dados = idx.astype(tipo).tobytes()
b[ini:ini + len(dados)] = dados
# metadados: título novo, crédito original preservado
ex = j['asset'].setdefault('extras', {})
ex['title'] = 'Cavalo mecânico (adaptado de "low poly DAF xf105", sem marca)'
ex['adaptacao'] = 'CTB Virtual: letras DAF/XF removidas'
js = json.dumps(j, separators=(',', ':')).encode()
js += b' ' * ((4 - len(js) % 4) % 4)
bn = bytes(b) + b'\0' * ((4 - len(b) % 4) % 4)
total = 12 + 8 + len(js) + 8 + len(bn)
with open(saida, 'wb') as o:
    o.write(struct.pack('<III', 0x46546C67, 2, total))
    o.write(struct.pack('<I', len(js)) + b'JSON' + js)
    o.write(struct.pack('<I', len(bn)) + b'BIN\0' + bn)
print('gravado', saida, total, 'bytes')
