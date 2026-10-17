// Jonon 1n (linjakkuuskartoitus 5: R1–R4): Janan edistyminen 0–1 kuten Muutos ajassa ja Liikkeen reitti, valmis-nuoli
// säilyy Kierroksen vaihdossa, arvojanan käynnissä = ei, ketjun info Odota-toistuvalle janalle. Synteettinen sisältö.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,17,12,0,0).getTime();
var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function blk(P,k,props,x,y,g){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,x||0,y||0,g||'');return {b:b,n:n};}
function kaava(P,f){var k=blk(P,'kaava',{},-700,600);k.b.f=KK.kaavaToIds(P,f);KK.repair(P);return E(P).val(k.b.id);}
function step(P,ms){NOW+=ms;KK.frame(P,ms/1000,C);}

// R1: edistyminen 0–1, osuus poissa
var P=KK.newProject('j1');var J=blk(P,'jana',{b:10},0,0);KK.setName(P,J.b.id,'Jana');KK.repair(P);
A.ok(KK.omat(J.b).some(function(e){return e.n==='edistyminen';}));A.ok(!KK.omat(J.b).some(function(e){return e.n==='osuus';}));
A.strictEqual(KK.ports(J.b).outs.filter(function(p){return p.p==='os';})[0].n,'edistyminen');
KK.janaStart(P,J.b.id,C,0);step(P,2500);
A.strictEqual(kaava(P,'Jana.edistyminen'),0.25);
A.ok(KK.isErr(kaava(P,'Jana.osuus')),'vanha nimi osuus ei enää kelpaa');
step(P,9000);A.strictEqual(kaava(P,'Jana.edistyminen'),1);

// R2: nuoli valmis säilyy, kun Kierros vaihtuu edestakaisin; valmis laukeaa vain Kerran-janalla
var Q=KK.newProject('j2');var J2=blk(Q,'jana',{b:2},0,0);var m=blk(Q,'muisti',{v:'0'},-900,300);var t=blk(Q,'tee',{do:'lisaa',o:m.b.id,v:'1'},-500,300);
KK.addLink(Q,J2.n.id,'e',t.n.id,'e');KK.repair(Q);var lc=function(){return Q.lg.l.filter(function(l){return l.f===J2.n.id&&l.fp==='e';}).length;};
A.strictEqual(lc(),1);
J2.b.kierros='toista';KK.repair(Q);A.strictEqual(lc(),1,'toista: valmis-nuoli jää');
J2.b.kierros='edestakaisin';KK.repair(Q);A.strictEqual(lc(),1,'edestakaisin: valmis-nuoli jää');
J2.b.kierros='toista';KK.janaStart(Q,J2.b.id,C,0);step(Q,5000);A.ok(!Q.st[m.b.id],'toistuvalla janalla valmis ei laukea');KK.janaStop(Q,J2.b.id,C);
J2.b.kierros='kerta';KK.repair(Q);A.strictEqual(lc(),1,'kerta: nuoli yhä paikallaan');
KK.janaStart(Q,J2.b.id,C,0);step(Q,2500);A.strictEqual(Q.st[m.b.id],1,'valmis laukesi');

// R3: arvojanan käynnissä = ei (ei kohtaa)
var R=KK.newProject('j3');var J3=blk(R,'jana',{b:10,kulku:'arvo'},0,0);KK.setName(R,J3.b.id,'Jana');KK.repair(R);
KK.janaSiirra(R,J3.b.id,7,C,0,true);A.strictEqual(E(R).val(J3.b.id),7);
A.strictEqual(kaava(R,'Jana.käynnissä'),false);A.strictEqual(kaava(R,'Jana.edistyminen'),0.7);
A.ok(KK.omat(J3.b).some(function(e){return e.n==='käynnissä';}),'käynnissä aina rekisterissä');

// R4: Käynnistä + Odota toistuvaan janaan: info-rivi
var S=KK.newProject('j4');var J4=blk(S,'jana',{b:4,kierros:'toista'},0,0);KK.setName(S,J4.b.id,'Toistuva');
var KT=blk(S,'ketju',{},0,800);var KS=blk(S,'tee',{do:'kaynnista',o:J4.b.id,odota:true},0,850,KT.n.id);KK.repair(S);
var is=KK.chainIssues(S,KT.b.id,C);A.ok(is.some(function(x){return x.info&&/toistuu, joten Odota ei pääty/.test(x.t);}),JSON.stringify(is));
J4.b.kierros='kerta';A.ok(!KK.chainIssues(S,KT.b.id,C).some(function(x){return /toistuu/.test(x.t);}));
console.log('ok');
