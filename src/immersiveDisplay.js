// A denied/unsupported Fullscreen API still offers an in-window focus view.
export async function expandImmersion(element,doc=document){
 if(doc.fullscreenElement===element)return 'native';
 try{
  if(typeof element.requestFullscreen==='function'){
   await element.requestFullscreen();
   if(doc.fullscreenElement===element)return 'native';
  }
 }catch{/* Embedded browsers may disallow native fullscreen. */}
 return 'window';
}

export async function collapseImmersion(element,doc=document){
 if(doc.fullscreenElement===element&&typeof doc.exitFullscreen==='function'){
  try{await doc.exitFullscreen();}catch{return false;}
 }
 return doc.fullscreenElement!==element;
}
