// Jonon 22b (F43 vaihe 1, suunnitelma 27 kohdat 3.2–3.3): Alueen Korkeus: sisällön mukaan (kork 'sis'), rullaus 'koko'
// (Koko alue näkyy) ja laitenäkymän raja Siirry-alueesta (P.cam[vw].ra). Moottorin osuus.
var KK=require('./moottori.js'),A=require('assert');
function vw(P){return P.views[0].id;}
function ui(P,k,x,y,w,h,nm){var b=KK.addBlock(P,k,{v:vw(P)});b.x=x;b.y=y;b.w=w;b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}

// --- 1. Korkeus: sisällön mukaan kasvaa, kutistuu ja toistaa (uusi palikka tulee sisään kasvun myötä) ---
(function(){var P=KK.newProject('s'),a=ui(P,'alue',0,0,300,100,'Valikko');a.kork='sis';
  ui(P,'nappi',20,10,200,50,'Eka');KK.repair(P);A.strictEqual(a.h,68,'ensimmäinen: 10 + 50 + väli 8');
  var b2=ui(P,'nappi',20,60,200,50,'Toka');KK.alueSisKorjaa(P);A.strictEqual(a.h,118,'kasvoi toisen alle');
  ui(P,'nappi',20,115,200,50,'Kolmas');KK.alueSisKorjaa(P);A.strictEqual(a.h,173,'kolmas tuli sisään, kun alue kasvoi');
  b2.y=500;KK.alueSisKorjaa(P);A.strictEqual(a.h,173,'pois siirretty ei kasvata, kolmas pitää korkeuden');
  ui(P,'nappi',400,20,100,300,'Sivussa');ui(P,'nappi',20,-80,100,300,'Ylhäältä');KK.alueSisKorjaa(P);A.strictEqual(a.h,173,'keskikohta leveyden ulkopuolella tai yläreuna yläpuolella ei kuulu');
  a.asv=0;KK.alueSisKorjaa(P);A.strictEqual(a.h,165,'Asettelun väli 0');
  var c=ui(P,'alue',600,0,200,90,'Tyhjä');c.kork='sis';KK.alueSisKorjaa(P);A.strictEqual(c.h,90,'ilman sisältöä korkeus ennallaan');
  var d=ui(P,'alue',0,700,200,90,'Tavallinen');ui(P,'nappi',10,710,100,300);KK.alueSisKorjaa(P);A.strictEqual(d.h,90,'ilman valintaa ei muutu');})();

// --- 2. Tallennus: kork ja lrul 'koko' säilyvät, vääränlaiset pois; vanha projekti ennallaan ---
(function(){var P=KK.newProject('t'),a=ui(P,'alue',0,0,300,100);a.kork='sis';P.views[0].lrul='koko';P.views[0].laite='puhelin';
  var Q=KK.repair(JSON.parse(JSON.stringify(P)));A.strictEqual(Q.b[a.id].kork,'sis');A.strictEqual(Q.views[0].lrul,'koko');A.strictEqual(KK.lrul(Q,Q.views[0].id),'koko');
  Q.b[a.id].kork='jotain';Q.views[0].lrul='outo';KK.repair(Q);A.ok(!('kork' in Q.b[a.id]));A.ok(!('lrul' in Q.views[0]));
  var R=KK.newProject('r'),b=ui(R,'alue',0,0,300,100);KK.repair(R);A.ok(!('kork' in b));A.strictEqual(b.h,100);})();

// --- 3. Laitenäkymän raja: näkymän Maailman rajat, Siirry-alue (P.cam[vw].ra) voittaa; vapaassa näkymässä ei rajaa ---
(function(){var P=KK.newProject('k');P.views[0].laite='puhelin';P.views[0].lrul='kaikki';var v=vw(P),m=ui(P,'alue',-500,-500,2000,2000,'Maa'),h=ui(P,'alue',3000,0,600,400,'Huone');
  P.views[0].kam={ra:m.id};KK.repair(P);var r=KK.kameraRajat(P,v,null);A.deepStrictEqual([r.x0,r.y0,r.x1,r.y1],[-500,-500,1500,1500],'näkymän raja');
  P.cam=P.cam||{};P.cam[v]={x:0,y:0,z:1,ra:h.id};r=KK.kameraRajat(P,v,null);A.deepStrictEqual([r.x0,r.y0,r.x1,r.y1],[3000,0,3600,400],'Siirry-alue voittaa');
  var o=KK.kameraRajaa(P,v,{x:0,y:0},{w:390,h:844},null);A.strictEqual(o.x,3000,'kamera alueen vasempaan reunaan');A.strictEqual(o.y,0-(844-400)/2,'pienempi korkeus keskitetään');
  P.cam[v].ra='eiole';r=KK.kameraRajat(P,v,null);A.strictEqual(r.x0,-500,'puuttuva Siirry-alue: näkymän raja');
  P.views[0].laite='';A.strictEqual(KK.kameraRajat(P,v,null),null,'vapaa näkymä');})();
console.log('ok: aluekoot ja rajat');
