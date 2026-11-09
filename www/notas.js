S.timer=S.timer||null;
if(!Array.isArray(S.notes)){
  S.notes=[];
  if(S.demo&&S.books.find(function(b){return b.id==='b1';})){
    S.notes.push({id:uid(),bookId:'b1',page:48,date:dkey(addDays(new Date(),-3)),demo:true,text:'Capitu aparece pela primeira vez como vizinha. Reparar nos olhos de ressaca.'});
    S.notes.push({id:uid(),bookId:'b1',page:97,date:dkey(addDays(new Date(),-1)),demo:true,text:'Bentinho tem ciúmes de tudo. Será que ele é um narrador confiável?'});
    S.notes.push({id:uid(),bookId:null,page:null,date:today(),demo:true,text:'Ler 20 minutos antes de dormir funciona melhor do que de manhã.'});
  }
}
save();

let ntFilter='all', ntAsk=null, ntEdit=null;
const NT_MAX=2000;
const dshort=k=>new Date(k+'T12:00:00').toLocaleDateString('pt-BR',{day:'numeric',month:'short'}).replace('.','');
const bookTitle=id=>{const b=S.books.find(x=>x.id===id);return b?b.title:'Livro removido';};
const cut=(s,n)=>s.length>n?s.slice(0,n-1)+'…':s;

function viewNotes(){
  const add='<button class="btn btn-primary btn-block" data-act="nt-new">'+ic('i-plus')+' Nova nota</button>';
  if(!S.notes.length)return add+'<section class="card empty"><h2>Nenhuma nota ainda</h2><p class="muted">Anote trechos, ideias e observações sobre cada livro. Também dá para criar notas gerais, sem livro.</p></section>';
  const ids=[];
  S.notes.forEach(n=>{const k=n.bookId||'_gen';if(ids.indexOf(k)<0)ids.push(k);});
  if(ntFilter!=='all'&&ntFilter!=='_gen'){
    if(!S.books.find(b=>b.id===ntFilter))ntFilter='all';
    else if(ids.indexOf(ntFilter)<0)ids.push(ntFilter);
  }
  if(ntFilter==='_gen'&&ids.indexOf('_gen')<0)ntFilter='all';
  const chip=(v,label)=>'<button type="button" class="chip" data-act="nt-filter" data-v="'+v+'" aria-pressed="'+(ntFilter===v)+'">'+esc(label)+'</button>';
  let chips=chip('all','Todas ('+S.notes.length+')');
  ids.forEach(k=>{
    const c=S.notes.filter(n=>(n.bookId||'_gen')===k).length;
    chips+=chip(k,(k==='_gen'?'Gerais':cut(bookTitle(k),22))+' ('+c+')');
  });
  const list=S.notes.map((n,i)=>({n:n,i:i}))
    .filter(x=>ntFilter==='all'||(ntFilter==='_gen'?!x.n.bookId:x.n.bookId===ntFilter))
    .sort((a,b)=>a.n.date<b.n.date?1:a.n.date>b.n.date?-1:b.i-a.i);
  let html=add+'<div class="fchips">'+chips+'</div>';
  if(!list.length)return html+'<section class="card empty"><h2>Nenhuma nota aqui</h2><p class="muted">Toque em Nova nota para anotar algo sobre este livro.</p></section>';
  html+='<div class="notes-list">'+list.map(x=>{
    const n=x.n;
    const acts=ntAsk===n.id
      ?'<div class="confirm"><p>Apagar esta nota? Isso não pode ser desfeito.</p><div class="row"><button class="btn btn-danger" data-act="nt-del-yes" data-id="'+n.id+'">Apagar nota</button><button class="btn btn-ghost" data-act="nt-no">Cancelar</button></div></div>'
      :'<div class="row"><button class="btn btn-soft" data-act="nt-edit" data-id="'+n.id+'">Editar</button><button class="btn btn-quiet" data-act="nt-del" data-id="'+n.id+'">Apagar</button></div>';
    return '<article class="note"><div class="note-top"><span class="note-bk">'+esc(n.bookId?bookTitle(n.bookId):'Nota geral')+'</span>'
      +'<span class="note-meta num">'+(n.page?'pág. '+n.page+' · ':'')+dshort(n.date)+'</span></div>'
      +'<p class="note-tx">'+esc(n.text)+'</p>'+acts+'</article>';
  }).join('')+'</div>';
  return html;
}

function openNote(id,presetBook){
  const n=id?S.notes.find(x=>x.id===id):null;
  ntEdit=n?n.id:null;
  const sel=n?n.bookId:(presetBook||null);
  const pb=sel?S.books.find(b=>b.id===sel):null;
  const pg=n?(n.page||''):(pb&&pb.page>0?pb.page:'');
  openSheet('<h2 id="sh-t">'+(n?'Editar nota':'Nova nota')+'</h2><form id="form-note" novalidate>'
   +'<label for="nt-book">Livro</label><select id="nt-book"><option value="">Nota geral (sem livro)</option>'
   +S.books.map(b=>'<option value="'+b.id+'"'+(b.id===sel?' selected':'')+'>'+esc(b.title)+'</option>').join('')+'</select>'
   +'<label for="nt-page">Página (opcional)</label><input id="nt-page" type="number" inputmode="numeric" min="0" max="5000" value="'+pg+'">'
   +'<label for="nt-text">Anotação</label><textarea id="nt-text" rows="6" maxlength="'+NT_MAX+'" placeholder="Trecho, ideia, dúvida ou observação...">'+esc(n?n.text:'')+'</textarea>'
   +'<p class="hint num" id="nt-count"></p><p class="err" id="nt-err" role="alert"></p>'
   +'<div class="row"><button class="btn btn-primary" type="submit">'+(n?'Atualizar nota':'Salvar nota')+'</button><button class="btn btn-ghost" type="button" data-act="close">Cancelar</button></div></form>','nt-text');
  ntCount();
}
function ntCount(){const t=$('#nt-text'),c=$('#nt-count');if(t&&c)c.textContent=t.value.length+' de '+NT_MAX+' caracteres';}
function ntFail(m){const e=$('#nt-err');if(e)e.textContent=m;}
function saveNote(){
  const text=$('#nt-text').value.trim(),bid=$('#nt-book').value||null,pg=parseInt($('#nt-page').value,10);
  if(!text)return ntFail('Escreva a anotação antes de salvar.');
  const page=pg>0?pg:null;
  if(ntEdit){
    const n=S.notes.find(x=>x.id===ntEdit);
    if(n){n.text=text;n.bookId=bid;n.page=page;delete n.demo;}
  }else{
    S.notes.push({id:uid(),bookId:bid,page:page,date:today(),text:text});
  }
  ntFilter=bid||'_gen';ntEdit=null;ntAsk=null;
  save();closeSheet();tab='notes';render();toast(['Nota salva']);
}

const _eyebrow=eyebrow;
eyebrow=function(){
  if(tab==='notes'){const n=S.notes.length;return n+' '+pl(n,'nota','notas');}
  return _eyebrow();
};
const _bookCard=bookCard;
bookCard=function(b){
  const c=S.notes.filter(n=>n.bookId===b.id).length;
  const btn='<button class="btn btn-ghost" data-act="nt-open" data-id="'+b.id+'">Notas'+(c?' ('+c+')':'')+'</button>';
  return _bookCard(b).replace('<button class="btn btn-quiet"',btn+'<button class="btn btn-quiet"');
};
const _wipeData=wipeData;
wipeData=function(){
  S.notes=S.demo?S.notes.filter(n=>!n.demo):[];
  S.timer=null;
  _wipeData();
};
render=function(){
  $$('[data-tab]').forEach(b=>{const on=b.dataset.tab===tab;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));});
  $('#title').textContent={today:'Hoje',books:'Livros',notes:'Notas',ach:'Conquistas'}[tab];
  $('#eyebrow').textContent=eyebrow();
  $('#view').innerHTML=tab==='today'?viewToday():tab==='books'?viewBooks():tab==='notes'?viewNotes():viewAch();
};

document.addEventListener('click',function(e){
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act,id=a.dataset.id;
  switch(act){
    case 'nt-new':openNote(null,ntFilter!=='all'&&ntFilter!=='_gen'?ntFilter:null);break;
    case 'nt-edit':openNote(id);break;
    case 'nt-open':ntFilter=id;ntAsk=null;tab='notes';render();window.scrollTo(0,0);break;
    case 'nt-filter':ntFilter=a.dataset.v;ntAsk=null;render();break;
    case 'nt-del':ntAsk=id;render();break;
    case 'nt-no':ntAsk=null;render();break;
    case 'nt-del-yes':S.notes=S.notes.filter(n=>n.id!==id);ntAsk=null;save();render();toast(['Nota apagada']);break;
  }
});
document.addEventListener('submit',function(e){if(e.target.id==='form-note')saveNote();});
document.addEventListener('input',function(e){if(e.target.id==='nt-text')ntCount();});
document.addEventListener('change',function(e){
  if(e.target.id!=='nt-book')return;
  const b=S.books.find(x=>x.id===e.target.value),p=$('#nt-page');
  if(b&&p&&!p.value&&b.page>0)p.value=b.page;
});
