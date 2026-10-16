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
test('each branch has four-step roadmap and browser-local progress support',()=>{
 assert.ok(detail.includes('id="roadmap"'));
 assert.ok(detail.includes('id="checklist"'));
 assert.ok(detail.includes('role="progressbar"'));
 assert.ok(detail.includes('expert-sync-pathway-v1-'));
 for(const word of ['Learn','Practice','Build','Present'])assert.ok(detail.includes('["'+word+'",'));
});

test('next-action recommendation follows first unfinished step',()=>{
 assert.ok(detail.includes('id="next-action"'));
 assert.ok(detail.includes('tasks.findIndex((_,i)=>!completed.has(i))'));
 assert.ok(detail.includes('Roadmap complete. Add your project evidence'));
 assert.ok(detail.includes('href="./project-idea-studio.html"'));
});

test('directory displays per-branch and overall browser-local progress',()=>{
 assert.ok(directory.includes('id="overview"'));
 assert.ok(directory.includes('function readProgress(url)'));
 assert.ok(directory.includes('className="mini-progress"'));
 assert.ok(directory.includes('window.addEventListener("pageshow",render)'));
});

test('directory offers a versioned progress backup for seven branches',()=>{
 assert.ok(directory.includes('id="export-progress"'));
 assert.ok(directory.includes('expert-sync-engineering-progress'));
 assert.ok(directory.includes('URL.createObjectURL(blob)'));
 assert.ok(directory.includes('records[id]=values'));
});

test('progress restore validates backup and asks before replacement',()=>{
 assert.ok(directory.includes('id="import-progress"'));
 assert.ok(directory.includes('data.version!==1'));
 assert.ok(directory.includes('Object.keys(data.branches).length!==allowed.length'));
 assert.ok(directory.includes('Current progress in this browser will be replaced'));
 assert.ok(directory.includes('Progress restored successfully for seven branches'));
});

test('single-branch progress reset asks for confirmation and refreshes UI',()=>{
 assert.ok(detail.includes('id="reset-progress"'));
 assert.ok(detail.includes('completed.clear()'));
 assert.ok(detail.includes('You can export a backup from Engineering World first.'));
 assert.ok(detail.includes('Progress reset for '));
});

test('all pathways offer a project brief with deliverables and safety guidance',()=>{
 assert.ok(detail.includes('id="deliverables"'));
 assert.ok(detail.includes('id="download-brief"'));
 assert.ok(detail.includes('expert-sync-"+id+"-project-brief.txt'));
 assert.ok(detail.includes('do not work on live equipment without qualified supervision'));
});
