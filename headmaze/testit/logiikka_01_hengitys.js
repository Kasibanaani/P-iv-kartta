// Hengitysharjoituksen laskenta: aika ensimmäisestä painalluksesta viimeiseen irrotukseen, suhde, palkin piteneminen, tallennusmuodon korjaus, sokkelo.
const H=require('./hm.js');
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
// 10 s odottelu ennen ensimmäistä painallusta ja 30 s ennen Valmista eivät näy missään
let S=H.newSession(6);
[[10,17],[19,26],[27.5,32]].forEach(([d,u])=>{H.press(S,d);H.press(S,d+1);H.release(S,u);H.release(S,u+1);});
const r=H.finish(S,'x');
eq('ulos-ajat',r.out,[7,7,4.5]);
eq('irti-ajat (yksi vähemmän)',r.inn,[2,1.5]);
eq('kesto ensimmäisestä painalluksesta viimeiseen irrotukseen',r.dur,22);
eq('suhde = ulos yhteensä ÷ irti yhteensä',Math.round(H.ratio(r)*100)/100,5.29);
eq('palkki täynnä 2/3 → pitenee 5 % (vähintään 0,2 s)',[r.hits,r.next],[2,6.3]);
eq('alle 60 % → ei pitene',H.adapt(6,{out:[7,3,3],hits:1}),6);
eq('alle kolme uloshengitystä → ei pitene',H.adapt(6,{out:[7,7],hits:2}),6);
eq('lyhyellä palkilla vähintään 0,2 s',H.adapt(2,{out:[3,3,3],hits:3}),2.2);
eq('yksi uloshengitys: suhde puuttuu',H.ratio(H.finish((()=>{const s=H.newSession(6);H.press(s,0);H.release(s,5);return s})())),null);
eq('ei painalluksia → ei tallenneta',H.finish(H.newSession(6)),null);
eq('muotoilu pilkulla',[H.fmt(6.25),H.fmtRatio(5.4286),H.fmt(null)],['6,3','5,43','–']);
// tallennusmuoto
const n=H.normalize({target:'abc',sessions:[{out:[5,'x',-1],inn:[2],target:4},{out:[]},null]});
eq('korjaus: huono palkki → oletus, rikkinäiset luvut nollaksi, tyhjät pois',[n.target,n.sessions.length,n.sessions[0].out,n.sessions[0].hits],[6,1,[5,0,0],1]);
eq('varmuuskopion kääre luetaan',H.normalize({app:'headmaze',data:{target:8,sessions:[]}}).target,8);
eq('palkin rajat',[H.clampT(0.5),H.clampT(500)],[2,90]);
// sokkelo: täydellinen labyrintti (seiniä c*r ruudukossa: 2cr + c + r - (cr - 1) poistettua)
const c=12,R=9,seg=H.buildMaze(c,R,H.rngOf(5));
eq('sokkelon seinämäärä = kaikki seinät − (ruudut − 1)',seg.length,(c*(R+1)+R*(c+1))-(c*R-1));
eq('repliikkejä joka tilanteeseen',Object.keys(H.LINES).every(k=>H.LINES[k].length>=2),true);
eq('Minä-polussa Emilin kuusi kohtaa',H.MINA.length,6);
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
