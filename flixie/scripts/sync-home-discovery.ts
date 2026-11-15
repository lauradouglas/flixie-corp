// Refresh only public discovery metadata; no credentials or user endpoints.
import {writeFile} from 'node:fs/promises';
import {discoveryFilms} from '../src/web/publicDiscovery';
const base=(process.env.FLIXIE_CATALOG_API_URL??'https://flixie-api-fmcehvaecwdheccm.northeurope-01.azurewebsites.net').replace(/\/$/,'');
const origin=new URL(base);
if(origin.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(origin.hostname))throw Error('Use HTTPS or the local backend.');
const feeds=await Promise.all((['movie','show'] as const).map(async kind=>{
  const response=await fetch(base+(kind==='movie'?'/movies/popular?region=GB':'/shows/popular'),{headers:{Accept:'application/json'},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error(`Public ${kind} discovery: ${response.status}`);
  return discoveryFilms(await response.json(),kind).map(({id,title,posterPath,releaseDate})=>({id,title,posterPath,releaseDate}));
}));
if(feeds.some(feed=>feed.length===0))throw Error('Retain the previous snapshot when a public feed is empty.');
await writeFile('src/catalog/discovery.json',JSON.stringify({updatedAt:new Date().toISOString().slice(0,10),region:'GB',movies:feeds[0],shows:feeds[1]},null,2)+'\n');
console.log(`Saved ${feeds[0].length} films and ${feeds[1].length} shows with public fields only.`);
