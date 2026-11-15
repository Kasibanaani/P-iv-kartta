/* Päiväkartan laskentatesti Nodella: ennuste, nousu/lasku-merkki ja vähän datan käytös. Käyttö: node testit/logiikka.js */
var fs=require('fs'),vm=require('vm'),path=require('path');
var html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8'),js=html.split('<script>')[1].split('</script>')[0];
var ctx={module:{exports:{}},Math:Math,Object:Object,Uint8Array:Uint8Array,Uint16Array:Uint16Array};vm.createContext(ctx);vm.runInContext(js,ctx);
var M=ctx.module.exports,bad=0;
function ok(c,t){console.log((c?'  ok   ':'  VIRHE ')+t);if(!c)bad++;}
function data(nd,f){var D={opts:[{id:'a',n:'A'},{id:'b',n:'B'},{id:'c',n:'C'}],days:{}},d=new Date(2026,0,5);
  for(var i=0;i<nd;i++){var s=f(i);var iso=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    if(s.length)D.days[iso]={s:s,v:['a','b','c'],x:[]};d.setDate(d.getDate()+1);}return D;}
// A:n päivinä B aina, C ei koskaan; muulloin C aina
var D=data(20,function(i){return i%2?['a','b']:['c'];}),st=M.computeStats(D,null),wd=st.n+0;
var Lb=M.lift(st,wd,[0],1),Lc=M.lift(st,wd,[0],2);
ok(Lb&&Lb.dir===1&&Lb.p>Lb.p0,'A valittu -> B nousee ('+(Lb&&Lb.p0.toFixed(2))+' -> '+(Lb&&Lb.p.toFixed(2))+')');
ok(Lc&&Lc.dir===-1&&Lc.p<Lc.p0,'A valittu -> C laskee ('+(Lc&&Lc.p0.toFixed(2))+' -> '+(Lc&&Lc.p.toFixed(2))+')');
var L0=M.lift(st,wd,[],1);ok(L0&&L0.dir===0,'ilman valintoja ei nuolta');
// vähän dataa: kaksi päivää -> ei ennustetta
var D2=data(2,function(i){return ['a','b'];}),st2=M.computeStats(D2,null);ok(M.lift(st2,st2.n,[0],1)===null,'kaksi päivää: ei ennustetta');
// kolme päivää: ennuste on maltillinen eikä hyppää ääripäähän
var D3=data(3,function(i){return i===0?['a','b']:['c'];}),st3=M.computeStats(D3,null),L3=M.lift(st3,st3.n,[0],1);
ok(L3&&L3.p>0.05&&L3.p<0.95,'kolme päivää: arvio maltillinen ('+(L3&&L3.p.toFixed(2))+')');
// relFor löytää B:n
var R=M.relFor(st,0,['a','b','c'],'a');ok(R.up.length&&R.up[0].id==='b'&&R.dn.length&&R.dn[0].id==='c','relFor: B useammin, C harvemmin');
// vanha vientimuoto luetaan
var N=M.normalize({app:'paivakartta',options:[{id:'o1',name:'X'}],days:{'2026-01-01':{s:['o1','zz']}}});
ok(N&&N.opts.length===1&&N.days['2026-01-01'].s.length===1,'vanha vientitiedosto luetaan, tuntematon tunniste pois');
console.log(bad?'LOGIIKKA: '+bad+' VIRHETTÄ':'LOGIIKKA OK');process.exit(bad?1:0);
