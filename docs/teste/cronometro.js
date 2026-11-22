let tmBook=null;
let readingDim=false;
const tmMs=()=>{const t=S.timer;return t?t.acc+(t.running?Math.max(0,Date.now()-t.t0):0):0;};
const fmtT=ms=>{
  const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),r=s%60;
  return h?h+':'+pad(m)+':'+pad(r):pad(m)+':'+pad(r);
};
const hm=x=>{const m=Math.round(x),h=Math.floor(m/60),r=m%60;return h?h+' h'+(r?' '+r+' min':''):m+' min';};

function tmCard(){
  const t=S.timer,open=S.books.filter(b=>!b.done);
  if(!t){
    if(!open.length)return '<section class="card tm"><h2>Cronômetro de leitura</h2><p class="muted">Adicione um livro na aba Livros para cronometrar sua leitura.</p></section>';
    if(!tmBook||!open.find(b=>b.id===tmBook))tmBook=open[0].id;
    return '<section class="card tm"><h2>Cronômetro de leitura</h2>'
      +'<p class="muted">Cronometre quanto você lê de verdade. Ao finalizar, o tempo vai direto para o registro.</p>'
      +'<select id="tm-book" class="tm-sel" aria-label="Livro">'+open.map(b=>'<option value="'+b.id+'"'+(b.id===tmBook?' selected':'')+'>'+esc(b.title)+'</option>').join('')+'</select>'
      +'<button class="btn btn-soft btn-block" data-act="tm-start">'+ic('i-today')+' Iniciar leitura</button></section>';
  }
  const bk=S.books.find(b=>b.id===t.bookId);
  return '<section class="card tm on"><p class="eyebrow">'+(t.running?'Lendo agora':t.fin?'Pronto para registrar':'Pausado')+'</p>'
    +'<div class="tm-disp num" id="tm-disp" role="timer">'+fmtT(tmMs())+'</div>'
    +'<p class="muted">'+esc(bk?bk.title:'Livro removido')+'</p>'
    +'<div class="row"><button class="btn btn-primary" data-act="tm-open">'+(t.fin?'Registrar leitura':'Abrir sessão')+'</button>'
    +'<button class="btn btn-quiet" data-act="tm-discard">Descartar</button></div></section>';
}

function rhythmCard(){
  const from=dkey(addDays(new Date(),-13)),by={},sess=[];
  let pg=0,mn=0;
  S.logs.forEach(l=>{
    if(l.date>=from&&l.min>0){by[l.date]=(by[l.date]||0)+l.min;pg+=l.pages||0;mn+=l.min;if(l.t)sess.push(l.min);}
  });
  const ds=Object.keys(by);
  const head='<section class="card rh"><div class="chart-h"><h2>Seu ritmo</h2><span class="muted">últimos 14 dias</span></div>';
  if(ds.length<3)return head+'<p class="muted">Leia em pelo menos 3 dias diferentes para eu sugerir uma meta com base no seu histórico. Você leu em '+ds.length+' '+pl(ds.length,'dia','dias')+' até agora.</p></section>';
  const avg=ds.reduce((t,k)=>t+by[k],0)/ds.length,best=Math.max.apply(null,ds.map(k=>by[k]));
  const pace=mn>0?pg/mn*60:0;
  const sug=Math.min(180,Math.max(10,Math.round(avg*1.1/5)*5));
  let o=head
    +'<div class="minis"><div class="mini"><b class="num">'+Math.round(avg)+'</b><span>min por dia de leitura</span></div>'
    +'<div class="mini"><b class="num">'+best+'</b><span>min no melhor dia</span></div>'
    +'<div class="mini"><b class="num">'+(pace>0?Math.round(pace):'—')+'</b><span>páginas por hora</span></div></div>'
    +'<p class="muted">Você leu em '+ds.length+' dos últimos 14 dias.</p>';
  if(sess.length){
    const sa=sess.reduce((t,x)=>t+x,0)/sess.length;
    o+='<p class="muted">Nas leituras cronometradas, sua sessão média é de '+Math.round(sa)+' min e a mais longa, de '+Math.max.apply(null,sess)+' min.</p>';
  }
  o+='<div class="sug"><b>Meta sugerida: '+sug+' min por dia</b>'
    +'<p class="muted">Baseada na sua média nos dias em que você lê, com um pouco a mais para evoluir.</p>'
    +(sug===S.goal?'<p class="muted">Sua meta atual já está nesse valor.</p>':'<button class="btn btn-soft" data-act="goal-apply" data-v="'+sug+'">Usar '+sug+' min como meta</button>')+'</div>';
  const cur=S.books.find(b=>!b.done&&b.page>0)||S.books.find(b=>!b.done);
  if(cur&&pace>0){
    const rem=cur.total-cur.page,left=rem/pace*60,days=Math.max(1,Math.ceil(left/S.goal));
    o+='<p class="muted">Para terminar "'+esc(cur.title)+'": faltam '+rem+' páginas, cerca de '+hm(left)+' no seu ritmo. Lendo '+S.goal+' min por dia, isso leva uns '+days+' '+pl(days,'dia','dias')+'.</p>';
  }
  return o+'</section>';
}

const _viewToday=viewToday;
viewToday=function(){
  const h=_viewToday(),key='<section class="card"><div class="chart-h">',i=h.indexOf(key),extra=tmCard()+rhythmCard();
  return i>=0?h.slice(0,i)+extra+h.slice(i):h+extra;
};
const readingPlugin=()=>window.Capacitor?.Plugins?.ReadingTimer;
let visibleTimer=null, timerNativeOps=Promise.resolve();
function timerBridge(action,params){
  const plugin=readingPlugin();if(!plugin)return Promise.resolve(null);
  const operation=timerNativeOps.then(()=>plugin[action](params));
  timerNativeOps=operation.catch(()=>null);
  return timerNativeOps;
}
function publishTimer(){
  const t=S.timer;if(!t?.id)return;
  const title=S.books.find(b=>b.id===t.bookId)?.title||'Lume Leitura';
  timerBridge('publish',{session:{...t,title,notify:S.timerAlerts!==false}});
}
function stampTimer(t){t.changedAt=Math.max(Date.now(),(t.changedAt||0)+1);}
function trackTimer(){
  const t=S.timer;
  if(t&&!t.id){t.id=uid();stampTimer(t);save();}
  const previous=visibleTimer;
  if(previous===(t?.id||null))return;
  visibleTimer=t?.id||null;
  if(previous)timerBridge('clear',{id:previous});
  if(t)readNativeTimer(true);
}
async function readNativeTimer(publishMissing=false){
  const before=S.timer,profile=stateKey;
  if(!readingPlugin()||!before?.id)return;
  const result=await timerBridge('read');
  if(stateKey!==profile||S.timer!==before)return;
  const incoming=result?.session;
  if(incoming?.id===before.id&&incoming.changedAt>before.changedAt){
    const {t0,acc,running,fin,changedAt}=incoming;
    if(!Number.isFinite(acc)||!Number.isFinite(t0))return;
    Object.assign(before,{t0,acc,running,fin,changedAt});
    save();render();
    if($('#tm-focus-time'))openTimerPanel();
  }else if(publishMissing)publishTimer();
}
function openTimerPanel(){
  const t=S.timer,b=S.books.find(x=>x.id===t?.bookId);
  if(!t||!b)return;
  if(t.fin){openTimerLog();return;}
  openSheet('<h2 id="sh-t">'+esc(b.title)+'</h2><p class="muted">'+(t.running?'Sessão em andamento':'Sessão pausada')+'</p>'
    +'<div class="tm-disp num" id="tm-focus-time" role="timer">'+fmtT(tmMs())+'</div>'
    +'<div class="row"><button class="btn btn-primary" data-act="'+(t.running?'tm-pause':'tm-resume')+'">'+(t.running?'Pausar':'Continuar')+'</button>'
    +'<button class="btn btn-soft" data-act="tm-finish">Parar e registrar</button></div>'
    +'<div class="row"><button class="btn btn-ghost" aria-pressed="'+readingDim+'" data-act="tm-night">'+(readingDim?'Desativar luz noturna':'Ativar luz noturna')+'</button>'
    +'<button class="btn btn-quiet" data-act="close">Voltar ao app</button></div>',null,'reading-focus'+(readingDim?' reading-dim':''));
}
function openTimerLog(){
  const t=S.timer;
  if(!t||!S.books.some(b=>b.id===t.bookId&&!b.done))return;
  openLog(t.bookId);
  fillReadingMinutes(Math.min(600,Math.max(1,Math.round(tmMs()/60000))));
  const hint=$('#f-hint');if(hint)hint.textContent+=' Tempo cronometrado: '+fmtT(tmMs())+'.';
}
function startReadingTimer(bookId){
  const book=S.books.find(b=>b.id===bookId&&!b.done);if(!book)return;
  if(S.timer){openTimerPanel();return;}
  tmBook=bookId;readingDim=false;
  S.timer={id:uid(),bookId,t0:Date.now(),acc:0,running:true,fin:false};
  stampTimer(S.timer);save();render();openingReadingQuote(bookId);openTimerPanel();
}
const _submitLog=submitLog;
submitLog=function(){
  const n=S.logs.length, pending=S.timer?.fin?S.timer:null;
  _submitLog();
  if(S.logs.length>n){
    const entry=S.logs.at(-1);
    if(pending?.bookId===entry.bookId){
      entry.t=1;S.timer=null;readingDim=false;save();render();
    }
    openingReadingQuote(entry.bookId);
  }
};
const timerSettings=openSettings;
openSettings=function(){
  timerSettings();
  if(readingPlugin())$('#wipe-zone')?.insertAdjacentHTML('beforebegin','<button class="btn btn-soft btn-block" data-act="tm-alerts">Controles nas notificações: '+(S.timerAlerts===false?'desativados':'ativados')+'</button>');
};
document.addEventListener('click',async function(e){
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act;
  if(act==='goal-apply'){S.goal=parseInt(a.dataset.v,10);save();render();toast(['Meta diária: '+S.goal+' min']);return;}
  if(!act.startsWith('tm-'))return;
  if(act==='tm-start'||act==='tm-quick'){startReadingTimer(act==='tm-quick'?a.dataset.id:$('#tm-book')?.value);return;}
  if(act==='tm-alerts'){
    const permissions=window.Capacitor?.Plugins?.LocalNotifications;
    let granted=false;
    try{
      const status=await permissions?.checkPermissions();
      granted=status?.display==='granted';
      if(!granted)granted=(await permissions?.requestPermissions())?.display==='granted';
      else S.timerAlerts=S.timerAlerts===false;
      if(!granted)return toast(['Ative as notificações do Lume nas configurações do Android.']);
      if(status?.display!=='granted')S.timerAlerts=true;
      save();publishTimer();openSettings();
    }catch(e){toast(['Não foi possível alterar as notificações.']);}
    return;
  }
  const before=S.timer;
  if(!before)return;
  await readNativeTimer();
  const t=S.timer;if(t!==before)return;
  switch(act){
    case 'tm-open':openTimerPanel();break;
    case 'tm-night':if(!t.fin){readingDim=!readingDim;openTimerPanel();}break;
    case 'tm-pause':
      if(t.running){t.acc=tmMs();t.running=false;stampTimer(t);save();render();publishTimer();openTimerPanel();}
      break;
    case 'tm-resume':
      if(!t.running&&!t.fin){t.t0=Date.now();t.running=true;stampTimer(t);save();render();publishTimer();openTimerPanel();}
      break;
    case 'tm-finish':
      t.acc=tmMs();t.running=false;t.fin=true;readingDim=false;stampTimer(t);save();render();publishTimer();openTimerLog();break;
    case 'tm-discard':
      confirmAction('Descartar cronômetro?','O tempo desta sessão não será registrado.','tm-discard-yes','Descartar tempo',t.id);break;
    case 'tm-discard-yes':
      if(a.dataset.id!==t.id)return;
      S.timer=null;readingDim=false;save();closeSheet();render();toast(['Cronômetro descartado']);break;
  }
});
document.addEventListener('change',function(e){if(e.target.id==='tm-book')tmBook=e.target.value;});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)readNativeTimer();});
window.addEventListener('focus',()=>readNativeTimer());
setInterval(function(){
  for(const id of ['#tm-disp','#tm-focus-time']){const el=$(id);if(el&&S.timer)el.textContent=fmtT(tmMs());}
},500);
render();
