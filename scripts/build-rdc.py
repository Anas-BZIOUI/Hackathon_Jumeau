"""Build playable RDC geometry; no third-party dependencies required."""
from pathlib import Path
import json, math
ROOT=Path(__file__).resolve().parent.parent

def inside(p,ring):
 x,y=p; result=False
 for a,b in zip(ring,ring[1:]+ring[:1]):
  if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:result=not result
 return result

def segment(p,a,b):
 dx,dy=b[0]-a[0],b[1]-a[1]; t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy or 1)))
 return (a[0]+t*dx,a[1]+t*dy)

def boundary(p,r):
 q=min((segment(p,a,b) for a,b in zip(r,r[1:]+r[:1])),key=lambda q:math.dist(p,q))
 return math.dist(p,q),q

def anchor(p,r):
 # Search for a nearby position with a full player footprint inside the room.
 for radius in [0,.2,.4,.6,.9,1.2,1.6,2,3,5,8,12]:
  for n in range(32):
   a=n*math.tau/32;q=(p[0]+radius*math.cos(a),p[1]+radius*math.sin(a))
   if inside(q,r) and boundary(q,r)[0]>.2:return [round(v,4) for v in q]
 raise ValueError('No interior anchor')

geo=json.loads((ROOT/'pieces_RDC.geojson').read_text(encoding='utf8'))
rooms=[]
for i,f in enumerate(geo['features']):
 p=f['properties'];ring=f['geometry']['coordinates'][0]
 name=p.get('libelle') or ('Circulation principale' if p.get('surface_polygone_m2',0)>200 else 'Circulation / espace annexe')
 if i==38:name='Sas d’entrée'
 number=p.get('numero');rooms.append(dict(id=f'rdc-{i}',name=(str(number)+' · ' if number else '')+name,number=number,polygon=ring,reliable=p.get('fiable',False),area=p.get('surface_polygone_m2'),bounds=[min(x for x,y in ring),min(y for x,y in ring),max(x for x,y in ring),max(y for x,y in ring)],anchor=anchor(ring[0],ring)))
# Read original modelspace entities in metres, excluding other drawings elsewhere in the DXF.
lines=next(ROOT.glob('*RDC*.dxf')).read_text(errors='replace').splitlines();entities=[];e=None;active=False
for i in range(0,len(lines)-1,2):
 c,v=lines[i].strip(),lines[i+1].strip()
 if c=='2' and v=='ENTITIES':active=True
 if c=='0' and v=='ENDSEC':
  if active and e:entities.append(e);e=None
  active=False
 if not active:continue
 if c=='0':
  if e:entities.append(e)
  e={'type':v}
 elif e is not None:e[c]=v
# Expand nested DXF blocks so inserted door symbols are included.
records=[];record=None
for i in range(0,len(lines)-1,2):
 c,v=lines[i].strip(),lines[i+1].strip()
 if c=='0':
  if record:records.append(record)
  record={'type':v}
 elif record is not None:record[c]=v
blocks={};block=None
for record in records:
 if record['type']=='BLOCK':block=record;blocks[record.get('2','')]=dict(base=[float(record.get('10',0)),float(record.get('20',0))],entities=[])
 elif record['type']=='ENDBLK':block=None
 elif block is not None:blocks[block.get('2','')]['entities'].append(record)
def expand(entity,transform=(1,0,0,1,0,0),depth=0):
 if depth>10:return []
 a,b,c,d,tx,ty=transform
 def point(x,y):return [a*x+c*y+tx,b*x+d*y+ty]
 if entity['type']=='INSERT' and entity.get('2') in blocks:
  block=blocks[entity['2']];angle=math.radians(float(entity.get('50',0)));sx=float(entity.get('41',1));sy=float(entity.get('42',1));co=math.cos(angle);si=math.sin(angle)
  aa,bb,cc,dd=co*sx,si*sx,-si*sy,co*sy
  bx,by=block['base'];ix=float(entity.get('10',0))-aa*bx-cc*by;iy=float(entity.get('20',0))-bb*bx-dd*by
  x,y=point(ix,iy);matrix=(a*aa+c*bb,b*aa+d*bb,a*cc+c*dd,b*cc+d*dd,x,y)
  return [e for child in block['entities'] for e in expand(child,matrix,depth+1)]
 if entity['type']=='ARC':
  result=dict(entity);x,y=point(float(entity.get('10',0)),float(entity.get('20',0)));result['10']=str(x);result['20']=str(y)
  result['40']=str(float(entity.get('40',0))*math.hypot(a,b))
  rotation=math.degrees(math.atan2(b,a))
  result['50']=str(float(entity.get('50',0))+rotation);result['51']=str(float(entity.get('51',0))+rotation)
  return [result]
 return []
entities=[child for entity in entities for child in expand(entity)]
arcs=[]
for e in entities:
 if e['type']!='ARC':continue
 x=float(e.get('10',0))-10995;y=float(e.get('20',0))-4293;r=float(e.get('40',0))
 sweep=(float(e.get('51',0))-float(e.get('50',0)))%360
 if 0<x<60 and 0<y<35 and .45<r<2.5 and 55<sweep<125 and e.get('8') in ['0-cadre','0-porte','0']:
  arcs.append(dict(handle=e.get('5'),hinge=[x,y],width=r,angles=[float(e['50']),float(e['51'])],layer=e.get('8')))

doors=[];pairs=set()
def connect(a,b,point,source,width=.9,handle=None):
 key=tuple(sorted((a,b)))
 # Keep multiple physical doors between the same rooms when sufficiently separated.
 if any(set(d['rooms'])=={rooms[a]['id'],rooms[b]['id']} and math.dist(d['position'],point)<.7 for d in doors):return
 pa=anchor(point,rooms[a]['polygon']);pb=anchor(point,rooms[b]['polygon'])
 doors.append(dict(id=f'door-{len(doors)}',rooms=[rooms[a]['id'],rooms[b]['id']],position=[round(v,4) for v in point],entries=[pa,pb],width=round(width,3),source=source,approximate=True,dxfHandle=handle))
 pairs.add(key)
for arc in arcs:
 best=None
 for angle in arc['angles']:
  t=math.radians(angle);p=[arc['hinge'][0]+math.cos(t)*arc['width']/2,arc['hinge'][1]+math.sin(t)*arc['width']/2]
  candidates=sorted((boundary(p,r['polygon'])[0],i) for i,r in enumerate(rooms))[:3]
  if len(candidates)>1 and candidates[1][0]<1.05:
   score=candidates[0][0]+candidates[1][0]
   if best is None or score<best[0]:best=(score,candidates[0][1],candidates[1][1],p)
 if best:connect(best[1],best[2],best[3],'DXF arc; room association inferred',arc['width'],arc['handle'])
# Join disconnected components using nearest contour points, explicitly marked as inferred.
def components():
 parent=list(range(len(rooms)))
 def find(a):
  while parent[a]!=a:a=parent[a]
  return a
 for a,b in pairs:parent[find(a)]=find(b)
 return [find(i) for i in range(len(rooms))]
cache={}
while len(set(components()))>1:
 groups=components();best=None
 for a in range(len(rooms)):
  for b in range(a+1,len(rooms)):
   if groups[a]==groups[b]:continue
   key=(a,b)
   if key not in cache:
    ra,rb=rooms[a]['polygon'],rooms[b]['polygon']
    sampled=ra[::max(1,len(ra)//60)]
    candidates=[(boundary(p,rb)[0],p,boundary(p,rb)[1]) for p in sampled]
    dist,pa,pb=min(candidates,key=lambda x:x[0]);cache[key]=(dist,[(pa[0]+pb[0])/2,(pa[1]+pb[1])/2])
   dist,p=cache[key]
   if best is None or dist<best[0]:best=(dist,a,b,p)
 dist,a,b,p=best;connect(a,b,p,'Nearest contours; inferred passage, verify on site')
 for d in doors[-1:]:d['gap_m']=round(dist,3)
layout=dict(version=1,level='RDC',units='metres',origin_dxf=[10995,4293],extent=[60,35],spawn=dict(roomId='rdc-38',position=anchor([29.05,5.15],rooms[38]['polygon'])),rooms=rooms,doors=doors,doorSymbols=arcs,audit=dict(spaces=len(rooms),doors=len(doors),dxfArcs=len(arcs),dxfAssociated=sum(d['dxfHandle'] is not None for d in doors),inferred=sum(d['dxfHandle'] is None for d in doors),connectedComponents=len(set(components())),note='Contours reconstructed from plans. Door hinges come from DXF where available; room associations, passage endpoints and fallback openings are inferred, not surveyed. Exterior doors and stairs are not floor transitions.'))
out=ROOT/'public/game/maps/rdc-layout.json';out.write_text(json.dumps(layout,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps(layout['audit'],ensure_ascii=False))
