// Appi-appi 7: reitinhaku esteiden ohi (Napautus kohteeseen + Kiertää esteet). Moottorin osuus.
var KK=require('./moottori.js'),A=require('assert');
var T=1000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function near(a,b,e,m){A.ok(Math.abs(a-b)<=(e||1e-6),(m||'')+' '+a+' ≠ '+b);}
function N(P,b){return KK.addNode(P,b.id,0,0);}
function LB(P,k,o){var b=KK.addBlock(P,k,o);N(P,b);return b;}
function laskuri(P,b,port){var m=KK.addBlock(P,'muisti',{v:'0'});N(P,m);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,b).id,port,N(P,t).id,'e');return m;}
function seina(P,vw,x,y,w,h){var s=KK.addBlock(P,'muoto',{v:vw});s.x=x;s.y=y;s.w=w;s.h=h;s.este=true;return s;}
function keski(P,b){var E=KK.Ev(P,C);return {x:E.omiNum(b.id,'x',0)+b.w/2,y:E.omiNum(b.id,'y',0)+b.h/2};}
/* Ajaa kunnes perillä tai aika loppuu; tarkistaa joka kuvassa, ettei liikkuja ole seinän sisällä. */
function aja(P,b,li,seinat,s){var dt=1/60,n=Math.round(s/dt);for(var i=0;i<n;i++){T+=dt*1000;KK.frame(P,dt,C);var c=keski(P,b);
  var oa=KK.osumaAlue(b,{x:c.x-b.w/2,y:c.y-b.h/2,w:b.w,h:b.h});seinat.forEach(function(w){var v=KK.osumaTyonto(oa,KK.osumaAlue(w,w));A.ok(!v||Math.hypot(v.x,v.y)<=0.6,'seinän sisällä '+c.x+','+c.y);});
  if(!KK.Ev(P,C).val(li.id,'m')&&i>5&&P.st[li.id].tx==null)return i*dt;}return s;}

// --- 1. Seinä välissä: ilman reitinhakua jää seinään, reitinhaulla kiertää ---
var P=KK.newProject('h');var vw=P.views[0].id;P.views[0].laite='puhelin';
var h=KK.addBlock(P,'muoto',{v:vw,laji:'laatikko'});h.x=100;h.y=280;h.w=40;h.h=40;
var s1=seina(P,vw,200,100,20,400);
var li=LB(P,'liike',{o:h.id,ohj:'napautus',vm:'300'});KK.repair(P);
A.ok(!KK.ports(li).outs.some(function(o){return o.p==='eip';}),'ei pääse -kohta vain reitinhaulla');
var per=laskuri(P,li,'per');KK.repair(P);
KK.liikeNapautus(P,vw,320,300,C);aja(P,h,li,[s1],3);
var c=keski(P,h);near(c.x,180,0.1,'ilman reitinhakua jää seinään');A.strictEqual(KK.Ev(P,C).val(per.id),0);
KK.liikeAlkuun(P,li.id);li.kie=true;KK.repair(P);A.strictEqual(li.kie,true);
A.ok(KK.ports(li).outs.some(function(o){return o.p==='eip';}),'ei pääse -kohta näkyy');
KK.liikeNapautus(P,vw,320,300,C);KK.frame(P,1/60,C);
var pp=P.st[li.id].pp;A.ok(Array.isArray(pp)&&pp.length>=2,'reitti haettiin: '+JSON.stringify(pp));A.deepStrictEqual(P.st[li.id].pk,[320,300]);
A.ok(pp.some(function(q){return q[1]<100;}),'reitti kiertää yläkautta (seinä alkaa y = 100)');A.deepStrictEqual(pp[pp.length-1],[320,300]);
var aika=aja(P,h,li,[s1],6);c=keski(P,h);near(c.x,320,0.6,'perillä x');near(c.y,300,0.6,'perillä y');
A.strictEqual(KK.Ev(P,C).val(per.id),1,'perillä kerran');A.strictEqual(KK.Ev(P,C).val(li.id,'eip'),false);A.strictEqual(P.st[li.id].pp,undefined,'reitti pois perillä');
// Matka on lähellä lyhintä: (220 → yläkulma → kohde), 300 px/s
var lyhin=Math.hypot(200-20-120,300-80)+20+Math.hypot(320-(220+20),300-80);A.ok(aika<lyhin/300*1.25+0.3,'reitti on lyhyt: '+aika+' s');

// --- 2. Kohteeseen ei pääse (suljettu laatikko): menee lähelle, ei pääse = kyllä, perillä lähtee ---
var Q=KK.newProject('q');var qv=Q.views[0].id;
var g=KK.addBlock(Q,'muoto',{v:qv,laji:'ympyra'});g.x=0;g.y=180;g.w=40;g.h=40;
var ws=[seina(Q,qv,300,100,200,20),seina(Q,qv,300,280,200,20),seina(Q,qv,300,100,20,200),seina(Q,qv,480,100,20,200)];
var lq=LB(Q,'liike',{o:g.id,ohj:'napautus',vm:'400',kie:true});var pq=laskuri(Q,lq,'per');KK.repair(Q);
KK.liikeNapautus(Q,qv,400,200,C);KK.frame(Q,1/60,C);A.strictEqual(KK.Ev(Q,C).val(lq.id,'eip'),true,'ei pääse');
aja(Q,g,lq,ws,4);c=keski(Q,g);A.ok(c.x<300&&c.x>250&&Math.abs(c.y-200)<30,'pysähtyi laatikon viereen lähimmäksi: '+c.x+','+c.y);
A.strictEqual(KK.Ev(Q,C).val(pq.id),1,'perillä (niin lähellä kuin pääsee)');A.strictEqual(KK.Ev(Q,C).val(lq.id,'eip'),true,'ei pääse säilyy');
// Uusi kohde, johon pääsee: ei pääse = ei
KK.liikeNapautus(Q,qv,600,200,C);aja(Q,g,lq,ws,4);c=keski(Q,g);near(c.x,600,0.6);near(c.y,200,0.6);A.strictEqual(KK.Ev(Q,C).val(lq.id,'eip'),false);

// --- 3. Ruudukko: labyrintti ruutu kerrallaan, napautus ruudun keskelle, reitti ruutujen keskeltä ---
var R=KK.newProject('r');var rv=R.views[0].id;R.views[0].kr=[{id:'pohja',n:'Pohja',rk:40}];
var m=KK.addBlock(R,'muoto',{v:rv});m.x=0;m.y=0;m.w=40;m.h=40;
/* Kartta (# = seinä): hahmo vasemmassa yläkulmassa, kohde oikeassa alakulmassa, käytävä 1 ruudun levyinen. */
var kartta=['.#...','.#.#.','...#.','####.','.....'],rws=[];
kartta.forEach(function(r,y){r.split('').forEach(function(ch,x){if(ch==='#')rws.push(seina(R,rv,x*40,y*40,40,40));});});
var lr=LB(R,'liike',{o:m.id,ohj:'napautus',vm:'200',kie:true});KK.repair(R);
KK.liikeNapautus(R,rv,13,175,C);A.deepStrictEqual([R.st[lr.id].tx,R.st[lr.id].ty],[20,180],'napautus ruudun keskelle');
KK.frame(R,1/60,C);var rp=R.st[lr.id].pp;
rp.forEach(function(q){A.ok(Math.abs((q[0]-20)%40)<1e-6&&Math.abs((q[1]-20)%40)<1e-6,'välipiste ruudun keskellä: '+q);});
A.deepStrictEqual(rp[rp.length-1],[20,180]);
aja(R,m,lr,rws,8);c=keski(R,m);near(c.x,20,0.6,'perillä labyrintin läpi');near(c.y,180,0.6);A.strictEqual(KK.Ev(R,C).val(lr.id,'eip'),false);

// --- 4. Reitin eteen tulee uusi este: törmäys hakee reitin uudelleen ---
var U=KK.newProject('u');var uv=U.views[0].id;
var hu=KK.addBlock(U,'muoto',{v:uv,laji:'ympyra'});hu.x=0;hu.y=180;hu.w=40;hu.h=40;
var lu=LB(U,'liike',{o:hu.id,ohj:'napautus',vm:'200',kie:true});KK.repair(U);
KK.liikeNapautus(U,uv,500,200,C);KK.frame(U,1/60,C);A.strictEqual(U.st[lu.id].pp.length,1,'ei esteitä: suoraan');
var uw=seina(U,uv,200,60,20,280);KK.repair(U);aja(U,hu,lu,[uw],6);c=keski(U,hu);near(c.x,500,0.6,'kiersi uuden esteen');near(c.y,200,0.6);

// --- 5. Nuolesta tuleva kohde: reitti haetaan, kun kohde vaihtuu ---
var V=KK.newProject('v');var vv=V.views[0].id;
var hv=KK.addBlock(V,'muoto',{v:vv});hv.x=100;hv.y=280;hv.w=40;hv.h=40;var vw1=seina(V,vv,200,100,20,400);
var kx=LB(V,'arvo',{v:'320'}),ky=LB(V,'arvo',{v:'300'});
var lv=LB(V,'liike',{o:hv.id,ohj:'napautus',vm:'300',kie:true});KK.addLink(V,N(V,kx).id,'v',N(V,lv).id,'tx');KK.addLink(V,N(V,ky).id,'v',N(V,lv).id,'ty');KK.repair(V);
aja(V,hv,lv,[vw1],6);c=keski(V,hv);near(c.x,320,0.6,'nuolen kohde');near(c.y,300,0.6);

// --- 6. reittiHae suoraan: ei esteitä, iso alue pysyy nopeana ---
var r0=KK.reittiHae({c:0,x:0,y:0,w:20,h:20},[],10,10,500,500,null);A.deepStrictEqual(r0,{pts:[[500,500]],ok:true});
var paljon=[];for(var i=0;i<60;i++)paljon.push({c:0,x:(i%10)*300+100,y:Math.floor(i/10)*300+50,w:40,h:250});
var t0=Date.now(),r1=KK.reittiHae({c:1,x:0,y:0,r:10},paljon,0,150,3000,1500,null);A.ok(r1.ok,'löytyi');A.ok(Date.now()-t0<1500,'nopea: '+(Date.now()-t0)+' ms');
r1.pts.reduce(function(p,q){for(var k=0;k<=20;k++){var x=p[0]+(q[0]-p[0])*k/20,y=p[1]+(q[1]-p[1])*k/20;paljon.forEach(function(o){A.strictEqual(KK.osumaTyonto({c:1,x:x,y:y,r:10},o),null,'reitti ei osu esteeseen');});}return q;},[0,150]);

// --- 7. Korjaus ja tallennus ---
li.kie='joo';KK.repair(P);A.strictEqual(li.kie,undefined,'tuntematon arvo pois');
lq.kie=true;Q.st[lq.id].pp='rikki';Q.st[lq.id].pk=[1];Q.st[lq.id].tx=600;Q.st[lq.id].ty=50;KK.repair(Q);KK.frame(Q,1/60,C);A.ok(Array.isArray(Q.st[lq.id].pp),'rikkinäinen reitti haetaan uudelleen');
var Q2=JSON.parse(JSON.stringify(Q));KK.repair(Q2);A.deepStrictEqual(Q2.st[lq.id].pp,Q.st[lq.id].pp,'reitti säilyy tallennuksessa');
// --- 8. Perillä tarkasti kohteessa myös jarrutettaessa (ennen jäi alle 0,5 px päähän) ---
[[300,'1'],[800,''],[500,'0.3'],[250,'0.7']].forEach(function(q){[1/60,1/30,0.021].forEach(function(dt){
  var S=KK.newProject('s');var sv=S.views[0].id;var hs=KK.addBlock(S,'muoto',{v:sv});hs.x=0;hs.y=0;hs.w=40;hs.h=40;
  var ls=LB(S,'liike',{o:hs.id,ohj:'napautus',vm:String(q[0]),kb:q[1]});KK.repair(S);KK.liikeNapautus(S,sv,237.3,151.7,C);
  for(var i=0;i<400;i++){T+=dt*1000;KK.frame(S,dt,C);}A.deepStrictEqual(keski(S,hs),{x:237.3,y:151.7},'tarkasti perillä '+q+' '+dt);A.strictEqual(KK.Ev(S,C).val(ls.id,'nop'),0);});});
console.log('ok');
