/* Busca de livros (Google Livros) */
const SQ={q:'',lang:'',loading:false,err:'',res:null,pend:null};
let searchGeneration=0, searchDelay;
const shortDescription=(text,limit=155)=>text.length>limit?text.slice(0,limit-1).trimEnd()+'…':text;
const SUG=['Machado de Assis','romance','ficção científica','autoajuda','Harry Potter'];
TABS.search=['Buscar',()=>viewSearch()];
const strip=h=>String(h||'').replace(/<[^>]*>/g,' ').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const httpsOnly=u=>{u=String(u||'').replace(/^http:/,'https:').replace('&edge=curl','');return u.indexOf('https://')===0?u:'';};
const bkLink=gid=>'https://books.google.com/books?id='+encodeURIComponent(gid)+'&hl=pt-BR&printsec=frontcover';
function norm(it){
  const v=it.volumeInfo||{},im=v.imageLinks||{};
  return {gid:it.id,title:v.title||'Sem título',author:(v.authors||[]).join(', '),pages:Number.isSafeInteger(v.pageCount)&&v.pageCount>0?v.pageCount:0,
    cover:httpsOnly(im.thumbnail||im.smallThumbnail),desc:strip(v.description),year:String(v.publishedDate||'').slice(0,4),
    cats:(v.categories||[]).join(', '),rating:Number.isFinite(v.averageRating)?v.averageRating:0};
}
const inShelf=gid=>S.books.find(b=>b.gid===gid);
async function doSearch(q){
  clearTimeout(searchDelay);
  q=String(q||'').trim();if(q.length<2)return;
  const generation=++searchGeneration;
  SQ.q=q;SQ.loading=true;SQ.err='';paintSearchResults();
  try{
    const url='https://www.googleapis.com/books/v1/volumes?q='+encodeURIComponent(q)+'&printType=books&maxResults=20'+(SQ.lang?'&langRestrict='+SQ.lang:'');
    const key=window.LUME_GOOGLE_BOOKS_KEY;
    const r=await fetch(url+(key?'&key='+encodeURIComponent(key):''));
    if(!r.ok)throw new Error('http');
    const j=await r.json();if(generation!==searchGeneration)return;
    SQ.res=(j.items||[]).filter(item=>item.id).map(norm);
  }catch(e){if(generation!==searchGeneration)return;SQ.res=null;SQ.err='Não foi possível buscar agora. Verifique a internet e tente de novo.';}
  SQ.loading=false;paintSearchResults();
}
function coverImg(c,cls){return c?'<img class="'+cls+'" src="'+esc(c)+'" alt="" loading="lazy">':'<span class="'+cls+' nocv">'+ic('i-book')+'</span>';}
function viewSearch(){
  let o='<form id="form-sq" class="sq" role="search" novalidate><input id="sq-q" type="search" enterkeyhint="search" autocomplete="off" placeholder="Título, autor ou assunto" value="'+esc(SQ.q)+'" aria-label="Buscar livros">'
   +'<button class="btn btn-primary" type="submit">'+ic('i-search')+' Buscar</button></form>'
   +'<div class="fchips"><button type="button" class="chip" data-act="sq-lang" data-v="" aria-pressed="'+(SQ.lang==='')+'">Todos os idiomas</button>'
   +'<button type="button" class="chip" data-act="sq-lang" data-v="pt" aria-pressed="'+(SQ.lang==='pt')+'">Português</button></div>';
  return o+'<div id="sq-results" aria-live="polite">'+searchResults()+'</div>';
}
function paintSearchResults(){
  const region=$('#sq-results');
  if(region)region.innerHTML=searchResults();
}
function searchResults(){
  if(SQ.loading)return '<section class="card empty"><p class="muted">Buscando livros...</p></section>';
  if(SQ.err)return '<section class="card empty"><p class="muted">'+esc(SQ.err)+'</p></section>';
  if(SQ.res===null)return '<section class="card empty"><h2>Encontre seu próximo livro</h2><p class="muted">Pesquise na biblioteca do Google Livros, veja capa e sinopse e adicione à sua estante.</p>'
    +'<div class="fchips">'+SUG.map(s=>'<button type="button" class="chip" data-act="sq-sug" data-v="'+esc(s)+'">'+esc(s)+'</button>').join('')+'</div></section>';
  if(!SQ.res.length)return '<section class="card empty"><h2>Nada encontrado</h2><p class="muted">Tente outro título, o nome do autor ou menos palavras.</p></section>';
  return '<div class="sr-list">'+SQ.res.map((b,i)=>{
    const on=inShelf(b.gid);
    return '<article class="sr">'+coverImg(b.cover,'cv')+'<div class="sr-b"><h3>'+esc(b.title)+'</h3>'
     +(b.author?'<p class="muted">'+esc(b.author)+'</p>':'')
     +'<p class="muted num">'+[b.pages?b.pages+' páginas':'',b.year].filter(Boolean).join(' · ')+'</p>'
     +(b.desc?'<p class="muted">'+esc(shortDescription(b.desc))+'</p>':'')
     +'<div class="row">'+(on?'<span class="pill">Na estante</span>'
       :'<button class="btn btn-soft" data-act="sq-add" data-i="'+i+'" data-s="want">Quero ler</button><button class="btn btn-ghost" data-act="sq-add" data-i="'+i+'" data-s="read">Lendo</button>')
     +'<button class="btn btn-quiet" data-act="sq-det" data-i="'+i+'">Detalhes</button></div></div></article>';
  }).join('')+'</div>';
}
function addBook(b,shelf,total){
  S.books.push({id:uid(),gid:b.gid,title:b.title,author:b.author,total:total,page:0,done:false,shelf:shelf,cover:b.cover,desc:shortDescription(b.desc,300),year:b.year});
  save();closeSheet();render();
  toast(['Adicionado: '+b.title,shelf==='want'?'Estante: Quero ler':'Estante: Lendo']);
}
function pickShelf(i,shelf){
  const b=SQ.res&&SQ.res[i];if(!b||inShelf(b.gid))return;
  if(b.pages>0)return addBook(b,shelf,b.pages);
  SQ.pend={book:b,s:shelf};
  openSheet('<h2 id="sh-t">Quantas páginas?</h2><p class="muted">O Google Livros não informou o total de páginas de “'+esc(b.title)+'”. Veja na edição que você tem.</p>'
   +'<form id="form-pg" novalidate><label for="pg-t">Total de páginas</label><input id="pg-t" type="number" inputmode="numeric" min="1" max="5000"><p class="err" id="pg-e" role="alert"></p>'
   +'<div class="row"><button class="btn btn-primary" type="submit">Adicionar</button><button class="btn btn-ghost" type="button" data-act="close">Cancelar</button></div></form>','pg-t');
}
function openDet(i){
  const b=SQ.res&&SQ.res[i];if(!b)return;
  const d=b.desc.length>700?b.desc.slice(0,699)+'…':b.desc;
  openSheet('<h2 id="sh-t">'+esc(b.title)+'</h2><div class="det">'+coverImg(b.cover,'cv big')+'<div><p class="muted">'+esc(b.author||'Autor não informado')+'</p>'
   +'<p class="muted num">'+[b.pages?b.pages+' páginas':'',b.year,b.rating?'★ '+b.rating:''].filter(Boolean).join(' · ')+'</p>'+(b.cats?'<p class="muted">'+esc(b.cats)+'</p>':'')+'</div></div>'
   +'<p class="det-d">'+(d?esc(d):'Sem sinopse disponível.')+'</p>'
   +'<div class="row">'+(inShelf(b.gid)?'<span class="pill">Na estante</span>':'<button class="btn btn-soft" data-act="sq-add" data-i="'+i+'" data-s="want">Quero ler</button><button class="btn btn-ghost" data-act="sq-add" data-i="'+i+'" data-s="read">Lendo</button>')
   +'<a class="btn btn-ghost" href="'+bkLink(b.gid)+'" target="_blank" rel="noopener">Ver amostra</a></div>'
   +'<div class="row"><button class="btn btn-quiet" type="button" data-act="close">Fechar</button></div>');
}
const _eyebrow2=eyebrow;
eyebrow=function(){return tab==='search'?'Google Livros':_eyebrow2();};
document.addEventListener('click',function(e){
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act,i=parseInt(a.dataset.i,10);
  switch(act){
    case 'sq-add':pickShelf(i,a.dataset.s);break;
    case 'sq-det':openDet(i);break;
    case 'sq-lang':SQ.lang=a.dataset.v;render();if(SQ.q)doSearch(SQ.q);break;
    case 'sq-sug':$('#sq-q').value=a.dataset.v;doSearch(a.dataset.v);break;
  }
});
document.addEventListener('submit',function(e){
  if(e.target.id==='form-sq')doSearch($('#sq-q').value);
  if(e.target.id==='form-pg'){
    const t=parseInt($('#pg-t').value,10);
    if(!(t>=1)||t>5000){$('#pg-e').textContent='Informe um número de 1 a 5.000.';return;}
    const b=SQ.pend?.book;if(b&&!inShelf(b.gid))addBook(b,SQ.pend.s,t);SQ.pend=null;
  }
});

document.addEventListener('input',function(e){
  if(e.target.id!=='sq-q')return;
  clearTimeout(searchDelay);
  const q=e.target.value.trim();
  ++searchGeneration;
  SQ.q=e.target.value;SQ.loading=false;SQ.err='';SQ.res=null;
  paintSearchResults();
  if(q.length<2)return;
  searchDelay=setTimeout(()=>doSearch(q),400);
});
