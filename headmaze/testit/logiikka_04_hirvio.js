// Hirviösokkelo: kymmenen sokkeloa, teleporttipari, hirviö joka tietää missä pelaaja on ja on nopeampi.
const H=require('./hm.js');H.tileOf=(M,x,y)=>Math.floor(y)*M.w+Math.floor(x);
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
function check(l,c,x){if(!c)ok=false;console.log((c?'ok  ':'FAIL')+' '+l+(x!==undefined?'  '+x:''));}
eq('kymmenen sokkeloa',H.HV_MAZES.length,10);
const rivit=H.HV_MAZES.map(c=>H.mazeRows(c).join('\n'));
check('kaikki sokkelot erilaisia ja samoina pysyviä',new Set(rivit).size===10&&rivit[3]===H.mazeRows(H.HV_MAZES[3]).join('\n'));
for(let i=0;i<10;i++){const M=H.hvMap(i),d=H.bfsDist(M,M.floor[0]%M.w+.5,Math.floor(M.floor[0]/M.w)+.5);
  let blok=0;for(let y=0;y<M.h-1;y++)for(let x=0;x<M.w-1;x++)if(!M.wall[y*M.w+x]&&!M.wall[y*M.w+x+1]&&!M.wall[(y+1)*M.w+x]&&!M.wall[(y+1)*M.w+x+1])blok++;
  const solut=M.floor.filter(k=>(k%M.w)%2===1&&Math.floor(k/M.w)%2===1);
  const um=solut.filter(k=>[1,-1,M.w,-M.w].filter(o=>!M.wall[k+o]).length===1).length;
  const ala=M.w*M.h;
  check('sokkelo '+(i+1)+': yhtenäinen, ei aukioita, umpikujia vähän mutta on, koko 550–750 ruutua',M.floor.every(k=>d[k]>=0)&&blok===0&&um>=2&&um<=solut.length*0.15&&ala>=550&&ala<=750,'umpikujia '+um+'/'+solut.length+', ala '+ala);}
// teleportin sijoitus
let huono=0,n=0;
for(let i=0;i<10;i++)for(let seed=1;seed<=15;seed++){const G=H.newHirvio(i,seed),M=G.M,d=H.bfsDist(M,G.p.x,G.p.y),t=G.tele.map(q=>d[H.tileOf(M,q.x,q.y)]),dab=H.bfsDist(M,G.tele[0].x,G.tele[0].y)[H.tileOf(M,G.tele[1].x,G.tele[1].y)];
  n++;if(!(Math.min(...t)>=H.HV_TMIN&&Math.min(...t)<=H.HV_TMAX&&dab>=H.HV_TAB))huono++;}
check('teleportti: lähempi pää 14–28 askelta reittiä pitkin, päät vähintään 24 toisistaan (150 alkua)',huono<=n*0.03,huono+'/'+n+' joustoa');
{const G=H.newHirvio(2,5),d=H.bfsDist(G.M,G.p.x,G.p.y),m=d[H.tileOf(G.M,G.S[0].x,G.S[0].y)];let mx=0;G.M.floor.forEach(k=>{if(d[k]>mx)mx=d[k]});
 check('hirviö aloittaa kaukaa',m>=mx*0.7,m+'/'+mx);}
// teleporttiin astuminen
{const G=H.newHirvio(0,3),a=G.tele[0],b=G.tele[1];G.S[0].x=-50;G.S[0].y=-50;G.p.x=a.x;G.p.y=a.y;H.stepGame(G,1/60,{x:0,y:0});
 check('teleportti vie toiseen päähän, piste, molemmat päät siirtyvät',Math.hypot(G.p.x-b.x,G.p.y-b.y)<0.01&&G.kerätty===1&&G.ev.includes('tele')&&G.tele.every(q=>Math.hypot(q.x-b.x,q.y-b.y)>3&&Math.hypot(q.x-a.x,q.y-a.y)>0.1));}
{const G=H.newHirvio(0,3),b=G.tele[1],a=G.tele[0];G.S[0].x=-50;G.p.x=b.x;G.p.y=b.y;H.stepGame(G,1/60,{x:0,y:0});
 check('toisesta päästä pääsee yhtä lailla',Math.hypot(G.p.x-a.x,G.p.y-a.y)<0.01&&G.kerätty===1);}
// hirviö: lyhin reitti ja nopeampi kuin pelaaja
{const G=H.newHirvio(1,4);G.tele=[{x:-90,y:-90},{x:-80,y:-80}];const s=G.S[0],d0=H.bfsDist(G.M,G.p.x,G.p.y)[H.tileOf(G.M,s.x,s.y)];
 let t=0;while(!G.over&&t<60){H.stepGame(G,1/60,{x:0,y:0});t+=1/60;}
 const vauhti=d0/(t-1.5);
 check('hirviö löytää paikallaan olevan pelaajan lyhintä reittiä, vauhti yli pelaajan huippuvauhdin',G.over&&G.why==='kiinni'&&vauhti>3.7,'matka '+d0+', aika '+t.toFixed(1)+' s, vauhti '+vauhti.toFixed(2));}
{const G=H.newHirvio(1,4);let t=0;const s=G.S[0];for(let i=0;i<60;i++)H.stepGame(G,1/60,{x:0,y:0});check('hirviö odottaa alussa 1,5 s',Math.hypot(s.x-G.S[0].x,s.y-G.S[0].y)===0&&!G.over);}
{const G=H.newHirvio(1,4),s=G.S[0];s.x=G.p.x+3;s.y=G.p.y;check('kuiskausnappi: hirviö lähellä',(H.stepGame(G,1/60,{x:0,y:0}),H.uhka(G)));}
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
