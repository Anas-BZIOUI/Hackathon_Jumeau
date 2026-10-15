import {createGeometryRouter} from './geometryRouter.js';
let router=null;
self.onmessage=({data})=>{
 try{
  if(data.type==='init'){router=createGeometryRouter(data.input);return;}
  if(data.type==='route'){const route=router?.route(data.from,data.to,{stepFree:data.stepFree,startPosition:data.startPosition});self.postMessage({id:data.id,route:route||null});}
 }catch(error){self.postMessage({id:data.id,route:null,error:String(error.message)});}
};
