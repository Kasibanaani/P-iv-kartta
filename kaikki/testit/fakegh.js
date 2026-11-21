/* Testien GitHub: muistissa oleva repo, sama rajapinta kuin appi käyttää (repo, trees, blobs, contents PUT/GET/DELETE). */
(function(){
var R=window.__repo={files:{},log:[]};try{var o=JSON.parse(sessionStorage.getItem('__repo')||'null');if(o){R.files=o;R.kept=true;}}catch(e){}
function keep(){try{sessionStorage.setItem('__repo',JSON.stringify(R.files));}catch(e){}}
function sha(t){var h=0;for(var i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))|0;return 's'+(h>>>0).toString(16)+t.length;}
function b64e(s){return btoa(unescape(encodeURIComponent(s)));}function b64d(b){return decodeURIComponent(escape(atob(b)));}
R.put=function(p,t){R.files[p]={t:t,sha:sha(t)};keep();};R.get=function(p){return R.files[p]&&R.files[p].t;};
function resp(st,j){return Promise.resolve(new Response(JSON.stringify(j||{}),{status:st,headers:{'Content-Type':'application/json'}}));}
var of=window.fetch;window.fetch=function(u,o){u=String(u);if(u.indexOf('https://api.github.com/repos/')!==0)return of.apply(this,arguments);
  o=o||{};var m=(o.method||'GET'),path=u.replace(/^https:\/\/api\.github\.com\/repos\/[^/]+\/[^/?]+/,'').replace(/[?&]t=\d+/,'').replace(/\?$/,''),b=o.body?JSON.parse(o.body):null;
  R.log.push(m+' '+decodeURIComponent(path.split('?')[0]));
  if(path===''||path==='?')return resp(200,{private:true,default_branch:'main',full_name:'testi/vault'});
  if(/^\/git\/trees\//.test(path)){var ks=Object.keys(R.files);if(!ks.length)return resp(409,{});return resp(200,{tree:ks.map(function(p){return {path:p,type:'blob',sha:R.files[p].sha,size:R.files[p].t.length};})});}
  var bm=/^\/git\/blobs\/(.+)$/.exec(path);if(bm){for(var p in R.files)if(R.files[p].sha===bm[1])return resp(200,{content:b64e(R.files[p].t)});return resp(404);}
  var cm=/^\/contents\/([^?]+)/.exec(path);if(cm){var fp=decodeURIComponent(cm[1]),cur=R.files[fp];
    if(m==='GET')return cur?resp(200,{sha:cur.sha,content:b64e(cur.t)}):resp(404);
    if(m==='PUT'){if(cur&&b.sha!==cur.sha)return resp(409,{});if(!cur&&b.sha)return resp(404);R.put(fp,b64d(b.content));return resp(cur?200:201,{content:{sha:R.files[fp].sha}});}
    if(m==='DELETE'){if(!cur)return resp(404);if(b.sha!==cur.sha)return resp(409);delete R.files[fp];keep();return resp(200,{});}}
  return resp(404);};
})();
