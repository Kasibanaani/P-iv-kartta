// Appi-appi 25 (L1): syöttävät ohjaimet (Säädin, Tekstikenttä, Lukukenttä, Valintaruutu, Kytkin, Päivämäärä, Lista)
// lähettävät tapahtuman muuttui, kun käyttäjä muuttaa arvoa. Tapahtuman tiedot: uusi ja vanha. Sama arvo ei lähetä,
// logiikan Aseta ei lähetä (ei kierrä), Tekstikenttä hiljaa kirjoittaessa ja muuttui lopuksi, Lista aina.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,17,10,0,0).getTime();
var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function val(P,id){return KK.Ev(P,C).val(id);}
function kaava(P,f){var b=KK.addBlock(P,'kaava');KK.addNode(P,b.id,-600,0);b.f=KK.kaavaToIds(P,f);return b;}
function blk(P,k,props){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,0,0);return {b:b,n:n};}
function link(P,a,ap,b,bp){var l=KK.addLink(P,a.n.id,ap,b.n.id,bp);A.ok(l,'nuoli '+a.b.nm+' → '+b.b.nm);return l;}
function outs(b){return KK.portsBase(b).outs.map(function(o){return o.p+':'+o.t;});}

var P=KK.newProject('muuttui');var vw=P.views[0].id;
// Kohdat: muuttui kaikilla seitsemällä, ei Painikkeella, Kalenterilla, Tatilla eikä näyttöpalikoilla
['saadin','teksti','luku','ruutu','kytkin','pvm','lista'].forEach(function(k){var b=KK.addBlock(P,k,{v:vw});A.ok(outs(b).indexOf('mu:e')>=0,k+' muuttui');});
['nappi','kalenteri','tatti','naytto','muoto'].forEach(function(k){if(!KK.K[k])return;var b=KK.addBlock(P,k,{v:vw});A.ok(outs(b).indexOf('mu:e')<0,k+' ei muuttui');});

// Kirjaus: muuttui → Lisää laskuriin, Aseta Uusi = tapahtuma.uusi ja Vanha = tapahtuma.vanha
function rig(P,src){
  var lask=blk(P,'muisti',{nm:'Laskuri'+src.b.id,v:'0'}),u=blk(P,'muisti',{nm:'Uusi'+src.b.id}),o=blk(P,'muisti',{nm:'Vanha'+src.b.id});
  var t1=blk(P,'tee',{do:'lisaa',o:lask.b.id}),t2=blk(P,'tee',{do:'aseta',o:u.b.id,v:{r:kaava(P,'tapahtuma.uusi').id}}),t3=blk(P,'tee',{do:'aseta',o:o.b.id,v:{r:kaava(P,'tapahtuma.vanha').id}});
  link(P,src,'mu',t1,'e');link(P,t1,'e',t2,'e');link(P,t2,'e',t3,'e');
  return {n:function(){return val(P,lask.b.id);},u:function(){return val(P,u.b.id);},o:function(){return val(P,o.b.id);}};
}
blk(P,'tapaht',{nm:'Tapahtuma'});
var sl=blk(P,'saadin',{v:vw,nm:'Vauhti',min:0,max:10,start:3}),rs=rig(P,sl);KK.repair(P);
A.strictEqual(val(P,sl.b.id),3);
KK.userSet(P,sl.b.id,4,C);A.strictEqual(rs.n(),1,'3 → 4 lähettää');A.strictEqual(rs.u(),4);A.strictEqual(rs.o(),3);
KK.userSet(P,sl.b.id,4,C);A.strictEqual(rs.n(),1,'sama arvo ei lähetä');
KK.userSet(P,sl.b.id,99,C);A.strictEqual(val(P,sl.b.id),10);A.strictEqual(rs.n(),2);A.strictEqual(rs.u(),10,'uusi on rajattu arvo');
KK.userSet(P,sl.b.id,99,C);A.strictEqual(rs.n(),2,'rajattu sama arvo ei lähetä');
// Logiikan Aseta ei lähetä
KK.setVal(P,sl.b.id,1,C);KK.tick(P,C);A.strictEqual(val(P,sl.b.id),1);A.strictEqual(rs.n(),2,'Aseta ei ole käyttäjän muutos');
// Toiminto Aseta samaan säätimeen muuttui-tapahtumasta ei kierrä
var tAs=blk(P,'tee',{do:'aseta',o:sl.b.id,v:'7'});link(P,sl,'mu',tAs,'e');KK.repair(P);
KK.userSet(P,sl.b.id,2,C);A.strictEqual(val(P,sl.b.id),7,'Aseta voittaa');A.strictEqual(rs.n(),3,'yksi tapahtuma, ei kierrettä');

// Valintaruutu ja Kytkin
var ru=blk(P,'ruutu',{v:vw,nm:'Ruutu'}),rr=rig(P,ru),ky=blk(P,'kytkin',{v:vw,nm:'Kytkin'}),rk=rig(P,ky);KK.repair(P);
KK.userSet(P,ru.b.id,true,C);A.strictEqual(rr.n(),1);A.strictEqual(rr.u(),true);A.strictEqual(rr.o(),false);
KK.userSet(P,ru.b.id,false,C);A.strictEqual(rr.n(),2);A.strictEqual(rr.u(),false);
KK.userSet(P,ky.b.id,true,C);A.strictEqual(rk.n(),1);KK.userSet(P,ky.b.id,true,C);A.strictEqual(rk.n(),1);

// Lukukenttä ja Päivämäärä
var lu=blk(P,'luku',{v:vw,nm:'Määrä',start:0}),rl=rig(P,lu),pv=blk(P,'pvm',{v:vw,nm:'Pvm'}),rp=rig(P,pv);KK.repair(P);
KK.userSet(P,lu.b.id,5,C);A.strictEqual(rl.n(),1);A.strictEqual(rl.u(),5);A.strictEqual(rl.o(),0);
KK.userSet(P,pv.b.id,'2026-10-20',C);A.strictEqual(rp.n(),1);A.strictEqual(rp.u().d,'2026-10-20');A.strictEqual(rp.o(),null,'tyhjästä');
KK.userSet(P,pv.b.id,KK.D('2026-10-20'),C);A.strictEqual(rp.n(),1,'sama päivä ei lähetä');
KK.userSet(P,pv.b.id,'',C);A.strictEqual(rp.n(),2,'tyhjennys lähettää');A.strictEqual(rp.u(),null);

// Tekstikenttä: hiljaa kirjoittaessa, muuttui kirjoituksen lopuksi alkuarvosta
var tx=blk(P,'teksti',{v:vw,nm:'Nimi'}),rt=rig(P,tx);KK.repair(P);
var alku=val(P,tx.b.id);['M','Ma','Mat'].forEach(function(v){KK.userSet(P,tx.b.id,v,C,true);});
A.strictEqual(rt.n(),0,'ei joka merkistä');A.strictEqual(KK.muuttui(P,tx.b.id,alku,C),true);A.strictEqual(rt.n(),1);A.strictEqual(rt.u(),'Mat');A.strictEqual(rt.o(),alku);
A.strictEqual(KK.muuttui(P,tx.b.id,'Mat',C),false,'ei muutosta, ei tapahtumaa');A.strictEqual(rt.n(),1);
KK.userSet(P,tx.b.id,'Matti',C);A.strictEqual(rt.n(),2,'ilman hiljaa heti');

// Lista: aina (rivin lisäys ei muuta rastitettujen määrää)
var li=blk(P,'lista',{v:vw,nm:'Lista'}),rli=rig(P,li);KK.repair(P);
var l0=val(P,li.b.id);P.st[li.b.id]={rows:[{id:'r1',tx:'Kauppa',c:false,d:''}]};A.strictEqual(KK.muuttui(P,li.b.id,l0,C,true),true);A.strictEqual(rli.n(),1);
P.st[li.b.id]={rows:[{id:'r1',tx:'Kauppa',c:true,d:''}]};KK.muuttui(P,li.b.id,0,C,true);A.strictEqual(rli.n(),2);A.strictEqual(rli.u(),1);A.strictEqual(rli.o(),0);

// Väärä laji ei tee mitään
A.strictEqual(KK.muuttui(P,Object.keys(P.b).filter(function(i){return P.b[i].k==='muisti';})[0],0,C),false);

// JSON-kierros: nuolet muuttui-kohdasta säilyvät
var P2=JSON.parse(JSON.stringify(P));KK.repair(P2);A.ok(P2.lg.l.some(function(l){return l.fp==='mu';}),'nuoli säilyy');
var n2=val(P2,Object.keys(P2.b).filter(function(i){return P2.b[i].nm==='Laskuri'+sl.b.id;})[0]);KK.userSet(P2,sl.b.id,5,C);
A.strictEqual(val(P2,Object.keys(P2.b).filter(function(i){return P2.b[i].nm==='Laskuri'+sl.b.id;})[0]),n2+1);
console.log('logiikka_59_muuttui ok');
