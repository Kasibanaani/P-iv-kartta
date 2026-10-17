// Jonon 6 (F27 kohta 2, F20 vaihe 1): tulkki eli printteri (moottori). Synteettinen sisältö.
// Kuvio ja taulukkoteksti (sarkain, pilkku, puolipiste, lainausmerkit) taulukon riveiksi tai palikoiksi;
// esikatselu ei muuta projektia; avain päivittää; virheet ohitetaan; tallennetut kuviot ja vanha projekti.
var KK=require('./moottori.js'),A=require('assert');
var T=new Date(2026,9,17,12,0);var C={now:function(){return T;},toast:function(){},nav:function(){}};
function V(P,id,p){return KK.Ev(P,C).val(id,p);}
var P=KK.newProject('tulkki');

// 1 Kuvio: erotin, tyhjä arvo, erotin arvon sisällä, puuttuva erotin, alku- ja loppuosa, välilyönti erottimena
A.deepStrictEqual(KK.tulkKuvio('{nimi}: {arvo}').f,['nimi','arvo']);
A.ok(KK.tulkKuvio('{a}{b}').err,'kentät ilman erotinta');A.ok(KK.tulkKuvio('ei kenttiä').err);A.ok(KK.tulkKuvio('{a} = {A}').err,'sama kenttä kahdesti');
var ku=KK.tulkKuvio('{nimi}: {arvo}');
A.deepStrictEqual(KK.tulkRivi(ku,'yöuni: 8').a,{nimi:'yöuni',arvo:'8'});
A.deepStrictEqual(KK.tulkRivi(ku,'yöuni:').a,{nimi:'yöuni',arvo:''},'tyhjä arvo');
A.deepStrictEqual(KK.tulkRivi(ku,'yöuni:8').a,{nimi:'yöuni',arvo:'8'},'väli erottimen ympärillä ei ratkaise');
A.deepStrictEqual(KK.tulkRivi(ku,'klo: 9:30').a,{nimi:'klo',arvo:'9:30'},'vain ensimmäinen erotin jakaa');
A.ok(KK.tulkRivi(ku,'yöuni 8').err,'rivi ilman erotinta on virhe');
A.deepStrictEqual(KK.tulkRivi(KK.tulkKuvio('- {etu} ({taka})'),'- kissa (cat)').a,{etu:'kissa',taka:'cat'});
A.ok(KK.tulkRivi(KK.tulkKuvio('- {etu} ({taka})'),'kissa (cat)').err,'alkuosa puuttuu');
A.deepStrictEqual(KK.tulkRivi(KK.tulkKuvio('{a} {b}'),'yksi   kaksi kolme').a,{a:'yksi',b:'kaksi kolme'});

// 2 Taulukkoteksti
var cv=KK.tulkCsv('﻿Nimi;Kuvaus\r\n"x;1";"rivi\nkaksi"\r\n1,5;"hän ""sanoi"""');
A.strictEqual(cv.sep,';','puolipiste arvattiin');A.deepStrictEqual(cv.rows.map(function(r){return r.c;}),[['Nimi','Kuvaus'],['x;1','rivi\nkaksi'],['1,5','hän "sanoi"']]);
A.strictEqual(KK.tulkCsv('a\tb\n1\t2').sep,'\t');A.strictEqual(KK.tulkCsv('a,b\n1,2').sep,',');
var L=KK.tulkLue({tapa:'taulukko',teksti:'A,B\n1,2,3\n\n"auki,4'});
A.strictEqual(L.r[0].err.indexOf('enemmän')>=0,true,'liikaa kenttiä');A.strictEqual(L.r[1].err,'lainausmerkki jää auki');A.strictEqual(L.tyhjia,1);
var L2=KK.tulkLue({tapa:'taulukko',teksti:'1\t2\n3\t4',ots:false});A.deepStrictEqual(L2.f,['Sarake 1','Sarake 2']);A.strictEqual(L2.r.length,2);
A.strictEqual(KK.tulkLaji(['1','2,5','−3']),'luku');A.strictEqual(KK.tulkLaji(['kyllä','ei','']),'kylla');A.strictEqual(KK.tulkLaji(['1.10.2026','2026-10-02']),'pvm');A.strictEqual(KK.tulkLaji(['1','a']),'teksti');

// 3 Kortit uuteen taulukkoon =-erottimella; esikatselu ei muuta projektia
var o={tapa:'kuvio',kuvio:'{etu} = {taka}',teksti:'kissa = cat\n\n  \nkoira = dog = hund\nvirhe\n',kohde:'rivit',tt:'',nimi:'Kortit'};
var s0=JSON.stringify(P),pl=KK.tulkSuunnitelma(P,o,T);A.strictEqual(JSON.stringify(P),s0,'esikatselu ei muuta');
A.strictEqual(pl.uusia,2);A.strictEqual(pl.virheita,1);A.strictEqual(pl.tyhjia,3);A.deepStrictEqual(pl.uudetSar,[{nm:'etu',laji:'teksti'},{nm:'taka',laji:'teksti'}]);
A.strictEqual(pl.rivit[2].n,5,'virheen rivinumero');A.ok(/=/.test(pl.rivit[2].syy));
var r=KK.tulkSovella(P,o,T),tb=P.b[r.tt];A.strictEqual(tb.k,'taulu');A.strictEqual(tb.nm,'Kortit');A.strictEqual(KK.nodesOfBlock(P,tb.id).length,1);
A.deepStrictEqual(tb.rv.map(function(x){return [x.a.c1,x.a.c2];}),[['kissa','cat'],['koira','dog = hund']]);
A.strictEqual(V(P,tb.id,'rivejä'),2);

// 4 Taulukko sarkaimella: lajit, desimaalipilkku, avaimella päivitys, tuplat, olemassa oleva sarake ja käyttötieto
var t2=KK.tulkSovella(P,{tapa:'taulukko',teksti:'Nimi\tMäärä\tPvm\nOmena\t3\t1.10.2026\nPäärynä\t2,5\t2.10.2026',kohde:'rivit',tt:'',avain:'Nimi'},T).tt,tb2=P.b[t2];
A.deepStrictEqual(KK.tSar(tb2).map(function(c){return c.laji;}),['teksti','luku','pvm']);A.strictEqual(tb2.rv[1].a.c2,2.5,'desimaalipilkku');
var o4={tapa:'taulukko',teksti:'nimi\tmäärä\tHuom\nOmena\t4\t\nKiwi\t1\tuusi\nPäärynä\t2,5\t\nKiwi\t\tkaksi\nBanaani\tpaljon\t',kohde:'rivit',tt:t2,avain:'NIMI'};
var p4=KK.tulkSuunnitelma(P,o4,T);
A.deepStrictEqual(p4.rivit.map(function(x){return x.tila;}),['muuttuu','uusi','ennallaan','muuttuu','virhe']);A.ok(/ei ole luku/.test(p4.rivit[4].syy));
A.deepStrictEqual(p4.uudetSar,[{nm:'Huom',laji:'teksti'}],'vain puuttuva sarake on uusi; nimi ei riipu kirjainkoosta');
KK.tulkSovella(P,o4,T);
A.deepStrictEqual(tb2.rv.map(function(x){return [x.a.c1,x.a.c2,x.a.c4||''];}),[['Omena',4,''],['Päärynä',2.5,''],['Kiwi',1,'kaksi']],'tyhjä kenttä ei pyyhi, sama avain päivittää');
A.strictEqual(tb2.rv[0].a.c3.d,'2026-10-01','appin oma sarake säilyy');
// Taulukko käytössä: rivit lähtöaineistoon, suunnitelma kertoo
KK.tUse(P,t2);A.strictEqual(KK.tulkSuunnitelma(P,{tapa:'taulukko',teksti:'Nimi\nX',kohde:'rivit',tt:t2},T).kaytossa,true);
// Automaattinen aika ja Id: aika täyttyy, Id-avain päivittää rivin
var hl=KK.addBlock(P,'taulu',{});KK.addNode(P,hl.id,0,0,'');KK.histMake(hl);KK.addCol(hl,'Teksti','teksti');
KK.tulkSovella(P,{tapa:'kuvio',kuvio:'{teksti}',teksti:'eka\ntoka',kohde:'rivit',tt:hl.id},T);
A.strictEqual(hl.rv.length,2);A.ok(KK.isAt(hl.rv[0].a[KK.colAuto(hl,'aika').id]),'aika täyttyi');
var pid=KK.tulkSuunnitelma(P,{tapa:'kuvio',kuvio:'{id}: {teksti}',teksti:hl.rv[1].id+': muutettu\nr99: ei ole',kohde:'rivit',tt:hl.id,avain:'id'},T);
A.deepStrictEqual(pid.rivit.map(function(x){return x.tila;}),['muuttuu','virhe']);

// 5 Palikoiksi: yöuni: 8, tyhjä arvo, päivitys ilman tuplaa, laji-kenttä, ristiriidat, kaava sitoutuu
var k=KK.addBlock(P,'kaava');k.f=KK.kaavaToIds(P,'yöuni * 2');KK.addNode(P,k.id,0,400,'');KK.repair(P);A.ok(KK.isErr(V(P,k.id)));
var ka=KK.addBlock(P,'kaava',{nm:'Laskin'});KK.addNode(P,ka.id,0,480,'');
var o5={tapa:'kuvio',kuvio:'{nimi}: {arvo}',teksti:'yöuni: 8\nPaino: 72,5\nmieliala:\n: 3\nLaskin: 1',kohde:'palikat'};
var p5=KK.tulkSuunnitelma(P,o5,T);A.deepStrictEqual(p5.rivit.map(function(x){return x.tila;}),['uusi','uusi','uusi','virhe','virhe']);
A.ok(/nimi puuttuu/.test(p5.rivit[3].syy));A.ok(/Kaava/.test(p5.rivit[4].syy),p5.rivit[4].syy);
var r5=KK.tulkSovella(P,o5,T);A.strictEqual(r5.ids.length,3);
var by=function(n){return Object.keys(P.b).map(function(i){return P.b[i];}).filter(function(b){return b.nm===n;});};
A.strictEqual(by('yöuni').length,1);A.strictEqual(by('yöuni')[0].k,'arvo');A.strictEqual(by('yöuni')[0].v,'8');A.strictEqual(by('mieliala')[0].v,'','tyhjä arvo');
A.strictEqual(V(P,k.id),16,'odottava kaava sitoutui ja toimii');A.strictEqual(V(P,by('Paino')[0].id),72.5);
var p6=KK.tulkSuunnitelma(P,{tapa:'kuvio',kuvio:'{nimi}: {arvo}',teksti:'YÖUNI: 7\nPaino: 72,5\nyöuni: 9',kohde:'palikat'},T);
A.deepStrictEqual(p6.rivit.map(function(x){return x.tila;}),['muuttuu','ennallaan','muuttuu']);
KK.tulkSovella(P,{tapa:'kuvio',kuvio:'{nimi}: {arvo}',teksti:'YÖUNI: 7\nyöuni: 9',kohde:'palikat'},T);A.strictEqual(by('yöuni').length,1,'ei tuplaa');A.strictEqual(by('yöuni')[0].v,'9','viimeinen voittaa');
var o7={tapa:'kuvio',kuvio:'{laji} {nimi}: {arvo}',teksti:'muisti Pisteet: 0\nteksti Otsikko: Hei maailma\nkuva X: 1\narvo Pisteet: 2\nmuisti yöuni: 1',kohde:'palikat'};
var p7=KK.tulkSuunnitelma(P,o7,T);A.deepStrictEqual(p7.rivit.map(function(x){return x.tila;}),['uusi','uusi','virhe','virhe','virhe']);
KK.tulkSovella(P,Object.assign({},o7,{nx:30,ny:60}),T);
A.strictEqual(by('Pisteet')[0].k,'muisti');var ot=by('Otsikko')[0];A.strictEqual(ot.k,'nayta');A.strictEqual(ot.tx,'Hei maailma');A.strictEqual(ot.v,P.views[0].id);A.strictEqual(ot.x,30);
A.ok(KK.tulkSuunnitelma(P,{tapa:'kuvio',kuvio:'{etu} = {taka}',teksti:'a = b',kohde:'palikat'},T).err,'palikoille tarvitaan {nimi}');
A.deepStrictEqual(KK.tulkSuunnitelma(P,{tapa:'kuvio',kuvio:'{nimi} = {arvo} ({huom})',teksti:'a = 1 (x)',kohde:'palikat'},T).ohit,['huom']);

// 6 200 riviä, desimaalit ja nopeus
var big=[];for(var i=1;i<=200;i++)big.push('k'+i+' = '+(i/2).toString().replace('.',','));
var t0=Date.now(),rb=KK.tulkSovella(P,{tapa:'kuvio',kuvio:'{nimi} = {arvo}',teksti:big.join('\n'),kohde:'rivit',tt:'',nimi:'Iso'},T);
A.strictEqual(P.b[rb.tt].rv.length,200);A.strictEqual(KK.tSar(P.b[rb.tt])[1].laji,'luku');A.strictEqual(P.b[rb.tt].rv[199].a.c2,100);A.ok(Date.now()-t0<1500,'200 riviä nopeasti');

// 7 Tallennetut kuviot ja korjaus
A.strictEqual(KK.kuvioTallenna(P,'Kortit','{etu} = {taka}'),true);KK.kuvioTallenna(P,'kortit','{etu} -> {taka}');
A.deepStrictEqual(P.kuviot,[{nm:'kortit',k:'{etu} -> {taka}'}],'sama nimi korvaa');
P.kuviot.push({nm:'',k:'x'},'roska',{nm:'Kortit',k:'tupla'});KK.repair(P);A.deepStrictEqual(P.kuviot,[{nm:'kortit',k:'{etu} -> {taka}'}]);
KK.kuvioPoista(P,'kortit');A.strictEqual(P.kuviot,undefined);P.kuviot='x';KK.repair(P);A.strictEqual(P.kuviot,undefined);
var Q=KK.newProject('vanha');delete Q.kuviot;KK.repair(Q);A.strictEqual(Q.kuviot,undefined,'vanha projekti ilman kuvioita');
console.log('ok tulkki');
