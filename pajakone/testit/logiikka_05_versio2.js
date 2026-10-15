// Versio 2: VALITSE, JOS:n siirto vanhasta muodosta, käytössä / pois käytöstä, virheet näkyviin, Miksi?, yhteydet ja pikatoimintojen apurit.
var KK=require('./moottori.js'),A=require('assert');
var T=new Date(2026,9,14,9,30),toasts=[];var C={now:function(){return T;},toast:function(t){toasts.push(t);},nav:function(){}};
function N(P,b,g){return KK.addNode(P,b.id,0,0,g||'');}

// --- Vanha JOS (versio 1), joka valitsi myös arvon, muuttuu JOS + VALITSE -pariksi ---
var P=KK.newProject('vanha');
var s=KK.addBlock(P,'saadin',{start:7}),g=KK.addBlock(P,'vert',{op:'gt',b:5});
var j=KK.addBlock(P,'jos',{nm:'Iso vai pieni'});j.nmSet=true;j.a='Iso';j.b='Pieni';
var ns=N(P,s),ng=N(P,g),nj=N(P,j);KK.addLink(P,ns.id,'v',ng.id,'a');P.lg.l.push({id:'lc',f:ng.id,fp:'v',t:nj.id,tp:'c'});
var txt=KK.addBlock(P,'nayta',{tx:'Koko: {#'+j.id+'}'}),nx=N(P,txt);P.lg.l.push({id:'lv',f:nj.id,fp:'v',t:nx.id,tp:'tx'});
var off=KK.addBlock(P,'tee',{do:'ilmoita',tx:'pieneni'}),noff=N(P,off);P.lg.l.push({id:'lm',f:nj.id,fp:'m',t:noff.id,tp:'e'});
KK.repair(P);
var va=Object.keys(P.b).map(function(i){return P.b[i];}).filter(function(b){return b.k==='valitse';})[0];
A.ok(va,'VALITSE syntyi');A.strictEqual(va.a,'Iso');A.strictEqual(va.b,'Pieni');A.strictEqual(va.nm,'Iso vai pieni (arvo)');
A.strictEqual(j.a,undefined,'JOS:lta poistui arvon valinta');A.strictEqual(j.muuten,true,'MUUTEN-nuoli säilyi, joten haara otettiin käyttöön');
A.ok(P.lg.l.some(function(l){return l.id==='lm';}),'MUUTEN-nuoli säilyi');
var E=KK.Ev(P,C);A.strictEqual(E.text(txt.id),'Iso','nuoli tulee nyt VALITSE-palikasta');
A.strictEqual(txt.tx,'Koko: {#'+va.id+'}','tekstin viittaus siirtyi VALITSE-palikkaan');
KK.tick(P,C);KK.userSet(P,s.id,2,C);A.strictEqual(KK.Ev(P,C).text(txt.id),'Pieni');A.deepStrictEqual(toasts,['pieneni'],'MUUTEN toimii yhä');
A.strictEqual(KK.Ev(P,C).val(j.id),false,'JOS:n oma arvo on nyt pätee / ei päde');
// toinen repair ei tee mitään uutta
var cnt=Object.keys(P.b).length;KK.repair(P);A.strictEqual(Object.keys(P.b).length,cnt);
// JOS ilman arvoja ei muutu
var P1=KK.newProject('p');var j1=KK.addBlock(P1,'jos');N(P1,j1);KK.repair(P1);A.strictEqual(Object.keys(P1.b).length,1);

// --- Käytössä / pois käytöstä ---
var P2=KK.newProject('off');toasts=[];
var sw=KK.addBlock(P2,'kytkin'),jj=KK.addBlock(P2,'jos'),il=KK.addBlock(P2,'tee',{do:'ilmoita',tx:'NIIN'});
var nsw=N(P2,sw),njj=N(P2,jj),nil=N(P2,il);KK.addLink(P2,nsw.id,'v',njj.id,'c');KK.addLink(P2,njj.id,'e',nil.id,'e');
A.strictEqual(KK.ports(jj).outs.map(function(p){return p.p;}).join(','),'v,e','MUUTEN piilossa, kunnes otetaan käyttöön');
KK.tick(P2,C);jj.off=true;KK.userSet(P2,sw.id,true,C);A.strictEqual(toasts.length,0,'pois käytöstä oleva JOS ei laukea');
jj.off=false;KK.tick(P2,C);A.strictEqual(toasts.length,0,'käyttöön otto ei laukaise heti, vaikka ehto jo pätee');
KK.userSet(P2,sw.id,false,C);KK.userSet(P2,sw.id,true,C);A.deepStrictEqual(toasts,['NIIN']);
il.off=true;KK.userSet(P2,sw.id,false,C);KK.userSet(P2,sw.id,true,C);A.strictEqual(toasts.length,1,'pois käytöstä oleva toiminto ei tee mitään');
var nap=KK.addBlock(P2,'nappi',{beh:'kerta'}),kn=KK.addBlock(P2,'kun'),i2=KK.addBlock(P2,'tee',{do:'ilmoita',tx:'KUN'});var nn=N(P2,nap),nk=N(P2,kn),ni2=N(P2,i2);
KK.addLink(P2,nn.id,'e',nk.id,'e');KK.addLink(P2,nk.id,'e',ni2.id,'e');kn.off=true;KK.press(P2,nap.id,C);A.strictEqual(toasts.length,1);kn.off=false;KK.press(P2,nap.id,C);A.strictEqual(toasts[toasts.length-1],'KUN');

// --- Virheet näkyvät eivätkä muutu hiljaa nollaksi ---
var P3=KK.newProject('virheet');
var a=KK.addBlock(P3,'luku',{start:4}),z=KK.addBlock(P3,'luku',{start:0}),dv=KK.addBlock(P3,'lasku',{op:'div'});
var na=N(P3,a),nz=N(P3,z),nd=N(P3,dv);KK.addLink(P3,na.id,'v',nd.id,'a');KK.addLink(P3,nz.id,'v',nd.id,'b');
var E3=KK.Ev(P3,C);A.ok(KK.isErr(E3.val(dv.id)));A.strictEqual(E3.fmt(E3.val(dv.id)),'⚠ jako nollalla');
var ge=KK.addBlock(P3,'vert',{op:'ge',b:1}),nge=N(P3,ge);KK.addLink(P3,nd.id,'v',nge.id,'a');
A.strictEqual(KK.Ev(P3,C).val(ge.id).err,'jako nollalla','virhe kulkee vertailun läpi');
var w=KK.addBlock(P3,'ikkuna',{m:'or'}),nw=N(P3,w);var r1=KK.addBlock(P3,'ruutu');KK.addNode(P3,r1.id,0,0,nw.id);KK.addNode(P3,ge.id,0,0,nw.id);
A.ok(KK.isErr(KK.Ev(P3,C).val(w.id)),'ikkunan tulos näyttää sisällä olevan virheen');
KK.userSet(P3,z.id,2,C);A.strictEqual(KK.Ev(P3,C).val(dv.id),2);A.strictEqual(KK.Ev(P3,C).val(w.id),true,'virhe poistuu, kun syy korjataan');
A.strictEqual(KK.calc('mul','kissa',2).err,'”kissa” ei ole luku');A.strictEqual(KK.calc('add',KK.D('2026-10-14'),KK.D('2026-10-15')).err,'kahta päivämäärää ei voi laskea yhteen');
A.strictEqual(KK.truth(KK.ERR('x')),false);A.ok(isNaN(KK.num(KK.ERR('x'))));
var t3=KK.addBlock(P3,'nayta');t3.tx='{#'+t3.id+'}';A.ok(/kehä/.test(KK.Ev(P3,C).text(t3.id)),'kehä näkyy');
var mem=KK.addBlock(P3,'muisti',{v:'5'}),setE=KK.addBlock(P3,'tee',{do:'aseta',o:mem.id,v:{r:dv.id}});N(P3,mem);N(P3,setE);KK.userSet(P3,z.id,0,C);
KK.runAction(P3,setE.id,C);A.strictEqual(KK.Ev(P3,C).val(mem.id),5,'virhettä ei kirjoiteta muistiin');

// --- Yhteydet, toimintojen kuvaus ja Miksi? ---
var P4=KK.newProject('yhteydet');
var btn=KK.addBlock(P4,'nappi',{beh:'kerta',nm:'Lisää'}),pis=KK.addBlock(P4,'luku',{nm:'Pisteet'}),tav=KK.addBlock(P4,'saadin',{nm:'Tavoite',start:3});
var lis=KK.addBlock(P4,'tee',{do:'lisaa',o:pis.id,v:'2'}),nb=N(P4,btn),nl=N(P4,lis);KK.addLink(P4,nb.id,'e',nl.id,'e');
var cmp=KK.addBlock(P4,'vert',{op:'ge',b:{r:tav.id},nm:'Riittää'});cmp.nmSet=true;var np=N(P4,pis),nc=N(P4,cmp);KK.addLink(P4,np.id,'v',nc.id,'a');
var ilm=KK.addBlock(P4,'ilmo',{nk:{m:'kun',r:cmp.id},tx:'Pisteet {#'+pis.id+'}'});
var D=KK.deps(P4);
A.deepStrictEqual(D.uses[cmp.id].map(function(x){return P4.b[x.id].nm+':'+x.how;}).sort(),['Pisteet:nuoli','Tavoite:arvo']);
A.deepStrictEqual(D.usedBy[pis.id].map(function(x){return P4.b[x.id].nm+':'+x.how;}).sort(),['Ilmoitus:teksti','Lisää 2:kohde','Riittää:nuoli']);
A.deepStrictEqual(D.usedBy[cmp.id].map(function(x){return x.how;}),['nk']);
A.strictEqual(KK.descAct(P4,lis.id),'Pisteet + 2');
A.deepStrictEqual(KK.actsFrom(P4,btn.id,'e').map(function(x){return x.id;}),[lis.id]);
var E4=KK.Ev(P4,C);var y=KK.why(P4,E4,cmp.id);A.strictEqual(y.txt,'Pisteet ≥ Tavoite');A.strictEqual(y.ok,false);A.strictEqual(y.kids[0].nm,'Pisteet');A.strictEqual(y.kids[1].nm,'Tavoite');
var wy=KK.addBlock(P4,'ikkuna',{m:'and',nm:'Valmis'}),nwy=N(P4,wy);KK.addNode(P4,cmp.id,0,0,nwy.id);var r2=KK.addBlock(P4,'ruutu',{nm:'Tarkistettu'});var nr2=KK.addNode(P4,r2.id,0,0,nwy.id);nr2.not=true;
var yw=KK.why(P4,KK.Ev(P4,C),wy.id);A.ok(/kaikki/.test(yw.txt));A.ok(/0\/2 pätee|1\/2 pätee/.test(yw.txt),yw.txt);
A.strictEqual(yw.kids.filter(function(k){return k.not;})[0].nm,'Tarkistettu');A.strictEqual(yw.kids.filter(function(k){return k.not;})[0].ok,true,'EI kääntää selityksen');
var yi=KK.why(P4,KK.Ev(P4,C),ilm.id);A.ok(/Näkyy, kun Riittää pätee/.test(yi.txt));A.strictEqual(yi.ok,false);
// tiivistys säilyy tallennuksessa
nwy.col=true;KK.repair(P4);A.strictEqual(KK.nodeOf(P4,nwy.id).col,true);
console.log('ok versio 2');
