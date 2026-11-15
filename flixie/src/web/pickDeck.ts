import type { Pick } from './models';
export interface PickDeck { current:Pick|null;queue:Pick[];passed:Pick[];shown:number[] }
export const emptyDeck=():PickDeck=>({current:null,queue:[],passed:[],shown:[]});
export function fillDeck(previous:PickDeck,choices:Pick[],different=false):PickDeck {
  const base=different?previous:emptyDeck(),seen=new Set(base.shown);
  const fresh=choices.filter(p=>!seen.has(p.film.id)&&!!seen.add(p.film.id)).slice(0,Math.min(3,60-base.shown.length));
  if(different&&!fresh.length)return previous;
  return {current:fresh[0]??null,queue:fresh.slice(1),passed:different&&base.current?[...base.passed,base.current]:[],shown:[...base.shown,...fresh.map(p=>p.film.id)]};
}
export function passPick(deck:PickDeck):PickDeck {
  if(!deck.current||!deck.queue.length)return deck;
  return {...deck,current:deck.queue[0],queue:deck.queue.slice(1),passed:[...deck.passed,deck.current]};
}
export function undoPick(deck:PickDeck):PickDeck {
  if(!deck.passed.length)return deck;
  return {...deck,current:deck.passed.at(-1)!,passed:deck.passed.slice(0,-1),queue:deck.current?[deck.current,...deck.queue]:deck.queue};
}
