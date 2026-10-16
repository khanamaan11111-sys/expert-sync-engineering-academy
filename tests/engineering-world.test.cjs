const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const home=fs.readFileSync('index.html','utf8');
const directory=fs.readFileSync('engineering-world-pathways.html','utf8');
const detail=fs.readFileSync('engineering-pathway.html','utf8');
const ids=['civil','eee','mechanical','cse','ece','chemical','aerospace'];
test('homepage exposes Engineering World in navigation and hero',()=>{
 assert.ok(home.includes('<a href="engineering-world-pathways.html">Engineering World</a>'));
 assert.ok(home.includes('href="engineering-world-pathways.html">Explore Engineering World'));
});
test('seven branch links match actual detail records',()=>{
 for(const id of ids){
  assert.ok(directory.includes('engineering-pathway.html?branch='+id),'missing directory link: '+id);
  assert.ok(detail.includes(id+':{name:'),'missing branch content: '+id);
 }
});
test('local HTML navigation targets exist',()=>{
 for(const [filename,html] of [['index.html',home],['engineering-world-pathways.html',directory],['engineering-pathway.html',detail]]){
  for(const match of html.matchAll(/\bhref="([^"]+)"/g)){
   const href=match[1];
   if(href.startsWith('#')||/^(https?:|mailto:|tel:|javascript:)/.test(href))continue;
   const pathname=decodeURIComponent(href.split(/[?#]/)[0]);
   if(!pathname||!pathname.endsWith('.html'))continue;
   assert.ok(fs.existsSync(pathname),filename+' has missing destination: '+href);
  }
 }
});
test('inline scripts parse as JavaScript',()=>{
 for(const [filename,html] of [['engineering-world-pathways.html',directory],['engineering-pathway.html',detail]]){
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  assert.ok(scripts.length,filename+' has no script');
  for(const [,code] of scripts)new vm.Script(code,{filename});
 }
});
test('mobile viewport and accessible search controls are present',()=>{
 for(const html of [directory,detail])assert.ok(html.includes('name="viewport"'));
 assert.ok(directory.includes('aria-label="Search engineering branches"'));
 assert.ok(directory.includes('aria-live="polite"'));
});