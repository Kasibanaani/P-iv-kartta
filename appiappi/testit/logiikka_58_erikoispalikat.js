// Erikoispalikoiden ✦-merkki (PALIKKASAANNOT.md osa B): jokaisella erik-lajilla on rivi rekisterissä ja päinvastoin.
// Rekisterin ensimmäisen sarakkeen `koodi`-lajit luetaan Markdownista; `ch` tarkoittaa kaikkia ketjun palikoita (K[k].ch).
var KK=require('./moottori.js'),A=require('assert'),fs=require('fs'),path=require('path');
var md=fs.readFileSync(path.join(__dirname,'..','PALIKKASAANNOT.md'),'utf8');
var reg=md.split('### Rekisteri')[1];A.ok(reg,'rekisteri löytyy');reg=reg.split('\n## ')[0];
var rivit=reg.split('\n').filter(function(r){return /^\|/.test(r)&&!/^\|\s*-/.test(r)&&!/^\|\s*Palikka/.test(r);});
A.ok(rivit.length>=5,'rekisterissä rivejä: '+rivit.length);
var md_lajit={};
rivit.forEach(function(r){var c=r.split('|')[1],m,re=/`([a-z0-9]+)`/g,n=0;
  while((m=re.exec(c))){n++;if(m[1]==='ch')Object.keys(KK.K).forEach(function(k){if(KK.K[k].ch)md_lajit[k]=1;});else{A.ok(KK.K[m[1]],'rekisterin laji on olemassa: '+m[1]);md_lajit[m[1]]=1;}}
  A.ok(n>0,'rivillä on laji koodina: '+c);});
var koodi_lajit={};Object.keys(KK.K).forEach(function(k){var e=KK.K[k].erik;if(e!=null){A.strictEqual(typeof e,'string');A.ok(e.trim().length>10,'syy selkokielellä: '+k);koodi_lajit[k]=1;}});
A.deepStrictEqual(Object.keys(koodi_lajit).sort(),Object.keys(md_lajit).sort(),'koodi ja rekisteri samat');
// Tavalliset palikat eivät ole erikoisia
['kaava','arvo','nappi','saadin','ketju','tee','ikkuna','taulu'].forEach(function(k){A.ok(!KK.K[k].erik,k+' ei erikoispalikka');});
A.ok(KK.K.ajastin.erik&&KK.K.anim.erik&&/heti/.test(KK.K.anim.erik),'ketjun palikat ja efektin syy');
A.notStrictEqual(KK.K.anim.ic,'✦','Animaatio-ikoni ei sekoitu merkkiin');
// Ei tallennusmuodon muutosta: erik ei päädy palikkaan
var P=KK.newProject('X');var b=KK.addBlock(P,'tulos',{});A.ok(!('erik' in b),'erik ei tallennu palikkaan');A.ok(KK.VER>=10);
console.log('ok erikoispalikat',Object.keys(koodi_lajit).length,'lajia');
