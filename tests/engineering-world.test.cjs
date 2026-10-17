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

test('branch project notes are browser-local and downloadable',()=>{
 assert.ok(detail.includes('id="project-notes"'));
 assert.ok(detail.includes('maxlength="10000"'));
 assert.ok(detail.includes('expert-sync-project-notes-v1-'));
 assert.ok(detail.includes('id="download-notes"'));
 assert.ok(detail.includes('Notes stay in this browser; they are not included in the progress JSON backup.'));
});

test('full study backup includes validated progress and project notes',()=>{
 assert.ok(directory.includes('id="export-study"'));
 assert.ok(directory.includes('id="import-study"'));
 assert.ok(directory.includes('expert-sync-engineering-study'));
 assert.ok(directory.includes('expert-sync-project-notes-v1-'));
 assert.ok(directory.includes('note.length>10000'));
 assert.ok(directory.includes('Existing progress and project notes for all seven branches will be replaced. Version 2 also replaces quiz scores.'));
});

test('personal study summary is downloadable and not presented as a certificate',()=>{
 assert.ok(directory.includes('id="download-summary"'));
 assert.ok(directory.includes('expert-sync-study-summary.txt'));
 assert.ok(directory.includes('Overall progress: '));
 assert.ok(directory.includes('not an accredited certificate or placement guarantee'));
});

test('all seven branches provide three-question knowledge checks',()=>{
 const quiz=fs.readFileSync('engineering-knowledge-check.html','utf8');
 assert.ok(detail.includes('id="knowledge-check-link"'));
 assert.ok(detail.includes('engineering-knowledge-check.html?branch='));
 for(const id of ids)assert.ok(quiz.includes(id+':{name:'),'missing quiz: '+id);
 assert.ok(quiz.includes('Your score: '));
 assert.ok(quiz.includes('Correct answer: '));
 const scripts=[...quiz.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.ok(scripts.length);
 for(const [,script] of scripts)assert.doesNotThrow(()=>new vm.Script(script));
});

test('latest knowledge-check scores save locally and appear in directory',()=>{
 const quiz=fs.readFileSync('engineering-knowledge-check.html','utf8');
 assert.ok(quiz.includes('expert-sync-quiz-score-v1-'));
 assert.ok(quiz.includes('Latest score saved in this browser'));
 assert.ok(directory.includes('Latest knowledge check: '));
 assert.ok(directory.includes('Knowledge check: not attempted'));
 const scripts=[...quiz.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 for(const [,script] of scripts)assert.doesNotThrow(()=>new vm.Script(script));
});

test('full study backup v2 includes quiz scores and restores v1 files',()=>{
 assert.ok(directory.includes('version:2,exportedAt:'));
 assert.ok(directory.includes('scores[id]={score:saved.score}'));
 assert.ok(directory.includes('![1,2].includes(data.version)'));
 assert.ok(directory.includes('data.version===2&&!validKeys(data.scores)'));
 assert.ok(directory.includes('localStorage.removeItem("expert-sync-quiz-score-v1-"+id)'));
 assert.ok(directory.includes('if(data.version===2){if(prepared[id].score===null)'));
});

test('downloadable study summary includes latest knowledge-check scores',()=>{
 assert.ok(directory.includes('lines.push(b.name+": "+done+"/4 steps completed", "Latest knowledge check: "+scoreText'));
 assert.ok(directory.includes('let scoreText="Not attempted"'));
});

test('knowledge check supports feedback and an explicit retry without erasing saved score',()=>{
 const quiz=fs.readFileSync('engineering-knowledge-check.html','utf8');
 assert.ok(quiz.includes('id="retry"'));
 assert.ok(quiz.includes('Review the explanations above'));
 assert.ok(quiz.includes('input.checked=false;input.disabled=false'));
 assert.ok(quiz.includes('retry.hidden=false'));
 const scripts=[...quiz.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 for(const [,script] of scripts)assert.doesNotThrow(()=>new vm.Script(script));
});
