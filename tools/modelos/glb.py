import json, struct
import numpy as np
TIPOS={5120:np.int8,5121:np.uint8,5122:np.int16,5123:np.uint16,5125:np.uint32,5126:np.float32}
NCOMP={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def ler(caminho):
    b=open(caminho,'rb').read()
    l=struct.unpack('<I',b[12:16])[0]
    j=json.loads(b[20:20+l])
    off=20+l
    lb=struct.unpack('<I',b[off:off+4])[0]
    binario=bytearray(b[off+8:off+8+lb])
    return j,binario
def acessor(j,binario,i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]
    tipo=TIPOS[a['componentType']]; n=NCOMP[a['type']]
    ini=bv.get('byteOffset',0)+a.get('byteOffset',0)
    stride=bv.get('byteStride',0)
    item=np.dtype(tipo).itemsize*n
    if stride and stride!=item:
        arr=np.frombuffer(bytes(binario),dtype=np.uint8,count=a['count']*stride,offset=ini).reshape(-1,stride)[:,:item]
        return np.frombuffer(arr.tobytes(),dtype=tipo).reshape(-1,n) if n>1 else np.frombuffer(arr.tobytes(),dtype=tipo)
    v=np.frombuffer(bytes(binario),dtype=tipo,count=a['count']*n,offset=ini)
    return v.reshape(-1,n) if n>1 else v
