// Logiikkatestien apurit: moottori luetaan index.html:stä (aja.sh poimii sen tiedostoon moottori.js).
var AM=require('./moottori.js');
var virheita=0,ok=0;
function ok_(ehto,viesti){if(ehto){ok++;}else{virheita++;console.log('VIRHE: '+viesti);}}
function lahella(a,b,tol,viesti){ok_(Math.abs(a-b)<=(tol==null?1e-6:tol),viesti+' (saatiin '+a+', odotettiin '+b+')');}
function loppu(nimi){console.log(nimi+': '+ok+' tarkistusta ok'+(virheita?', '+virheita+' virhettä':''));if(virheita)process.exit(1);}
function projekti(){var P=AM.uusiProjekti('Testi');
  var k1=AM.lisaaKuva(P,{laji:'svg',w:100,h:200,nimi:'v'}),k2=AM.lisaaKuva(P,{laji:'png',w:40,h:120,nimi:'k'});
  var v=AM.uusiOsa(P,k1,'Vartalo'),k=AM.uusiOsa(P,k2,'Käsi');
  v.perus={x:256,y:300,kulma:0,koko:1};v.kp=[50,100];
  k.perus={x:256,y:300,kulma:0,koko:1};k.kp=[20,10];
  return {P:P,v:v,k:k};}
module.exports={AM:AM,ok:ok_,lahella:lahella,loppu:loppu,projekti:projekti};
