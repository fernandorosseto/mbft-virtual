"""
Repinta a carroceria do sedã (public/models/carro.glb) direto no arquivo: a textura original é
amarela, parecida com o destaque dos vidros. Antes isso era feito no navegador a cada carregamento
(`repintarCarroceria`, ~700 ms de página travada); agora a textura já vem pintada.

Mesma regra de antes: só os pixels de pintura (matiz amarela, saturados, não muito escuros) mudam
para a cor COR_PINTURA, mantendo o sombreado relativo. A imagem fica marcada
(`extras.repintado`), e rodar de novo não faz nada.

Uso:  python3 -I tools/modelos/repintar_carro.py public/models/carro.glb [saida.glb]
"""
import io
import json
import struct
import sys

import numpy as np
from PIL import Image

COR_PINTURA = '#c3cad3'
MATERIAL = 'Body_5'


def srgb_para_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def ler_glb(caminho):
    b = open(caminho, 'rb').read()
    tam_json = struct.unpack('<I', b[12:16])[0]
    j = json.loads(b[20:20 + tam_json])
    ini = 20 + tam_json
    tam_bin = struct.unpack('<I', b[ini:ini + 4])[0]
    return j, bytearray(b[ini + 8:ini + 8 + tam_bin])


def gravar_glb(caminho, j, binario):
    dados_json = json.dumps(j, separators=(',', ':')).encode()
    dados_json += b' ' * ((4 - len(dados_json) % 4) % 4)
    binario = bytes(binario) + b'\0' * ((4 - len(binario) % 4) % 4)
    total = 12 + 8 + len(dados_json) + 8 + len(binario)
    with open(caminho, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, total))
        f.write(struct.pack('<II', len(dados_json), 0x4E4F534A) + dados_json)
        f.write(struct.pack('<II', len(binario), 0x004E4942) + binario)


def repintar(img):
    px = np.asarray(img.convert('RGB')).astype(np.float64) / 255
    r, g, b = px[..., 0], px[..., 1], px[..., 2]
    mx, mn = px.max(-1), px.min(-1)
    l = (mx + mn) / 2
    d = mx - mn
    s = np.where(d == 0, 0, np.where(l <= 0.5, d / np.maximum(mx + mn, 1e-9), d / np.maximum(2 - mx - mn, 1e-9)))
    dd = np.maximum(d, 1e-9)
    h = np.where(mx == r, (g - b) / dd + np.where(g < b, 6, 0), np.where(mx == g, (b - r) / dd + 2, (r - g) / dd + 4)) / 6
    h = np.where(d == 0, 0, h)
    pintura = (h > 0.08) & (h < 0.22) & (s > 0.2) & (l > 0.03)
    if not pintura.any():
        return None
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    referencia = lum[pintura].mean()
    fator = np.minimum(1.25, 0.5 + 0.5 * (lum / referencia))
    # Mesmo resultado de antes: a cor é convertida para linear (THREE.Color) e escrita na textura
    alvo = [srgb_para_linear(int(COR_PINTURA[i:i + 2], 16) / 255) for i in (1, 3, 5)]
    saida = np.asarray(img.convert('RGB')).astype(np.float64)
    for k in range(3):
        saida[..., k] = np.where(pintura, np.minimum(255, alvo[k] * 255 * fator), saida[..., k])
    # O canvas do navegador trunca ao gravar (Uint8ClampedArray arredonda): arredonda
    return Image.fromarray(np.clip(np.round(saida), 0, 255).astype(np.uint8))


def main():
    entrada = sys.argv[1]
    saida = sys.argv[2] if len(sys.argv) > 2 else entrada
    j, binario = ler_glb(entrada)
    mat = next(m for m in j['materials'] if m['name'] == MATERIAL)
    textura = j['textures'][mat['pbrMetallicRoughness']['baseColorTexture']['index']]
    imagem = j['images'][textura['source']]
    if imagem.get('extras', {}).get('repintado'):
        print('nada a fazer: a textura já foi repintada')
        return
    bv_alvo = imagem['bufferView']
    bv = j['bufferViews'][bv_alvo]
    original = Image.open(io.BytesIO(bytes(binario[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']])))
    nova = repintar(original)
    if nova is None:
        print('nada a repintar (já está pintada)')
        return
    buf = io.BytesIO()
    nova.save(buf, 'JPEG', quality=90)
    imagem['mimeType'] = 'image/jpeg'
    imagem['extras'] = {**imagem.get('extras', {}), 'repintado': COR_PINTURA}
    # Remonta o buffer com a nova imagem no lugar da antiga (alinhamento de 4 bytes)
    novo = bytearray()
    for i, v in enumerate(j['bufferViews']):
        dados = buf.getvalue() if i == bv_alvo else bytes(binario[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']])
        novo += b'\0' * ((4 - len(novo) % 4) % 4)
        v['byteOffset'] = len(novo)
        v['byteLength'] = len(dados)
        novo += dados
    j['buffers'][0]['byteLength'] = len(novo)
    gravar_glb(saida, j, novo)
    print(f'repintado: {MATERIAL} ({nova.size[0]}x{nova.size[1]}), {len(novo)} bytes')


if __name__ == '__main__':
    main()
