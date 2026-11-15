import {useEffect,useRef,useState} from 'react';
import {useSession} from './auth';
import {validDiscoveryCountry} from './publicDiscovery';
export const countryPreferenceKey='flixie-cinema-country';
const detectionKey='flixie-detected-country';
type Source='account-fallback'|'account'|'manual'|'detected'|'fallback'|'loading';
type Choice={owner:string;country:string;source:Source};
function preference():string|null {try{return validDiscoveryCountry(localStorage.getItem(countryPreferenceKey));}catch{return null;}}
function cachedCountry():string|null {
  try {const row=JSON.parse(sessionStorage.getItem(detectionKey)??'null');
    return row&&typeof row.at==='number'&&row.at<=Date.now()&&Date.now()-row.at<3600000?validDiscoveryCountry(row.country):null;
  }catch{return null;}
}
/** Saved account country wins across sign-in/switches; guest overrides beat IP. */
export function useBrowseCountry() {
  const {api,user,identity,loading}=useSession();
  const owner=user?`account:${user.id}:${user.country}`:identity?`pending:${identity.uid}`:'guest';
  const [choice,setChoice]=useState<Choice|null>(null),[detected,setDetected]=useState<Choice|null>(null);
  const generation=useRef(0);
  useEffect(()=>{
    const version=++generation.current,controller=new AbortController();
    setChoice(null);setDetected(null);
    if(user||identity||loading)return ()=>controller.abort();
    const manual=preference(),cached=cachedCountry();
    if(manual)setChoice({owner,country:manual,source:'manual'});
    else if(cached)setDetected({owner,country:cached,source:'detected'});
    else void api.detectedCountry(controller.signal).then(country=>{
      if(controller.signal.aborted||generation.current!==version)return;
      setDetected({owner,country:country??'GB',source:country?'detected':'fallback'});
      if(country)try{sessionStorage.setItem(detectionKey,JSON.stringify({country,at:Date.now()}));}catch{}
    }).catch(()=>{
      if(!controller.signal.aborted&&generation.current===version)setDetected({owner,country:'GB',source:'fallback'});
    });
    return ()=>controller.abort();
  },[api,owner,loading]);
  const manual=choice?.owner===owner?choice:null;
  const account=validDiscoveryCountry(user?.country);
  const guest=detected?.owner===owner?detected:null;
  const current=manual??(user?{owner,country:account??'GB',source:account?'account' as const:'account-fallback' as const}:guest);
  const country=current?.country??'GB',source=current?.source??'loading';
  function chooseCountry(value:string) {
    const next=validDiscoveryCountry(value);if(!next)return;
    ++generation.current;setChoice({owner,country:next,source:'manual'});
    if(!user&&!identity)try{localStorage.setItem(countryPreferenceKey,next);}catch{}
  }
  return {country,source,ready:source!=='loading',chooseCountry};
}
