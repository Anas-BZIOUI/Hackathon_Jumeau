import {useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
export default function PrintVisit({text,lang,onClose}){
 const ref=useRef(null),fr=lang==='fr';
 useEffect(()=>{const previous=document.activeElement;ref.current.showModal();document.body.classList.add('printing-visit');return()=>{document.body.classList.remove('printing-visit');previous?.focus();};},[]);
 return createPortal(<dialog ref={ref} className="visit-print-dialog" aria-label={fr?'Aperçu de la visite':'Visit preview'} onCancel={onClose}><div className="actions"><button className="primary" onClick={()=>window.print()}>{fr?'Imprimer / PDF':'Print / PDF'}</button><button className="ghost" onClick={onClose}>{fr?'Fermer':'Close'}</button></div><pre className="visit-print-content">{text}</pre></dialog>,document.body);
}
