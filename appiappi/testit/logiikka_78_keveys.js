// Jonon 1p (keveys): ominaisuusrekisterin muisti (omBatch), suorakulmion pikatie perusarvoissa olevalle palikalle,
// esteiden karkea rajaus (liikuta) ja kuva, jossa on satoja esteitä. Tulokset ovat samat kuin ilman kevennyksiä.
var KK=require('./moottori.js'),A=require('assert');
var T=3000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,0);}

// --- 1. omBatch: ajon sisällä sama lista, ajon jälkeen kentän muutos näkyy heti ---
var P=KK.newProject('k');var vw=P.views[0].id;
var li=KK.addBlock(P,'liike',{ohj:'tatti'});
A.notStrictEqual(KK.omat(li),KK.omat(li),'ilman ajoa joka kerta uusi lista');
KK.omBatch(function(){var a=KK.omat(li);A.strictEqual(KK.omat(li),a,'ajon sisällä sama lista');A.strictEqual(KK.omFind(li,'liukkaus'),KK.omFind(li,'liukkaus'),'nimihaku muistissa');
  A.strictEqual(KK.omFind(li,'eiole'),null);A.strictEqual(KK.omFind(li,'eiole'),null,'puuttuva nimi muistetaan puuttuvaksi');
  KK.omBatch(function(){A.strictEqual(KK.omat(li),a,'sisäkkäinen ajo käyttää samaa muistia');});});
A.ok(KK.omFind(li,'liukkaus'),'tatilla liukkaus');li.ohj='ruutu';
A.ok(!KK.omFind(li,'liukkaus'),'laji vaihtui: uusi ajo näkee muutoksen ilman mitätöintiä');
var m=new Map();KK.omBatch(function(){KK.omat(li);},m);A.ok(m.has(li),'annettu muisti täyttyy');
KK.omBatch(function(){A.strictEqual(KK.omat(li),m.get(li).es,'annettu muisti kantaa ajosta toiseen');},m);
A.strictEqual(KK.omBatch(function(){return 7;}),7,'palauttaa arvon');
A.throws(function(){KK.omBatch(function(){throw new Error('x');});});A.notStrictEqual(KK.omat(li),KK.omat(li),'virheen jälkeen muisti ei jää päälle');

// --- 2. rectNow: pikatie = täysi arviointi kaikissa tapauksissa ---
P=KK.newProject('r');vw=P.views[0].id;
function lohko(o){var b=KK.addBlock(P,'muoto',{v:vw});for(var k in o)b[k]=o[k];return b;}
var a1=lohko({x:10,y:20,w:30,h:40}),a2=lohko({x:'',y:null,w:5,h:undefined}),a3=lohko({x:'12',y:'7,5',w:'30',h:'9'}),a4=lohko({x:1,y:2,w:3,h:4,ohk:['x']}),a5=lohko({x:1,y:2,w:30,h:40}),a6=lohko({x:3,y:4,w:5,h:6});
P.st['o:'+a5.id]={y:99};
var luku=KK.addBlock(P,'luku',{v:vw,start:25});var dxl=KK.addLink(P,N(P,luku).id,'v',N(P,a6).id,'dx');A.ok(dxl,'siirto x -nuoli');
var kx=KK.addBlock(P,'luku',{v:vw,start:50});KK.repair(P);var oxl=KK.addLink(P,N(P,kx).id,'v',N(P,a4).id,'o_x');A.ok(oxl,'x-ohjaus');KK.tick(P,C);
var ev=E(P);[a1,a2,a3,a4,a5,a6].forEach(function(b,i){A.deepStrictEqual(KK.rectNow(P,ev,b),KK.rectNow0(P,ev,b),'rectNow '+(i+1));});
A.deepStrictEqual(KK.rectNow(P,ev,a4),{x:50,y:2,w:3,h:4},'ohjattu x');A.strictEqual(KK.rectNow(P,ev,a5).y,99,'asetettu y');A.strictEqual(KK.rectNow(P,ev,a6).x,28,'siirto x');

// --- 3. liikuta: karkea rajaus antaa saman tuloksen kuin kaikki esteet ---
var seed=12345;function rnd(){seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;}
var lukuA=0;
for(var t=0;t<400;t++){
  var obs=[],n=20+Math.floor(rnd()*120);
  for(var i=0;i<n;i++){var c=rnd()<0.3,w=4+rnd()*80,h=4+rnd()*80,ob={osu:c?'ympyra':'laatikko',k:'muoto'};obs.push(KK.osumaAlue(ob,{x:rnd()*600-300,y:rnd()*600-300,w:w,h:h}));obs[i].bid='o'+i;obs[i].kim=0;}
  // Myös pitkiä seiniä ja tiivis kasa, jotka työntävät liikkujaa kauas.
  if(t%5===0)for(var j=0;j<12;j++)obs.push(KK.osumaAlue({k:'muoto'},{x:-20+j*6,y:-20+j*6,w:30,h:30}));
  var mb={k:'muoto',osu:rnd()<0.4?'ympyra':'laatikko'},r={x:rnd()*200-100,y:rnd()*200-100,w:6+rnd()*40,h:6+rnd()*40},dx=(rnd()-0.5)*400,dy=(rnd()-0.5)*400;
  var x1=KK.liikuta(mb,r,dx,dy,obs),x0=KK.liikuta0(mb,r,dx,dy,obs,null);
  A.deepStrictEqual(x1,x0,'liikuta kierros '+t);if(x0.osui)lukuA++;}
A.ok(lukuA>50,'osumia testattiin ('+lukuA+')');

// --- 4. Kuva sadoilla esteillä: hahmo pysähtyy seinään, ja kuva on nopea ---
P=KK.newProject('f');vw=P.views[0].id;
var hahmo=KK.addBlock(P,'muoto',{v:vw});hahmo.x=0;hahmo.y=0;hahmo.w=20;hahmo.h=20;
var seina=KK.addBlock(P,'muoto',{v:vw,este:true});seina.x=200;seina.y=-100;seina.w=20;seina.h=300;
for(var q=0;q<600;q++){var s=KK.addBlock(P,'muoto',{v:vw,este:true});s.x=-3000+(q%30)*200;s.y=1000+Math.floor(q/30)*100;s.w=60;s.h=12;}
var lk=KK.addBlock(P,'liike',{o:hahmo.id});var vx=KK.addBlock(P,'luku',{v:vw,start:300});KK.addLink(P,N(P,vx).id,'v',N(P,lk).id,'vx');KK.repair(P);KK.tick(P,C);
var t0=Date.now(),fr=0;for(var f=0;f<120;f++){T+=1000/60;KK.frame(P,1/60,C);fr++;}var ms=(Date.now()-t0)/fr;
var hx=E(P).omiNum(hahmo.id,'x',0);A.ok(Math.abs(hx-180)<0.5,'hahmo seinässä: '+hx);
A.ok(ms<20,'kuva 600 esteellä alle 20 ms (nyt '+ms.toFixed(2)+' ms)');
console.log('ok logiikka keveys ('+ms.toFixed(2)+' ms/kuva, 600 estettä)');
