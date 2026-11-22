/* Testien GitHub: muistissa oleva repo, sama rajapinta kuin appi käyttää (repo, trees, blobs, contents and atomic Git commits). */
(function(){
var R=window.__repo={files:{},log:[]};try{var o=JSON.parse(sessionStorage.getItem('__repo')||'null');if(o){R.files=o;R.kept=true;}}catch(e){}
function keep(){try{sessionStorage.setItem('__repo',JSON.stringify(R.files));}catch(e){}}
function sha(t){var h=0;for(var i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))|0;return 's'+(h>>>0).toString(16)+t.length;}
function b64e(s){return btoa(unescape(encodeURIComponent(s)));}function b64d(b){return decodeURIComponent(escape(atob(b)));}
R.put=function(p,t){R.files[p]={t:t,sha:sha(t)};keep();};R.get=function(p){return R.files[p]&&R.files[p].t;};
function resp(st,j){return Promise.resolve(new Response(JSON.stringify(j||{}),{status:st,headers:{'Content-Type':'application/json'}}));}
var trees={},commits={},serial=0;
function treeOf(files){return Object.keys(files).map(function(p){return {path:p,type:'blob',mode:'100644',sha:files[p].sha,size:files[p].t.length};});}
function branchHead(){
  var key=JSON.stringify(R.files),id=sha(key);
  if(!commits[id]){trees[id]=JSON.parse(key);commits[id]={tree:{sha:id}};}
  return id;
}
var of=window.fetch;window.fetch=function(u,o){u=String(u);if(u.indexOf('https://api.github.com/repos/')!==0)return of.apply(this,arguments);
  o=o||{};var m=(o.method||'GET'),path=u.replace(/^https:\/\/api\.github\.com\/repos\/[^/]+\/[^/?]+/,'').replace(/[?&]t=\d+/,'').replace(/\?$/,''),b=o.body?JSON.parse(o.body):null;
  R.log.push(m+' '+decodeURIComponent(path.split('?')[0]));
  if(path===''||path==='?')return resp(200,{private:true,default_branch:'main',full_name:'testi/vault'});
  if(m==='GET'&&/^\/git\/ref\/heads\//.test(path))return resp(200,{object:{sha:branchHead()}});
  if(m==='GET'&&/^\/git\/commits\//.test(path)){
    var commit=commits[path.split('/').pop()];
    return commit?resp(200,commit):resp(404);
  }
  if(/^\/git\/trees\//.test(path)){
    var treeId=path.split('/').pop().split('?')[0],files=treeId==='main'?R.files:trees[treeId];
    if(!files)return resp(404);
    if(!Object.keys(files).length)return resp(409);
    return resp(200,{sha:treeId,tree:treeOf(files)});
  }
  if(m==='POST'&&path==='/git/trees'){
    var snapshot=Object.assign({},trees[b.base_tree]),treeKey='tree-'+(++serial);
    if(!trees[b.base_tree])return resp(422);
    b.tree.forEach(function(e){snapshot[e.path]={t:e.content,sha:sha(e.content)};});
    trees[treeKey]=snapshot;
    return resp(201,{sha:treeKey,tree:treeOf(snapshot)});
  }
  if(m==='POST'&&path==='/git/commits'){
    if(!trees[b.tree]||!commits[b.parents[0]])return resp(422);
    var commitKey=sha(JSON.stringify(trees[b.tree]));
    commits[commitKey]={sha:commitKey,tree:{sha:b.tree},parent:b.parents[0]};
    return resp(201,commits[commitKey]);
  }
  if(m==='PATCH'&&/^\/git\/refs\/heads\//.test(path)){
    var next=commits[b.sha];
    if(!next||next.parent!==branchHead()||b.force!==false)return resp(409);
    R.files=Object.assign({},trees[next.tree.sha]);keep();
    return resp(200,{object:{sha:b.sha}});
  }
  var bm=/^\/git\/blobs\/(.+)$/.exec(path);if(bm){
    for(var t in trees)for(var p in trees[t])if(trees[t][p].sha===bm[1])return resp(200,{content:b64e(trees[t][p].t)});
    for(var p in R.files)if(R.files[p].sha===bm[1])return resp(200,{content:b64e(R.files[p].t)});
    return resp(404);
  }
  var cm=/^\/contents\/([^?]+)/.exec(path);if(cm){var fp=decodeURIComponent(cm[1]),cur=R.files[fp];
    if(m==='GET')return cur?resp(200,{sha:cur.sha,content:b64e(cur.t)}):resp(404);
    if(m==='PUT'){if(cur&&b.sha!==cur.sha)return resp(409,{});if(!cur&&b.sha)return resp(404);R.put(fp,b64d(b.content));return resp(cur?200:201,{content:{sha:R.files[fp].sha}});}
    if(m==='DELETE'){if(!cur)return resp(404);if(b.sha!==cur.sha)return resp(409);delete R.files[fp];keep();return resp(200,{});}}
  return resp(404);};
})();
