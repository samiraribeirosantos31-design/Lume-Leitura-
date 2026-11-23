function openSheet(html,focusId,variant=""){
  if(!$('.sheet'))lastFocus=document.activeElement;
  $('#sheet-root').innerHTML='<div class="scrim" data-act="close"></div><section class="sheet '+variant+'" role="dialog" aria-modal="true" aria-labelledby="sh-t">'+html+'</section>';
  document.body.style.overflow='hidden';
  const f=focusId&&$('#'+focusId);if(f)f.focus({preventScroll:true});
}
function confirmAction(title,message,action,label,id=''){
  openSheet('<h2 id="sh-t">'+esc(title)+'</h2><p>'+esc(message)+'</p><div class="row">'
    +'<button class="btn btn-danger" data-act="'+action+'" data-id="'+esc(id)+'">'+esc(label)+'</button>'
    +'<button class="btn btn-ghost" id="confirm-cancel" data-act="close">Cancelar</button></div>','confirm-cancel','sheet-center');
}
function closeSheet(){
  $('#sheet-root').innerHTML='';document.body.style.overflow='';
  if(lastFocus&&lastFocus.focus){try{lastFocus.focus({preventScroll:true});}catch(e){}}
}
function toast(lines){
  const el=$('#toast');
  el.innerHTML=lines.map(l=>'<span>'+esc(l)+'</span>').join('');
  el.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>el.classList.remove('show'),4800);
}
function calc(book,min,pg){
  const pages=Math.max(0,pg-book.page);let pts=min+pages;
  const before=minutesOn(today());
  const goal=before<S.goal&&before+min>=S.goal;if(goal)pts+=10;
  const fin=pg>=book.total&&!book.done;if(fin)pts+=50;
  return {pages:pages,pts:pts,goal:goal,fin:fin};
}
function openAdd(note){
  openSheet('<h2 id="sh-t">Adicionar livro</h2>'+(note?'<p class="muted">'+esc(note)+'</p>':'')
   +'<form id="form-add" novalidate>'
   +'<label for="f-title">Título</label><input id="f-title" type="text" maxlength="80" autocomplete="off" placeholder="Ex.: Dom Casmurro">'
   +'<label for="f-author">Autor (opcional)</label><input id="f-author" type="text" maxlength="60" autocomplete="off">'
   +'<label for="f-total">Total de páginas</label><input id="f-total" type="number" inputmode="numeric" min="1" max="5000" placeholder="Ex.: 256">'
   +'<label for="f-start">Já li até a página</label><input id="f-start" type="number" inputmode="numeric" min="0" value="0">'
   +'<p class="err" id="f-err" role="alert"></p>'
   +'<div class="row"><button class="btn btn-primary" type="submit">Salvar livro</button><button class="btn btn-ghost" type="button" data-act="close">Cancelar</button></div></form>','f-title');
}
function openLog(id,{timer=false}={}){
  const open=S.books.filter(b=>!b.done&&(!timer||b.id===id));
  if(!open.length){openAdd(S.books.length?'Todos os seus livros estão concluídos. Adicione o próximo para continuar.':'Adicione um livro para registrar sua primeira leitura.');return;}
  let sel=id&&open.find(b=>b.id===id)?id:null;
  if(!sel){for(let i=S.logs.length-1;i>=0&&!sel;i--){if(open.find(b=>b.id===S.logs[i].bookId))sel=S.logs[i].bookId;}}
  if(!sel)sel=open[0].id;
  const book=open.find(b=>b.id===sel);
  openSheet('<h2 id="sh-t" tabindex="-1">Registrar leitura</h2><form id="form-log" novalidate>'
   +'<label for="f-book-control">Livro</label>'+choiceField('f-book','Livro',bookChoices(open),sel,{search:open.length>5,locked:timer})
   +readingDuration(timer)
   +'<label for="f-page">Parei na página</label><input id="f-page" type="number" inputmode="numeric" min="0" value="'+book.page+'">'
   +'<p class="hint" id="f-hint">Você estava na página '+book.page+' de '+book.total+'.</p>'
   +'<p class="preview num" id="f-prev">Informe horas e minutos para ver seus pontos.</p>'
   +'<p class="err" id="f-err" role="alert"></p>'
   +'<div class="row"><button class="btn btn-primary" type="submit">Salvar leitura</button><button class="btn btn-ghost" type="button" data-act="close">Cancelar</button></div></form>','sh-t','sheet-center');
}
function curBook(){const el=$('#f-book');return el?S.books.find(b=>b.id===el.value):null;}
function readingDuration(timed){
  if(timed)return '<input type="hidden" id="timer-session" value="'+esc(S.timer.id)+'">'
    +'<p class="reading-measured"><b>'+readingDurationLabel(measuredMinutes())+'</b> · Cronometrado no Lume</p>';
  return '<fieldset class="reading-duration"><legend>Tempo de leitura</legend>'
    +'<div class="chips">'+[10,15,20,30,45,60].map(v=>'<button type="button" class="chip" data-act="chip" data-v="'+v+'" aria-pressed="false">'+readingDurationLabel(v)+'</button>').join('')+'</div>'
    +'<details id="duration-picker"><summary id="duration-value">Escolher duração</summary><div class="duration-parts">'
    +'<div><label for="f-hours-control">Horas</label>'+choiceField('f-hours','Horas',numberChoices(11,'h'),0)+'</div>'
    +'<div><label for="f-min-control">Minutos</label>'+choiceField('f-min','Minutos',numberChoices(60,'min'),0)+'</div>'
    +'</div><button type="button" class="btn btn-soft btn-block" data-act="duration-done">Confirmar duração</button></details>'
    +'<p class="hint">Registros manuais ajudam o mascote até o nível 10.</p></fieldset>';
}
function readingDurationLabel(total){
  const h=Math.floor(total/60),m=total%60;
  return (h?h+' h'+(m?' ':''):'')+(m||!h?m+' min':'');
}
function pendingLogTimer(book=curBook()){
  const shown=$('#timer-session'),t=S.timer;
  return shown&&t?.fin&&shown.value===t.id&&book?.id===t.bookId?t:null;
}
function measuredMinutes(){
  return Math.min(600,Math.max(1,Math.round((S.timer?.acc||0)/60000)));
}
function formReadingMinutes(){
  if($('#timer-session'))return pendingLogTimer()?measuredMinutes():NaN;
  const h=Number($('#f-hours')?.value||0),m=Number($('#f-min')?.value||0);
  return Number.isInteger(h)&&Number.isInteger(m)&&h>=0&&m>=0&&m<60?h*60+m:NaN;
}
function fillReadingMinutes(total){
  if(!setChoice('f-hours',Math.floor(total/60))||!setChoice('f-min',total%60))return;
  preview();
}
function preview(){
  const b=curBook();if(!b)return;
  const min=formReadingMinutes(),pg=parseInt($('#f-page').value,10),el=$('#f-prev');
  $$('[data-act=chip]').forEach(c=>c.setAttribute('aria-pressed',String(Number(c.dataset.v)===min)));
  const label=$('#duration-value');
  if(label)label.textContent=min>0&&min<=600?readingDurationLabel(min)+' · Alterar':'Escolher duração';
  if(!el)return;
  if(!(min>0)||min>600){el.textContent='Escolha uma duração de até 10 horas.';return;}
  const p=isNaN(pg)?b.page:pg;
  if(p<b.page||p>b.total){el.textContent='';return;}
  const c=calc(b,min,p);
  const j=readingJourney(),t=pendingLogTimer(b);
  const xp=t?Math.min(timerXPRemaining(),Math.floor(t.acc/60000)):Math.min(c.pts,Math.max(0,levelThresholds[10]-j.score));
  el.textContent=c.pages+' '+pl(c.pages,'página lida','páginas lidas')+' · +'+xp+' XP para o mascote'+(c.fin?' · livro concluído':'');
}
function fail(msg){const e=$('#f-err');if(e)e.textContent=msg;}

function submitLog(){
  const b=curBook(),min=formReadingMinutes();let pg=parseInt($('#f-page').value,10);
  if(!b)return fail('Escolha um livro.');
  if(!(min>0)||min>600)return fail('Escolha uma duração de 1 minuto a 10 horas.');
  if(isNaN(pg))pg=b.page;
  if(pg<b.page)return fail('Você já estava na página '+b.page+'. Informe essa página ou uma maior.');
  if(pg>b.total)return fail('Este livro tem '+b.total+' páginas. Informe uma página até '+b.total+'.');
  const before=readingJourney(), earnedBefore=new Set(unlockedIds()),c=calc(b,min,pg);
  const previous={page:b.page,done:b.done,seen:S.seen,timer:S.timer};
  const timed=pendingLogTimer(b);
  S.logs.push({id:uid(),date:today(),bookId:b.id,min:min,pages:c.pages,pts:c.pts,work:bookIdentity(b),finished:c.fin,source:timed?'timer':'manual',...(timed?{t:1,timerMin:Math.min(600,Math.floor(timed.acc/60000))}:{})});
  if(timed)S.timer=null;
  b.page=pg;if(c.fin)b.done=true;
  const after=readingJourney(),now=unlockedIds(),seen=S.seen||[],fresh=achs().filter(a=>a.ok&&!earnedBefore.has(a.id)&&!seen.includes(a.id));
  if(!S.demo)S.seen=now;
  if(!save()){
    S.logs.pop();b.page=previous.page;b.done=previous.done;S.seen=previous.seen;S.timer=previous.timer;
    return fail('Não foi possível salvar. Sua sessão continua disponível.');
  }
  closeSheet();render();
  const lines=['Leitura salva · '+readingDurationLabel(min)];
  if(c.goal)lines.push('Meta de hoje batida');
  if(c.fin)lines.push('Livro concluído · '+b.title);
  const leveled=after.level>before.level;
  if((leveled||fresh.length)&&!S.demo)announceReadingReward(before,after,fresh);
  else toast(lines);
}
function submitAdd(){
  const title=$('#f-title').value.trim(),author=$('#f-author').value.trim(),total=parseInt($('#f-total').value,10);let start=parseInt($('#f-start').value,10);
  if(!title)return fail('Informe o título do livro.');
  if(!(total>=1)||total>5000)return fail('Informe o total de páginas, de 1 a 5.000.');
  if(isNaN(start)||start<0)start=0;if(start>total)start=total;
  S.books.push({id:uid(),title:title,author:author,total:total,page:start,done:start>=total});
  save();closeSheet();tab='books';render();toast(['Livro adicionado: '+title]);
}
function submitSettings(){
  const g=parseInt($('#f-goal').value,10);
  if(!(g>=5)||g>240)return fail('A meta deve ficar entre 5 e 240 minutos.');
  S.goal=g;save();closeSheet();render();toast(['Ajustes salvos']);
}
function limparDemonstracao(){
  if(!S.demo)return;
  const exemplos=seed();
  const assinatura=l=>[l.bookId,l.min,l.pages,l.pts].join(':');
  const iguais=exemplos.logs.every((l,i)=>S.logs[i]&&assinatura(l)===assinatura(S.logs[i]));
  if(iguais)S.logs=S.logs.slice(exemplos.logs.length);
  S.notes=S.notes.filter(n=>!n.demo);
  if(iguais)S.books=S.books.filter(b=>{
    const original=exemplos.books.find(l=>l.id===b.id);
    const alterado=original&&Object.keys(original).some(k=>b[k]!==original[k]);
    return !original||alterado||S.logs.some(l=>l.bookId===b.id)||S.notes.some(n=>n.bookId===b.id);
  });
  S.demo=false;S.seen=[];save();closeSheet();render();
  toast([iguais?'Exemplos removidos':'Anotações de exemplo removidas. Leituras foram preservadas.']);
}
function wipeData(){
  S.books=[];S.logs=[];S.notes=[];S.timer=null;S.demo=false;S.seen=[];ask=null;save();closeSheet();render();
  toast(['Dados apagados. Comece adicionando um livro.']);
}

document.addEventListener('click',function(e){
  const tb=e.target.closest('[data-tab]');
  if(tb){if(tab===tb.dataset.tab)return;closeSheet();tab=tb.dataset.tab;ask=null;render();window.scrollTo(0,0);return;}
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act,id=a.dataset.id;
  switch(act){
    case 'log':openLog(id);break;
    case 'add':openAdd();break;
    case 'settings':openSettings();break;
    case 'close':closeSheet();break;
    case 'chip':fillReadingMinutes(Number(a.dataset.v));break;
    case 'duration-done':{const picker=$('#duration-picker');if(picker){picker.open=false;$('#duration-value')?.focus();}break;}
    case 'step':{const f=$('#f-goal');const v=(parseInt(f.value,10)||S.goal)+parseInt(a.dataset.d,10);f.value=Math.min(240,Math.max(5,v));break;}
    case 'rm':{
      const b=S.books.find(x=>x.id===id);if(b)confirmAction('Remover da estante?','“'+b.title+'” será removido. Suas leituras e notas já registradas serão preservadas.','rm-yes','Remover livro',b.id);break;
    }
    case 'rm-yes':{
      const book=S.books.find(b=>b.id===id);
      if(book&&!(S.demo&&['b1','b2','b3'].includes(id))){
        for(const log of S.logs)if(log.bookId===id&&!log.work)log.work=bookIdentity(book);
      }
      S.books=S.books.filter(b=>b.id!==id);if(S.timer?.bookId===id)S.timer=null;ask=null;save();closeSheet();render();toast(['Livro removido']);break;}
    case 'ask-clear':ask='clear';render();break;
    case 'ask-no':ask=null;render();break;
    case 'wipe':confirmAction('Apagar dados do perfil?','Isso apaga livros, notas, leituras e pontos deste perfil, inclusive na nuvem quando conectada.','wipe-yes','Apagar tudo');break;
    case 'wipe-yes':wipeData();break;
    case 'demo-limpar':limparDemonstracao();break;
  }
});
document.addEventListener('submit',function(e){
  e.preventDefault();
  const id=e.target.id;
  if(id==='form-log')submitLog();else if(id==='form-add')submitAdd();else if(id==='form-set')submitSettings();
});
document.addEventListener('input',function(e){if(['f-hours','f-min','f-page'].includes(e.target.id))preview();});
document.addEventListener('change',function(e){
  if(['f-hours','f-min'].includes(e.target.id)){preview();return;}
  if(e.target.id!=='f-book')return;
  const b=curBook();if(!b)return;
  $('#f-page').value=b.page;$('#f-hint').textContent='Você estava na página '+b.page+' de '+b.total+'.';preview();
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('.sheet')){e.preventDefault();closeSheet();}});

S=load();
if(!S){S=emptyState();}
if(!S.seen){S.seen=S.demo?[]:unlockedIds();}
save();
