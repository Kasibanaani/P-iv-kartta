// Jonon 1q (kartoitus 7, S1): kaavan yleissanat (käynnissä, rastitettuja, merkintöjä, tulos, rivejä) kelpaavat vain, kun palikan
// kohta oikeasti on sen niminen; muuten tavallinen virhe "tuntematon ominaisuus". Sekuntikellon käy = käynnissä.
var KK=require('./moottori.js'),A=require('assert');
var T=1000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function N(P,b){return KK.addNode(P,b.id,0,0,'');}
function E(P){return KK.Ev(P,C);}
function err(v,s){A.ok(KK.isErr(v),s+' pitäisi olla virhe, oli '+JSON.stringify(v));A.ok(/tuntematon ominaisuus/.test(v.err),s+' → '+v.err);}

// --- 1. Väärä laji: virhe, ei hiljaista arvoa ---
var P=KK.newProject('y');var v0=P.views[0].id;
var sa=KK.addBlock(P,'saadin',{v:v0,nm:'Uni',min:0,max:12,start:7});
var li=KK.addBlock(P,'liike',{nm:'Liike'});N(P,li);
var mu=KK.addBlock(P,'muutos',{nm:'Muutos'});N(P,mu);
var ta=KK.addBlock(P,'taulu',{nm:'Taulu'});N(P,ta);
var al=KK.addBlock(P,'alue',{v:v0,nm:'Alue'});
KK.repair(P);
err(E(P).prop(sa.id,'käynnissä'),'säädin.käynnissä');err(E(P).prop(sa.id,'rastitettuja'),'säädin.rastitettuja');err(E(P).prop(sa.id,'merkintöjä'),'säädin.merkintöjä');
err(E(P).prop(li.id,'käynnissä'),'liike.käynnissä');err(E(P).prop(mu.id,'tulos'),'muutos.tulos');err(E(P).prop(al.id,'rivejä'),'alue.rivejä');
A.strictEqual(E(P).prop(mu.id,'käynnissä'),false,'muutos.käynnissä on oma ominaisuus');
// Kaavassa sama virhe näkyy kaavan tuloksena
var k=KK.addBlock(P,'kaava');k.f=KK.kaavaToIds(P,'liike.käynnissä');N(P,k);KK.repair(P);A.ok(KK.isErr(E(P).val(k.id)),'kaava liike.käynnissä on virhe');

// --- 2. Oikea laji: ennallaan ---
var Q=KK.newProject('o');var w0=Q.views[0].id;
var ls=KK.addBlock(Q,'lista',{v:w0,nm:'Lista'});var ai=KK.addBlock(Q,'aika',{v:w0,nm:'Aika'});var ke=KK.addBlock(Q,'ketju',{nm:'Ketju'});N(Q,ke);
var aj=KK.addBlock(Q,'ajastin',{nm:'Ajastin'});N(Q,aj);var ja=KK.addBlock(Q,'jana',{nm:'Jana'});N(Q,ja);KK.repair(Q);
A.strictEqual(E(Q).prop(ls.id,'rastitettuja'),0);A.strictEqual(E(Q).prop(ls.id,'rivejä'),E(Q).prop(ls.id,'rivit'));A.ok(!KK.isErr(E(Q).prop(ls.id,'rivit')));
A.strictEqual(E(Q).prop(ai.id,'merkintöjä'),0);A.strictEqual(E(Q).prop(ke.id,'käynnissä'),false);A.ok(!KK.isErr(E(Q).prop(ke.id,'tulos')));
A.strictEqual(E(Q).prop(aj.id,'käynnissä'),false);A.strictEqual(E(Q).prop(ja.id,'käynnissä'),false);

// --- 3. Sekuntikello: käynnissä = käy (kyllä/ei), ei kulunutta aikaa ---
var R=KK.newProject('k');var kl=KK.addBlock(R,'kello',{nm:'Kello'});N(R,kl);
function nappi(kohde,port){var n=KK.addBlock(R,'nappi',{v:R.views[0].id,beh:'kerta'});KK.addLink(R,N(R,n).id,'e',KK.nodesOfBlock(R,kohde.id)[0].id,port);return n;}
var go=nappi(kl,'e'),st=nappi(kl,'x');KK.repair(R);
A.strictEqual(E(R).prop(kl.id,'käynnissä'),false,'ennen käyntiä');
KK.press(R,go.id,C);T+=5000;A.strictEqual(E(R).prop(kl.id,'käynnissä'),true,'käydessä');A.strictEqual(E(R).prop(kl.id,'kaynnissa'),true,'ilman ä:tä');
KK.press(R,st.id,C);A.strictEqual(E(R).prop(kl.id,'käynnissä'),false,'pysäytettynä ei, vaikka kulunut 5');A.strictEqual(E(R).val(kl.id),5);
A.deepStrictEqual(KK.omat(kl).map(function(e){return e.n;}).slice(0,3),['arvo','käy','kulunut'],'nimi ennallaan, käynnissä rinnakkaisnimi');
var kk=KK.addBlock(R,'kaava');kk.f=KK.kaavaToIds(R,'kello.käynnissä');N(R,kk);KK.repair(R);A.strictEqual(E(R).val(kk.id),false);

// --- 3b. Joukon kautta (15c): #x.käynnissä.summa ei laske kulunutta aikaa eikä väärän lajin arvoa ---
var J=KK.newProject('j');var j1=KK.addBlock(J,'kello',{nm:'K1'});N(J,j1);var j2=KK.addBlock(J,'kello',{nm:'K2'});N(J,j2);var j3=KK.addBlock(J,'saadin',{v:J.views[0].id,nm:'S',start:7});KK.repair(J);
A.strictEqual(KK.setTunnus(J,j1.id,'#kellot'),'');A.strictEqual(KK.setTunnus(J,j2.id,'#kellot'),'');KK.repair(J);
function JK(s){var k=KK.addBlock(J,'kaava');k.f=KK.kaavaToIds(J,s);N(J,k);KK.repair(J);return E(J).val(k.id);}
var jg=KK.addBlock(J,'nappi',{v:J.views[0].id,beh:'kerta'});KK.addLink(J,N(J,jg).id,'e',KK.nodesOfBlock(J,j1.id)[0].id,'e');KK.repair(J);KK.press(J,jg.id,C);T+=3000;
A.strictEqual(JK('#kellot.käynnissä.summa'),1,'yksi kello käy (ei 3 s kulunutta)');
A.strictEqual(KK.setTunnus(J,j3.id,'#kellot'),'');KK.repair(J);A.ok(KK.isErr(JK('#kellot.käynnissä.summa'))||JK('#kellot.käynnissä.summa')===1,'Säädin ei tuo arvoaan 7 käynnissä-summaan');

// --- 4. Kaikki lajit: yleissana antaa joko virheen tai palikan oman, samannimisen arvon ---
var YS=['käynnissä','rastitettuja','merkintöjä','tulos','rivejä','rivit','kaikki','viimeisin'];var n=0;
Object.keys(KK.K).forEach(function(lj){var S=KK.newProject('s');var o=KK.K[lj].g==='ui'?{v:S.views[0].id}:{};var b;try{b=KK.addBlock(S,lj,o);}catch(e){return;}
  if(KK.K[lj].g!=='ui')N(S,b);KK.repair(S);var ev=E(S);
  YS.forEach(function(w){var v;try{v=ev.prop(b.id,w);}catch(e){A.fail(lj+'.'+w+' heitti: '+e.message);}
    if(KK.isErr(v))return;n++;if(process.env.NAYTA)console.log(lj+'.'+w,JSON.stringify(v));
    var oma=KK.omat(b).some(function(e){return e.n===w||(e.al||[]).indexOf(w)>=0||String(e.n).split(', ').indexOf(w)>=0;});
    var dyn=lj==='taulu'||lj==='joukko'||lj==='trivi'||lj==='tapaht'||lj==='aika'||lj==='lista'||lj==='satu'||lj==='kayra';
    A.ok(oma||dyn,lj+'.'+w+' antoi arvon '+JSON.stringify(v)+' ilman samannimistä ominaisuutta');
    if(w==='käynnissä')A.strictEqual(typeof v,'boolean',lj+'.käynnissä on kyllä/ei');});});
A.ok(n>=8,'arvoja löytyi oikeilta lajeilta ('+n+')');
console.log('yleissanat ok',n);
