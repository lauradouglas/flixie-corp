import { film, list, object, person, text, type Person, type Pick } from './models';
export interface PickGroup { id:string;name:string;members:Person[] }
export interface PickPreferences { viewer:{type:'solo'}|{type:'friend'|'group';id:string};mood:string;maxMinutes:number|null;venue:'streaming'|'cinema';watching:'together'|'separately';openToRent:boolean;request:string;allowRewatches:boolean;avoid:string[];genreIds?:number[];genreMatch?:'any'|'all';originalLanguages?:string[];excludeMovieIds?:number[] }
export const pickGenres:Record<number,string>={28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-fi',53:'Thriller',10752:'War',37:'Western'};
export function pickRequest(p:PickPreferences){
  if((p.genreIds??[]).length>3||(p.genreIds??[]).some(id=>!Object.hasOwn(pickGenres,id))||!['any','all'].includes(p.genreMatch??'any')||(p.originalLanguages??[]).length>187||(p.originalLanguages??[]).some(code=>!(/^[a-z]{2}$/.test(code)))||(p.excludeMovieIds??[]).length>60||(p.excludeMovieIds??[]).some(id=>!Number.isSafeInteger(id)||id<1))throw new Error('Check your genres, languages and previously shown films.');
  if(!['solo','friend','group'].includes(p.viewer.type)||(p.viewer.type!=='solo'&&!p.viewer.id.trim())||!['any','switch_off','feel_good','laugh','hooked','feel_something','escape','challenged','scared'].includes(p.mood)||!(p.maxMinutes===null||[90,120,150,180,240].includes(p.maxMinutes))||p.request.length>300||p.avoid.some(v=>!['bleak','horror','violence','heavy'].includes(v))||!['streaming','cinema'].includes(p.venue)||!['together','separately'].includes(p.watching)||(p.viewer.type==='solo'&&p.watching!=='together')||(p.venue==='cinema'&&p.watching!=='together')||(p.openToRent&&(p.watching!=='together'||p.venue!=='streaming')))throw new Error('Check who is watching and your viewing preferences.');
  return { ...(p.viewer.type==='friend'?{friendId:p.viewer.id}:p.viewer.type==='group'?{groupId:p.viewer.id}:{}),mood:p.mood,maxMinutes:p.maxMinutes,venue:p.venue,watching:p.watching,openToRent:p.openToRent,request:p.request.trim(),allowRewatches:p.allowRewatches,avoid:[...new Set(p.avoid)],includePossible:true,includeUnknownContent:false,genreIds:[...new Set(p.genreIds??[])],genreMatch:p.genreMatch??'any',originalLanguages:[...new Set(p.originalLanguages??[])],...((p.excludeMovieIds??[]).length?{excludeMovieIds:[...new Set(p.excludeMovieIds)]}:{}) };
}
export function pickGroups(value:unknown,ownerId:string):PickGroup[]{
  if(!Array.isArray(value))throw new Error('Your groups could not be loaded.');
  return value.map(value=>{const g=object(value),id=text(g.id);const members=list(g.members).filter(v=>text(object(v).inviteStatus).toUpperCase()==='ACCEPTED').map(v=>person(object(v).user));return{id,name:text(g.name,'Your group'),members};}).filter(g=>g.id&&g.members.some(p=>p.id===ownerId)&&g.members.length>=2&&g.members.length<=12);
}
export function pickResults(value:unknown){
  const row=object(value);if(!Array.isArray(row.choices))throw new Error('Your picks could not be loaded. Please try again.');
  const choices:Pick[]=row.choices.map(value=>{const p=object(value),availability=object(p.availability);return{film:{...film(p),raw:{}},reasons:list(p.reasonDetails).map(v=>text(object(v).text)).filter(Boolean),offers:[...new Set(list(availability.viewers).flatMap(value=>{
    const v=object(value),region=text(v.region);if(v.check==='unavailable')return[`Availability could not be checked${region?` in ${region}`:''}.`];
    if(v.check!=='checked')return[];
    return list(v.offers).flatMap(value=>{const o=object(value),name=text(o.providerName),type=text(o.type);if(!name||!['subscription','free','ads','rent'].includes(type))return[];return[`${name}${text(o.region)?` · ${text(o.region)}`:''} · ${{subscription:'Subscription',free:'Free',ads:'With ads',rent:'Rental fee applies'}[type]}`];});
  }))]};});
  const search=object(row.search);return{choices,message:text(row.message),outcome:text(search.outcome),incomplete:list(search.issues).length>0};
}
