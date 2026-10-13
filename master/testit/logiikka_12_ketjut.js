// Versio 15: ketjut. Ehto = ketju (JOS req + TAI suf → NIIN act). Pois käytöstä (off), laukaisimien nollaus laukeamisen jälkeen (rst),
// vertailuarvo palikasta {r: id} säännöissä, tekstinä ja kaavana, viittaukset ja siivous.
const E=require('./moottori.js');
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
const P=E.newProject('V15');const add=(t,n,x)=>{const o=E.newObj(P,t,'s1',n);Object.assign(o,x||{});P.objs.push(o);return o;};
const pis=add('counter','Pisteet');const tav=add('slider','Tavoite',{min:0,max:20,start:5});const voitot=add('counter','Voitot');
const ovi=add('trig','Ovi');const avain=add('flag','Avain');const sisalla=add('counter','Sisällä');
const voitto=add('cond','Voitto',{req:[{o:pis.id,op:'ge',v:{r:tav.id}}],act:[{do:'add',o:voitot.id,v:1}]});
const vali=add('cond','Välillä',{req:[{o:pis.id,op:'btw',v:{r:tav.id},v2:10}]});
const sisaan=add('cond','Sisään',{req:[{o:ovi.id,op:'on'},{o:avain.id,op:'on'}],act:[{do:'add',o:sisalla.id,v:1}],rst:true});
const rikki=add('cond','Rikki',{req:[{o:pis.id,op:'ge',v:{r:'eiole'}}],off:false,rst:'kyllä'});
eq('repair: kelvoton vertailuviittaus → 0, turhat kentät pois',[E.repair(P),rikki.req[0].v,'off' in rikki,'rst' in rikki,sisaan.rst],[true,0,false,false,true]);
let C=E.compile(P);const R=st=>E.evaluate(C,st).R;let st={sel:[],vals:{}};
eq('pisteet 0 < tavoite 5: ei voittoa',R(st).met(voitto.id),false);
E.change(C,st,E.metSet(C,st),[{do:'set',o:pis.id,v:5}]);eq('pisteet 5 ≥ tavoite 5: voitto ja toiminto',[R(st).met(voitto.id),R(st).value(voitot.id)],[true,1]);
eq('välillä tavoite–10',R(st).met(vali.id),true);
st.vals[tav.id]=8;eq('tavoite 8: ei enää voittoa eikä välillä',[R(st).met(voitto.id),R(st).met(vali.id)],[false,false]);
eq('sääntö tekstinä ja kaavana',[E.clauseText(C,voitto.req[0]),E.clauseText(C,vali.req[0]),E.toFormula(P,{mode:'if',cases:[{when:vali.req,out:{k:'num',v:1}}],els:{k:'num',v:0}})],['Pisteet on vähintään Tavoite','Pisteet on välillä Tavoite–10','JOS(JA([Pisteet]>=[Tavoite];[Pisteet]<=10);1;0)']);
// pois käytöstä
st.vals[tav.id]=5;voitto.off=true;E.repair(P);C=E.compile(P);eq('pois käytöstä: ei täyty',R(st).met(voitto.id),false);
E.change(C,st,E.metSet(C,st),[{do:'set',o:pis.id,v:0}]);E.change(C,st,E.metSet(C,st),[{do:'set',o:pis.id,v:9}]);eq('pois käytöstä: toiminto ei tapahdu',R(st).value(voitot.id),1);
delete voitto.off;E.repair(P);C=E.compile(P);
// laukaisin + lippu, nollaus laukeamisen jälkeen
E.change(C,st,E.metSet(C,st),[{do:'fire',o:ovi.id}]);eq('ovi ilman avainta: ei sisään',R(st).value(sisalla.id),0);
E.change(C,st,E.metSet(C,st),[{do:'select',o:avain.id}]);eq('avain otetaan, ovi on yhä lauennut: sisään kerran, ovi nollautui',[R(st).value(sisalla.id),R(st).value(ovi.id)],[1,0]);
E.change(C,st,E.metSet(C,st),[{do:'fire',o:ovi.id}]);eq('uusi kulku ovesta: sisään uudestaan',[R(st).value(sisalla.id),R(st).value(ovi.id)],[2,0]);
sisaan.rst=false;E.repair(P);C=E.compile(P);E.change(C,st,E.metSet(C,st),[{do:'fire',o:ovi.id}]);E.change(C,st,E.metSet(C,st),[{do:'fire',o:ovi.id}]);
eq('ilman nollausta laukeaa vain kerran',[R(st).value(sisalla.id),R(st).value(ovi.id)],[3,1]);
eq('usedBy: Tavoite löytyy vertailuista',E.usedBy(P,tav.id).map(id=>P.objs.find(o=>o.id===id).n).sort(),['Voitto','Välillä']);
E.dropObj(P,tav.id);eq('poisto: vertailuviittaus → 0',[voitto.req[0].v,vali.req[0].v],[0,0]);
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
