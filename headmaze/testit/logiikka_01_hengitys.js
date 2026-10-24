// Hengitysharjoituksen laskenta: aika ensimmäisestä painalluksesta viimeiseen irrotukseen, suhde, palkki elää käytön mukaan, tallennusmuodon korjaus, repliikit, Minä-polku.
const H=require('./hm.js');
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
let S=H.newSession(10);
[[10,17],[19,26],[27.5,32]].forEach(([d,u])=>{H.press(S,d);H.press(S,d+1);H.release(S,u);H.release(S,u+1);});
const r=H.finish(S,'x');
eq('ulos-ajat',r.out,[7,7,4.5]);
eq('irti-ajat (yksi vähemmän)',r.inn,[2,1.5]);
eq('kesto ensimmäisestä painalluksesta viimeiseen irrotukseen',r.dur,22);
eq('suhde = ulos yhteensä ÷ irti yhteensä',Math.round(H.ratio(r)*100)/100,5.29);
eq('alkupalkki 10 s',H.newData().target,10);
eq('palkki nousee heti keskiarvo + 5 %: 10 → 22,4',H.nextTarget(10,{out:[20,22,22]}),22.4);
eq('palkki laskee vain puolet erosta: 10 → (10 + 6,3) / 2',H.nextTarget(10,{out:[6,6,6]}),8.2);
eq('yksi uloshengitys: suhde puuttuu',H.ratio(H.finish((()=>{const s=H.newSession(6);H.press(s,0);H.release(s,5);return s})())),null);
eq('ei painalluksia → ei tallenneta',H.finish(H.newSession(6)),null);
eq('muotoilu pilkulla',[H.fmt(6.25),H.fmtRatio(5.4286),H.fmt(null),H.fmtTime(83.7)],['6,3','5,43','–','1:23']);
const n=H.normalize({ver:2,target:'abc',sessions:[{out:[5,'x',-1],inn:[2],target:4},{out:[]},null]});
eq('korjaus: huono palkki → oletus, rikkinäiset luvut nollaksi, tyhjät pois',[n.target,n.sessions.length,n.sessions[0].out,n.sessions[0].hits],[10,1,[5,0,0],1]);
eq('versio 1: käsin säädetty palkki lasketaan viimeisestä harjoituksesta (10 → 9,2)',H.normalize({ver:1,target:30,sessions:[{out:[8,8],inn:[2],target:6}]}).target,9.2);
eq('versio 1 ilman harjoituksia: palkki 10 s',H.normalize({target:6,sessions:[]}).target,10);
eq('varmuuskopion kääre luetaan',H.normalize({app:'headmaze',data:{ver:2,target:8,sessions:[]}}).target,8);
eq('pelin asetukset: tuntematon kartta ja hippamäärä oletuksiin, ennätys säilyy',(()=>{const o=H.normalize({ver:2,peli:{kartta:'kuu',hipat:7,best:{'talo:2':61,'x':'y'}}}).peli;return [o.kartta,o.hipat,o.best]})(),['talo',2,{'talo:2':61}]);
// repliikit
let tot=0;for(const k in H.LINES)tot+=H.LINES[k].length;
eq('repliikkejä vähintään 160',tot>=160,true);
const bags={},rng=H.rngOf(3),seen=new Set();for(let i=0;i<H.LINES.idle.length;i++)seen.add(H.bagPick(bags,'idle',rng));
eq('pussista: jokainen idle-repliikki kerran ennen toistoa',seen.size,H.LINES.idle.length);
let rep=0,prev=null;for(let i=0;i<500;i++){const x=H.bagPick(bags,'full',rng);if(x===prev)rep++;prev=x;}
eq('sama repliikki ei tule kahdesti peräkkäin',rep,0);
eq('pilvi ja aurinko molemmat äänessä',['s','c'].every(w=>H.LINES.idle.some(l=>H.speakerOf(l)===w)),true);
// Minä
eq('Minä: Emilin kohdat 1–6 alussa',[H.MINA[0].t,H.MINA[5].t.slice(0,6)],['Tutustutaanpa; kuka olet?','Miksi ']);
eq('Minä: vähintään 35 kohtaa, viimeinen on loppu',[H.MINA.length>=35,H.MINA[H.MINA.length-1].k],[true,'loppu']);
eq('Minä: lainatut vastaukset kysytään ennen',H.MINA.every((m,i)=>(m.lainaa||[]).every(k=>H.MINA.slice(0,i).some(p=>p.key===k))),true);
const c=12,R=9,seg=H.buildMaze(c,R,H.rngOf(5));
eq('taustasokkelon seinämäärä',seg.length,(c*(R+1)+R*(c+1))-(c*R-1));
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
