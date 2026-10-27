// Moottorin tarkistukset (ei selainta): tallennusmuoto, sijoittelu, magneetti, kamera, viivat.
var FC=require('./engine.js'),n=0,bad=0;
function ok(c,m){n++;if(!c){bad++;console.log('  VIRHE: '+m)}}
var p=FC.repair({app:'flowchart',ver:1,projekti:{n:[{id:'a',x:0,y:0,t:'A'},{id:'a',x:5,y:5,t:'dup'},{id:'b',x:'x',y:10,t:7},null],
  l:[{a:'a',b:'b'},{a:'a',b:'b'},{a:'a',b:'a'},{a:'a',b:'zz'}]}});
ok(p.n.length===2,'kaksoistunniste ja null pois');
ok(p.n[1].x===0&&p.n[1].t==='7','rikkinäinen x nollaksi, teksti merkkijonoksi');
ok(p.l.length===1,'kaksoisviiva, itseviiva ja puuttuva kohde pois');
ok(FC.repair(null).n.length===0&&FC.repair({n:[{id:'q',x:1,y:2,t:'Q'}]}).n.length===1,'tyhjä ja pelkkä projekti luetaan');
var w=FC.wrap(p);ok(w.app==='flowchart'&&w.ver===FC.VER&&w.projekti===p&&w.savedAt,'kääre');
FC.link(p,'b','a');FC.link(p,'b','a');ok(p.l.length===2,'link ei tuplaa');
FC.removeNode(p,'a');ok(p.n.length===1&&p.l.length===0,'poisto vie viivat');
// sijoittelu
var rs=[{id:'s',x:0,y:0,w:100,h:42}];
var q=FC.besideSpot(rs,rs[0],200,42,1);ok(q.y===0&&q.x===50+FC.GAPX+100,'jälkeen oikealle samalle riville');
q=FC.besideSpot(rs,rs[0],200,42,-1);ok(q.x===-(50+FC.GAPX+100),'edelle vasemmalle');
rs.push({id:'t',x:q.x,y:0,w:200,h:42});
var q2=FC.besideSpot(rs,rs[0],200,42,-1);ok(q2.y!==0&&!FC.hit({x:q2.x,y:q2.y,w:200,h:42},rs[1],0),'varattu paikka: siirtyy pystyyn');
var f=FC.freeSpot(rs,{x:0,y:0,w:100,h:42});ok(f.y===42+FC.GAPY,'vapaa paikka ensin alas');
// magneetti
var s=FC.snap([{id:'o',x:100,y:200,w:80,h:40}],{x:112,y:260});ok(s.x===100&&s.y===264,'x kohdistuu, y ruudukkoon');
// kamera
var view={x0:0,y0:0,x1:400,y1:800},bb={x0:0,y0:0,x1:100,y1:100};
var c=FC.clampCam({x:-5000,y:9000,s:1},bb,view);ok(c.x===0&&c.y===700,'pieni kartta palaa ruutuun');
var bb2={x0:0,y0:0,x1:2000,y1:100};c=FC.clampCam({x:500,y:0,s:1},bb2,view);ok(c.x===0,'iso kartta: ruutu pysyy kartan päällä');
c=FC.clampCam({x:-9000,y:0,s:1},bb2,view);ok(c.x===400-2000,'iso kartta oikea reuna');
var fc=FC.fitCam({x0:-100,y0:-50,x1:100,y1:50},view,.3,1.2);ok(Math.abs(fc.x-200)<1e-9&&Math.abs(fc.y-400)<1e-9&&fc.s===1.2,'sovitus keskelle');
ok(FC.clampCam({x:3,y:4,s:1},null,view).x===3,'tyhjä kartta ei rajaa');
// viivat
var d=FC.path({x:0,y:0,w:100,h:40},{x:300,y:0,w:100,h:40});ok(/^M52,0 C/.test(d)&&/ 246,0$/.test(d),'vaakaviiva reunasta reunaan: '+d);
d=FC.path({x:0,y:0,w:100,h:40},{x:10,y:200,w:100,h:40});ok(/^M0,22 /.test(d)&&/ 10,176$/.test(d),'pystyviiva: '+d);
d=FC.path({x:300,y:0,w:100,h:40},{x:0,y:0,w:100,h:40});ok(/^M248,0 /.test(d),'vasemmalle');

// viivojen päät levitetään
var rm={a:{x:0,y:0,w:100,h:60},b:{x:300,y:-80,w:100,h:40},c:{x:300,y:80,w:100,h:40},d:{x:-300,y:0,w:100,h:40}};
var rt=FC.routes(rm,[{a:'a',b:'c'},{a:'a',b:'b'},{a:'d',b:'a'}]);
var ys=rt.map(function(r){return +r.d.split(' ')[0].slice(1).split(',')[1]});
ok(ys[1]<ys[0],'ylempi kohde lähtee ylempää: '+ys);
ok(ys[0]!==ys[1],'saman reunan päät eri kohdissa');
// automaattinen järjestys: haarat allekkain, ei päällekkäin, ankkuri paikallaan
var q={n:[{id:'s',x:0,y:0,t:'S'},{id:'x',x:5,y:3,t:'X'},{id:'y',x:7,y:4,t:'Y'},{id:'z',x:9,y:5,t:'Z'},{id:'p',x:-3,y:2,t:'P'},{id:'f',x:200,y:0,t:'vapaa'}],
  l:[{a:'s',b:'x'},{a:'s',b:'y'},{a:'s',b:'z'},{a:'p',b:'s'}]};
var SZ=function(){return {w:80,h:40}};
FC.arrange(q,SZ,'s');
var Q={};q.n.forEach(function(o){Q[o.id]=o});
ok(Q.s.x===0&&Q.s.y===0,'ankkuri pysyy');
ok(Q.x.x===Q.y.x&&Q.y.x===Q.z.x&&Q.x.x>Q.s.x+80,'jälkeen-haarat samaan sarakkeeseen oikealle');
ok(Q.p.x<Q.s.x-80&&Q.p.y===0,'edeltäjä vasemmalle samalle korkeudelle');
var hy=[Q.x.y,Q.y.y,Q.z.y].sort(function(a,b){return a-b});
ok(hy[1]-hy[0]>=40+FC.GAPY-1e-9&&hy[2]-hy[1]>=40+FC.GAPY-1e-9&&Math.abs(hy[0]+hy[2])<1e-9,'haarat allekkain keskitettynä: '+hy);
var all=q.n.map(function(o){return {id:o.id,x:o.x,y:o.y,w:80,h:40}}),ov=0;
for(var i=0;i<all.length;i++)for(var j=i+1;j<all.length;j++)if(FC.hit(all[i],all[j],0))ov++;
ok(ov===0,'ei päällekkäisyyksiä, vapaa palikka siirtyi alta');
// kehä ei kaada
var cy={n:[{id:'a',x:0,y:0,t:'a'},{id:'b',x:100,y:0,t:'b'},{id:'c',x:200,y:0,t:'c'}],l:[{a:'a',b:'b'},{a:'b',b:'c'},{a:'c',b:'a'}]};
FC.arrange(cy,SZ,'a');ok(cy.n.every(function(o){return isFinite(o.x)&&isFinite(o.y)}),'kehä järjestyy');
ok(FC.components(q).length===2,'osat');
console.log('  '+(n-bad)+'/'+n+' tarkistusta');process.exit(bad?1:0);
