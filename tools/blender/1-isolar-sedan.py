import bpy, mathutils, math
from collections import defaultdict
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath='/root/.claude/uploads/f8114670-44b2-5284-9aba-83e5afa35e72/994e71ba-generic_passenger_car_pack.glb')
keep={'Sedan Body_Body_0','Sedan Body_Glass_0','Sedan Body_Optics_0','Wheel_A_Wheel_0','Wheel_A001_Wheel_0','Wheel_A002_Wheel_0','Wheel_A003_Wheel_0'}
for o in list(bpy.data.objects):
    if o.type=='MESH' and o.name not in keep: bpy.data.objects.remove(o)
g=bpy.data.objects['Sedan Body_Glass_0']; mw=g.matrix_world
cl=defaultdict(float)
for p in g.data.polygons:
    n=(mw.to_3x3()@p.normal).normalized(); c=mw@p.center
    cl[(round(n.x,1),round(n.y,1),round(n.z,1), 'yfront' if c.y>-6.7 else 'yback')]+=p.area
for k,v in sorted(cl.items(),key=lambda kv:-kv[1])[:12]: print('G',k,round(v,3))
o=bpy.data.objects['Sedan Body_Optics_0']
for p in o.data.polygons[:0]: pass
ys=[ (o.matrix_world@p.center).y for p in o.data.polygons]
print('OPT y min/max', min(ys), max(ys), 'count near -4.6', sum(1 for y in ys if y>-5.2), 'near -8.8', sum(1 for y in ys if y<-8.2))
sc=bpy.context.scene; sc.render.engine='BLENDER_WORKBENCH'; sc.display.shading.light='STUDIO'; sc.display.shading.color_type='TEXTURE'
sc.render.resolution_x=800; sc.render.resolution_y=450
cd=bpy.data.cameras.new('c'); cam=bpy.data.objects.new('c',cd); sc.collection.objects.link(cam); sc.camera=cam
cam.location=(5,-3.5,2.5); d=mathutils.Vector((0,-6.7,0.6))-cam.location; cam.rotation_euler=d.to_track_quat('-Z','Y').to_euler(); cd.lens=40
sc.render.filepath='/tmp/claude-0/r/pk.png'; bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath='/tmp/claude-0/sedan/pack_sedan.blend')
