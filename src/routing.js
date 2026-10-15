import {shortestPath} from './core.js';
import {calculateIndoorRoute} from './navigation.js';

// Keep the incoming hand-authored pilot routes without dropping the other floors.
export function resolveRoute(graph,from,to,{stepFree=false}={}){
 const pilot=calculateIndoorRoute(from,to);
 if(pilot)return {...pilot,steps:[],stepFree}; // The pilot contains same-floor walking edges only.
 const route=shortestPath(graph,from,to,{stepFree});
 return route?{...route,provisional:true}:null;
}
