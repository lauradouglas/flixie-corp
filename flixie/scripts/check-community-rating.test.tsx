import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import CommunityRating from '../src/web/CommunityRating';
import { film } from '../src/web/models';

test('the primary rating label stays neutral; provenance is opt-in for either source',()=>{
  for(const count of [4,40]){
    const title=film({id:348,title:'Alien',voteAverage:8.4,voteCount:count,tmdbVoteAverage:8,tmdbVoteCount:15000});
    const html=renderToStaticMarkup(<CommunityRating film={title}/>), primary=html.split('<details')[0];
    assert(primary.includes('Community rating'));assert(!primary.includes('TMDB'));assert(!primary.includes('Flixie community'));
    assert(html.includes('<summary>'));assert(html.includes('About this rating'));
    if(count===4){assert(primary.includes('15,000'));assert(html.includes('supplied by TMDB'));assert(html.includes('can include Flixie members'));assert(html.includes('updates can take time'));}
    else {assert(primary.includes('40'));assert(html.includes('average from Flixie members'));assert(!html.includes('supplied by TMDB'));}
  }
});
test('missing ratings do not invent an average, vote count or explanation',()=>{
  const html=renderToStaticMarkup(<CommunityRating film={film({id:348,title:'Alien'})}/>);
  assert(html.includes('No rating yet.'));assert(!html.includes('<details'));assert(!html.includes('/10'));
});
