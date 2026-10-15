import {useEffect,useState} from 'react';
export function readSaved(key,fallback,validate=()=>true){try{const value=JSON.parse(localStorage.getItem(key));return value!=null&&validate(value)?value:fallback;}catch{return fallback;}}
export function useSaved(key,fallback,validate){
 const [value,setValue]=useState(()=>readSaved(key,fallback,validate));
 useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Session state remains usable when storage is unavailable. */}},[key,value]);
 return [value,setValue];
}
