import bpy, bmesh, math, mathutils
bpy.ops.wm.open_mainfile(filepath='/tmp/claude-0/sedan/pack_sedan.blend')
for o in list(bpy.data.objects):
    if o.type!='MESH': bpy.data.objects.remove(o)
meshes=[o for o in bpy.data.objects]
# aplica transformações no mundo e desfaz hierarquia
for o in meshes:
    mw=o.matrix_world.copy(); o.parent=None; o.matrix_world=mw
bpy.ops.object.select_all(action='SELECT'); bpy.context.view_layer.objects.active=meshes[0]
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
# centraliza e gira: frente (+y) -> +x
R=mathutils.Matrix.Translation((0,0,0)) @ mathutils.Matrix.Rotation(-math.pi/2,4,'Z') @ mathutils.Matrix.Translation((0,6.69,0))
for o in meshes: o.data.transform(R)
names={'Sedan Body_Body_0':'carroceria','Sedan Body_Glass_0':'vidros','Sedan Body_Optics_0':'oticas'}
for o in meshes:
    o.name=names.get(o.name, 'roda'); o.data.name=o.name
# separa o para-brisa
g=bpy.data.objects['vidros']
bm=bmesh.new(); bm.from_mesh(g.data); bm.faces.ensure_lookup_table()
ws=[f for f in bm.faces if f.normal.x>0.25 and f.normal.z>0.55 and f.calc_center_median().x>0]
print('PARABRISA faces', len(ws), 'de', len(bm.faces))
for f in bm.faces: f.select = f in ws
bm.to_mesh(g.data); bm.free()
bpy.ops.object.select_all(action='DESELECT'); g.select_set(True); bpy.context.view_layer.objects.active=g
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.separate(type='SELECTED'); bpy.ops.object.mode_set(mode='OBJECT')
for o in bpy.data.objects:
    if o.name.startswith('vidros.'): o.name='parabrisa'; o.data.name='parabrisa'
# reduz texturas
for im in bpy.data.images:
    if im.size[0]>512: im.scale(512, int(512*im.size[1]/im.size[0]))
    print('IMG', im.name, tuple(im.size))
for o in bpy.data.objects: print('OBJ', o.name, len(o.data.polygons), tuple(round(v,2) for v in o.dimensions))
bpy.ops.export_scene.gltf(filepath='/tmp/claude-0/sedan/sedan-cc.glb', export_format='GLB', export_image_format='JPEG', export_jpeg_quality=80)
