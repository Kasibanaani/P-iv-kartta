// Jonon 17d (F42 vaihe 2, suunnitelma 26): palikan oma syvyys sy, ominaisuudet syvyys (ohjattava) ja näkyväkoko (vain luku),
// Kerros-palikan syvyys ja järjestys kerroksen sisällä (kerros, syvyys, z). Oma syvyys ohittaa kerroksen syvyyden ja vauhdin;
// ohjaus nuolella, kaavalla, Aseta-toiminnolla ja Joukon säännöllä; tallennus ja vanhan projektin avaus.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(3000000);},toast:function(){},nav:function(){}};
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,Math.random()*1000);}
function U(P,k,o,x,y,w,h,nm){o=o||{};o.v=P.views[0].id;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
function near(a,b,m){A.ok(Math.abs(a-b)<1e-9,(m||'')+' '+a+' ≠ '+b);}
function E(P){return KK.Ev(P,C);}
function kaava(P,f){var k=KK.addBlock(P,'kaava',{});N(P,k);k.f=KK.kaavaToIds(P,f);return k;}
function V(P,f){return E(P).val(kaava(P,f).id);}
var nk={x:-200,y:-100,z:1,zf:1,w:400,h:800};       // ruudun keskikohta maailmassa (400, 500)

var P=KK.newProject('sy2'),vw=P.views[0].id;P.views[0].laite='puhelin';
P.views[0].kr=[{id:'k1',n:'Tausta',sy:300},{id:'pohja',n:'Pohja'},{id:'k3',n:'Hidas',rv:50}];
var a=U(P,'muoto',{},0,0,40,40,'Lahestyva'),b=U(P,'muoto',{kr:'k1'},0,0,40,40,'Puu'),c=U(P,'muoto',{kr:'k3'},0,0,40,40,'Pilvi');KK.repair(P);

// 1. Ominaisuudet rekisterissä: syvyys ohjattava, näkyväkoko vain luku; Alueella ja Sijainnilla ei
var om=KK.omat(a);A.ok(om.some(function(e){return e.p==='sy'&&e.n==='syvyys'&&e.o;}),'syvyys ohjattava');
A.ok(om.some(function(e){return e.p==='nakyvakoko'&&e.n==='näkyväkoko'&&e.calc&&!e.o;}),'näkyväkoko vain luku');
var al=U(P,'alue',{},0,0,100,100,'Ala');A.ok(!KK.omat(al).some(function(e){return e.p==='sy';}),'Alueella ei syvyyttä');

// 2. Perusarvo: palikan oma, muuten kerroksen (oma rullausvauhti = pinnassa)
A.strictEqual(V(P,'@lahestyva.syvyys'),0);A.strictEqual(V(P,'@puu.syvyys'),300,'kerroksen syvyys');A.strictEqual(V(P,'@pilvi.syvyys'),0,'vauhtikerros = pinnassa');
A.strictEqual(V(P,'@puu.näkyväkoko'),25);A.strictEqual(V(P,'@lahestyva.nakyvakoko'),100);A.strictEqual(V(P,'@pilvi.näkyväkoko'),100,'rullausvauhti ei pienennä');

// 3. Oma syvyys: ohittaa kerroksen syvyyden ja vauhdin; 0 = pinnassa myös syvässä ja hitaassa kerroksessa
a.sy=900;KK.repair(P);A.strictEqual(KK.syOf(P,a,E(P)),900);near(KK.palikkaMuunnos(P,E(P),a,nk).s,0.1);A.ok(!KK.pinnalla(P,a));
A.strictEqual(V(P,'@lahestyva.näkyväkoko'),10);
b.sy=0;c.sy=0;KK.repair(P);A.deepStrictEqual(KK.palikkaMuunnos(P,E(P),b,nk),{s:1,x:0,y:0},'oma 0 syvässä kerroksessa');
A.deepStrictEqual(KK.palikkaMuunnos(P,E(P),c,nk),{s:1,x:0,y:0},'oma 0 ohittaa kerroksen vauhdin');A.ok(KK.pinnalla(P,b));
c.sy=100;KK.repair(P);near(KK.palikkaMuunnos(P,E(P),c,nk).s,0.5);delete b.sy;delete c.sy;KK.repair(P);
// syvyys ja oma rullausvauhti eivät ole yhtä aikaa: syvyys jää
b.rv=50;b.sy=100;KK.repair(P);A.strictEqual(b.rv,undefined);A.strictEqual(b.sy,100);delete b.sy;KK.repair(P);

// 4. Ohjaus: Aseta (asetettu), nuoli ja kaava, Palauta, Joukon sääntö
P.st['o:'+a.id]={sy:-50};near(KK.palikkaMuunnos(P,E(P),a,nk).s,2,'asetettu syvyys −50 = etuala');A.strictEqual(V(P,'@lahestyva.näkyväkoko'),200);
P.st['o:'+a.id]={sy:-500};A.strictEqual(KK.syOf(P,a,E(P)),-90,'alaraja');delete P.st['o:'+a.id];
var t=KK.addBlock(P,'tee',{do:'aseta',o:a.id,om:'sy'});N(P,t);KK.addLink(P,N(P,kaava(P,'300')).id,'v',N(P,t).id,'v');KK.repair(P);KK.runAction(P,t.id,C,0);
A.strictEqual(KK.syOf(P,a,E(P)),300,'Aseta-toiminto');var pal=KK.addBlock(P,'tee',{do:'palauta',o:a.id,om:'sy'});N(P,pal);KK.repair(P);KK.runAction(P,pal.id,C,0);A.strictEqual(KK.syOf(P,a,E(P)),900,'Palauta');
var mu=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,mu.id,'Etaisyys');N(P,mu);a.ohk=['sy'];var k=kaava(P,'@etaisyys * 2');A.ok(KK.addLink(P,N(P,k).id,'v',N(P,a).id,'o_sy'),'nuoli kohtaan o_sy');KK.repair(P);
A.strictEqual(KK.syOf(P,a,E(P)),0,'ohjattu 0 voittaa oman 900:n');P.st[mu.id]=150;A.strictEqual(KK.syOf(P,a,E(P)),300);near(KK.palikkaMuunnos(P,E(P),a,nk).s,0.25);
// ilman Ev:tä (muokkaus) perusarvo
A.strictEqual(KK.syOf(P,a,null),900,'muokatessa oma perusarvo');
a.ohk=[];P.lg.l=P.lg.l.filter(function(l){return l.t!==N(P,a).id;});KK.repair(P);
var J=KK.jkLuo(P,'kaukaiset');var pj=KK.addBlock(P,'pjoukko',{jj:J,otl:'muoto',jsr:[{p:'o_sy',f:KK.kaavaToIds(P,'jäsen.y + 100')}]});N(P,pj);c.y=200;KK.repair(P);
A.strictEqual(KK.syOf(P,c,E(P)),300,'Joukon sääntö syvyydelle');A.strictEqual(KK.syOf(P,b,E(P)),100);
KK.removeBlock(P,pj.id);KK.repair(P);

// 5. Kerros-palikka: syvyys ominaisuutena, ohjattava; kerroksen palikat seuraavat
var kb=KK.addBlock(P,'kerros',{vw:vw,kr:'k1'});N(P,kb);KK.repair(P);
A.ok(KK.omat(kb).some(function(e){return e.p==='syvyys'&&e.o;}),'Kerros-palikalla syvyys');A.strictEqual(E(P).omiNum(kb.id,'syvyys',0),300,'perusarvo kerroksesta');
P.st['o:'+kb.id]={syvyys:100};A.strictEqual(KK.syOf(P,b,E(P)),100,'Kerros-palikka ohjaa kerroksen syvyyttä');A.strictEqual(V(P,'@puu.näkyväkoko'),50);
near(KK.palikkaMuunnos(P,E(P),b,nk).s,0.5);A.strictEqual(KK.syOf(P,b,null),300,'muokatessa kerroksen oma');
P.st['o:'+kb.id]={syvyys:0};A.deepStrictEqual(KK.palikkaMuunnos(P,E(P),b,nk),{s:1,x:0,y:0},'kerros tuotu pintaan');delete P.st['o:'+kb.id];
// Kerros-palikka pintakerrokselle: syvyys syntyy logiikasta
var kb2=KK.addBlock(P,'kerros',{vw:vw,kr:'pohja'});N(P,kb2);KK.repair(P);P.st['o:'+kb2.id]={syvyys:900};var pa=U(P,'muoto',{},0,0,40,40,'Pintaan');KK.repair(P);
A.strictEqual(KK.syOf(P,pa,E(P)),900);delete P.st['o:'+kb2.id];

// 6. Napautus seuraa omaa syvyyttä: Alueella ei omaa syvyyttä, mutta Liike-kohde syvällä palikalla menee näkyvään kohtaan
var li=KK.addBlock(P,'liike',{o:a.id,ohj:'napautus',vm:1000});N(P,li);KK.repair(P);KK.liikeNapautus(P,vw,410,520,C,nk);var st=P.st[li.id];
near(st.tx*0.1+400*0.9,410,'x näkyy napautetussa (syvyys 900)');near(st.ty*0.1+500*0.9,520);

// 7. Tallennus ja repair: rajat, Alueelta ja Sijainnilta pois, virhe pois, vanha projekti ennallaan
al.sy=100;var mk=U(P,'merkki',{},0,0,10,10,'Paikka');mk.sy=50;b.sy='x';c.sy='-200';KK.repair(P);
A.strictEqual(al.sy,undefined);A.strictEqual(mk.sy,undefined);A.strictEqual(b.sy,undefined);A.strictEqual(c.sy,-90);
var J2=JSON.parse(JSON.stringify(KK.payload?KK.payload(P):{projekti:P})),P2=J2.projekti||J2;KK.repair(P2);A.strictEqual(P2.b[a.id].sy,900,'tallennus säilyttää');
var Q=KK.newProject('vanha');Q.views[0].kr=[{id:'k1',n:'Tausta',rv:50},{id:'pohja',n:'Pohja'}];var qb=U(Q,'muoto',{kr:'k1'},10,10,20,20,'T');KK.repair(Q);
A.deepStrictEqual(KK.palikkaMuunnos(Q,E(Q),qb,nk),KK.rvMuunnos(50,nk),'vanha rullausvauhti täsmälleen ennallaan');A.strictEqual(qb.sy,undefined);
console.log('ok logiikka_98_palikan_syvyys');
