import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { assertHostingBudget, freeTierBudget } from './lib/hosting-budget.mjs';
let files=0,storageBytes=0;
async function walk(directory){for(const entry of await readdir(directory,{withFileTypes:true})){
  const path=`${directory}/${entry.name}`;
  if(entry.isDirectory())await walk(path);
  else if(entry.isFile()){files++;storageBytes+=(await stat(path)).size;}
  else throw Error(`Unexpected deployment entry ${path}`);
}}
await walk('dist');
const routingBytes=(await readFile('dist/staticwebapp.config.json')).length;
// The workflow adds a tiny release marker after this check. Reserve space for it.
const measured={routingBytes,storageBytes:storageBytes+1024,files:files+1};
assertHostingBudget(measured);
await writeFile('.ssr/hosting-budget.json',JSON.stringify({measured,budget:freeTierBudget},null,2)+'\n');
console.log(`Azure Free budget passed: ${routingBytes} routing bytes; ${files} files; ${(storageBytes/1e6).toFixed(2)} MB deployed (release marker reserved separately).`);
