S.timer=S.timer||null;
if(!Array.isArray(S.notes)){
  S.notes=[];
  if(S.demo&&S.books.find(function(b){return b.id==='b1';})){
    S.notes.push({id:uid(),bookId:'b1',page:48,date:dkey(addDays(new Date(),-3)),demo:true,text:'Capitu aparece pela primeira vez como vizinha. Reparar nos olhos de ressaca.'});
    S.notes.push({id:uid(),bookId:'b1',page:97,date:dkey(addDays(new Date(),-1)),demo:true,type:'destaque',col:'y',text:'Bentinho tem ciúmes de tudo. Será que ele é um narrador confiável?'});
    S.notes.push({id:uid(),bookId:null,page:null,date:today(),demo:true,text:'Ler 20 minutos antes de dormir funciona melhor do que de manhã.'});
  }
}
S.notes.forEach(function(n){if(!n.type)n.type='nota';});
save();

let ntFilter='all', ntType='all', ntAsk=null, ntEdit=null, ntKind='nota', ntCol='y';
const NT_MAX=2000;
const HL={y:'#FFD84D',g:'#8FDB9B',b:'#8EC5FF',p:'#F7A8D0'};
const HLN={y:'Amarelo',g:'Verde',b:'Azul',p:'Rosa'};
const KIND={nota:'Nota',destaque:'Destaque',marcador:'Marcador'};
const dshort=k=>new Date(k+'T12:00:00').toLocaleDateString('pt-BR',{day:'numeric',month:'short'}).replace('.','');
const bookTitle=id=>{const b=S.books.find(x=>x.id===id);return b?b.title:'Livro removido';};
const cut=(s,n)=>s.length>n?s.slice(0,n-1)+'…':s;
const TABS={
  today:['Hoje',()=>viewToday()],
  books:['Livros',()=>viewBooks()],
  notes:['Notas',()=>viewNotes()],
  ach:['Conquistas',()=>viewAch()]
};

function viewNotes(){
  const add='<button class="btn btn-primary btn-block" data-act="nt-new">'+ic('i-plus')+' Nova anotação</button>';
  if(!S.notes.length)return add+'<section class="card empty"><h2>Nada por aqui ainda</h2><p class="muted">Faça notas, destaque trechos e marque páginas importantes de cada livro. Também dá para criar anotações gerais, sem livro.</p></section>';
  const ids=[];
  S.notes.forEach(n=>{const k=n.bookId||'_gen';if(ids.indexOf(k)<0)ids.push(k);});
  if(ntFilter!=='all'&&ntFilter!=='_gen'){
    if(!S.books.find(b=>b.id===ntFilter))ntFilter='all';
    else if(ids.indexOf(ntFilter)<0)ids.push(ntFilter);
  }
  if(ntFilter==='_gen'&&ids.indexOf('_gen')<0)ntFilter='all';
  const chip=(act,v,label,on)=>'<button type="button" class="chip" data-act="'+act+'" data-v="'+v+'" aria-pressed="'+on+'">'+esc(label)+'</button>';
  const cnt=t=>S.notes.filter(n=>n.type===t).length;
  let types=chip('nt-type','all','Tudo',ntType==='all');
  Object.keys(KIND).forEach(t=>{types+=chip('nt-type',t,KIND[t]+'s ('+cnt(t)+')',ntType===t);});
  let chips=chip('nt-filter','all','Todos os livros',ntFilter==='all');
  ids.forEach(k=>{
    const c=S.notes.filter(n=>(n.bookId||'_gen')===k).length;
    chips+=chip('nt-filter',k,(k==='_gen'?'Gerais':cut(bookTitle(k),22))+' ('+c+')',ntFilter===k);
  });
  const list=S.notes.map((n,i)=>({n:n,i:i}))
    .filter(x=>(ntFilter==='all'||(ntFilter==='_gen'?!x.n.bookId:x.n.bookId===ntFilter))&&(ntType==='all'||x.n.type===ntType))
    .sort((a,b)=>a.n.date<b.n.date?1:a.n.date>b.n.date?-1:b.i-a.i);
  let html=add+'<div class="fchips">'+types+'</div><div class="fchips">'+chips+'</div>';
  if(!list.length)return html+'<section class="card empty"><h2>Nada neste filtro</h2><p class="muted">Toque em Nova anotação para registrar algo aqui.</p></section>';
  html+='<div class="notes-list">'+list.map(x=>{
    const n=x.n;
    const acts='<div class="row"><button class="btn btn-soft" data-act="nt-edit" data-id="'+n.id+'">Editar</button><button class="btn btn-quiet" data-act="nt-del" data-id="'+n.id+'">Apagar</button></div>';
    const hl=n.type==='destaque'?' style="--hl:'+HL[n.col||'y']+'"':'';
    return '<article class="note k-'+n.type+'"'+hl+'><div class="note-top"><span class="note-bk">'+esc(n.bookId?bookTitle(n.bookId):'Geral')+'</span>'
      +'<span class="note-meta num">'+(n.page?'pág. '+n.page+' · ':'')+dshort(n.date)+'</span></div>'
      +'<p class="nk">'+(n.type==='marcador'?ic('i-flag')+' ':'')+KIND[n.type]+'</p>'
      +(n.text?'<p class="note-tx">'+esc(n.text)+'</p>':'')+acts+'</article>';
  }).join('')+'</div>';
  return html;
}

function openNote(id,presetBook){
  const n=id?S.notes.find(x=>x.id===id):null;
  ntEdit=n?n.id:null;ntKind=n?n.type:'nota';ntCol=n&&n.col||'y';
  const sel=n?n.bookId:(presetBook||null);
  const pb=sel?S.books.find(b=>b.id===sel):null;
  const pg=n?(n.page||''):(pb&&pb.page>0?pb.page:'');
  openSheet('<h2 id="sh-t">'+(n?'Editar':'Nova anotação')+'</h2><form id="form-note" novalidate>'
   +'<label>Tipo</label><div class="chips">'+Object.keys(KIND).map(t=>'<button type="button" class="chip" data-act="nt-kind" data-v="'+t+'" aria-pressed="'+(t===ntKind)+'">'+KIND[t]+'</button>').join('')+'</div>'
   +'<div id="nt-colors"><label>Cor do destaque</label><div class="chips">'+Object.keys(HL).map(c=>'<button type="button" class="chip hlc" data-act="nt-col" data-v="'+c+'" aria-pressed="'+(c===ntCol)+'" style="--hl:'+HL[c]+'">'+HLN[c]+'</button>').join('')+'</div></div>'
   +'<label for="nt-book">Livro</label><select id="nt-book"><option value="">Geral (sem livro)</option>'
   +S.books.map(b=>'<option value="'+b.id+'"'+(b.id===sel?' selected':'')+'>'+esc(b.title)+'</option>').join('')+'</select>'
   +'<label for="nt-page">Página <span id="nt-preq"></span></label><input id="nt-page" type="number" inputmode="numeric" min="0" max="5000" value="'+pg+'">'
   +'<label for="nt-text" id="nt-tl">Anotação</label><textarea id="nt-text" rows="5" maxlength="'+NT_MAX+'" placeholder="Trecho, ideia, dúvida ou observação...">'+esc(n?n.text:'')+'</textarea>'
   +'<p class="hint num" id="nt-count"></p><p class="err" id="nt-err" role="alert"></p>'
   +'<div class="row"><button class="btn btn-primary" type="submit">'+(n?'Atualizar':'Salvar')+'</button><button class="btn btn-ghost" type="button" data-act="close">Cancelar</button></div></form>','nt-text');
  ntSync();ntCount();
}
function ntSync(){
  $$('[data-act=nt-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===ntKind)));
  $$('[data-act=nt-col]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===ntCol)));
  const c=$('#nt-colors');if(c)c.hidden=ntKind!=='destaque';
  const l=$('#nt-tl'),r=$('#nt-preq');
  if(l)l.textContent=ntKind==='destaque'?'Trecho destacado':ntKind==='marcador'?'Observação (opcional)':'Anotação';
  if(r)r.textContent=ntKind==='marcador'?'(obrigatória)':'(opcional)';
}
function ntCount(){const t=$('#nt-text'),c=$('#nt-count');if(t&&c)c.textContent=t.value.length+' de '+NT_MAX+' caracteres';}
function ntFail(m){const e=$('#nt-err');if(e)e.textContent=m;}
function saveNote(){
  const text=$('#nt-text').value.trim(),bid=$('#nt-book').value||null,pg=parseInt($('#nt-page').value,10);
  const page=pg>0?pg:null;
  if(ntKind==='marcador'){if(!page)return ntFail('Informe a página do marcador.');}
  else if(!text)return ntFail(ntKind==='destaque'?'Escreva o trecho destacado.':'Escreva a anotação antes de salvar.');
  if(ntEdit){
    const n=S.notes.find(x=>x.id===ntEdit);
    if(n){n.text=text;n.bookId=bid;n.page=page;n.type=ntKind;if(ntKind==='destaque')n.col=ntCol;delete n.demo;}
  }else{
    const n={id:uid(),bookId:bid,page:page,date:today(),text:text,type:ntKind};
    if(ntKind==='destaque')n.col=ntCol;
    S.notes.push(n);
  }
  ntFilter=bid||'_gen';ntType='all';ntEdit=null;ntAsk=null;
  save();closeSheet();tab='notes';render();toast([KIND[ntKind]+' salvo']);
}

const _eyebrow=eyebrow;
eyebrow=function(){
  if(tab==='notes'){const n=S.notes.length;return n+' '+pl(n,'item','itens');}
  return _eyebrow();
};
const _bookCard=bookCard;
bookCard=function(b){
  const c=S.notes.filter(n=>n.bookId===b.id).length;
  const btn='<button class="btn btn-ghost" data-act="nt-open" data-id="'+b.id+'">Notas'+(c?' ('+c+')':'')+'</button>';
  return _bookCard(b).replace('<button class="btn btn-quiet"',btn+'<button class="btn btn-quiet"');
};
render=function(){
  $$('[data-tab]').forEach(b=>{const on=b.dataset.tab===tab;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));});
  const t=TABS[tab]||TABS.today;
  $('#title').textContent=t[0];
  $('#eyebrow').textContent=eyebrow();
  $('#view').innerHTML=t[1]();
};

document.addEventListener('click',function(e){
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act,id=a.dataset.id;
  switch(act){
    case 'nt-new':openNote(null,ntFilter!=='all'&&ntFilter!=='_gen'?ntFilter:null);break;
    case 'nt-edit':openNote(id);break;
    case 'nt-open':ntFilter=id;ntType='all';ntAsk=null;tab='notes';render();window.scrollTo(0,0);break;
    case 'nt-filter':ntFilter=a.dataset.v;ntAsk=null;render();break;
    case 'nt-type':ntType=a.dataset.v;ntAsk=null;render();break;
    case 'nt-kind':ntKind=a.dataset.v;ntSync();break;
    case 'nt-col':ntCol=a.dataset.v;ntSync();break;
    case 'nt-del':if(S.notes.some(n=>n.id===id))confirmAction('Apagar anotação?','Esta anotação será apagada do seu perfil.','nt-del-yes','Apagar anotação',id);break;
    case 'nt-no':ntAsk=null;render();break;
    case 'nt-del-yes':S.notes=S.notes.filter(n=>n.id!==id);ntAsk=null;save();closeSheet();render();toast(['Item apagado']);break;
  }
});
document.addEventListener('submit',function(e){if(e.target.id==='form-note')saveNote();});
document.addEventListener('input',function(e){if(e.target.id==='nt-text')ntCount();});
document.addEventListener('change',function(e){
  if(e.target.id!=='nt-book')return;
  const b=S.books.find(x=>x.id===e.target.value),p=$('#nt-page');
  if(b&&p&&!p.value&&b.page>0)p.value=b.page;
});
