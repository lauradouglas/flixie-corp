import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { renderToStaticMarkup } from 'react-dom/server';
import WordmarkArtwork from '../src/components/WordmarkArtwork';
test('one outlined wordmark keeps the same font size and visible baseline for every letter',()=>{
 const markup=renderToStaticMarkup(<WordmarkArtwork alt="Flixie"/>);
 assert.equal((markup.match(/<img\b/g)??[]).length,1);assert(markup.includes('/web/flixie-wordmark-matched.png'));assert(!markup.includes('<svg'));assert(!markup.includes('transform'));
 const svg=readFileSync(new URL('../public/web/flixie-wordmark.svg',import.meta.url),'utf8');
 const height=Number(/viewBox="0 0 [\d.]+ ([\d.]+)"/.exec(svg)![1]);
 const paths=[...svg.matchAll(/<path fill="([^"]+)" d="([^"]+)"/g)];assert.equal(paths.length,6);
 assert.deepEqual(paths.map(p=>p[1]),['#fff','#fff','#fff','#fff','#7c4dff','#7c4dff']);
 for(const path of paths){const ys=[...path[2].matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map(p=>Number(p[2]));assert(Math.abs(Math.max(...ys)-75)<.002,'each visible letter bottom aligns exactly');}
 const source=readFileSync(new URL('./build-wordmark.swift',import.meta.url),'utf8');assert(source.includes('CTFontCreateWithFontDescriptor(descriptor,100,nil)'));assert(!svg.includes('<text'));assert(!svg.includes('<image'));
});

test('the rendered single PNG preserves a shared opaque bottom row for both colours',()=>{
 const png=readFileSync(new URL('../public/web/flixie-wordmark-matched.png',import.meta.url));
 const width=png.readUInt32BE(16),height=png.readUInt32BE(20);assert.equal(width,576);assert.equal(height,192);assert.equal(png[24],8);assert.equal(png[25],6);
 const chunks:Buffer[]=[];for(let offset=8;offset<png.length;){const length=png.readUInt32BE(offset);if(png.toString('ascii',offset+4,offset+8)==='IDAT')chunks.push(png.subarray(offset+8,offset+8+length));offset+=length+12;}
 const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,decoded=Buffer.alloc(stride*height);
 const paeth=(a:number,b:number,c:number)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];for(let x=0;x<stride;x++){const at=y*stride+x,left=x>=4?decoded[at-4]:0,up=y?decoded[at-stride]:0,corner=y&&x>=4?decoded[at-stride-4]:0;const predictor=[0,left,up,Math.floor((left+up)/2),paeth(left,up,corner)][filter];assert.notEqual(predictor,undefined);decoded[at]=(raw[y*(stride+1)+x+1]+predictor)&255;}}
 let white=-1,purple=-1;for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;if(decoded[i+3]<205)continue;const r=decoded[i],g=decoded[i+1],b=decoded[i+2];if(r>220&&g>220&&b>220)white=y;else if(b>180&&r>60&&g<150)purple=y;}
 assert.equal(white,179);assert.equal(purple,white,'both colour sections have the same opaque last row before browser scaling');
});
