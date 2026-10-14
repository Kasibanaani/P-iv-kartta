// Versio 17: kanvaasin JOS, KUN, JOS-/KUN-ikkuna ja toiminto pois käytöstä (off), sekä virheiden kirjaus (jako nollalla, teksti luvun
// paikalla, kaavan jako nollalla, laskun osamäärä nollalla). Arvot pysyvät samoina kuin ennen, joten julkaistu appi toimii ennallaan.
const E=require('./moottori.js');
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
const P=E.newProject('V17');const add=(t,n,x)=>{const o=E.newObj(P,t,'s1',n);Object.assign(o,x||{});P.objs.push(o);return o;};
const saa=add('slider','Säädin',{min:0,max:10,start:5}),pis=add('counter','Pisteet'),nap=add('choice','Nappi',{beh:'hold'}),hit=add('counter','Osumat');
const nolla=add('slider','Nolla',{min:0,max:10,start:0}),kaava=add('calc','Kaava',{mode:'f',f:'[Säädin]/[Nolla]'}),koko=add('calc','Osamäärä',{mode:'agg',agg:{op:'div',ids:[saa.id,nolla.id]}});
let q=0;const N=(k,x)=>{q++;return Object.assign({id:'n'+q,k:k,x:q*10,y:0,g:''},x||{});},L=(f,fp,t,tp)=>{q++;return {id:'l'+q,f:f,fp:fp,t:t,tp:tp};};
const ns=N('p',{o:saa.id}),ngt=N('op',{op:'gt',b:3}),jos=N('jos'),aplus=N('a',{a:{do:'add',o:pis.id,v:1}});
const nn=N('p',{o:nap.id}),kun=N('kun'),ahit=N('a',{a:{do:'add',o:hit.id,v:1}});
const wj=N('w',{m:'and',j:'jos',w:260,h:150}),ns2=N('p',{o:saa.id,g:'n9'}),nge=N('op',{op:'ge',b:8,g:'n9'}),a2=N('a',{a:{do:'add',o:pis.id,v:10}});
// wj on n9: tarkista
const ns3=N('p',{o:saa.id}),n0=N('p',{o:nolla.id}),ndiv=N('op',{op:'div'}),nkis=N('c',{v:'kissa'}),nmul=N('op',{op:'mul',b:2}),nsub=N('op',{op:'sub',a:'koira',b:1}),nlt=N('op',{op:'eq',a:'kissa',b:'kissa'});
P.kv={n:[ns,ngt,jos,aplus,nn,kun,ahit,wj,ns2,nge,a2,ns3,n0,ndiv,nkis,nmul,nsub,nlt],l:[
  L(ns.id,'v',ngt.id,'a'),L(ngt.id,'v',jos.id,'c'),L(jos.id,'e',aplus.id,'e'),
  L(nn.id,'act',kun.id,'e'),L(kun.id,'e',ahit.id,'e'),
  L(ns2.id,'v',nge.id,'a'),L(wj.id,'e',a2.id,'e'),
  L(ns3.id,'v',ndiv.id,'a'),L(n0.id,'v',ndiv.id,'b'),L(nkis.id,'v',nmul.id,'a')],seq:q};
eq('JOS-ikkunan tunniste',wj.id,'n8');ns2.g=wj.id;nge.g=wj.id;
jos.off=true;kun.off=true;wj.off=true;ahit.off='kyllä';nlt.off=true;
E.repair(P);
eq('repair: off säilyy JOSilla, KUNilla ja JOS-ikkunalla, väärä arvo ja vertailun off poistuvat',[jos.off,kun.off,wj.off,'off' in ahit,'off' in nlt],[true,true,true,false,false]);
let C=E.compile(P);const R=st=>E.evaluate(C,st).R;let st={sel:[],vals:{}};
const step=(acts,hold)=>E.change(C,st,E.metSet(C,st,hold),acts,hold);
step([{do:'set',o:saa.id,v:9}]);
eq('pois käytöstä: JOS ja JOS-ikkuna eivät laukaise, arvo lasketaan silti',[R(st).value(pis.id),R(st).kv(jos.id),R(st).kv(wj.id)],[0,1,1]);
step(E.evActs(C,nap,'act'));eq('pois käytöstä: KUN ei päästä tapahtumaa läpi',R(st).value(hit.id),0);
delete jos.off;delete kun.off;delete wj.off;C=E.compile(P);
step([]);eq('käyttöön otto ei laukaise heti, vaikka ehto jo pätee',R(st).value(pis.id),0);
step([{do:'set',o:saa.id,v:2}]);step([{do:'set',o:saa.id,v:9}]);eq('käytössä: JOS (+1) ja JOS-ikkuna (+10) laukeavat',R(st).value(pis.id),11);
step(E.evActs(C,nap,'act'));eq('käytössä: KUN päästää läpi',R(st).value(hit.id),1);
aplus.off=true;C=E.compile(P);step([{do:'set',o:saa.id,v:1}]);step([{do:'set',o:saa.id,v:5}]);eq('toiminto pois käytöstä: JOS laukeaa, mutta +1 ei tapahdu',R(st).value(pis.id),11);
// virheet
const r=R(st);
eq('jako nollalla: arvo tyhjä kuten ennen, virhe kirjataan',[r.kv(ndiv.id),r.kerr[ndiv.id]],[null,'jako nollalla']);
eq('teksti luvun paikalla: arvo kuten ennen (0), virhe kirjataan',[r.kv(nmul.id),r.kerr[nmul.id]],[0,'”kissa” ei ole luku']);
eq('kirjoitettu teksti vähennyslaskussa',[r.kv(nsub.id),r.kerr[nsub.id]],[-1,'”koira” ei ole luku']);
eq('vertailussa teksti on sallittu',[r.kv(nlt.id),r.kerr[nlt.id]],[1,undefined]);
eq('kaavan jako nollalla',[r.value(kaava.id),r.verr[kaava.id]],[null,'jako nollalla']);
eq('laskun osamäärä nollalla',[r.value(koko.id),r.verr[koko.id]],[null,'jako nollalla']);
step([{do:'set',o:nolla.id,v:2}]);const r2=R(st);
eq('virhe poistuu, kun syy korjataan',[r2.kv(ndiv.id),'kerr' in r2&&ndiv.id in r2.kerr,r2.value(kaava.id),kaava.id in r2.verr],[2.5,false,2.5,false]);
process.exit(ok?0:1);
