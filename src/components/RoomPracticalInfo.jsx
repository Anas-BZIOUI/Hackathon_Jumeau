export default function RoomPracticalInfo({room,lang}){
 const fr=lang==='fr';
 return <div className="room-practical-info">
  {room.equipment?.length>0&&<p><strong>{fr?'Équipement':'Equipment'}</strong><br/>{room.equipment.join(' · ')}</p>}
  {room.opening_hours&&<p><strong>{fr?'Horaires / accès':'Hours / access'}</strong><br/>{room.opening_hours}</p>}
  {room.resources?.length>0&&<ul>{room.resources.map((r,i)=><li key={i}><a href={r.href} target="_blank" rel="noreferrer">{r.label} ↗</a></li>)}</ul>}
  {room.information_source&&<small>{fr?'Source':'Source'} : {room.information_source}</small>}
 </div>;
}
