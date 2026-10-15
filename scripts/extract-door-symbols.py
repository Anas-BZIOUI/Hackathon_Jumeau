import ezdxf,glob,json,math
from pathlib import Path
out={}
for level,origin in [('RDC',(10995,4293)),('R+1',(105,42)),('R+2',(495,-915))]:
 file=next(f for f in glob.glob('*.dxf') if level in f)
 m=ezdxf.readfile(file).modelspace();arcs=[]
 for e in m.query('ARC'):
  layer=e.dxf.layer.lower();radius=e.dxf.radius;sweep=(e.dxf.end_angle-e.dxf.start_angle)%360
  if not .65<=radius<=1.6 or not 80<=sweep<=100:continue
  if level=='R+2' and layer!='gex_vol_archi':continue
  if level!='R+2' and 'porte' not in layer:continue
  c=[e.dxf.center.x-origin[0],e.dxf.center.y-origin[1]]
  ends=[[c[0]+radius*math.cos(math.radians(a)),c[1]+radius*math.sin(math.radians(a))] for a in [e.dxf.start_angle,e.dxf.end_angle]]
  arcs.append({'center':c,'radius':radius,'ends':ends})
 out[level]=arcs
 print(level,len(arcs))
Path('data-src/door-symbols.json').write_text(json.dumps(out,indent=2),encoding='utf8')
