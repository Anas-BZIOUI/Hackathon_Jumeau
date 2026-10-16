const KEYS=['rooms','floors','links','graph','tours','metro','synonyms','zones','resources','walls','doors'];
export async function fetchJson(url,{fetcher=fetch,signal,timeout=5000}={}){
 const controller=new AbortController(),abort=()=>controller.abort();
 if(signal?.aborted)controller.abort();else signal?.addEventListener('abort',abort,{once:true});
 const timer=setTimeout(abort,timeout);
 try{const response=await fetcher(url,{signal:controller.signal});if(!response.ok)throw Error(`Unavailable: ${url}`);return await response.json();}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
export async function loadDataset(options={}){
 try{
  const data=await fetchJson('/api/bootstrap',{...options,timeout:1500});
  if(!Array.isArray(data.rooms)||!data.floors?.levels||KEYS.filter(k=>!['walls','doors'].includes(k)).some(k=>!(k in data)))throw Error('Invalid bootstrap');
  const [walls,doors]=await Promise.all(['walls','doors'].map(name=>fetchJson(`/data/${name}.json`,options)));
  return {...data,walls,doors};
 }catch(error){if(options.signal?.aborted)throw error;}
 const entries=await Promise.all(KEYS.map(async key=>[key,await fetchJson(`/data/${key}.json`,options)]));
 const data=Object.fromEntries(entries);
 if(!Array.isArray(data.rooms)||!data.floors?.levels)throw Error('Invalid dataset');
 return data;
}
