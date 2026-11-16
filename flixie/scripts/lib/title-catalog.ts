import { film, object, type MediaKind } from '../../src/web/models';
import type { CatalogTitle } from '../../src/catalog';

export interface TitleReference { kind: MediaKind; id: number }
const key = ({kind,id}:TitleReference) => `${kind}/${id}`;
class IncompleteTitleError extends Error {}

/** Copy public facts only. Scores, people, reviews and availability stay live. */
export function publicTitle(value: unknown, expected: TitleReference): CatalogTitle {
  const raw=object(value);
  if(raw.id!==expected.id)throw Error(`${key(expected)}: mismatched public title`);
  const title=film(raw,expected.kind);
  if(!title.title.trim() || title.title==='Untitled' || !title.overview.trim() ||
    title.title.length>500 || title.overview.length>12000 ||
    !/^\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/i.test(title.posterPath) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(title.releaseDate) ||
    Number.isNaN(Date.parse(title.releaseDate)) || title.genres.length===0)
    throw new IncompleteTitleError(`${key(expected)}: incomplete public metadata`);
  return {id:title.id,kind:title.kind,title:title.title.trim(),posterPath:title.posterPath,
    releaseDate:title.releaseDate,runtime:title.runtime!==null&&title.runtime>0?title.runtime:null,
    overview:title.overview.trim(),tagline:title.tagline,genres:title.genres};
}

/** Retain published URLs, then interleave public discovery feeds without duplicates. */
export function titleCandidates(previous: TitleReference[], feeds: TitleReference[][]): TitleReference[] {
  const seen=new Set<string>(), result:TitleReference[]=[];
  const add=(row:TitleReference)=>{
    if(!['movie','show'].includes(row.kind)||!Number.isSafeInteger(row.id)||row.id<1||row.id>2147483647)
      throw Error('Invalid public catalogue reference');
    if(!seen.has(key(row))){seen.add(key(row));result.push({kind:row.kind,id:row.id});}
  };
  previous.forEach(add);
  for(let i=0;i<Math.max(0,...feeds.map(feed=>feed.length));i++)for(const feed of feeds)if(feed[i])add(feed[i]);
  return result;
}

/** Bound backend requests; retain ordering and abort the refresh on any failure. */
export async function fetchTitles(references:TitleReference[], load:(row:TitleReference)=>Promise<unknown>):Promise<CatalogTitle[]> {
  const output:CatalogTitle[]=new Array(references.length);
  let cursor=0,failed=false;
  await Promise.all(Array.from({length:Math.min(3,references.length)},async()=>{
    while(!failed&&cursor<references.length){
      const index=cursor++;
      try{
        try{output[index]=publicTitle(await load(references[index]),references[index]);}
        catch(error){
          // The backend attaches genres on the read after a new movie import.
          // One reread is bounded; persistent incomplete records still block publication.
          if(!(error instanceof IncompleteTitleError))throw error;
          output[index]=publicTitle(await load(references[index]),references[index]);
        }
      }
      catch(error){failed=true;throw error;}
    }
  }));
  return output;
}

export async function expandMovies(previous:CatalogTitle[],feeds:TitleReference[][],target:number,load:(row:TitleReference)=>Promise<unknown>):Promise<CatalogTitle[]> {
  const movies=previous.filter(t=>t.kind==='movie');
  if(movies.length>target||feeds.some(feed=>feed.some(t=>t.kind!=='movie')))
    throw Error('Movie-only expansion must retain published films and cannot add TV pages.');
  const selected=titleCandidates(movies,feeds).slice(0,target);
  if(selected.length<target)throw Error(`Only ${selected.length} distinct films; previous snapshot retained.`);
  return [...await fetchTitles(selected,load),...previous.filter(t=>t.kind==='show')];
}
