// Jonon 1k (linjakkuuskartoitus 3: N1, N2, N4). Ryhmä ei saa viitettä eikä vie nimeä muilta; ryhmään osoittava kaava tai
// teksti (vanha projekti) on näkyvä virhe ”Ryhmä ei ole arvo”. Tuntematon nimi jos-funktion valitsematta jääneessä osassa on
// virhe heti; laskun virheet pysyvät laiskoina. Miksi?-tekstien puuttuvan syötteen lause on yhtenäinen.
var KK=require('./moottori.js'),A=require('assert');
var T=new Date(2026,9,17,12,0);var C={now:function(){return T;},toast:function(){},nav:function(){}};
function N(P,b){return KK.addNode(P,b.id,0,0,'');}
function V(P,b,p){return KK.Ev(P,C).val(b.id,p);}
function K(P,s){var k=KK.addBlock(P,'kaava');k.f=KK.kaavaToIds(P,s);N(P,k);KK.repair(P);return k;}
function W(P,b){return KK.why(P,KK.Ev(P,C),b.id,1).txt;}

// --- N1: Ryhmä ensin, Arvo samalla nimellä sitten ---
var P=KK.newProject('1k');
var r=KK.addBlock(P,'ryhma',{nm:'Uni'});N(P,r);
A.strictEqual(r.vt,'','ryhmällä ei viitettä');
var u=KK.addBlock(P,'luku',{nm:'Uni'});N(P,u);KK.repair(P);
A.strictEqual(u.nm,'Uni','ryhmä ei vie nimeä');A.strictEqual(u.vt,'uni','ryhmä ei vie viitettä');
KK.userSet(P,u.id,8,C);
var k=K(P,'uni > 7');A.strictEqual(V(P,k),true,'kaava osuu Arvoon, ei ryhmään');
A.strictEqual(KK.Ev(P,C).tpl('{#'+u.id+'} h'),'8 h');
A.strictEqual(KK.toIds(P,'{Uni}'),'{#'+u.id+'}','teksti {Uni} osuu Arvoon');
A.strictEqual(KK.setVt(P,u.id,'uni'),'','oma viite käy');
// Nimen vaihto ei anna ryhmälle viitettä
KK.setName(P,r.id,'Unet');A.strictEqual(r.vt,'');
// Kaksi ryhmää samalla nimellä saa silti eri nimet
var r2=KK.addBlock(P,'ryhma',{nm:'Unet'});A.strictEqual(r2.nm,'Unet 2');

// --- Vanha projekti: ryhmällä viite uni, kaava ja teksti osoittavat ryhmään ---
var Q=KK.newProject('vanha');
var g=KK.addBlock(P=Q,'ryhma',{nm:'Uni'});N(Q,g);g.vt='uni';
var kq=KK.addBlock(Q,'kaava');kq.f='{#'+g.id+'} > 7';N(Q,kq);KK.repair(Q);
A.strictEqual(g.vt,'uni','vanha vt jää tallennukseen');
var ev=V(Q,kq);A.ok(ev&&ev.err==='Ryhmä ei ole arvo',JSON.stringify(ev));
A.strictEqual(KK.kaavaToText(Q,kq.f),'uni > 7','kaava näyttää ryhmän nimen');
A.ok(/Ryhmä ei ole arvo/.test(KK.Ev(Q,C).tpl('{#'+g.id+'}')),'teksti näyttää virheen');
A.strictEqual(KK.toNames(Q,'{#'+g.id+'}'),'{Uni}');
var k2=KK.addBlock(Q,'kaava');k2.f='jos(kyllä; 1; {#'+g.id+'})';N(Q,k2);
A.strictEqual(V(Q,k2).err,'Ryhmä ei ole arvo','ryhmä valitsematta jääneessä osassa');
// Uusi Arvo saa nyt viitteen uni, ja kaavan muokkaus osuu siihen
var u2=KK.addBlock(Q,'luku',{nm:'Uni'});N(Q,u2);KK.repair(Q);A.strictEqual(u2.vt,'uni');
A.strictEqual(KK.kaavaToIds(Q,'uni > 7'),'{#'+u2.id+'} > 7');
// Korjaus ei anna ryhmälle viitettä eikä vie sitä Arvolta
var Q2=KK.newProject('vanha2');var g2=KK.addBlock(Q2,'ryhma',{nm:'Uni'});g2.vt='uni';var u3=KK.addBlock(Q2,'luku',{nm:'Uni 2'});u3.vt='uni';KK.repair(Q2);
A.strictEqual(u3.vt,'uni','Arvo pitää viitteen');A.strictEqual(g2.vt,'uni');

// --- N2: tuntematon nimi valitsematta jääneessä osassa ---
P=KK.newProject('jos');
var s=KK.addBlock(P,'saadin',{nm:'Uni',min:0,max:12,start:8});N(P,s);KK.repair(P);
var j=K(P,'jos(uni > 7; "hyvä"; unii)');A.strictEqual(V(P,j).err,'puuttuu: unii','virhe jo nyt');
A.strictEqual(V(P,K(P,'jos(uni < 7; unii; 1)')).err,'puuttuu: unii','kyllä-osassakin');
A.strictEqual(V(P,K(P,'ja(kyllä; tai(ei; zz))')).err,'puuttuu: zz');
// laskun virheet pysyvät laiskoina: muuten-osan teksti + luku ei kaada valittua osaa
A.strictEqual(V(P,K(P,'jos(uni > 7; 1; "a" * 2)')),1,'laskuvirhe valitsematta jääneessä osassa ei näy');
A.strictEqual(V(P,K(P,'jos(uni > 7; 1; 2)')),1);

// --- N4: Miksi?-tekstit ---
var la=KK.addBlock(P,'lasku',{op:'add'});N(P,la);
A.strictEqual(W(P,la),'A ja B puuttuvat: vie nuolet kohtiin ”A” ja ”B” tai kirjoita arvot.');
la.a='5';A.strictEqual(W(P,la),'B puuttuu: vie nuoli kohtaan ”B” tai kirjoita arvo.');
la.b='2';A.ok(/5 \+ 2/.test(W(P,la)),W(P,la));
var ve=KK.addBlock(P,'vert',{op:'eq'});N(P,ve);ve.b='3';A.strictEqual(W(P,ve),'A puuttuu: vie nuoli kohtaan ”A” tai kirjoita arvo.');
var po=KK.addBlock(P,'pvmosa',{part:'vk'});N(P,po);A.strictEqual(W(P,po),'Päivämäärä puuttuu: vie nuoli kohtaan ”päivämäärä” tai kirjoita päivämäärä.');
var te=KK.addBlock(P,'tee',{do:'aseta'});N(P,te);A.strictEqual(W(P,te),'Kohde puuttuu: valitse kohde paneelin kohdasta ”Kohde”.');
te.o=s.id;A.ok(/^Uni = /.test(W(P,te)),W(P,te));
var il=KK.addBlock(P,'tee',{do:'ilmoita',tx:'Hei'});N(P,il);A.ok(/Näytä ilmoitus/.test(W(P,il)),'ilmoitus ei tarvitse kohdetta');
var jo=KK.addBlock(P,'joukko');N(P,jo);A.strictEqual(W(P,jo),'Rivit puuttuvat: vie nuoli kohtaan ”rivit” Tietotaulukosta tai toisesta Rivijoukosta.');
console.log('ok');
