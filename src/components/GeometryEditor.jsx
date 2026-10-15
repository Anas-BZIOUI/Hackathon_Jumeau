import {useEffect,useMemo,useRef,useState} from 'react';
import {emptyGeometry,FLOOR_IDS,GEOMETRY_KEY,projectToWall,validateGeometry} from '../drawnGeometry.js';
import {roomName} from '../core.js';
import groundPlan from '../../plan_RDC.png';
import firstPlan from '../../plan_R+1.png';
import secondPlan from '../../plan_R+2.png';
const PLANS={RDC:groundPlan,'R+1':firstPlan,'R+2':secondPlan};
const clone=value=>JSON.parse(JSON.stringify(value));
const uid=prefix=>`${prefix}-${crypto.randomUUID()}`;
const messages={format:['Fichier de dessin invalide.','Invalid drawing file.'],wall:['Mur invalide : longueur ≥ 0,15 m, hauteur 1–2,8 m, épaisseur 0,05–0,60 m.','Invalid wall dimensions.'],region:['Zone invalide : largeur et hauteur ≥ 0,15 m.','Invalid replacement area.'],door:['Choisissez une salle et placez la porte sur un mur dessiné.','Choose a room and place the door on a drawn wall.'],'door-fit':['La porte dépasse le mur. Déplacez-la ou réduisez sa largeur.','The door extends past the wall. Move it or reduce its width.'],'door-height':['Un mur avec porte doit mesurer au moins 2,30 m de haut.','Walls with doors must be at least 2.30 m high.'],'door-overlap':['Deux portes se chevauchent sur le même mur.','Two doors overlap on the same wall.'],id:['Identifiants invalides dans le fichier.','Invalid element identifiers.']};

export default function GeometryEditor({floors,rooms,selected,lang,applied,onApply,onClose,onRestore}){
 const fr=lang==='fr',dialog=useRef(null),fileInput=useRef(null);
 const [draft,setDraft]=useState(()=>{try{const value=JSON.parse(localStorage.getItem(GEOMETRY_KEY+'-draft'));return validateGeometry(value,floors,rooms);}catch{return clone(applied||emptyGeometry());}});
 const [floor,setFloor]=useState(selected?.level||'RDC'),[tool,setTool]=useState('region'),[selection,setSelection]=useState(null),[notice,setNotice]=useState('');
 const [past,setPast]=useState([]),[future,setFuture]=useState([]),[saved,setSaved]=useState(true),[snap,setSnap]=useState(true),[chain,setChain]=useState(true),[opacity,setOpacity]=useState(80);
 const [doorRoom,setDoorRoom]=useState(selected?.id||''),[defaults,setDefaults]=useState({height:2.8,thickness:.12,width:.9,swing:1,hinge:'start'});
 const layer=draft.levels[floor],floorRooms=rooms.filter(r=>r.level===floor&&r.type!=='circulation');
 const object=selection?layer[selection.kind].find(o=>o.id===selection.id):null;
 const counts=FLOOR_IDS.reduce((a,lv)=>{const l=draft.levels[lv];a.walls+=l.walls.length;a.doors+=l.doors.length;a.regions+=l.regions.length;return a;},{walls:0,doors:0,regions:0});
 useEffect(()=>{const previous=document.activeElement;dialog.current.showModal();return()=>previous?.focus();},[]);
 useEffect(()=>{try{localStorage.setItem(GEOMETRY_KEY+'-draft',JSON.stringify(draft));setSaved(true);}catch{setSaved(false);}},[draft]);
 const errorText=error=>(messages[error.message]||messages.format)[fr?0:1];
 function history(){setPast(p=>[...p.slice(-49),clone(draft)]);setFuture([]);}
 function edit(next,remember=true){try{validateGeometry(next,floors,rooms);if(remember)history();setDraft(next);setNotice('');return true;}catch(e){setNotice(errorText(e));return false;}}
 function changeLayer(next,remember=true){return edit({...draft,levels:{...draft.levels,[floor]:next}},remember);}
 function undo(){if(!past.length)return;setFuture(f=>[clone(draft),...f]);setDraft(past[past.length-1]);setPast(p=>p.slice(0,-1));setSelection(null);setNotice('');}
 function redo(){if(!future.length)return;setPast(p=>[...p,clone(draft)]);setDraft(future[0]);setFuture(f=>f.slice(1));setSelection(null);setNotice('');}
 function remove(){if(!selection)return;const next={...layer,[selection.kind]:layer[selection.kind].filter(o=>o.id!==selection.id)};if(selection.kind==='walls')next.doors=next.doors.filter(d=>d.wallId!==selection.id);changeLayer(next);setSelection(null);}
 function exported(){const url=URL.createObjectURL(new Blob([JSON.stringify({...draft,exported_at:new Date().toISOString()},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='ensiie-walls-doors.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 async function imported(e){const file=e.target.files[0];if(!file)return;try{if(file.size>4000000)throw Error('format');const value=validateGeometry(JSON.parse(await file.text()),floors,rooms);edit(value);setSelection(null);setNotice(fr?'Dessin importé.':'Drawing imported.');}catch(err){setNotice(errorText(err));}e.target.value='';}
 function apply(){try{const value=validateGeometry(draft,floors,rooms);onApply(value);}catch(e){setNotice(errorText(e));}}
 return <dialog ref={dialog} className="calibration-dialog geometry-dialog" aria-labelledby="geometry-title" onCancel={e=>{e.preventDefault();onClose();}} onKeyDown={e=>{
  if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();}
  if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove();}
 }}>
  <header className="calibration-header"><div><div className="three-eyebrow">{fr?'DESSINEZ LA GÉOMÉTRIE DU BÂTIMENT':'DRAW THE BUILDING GEOMETRY'}</div><h2 id="geometry-title">{fr?'Murs et portes, à votre main':'Your walls and doors'}</h2><p>{fr?'1. Délimitez une zone à remplacer. 2. Tracez les murs. 3. Posez les portes sur vos murs.':'1. Mark an area to replace. 2. Trace walls. 3. Place doors on your walls.'}</p></div><button className="ghost" onClick={onClose} aria-label={fr?'Fermer l’éditeur':'Close editor'}>✕</button></header>
  <div className="calibration-body"><aside className="calibration-sidebar geometry-sidebar">
   <h3>{fr?'Étage à dessiner':'Floor to draw'}</h3><div className="calibration-floor-list">{FLOOR_IDS.map(lv=><button key={lv} className={floor===lv?'active':''} onClick={()=>{setFloor(lv);setSelection(null);}}>{lv}<small>{draft.levels[lv].walls.length} / {draft.levels[lv].doors.length}</small></button>)}</div>
   <h3>{fr?'Outils':'Tools'}</h3><div className="geometry-tools">{[['region',fr?'Zone à refaire':'Replacement area'],['wall',fr?'Tracer un mur':'Draw wall'],['door',fr?'Poser une porte':'Place door'],['select',fr?'Sélectionner / déplacer':'Select / move'],['pan',fr?'Déplacer le plan':'Pan plan']].map(([id,label])=><button key={id} className={tool===id?'active':''} onClick={()=>setTool(id)}>{label}</button>)}</div>
   <p className="hint">{tool==='region'?(fr?'Cliquez deux coins opposés. Les murs et portes générés dans cette zone seront retirés lors de l’aperçu.':'Click two opposite corners. Generated walls and doors inside this area will be removed in the preview.'):tool==='wall'?(fr?'Deux clics = un mur. Échap termine la chaîne. Maintenez Maj pour contraindre la direction.':'Two clicks make a wall. Escape ends the chain. Hold Shift to constrain direction.'):tool==='door'?(fr?'Choisissez la salle, puis cliquez sur un mur bleu que vous avez dessiné. La porte crée son ouverture.':'Choose the room, then click one of your blue walls. The door creates its own opening.'):tool==='select'?(fr?'Cliquez un élément. Glissez un mur, une extrémité ou une porte. Suppr efface la sélection.':'Select an element. Drag walls, endpoints or doors. Delete removes the selection.'):(fr?'Glissez pour déplacer le plan. La molette zoome dans tous les modes.':'Drag to pan. Scroll zooms in every mode.')}</p>
   <label className="geometry-check"><input type="checkbox" checked={snap} onChange={e=>setSnap(e.target.checked)}/>{fr?'Aimantation : grille 25 cm et extrémités':'Snap to 25 cm grid and endpoints'}</label>
   <label className="geometry-check"><input type="checkbox" checked={chain} onChange={e=>setChain(e.target.checked)}/>{fr?'Enchaîner les murs':'Chain walls'}</label>
   {tool==='wall'&&<><NumberField label={fr?'Hauteur du prochain mur (m)':'Next wall height (m)'} value={defaults.height} min={1} max={2.8} step={.1} onChange={value=>setDefaults(d=>({...d,height:value}))}/><NumberField label={fr?'Épaisseur du prochain mur (m)':'Next wall thickness (m)'} value={defaults.thickness} min={.05} max={.6} step={.01} onChange={value=>setDefaults(d=>({...d,thickness:value}))}/></>}
   {tool==='door'&&<><label className="calibration-field">{fr?'Salle desservie par la porte':'Room served by the door'}<select aria-label={fr?'Salle de la nouvelle porte':'Room for the new door'} value={floorRooms.some(r=>r.id===doorRoom)?doorRoom:''} onChange={e=>setDoorRoom(e.target.value)}><option value="">{fr?'Choisir la salle':'Choose a room'}</option>{floorRooms.map(r=><option key={r.id} value={r.id}>{roomName(r,lang)}</option>)}</select></label><NumberField label={fr?'Largeur de la prochaine porte (m)':'Next door width (m)'} value={defaults.width} min={.6} max={2.4} step={.05} onChange={value=>setDefaults(d=>({...d,width:value}))}/></>}
   <h3>{fr?'Élément sélectionné':'Selected element'}</h3>
   {object?<ElementProperties key={`${object.id}-${JSON.stringify(object)}`} object={object} kind={selection.kind} layer={layer} rooms={floorRooms} lang={lang} onSave={updated=>changeLayer({...layer,[selection.kind]:layer[selection.kind].map(o=>o.id===object.id?updated:o)})} onDelete={remove}/>:<p className="hint">{fr?'Vos traits bleus = murs. Orange = portes. Vert = zones de remplacement. Le plan reste une référence.':'Blue lines are your walls. Orange lines are doors. Green areas replace generated geometry. The plan is a reference.'}</p>}
   {!layer.regions.length&&<p className="geometry-warning">{fr?'Aucune zone : vos éléments s’ajouteront au modèle actuel. Tracez une zone pour le remplacer localement.':'No replacement area: your elements will be added to the current model. Draw an area to replace it locally.'}</p>}
   <button className="ghost" onClick={()=>{changeLayer({...layer,regions:[{id:uid('region'),min:[0,0],max:[...floors.levels[floor].size]}]});setTool('wall');}}>{fr?'Remplacer tout cet étage':'Replace this entire floor'}</button>
   <h3>{fr?'Zones de cet étage':'Replacement areas on this floor'}</h3><div className="geometry-region-list">{layer.regions.map((r,i)=><button key={r.id} className={selection?.id===r.id?'active':''} onClick={()=>{setSelection({kind:'regions',id:r.id});setTool('select');}}>{fr?'Zone':'Area'} {i+1} · {((r.max[0]-r.min[0])*(r.max[1]-r.min[1])).toFixed(1)} m²</button>)}</div>
  </aside><section className="calibration-workspace"><div className="calibration-mapbar"><div className="calibration-small-actions"><button className="ghost" disabled={!past.length} onClick={undo}>{fr?'Annuler':'Undo'}</button><button className="ghost" disabled={!future.length} onClick={redo}>{fr?'Rétablir':'Redo'}</button><button className="ghost" disabled={!object} onClick={remove}>{fr?'Supprimer':'Delete'}</button></div><label className="geometry-opacity">{fr?'Fond de plan':'Plan opacity'}<input type="range" min="15" max="100" value={opacity} onChange={e=>setOpacity(+e.target.value)}/></label><span className="hint">{floor} · {layer.walls.length} {fr?'murs':'walls'} · {layer.doors.length} {fr?'portes':'doors'}</span></div>
   <DrawingCanvas roomList={floorRooms} key={floor} floor={floor} size={floors.levels[floor].size} layer={layer} tool={tool} setTool={setTool} selection={selection} setSelection={setSelection} changeLayer={changeLayer} history={history} snap={snap} chain={chain} opacity={opacity} defaults={defaults} doorRoom={floorRooms.some(r=>r.id===doorRoom)?doorRoom:''} selectedRoom={selected?.level===floor?selected:null} fr={fr} notice={setNotice}/>
   <div className="calibration-instructions">{fr?'Molette : zoom · outil Déplacer ou bouton central : déplacer · Échap : annuler le tracé · Ctrl Z / Ctrl Maj Z : annuler / rétablir. Les mesures sont en mètres.':'Scroll: zoom · Pan tool or middle button: pan · Escape: cancel drawing · Ctrl Z / Ctrl Shift Z: undo / redo. Dimensions are in metres.'}</div>
  </section></div>
  <footer className="calibration-footer"><div><span>{counts.walls} {fr?'murs':'walls'} · {counts.doors} {fr?'portes':'doors'} · {counts.regions} {fr?'zones':'areas'} · {saved?(fr?'Brouillon sauvegardé dans ce navigateur':'Draft saved in this browser'):(fr?'Stockage local indisponible : exportez votre dessin':'Local storage unavailable: export your drawing')}</span><small>{fr?'L’aperçu utilise vos dessins pour les murs, portes et collisions. Les escaliers restent liés aux repères. Les fichiers d’origine ne sont pas modifiés.':'The preview uses your drawings for walls, doors and collisions. Stairs retain the marked connections. Original files remain unchanged.'}</small>{notice&&<div className="geometry-notice" role="status">{notice}</div>}</div><div className="calibration-small-actions"><input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={imported}/><button className="ghost" onClick={()=>{edit(emptyGeometry());setSelection(null);}}>{fr?'Nouveau dessin':'New drawing'}</button><button className="ghost" onClick={()=>fileInput.current.click()}>{fr?'Importer':'Import'}</button><button className="ghost" onClick={exported}>{fr?'Exporter JSON':'Export JSON'}</button>{applied&&<button className="ghost" onClick={onRestore}>{fr?'Revenir au modèle d’origine':'Restore original model'}</button>}<button className="primary" onClick={apply}>{fr?'Appliquer et visiter':'Apply and visit'}</button></div></footer>
 </dialog>;
}

function NumberField({label,value,onChange,...attributes}){return <label className="calibration-field">{label}<input type="number" value={Number.isFinite(value)?value:''} onChange={e=>onChange(e.target.value===''?NaN:Number(e.target.value))} {...attributes}/></label>;}
function ElementProperties({object,kind,layer,rooms,lang,onSave,onDelete}){
 const fr=lang==='fr',[value,setValue]=useState(clone(object));
 const number=(label,key,min,max,step=.01)=><NumberField key={key} label={label} value={value[key]} min={min} max={max} step={step} onChange={n=>setValue(v=>({...v,[key]:n}))}/>;
 return <form className="geometry-properties" onSubmit={e=>{e.preventDefault();onSave(value);}}>
  {kind==='walls'&&<><span className="hint">{fr?'Longueur':'Length'} : {Math.hypot(value.b[0]-value.a[0],value.b[1]-value.a[1]).toFixed(2)} m</span>{['a','b'].map((p,i)=><div className="geometry-point-fields" key={p}>{[0,1].map((axis)=><NumberField key={axis} label={`${i===0?(fr?'Début':'Start'):(fr?'Fin':'End')} ${axis?'Y':'X'} (m)`} value={value[p][axis]} min={0} step={.01} onChange={n=>setValue(v=>({...v,[p]:v[p].map((old,j)=>j===axis?n:old)}))}/>)}</div>)}{number(fr?'Hauteur (m)':'Height (m)','height',1,2.8,.1)}{number(fr?'Épaisseur (m)':'Thickness (m)','thickness',.05,.6)}</>}
  {kind==='doors'&&<>{number(fr?'Largeur (m)':'Width (m)','width',.6,2.4,.05)}<NumberField label={fr?'Position le long du mur (%)':'Position along wall (%)'} value={value.t*100} min={0} max={100} step={.1} onChange={n=>setValue(v=>({...v,t:n/100}))}/><label className="calibration-field">{fr?'Salle desservie':'Room served'}<select value={value.roomId} onChange={e=>setValue(v=>({...v,roomId:e.target.value}))}>{rooms.map(r=><option key={r.id} value={r.id}>{roomName(r,lang)}</option>)}</select></label><label className="calibration-field">{fr?'Côté des charnières':'Hinge side'}<select value={value.hinge} onChange={e=>setValue(v=>({...v,hinge:e.target.value}))}><option value="start">{fr?'Début du mur':'Wall start'}</option><option value="end">{fr?'Fin du mur':'Wall end'}</option></select></label><label className="calibration-field">{fr?'Sens d’ouverture':'Opening direction'}<select value={value.swing} onChange={e=>setValue(v=>({...v,swing:Number(e.target.value)}))}><option value={1}>{fr?'Côté gauche du mur':'Left side of wall'}</option><option value={-1}>{fr?'Côté droit du mur':'Right side of wall'}</option></select></label><p className="hint">{fr?'Glissez le trait orange pour déplacer la porte le long de son mur.':'Drag the orange line to move the door along its wall.'}</p></>}
  {kind==='regions'&&<><p className="hint">{fr?'Les éléments générés à l’intérieur sont retirés. Vos éléments dessinés sont conservés.':'Generated elements inside are removed. Your drawn elements are retained.'}</p>{['min','max'].map(p=><div className="geometry-point-fields" key={p}>{[0,1].map(axis=><NumberField key={axis} label={`${p} ${axis?'Y':'X'} (m)`} value={value[p][axis]} min={0} step={.01} onChange={n=>setValue(v=>({...v,[p]:v[p].map((old,j)=>j===axis?n:old)}))}/>)}</div>)}</>}
  <div className="calibration-small-actions"><button className="primary" type="submit">{fr?'Mettre à jour':'Update'}</button><button className="ghost" type="button" onClick={onDelete}>{fr?'Supprimer':'Delete'}</button></div>
 </form>;
}

function DrawingCanvas({roomList=[],floor,size,layer,tool,setTool,selection,setSelection,changeLayer,history,snap,chain,opacity,defaults,doorRoom,selectedRoom,fr,notice}){
 const svg=useRef(null),drag=useRef(null),[view,setView]=useState({x:-2,y:-2,w:size[0]+4,h:size[1]+4}),[start,setStart]=useState(null),[cursor,setCursor]=useState(null);
 const [w,h]=size;
 useEffect(()=>{setStart(null);},[tool]);
 const local=(e,inverse=svg.current.getScreenCTM().inverse())=>{const p=svg.current.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(inverse);return [q.x,h-q.y];};
 function snapped(p,exclude){let out=p.map((v,i)=>Math.max(0,Math.min(size[i],v)));if(!snap)return out;
  const radius=view.w*10/Math.max(1,svg.current.clientWidth);let best=null,distance=radius;
  for(const wall of layer.walls)if(wall.id!==exclude)for(const point of [wall.a,wall.b]){const d=Math.hypot(point[0]-out[0],point[1]-out[1]);if(d<distance){distance=d;best=point;}}
  return best?[...best]:out.map(v=>Math.round(v/.25)*.25).map((v,i)=>Math.min(size[i],v));
 }
 function zoom(factor,p=[view.x+view.w/2,h-view.y-view.h/2]){const width=Math.max(1.5,Math.min(w*3,view.w*factor)),ratio=width/view.w,x=p[0],y=h-p[1];setView({x:x-(x-view.x)*ratio,y:y-(y-view.y)*ratio,w:width,h:view.h*ratio});}
 function constrained(p,e){if(!start)return p;const dx=p[0]-start[0],dy=p[1]-start[1];if(e.shiftKey){const angle=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*Math.PI/4,len=Math.hypot(dx,dy);return [start[0]+Math.cos(angle)*len,start[1]+Math.sin(angle)*len].map((v,i)=>Math.max(0,Math.min(size[i],v)));}return p;}
 function down(e){if(e.button!==0&&e.button!==1)return;e.preventDefault();svg.current.focus();const raw=local(e),point=snapped(raw),id=e.target.getAttribute('data-id'),kind=e.target.getAttribute('data-kind'),endpoint=e.target.getAttribute('data-endpoint');
  if(tool==='pan'||e.button===1){drag.current={type:'pan',point:raw,view:{...view},inverse:svg.current.getScreenCTM().inverse()};svg.current.setPointerCapture(e.pointerId);return;}
  if(tool==='select'){
   setStart(null);if(!id){setSelection(null);return;}setSelection({kind,id});
   if(kind==='walls'||kind==='doors'){drag.current={type:kind,id,endpoint,point:raw,layer:clone(layer),remembered:false};svg.current.setPointerCapture(e.pointerId);}return;
  }
  if(tool==='door'){
   if(!doorRoom){notice(fr?'Choisissez la salle desservie avant de placer une porte.':'Choose the room served before placing a door.');return;}
   const nearest=layer.walls.map(wall=>({wall,...projectToWall(raw,wall)})).sort((a,b)=>a.distance-b.distance)[0];
   if(!nearest||nearest.distance>Math.max(.3,view.w*.02)){notice(fr?'Cliquez sur un mur bleu que vous avez dessiné.':'Click one of your drawn blue walls.');return;}
   if(!Number.isFinite(defaults.width)||nearest.length<defaults.width+.1){notice(fr?'Le mur est trop court pour cette porte.':'The wall is too short for this door.');return;}
   const margin=(defaults.width/2+.05)/nearest.length,t=Math.max(margin,Math.min(1-margin,nearest.t));
   const door={id:uid('door'),wallId:nearest.wall.id,t,width:defaults.width,swing:defaults.swing,hinge:defaults.hinge,roomId:doorRoom};
   if(changeLayer({...layer,doors:[...layer.doors,door]})){setSelection({kind:'doors',id:door.id});setTool('select');}return;
  }
  if(!start){setStart(point);setCursor(point);return;}
  const end=constrained(point,e);
  if(tool==='region'){
   const min=[Math.min(start[0],end[0]),Math.min(start[1],end[1])],max=[Math.max(start[0],end[0]),Math.max(start[1],end[1])];
   const region={id:uid('region'),min,max};if(changeLayer({...layer,regions:[...layer.regions,region]})){setStart(null);setTool('wall');setSelection(null);}return;
  }
  if(tool==='wall'){
   const wall={id:uid('wall'),a:[...start],b:end,height:defaults.height,thickness:defaults.thickness};
   if(changeLayer({...layer,walls:[...layer.walls,wall]})){setSelection({kind:'walls',id:wall.id});setStart(chain?end:null);}return;
  }
 }
 function move(e){const p=local(e);if(!drag.current){setCursor(constrained(snapped(p),e));return;}
  const g=drag.current;
  if(g.type==='pan'){const q=local(e,g.inverse);setView({...g.view,x:g.view.x-(q[0]-g.point[0]),y:g.view.y+(q[1]-g.point[1])});return;}
  if(Math.hypot(p[0]-g.point[0],p[1]-g.point[1])<.01&&!g.remembered)return;
  if(!g.remembered){history();g.remembered=true;}
  if(g.type==='walls'){
   const wall=g.layer.walls.find(w=>w.id===g.id);let updated;
   if(g.endpoint)updated={...wall,[g.endpoint]:snapped(p,wall.id)};
   else{let dx=p[0]-g.point[0],dy=p[1]-g.point[1];if(snap){dx=Math.round(dx/.25)*.25;dy=Math.round(dy/.25)*.25;}dx=Math.max(-Math.min(wall.a[0],wall.b[0]),Math.min(w-Math.max(wall.a[0],wall.b[0]),dx));dy=Math.max(-Math.min(wall.a[1],wall.b[1]),Math.min(h-Math.max(wall.a[1],wall.b[1]),dy));updated={...wall,a:[wall.a[0]+dx,wall.a[1]+dy],b:[wall.b[0]+dx,wall.b[1]+dy]};}
   changeLayer({...g.layer,walls:g.layer.walls.map(x=>x.id===g.id?updated:x)},false);
  }else{
   const door=g.layer.doors.find(d=>d.id===g.id),wall=g.layer.walls.find(w=>w.id===door.wallId),projection=projectToWall(p,wall),margin=(door.width/2+.05)/projection.length;
   changeLayer({...g.layer,doors:g.layer.doors.map(d=>d.id===door.id?{...d,t:Math.max(margin,Math.min(1-margin,projection.t))}:d)},false);
  }
 }
 const radius=view.w/150,lineWidth=Math.max(.08,view.w/550),screen=p=>[p[0],h-p[1]];
 function centerRoom(){if(!selectedRoom)return;const points=selectedRoom.polygon||[selectedRoom.centroid],xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);const bw=Math.max(8,Math.max(...xs)-Math.min(...xs)+6),bh=Math.max(8,Math.max(...ys)-Math.min(...ys)+6);setView({x:(Math.max(...xs)+Math.min(...xs)-bw)/2,y:h-(Math.max(...ys)+Math.min(...ys)+bh)/2,w:bw,h:bh});}
 return <div className="calibration-plan geometry-plan"><svg ref={svg} tabIndex={0} role="img" aria-label={`${fr?'Plan de dessin':'Drawing plan'} ${floor}`} viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} onPointerDown={down} onPointerMove={move} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onWheel={e=>zoom(e.deltaY>0?1.12:.89,local(e))} onContextMenu={e=>{e.preventDefault();setStart(null);}} onKeyDown={e=>{
  if(e.key==='Escape'&&start){e.preventDefault();e.stopPropagation();setStart(null);}if(e.key==='+'||e.key==='='){e.preventDefault();zoom(.8);}if(e.key==='-'){e.preventDefault();zoom(1.25);}
 }} style={{cursor:tool==='pan'?'grab':tool==='select'?'default':'crosshair'}}>
  <rect width={w} height={h} fill="white"/><image href={PLANS[floor]} width={w} height={h} opacity={opacity/100} pointerEvents="none"/>
  {layer.regions.map(r=><rect key={r.id} x={r.min[0]} y={h-r.max[1]} width={r.max[0]-r.min[0]} height={r.max[1]-r.min[1]} fill="#4b9e6a25" stroke={selection?.id===r.id?'#256c42':'#4b9e6a'} strokeWidth={lineWidth} strokeDasharray={`${radius} ${radius*.6}`} data-id={r.id} data-kind="regions" style={{pointerEvents:tool==='select'?'stroke':'none'}}/>)}
  {layer.doors.filter(d=>selection?.id===d.id||tool==='door').map(d=>{const room=roomList.find(r=>r.id===d.roomId),wall=layer.walls.find(w=>w.id===d.wallId);if(!room?.centroid||!wall)return null;const x=wall.a[0]+(wall.b[0]-wall.a[0])*d.t,y=wall.a[1]+(wall.b[1]-wall.a[1])*d.t;return <g key={'association-'+d.id} pointerEvents="none"><line x1={x} y1={h-y} x2={room.centroid[0]} y2={h-room.centroid[1]} stroke="#965112" strokeWidth={lineWidth*.5} strokeDasharray={radius+' '+radius}/><text x={room.centroid[0]} y={h-room.centroid[1]} fontSize={radius*1.5} fill="#663812">{room.number||room.id}</text><title>{fr?'Association à vérifier visuellement':'Visually verify room association'} : {room.id}</title></g>;})}
  {layer.walls.map(wall=><g key={wall.id}><line x1={wall.a[0]} y1={h-wall.a[1]} x2={wall.b[0]} y2={h-wall.b[1]} stroke={selection?.id===wall.id?'#173b65':'#347ec3'} strokeWidth={Math.max(wall.thickness,lineWidth*1.5)} pointerEvents="none"/><line x1={wall.a[0]} y1={h-wall.a[1]} x2={wall.b[0]} y2={h-wall.b[1]} stroke="transparent" strokeWidth="14" vectorEffect="non-scaling-stroke" data-id={wall.id} data-kind="walls"/>{selection?.id===wall.id&&['a','b'].map(endpoint=><circle key={endpoint} cx={wall[endpoint][0]} cy={h-wall[endpoint][1]} r={radius} fill="white" stroke="#245b95" strokeWidth={lineWidth} data-id={wall.id} data-kind="walls" data-endpoint={endpoint}/>)}</g>)}
  {layer.doors.map(door=>{const wall=layer.walls.find(w=>w.id===door.wallId),length=projectToWall(wall.a,wall).length,ux=(wall.b[0]-wall.a[0])/length,uy=(wall.b[1]-wall.a[1])/length,center=[wall.a[0]+(wall.b[0]-wall.a[0])*door.t,wall.a[1]+(wall.b[1]-wall.a[1])*door.t],sign=door.hinge==='start'?1:-1,hinge=[center[0]-ux*door.width/2*sign,center[1]-uy*door.width/2*sign],end=[center[0]+ux*door.width/2*sign,center[1]+uy*door.width/2*sign],tip=[hinge[0]-uy*door.width*door.swing,hinge[1]+ux*door.width*door.swing];return <g key={door.id}><line x1={hinge[0]} y1={h-hinge[1]} x2={end[0]} y2={h-end[1]} stroke="white" strokeWidth={Math.max(wall.thickness+.1,lineWidth*3)} pointerEvents="none"/><path d={`M${screen(end).join(',')} Q${screen([end[0]+tip[0]-hinge[0],end[1]+tip[1]-hinge[1]]).join(',')} ${screen(tip).join(',')}`} stroke="#cb842b" fill="none" strokeWidth={lineWidth} pointerEvents="none"/><line x1={hinge[0]} y1={h-hinge[1]} x2={tip[0]} y2={h-tip[1]} stroke="#c87918" strokeWidth={selection?.id===door.id?lineWidth*3:lineWidth*2} pointerEvents="none"/><line x1={hinge[0]} y1={h-hinge[1]} x2={end[0]} y2={h-end[1]} stroke="#e59a37" strokeWidth="12" opacity=".65" vectorEffect="non-scaling-stroke" data-id={door.id} data-kind="doors"/><circle cx={center[0]} cy={h-center[1]} r={radius*.5} fill="#a65e10" data-id={door.id} data-kind="doors"/></g>;})}
  {start&&cursor&&tool==='wall'&&<g pointerEvents="none"><line x1={start[0]} y1={h-start[1]} x2={cursor[0]} y2={h-cursor[1]} stroke="#286aab" strokeWidth={lineWidth} strokeDasharray={`${radius} ${radius*.5}`}/><text x={(start[0]+cursor[0])/2} y={h-(start[1]+cursor[1])/2-radius} fontSize={radius*1.8} fill="#174b7e" textAnchor="middle">{Math.hypot(cursor[0]-start[0],cursor[1]-start[1]).toFixed(2)} m</text></g>}
  {start&&cursor&&tool==='region'&&<rect x={Math.min(start[0],cursor[0])} y={h-Math.max(start[1],cursor[1])} width={Math.abs(start[0]-cursor[0])} height={Math.abs(start[1]-cursor[1])} fill="#4b9e6a25" stroke="#4b9e6a" strokeWidth={lineWidth} pointerEvents="none"/>}
  {start&&<circle cx={start[0]} cy={h-start[1]} r={radius*.65} fill={tool==='region'?'#3c8357':'#286aab'} pointerEvents="none"/>}
 </svg><div className="geometry-canvas-status">{cursor?`X ${cursor[0].toFixed(2)} · Y ${cursor[1].toFixed(2)} m`:floor} {start?(fr?'· cliquez le point suivant':'· click the next point'):''}</div><div className="calibration-zoom"><button className="ghost" onClick={()=>zoom(.75)} aria-label={fr?'Zoom avant du dessin':'Zoom drawing in'}>+</button><button className="ghost" onClick={()=>zoom(1.33)} aria-label={fr?'Zoom arrière du dessin':'Zoom drawing out'}>−</button><button className="ghost" onClick={()=>setView({x:-2,y:-2,w:w+4,h:h+4})}>{fr?'Tout l’étage':'Whole floor'}</button>{selectedRoom&&<button className="ghost" onClick={centerRoom}>{fr?'Centrer sur la salle':'Center on room'}</button>}</div></div>;
}
