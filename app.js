'use strict';
/* CPRE FL Prüfungstrainer 4.0 – Logik.
   Bewertung nach IREB-Prüfungsordnung 5.6.2:
   A: volle Punkte nur bei der richtigen Antwort.
   P: Punkte/erwartete Anzahl je richtig gewählter Antwort; mehr Antworten als erwartet = 0 Punkte.
   K: Punkte/Anzahl Aussagen je richtig bewerteter Aussage; keine oder beide Optionen = 0 für die Aussage. */

const LE_TITLES={1:'Einführung und Überblick',2:'Grundlegende Prinzipien',3:'Arbeitsprodukte und Dokumentation',4:'Erarbeitung von Anforderungen',5:'Prozess und Arbeitsstruktur',6:'Requirements Management',7:'Werkzeugunterstützung'};
const PLANS={
  exam:{name:'Prüfungssimulation',le:[3,4,18,10,2,6,2],types:{a:18,p:12,k:15},minutes:75,feedback:false},
  quick:{name:'Kurztest',le:[1,2,8,5,1,2,1],types:{a:8,p:5,k:7},minutes:30,feedback:false}
};
const KEY='cpre-fl-trainer-v4';
const POOL=(window.POOL||[]).map(q=>Object.assign({src:'',lab:['Richtig','Falsch']},q,{origin:'pool'}));
const IREB=(window.IREB_EXAM||[]).map(q=>Object.assign({lab:['Richtig','Falsch']},q,{origin:'ireb'}));
const BYID=new Map([...POOL,...IREB].map(q=>[q.origin+':'+q.id,q]));
const DIAGRAMS=window.DIAGRAMS||{};
const $=s=>document.querySelector(s);
const app=$('#app');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtNum=n=>(Math.round(n*100)/100).toLocaleString('de-DE',{maximumFractionDigits:2});
const fmtTime=s=>{s=Math.max(0,Math.round(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');};
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

/* ---------- Speicher ---------- */
function load(){try{return Object.assign({stats:{},history:[],session:null,ext:false},JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){return {stats:{},history:[],session:null,ext:false};}}
let DB=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(DB));}catch(e){}}
const qkey=q=>q.origin+':'+q.id;

/* ---------- Bewertung ---------- */
function score(q,ans){
  if(ans==null)return 0;
  if(q.t==='a')return ans===q.a?q.pts:0;
  if(q.t==='p'){
    if(!Array.isArray(ans)||ans.length===0)return 0;
    if(ans.length>q.a.length)return 0;
    return q.pts*ans.filter(i=>q.a.includes(i)).length/q.a.length;
  }
  if(q.t==='k'){
    if(!Array.isArray(ans))return 0;
    return q.pts*q.a.reduce((n,v,i)=>n+(ans[i]===v?1:0),0)/q.a.length;
  }
  return 0;
}
function answered(q,ans){
  if(q.t==='a')return typeof ans==='number';
  if(q.t==='p')return Array.isArray(ans)&&ans.length>0;
  return Array.isArray(ans)&&ans.some(v=>typeof v==='boolean');
}
function complete(q,ans){
  if(q.t==='k')return Array.isArray(ans)&&ans.every(v=>typeof v==='boolean');
  if(q.t==='p')return Array.isArray(ans)&&ans.length===q.a.length;
  return answered(q,ans);
}

/* ---------- Zusammenstellung ---------- */
function seen(q){const s=DB.stats[qkey(q)];return s?s.n:0;}
function pickExam(plan){
  const lastExamIds=new Set();
  let best=null,bestDev=1e9;
  for(let attempt=0;attempt<4000;attempt++){
    const left=Object.assign({},plan.types),chosen=[],usedDiag=new Set();
    const order=shuffle([1,2,3,4,5,6,7]);
    let ok=true;
    for(const eu of order){
      for(let i=0;i<plan.le[eu-1];i++){
        let cand=POOL.filter(q=>q.eu===eu&&left[q.t]>0&&!chosen.includes(q)&&!(q.d&&usedDiag.has(q.d)));
        if(!cand.length){ok=false;break;}
        // Typ nach Restbedarf gewichten, dann wenig gesehene Fragen bevorzugen
        const types=[...new Set(cand.map(q=>q.t))];
        const tot=types.reduce((s,t)=>s+left[t],0);let r=Math.random()*tot,t0=types[0];
        for(const t of types){r-=left[t];if(r<=0){t0=t;break;}}
        cand=cand.filter(q=>q.t===t0);
        const minSeen=Math.min(...cand.map(seen));
        const fresh=cand.filter(q=>seen(q)<=minSeen+(attempt>2000?99:0));
        const q=fresh[Math.floor(Math.random()*fresh.length)];
        chosen.push(q);left[q.t]--;if(q.d)usedDiag.add(q.d);
      }
      if(!ok)break;
    }
    if(!ok)continue;
    const dev=Object.values(left).reduce((s,v)=>s+Math.abs(v),0);
    if(dev<bestDev){best=chosen;bestDev=dev;}
    if(dev===0)break;
  }
  return shuffle(best);
}
function pickLearn(eus,count,onlyWrong){
  let cand=POOL.filter(q=>eus.includes(q.eu));
  if(onlyWrong)cand=cand.filter(q=>{const s=DB.stats[qkey(q)];return s&&s.last<1;});
  cand=shuffle(cand).sort((a,b)=>seen(a)-seen(b));
  const out=[],diag=new Set();
  for(const q of cand){if(out.length>=count)break;if(q.d&&diag.has(q.d)&&cand.length>count)continue;out.push(q);if(q.d)diag.add(q.d);}
  return shuffle(out);
}

/* ---------- Sitzung ---------- */
let S=null,timer=null;
function newSession(mode,qs,opts){
  stopTimer();
  const fixedOrder=mode==='ireb';
  S={mode,name:opts.name,ids:qs.map(qkey),
     perm:qs.map(q=>fixedOrder?null:shuffle([...(q.t==='k'?q.s:q.o).keys()])),
     ans:qs.map(q=>q.t==='k'?Array(q.s.length).fill(null):null),
     checked:qs.map(()=>false),flag:qs.map(()=>false),at:0,
     feedback:!!opts.feedback,timed:!!opts.minutes,remaining:opts.minutes?opts.minutes*60:0,started:Date.now(),done:false};
  DB.session=S;save();renderQuestion();startTimer();
}
const qOf=i=>BYID.get(S.ids[i]);
function startTimer(){
  stopTimer();if(!S||!S.timed||S.done)return;
  let last=Date.now();
  timer=setInterval(()=>{const now=Date.now();const d=(now-last)/1000;last=now;S.remaining-=d;
    const el=$('#clock');if(el){el.textContent=fmtTime(S.remaining);el.classList.toggle('warn',S.remaining<=300);}
    if(Math.floor(S.remaining)%5===0)save();
    if(S.remaining<=0){S.remaining=0;finish(true);}
  },500);
}
function stopTimer(){if(timer){clearInterval(timer);timer=null;}}

/* ---------- Startseite ---------- */
function renderHome(){
  stopTimer();
  const hasSession=DB.session&&!DB.session.done&&DB.session.ids&&DB.session.ids.every(id=>BYID.has(id));
  const wrong=POOL.filter(q=>{const s=DB.stats[qkey(q)];return s&&s.last<1;}).length;
  const seenN=POOL.filter(q=>seen(q)>0).length;
  const hist=DB.history.slice(-6).reverse();
  const leRows=[1,2,3,4,5,6,7].map(e=>{
    const qs=POOL.filter(q=>q.eu===e),st=qs.map(q=>DB.stats[qkey(q)]).filter(Boolean);
    const avg=st.length?st.reduce((s,x)=>s+x.last,0)/st.length:null;
    return `<tr><td>LE ${e}</td><td>${esc(LE_TITLES[e])}</td><td>${st.length}/${qs.length}</td><td>${avg==null?'–':Math.round(avg*100)+' %'}</td><td><div class="bar"><span style="width:${avg==null?0:Math.round(avg*100)}%" class="${avg!=null&&avg<.7?'low':''}"></span></div></td></tr>`;}).join('');
  app.innerHTML=`
  <section class="hero">
    <p class="eyebrow">IREB CPRE Foundation Level</p>
    <h1>Prüfungsnah üben – mit echten Fragetypen, echter Bewertung und belegten Lösungen.</h1>
    <p class="lead">${POOL.length} eigene Fragen mit Quellenangabe zu Lehrplan 3.3.0 und Handbuch 1.3.3, dazu die offizielle IREB-Übungsprüfung. Jede Simulation folgt der Verteilung der Musterprüfung: 45 Fragen, 75 Minuten, mindestens 70 %.</p>
  </section>
  ${hasSession?`<div class="resume"><div><strong>Unterbrochene Sitzung:</strong> ${esc(DB.session.name)} · Frage ${DB.session.at+1} von ${DB.session.ids.length}${DB.session.timed?' · Restzeit '+fmtTime(DB.session.remaining):''}</div><div><button class="btn" id="resume">Fortsetzen</button> <button class="btn ghost" id="discard">Verwerfen</button></div></div>`:''}
  <div class="modes">
    <article class="mode main-mode">
      <h2>Prüfungssimulation</h2>
      <p>45 Fragen aus dem eigenen Pool in der Verteilung der Musterprüfung (LE 1–7: 3·4·18·10·2·6·2; 18 A, 12 P, 15 K). Keine Lösungen bis zur Abgabe. Bevorzugt Fragen, die du noch nicht gesehen hast.</p>
      <label class="check"><input type="checkbox" id="ext" ${DB.ext?'checked':''}> Zeitverlängerung für Nicht-Muttersprachler (90 statt 75 Minuten)</label>
      <button class="btn" data-start="exam">Simulation starten</button>
    </article>
    <article class="mode">
      <h2>Offizielle Übungsprüfung</h2>
      <p>Die 45 Fragen der IREB-Übungsprüfung (Set 3.3.3) mit offiziellem Lösungsschlüssel, in Originalreihenfolge. Ideal als Abschlusstest – am besten erst ganz am Ende machen.</p>
      <button class="btn" data-start="ireb">Übungsprüfung starten</button>
    </article>
    <article class="mode">
      <h2>Kurztest</h2>
      <p>20 Fragen in 30 Minuten, gleiche Gewichtung im Kleinen. Für zwischendurch.</p>
      <button class="btn" data-start="quick">Kurztest starten</button>
    </article>
    <article class="mode">
      <h2>Lernmodus</h2>
      <p>Lerneinheiten wählen, Frage beantworten, sofort Lösung und Begründung sehen. Ohne Zeitdruck.</p>
      <div class="le-pick">${[1,2,3,4,5,6,7].map(e=>`<label><input type="checkbox" value="${e}" checked> LE ${e}</label>`).join('')}</div>
      <label class="inline">Anzahl <select id="learn-n"><option>10</option><option selected>20</option><option>40</option><option value="999">alle</option></select></label>
      <button class="btn" data-start="learn">Lernen starten</button>
    </article>
    <article class="mode">
      <h2>Fehlertraining</h2>
      <p>Nur Fragen, die du beim letzten Mal nicht voll richtig hattest. Mit Sofort-Feedback.</p>
      <p class="muted">${wrong} Frage(n) offen</p>
      <button class="btn" data-start="wrong" ${wrong?'':'disabled'}>Fehler wiederholen</button>
    </article>
  </div>
  <section class="panel">
    <h2>Dein Stand</h2>
    <p class="muted">${seenN} von ${POOL.length} eigenen Fragen bearbeitet. Quote = Anteil der Punkte beim jeweils letzten Versuch.</p>
    <table class="le-table"><thead><tr><th></th><th>Lerneinheit</th><th>gesehen</th><th>Quote</th><th></th></tr></thead><tbody>${leRows}</tbody></table>
    ${hist.length?`<h3>Letzte Durchgänge</h3><ul class="hist">${hist.map(h=>`<li><span>${new Date(h.ts).toLocaleString('de-DE',{dateStyle:'short',timeStyle:'short'})}</span><span>${esc(h.name)}</span><strong class="${h.passed?'ok':'bad'}">${fmtNum(h.pct)} %</strong></li>`).join('')}</ul>`:''}
    <button class="btn ghost small" id="reset">Lernstand zurücksetzen</button>
  </section>
  <section class="panel info">
    <h2>So funktioniert die Bewertung (Prüfungsordnung 5.6.2)</h2>
    <ul>
      <li><b>A-Fragen</b> (Einfachauswahl): eine richtige Antwort, volle Punktzahl oder 0.</li>
      <li><b>P-Fragen</b> (Mehrfachauswahl): Die geforderte Anzahl steht in der Frage. Jede richtig gewählte Antwort bringt Punkte/Anzahl. <b>Mehr Kreuze als gefordert = 0 Punkte</b> für die ganze Frage; weniger ist erlaubt.</li>
      <li><b>K-Fragen</b> (Richtig/Falsch): Jede Aussage zählt einzeln (Punkte/Anzahl Aussagen). Keine Angabe = 0 für diese Aussage.</li>
      <li>Bestanden ab <b>70 %</b> der erreichbaren Punkte.</li>
    </ul>
  </section>`;
  $('#ext').onchange=e=>{DB.ext=e.target.checked;save();};
  $('#reset').onclick=()=>{if(confirm('Statistik und Verlauf wirklich löschen?')){DB.stats={};DB.history=[];save();renderHome();}};
  if(hasSession){$('#resume').onclick=()=>{S=DB.session;renderQuestion();startTimer();};$('#discard').onclick=()=>{DB.session=null;save();renderHome();};}
  app.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>start(b.dataset.start));
}
function start(mode){
  if(DB.session&&!DB.session.done&&!confirm('Die unterbrochene Sitzung wird verworfen. Fortfahren?'))return;
  if(mode==='exam'){const p=PLANS.exam;newSession('exam',pickExam(p),{name:p.name,minutes:DB.ext?90:75});}
  else if(mode==='quick'){const p=PLANS.quick;newSession('quick',pickExam(p),{name:p.name,minutes:30});}
  else if(mode==='ireb'){newSession('ireb',IREB,{name:'Offizielle IREB-Übungsprüfung',minutes:DB.ext?90:75});}
  else if(mode==='learn'){
    const eus=[...app.querySelectorAll('.le-pick input:checked')].map(i=>+i.value);
    if(!eus.length){alert('Bitte mindestens eine Lerneinheit wählen.');return;}
    const n=+$('#learn-n').value;newSession('learn',pickLearn(eus,n,false),{name:'Lernmodus (LE '+eus.join(', ')+')',feedback:true});
  }
  else if(mode==='wrong'){newSession('wrong',pickLearn([1,2,3,4,5,6,7],999,true),{name:'Fehlertraining',feedback:true});}
}

/* ---------- Frage ---------- */
function typeLabel(q){return {a:'A · Einfachauswahl',p:'P · Mehrfachauswahl',k:'K · Richtig/Falsch'}[q.t];}
function figure(q){
  if(q.img)return `<figure class="fig"><img src="${esc(q.img)}" alt="Diagramm zur Frage ${esc(q.id)}"></figure>`;
  if(q.d&&DIAGRAMS[q.d])return `<figure class="fig">${DIAGRAMS[q.d]}</figure>`;
  return '';
}
function renderQuestion(){
  if(!S)return renderHome();
  const i=S.at,q=qOf(i),ans=S.ans[i],perm=S.perm[i]||[...(q.t==='k'?q.s:q.o).keys()];
  const reveal=S.feedback&&S.checked[i];
  const n=S.ids.length,done=S.ans.filter((a,j)=>answered(qOf(j),a)).length;
  let body='';
  if(q.t==='k'){
    body=`<table class="ktab"><thead><tr><th>${esc(q.lab[0])}</th><th>${esc(q.lab[1])}</th><th>Aussage</th></tr></thead><tbody>`+
      perm.map((o,d)=>{const v=ans[o];const ok=reveal?(v===q.a[o]?'right':'wrong'):'';
        return `<tr class="${ok}"><td><input type="radio" name="k${d}" data-k="${o}" value="1" ${v===true?'checked':''} ${reveal?'disabled':''} aria-label="${esc(q.lab[0])}"></td><td><input type="radio" name="k${d}" data-k="${o}" value="0" ${v===false?'checked':''} ${reveal?'disabled':''} aria-label="${esc(q.lab[1])}"></td><td>${String.fromCharCode(65+d)}) ${esc(q.s[o])}${reveal?`<div class="sol">Richtig ist: <b>${esc(q.a[o]?q.lab[0]:q.lab[1])}</b></div>`:''}</td></tr>`;}).join('')+'</tbody></table>';
  }else{
    const multi=q.t==='p';
    body='<div class="opts">'+perm.map((o,d)=>{
      const sel=multi?(Array.isArray(ans)&&ans.includes(o)):ans===o;
      const isRight=multi?q.a.includes(o):q.a===o;
      const cls=reveal?(isRight?'right':(sel?'wrong':'')):'';
      return `<label class="opt ${sel?'sel':''} ${cls}"><input type="${multi?'checkbox':'radio'}" name="opt" data-o="${o}" ${sel?'checked':''} ${reveal?'disabled':''}><span class="let">${String.fromCharCode(65+d)}</span><span>${esc(q.o[o])}</span></label>`;}).join('')+'</div>';
    if(multi){const c=Array.isArray(ans)?ans.length:0;body+=`<p class="count ${c>q.a.length?'over':''}">${c} von ${q.a.length} ausgewählt${c>q.a.length?' – mehr als gefordert ergibt 0 Punkte!':''}</p>`;}
  }
  let fb='';
  if(reveal){const sc=score(q,ans);fb=`<div class="feedback ${sc===q.pts?'good':sc>0?'part':'bad'}"><strong>${sc===q.pts?'Richtig':sc>0?'Teilweise richtig':'Nicht richtig'} – ${fmtNum(sc)} von ${q.pts} Punkt${q.pts>1?'en':''}</strong><p>${esc(q.x)}</p>${q.src?`<small>Quelle: ${esc(q.src)}</small>`:''}</div>`;}
  app.innerHTML=`
  <div class="bar-top">
    <button class="link" id="quit">← Menü</button>
    <span class="mode-name">${esc(S.name)}</span>
    ${S.timed?`<span id="clock" class="clock ${S.remaining<=300?'warn':''}">${fmtTime(S.remaining)}</span>`:'<span></span>'}
  </div>
  <div class="progress"><span style="width:${100*done/n}%"></span></div>
  <div class="qmeta"><span>Frage ${i+1} von ${n}</span><span>${done} beantwortet</span></div>
  <article class="question">
    <div class="tags"><span class="tag dark">${esc(q.origin==='ireb'?q.id:'#'+q.id)}</span><span class="tag">${typeLabel(q)}</span><span class="tag">${q.pts} Punkt${q.pts>1?'e':''}</span><span class="tag light">LE ${q.eu} · LZ ${esc(q.lz)}</span></div>
    <h2 class="qtext">${esc(q.q)}</h2>
    ${figure(q)}
    ${body}
    ${fb}
  </article>
  <div class="controls">
    <button class="btn ghost" id="prev" ${i===0?'disabled':''}>← Zurück</button>
    ${S.feedback?(reveal?'':`<button class="btn ghost" id="check" ${answered(q,ans)?'':'disabled'}>Antwort prüfen</button>`):`<button class="btn ghost ${S.flag[i]?'flagged':''}" id="flag">${S.flag[i]?'★ Markiert':'☆ Markieren'}</button>`}
    <button class="btn" id="next">${i===n-1?(S.feedback?'Auswertung':'Abgeben'):'Weiter →'}</button>
  </div>
  ${S.feedback?'':`<nav class="grid" aria-label="Fragenübersicht">${S.ids.map((id,j)=>{const qq=qOf(j);const st=complete(qq,S.ans[j])?'done':answered(qq,S.ans[j])?'half':'';return `<button class="cell ${st} ${j===i?'cur':''} ${S.flag[j]?'fl':''}" data-j="${j}" title="Frage ${j+1}">${j+1}</button>`;}).join('')}</nav>
  <p class="hint">Grün = vollständig beantwortet, gelb = teilweise, ★ = markiert. Tastatur: 1–5 wählt Optionen, ←/→ blättert.</p>`}`;
  // Ereignisse
  app.querySelectorAll('[data-o]').forEach(inp=>inp.onchange=()=>{
    const o=+inp.dataset.o;
    if(q.t==='a')S.ans[i]=o;
    else{let a=Array.isArray(S.ans[i])?[...S.ans[i]]:[];a=a.includes(o)?a.filter(x=>x!==o):[...a,o];S.ans[i]=a.length?a:null;}
    save();renderQuestion();});
  app.querySelectorAll('[data-k]').forEach(inp=>inp.onchange=()=>{const a=[...S.ans[i]];a[+inp.dataset.k]=inp.value==='1';S.ans[i]=a;save();renderQuestion();});
  $('#quit').onclick=()=>{save();stopTimer();renderHome();};
  $('#prev').onclick=()=>go(i-1);
  $('#next').onclick=()=>{if(i===n-1)confirmFinish();else go(i+1);};
  const fl=$('#flag');if(fl)fl.onclick=()=>{S.flag[i]=!S.flag[i];save();renderQuestion();};
  const ck=$('#check');if(ck)ck.onclick=()=>{S.checked[i]=true;record(q,S.ans[i]);save();renderQuestion();};
  app.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>go(+b.dataset.j));
}
function go(j){if(j<0||j>=S.ids.length)return;S.at=j;save();renderQuestion();window.scrollTo(0,0);}
function record(q,ans){
  const k=qkey(q),sc=score(q,ans)/q.pts,s=DB.stats[k]||{n:0,last:0,best:0};
  s.n++;s.last=sc;s.best=Math.max(s.best,sc);s.ts=Date.now();DB.stats[k]=s;
}
function confirmFinish(){
  const open=S.ids.filter((id,j)=>!answered(qOf(j),S.ans[j])).length;
  if(!S.feedback&&open&&!confirm(open+' Frage(n) sind unbeantwortet. Trotzdem abgeben?'))return;
  finish(false);
}
function finish(timeout){
  stopTimer();if(!S||S.done)return;S.done=true;
  const qs=S.ids.map((id,j)=>qOf(j));
  if(!S.feedback)qs.forEach((q,j)=>record(q,S.ans[j]));
  else qs.forEach((q,j)=>{if(!S.checked[j]&&answered(q,S.ans[j]))record(q,S.ans[j]);});
  const max=qs.reduce((s,q)=>s+q.pts,0),got=qs.reduce((s,q,j)=>s+score(q,S.ans[j]),0),pct=max?100*got/max:0;
  DB.history.push({ts:Date.now(),name:S.name,pct,got,max,passed:pct>=70});
  if(DB.history.length>50)DB.history=DB.history.slice(-50);
  DB.session=null;save();renderResults(timeout);
}

/* ---------- Auswertung ---------- */
function renderResults(timeout){
  const qs=S.ids.map((id,j)=>qOf(j));
  const max=qs.reduce((s,q)=>s+q.pts,0),got=qs.reduce((s,q,j)=>s+score(q,S.ans[j]),0),pct=max?100*got/max:0,passed=pct>=70;
  const groups=(f,keys,label)=>keys.map(k=>{const sub=qs.map((q,j)=>[q,j]).filter(([q])=>f(q)===k);if(!sub.length)return'';const m=sub.reduce((s,[q])=>s+q.pts,0),g=sub.reduce((s,[q,j])=>s+score(q,S.ans[j]),0);return `<tr><td>${label(k)}</td><td>${sub.length}</td><td>${fmtNum(g)} / ${fmtNum(m)}</td><td><div class="bar"><span style="width:${100*g/m}%" class="${g/m<.7?'low':''}"></span></div></td></tr>`;}).join('');
  const review=qs.map((q,j)=>{
    const ans=S.ans[j],sc=score(q,ans),cls=sc===q.pts?'good':sc>0?'part':'bad';
    let det='';
    if(q.t==='k')det=q.s.map((s,o)=>{const v=ans?ans[o]:null;return `<li class="${v===q.a[o]?'r':'w'}">${esc(s)}<br><small>Richtig: <b>${esc(q.a[o]?q.lab[0]:q.lab[1])}</b> · Deine Antwort: ${v==null?'–':esc(v?q.lab[0]:q.lab[1])}</small></li>`;}).join('');
    else det=q.o.map((o,k)=>{const right=q.t==='a'?q.a===k:q.a.includes(k);const sel=q.t==='a'?ans===k:Array.isArray(ans)&&ans.includes(k);return `<li class="${right?'r':''} ${sel&&!right?'w':''}">${esc(o)} ${right?'<b>✓ richtig</b>':''}${sel?' <i>(deine Wahl)</i>':''}</li>`;}).join('');
    return `<details class="rev ${cls}" ${cls!=='good'?'open':''} data-cls="${cls}"><summary><span class="tag ${cls}">${fmtNum(sc)}/${q.pts}</span> <b>${j+1}.</b> ${esc(q.q.split('\n')[0].slice(0,160))}${q.q.length>160?'…':''}</summary>
      <div class="rev-body"><p class="qtext small">${esc(q.q)}</p>${figure(q)}<ul class="ans">${det}</ul><div class="explain"><b>Erläuterung:</b> ${esc(q.x)}${q.src?`<br><small>Quelle: ${esc(q.src)} · LE ${q.eu} · LZ ${esc(q.lz)}</small>`:`<br><small>LE ${q.eu} · LZ ${esc(q.lz)}</small>`}</div></div></details>`;}).join('');
  app.innerHTML=`
  <section class="result ${passed?'pass':'fail'}">
    <p class="eyebrow">${esc(S.name)}${timeout?' · Zeit abgelaufen':''}</p>
    <div class="big">${fmtNum(pct)} %</div>
    <p>${fmtNum(got)} von ${fmtNum(max)} Punkten · ${passed?'<b>bestanden</b> (≥ 70 %)':'<b>nicht bestanden</b> (unter 70 %)'}${S.timed?` · benötigte Zeit ${fmtTime((Date.now()-S.started)/1000)}`:''}</p>
    <div class="actions"><button class="btn" id="home">Zur Startseite</button><button class="btn ghost" id="print">Drucken / PDF</button><label class="check"><input type="checkbox" id="onlywrong"> Nur nicht voll richtige anzeigen</label></div>
  </section>
  <div class="two">
    <section class="panel"><h2>Nach Lerneinheit</h2><table class="le-table"><tbody>${groups(q=>q.eu,[1,2,3,4,5,6,7],k=>'LE '+k+' '+esc(LE_TITLES[k]))}</tbody></table></section>
    <section class="panel"><h2>Nach Fragetyp</h2><table class="le-table"><tbody>${groups(q=>q.t,['a','p','k'],k=>({a:'A-Fragen',p:'P-Fragen',k:'K-Fragen'})[k])}</tbody></table></section>
  </div>
  <section class="panel"><h2>Alle Fragen mit Lösung</h2>${review}</section>`;
  $('#home').onclick=()=>{S=null;renderHome();};
  $('#print').onclick=()=>{document.querySelectorAll('details.rev').forEach(d=>d.open=true);window.print();};
  $('#onlywrong').onchange=e=>document.querySelectorAll('details.rev').forEach(d=>d.style.display=e.target.checked&&d.dataset.cls==='good'?'none':'');
  window.scrollTo(0,0);
}

/* ---------- Tastatur ---------- */
document.addEventListener('keydown',e=>{
  if(!S||S.done||!document.querySelector('.question'))return;
  if(e.target.tagName==='SELECT'||e.target.tagName==='TEXTAREA')return;
  if(e.key==='ArrowRight'&&S.at<S.ids.length-1)go(S.at+1);
  else if(e.key==='ArrowLeft'&&S.at>0)go(S.at-1);
  else if(/^[1-5]$/.test(e.key)){const el=app.querySelectorAll('[data-o]')[+e.key-1];if(el&&!el.disabled){el.click();}}
});
$('#nav-home').onclick=()=>{if(S&&!S.done)save();stopTimer();S=S&&S.done?null:S;renderHome();};
if(!POOL.length||!IREB.length){app.innerHTML='<p class="panel">Fragendaten konnten nicht geladen werden. Bitte die ZIP-Datei vollständig entpacken und index.html aus dem entpackten Ordner öffnen.</p>';}
else renderHome();
