let tmBook=null, tmAsk=false;
const tmMs=()=>{const t=S.timer;return t?t.acc+(t.running?Date.now()-t.t0:0):0;};
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
  const disc=tmAsk
    ?'<div class="confirm"><p>Descartar este tempo sem registrar?</p><div class="row"><button class="btn btn-danger" data-act="tm-discard-yes">Descartar</button><button class="btn btn-ghost" data-act="tm-no">Voltar</button></div></div>'
    :'<button class="btn btn-quiet" data-act="tm-discard">Descartar</button>';
  return '<section class="card tm on"><p class="eyebrow">'+(t.running?'Lendo agora':'Pausado')+'</p>'
    +'<div class="tm-disp num" id="tm-disp" role="timer">'+fmtT(tmMs())+'</div>'
    +'<p class="muted">'+esc(bk?bk.title:'Livro removido')+'</p>'
    +'<div class="row"><button class="btn btn-primary" data-act="'+(t.running?'tm-pause':'tm-resume')+'">'+(t.running?'Pausar':'Retomar')+'</button>'
    +'<button class="btn btn-soft" data-act="tm-finish">Finalizar e registrar</button></div>'+disc+'</section>';
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
const _submitLog=submitLog;
submitLog=function(){
  const n=S.logs.length;
  _submitLog();
  if(S.logs.length>n&&S.timer&&S.timer.fin){
    S.logs[S.logs.length-1].t=1;
    S.timer=null;tmAsk=false;save();render();
  }
};

document.addEventListener('click',function(e){
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act,t=S.timer;
  switch(act){
    case 'tm-start':{
      const sel=$('#tm-book');if(!sel||!sel.value)break;
      tmBook=sel.value;S.timer={bookId:sel.value,t0:Date.now(),acc:0,running:true,fin:false};save();render();break;
    }
    case 'tm-pause':if(t&&t.running){t.acc+=Date.now()-t.t0;t.running=false;save();render();}break;
    case 'tm-resume':if(t&&!t.running){t.t0=Date.now();t.running=true;t.fin=false;save();render();}break;
    case 'tm-finish':{
      if(!t)break;
      const ms=tmMs();t.acc=ms;t.running=false;t.fin=true;save();render();
      openLog(t.bookId);
      const fm=$('#f-min');
      if(fm){fm.value=Math.min(600,Math.max(1,Math.round(ms/60000)));preview();}
      const h=$('#f-hint');if(h)h.textContent+=' Tempo cronometrado: '+fmtT(ms)+'.';
      break;
    }
    case 'tm-discard':tmAsk=true;render();break;
    case 'tm-no':tmAsk=false;render();break;
    case 'tm-discard-yes':S.timer=null;tmAsk=false;save();render();toast(['Cronômetro descartado']);break;
    case 'goal-apply':S.goal=parseInt(a.dataset.v,10);save();render();toast(['Meta diária: '+S.goal+' min']);break;
  }
});
document.addEventListener('change',function(e){if(e.target.id==='tm-book')tmBook=e.target.value;});
setInterval(function(){const el=$('#tm-disp');if(el&&S.timer)el.textContent=fmtT(tmMs());},500);
render();

