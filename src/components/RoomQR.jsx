import {useEffect,useState} from 'react';
import QRCode from 'qrcode';
import {roomName} from '../core.js';
export default function RoomQR({room,lang}){
 const [src,setSrc]=useState(''),[error,setError]=useState(false),fr=lang==='fr';
 const url=location.origin+location.pathname+'#/room/'+encodeURIComponent(room.id);
 useEffect(()=>{let active=true;setSrc('');setError(false);QRCode.toDataURL(url,{width:180,margin:4,errorCorrectionLevel:'M'}).then(v=>{if(active)setSrc(v);}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[url]);
 return <details className="room-qr"><summary>{fr?'QR code et fiche imprimable':'QR code and printable room card'}</summary>{src&&<div className="room-print-card"><h3>{roomName(room,lang)}</h3><p>{room.level} · {room.id}</p><img src={src} width="180" height="180" alt={fr?'QR code du lien vers cette salle':'QR code linking to this room'}/><p>{url}</p><small>{fr?'Lien privé : le téléphone doit pouvoir accéder à cette adresse. localhost ne fonctionne que sur cet ordinateur.':'Private link: the phone must be able to reach this address. localhost only works on this computer.'}</small></div>}{error&&<p role="alert">{fr?'QR code indisponible ; utilisez le lien de la salle.':'QR code unavailable; use the room link.'}</p>}<button className="ghost" disabled={!src} onClick={()=>window.print()}>{fr?'Imprimer cette fiche':'Print this card'}</button></details>;
}
