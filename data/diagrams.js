/* Eigene UML-Diagramme (SVG) für Modellfragen. Notation gemäß Handbuch Abb. 3.7, 3.9, 3.10, 3.12. */
(function(){
var F='font-family="Segoe UI, Arial, Helvetica, sans-serif"';
var DEF='<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10" fill="none" stroke="#2b3440" stroke-width="1.6"/></marker></defs>';
function txt(x,y,s,o){o=o||{};return '<text x="'+x+'" y="'+y+'" font-size="'+(o.size||13)+'" text-anchor="'+(o.anchor||'middle')+'"'+(o.bold?' font-weight="700"':'')+(o.italic?' font-style="italic"':'')+' fill="#1d2530" '+F+'>'+s+'</text>';}
function line(x1,y1,x2,y2,arrow){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#2b3440" stroke-width="1.6"'+(arrow?' marker-end="url(#ah)"':'')+'/>';}
function path(d,arrow){return '<path d="'+d+'" fill="none" stroke="#2b3440" stroke-width="1.6"'+(arrow?' marker-end="url(#ah)"':'')+'/>';}
function act(x,y,w,h,label){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="14" fill="#fbf3e4" stroke="#2b3440" stroke-width="1.6"/>'+txt(x+w/2,y+h/2+5,label);}
function state(x,y,w,h,label){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="10" fill="#fbf3e4" stroke="#2b3440" stroke-width="1.6"/>'+txt(x+w/2,y+h/2+5,label);}
function diamond(cx,cy,r){return '<path d="M'+cx+','+(cy-r)+' L'+(cx+r)+','+cy+' L'+cx+','+(cy+r)+' L'+(cx-r)+','+cy+' Z" fill="#fff" stroke="#2b3440" stroke-width="1.6"/>';}
function start(cx,cy){return '<circle cx="'+cx+'" cy="'+cy+'" r="9" fill="#1d2530"/>';}
function end(cx,cy){return '<circle cx="'+cx+'" cy="'+cy+'" r="11" fill="#fff" stroke="#1d2530" stroke-width="1.8"/><circle cx="'+cx+'" cy="'+cy+'" r="6" fill="#1d2530"/>';}
function bar(x1,x2,y){return '<rect x="'+x1+'" y="'+(y-3)+'" width="'+(x2-x1)+'" height="6" fill="#1d2530"/>';}
function svg(w,h,body,label){return '<svg viewBox="0 0 '+w+' '+h+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+label+'" style="max-width:100%;height:auto">'+DEF+'<rect x="0" y="0" width="'+w+'" height="'+h+'" fill="#fff"/>'+body+'</svg>';}
function cls(x,y,w,name,attrs){var h=40+attrs.length*20+10;var s='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="#fbf3e4" stroke="#2b3440" stroke-width="1.6"/>'+txt(x+w/2,y+25,name,{bold:true,size:15})+line(x,y+36,x+w,y+36);attrs.forEach(function(a,i){s+=txt(x+12,y+58+i*20,a,{anchor:'start'});});return s;}
function actor(x,y,label){return '<circle cx="'+x+'" cy="'+(y-30)+'" r="10" fill="#fff" stroke="#2b3440" stroke-width="1.6"/>'+line(x,y-20,x,y+10)+line(x-16,y-10,x+16,y-10)+line(x,y+10,x-13,y+32)+line(x,y+10,x+13,y+32)+txt(x,y+52,label);}
function uc(cx,cy,label){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="105" ry="25" fill="#fbf3e4" stroke="#2b3440" stroke-width="1.6"/>'+txt(cx,cy+5,label);}

var D={};
/* Klassendiagramm Bibliothek */
D.cls_bib=svg(640,330,
  cls(20,30,190,'Leser',['name : Text','ausweisNr : Text'])+
  cls(420,30,200,'Exemplar',['inventarNr : Text','zustand : Text'])+
  cls(420,205,200,'Buch',['titel : Text','isbn : Text'])+
  line(210,82,420,82)+txt(315,72,'leiht aus ▸',{italic:true})+
  txt(218,100,'0..1',{anchor:'start'})+txt(412,100,'0..5',{anchor:'end'})+
  line(520,120,520,205)+txt(510,166,'ist Exemplar von ▾',{anchor:'end',italic:true})+
  txt(528,140,'1..*',{anchor:'start'})+txt(528,198,'1',{anchor:'start'}),
  'UML-Klassendiagramm: Leser 0..1 leiht aus 0..5 Exemplar; Exemplar 1..* ist Exemplar von 1 Buch');

/* Aktivitätsdiagramm Online-Bestellung */
D.act_order=svg(520,560,
  start(260,20)+line(260,29,260,45,1)+act(170,45,180,36,'Bestellung erfassen')+line(260,81,260,104,1)+
  bar(120,400,110)+line(160,113,160,140,1)+line(360,113,360,140,1)+
  act(75,140,170,36,'Zahlung prüfen')+act(275,140,170,36,'Verfügbarkeit prüfen')+
  line(160,176,160,204,1)+line(360,176,360,204,1)+bar(120,400,210)+
  line(260,213,260,236,1)+diamond(260,258,22)+
  path('M238,258 L125,258 L125,306',1)+path('M282,258 L400,258 L400,306',1)+
  txt(178,236,'[Zahlung ok und',{size:12})+txt(178,250,'Ware verfügbar]',{size:12})+txt(345,250,'[sonst]',{size:12})+
  act(40,306,170,36,'Ware versenden')+act(305,306,190,36,'Kunde benachrichtigen')+
  path('M125,342 L125,392 L236,392',1)+path('M400,342 L400,392 L284,392',1)+diamond(260,392,22)+
  line(260,414,260,440,1)+act(160,440,200,36,'Bestellung archivieren')+line(260,476,260,505,1)+end(260,517),
  'UML-Aktivitätsdiagramm Online-Bestellung mit Gabelpunkt, Verbindungspunkt, Entscheidung und Zusammenführung');

/* Aktivitätsdiagramm Urlaubsantrag mit Verantwortungsbereichen */
D.act_lanes=svg(520,560,
  '<rect x="0" y="0" width="260" height="560" fill="#fff" stroke="#2b3440" stroke-width="1.4"/><rect x="260" y="0" width="260" height="560" fill="#fff" stroke="#2b3440" stroke-width="1.4"/>'+
  '<rect x="0" y="0" width="260" height="30" fill="#eef1f5" stroke="#2b3440" stroke-width="1.4"/><rect x="260" y="0" width="260" height="30" fill="#eef1f5" stroke="#2b3440" stroke-width="1.4"/>'+
  txt(130,20,'Mitarbeiter',{bold:true})+txt(390,20,'Führungskraft',{bold:true})+
  start(130,52)+line(130,61,130,80,1)+act(50,80,160,34,'Antrag stellen')+
  path('M130,114 L130,150 L366,150',1)+diamond(390,150,22)+line(390,172,390,186,1)+
  act(310,186,160,34,'Antrag prüfen')+line(390,220,390,242,1)+diamond(390,264,22)+
  path('M368,264 L130,264 L130,300',1)+txt(250,256,'[genehmigt]',{size:12})+
  act(45,300,170,34,'Urlaub eintragen')+line(130,334,130,363,1)+end(130,375)+
  line(390,286,390,444,1)+txt(398,370,'[abgelehnt]',{size:12,anchor:'start'})+
  act(305,444,170,34,'Ablehnung begründen')+line(305,461,217,461,1)+
  act(45,444,170,34,'Antrag überarbeiten')+
  path('M130,478 L130,525 L505,525 L505,150 L414,150',1),
  'UML-Aktivitätsdiagramm Urlaubsantrag mit den Verantwortungsbereichen Mitarbeiter und Führungskraft');

/* Zustandsdiagramm Support-Ticket */
D.stm_ticket=svg(700,390,
  start(75,20)+line(75,29,75,60,1)+
  state(20,60,110,44,'Neu')+state(280,60,140,44,'In Bearbeitung')+state(270,250,160,44,'Wartet auf Kunde')+
  state(510,60,120,44,'Gelöst')+state(510,250,120,44,'Geschlossen')+
  line(130,82,280,82,1)+txt(205,46,'zuweisen /',{size:12})+txt(205,59,'Bearbeiter',{size:12})+txt(205,72,'benachrichtigen',{size:12})+
  line(330,104,330,250,1)+txt(322,180,'Rückfrage stellen',{size:12,anchor:'end'})+
  line(370,250,370,104,1)+txt(378,180,'Antwort erhalten',{size:12,anchor:'start'})+
  line(420,74,510,74,1)+txt(465,52,'Lösung',{size:12})+txt(465,65,'bereitgestellt',{size:12})+
  line(510,92,420,92,1)+txt(465,108,'Kunde',{size:12})+txt(465,121,'widerspricht',{size:12})+
  line(570,104,570,250,1)+txt(578,170,'Kunde bestätigt /',{size:12,anchor:'start'})+txt(578,184,'Umfrage senden',{size:12,anchor:'start'})+
  line(430,272,510,272,1)+txt(470,289,'Frist',{size:12})+txt(470,302,'abgelaufen',{size:12})+
  line(570,294,570,342,1)+end(570,355),
  'UML-Zustandsdiagramm Support-Ticket mit den Zuständen Neu, In Bearbeitung, Wartet auf Kunde, Gelöst, Geschlossen');

/* Use Case Diagramm Bibliotheksportal */
D.uc_bib=svg(660,370,
  '<rect x="180" y="15" width="300" height="340" fill="#fff" stroke="#2b3440" stroke-width="1.6"/>'+txt(192,38,'Bibliotheksportal',{bold:true,anchor:'start'})+
  uc(330,90,'Medium vormerken')+uc(330,160,'Ausleihe verlängern')+uc(330,230,'Gebühr bezahlen')+uc(330,305,'Bestand pflegen')+
  actor(80,140,'Leser')+actor(80,290,'Bibliothekar')+actor(585,240,'Zahlungsdienst')+
  line(98,128,225,92)+line(98,132,225,160)+line(98,136,228,226)+line(98,282,225,303)+line(567,232,435,230),
  'UML-Use-Case-Diagramm Bibliotheksportal mit den Akteuren Leser, Bibliothekar und Zahlungsdienst');
window.DIAGRAMS=D;
})();
