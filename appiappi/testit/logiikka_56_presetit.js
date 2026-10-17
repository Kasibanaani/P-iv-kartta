// F26: presetit (D12, D13). Presetti on projektista riippumaton kopio palikkajoukosta: näkymän ja logiikan palikat yhdessä.
// Liitettäessä kaikki tehdään uusina (irtokopio), viittaukset presetin sisällä osoittavat uusiin, ulkopuoliset viittaukset
// näkyvät katkenneina (D08) eivätkä sitoudu samannimiseen, ja sisältö tulee mukaan vain valinnalla.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,17,10,0,0).getTime();
var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function val(P,id){return KK.Ev(P,C).val(id);}
function nodeIn(P,b,x,y){return KK.addNode(P,b.id,x||0,y||0);}
function named(P,nm){return Object.keys(P.b).map(function(i){return P.b[i];}).filter(function(b){return b.nm===nm;})[0];}

// Lähdeprojekti: Plus-painike lisää muistiin pisteet kertoimen verran, teksti näyttää pisteet. Kerroin jää presetin ulkopuolelle.
var S=KK.newProject('lähde'),vw=S.views[0].id;
var nap=KK.addBlock(S,'nappi',{v:vw,tx:'Plus'});nap.x=100;nap.y=200;KK.setName(S,nap.id,'Plus');
var txt=KK.addBlock(S,'nayta',{v:vw});txt.x=100;txt.y=260;KK.setName(S,txt.id,'Pisteteksti');
var mem=KK.addBlock(S,'muisti',{});KK.setName(S,mem.id,'Pisteet');
var ker=KK.addBlock(S,'arvo',{v:'2'});KK.setName(S,ker.id,'Kerroin');nodeIn(S,ker,-300,0);
txt.tx=KK.toIds(S,'Pisteet: {pisteet}');
var tee=KK.addBlock(S,'tee',{do:'lisaa',o:mem.id});tee.v=KK.kaavaToIds(S,'kerroin');
var nN=nodeIn(S,nap,0,0),nT=nodeIn(S,tee,250,0);nodeIn(S,mem,500,0);
A.ok(KK.addLink(S,nN.id,'e',nT.id,'e'),'nuoli painettu → toiminto');
// Taulukko, jossa valmis rivi; toinen nuoli ulos presetistä
var tau=KK.addBlock(S,'taulu',{nm:'Ostokset'});var c1=KK.addCol(tau,'Nimi','teksti');nodeIn(S,tau,0,200);
var rid=KK.tAddRow(S,tau.id,false);KK.tEdit(S,tau.id,false,rid,c1.id,'Maito',new Date(NOW));
var ulko=KK.addBlock(S,'tee',{do:'aseta',o:ker.id,v:'5'});var nU=nodeIn(S,ulko,250,300);A.ok(KK.addLink(S,nN.id,'e',nU.id,'e'));
KK.repair(S);KK.press(S,nap.id,C);KK.tick(S,C);A.strictEqual(val(S,mem.id),2,'lähde toimii: 0 + 2');

// Joukko: näkymästä Plus ja teksti valittuna, logiikasta toiminto, muisti ja taulukko. Plussan solmu tulee mukaan itsestään.
var set=KK.presetSet(S,[nap.id,txt.id],[nT.id,KK.nodesOfBlock(S,mem.id)[0].id,KK.nodesOfBlock(S,tau.id)[0].id]);
A.strictEqual(set.b.length,5,'5 palikkaa: '+set.b.map(function(i){return S.b[i].nm;}));A.ok(set.n.indexOf(nN.id)>=0,'Plussan solmu mukana');A.ok(set.n.indexOf(nU.id)<0,'ulkopuolinen toiminto ei');
var need=KK.presetNeeds(S,set);
A.ok(need.some(function(x){return x.to===ker.id&&x.id===tee.id;}),'kerroin tarvitaan toiminnossa: '+JSON.stringify(need));
A.ok(need.some(function(x){return x.how==='nuoli'&&x.to===ulko.id;}),'nuoli ulos luetellaan');

// Ilman sisältöä: taulukon rivit ja muistin arvo eivät tule
var pr=KK.presetMake(S,[nap.id,txt.id],[nT.id,KK.nodesOfBlock(S,mem.id)[0].id,KK.nodesOfBlock(S,tau.id)[0].id],{nm:'Pistelaskuri'});
A.strictEqual(pr.nm,'Pistelaskuri');A.strictEqual(pr.pv,KK.PRESVER);A.strictEqual(Object.keys(pr.b).length,5);A.strictEqual(pr.l.length,1,'vain sisäinen nuoli');
A.deepStrictEqual(pr.b[tau.id].rv,[],'ei rivejä');A.deepStrictEqual(pr.st,{},'ei käyttötietoa');A.ok(pr.ext[ker.id]&&pr.ext[ker.id].vt==='kerroin');A.strictEqual(pr.xl.length,1);
var pr2=JSON.parse(JSON.stringify(pr)); // tallennus ja luku tekstinä

// Kohdeprojekti, jossa on jo samanniminen Kerroin ja Pisteet: niihin ei sitouduta, nimet muuttuvat
var T=KK.newProject('kohde'),tv=T.views[0].id;
var omaK=KK.addBlock(T,'arvo',{v:'10'});KK.setName(T,omaK.id,'Kerroin');var omaP=KK.addBlock(T,'muisti',{});KK.setName(T,omaP.id,'Pisteet');nodeIn(T,omaK,0,0);nodeIn(T,omaP,0,60);
var vanha=KK.addBlock(T,'nayta',{v:tv});vanha.z=7;
var r=KK.presetPaste(T,pr2,{v:tv,x:20,y:30,lx:400,ly:50});
A.strictEqual(r.b.length,5,'5 uutta palikkaa');A.strictEqual(r.n.length,4);
r.b.forEach(function(i){A.ok(!S.b[i]||S.b[i]!==T.b[i]);A.notStrictEqual(i,omaK.id);A.notStrictEqual(i,omaP.id);});
var nP=named(T,'Plus'),nTx=named(T,'Pisteteksti'),nM=T.b[r.b.filter(function(i){return T.b[i].k==='muisti';})[0]];
A.ok(nP&&nTx&&nM,'palikat löytyvät');A.strictEqual(nM.nm,'Pisteet 2','samanniminen nimetään uudelleen: '+nM.nm);A.notStrictEqual(nM.vt,'pisteet');
A.strictEqual(nP.v,tv);A.deepStrictEqual([nP.x,nP.y,nTx.x,nTx.y],[20,30,20,90],'suhteelliset paikat säilyvät');A.ok(nP.z>7&&nTx.z>7,'päällimmäisiksi');
A.ok(nTx.tx.indexOf('{#'+nM.id+'}')>=0,'teksti osoittaa uuteen muistiin: '+nTx.tx);
var nTee=T.b[r.b.filter(function(i){return T.b[i].k==='tee';})[0]];A.strictEqual(nTee.o,nM.id,'toiminto osoittaa uuteen muistiin');
// Kerroin: katkennut viite, ei kohteen omaa Kerrointa
A.ok(nTee.v.indexOf('{#'+omaK.id+'}')<0,'ei sitoudu samannimiseen: '+nTee.v);
var br=KK.brokenRefs(T);A.ok(br.some(function(x){return x.id===nTee.id&&x.nm==='kerroin';}),'katkennut näkyy: '+JSON.stringify(br));
A.ok(r.gone.some(function(x){return x.id===nTee.id&&x.nm==='kerroin';}),'liittäminen kertoo puuttuvan');A.strictEqual(r.xl.length,1,'nuoli ulos kerrotaan');
// Nuoli ja painallus toimivat uudessa projektissa; kerroin puuttuu, joten lisäys ei arvaa
var nt=KK.Ev(T,C);A.ok(/^Pisteet: /.test(nt.text(nTx.id)),'tyhjä muisti');
A.strictEqual(T.lg.l.length,1);var lk=T.lg.l[0];A.strictEqual(KK.nodeOf(T,lk.f).p,nP.id);A.strictEqual(KK.nodeOf(T,lk.t).p,nTee.id);
// Kerroin valitaan Viitevirheistä: relink → toimii
var gid=br.filter(function(x){return x.id===nTee.id;})[0].gone;A.ok(KK.relink(T,nTee.id,gid,omaK.id));
KK.press(T,nP.id,C);KK.tick(T,C);A.strictEqual(val(T,nM.id),10,'0 + 10 kohteen kertoimella');
// Logiikan paikka: vasen yläkulma (lx, ly)
var xs=r.n.map(function(i){return KK.nodeOf(T,i);}).filter(function(n){return !n.g;});
A.strictEqual(Math.min.apply(null,xs.map(function(n){return n.x;})),400);A.strictEqual(Math.min.apply(null,xs.map(function(n){return n.y;})),50);
A.deepStrictEqual(T.b[r.b.filter(function(i){return T.b[i].k==='taulu';})[0]].rv,[],'ei rivejä');

// Toinen liittäminen samaan projektiin on toisistaan riippumaton
var r2=KK.presetPaste(T,pr2,{v:tv,x:300,y:30,lx:400,ly:400});var m2=T.b[r2.b.filter(function(i){return T.b[i].k==='muisti';})[0]];
A.notStrictEqual(m2.id,nM.id);A.strictEqual(val(T,m2.id),null,'uusi muisti tyhjä');A.strictEqual(val(T,nM.id),10,'ensimmäinen ennallaan');
// Presetin muutos ei muuta jo liitettyä (irtokopio)
pr2.b[txt.id].tx='Muutettu';A.ok(nTx.tx.indexOf('Pisteet')===0);

// Sisältö valinnalla: taulukon nykyiset rivit ja muistin arvo
var pr3=KK.presetMake(S,[],[KK.nodesOfBlock(S,tau.id)[0].id,KK.nodesOfBlock(S,mem.id)[0].id],{nm:'Sisältö',sis:true});
A.strictEqual(pr3.b[tau.id].rv.length,1);A.strictEqual(pr3.st[mem.id],2);
var U=KK.newProject('kolmas');var r3=KK.presetPaste(U,JSON.parse(JSON.stringify(pr3)),{v:U.views[0].id});
var t3=U.b[r3.b.filter(function(i){return U.b[i].k==='taulu';})[0]],m3=U.b[r3.b.filter(function(i){return U.b[i].k==='muisti';})[0]];
A.strictEqual(KK.tRows(U,t3.id).length,1,'rivi tuli');A.strictEqual(val(U,m3.id),2,'muistin arvo tuli');
A.strictEqual(Object.keys(U.pois||{}).length,0,'ei katkenneita');

// Pelkkä logiikka (ikkuna sisältöineen) ja pelkkä näkymä
var W=KK.newProject('w'),ik=KK.addBlock(W,'ikkuna',{m:'and'}),nI=KK.addNode(W,ik.id,100,100),a1=KK.addBlock(W,'arvo',{v:'1'}),nA=KK.addNode(W,a1.id,120,140,nI.id);
var prW=KK.presetMake(W,[],[nI.id],{nm:'Ikkuna'});A.strictEqual(prW.n.length,2,'sisältö mukana');
var Z=KK.newProject('z');var rz=KK.presetPaste(Z,prW,{lx:0,ly:0});var zi=rz.n.map(function(i){return KK.nodeOf(Z,i);});
var inner=zi.filter(function(n){return n.g;})[0],outer=zi.filter(function(n){return !n.g;})[0];A.ok(inner&&outer&&inner.g===outer.id,'sisältö uuden ikkunan sisällä');
A.deepStrictEqual([outer.x,outer.y,inner.x,inner.y],[0,0,20,40],'sisältö siirtyy ikkunan mukana');
var prV=KK.presetMake(S,[txt.id],[],{nm:'Teksti'});A.strictEqual(prV.n.length,0);A.ok(prV.ext[mem.id],'muisti ulkopuolella');
var rv=KK.presetPaste(Z,prV,{v:Z.views[0].id,x:5,y:5});A.strictEqual(rv.b.length,1);A.ok(KK.brokenRefs(Z).length===1,'teksti viittaa puuttuvaan');
// Vanha tai rikkinäinen presetti ei kaada
A.deepStrictEqual(KK.presetPaste(Z,null,{}).b,[]);A.deepStrictEqual(KK.presetPaste(Z,{b:{x:{k:'tuntematon'}}},{}).b,[]);
console.log('ok presetit');
