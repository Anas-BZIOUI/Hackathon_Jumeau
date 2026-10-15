import {createGeometryRouter} from './geometryRouter.js';
let router=null;
self.onmessage=({data})=>{
 try{
  if(data.type==='init'){router=createGeometryRouter(data.input);return;}
  if(data.type==='audit'){
   const results=[];
   for(const room of data.rooms.filter(r=>r.type!=='circulation')){
    const origin=data.origins[room.level];if(!origin){results.push({roomId:room.id,reachable:null});continue;}
    const outward=room.id===origin||!!router.route(origin,room.id),returning=room.id===origin||!!router.route(room.id,origin);
    const doors=(router.scene.doors[room.level]||[]).filter(d=>d.roomId===room.id);
    results.push({roomId:room.id,origin,reachable:outward&&returning,outward,returning,doorCount:doors.length,clearDoorCount:doors.filter(d=>router.scene.maps[room.level].clear(...d.center)).length});
   }
   self.postMessage({id:data.id,audit:results});return;
  }
  if(data.type==='route'){const route=router?.route(data.from,data.to,{stepFree:data.stepFree,startPosition:data.startPosition});self.postMessage({id:data.id,route:route||null});}
 }catch(error){self.postMessage({id:data.id,route:null,error:String(error.message)});}
};
