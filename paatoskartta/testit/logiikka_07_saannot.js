const E=require('./pt.js');const {evaluate,settle,unreachable,dropOption,normalize,condMet,repair,setKind,relState,setRel,setRec,symmetrize}=E;
let ok=true;function eq(label,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+label+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
function T0(){const T={id:'t1',name:'x',oseq:9,opts:[],suf:{},req:{},rec:{},close:{},sel:[]};
  ['ma','ti','ke','dkt','valm','hoito','sali'].forEach(id=>T.opts.push({id,n:id,note:''}));T.opts.push({id:'P',n:'Päivä valittu',note:'',c:'any'});T.opts.push({id:'C',n:'ehto',note:'',c:'any'});return T;}
const e=(T,sel,id)=>{const x=evaluate(T,sel)[id];return x.s+(x.rec?'+rec':'')+(x.s==='excl'&&!x.vis?'!piilo':'');};
// ---------- näkyvyys: riittää ja vaaditaan, aina neutraali ----------
let T=T0();
eq('ilman ehtoja näkyy heti, neutraalina',[e(T,[],'sali'),evaluate(T,[]).sali.start],['open',true]);
setRel(T,'dkt','valm','ps'); // DKT-tiimin sivulla rivi valm: "riittää tähän"
eq('riittää tähän: tallentuu kohteen riittäviin',[T.suf.valm,relState(T,'dkt','valm'),relState(T,'valm','dkt')],[['dkt'],'ps','rs']);
eq('kohde piilossa ilman, näkyy neutraalina kanssa',[e(T,[],'valm'),e(T,['dkt'],'valm')],['lock','open']);
setRec(T,'dkt','valm',true);eq('suositus erikseen: korostaa näkyvän',[e(T,['dkt'],'valm'),e(T,[],'valm')],['open+rec','lock']);
T=T0();setRel(T,'valm','dkt','rr');eq('vaadittu ehto toiselta sivulta = sama sääntö',[T.req.valm,relState(T,'dkt','valm')],[['dkt'],'pr']);
setRel(T,'valm','ma','rr');eq('kaksi vaadittua: molemmat tarvitaan',[e(T,['dkt'],'valm'),e(T,['ma'],'valm'),e(T,['ma','dkt'],'valm')],['lock','lock','open']);
eq('puuttuvat näkyvät tilassa',evaluate(T,['dkt']).valm.need,{req:['ma'],suf:[],ok:false});
T=T0();['ma','ti','ke'].forEach(x=>setRel(T,'sali',x,'rs'));['dkt','hoito'].forEach(x=>setRel(T,'sali',x,'rr'));
eq('sekaisin: riittävä ei riitä ilman vaadittuja',[e(T,['ma'],'sali'),e(T,['dkt','hoito'],'sali'),e(T,['ma','dkt'],'sali'),e(T,['ti','dkt','hoito'],'sali')],['lock','lock','lock','open']);
// ---------- näkymätön ehto on samanlainen tekijä ----------
T=T0();['ma','ti','ke'].forEach(x=>setRel(T,'P',x,'rs'));['dkt','valm','hoito','sali'].forEach(x=>setRel(T,'P',x,'pr'));
eq('ehdon sivulta: riittävät ehdot ja vaaditaan tähän',[T.suf.P,T.req.dkt,T.req.sali],[['ma','ti','ke'],['P'],['P']]);
eq('alussa vain päivät',['ma','dkt','sali'].map(x=>e(T,[],x)),['open','lock','lock']);
eq('päivä tuo muut näkyviin neutraaleina',['dkt','valm','hoito','sali'].map(x=>e(T,['ti'],x)),['open','open','open','open']);
eq('ehto ei ole valittava',[evaluate(T,['ma']).P,settle(T,['P','ma']).sel],[{s:'cond',met:true},['ma']]);
setRec(T,'ma','hoito',true);eq('maanantai suosittelee, tiistai ei',[e(T,['ma'],'hoito'),e(T,['ti'],'hoito'),e(T,[],'hoito')],['open+rec','open','lock']);
setRel(T,'dkt','valm','ps');eq('vaadittu ehto + riittävä: molemmat tarvitaan',[e(T,['ma'],'valm'),e(T,['ma','dkt'],'valm')],['lock','open']);
setRec(T,'C',' ',true);eq('tuntematon kohde hylätään',setRec(T,'C','xx',true),false);
setRel(T,'C','ma','rr');setRel(T,'C','dkt','rr');setRec(T,'C','sali',true);
eq('ehto suosittelijana, kun se täyttyy',[e(T,['ma'],'sali'),e(T,['ma','dkt'],'sali')],['open','open+rec']);
eq('ehtoa ei voi suositella eikä sulkea pois',[setRec(T,'ma','P',true),setRel(T,'ma','P','close'),setRel(T,'P','C','close')],[false,false,false]);
T=T0();setRel(T,'C','P','rr');setRel(T,'C','dkt','rr');setRel(T,'P','ma','rs');eq('ehto toisen ehdon ehtona',[!!condMet(T,['dkt']).C,!!condMet(T,['ma']).C,!!condMet(T,['ma','dkt']).C],[false,false,true]);
T=T0();eq('ehto ilman ehtoja ei täyty',[!!condMet(T,['ma','ti']).C,unreachable(T)],[false,['P','C']]);
// ---------- poissulku voittaa, suositus alin ----------
T=T0();setRel(T,'ma','ti','close');setRec(T,'ke','ti',true);
eq('poissuljettu ei ole suositeltu',e(T,['ma','ke'],'ti'),'excl');
setRel(T,'ti','dkt','rr');eq('poissuljettu ja ehdot täyttymättä: piiloon',[e(T,['ma'],'ti'),e(T,['ma','dkt'],'ti')],['excl!piilo','excl']);
eq('poissulku on kaksisuuntainen',[T.close.ma,T.close.ti],[['ti'],['ma']]);
setRec(T,'ma','ti',true);eq('suositus korvaa poissulun',[T.close.ma,T.rec.ma],[[],['ti']]);
setRel(T,'ma','ti','close');eq('poissulku poistaa parin suosituksen ja näkyvyyssäännöt',[T.rec.ma,relState(T,'ma','ti')],[[],'close']);
// ---------- kierto ----------
T=T0();const cyc=['ps','pr','rs','rr',''];let seen=[];
for(let i=0;i<6;i++){setRel(T,'ma','sali',cyc[(cyc.indexOf(relState(T,'ma','sali'))+1)%cyc.length]);seen.push(relState(T,'ma','sali')+':'+relState(T,'sali','ma'));}
eq('kierto ja peilikuva toiselta sivulta',seen,['ps:rs','pr:rr','rs:ps','rr:pr',':','ps:rs']);
T=T0();setRec(T,'ma','sali',true);setRec(T,'sali','ma',true);setRel(T,'ma','sali','pr');setRel(T,'ma','sali','');eq('suositukset säilyvät näkyvyyskierron yli',[T.rec.ma,T.rec.sali],[['sali'],['ma']]);
eq('tila korvaa edellisen kokonaan',(setRel(T,'ma','sali','ps'),setRel(T,'ma','sali','rr'),[T.suf.sali||[],T.req.ma]),[[],['sali']]);
// ---------- polku ----------
T=T0();['ma','ti','ke'].forEach(x=>setRel(T,'P',x,'rs'));['dkt','valm'].forEach(x=>setRel(T,'P',x,'pr'));setRel(T,'dkt','valm','ps');setRel(T,'ma','ti','close');
eq('päivän vaihto säilyttää polun',settle(T,['ma','dkt','valm','ti']).sel,['dkt','valm','ti']);
let r=settle(T,['dkt','valm']);eq('päivän poisto pudottaa kaiken',[r.sel,r.removed.map(x=>x.id+':'+x.why)],[[],['dkt:lost','valm:lost']]);
eq('välivaiheen poisto pudottaa sen varassa olevan',settle(T,['ma','valm']).sel,['ma']);
eq('uusin voittaa poissulussa',settle(T,['ma','ti']).removed,[{id:'ma',why:'excl',by:'ti'}]);
// ---------- saavutettavuus ----------
T=T0();setRel(T,'ma','ti','close');setRel(T,'sali','ma','rr');setRel(T,'sali','ti','rr');eq('vaaditut eivät sovi yhteen',unreachable(T),['sali','P','C']);
T=T0();setRel(T,'valm','dkt','rr');setRel(T,'dkt','hoito','rr');setRel(T,'hoito','valm','rr');eq('kehä',unreachable(T),['dkt','valm','hoito','P','C']);
// ---------- lajin vaihto ja poisto ----------
T=T0();setRel(T,'ma','ti','close');setRec(T,'ke','ma',true);setRel(T,'ma','dkt','rr');setRel(T,'sali','ma','rs');T.sel=['dkt','ma'];setKind(T,'ma',true);
eq('vaihtoehdosta ehdoksi: ehdot säilyvät, poissulku ja suositus kohteena pois',[T.close.ti||[],T.rec.ke,T.req.ma,T.suf.sali,T.sel],[[],[],['dkt'],['ma'],['dkt']]);
eq('ja se täyttyy itsestään',[evaluate(T,['dkt']).ma,e(T,['dkt'],'sali')],[{s:'cond',met:true},'open']);
setKind(T,'ma',false);eq('takaisin vaihtoehdoksi',[T.opts[0].c,e(T,[],'ma'),e(T,['dkt'],'ma')],[undefined,'lock','open']);
T=T0();setRel(T,'P','ma','rs');setRel(T,'P','sali','pr');setRec(T,'P','sali',true);dropOption(T,'P');eq('poisto siivoaa ja vapauttaa',[T.suf.P,T.req.sali,T.rec.P,e(T,[],'sali')],[undefined,[],undefined,'open']);
// ---------- vanhat muodot ----------
// versio 7 (edellinen): open, gate, cond (riittävät), req (vaaditut)
let v7={id:'t1',name:'x',oseq:9,opts:[{id:'o1',n:'ma'},{id:'o2',n:'ti'},{id:'o4',n:'dkt'},{id:'o5',n:'valm'},{id:'o6',n:'hoito'},{id:'o7',n:'sali'},{id:'o8',n:'P',c:'any'},{id:'o9',n:'MD',c:'any'}],
  open:{o4:['o5']},close:{o1:['o2'],o2:['o1']},rec:{o1:['o6'],o9:['o7']},cond:{o8:['o1','o2'],o9:[]},req:{o9:['o1','o4']},gate:{o8:['o4','o5','o6','o7']},sel:['o1','o4','o5']};
const before=['o1','o4','o5'];
eq('v7: korjaus muuntaa',[repair(v7),'open' in v7,'gate' in v7,'cond' in v7],[true,false,false,false]);
eq('v7: avaa -> riittää + suosittelee',[v7.suf.o5,v7.rec.o4],[['o4'],['o5']]);
eq('v7: ehdon vaatimus -> vaadittu',[v7.req.o4,v7.req.o5,v7.req.o7],[['o8'],['o8'],['o8']]);
eq('v7: ehdon täyttäjät',[v7.suf.o8,v7.req.o9,v7.suf.o9||[]],[['o1','o2'],['o1','o4'],[]]);
eq('v7: käytös säilyy',[settle(v7,before).sel,e(v7,[],'o4'),e(v7,['o1'],'o4'),e(v7,['o1'],'o6'),e(v7,['o1','o4'],'o5'),e(v7,['o1','o4'],'o7'),e(v7,['o2'],'o6')],[before,'lock','open','open+rec','open+rec','open+rec','open']);
eq('toinen korjaus ei muuta',repair(v7),false);
// versio 5 ja sitä vanhempi: koko ehto 'all'
let v5={id:'t1',name:'x',oseq:3,opts:[{id:'o1',n:'a'},{id:'o2',n:'b'},{id:'o3',n:'E',c:'all'},{id:'o4',n:'x'}],open:{},close:{},rec:{},cond:{o3:['o1','o2']},gate:{o3:['o4']},sel:[]};
repair(v5);eq('v5: all-ehdon täyttäjät vaadituiksi',[v5.req.o3,v5.suf.o3||[],v5.opts[2].c,e(v5,['o1'],'o4'),e(v5,['o1','o2'],'o4')],[['o1','o2'],[],'any','lock','open']);
// versio 2: vain open ja yksisuuntainen close
let v2={id:'t1',name:'x',oseq:3,opts:[{id:'o1',n:'a'},{id:'o2',n:'b'},{id:'o3',n:'c'}],open:{o1:['o2'],o3:['o1']},close:{o1:['o3']},sel:['o1','o2']};
repair(v2);eq('v2: poissulku kaksisuuntaiseksi ja ristiriitainen avaus pois',[v2.close,v2.suf,v2.rec],[{o1:['o3'],o3:['o1']},{o2:['o1'],o1:[]},{o1:['o2']}]);
// tuonti: vanha tiedosto ja uusi tiedosto
const n4=normalize({app:'paatoskartta',version:4,trees:[{id:'t1',name:'A',options:[{id:'o1',name:'a'},{id:'o2',name:'b'},{id:'o3',name:'E',cond:'all'},{id:'o4',name:'x'}],opens:{o1:['o4']},closes:{},recs:{},conds:{o3:['o1','o2']},gates:{o3:['o4']},sel:['o1','o2','o4','o3']}]}).trees[0];
eq('tuonti v4',[n4.req,n4.suf,n4.rec,n4.sel,'open' in n4],[{o3:['o1','o2'],o4:['o3']},{o4:['o1']},{o1:['o4']},['o1','o2','o4'],false]);
const n6=normalize({app:'paatoskartta',version:6,trees:[{id:'t1',name:'A',options:[{id:'o1',name:'a'},{id:'o2',name:'b'},{id:'o3',name:'E',cond:'any'}],sufs:{o2:['o1','oX','o2'],o3:['o1']},reqs:{o2:['o1','o3']},recs:{o1:['o2','o3'],o3:['o2']},closes:{o1:['o3']},sel:[]}]}).trees[0];
eq('tuonti v6: kelvottomat pois, vaadittu voittaa riittävän',[n6.suf,n6.req,n6.rec,n6.close],[{o2:[],o3:['o1']},{o2:['o1','o3']},{o1:['o2'],o3:['o2']},{o1:[]}]);
console.log(ok?'\nKAIKKI OK':'\nVIRHEITÄ');
if(!ok)process.exit(1);
