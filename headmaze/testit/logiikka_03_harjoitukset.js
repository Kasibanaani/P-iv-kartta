// Jonon harjoitukset: Typerä kynä, Hiljaisuuden keskeytykset, koanien ja meditoijan sisältö, Tarkkailija-polku, laskurien tallennus.
const H=require('./hm.js');
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
eq('kynä: yksi kerros, iso alkukirjain pienenee, piste loppuun',H.kynaWrap('Kaikki on taas myöhässä!!',1),'Huomaan ajattelevani, että kaikki on taas myöhässä.');
eq('kynä: kolme kerrosta',H.kynaWrap('en jaksa',3),'Huomaan ajattelevani, että huomaan ajattelevani, että huomaan ajattelevani, että en jaksa.');
eq('kynä: lyhenne säilyy isona',H.kynaWrap('EU taas',1),'Huomaan ajattelevani, että EU taas.');
const rng=H.rngOf(7),k=H.hiljaKatkot(rng);
eq('hiljaisuus: keskeytyksiä 4–11, kasvavassa järjestyksessä, 3–57 s, välit 5–12 s',[k.length>=4&&k.length<=11,k.every((x,i)=>i===0||x>k[i-1]),k[0]>=3&&k[k.length-1]<57,k.every((x,i)=>i===0||(x-k[i-1]>=4.9&&x-k[i-1]<=12.1))],[true,true,true,true]);
eq('koaneja master-tiedoista yli 100, ei otsikoita eikä ohjerivejä',[H.KOANIT.length>100,H.KOANIT.some(x=>x.startsWith('#')||x.startsWith('Yksi koani')||x.startsWith('Erä '))],[true,false]);
eq('meditoijan ajatuksia yli 200, ei toistoja, pierupylly mukana',[H.MEDIT.length>200,new Set(H.MEDIT).size===H.MEDIT.length,H.MEDIT.includes('Pierupylly.')],[true,true,true]);
const bags={},seen=new Set();for(let i=0;i<H.KOANIT.length;i++)seen.add(H.bagPick(bags,'koani_txt',Math.random,H.KOANIT));
eq('koanit pussista: kaikki kerran ennen toistoa',seen.size,H.KOANIT.length);
eq('Tarkkailija-polku päättyy loppuun, valinnoilla vaihtoehdot',[H.TARK[H.TARK.length-1].k,H.TARK.every(s=>s.k!=='yksi'||s.v.length>=2)],['loppu',true]);
eq('uusi data: laskurit nollassa',H.newData().muut.koani,0);
eq('laskurit korjataan, puuttuvat nollaksi',(()=>{const o=H.normalize({ver:3,muut:{kyna:'3',elett:-2,meditSek:'61.5',outo:9}});return [o.muut.kyna,o.muut.elett,o.muut.meditSek,o.muut.hilj,'outo' in o.muut]})(),[3,0,61.5,0,false]);
eq('vanha v3-tieto ilman laskureita luetaan',H.normalize({ver:3,sessions:[]}).muut.tark,0);
eq('kaikilla uusilla repliikkilajeilla repliikkejä',['kyna','kyna_more','ratk_ratk','ratk_elett','koani','koani_en','hilj_alku','hilj_kesk','hilj_loppu','tark','medit'].every(x=>H.LINES[x]&&H.LINES[x].length>=2),true);
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
