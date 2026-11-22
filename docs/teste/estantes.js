/* Capas da estante e detalhes do acompanhamento de leitura. */
let shelfFilter='all';
const shelfLabel=b=>b.done?'Concluídos':b.shelf==='want'?'Quero ler':'Lendo';
let coverDB;
const localCovers=new Map();
function coverStore(){
  if(!window.indexedDB)return Promise.resolve(null);
  return coverDB||=(new Promise(resolve=>{
    const req=indexedDB.open('lume-capas',1);
    req.onupgradeneeded=()=>req.result.createObjectStore('images');
    req.onsuccess=()=>resolve(req.result);
    req.onerror=req.onblocked=()=>resolve(null);
  }));
}
async function rememberCover(url){
  const safe=httpsOnly(url);if(!safe||navigator.onLine===false)return;
  try{
    const db=await coverStore();if(!db)return;
    const response=await fetch(safe,{signal:AbortSignal.timeout(5000)});
    if(!response.ok)return;
    const blob=await response.blob();
    if(!/^image\/(?:png|jpeg|webp|gif|avif)$/.test(blob.type)||blob.size>350000)return;
    db.transaction('images','readwrite').objectStore('images').put(blob,safe);
  }catch(e){}
}
function shelfCover(b){
  const url=httpsOnly(b.cover);
  return '<span class="shelf-cover">'+ic('i-book')+(url?'<img alt="" data-shelf-cover="'+esc(url)+'" loading="lazy">':'')+'</span>';
}
async function showSavedCover(img){
  const url=img.dataset.shelfCover;
  if(localCovers.has(url)){img.src=localCovers.get(url);return;}
  try{
    const db=await coverStore();
    if(db){
      const req=db.transaction('images').objectStore('images').get(url);
      const blob=await new Promise(resolve=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null);});
      if(blob){
        if(!localCovers.has(url)){
          if(localCovers.size>=60){img.src=url;return;}
          localCovers.set(url,URL.createObjectURL(blob));
        }
        img.src=localCovers.get(url);return;
      }
    }
  }catch(e){}
  if(navigator.onLine!==false)img.src=url;
}
function paintShelfCovers(){
  $$('img[data-shelf-cover]:not([src])').forEach(img=>{
    img.addEventListener('error',()=>img.hidden=true,{once:true});showSavedCover(img);
  });
}
const _shelfRender=render;
render=function(){_shelfRender();if(tab==='books')paintShelfCovers();};
function openShelfBook(b){
  const pct=Math.min(100,Math.round(b.page/Math.max(1,b.total)*100));
  const summary=b.desc?esc(b.desc):'Resumo indisponível para este livro.';
  openSheet('<h2 id="sh-t">'+esc(b.title)+'</h2><div class="det">'+shelfCover(b)+'<div>'
    +'<p>'+esc(b.author||'Autor não informado')+'</p><p class="muted">'+[b.year,b.total+' páginas',shelfLabel(b)].filter(Boolean).map(esc).join(' · ')+'</p></div></div>'
    +'<p class="det-d">'+summary+'</p><progress class="shelf-progress" max="100" value="'+pct+'" aria-label="Progresso da leitura"></progress>'
    +'<p class="muted">'+b.page+' de '+b.total+' páginas · '+pct+'%</p><div class="row">'
    +(!b.done?'<button class="btn btn-primary" data-act="log" data-id="'+esc(b.id)+'">Registrar leitura</button>':'')
    +'<button class="btn btn-ghost" data-act="bk-menu" data-id="'+esc(b.id)+'">Mais opções</button>'
    +'<button class="btn btn-quiet" data-act="close">Fechar</button></div>');
  paintShelfCovers();
}
function shelfTile(b){
  const id=esc(b.id);
  return '<div class="shelf-entry"><button class="shelf-tile" data-act="bk-details" data-hold="book" data-id="'+id+'">'+shelfCover(b)
    +'<strong>'+esc(b.title)+'</strong><span>'+esc(b.author||shelfLabel(b))+'</span>'
    +'<small>'+b.page+' de '+b.total+' páginas</small></button>'
    +'<button class="shelf-menu" data-act="bk-menu" data-id="'+id+'" aria-label="Opções de '+esc(b.title)+'">⋯</button></div>';
}
function shelfMenu(b){
  const id=esc(b.id);
  openSheet('<h2 id="sh-t">'+esc(b.title)+'</h2><div class="shelf-action-list">'
    +(!b.done?'<button class="btn btn-primary" data-act="tm-quick" data-id="'+id+'">Iniciar leitura</button>':'')
    +'<button class="btn btn-soft" data-act="bk-move" data-id="'+id+'">Mover livro</button>'
    +'<button class="btn btn-soft" data-act="bk-share" data-id="'+id+'">Compartilhar livro</button>'
    +'<button class="btn btn-ghost" data-act="rm" data-id="'+id+'">Remover da estante</button>'
    +'<button class="btn btn-quiet" data-act="close">Fechar</button></div>',null,'sheet-center');
}
function shelfMove(b,target){
  if(target==='done'){
    if(!b.done)b.pageBeforeShelfCompletion=b.page;
    b.page=b.total;b.done=true;
    if(S.timer?.bookId===b.id)S.timer=null;
  }else{
    if(b.done){b.page=Math.min(b.total,Math.max(0,b.pageBeforeShelfCompletion||0));delete b.pageBeforeShelfCompletion;}
    b.done=false;b.shelf=target;
  }
  save();closeSheet();render();toast(['Movido para '+shelfLabel(b)]);
}
viewBooks=function(){
  const top='<div class="row"><button class="btn btn-primary" data-act="go-search">'+ic('i-search')+' Buscar livros</button><button class="btn btn-ghost" data-act="add">'+ic('i-plus')+' Adicionar livro</button></div>';
  if(!S.books.length)return top+'<section class="card empty"><h2>Sua estante está vazia</h2><p class="muted">Busque um livro no catálogo ou cadastre o que você está lendo.</p></section>';
  const labels=['Lendo','Quero ler','Concluídos'];
  const filters=['all',...labels].map(key=>'<button class="chip" aria-pressed="'+(key===shelfFilter)+'" data-act="bk-filter" data-v="'+key+'">'+(key==='all'?'Todos':key)+'</button>').join('');
  const sections=labels.filter(label=>shelfFilter==='all'||shelfFilter===label).map(label=>{
    const books=S.books.filter(b=>shelfLabel(b)===label);
    if(!books.length)return shelfFilter==='all'?'':'<p class="muted">Nenhum livro nesta seção.</p>';
    return '<section><h2 class="sec">'+label+' ('+books.length+')</h2><div class="shelf-grid">'+books.map(shelfTile).join('')+'</div></section>';
  }).join('');
  return top+'<div class="fchips">'+filters+'</div>'+sections;
};
const _submitLog2=submitLog;
submitLog=function(){
  const el=$('#f-book'),bid=el&&el.value,n=S.logs.length;
  _submitLog2();
  const b=S.books.find(x=>x.id===bid);
  if(S.logs.length>n&&b&&b.shelf==='want'){b.shelf='read';save();render();}
};
document.addEventListener('click',function(e){
  const a=e.target.closest('[data-act]');if(!a)return;
  const b=S.books.find(x=>x.id===a.dataset.id);
  if(a.dataset.act==='bk-details'&&b)openShelfBook(b);
  if(a.dataset.act==='bk-filter'){shelfFilter=a.dataset.v;render();}
  if(a.dataset.act==='bk-menu'&&b)shelfMenu(b);
  if(a.dataset.act==='bk-move'&&b){
    const id=esc(b.id);
    const options=[['read','Lendo'],['want','Quero ler'],['done','Concluídos']].filter(([,label])=>label!==shelfLabel(b));
    openSheet('<h2 id="sh-t">Mover para</h2><p>'+esc(b.title)+'</p><div class="shelf-action-list">'
      +options.map(([key,label])=>'<button class="btn btn-soft" data-act="bk-move-to" data-id="'+id+'" data-v="'+key+'">'+label+'</button>').join('')
      +'<button class="btn btn-quiet" data-act="close">Cancelar</button></div>',null,'sheet-center');
  }
  if(a.dataset.act==='bk-move-to'&&b&&['read','want','done'].includes(a.dataset.v))shelfMove(b,a.dataset.v);
  if(a.dataset.act==='bk-share'&&b)shareReadingCard(b);
  if(a.dataset.act==='go-search'){tab='search';render();window.scrollTo(0,0);}
});
