/* Hell/Dunkel-Umschaltung. Ohne gespeicherte Wahl folgt die Seite der Systemeinstellung. */
(function(){
  var KEY='cpre-theme', root=document.documentElement;
  var mq=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
  function saved(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
  function current(){return saved()||(mq&&mq.matches?'dark':'light');}
  function label(btn,t){
    var dark=t==='dark';
    btn.textContent=dark?'☀️ Hell':'🌙 Dunkel';
    btn.setAttribute('aria-pressed',dark?'true':'false');
    btn.title=dark?'Zum hellen Modus wechseln':'Zum dunklen Modus wechseln';
  }
  function apply(t){root.setAttribute('data-theme',t);var b=document.getElementById('theme-toggle');if(b)label(b,t);}
  apply(current());
  if(mq){var h=function(){if(!saved())apply(current());};mq.addEventListener?mq.addEventListener('change',h):mq.addListener(h);}
  document.addEventListener('DOMContentLoaded',function(){
    var b=document.getElementById('theme-toggle'); if(!b)return;
    label(b,current());
    b.addEventListener('click',function(){
      var t=root.getAttribute('data-theme')==='dark'?'light':'dark';
      try{localStorage.setItem(KEY,t);}catch(e){}
      apply(t);
    });
  });
})();
