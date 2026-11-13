function openSheet(html,focusId){
  lastFocus=document.activeElement;
  $('#sheet-root').innerHTML='<div class="scrim" data-act="close"></div><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t">'+html+'</section>';
  document.body.style.overflow='hidden';
  const f=focusId&&$('#'+focusId);if(f)f.focus({preventScroll:true});
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
   +'<label for="f-min">Minutos lidos</label><div class="chips">'+[10,15,20,30,45].map(v=>'<button type="button" class="chip" data-act="chip" data-v="'+v+'" aria-pressed="false">'+v+'</button>').join('')+'</div>'
   +'<input id="f-min" type="number" inputmode="numeric" min="1" max="600" placeholder="Ex.: 25">'
   +'<label for="f-page">Parei na página</label><input id="f-page" type="number" inputmode="numeric" min="0" value="'+book.page+'">'
   +'<p class="hint" id="f-hint">Você estava na página '+book.page+' de '+book.total+'.</p>'
   +'<p class="preview num" id="f-prev">Informe os minutos para ver seus pontos.</p>'
   +'<p class="err" id="f-err" role="alert"></p>'
   +'<div class="row"><button class="btn btn-primary" type="submit">Salvar leitura</button><button class="btn btn-ghost" type="button" data-act="close">Cancelar</button></div></form>','f-min');
}
function openSettings(){
  openSheet('<h2 id="sh-t">Ajustes</h2><form id="form-set" novalidate>'
   +'<label for="f-goal">Meta diária (minutos)</label><div class="stepper"><button type="button" data-act="step" data-d="-5" aria-label="Diminuir 5 minutos">−</button>'
   +'<input id="f-goal" type="number" inputmode="numeric" min="5" max="240" step="5" value="'+S.goal+'"><button type="button" data-act="step" data-d="5" aria-label="Aumentar 5 minutos">+</button></div>'
   +'<label for="f-name">Nome do mascote</label><input id="f-name" type="text" maxlength="14" autocomplete="off" value="'+esc(S.petName)+'">'
   +'<p class="err" id="f-err" role="alert"></p>'
   +'<div class="row"><button class="btn btn-primary" type="submit">Salvar</button><button class="btn btn-ghost" type="button" data-act="close">Fechar</button></div></form>'
   +'<div class="zone" id="wipe-zone"><p>Seus dados ficam guardados neste aparelho.</p><button class="btn btn-ghost" type="button" data-act="wipe">Apagar todos os dados</button></div>','f-goal');
}
function curBook(){const el=$('#f-book');return el?S.books.find(b=>b.id===el.value):null;}
function preview(){
  const b=curBook();if(!b)return;
  const min=parseInt($('#f-min').value,10),pg=parseInt($('#f-page').value,10),el=$('#f-prev');
  $$('.chip').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.v===$('#f-min').value)));
  if(!(min>0)){el.textContent='Informe os minutos para ver seus pontos.';return;}
  const p=isNaN(pg)?b.page:pg;
  if(p<b.page||p>b.total){el.textContent='';return;}
  const c=calc(b,min,p);
  el.textContent='+'+c.pts+' pontos · '+c.pages+' '+pl(c.pages,'página lida','páginas lidas')+(c.goal?' · bônus da meta +10':'')+(c.fin?' · livro concluído +50':'');
}
function fail(msg){const e=$('#f-err');if(e)e.textContent=msg;}

function submitLog(){
  const b=curBook(),min=parseInt($('#f-min').value,10);let pg=parseInt($('#f-page').value,10);
  if(!b)return fail('Escolha um livro.');
  if(!(min>0)||min>600)return fail('Informe de 1 a 600 minutos lidos.');
  if(isNaN(pg))pg=b.page;
  if(pg<b.page)return fail('Você já estava na página '+b.page+'. Informe essa página ou uma maior.');
  if(pg>b.total)return fail('Este livro tem '+b.total+' páginas. Informe uma página até '+b.total+'.');
  const stBefore=stageOf(points()),c=calc(b,min,pg);
  S.logs.push({id:uid(),date:today(),bookId:b.id,min:min,pages:c.pages,pts:c.pts});
  b.page=pg;if(c.fin)b.done=true;
  const stAfter=stageOf(points()),now=unlockedIds(),seen=S.seen||[],fresh=achs().filter(a=>a.ok&&seen.indexOf(a.id)<0);
  S.seen=now;save();closeSheet();render();
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
  const g=parseInt($('#f-goal').value,10),n=$('#f-name').value.trim();
  if(!(g>=5)||g>240)return fail('A meta deve ficar entre 5 e 240 minutos.');
  S.goal=g;S.petName=n||'Tinta';save();closeSheet();render();toast(['Ajustes salvos']);
}
function wipeData(){
  S.books=[];S.logs=[];S.demo=false;S.seen=[];ask=null;save();closeSheet();render();
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
    case 'chip':{const f=$('#f-min');f.value=a.dataset.v;preview();break;}
    case 'step':{const f=$('#f-goal');const v=(parseInt(f.value,10)||S.goal)+parseInt(a.dataset.d,10);f.value=Math.min(240,Math.max(5,v));break;}
    case 'rm':ask='rm:'+id;render();break;
    case 'rm-yes':S.books=S.books.filter(b=>b.id!==id);ask=null;save();render();toast(['Livro removido']);break;
    case 'ask-clear':ask='clear';render();break;
    case 'ask-no':ask=null;render();break;
    case 'wipe':$('#wipe-zone').innerHTML='<p>Isso apaga livros, leituras e pontos deste aparelho. A meta e o nome do mascote continuam.</p><div class="row"><button class="btn btn-danger" type="button" data-act="wipe-yes">Apagar tudo</button><button class="btn btn-ghost" type="button" data-act="wipe-no">Cancelar</button></div>';break;
    case 'wipe-no':$('#wipe-zone').innerHTML='<p>Seus dados ficam guardados neste aparelho.</p><button class="btn btn-ghost" type="button" data-act="wipe">Apagar todos os dados</button>';break;
    case 'wipe-yes':wipeData();break;
  }
});
document.addEventListener('submit',function(e){
  e.preventDefault();
  const id=e.target.id;
  if(id==='form-log')submitLog();else if(id==='form-add')submitAdd();else if(id==='form-set')submitSettings();
});
document.addEventListener('input',function(e){if(e.target.id==='f-min'||e.target.id==='f-page')preview();});
document.addEventListener('change',function(e){
  if(e.target.id!=='f-book')return;
  const b=curBook();if(!b)return;
  $('#f-page').value=b.page;$('#f-hint').textContent='Você estava na página '+b.page+' de '+b.total+'.';preview();
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('.sheet'))closeSheet();});

S=load();
if(!S){S=seed();}
if(!S.seen){S.seen=unlockedIds();}
save();
render();

