// Jonon 37a (F45, suunnitelma 29): yleispalikka. Lajin päättely kirjoituksesta, tallennus Arvona, Muistina tai Kaavana,
// nuolet säilyvät lajin vaihtuessa, lukittu laji ja punainen virhe, ryhmän kooste, nimen vaihto kirjoituksessa, kunnostus
// ja tallennus/lataus, Muistin käyttötieto lajin vaihtuessa.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(2026,9,19,12);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,0);}
function uusi(){var P=KK.newProject('y');var k=KK.addBlock(P,'kaava',{f:'15 + 15'});KK.setName(P,k.id,'Kaava1');N(P,k);
  KK.jkLuo(P,'ryhmä1');[4,6].forEach(function(v){var a=KK.addBlock(P,'arvo',{v:String(v)});N(P,a);KK.setTunnus(P,a.id,'@'+a.vt+' #ryhmä1');});
  var y=KK.addBlock(P,'arvo',{yl:1});N(P,y);KK.repair(P);return {P:P,k:k,y:y};}
function aseta(P,y,t){KK.ylAseta(P,y,t,'@');KK.repair(P);KK.tick(P,C);var v=E(P).val(y.id);return [y.k,KK.ylLaji(P,y),KK.isErr(v)?'ERR':v];}

// --- Päättely ja tallennus ---
(function(){var o=uusi(),P=o.P,y=o.y;
  A.deepStrictEqual(KK.ylLajit(P,''),['arvo','teksti','muisti','kaava','viite','ryhma'],'tyhjään sopii kaikki');
  A.deepStrictEqual(aseta(P,y,'Hei maailma'),['arvo','teksti','Hei maailma']);A.deepStrictEqual(KK.ylLajit(P,'Hei maailma'),['teksti','muisti']);
  A.deepStrictEqual(aseta(P,y,'15'),['arvo','arvo',15]);A.deepStrictEqual(KK.ylLajit(P,'15'),['arvo','muisti','teksti','kaava']);
  var d=aseta(P,y,'24.12.2026');A.strictEqual(d[1],'arvo');A.ok(KK.isD(d[2]));
  A.deepStrictEqual(aseta(P,y,'= @kaava1'),['kaava','kaava',30],'toisen palikan arvo: = @nimi (pelkkä @nimi omalla rivillä on jäsenlinkki, 37g)');
  A.deepStrictEqual(aseta(P,y,'@kaava1.arvo'),['kaava','viite',30]);
  A.deepStrictEqual(aseta(P,y,'= 15 + 15'),['kaava','kaava',30],'= alkuun = kaava');A.deepStrictEqual(KK.ylLajit(P,'= 15 + 15'),['kaava']);
  A.deepStrictEqual(aseta(P,y,'= @kaava1 * 2'),['kaava','kaava',60]);
  A.deepStrictEqual(aseta(P,y,'15 + 15'),['kaava','kaava',30],'kelvollinen lasku ilman = on kaava kuten arvokentässä');A.deepStrictEqual(KK.ylLajit(P,'15 + 15'),['kaava','teksti']);
  A.deepStrictEqual(aseta(P,y,'Pisteet: @kaava1'),['arvo','teksti','Pisteet: 30'],'teksti ja arvo sekaisin');
  A.deepStrictEqual(aseta(P,y,'#ryhmä1.jäseniä'),['kaava','ryhma',2]);A.deepStrictEqual(aseta(P,y,'#ryhmä1'),['arvo','arvo',null],'pelkkä #nimi on linkkirivi, ei sisältöä');
  A.deepStrictEqual(aseta(P,y,'#ryhmä1.summa'),['kaava','ryhma',10]);A.deepStrictEqual(KK.ylLajit(P,'#ryhmä1.summa'),['ryhma','kaava']);
  A.deepStrictEqual(KK.ylLajit(P,'#uusiryhmä.summa'),['ryhma','kaava'],'tuntematon ryhmä on ryhmä (kysytään tehdäänkö)');
  A.deepStrictEqual(KK.ylLajit(P,'@tuntematon.x'),['viite','kaava']);A.strictEqual(aseta(P,y,'@tuntematon.x')[2],'ERR');
  A.deepStrictEqual(KK.ylLajit(P,'kaava1'),['teksti','muisti','viite','kaava'],'pelkkä sana on oletuksena teksti');
  A.deepStrictEqual(aseta(P,y,'"15 + 15"'),['kaava','kaava','15 + 15']);
  A.deepStrictEqual(aseta(P,y,''),['arvo','arvo',null]);A.strictEqual(y.v,'');
  // kirjoitus takaisin tekstiksi
  aseta(P,y,'= @kaava1 * 2');A.strictEqual(KK.ylTeksti(P,y,'@'),'= @kaava1 * 2');A.strictEqual(KK.ylTeksti(P,y,'§'),'= §kaava1 * 2');A.strictEqual(KK.ylTeksti(P,y,'{'),'= {kaava1} * 2');
  aseta(P,y,'Pisteet: @kaava1');A.strictEqual(KK.ylTeksti(P,y,'@'),'Pisteet: @kaava1');
  aseta(P,y,'= @tuntematon + 1');A.strictEqual(KK.ylTeksti(P,y,'@'),'= @tuntematon + 1','tuntematon viite säilyttää @-merkin');
  // uudelleennimeäminen näkyy kirjoituksessa
  aseta(P,y,'= @kaava1 + 1');KK.setName(P,o.k.id,'Summa');KK.repair(P);A.strictEqual(KK.ylTeksti(P,y,'@'),'= @summa + 1');A.strictEqual(E(P).val(y.id),31);
})();

// --- Lukittu laji ---
(function(){var o=uusi(),P=o.P,y=o.y;
  y.ty='kaava';var r=aseta(P,y,'Hei maailma');A.strictEqual(r[2],'ERR');A.ok(/tuntematon nimi ”Hei”/.test(y.yer),y.yer);A.strictEqual(r[1],'teksti','lukittu mutta ei sovi: laji näkyy kirjoituksen mukaan');
  r=aseta(P,y,'15');A.deepStrictEqual(r,['kaava','kaava',15],'lukittu kaava luvulle');A.strictEqual(y.yer,undefined);
  y.ty='arvo';A.strictEqual(aseta(P,y,'Hei')[2],'ERR');A.ok(/Arvo on luku/.test(y.yer));
  y.ty='teksti';r=aseta(P,y,'15');A.deepStrictEqual(r,['kaava','teksti','15'],'teksti-lukko luvulle: tallentuu kaavana "15"');A.strictEqual(y.f,'"15"');A.strictEqual(KK.ylTeksti(P,y,'@'),'15');
  A.strictEqual(aseta(P,y,'= 1 + 1')[2],'ERR');
  y.ty='viite';A.strictEqual(aseta(P,y,'15')[2],'ERR');A.ok(/Viite on @/.test(y.yer));
  y.ty='ryhma';A.strictEqual(aseta(P,y,'15')[2],'ERR');
  y.ty='muisti';A.deepStrictEqual(aseta(P,y,'7'),['muisti','muisti',7]);A.strictEqual(aseta(P,y,'@kaava1 + 1')[2],'ERR');
  delete y.ty;A.deepStrictEqual(aseta(P,y,'@kaava1 + 1'),['kaava','kaava',31]);
})();

// --- Nuolet säilyvät lajin vaihtuessa, Muistin käyttötieto ---
(function(){var o=uusi(),P=o.P,y=o.y,v=P.views[0].id;var t=KK.addBlock(P,'nayta',{v:v,tx:''});
  aseta(P,y,'Hei');KK.addLink(P,N(P,y).id,'v',KK.addNode(P,t.id,300,0).id,'tx');KK.repair(P);KK.tick(P,C);
  A.strictEqual(E(P).val(t.id),'Hei');
  ['= 2 * 21','= @kaava1','#ryhmä1.summa','99'].forEach(function(s,i){aseta(P,y,s);A.strictEqual(P.lg.l.length,1,'nuoli säilyy: '+s);A.strictEqual(String(E(P).val(t.id)),['42','30','10','99'][i]);});
  y.ty='muisti';aseta(P,y,'5');A.strictEqual(y.k,'muisti');KK.setVal(P,y.id,12,C);A.strictEqual(E(P).val(y.id),12);
  delete y.ty;aseta(P,y,'= 1');A.ok(!P.st.hasOwnProperty(y.id),'Muistin käyttötieto poistuu, kun laji vaihtuu');A.strictEqual(P.lg.l.length,1);
})();

// --- Ryhmän kooste ---
(function(){var o=uusi(),P=o.P,y=o.y;aseta(P,y,'#ryhmä1.summa');
  A.deepStrictEqual(KK.ylRyhma(y).ko,'summa');['summa','keskiarvo','suurin','pienin','arvot','jäsenet','jäseniä'].forEach(function(ko,i){A.ok(KK.ylKooste(y,ko));KK.repair(P);
    A.strictEqual(String(E(P).val(y.id)),['10','5','6','4','4, 6','Arvo, Arvo 2','2'][i],ko);});
  A.strictEqual(KK.ylTeksti(P,y,'@'),'#ryhmä1.jäseniä');aseta(P,y,'15');A.strictEqual(KK.ylKooste(y,'summa'),false,'ei ryhmä: ei koostetta');
  // monta palikkaa samalle ryhmälle
  var y2=KK.addBlock(P,'arvo',{yl:1});N(P,y2);aseta(P,y2,'#ryhmä1.suurin');aseta(P,y,'#ryhmä1.pienin');A.strictEqual(E(P).val(y2.id),6);A.strictEqual(E(P).val(y.id),4);
})();

// --- Kunnostus ja tallennus ---
(function(){var o=uusi(),P=o.P,y=o.y;y.ty='kaava';aseta(P,y,'= @kaava1 + 1');
  var J=JSON.parse(JSON.stringify(P));KK.repair(J);var y2=J.b[y.id];A.strictEqual(y2.yl,1);A.strictEqual(y2.ty,'kaava');A.strictEqual(KK.Ev(J,C).val(y.id),31);
  y2.ty='hölmö';y2.yl=true;KK.repair(J);A.strictEqual(y2.ty,undefined);A.strictEqual(y2.yl,1);
  var w=KK.addBlock(J,'lasku',{yl:1,ty:'kaava',yer:'x'});KK.repair(J);A.ok(!('yl' in w)&&!('ty' in w)&&!('yer' in w),'yl vain Arvolla, Muistilla ja Kaavalla');
  // vanha appi ilman yl-tukea näkee tavallisen Kaavan / Arvon: kentät ovat lisäkenttiä
  var V=JSON.parse(JSON.stringify(P));delete V.b[y.id].yl;delete V.b[y.id].ty;KK.repair(V);A.strictEqual(V.b[y.id].k,'kaava');A.strictEqual(KK.Ev(V,C).val(y.id),31);
  // vanha Arvo ja Kaava ennallaan
  var Q=KK.newProject('v');var a=KK.addBlock(Q,'arvo',{v:'3'}),k=KK.addBlock(Q,'kaava',{f:'1 + 1'});var s0=JSON.stringify([a,k]);KK.repair(Q);A.strictEqual(JSON.stringify([a,k]),s0);
})();

// --- Jonon 37g: ryhmä on palikka, linkki kahteen suuntaan ---
(function(){var P=KK.newProject('r');function yl(nm,t){var b=KK.addBlock(P,'arvo',{yl:1});N(P,b);KK.setName(P,b.id,nm);if(t!=null){KK.ylAseta(P,b,t,'@');KK.ylLinkit(P,b,t);}KK.repair(P);return b;}
  function v(b){KK.tick(P,C);return E(P).val(b.id);}
  var el=yl('Eläin'),ko=yl('Koira','Hau\n#eläin'),ki=yl('Kissa','Miau'),kp=yl('Kilpikonna','4');
  A.strictEqual(KK.ylTeksti(P,el,'@'),'@koira','#eläin Koirassa näkyy Eläimessä @koira');A.strictEqual(v(el),1,'pelkät jäsenet: arvo on määrä');A.strictEqual(v(ko),'Hau','linkkirivi ei ole sisältöä');
  KK.ylLinkit(P,el,'@koira @kissa @kilpikonna');KK.repair(P);A.strictEqual(KK.ylTeksti(P,ki,'@'),'Miau\n#eläin','@kissa Eläimessä näkyy Kissassa #eläin');A.strictEqual(v(el),3);
  var eo=yl('Elävät olennot');KK.ylLinkit(P,el,KK.ylTeksti(P,el,'@')+'\n#elävätolennot');KK.repair(P);
  A.strictEqual(KK.ylTeksti(P,eo,'@'),'@eläin');A.strictEqual(v(eo),1,'sisäkkäinen ryhmä: eläin on yksi jäsen, ei neljä');A.strictEqual(v(el),3);
  var su=yl('Summa','= #eläin.summa');A.strictEqual(v(su),4,'summa ohittaa tekstit');var lu=yl('Lause','Eläimiä: #eläin.jäseniä');A.strictEqual(v(lu),'Eläimiä: 3');
  KK.ylLinkit(P,ki,'Miau');KK.repair(P);A.strictEqual(KK.ylTeksti(P,el,'@'),'@koira @kilpikonna\n#elävätolennot','poisto jäsenen päästä');
  KK.ylLinkit(P,el,'#elävätolennot');KK.repair(P);A.deepStrictEqual(KK.ylJasenet(P,el),[],'poisto ryhmän päästä');A.strictEqual(KK.ylTeksti(P,ko,'@'),'Hau');
  KK.ylLinkit(P,el,'@koira\n#elävätolennot');KK.setName(P,el.id,'Eläimet');KK.repair(P);A.strictEqual(KK.ylTeksti(P,ko,'@'),'Hau\n#eläimet','ryhmä seuraa nimeä');A.strictEqual(KK.ylTeksti(P,su,'@'),'= #eläimet.summa');
  var r=KK.ylLinkit(P,kp,'4\n#uusi @tuntematon');A.deepStrictEqual(r.uudet,['uusi']);A.ok(/Tuntematon @tuntematon/.test(r.err));
  A.deepStrictEqual(KK.ylJaa('Teksti @koira\n@a #b\n= 1').sis,'Teksti @koira\n= 1','rivi, jolla on muutakin, on sisältöä');
  var J=JSON.parse(JSON.stringify(P));KK.repair(J);A.strictEqual(KK.ylTeksti(J,J.b[el.id],'@'),'@koira\n#elävätolennot','tallennus ja lataus');
})();
console.log('yleispalikka ok');
