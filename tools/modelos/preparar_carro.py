"""
Deixa o sedã (public/models/carro.glb) pronto para o site, sem montagem no navegador:

1. Divide o nó `vidros` em `vidros-dianteiros` (à frente da coluna B, centro do triângulo em
   X > −0,32), `vigia` (atrás dela, normal predominante em X) e `vidros-traseiros` (normal
   predominante em Z). As três malhas compartilham os vértices do original.
2. Cria o teto solar (`teto`), que o modelo não tem: mede o teto com raios verticais, acha a parte
   plana (até 8 cm abaixo do ponto mais alto) e monta um painel de 12 × 8 quadrados que acompanha a
   curvatura, 6 mm acima da pintura, na metade dianteira da parte plana (42% do comprimento, 60%
   da largura). O ponto do marcador vai em `extras.ancora`.

São as mesmas regras de antes em `three/carro.ts` (dividirVidros e criarTetoSolar), que rodavam a
cada carregamento. Rodar de novo não faz nada (o nó `vidros` não existe mais).

Uso:  python3 -I tools/modelos/preparar_carro.py public/models/carro.glb [saida.glb]
"""
import json
import struct
import sys

import numpy as np

COLUNA_B_X = -0.32
TIPOS = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NCOMP = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}


def ler_glb(caminho):
    b = open(caminho, 'rb').read()
    tam_json = struct.unpack('<I', b[12:16])[0]
    j = json.loads(b[20:20 + tam_json])
    ini = 20 + tam_json
    tam_bin = struct.unpack('<I', b[ini:ini + 4])[0]
    return j, bytearray(b[ini + 8:ini + 8 + tam_bin])


def gravar_glb(caminho, j, binario):
    dados_json = json.dumps(j, separators=(',', ':'), ensure_ascii=False).encode()
    dados_json += b' ' * ((4 - len(dados_json) % 4) % 4)
    binario = bytes(binario) + b'\0' * ((4 - len(binario) % 4) % 4)
    total = 12 + 8 + len(dados_json) + 8 + len(binario)
    with open(caminho, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, total))
        f.write(struct.pack('<II', len(dados_json), 0x4E4F534A) + dados_json)
        f.write(struct.pack('<II', len(binario), 0x004E4942) + binario)


def acessor(j, binario, i):
    a = j['accessors'][i]
    bv = j['bufferViews'][a['bufferView']]
    tipo = TIPOS[a['componentType']]
    n = NCOMP[a['type']]
    ini = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    v = np.frombuffer(bytes(binario), dtype=tipo, count=a['count'] * n, offset=ini)
    return v.reshape(-1, n) if n > 1 else v


def acrescentar(j, binario, dados, tipo, alvo=None):
    """Acrescenta um acessor (float32 VEC3 ou índices uint32) ao buffer e devolve o índice."""
    binario += b'\0' * ((4 - len(binario) % 4) % 4)
    if tipo == 'VEC3':
        arr = np.asarray(dados, dtype=np.float32).reshape(-1, 3)
        comp, ctype = 5126, 'VEC3'
    else:
        arr = np.asarray(dados, dtype=np.uint32).reshape(-1)
        comp, ctype = 5125, 'SCALAR'
    bv = {'buffer': 0, 'byteOffset': len(binario), 'byteLength': arr.nbytes}
    if alvo:
        bv['target'] = alvo
    binario += arr.tobytes()
    j['bufferViews'].append(bv)
    a = {'bufferView': len(j['bufferViews']) - 1, 'componentType': comp, 'count': len(arr), 'type': ctype}
    if ctype == 'VEC3':
        a['min'] = arr.min(0).tolist()
        a['max'] = arr.max(0).tolist()
    j['accessors'].append(a)
    return len(j['accessors']) - 1


def dividir_vidros(pos, normal, indices):
    tri = indices.reshape(-1, 3)
    cx = pos[tri, 0].mean(1)
    soma_n = normal[tri].sum(1)
    dianteiros = cx > COLUNA_B_X
    vigia = ~dianteiros & (np.abs(soma_n[:, 0]) > np.abs(soma_n[:, 2]))
    traseiros = ~dianteiros & ~vigia
    return {'vidros-dianteiros': tri[dianteiros], 'vidros-traseiros': tri[traseiros], 'vigia': tri[vigia]}


def criar_teto(pos, indices):
    tri = pos[indices.reshape(-1, 3)]
    a, b, c = tri[:, 0], tri[:, 1], tri[:, 2]
    n = np.cross(b - a, c - a)
    # Raio de cima para baixo: o three ignora triângulos de costas (material de um lado só)
    frente = n[:, 1] > 0
    a, b, c = a[frente], b[frente], c[frente]
    minimo, maximo = pos.min(0), pos.max(0)

    def altura(x, z):
        # Triângulos que contêm (x, z) na projeção de cima; o primeiro atingido é o mais alto
        v0 = c[:, [0, 2]] - a[:, [0, 2]]
        v1 = b[:, [0, 2]] - a[:, [0, 2]]
        v2 = np.array([x, z]) - a[:, [0, 2]]
        d00 = (v0 * v0).sum(1); d01 = (v0 * v1).sum(1); d11 = (v1 * v1).sum(1)
        d02 = (v0 * v2).sum(1); d12 = (v1 * v2).sum(1)
        den = d00 * d11 - d01 * d01
        ok = np.abs(den) > 1e-12
        den = np.where(ok, den, 1)
        u = (d11 * d02 - d01 * d12) / den
        v = (d00 * d12 - d01 * d02) / den
        dentro = ok & (u >= -1e-9) & (v >= -1e-9) & (u + v <= 1 + 1e-9)
        if not dentro.any():
            return None
        y = a[:, 1] + u * (c[:, 1] - a[:, 1]) + v * (b[:, 1] - a[:, 1])
        return float(y[dentro].max())

    LIMIAR, AMOSTRAS = 0.08, 80
    piso = maximo[1] - LIMIAR
    xs = [minimo[0] + (maximo[0] - minimo[0]) * i / AMOSTRAS for i in range(AMOSTRAS + 1)]
    xs_teto = [x for x in xs if (y := altura(x, 0)) is not None and y >= piso]
    if len(xs_teto) < 4:
        return None
    x0, x1 = min(xs_teto), max(xs_teto)
    x_meio = (x0 + x1) / 2
    meia_largura = 0
    for i in range(AMOSTRAS + 1):
        z = maximo[2] * i / AMOSTRAS
        y = altura(x_meio, z)
        if y is not None and y >= piso:
            meia_largura = z
    if meia_largura <= 0:
        return None

    comprimento = (x1 - x0) * 0.42
    centro_x = x0 + (x1 - x0) * 0.58
    largura = meia_largura * 2 * 0.6
    NX, NZ, FOLGA = 12, 8, 0.006
    posicoes = []
    for i in range(NX + 1):
        for k in range(NZ + 1):
            x = centro_x - comprimento / 2 + comprimento * i / NX
            z = -largura / 2 + largura * k / NZ
            y = altura(x, z)
            posicoes.append([x, (y if y is not None else maximo[1]) + FOLGA, z])
    posicoes = np.array(posicoes)
    ind = []
    for i in range(NX):
        for k in range(NZ):
            p = i * (NZ + 1) + k
            q = p + NZ + 1
            ind += [p, p + 1, q, q, p + 1, q + 1]
    ind = np.array(ind)
    # Normais suaves (média das faces, como computeVertexNormals)
    t = posicoes[ind.reshape(-1, 3)]
    fn = np.cross(t[:, 1] - t[:, 0], t[:, 2] - t[:, 0])
    normais = np.zeros_like(posicoes)
    for kk in range(3):
        np.add.at(normais, ind.reshape(-1, 3)[:, kk], fn)
    normais /= np.linalg.norm(normais, axis=1, keepdims=True)
    centro = posicoes[(NX // 2) * (NZ + 1) + NZ // 2]
    return posicoes, normais, ind, centro


def main():
    entrada = sys.argv[1]
    saida = sys.argv[2] if len(sys.argv) > 2 else entrada
    j, binario = ler_glb(entrada)
    nos = {n['name']: i for i, n in enumerate(j['nodes'])}
    if 'vidros' not in nos:
        print('nada a fazer: o carro já está preparado')
        return
    cena = j['scenes'][j.get('scene', 0)]

    # 1. Vidros
    no_vidros = j['nodes'][nos['vidros']]
    prim = j['meshes'][no_vidros['mesh']]['primitives'][0]
    pos = acessor(j, binario, prim['attributes']['POSITION']).astype(np.float64)
    normal = acessor(j, binario, prim['attributes']['NORMAL']).astype(np.float64)
    indices = acessor(j, binario, prim['indices']).astype(np.int64)
    partes = dividir_vidros(pos, normal, indices)
    primeiro = True
    for nome, tri in partes.items():
        ia = acrescentar(j, binario, tri, 'SCALAR', 34963)
        j['meshes'].append({'name': nome, 'primitives': [{**prim, 'indices': ia}]})
        transform = {k: v for k, v in no_vidros.items() if k in ('translation', 'rotation', 'scale', 'matrix')}
        if primeiro:
            no_vidros.clear()
            no_vidros.update({'name': nome, 'mesh': len(j['meshes']) - 1, **transform})
            primeiro = False
        else:
            j['nodes'].append({'name': nome, 'mesh': len(j['meshes']) - 1, **transform})
            cena['nodes'].append(len(j['nodes']) - 1)
        print(f'{nome}: {len(tri)} triângulos')

    # 2. Teto solar (coordenadas do modelo; os nós não têm transformação)
    carroceria = j['nodes'][nos['carroceria']]
    assert not any(k in carroceria for k in ('translation', 'rotation', 'scale', 'matrix'))
    pc = j['meshes'][carroceria['mesh']]['primitives'][0]
    teto = criar_teto(acessor(j, binario, pc['attributes']['POSITION']).astype(np.float64),
                      acessor(j, binario, pc['indices']).astype(np.int64))
    if teto:
        posicoes, normais, ind, centro = teto
        ap = acrescentar(j, binario, posicoes, 'VEC3', 34962)
        an = acrescentar(j, binario, normais, 'VEC3', 34962)
        ai = acrescentar(j, binario, ind, 'SCALAR', 34963)
        j['meshes'].append({'name': 'teto', 'primitives': [{'attributes': {'POSITION': ap, 'NORMAL': an}, 'indices': ai, 'material': prim['material']}]})
        j['nodes'].append({'name': 'teto', 'mesh': len(j['meshes']) - 1, 'extras': {'ancora': [round(float(v), 5) for v in centro]}})
        cena['nodes'].append(len(j['nodes']) - 1)
        print('teto solar: centro', np.round(centro, 3).tolist())
    j['buffers'][0]['byteLength'] = len(binario)
    gravar_glb(saida, j, binario)


if __name__ == '__main__':
    main()
