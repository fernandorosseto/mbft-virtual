# Modelos 3D: preparação

## Caminhão (`public/models/caminhao.glb`)

- **Origem:** "FORD CARGO MAX TRUCK 2428e - RICK MODDING", de Rick_modding
  (https://sketchfab.com/Rick_modding_, https://skfb.ly/pCvqD), licença Creative Commons
  Attribution 4.0 (http://creativecommons.org/licenses/by/4.0/). Baixado do Sketchfab (glTF) em
  14/11/2026. Caminhão de carga 6x2 com carroceria de madeira (graneleiro).
- **Adaptação (CTB Virtual), por `preparar_caminhao.mjs`:**
  - removidas as inscrições "CARGO", "MAX TRUCK" e "2428e" e o oval da grade (malhas
    `Model4.51` e `Model4.102`) e a antena (`Volvo.008`, um fio de 2,5 m);
  - cabine repintada de preto para branco; carroceria com material de madeira (no original ela
    usava o material transparente dos vidros); vidros, espelhos e lentes com materiais próprios;
    faróis redondos do para-choque com lente clara e lanternas acima da grade em âmbar (no
    original, um cromado que saía preto); faixas refletivas do para-choque traseiro em branco;
  - malha simplificada de ~950 mil para ~250 mil triângulos (a cabine fica inteira: simplificada,
    ela abria buracos na grade), normais recalculadas com vincos e compressão meshopt (~1,7 MB).
  - peças acrescentadas: placas Mercosul ilustrativas na frente e atrás (imagem
    `placa-mercosul.png`, gerada por `gerar_placa.mjs` com o desenho de
    `src/lib/placaMercosul.ts`), painel escuro na abertura de baixo do para-choque e tampa lisa
    sobre o rebaixo oval da grade;
  - pronto para o site: frente para +X, centrado, rodas no chão, vidros divididos em
    `parabrisa`, `vidros-dianteiros` e `vidros-cabine` (antes o site fazia isso a cada carga).
- **Por que remover a marca:** o projeto não usa modelos de veículos de marca (CLAUDE.md). A
  exceção, sem as inscrições, está registrada no `PLANO.md`.
- **Crédito obrigatório no site** (CC BY 4.0): título original, autor com link, licença com link e
  a indicação "adaptado" (fontes do painel e rodapé do menu).

Para refazer a partir do original (não versionado, porque tem a marca):

```bash
mkdir /tmp/prep && cd /tmp/prep && npm init -y
npm i @gltf-transform/core@4.1.1 @gltf-transform/functions@4.1.1 @gltf-transform/extensions@4.1.1 meshoptimizer@0.22.0 three@0.169.0
node <repo>/tools/modelos/gerar_placa.mjs          # só se mudar o desenho ou o texto da placa
cp <repo>/tools/modelos/preparar_caminhao.mjs . && node preparar_caminhao.mjs caminho/scene.gltf <repo>/public/models/caminhao.glb <repo>/tools/modelos/placa-mercosul.png
```

## Sedã (`public/models/carro.glb`)

O arquivo já vem pronto para o site (os dois scripts não fazem nada se rodados de novo):

```bash
python3 -I tools/modelos/repintar_carro.py public/models/carro.glb   # amarelo → prata
python3 -I tools/modelos/preparar_carro.py public/models/carro.glb   # vidros divididos e teto solar
```

## Cavalo mecânico (`public/models/cavalo-mecanico.glb`), guardado sem uso

Desde 14/11/2026 o site mostra o caminhão acima. O cavalo continua no repositório
(`three/caminhaoTrator.ts`, veículo `'caminhao-trator'`) para uso futuro.

- **Origem:** "low poly DAF xf105", de Alvin.Woodly (https://skfb.ly/oEIBZ), licença Creative
  Commons Attribution 4.0 (http://creativecommons.org/licenses/by/4.0/). Baixado do Sketchfab em
  14/11/2026.
- **Adaptação (CTB Virtual):** as letras "DAF" e "XF" (grade e portas, 11 peças da malha
  cromada) foram removidas por `remover_marca_cavalo.py`. Os triângulos delas viram triângulos
  degenerados, e o resto do modelo fica igual. O título nos metadados do GLB foi trocado; autor,
  licença e link originais foram mantidos.
- **Por que remover a marca:** o projeto não usa modelos de veículos de marca (CLAUDE.md). A
  exceção para este modelo, sem as inscrições, está registrada no `PLANO.md`.
- **Crédito obrigatório no site** (CC BY 4.0), quando o caminhão for exibido: título original,
  autor com link, licença com link e a indicação "adaptado".

Para refazer a partir do arquivo original (não versionado, porque tem a marca):

```bash
python3 -I tools/modelos/remover_marca_cavalo.py tools/modelos caminho/low_poly_daf_xf105.glb public/models/cavalo-mecanico.glb
```

Estrutura útil para as zonas: 23 materiais separados, entre eles `windshield` (para-brisa),
`headlights`, `high_beams`, `front_indicator`, `brake_lights`, `reverse_light`,
`tail_light_orange`, `taillight_glass_red`, `top_orange_lights`, `chassis` e as rodas
(`Circle.004`, `Circle.006`). Cerca de 26 mil triângulos, sem texturas. Eixos do arquivo: Y para
cima, frente para +Z (o sedã usa frente para +X); escala em metros.
