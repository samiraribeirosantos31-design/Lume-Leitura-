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
function openLog(id){
  const open=S.books.filter(b=>!b.done);
  if(!open.length){openAdd(S.books.length?'Todos os seus livros estão concluídos. Adicione o próximo para continuar.':'Adicione um livro para registrar sua primeira leitura.');return;}
  let sel=id&&open.find(b=>b.id===id)?id:null;
  if(!sel){for(let i=S.logs.length-1;i>=0&&!sel;i--){if(open.find(b=>b.id===S.logs[i].bookId))sel=S.logs[i].bookId;}}
  if(!sel)sel=open[0].id;
  const book=open.find(b=>b.id===sel);
  openSheet('<h2 id="sh-t">Registrar leitura</h2><form id="form-log" novalidate>'
   +'<label for="f-book">Livro</label><select id="f-book">'+open.map(b=>'<option value="'+b.id+'"'+(b.id===sel?' selected':'')+'>'+esc(b.title)+'</option>').join('')+'</select>'
   +'<fieldset class="reading-duration"><legend>Tempo de leitura</legend><div class="chips">'+[10,15,20,30,45].map(v=>'<button type="button" class="chip" data-act="chip" data-v="'+v+'" aria-pressed="false">'+v+' min</button>').join('')+'</div>'
   +'<div class="duration-parts"><label>Horas<input id="f-hours" type="number" inputmode="numeric" min="0" max="10" step="1" placeholder="0"></label>'
   +'<label>Minutos<input id="f-min" type="number" inputmode="numeric" min="0" max="59" step="1" placeholder="00"></label></div></fieldset>'
   +'<label for="f-page">Parei na página</label><input id="f-page" type="number" inputmode="numeric" min="0" value="'+book.page+'">'
   +'<p class="hint" id="f-hint">Você estava na página '+book.page+' de '+book.total+'.</p>'
   +'<p class="preview num" id="f-prev">Informe horas e minutos para ver seus pontos.</p>'
   +'<p class="err" id="f-err" role="alert"></p>'
   +'<div class="row"><button class="btn btn-primary" type="submit">Salvar leitura</button><button class="btn btn-ghost" type="button" data-act="close">Cancelar</button></div></form>','f-min');
}
function openSettings(){
  openSheet('<h2 id="sh-t">Ajustes</h2><form id="form-set" novalidate>'
   +'<label for="f-goal">Meta diária (minutos)</label><div class="stepper"><button type="button" data-act="step" data-d="-5" aria-label="Diminuir 5 minutos">−</button>'
   +'<input id="f-goal" type="number" inputmode="numeric" min="5" max="240" step="5" value="'+S.goal+'"><button type="button" data-act="step" data-d="5" aria-label="Aumentar 5 minutos">+</button></div>'
   +'<p class="err" id="f-err" role="alert"></p>'
   +'<div class="row"><button class="btn btn-primary" type="submit">Salvar</button><button class="btn btn-ghost" type="button" data-act="close">Fechar</button></div></form>'
   +(S.demo?'<button class="btn btn-ghost btn-block" type="button" data-act="demo-limpar">Remover dados de demonstração</button>':'')+'<div class="zone" id="wipe-zone"><p>Seus dados ficam guardados neste aparelho.</p><button class="btn btn-ghost" type="button" data-act="wipe">Apagar todos os dados</button></div>','f-goal');
}
function curBook(){const el=$('#f-book');return el?S.books.find(b=>b.id===el.value):null;}
function formReadingMinutes(){
  const h=Number($('#f-hours')?.value||0),m=Number($('#f-min')?.value||0);
  return Number.isInteger(h)&&Number.isInteger(m)&&h>=0&&m>=0&&m<60?h*60+m:NaN;
}
function fillReadingMinutes(total){
  const h=$('#f-hours'),m=$('#f-min');if(!h||!m)return;
  h.value=Math.floor(total/60);m.value=total%60;preview();
}
function preview(){
  const b=curBook();if(!b)return;
  const min=formReadingMinutes(),pg=parseInt($('#f-page').value,10),el=$('#f-prev');
  $$('[data-act=chip]').forEach(c=>c.setAttribute('aria-pressed',String(Number(c.dataset.v)===min)));
  if(!(min>0)||min>600){el.textContent='Informe horas e minutos para ver seus pontos.';return;}
  const p=isNaN(pg)?b.page:pg;
  if(p<b.page||p>b.total){el.textContent='';return;}
  const c=calc(b,min,p);
  el.textContent='+'+c.pts+' pontos · '+c.pages+' '+pl(c.pages,'página lida','páginas lidas')+(c.goal?' · bônus da meta +10':'')+(c.fin?' · livro concluído +50':'');
}
function fail(msg){const e=$('#f-err');if(e)e.textContent=msg;}

function submitLog(){
  const b=curBook(),min=formReadingMinutes();let pg=parseInt($('#f-page').value,10);
  if(!b)return fail('Escolha um livro.');
  if(!(min>0)||min>600)return fail('Informe de 1 minuto a 10 horas. Use até 59 no campo Minutos.');
  if(isNaN(pg))pg=b.page;
  if(pg<b.page)return fail('Você já estava na página '+b.page+'. Informe essa página ou uma maior.');
  if(pg>b.total)return fail('Este livro tem '+b.total+' páginas. Informe uma página até '+b.total+'.');
  const stBefore=stageOf(points()),c=calc(b,min,pg);
  S.logs.push({id:uid(),date:today(),bookId:b.id,min:min,pages:c.pages,pts:c.pts});
  b.page=pg;if(c.fin)b.done=true;
  const stAfter=stageOf(points()),now=unlockedIds(),seen=S.seen||[],fresh=achs().filter(a=>a.ok&&seen.indexOf(a.id)<0);
  if(!S.demo)S.seen=now;save();closeSheet();render();
  const lines=['+'+c.pts+' pontos'];
  if(c.goal)lines.push('Meta de hoje batida');
  if(c.fin)lines.push('Livro concluído: '+b.title);
  if(stAfter>stBefore)lines.push(S.petName+' evoluiu para '+STAGES[stAfter]);
  fresh.forEach(a=>lines.push('Conquista: '+a.name));
  toast(lines);
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
  if(tb){tab=tb.dataset.tab;ask=null;render();window.scrollTo(0,0);return;}
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act,id=a.dataset.id;
  switch(act){
    case 'log':openLog(id);break;
    case 'add':openAdd();break;
    case 'settings':openSettings();break;
    case 'close':closeSheet();break;
    case 'chip':fillReadingMinutes(Number(a.dataset.v));break;
    case 'step':{const f=$('#f-goal');const v=(parseInt(f.value,10)||S.goal)+parseInt(a.dataset.d,10);f.value=Math.min(240,Math.max(5,v));break;}
    case 'rm':{
      const b=S.books.find(x=>x.id===id);if(b)confirmAction('Remover da estante?','“'+b.title+'” será removido. Suas leituras e notas já registradas serão preservadas.','rm-yes','Remover livro',b.id);break;
    }
    case 'rm-yes':S.books=S.books.filter(b=>b.id!==id);if(S.timer?.bookId===id)S.timer=null;ask=null;save();closeSheet();render();toast(['Livro removido']);break;
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
  if(e.target.id!=='f-book')return;
  const b=curBook();if(!b)return;
  $('#f-page').value=b.page;$('#f-hint').textContent='Você estava na página '+b.page+' de '+b.total+'.';preview();
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('.sheet'))closeSheet();});

S=load();
if(!S){S=emptyState();}
if(!S.seen){S.seen=S.demo?[]:unlockedIds();}
save();
render();
