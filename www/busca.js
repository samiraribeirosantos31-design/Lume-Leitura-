/* Busca de livros (Google Livros) */
const SQ={q:'',lang:'',loading:false,err:'',res:null,pend:null};
let searchGeneration=0, searchDelay, searchRequest;
const catalogCache=new Map();
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
async function fetchCatalog(url,signal){
  const r=await fetch(url,{signal});
  if(!r.ok)throw new Error('Catálogo indisponível');
  return r.json();
}
function openLibraryBook(b){
  const work=String(b.key||'').match(/(?:^|\/)OL[0-9]+W$/)?.[0].replace('/','');
  if(!work||!b.title)return null;
  const subjects=Array.isArray(b.subject)?b.subject.slice(0,3).join(', '):'';
  return {gid:'ol:'+work,title:b.title,author:Array.isArray(b.author_name)?b.author_name.join(', '):'',
    pages:Number.isSafeInteger(b.number_of_pages_median)?b.number_of_pages_median:0,
    cover:Number.isSafeInteger(b.cover_i)?'https://covers.openlibrary.org/b/id/'+b.cover_i+'-M.jpg?default=false':'',
    desc:'',year:String(b.first_publish_year||''),cats:subjects,rating:0};
}
async function doSearch(q){
  clearTimeout(searchDelay);
  q=String(q||'').trim();if(q.length<2)return;
  searchRequest?.abort();
  const controller=new AbortController();
  searchRequest=controller;
  const generation=++searchGeneration,language=SQ.lang;
  const cacheKey=language+':'+q.toLocaleLowerCase('pt-BR');
  SQ.q=q;SQ.loading=true;SQ.err='';SQ.local=false;paintSearchResults();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try{
    if(catalogCache.has(cacheKey)){SQ.res=catalogCache.get(cacheKey);return;}
    if(navigator.onLine===false)throw new Error('offline');
    let books=null;
    const g='https://www.googleapis.com/books/v1/volumes?q='+encodeURIComponent(q)+'&printType=books&maxResults=20'+(language?'&langRestrict='+language:'');
    const key=window.LUME_GOOGLE_BOOKS_KEY;
    const google=new AbortController();
    const stopGoogle=()=>google.abort();
    controller.signal.addEventListener('abort',stopGoogle,{once:true});
    const googleTimer=setTimeout(stopGoogle,4200);
    try{
      const j=await fetchCatalog(g+(key?'&key='+encodeURIComponent(key):''),google.signal);
      books=(j.items||[]).filter(item=>item.id).map(norm);
    }catch(e){if(controller.signal.aborted)throw e;}
    finally{clearTimeout(googleTimer);controller.signal.removeEventListener('abort',stopGoogle);}
    if(!books?.length){
      const isbn=q.replace(/[^0-9xX]/g,'');
      const term=/^[0-9xX -]+$/.test(q)&&[10,13].includes(isbn.length)?'isbn:'+isbn:q;
      const ol='https://openlibrary.org/search.json?q='+encodeURIComponent(term+(language?' language:por':''))+
        '&fields=key,title,author_name,cover_i,first_publish_year,number_of_pages_median,subject&limit=12';
      const result=await fetchCatalog(ol,controller.signal);
      books=(result.docs||[]).map(openLibraryBook).filter(Boolean);
    }
    if(generation!==searchGeneration)return;
    if(catalogCache.size>=20)catalogCache.delete(catalogCache.keys().next().value);
    SQ.res=books;catalogCache.set(cacheKey,books);
  }catch(e){
    if(generation!==searchGeneration)return;
    const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const terms=normalize(q).split(/\s+/);
    SQ.res=S.books.filter(b=>terms.every(t=>normalize(b.title+' '+(b.author||'')).includes(t))).map(b=>({...b,localId:b.id,pages:b.total,desc:String(b.desc||'')}));
    SQ.local=true;
  }finally{
    clearTimeout(timeout);
    if(generation===searchGeneration){SQ.loading=false;paintSearchResults();}
  }
}
function catalogLink(b){
  return b.gid.startsWith('ol:')?'https://openlibrary.org/works/'+encodeURIComponent(b.gid.slice(3)):bkLink(b.gid);
}
async function catalogDescription(b){
  if(b.desc||!b.gid?.startsWith('ol:')||navigator.onLine===false)return b.desc||'';
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),3500);
  try{
    const work=await fetchCatalog(catalogLink(b)+'.json',controller.signal);
    b.desc=strip(typeof work.description==='string'?work.description:work.description?.value);
  }catch(e){}finally{clearTimeout(timeout);}
  return b.desc||'';
}
function coverImg(c,cls){return c?'<img class="'+cls+'" src="'+esc(c)+'" alt="" loading="lazy">':'<span class="'+cls+' nocv">'+ic('i-book')+'</span>';}
function viewSearch(){
  let o='<form id="form-sq" class="sq" role="search" novalidate><input id="sq-q" type="search" enterkeyhint="search" autocomplete="off" placeholder="Título, autor, assunto ou ISBN" value="'+esc(SQ.q)+'" aria-label="Buscar livros">'
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
  if(SQ.res===null)return '<section class="card empty"><h2>Encontre seu próximo livro</h2><p class="muted">Pesquise nos catálogos Google Livros e Open Library e salve o livro na sua estante.</p>'
    +'<div class="fchips">'+SUG.map(s=>'<button type="button" class="chip" data-act="sq-sug" data-v="'+esc(s)+'">'+esc(s)+'</button>').join('')+'</div></section>';
  if(SQ.local&&!SQ.res.length)return '<section class="card empty"><h2>Catálogos indisponíveis</h2><p class="muted">Nenhum livro salvo corresponde à busca. Você pode adicionar um livro manualmente.</p><button class="btn btn-primary" data-act="add">Adicionar livro</button></section>';
  if(!SQ.res.length)return '<section class="card empty"><h2>Nada encontrado</h2><p class="muted">Tente outro título, o nome do autor ou menos palavras.</p></section>';
  return (SQ.local?'<p class="muted">Resultados da sua estante · catálogos indisponíveis</p>':'')+'<div class="sr-list">'+SQ.res.map((b,i)=>{
    const on=b.localId||inShelf(b.gid);
    return '<article class="sr">'+coverImg(b.cover,'cv')+'<div class="sr-b"><h3>'+esc(b.title)+'</h3>'
     +(b.author?'<p class="muted">'+esc(b.author)+'</p>':'')
     +'<p class="muted num">'+[b.pages?b.pages+' páginas':'',b.year].filter(Boolean).join(' · ')+'</p>'
     +(b.desc?'<p class="muted">'+esc(shortDescription(b.desc))+'</p>':'')
     +'<div class="row">'+(on?'<span class="pill">Na estante</span>'
       :'<button class="btn btn-soft" data-act="sq-add" data-i="'+i+'" data-s="want">Quero ler</button><button class="btn btn-ghost" data-act="sq-add" data-i="'+i+'" data-s="read">Lendo</button>')
     +'<button class="btn btn-quiet" data-act="sq-det" data-i="'+i+'">Detalhes</button></div></div></article>';
  }).join('')+'</div>';
}
async function addBook(b,shelf,total){
  if(inShelf(b.gid))return;
  const profile=stateKey;
  S.books.push({id:uid(),gid:b.gid,title:b.title,author:b.author,total:total,page:0,done:false,shelf:shelf,cover:b.cover,desc:shortDescription(b.desc,300),year:b.year});
  save();closeSheet();render();
  toast(['Adicionado: '+b.title,shelf==='want'?'Estante: Quero ler':'Estante: Lendo']);
  const saved=inShelf(b.gid);
  const desc=await catalogDescription(b);
  if(stateKey===profile&&inShelf(b.gid)===saved&&desc&&!saved.desc){saved.desc=shortDescription(desc,700);save();}
  if(b.cover)rememberCover(b.cover);
}
function pickShelf(i,shelf){
  const b=SQ.res&&SQ.res[i];if(!b||inShelf(b.gid))return;
  if(b.pages>0)return addBook(b,shelf,b.pages);
  SQ.pend={book:b,s:shelf};
  openSheet('<h2 id="sh-t">Quantas páginas?</h2><p class="muted">O catálogo não informou o total de páginas de “'+esc(b.title)+'”. Veja na edição que você tem.</p>'
   +'<form id="form-pg" novalidate><label for="pg-t">Total de páginas</label><input id="pg-t" type="number" inputmode="numeric" min="1" max="5000"><p class="err" id="pg-e" role="alert"></p>'
   +'<div class="row"><button class="btn btn-primary" type="submit">Adicionar</button><button class="btn btn-ghost" type="button" data-act="close">Cancelar</button></div></form>','pg-t');
}
function openDet(i){
  const b=SQ.res&&SQ.res[i];if(!b)return;
  if(b.localId){const saved=S.books.find(x=>x.id===b.localId);if(saved)openShelfBook(saved);return;}
  const d=shortDescription(b.desc,700);
  openSheet('<h2 id="sh-t">'+esc(b.title)+'</h2><div class="det">'+coverImg(b.cover,'cv big')+'<div><p class="muted">'+esc(b.author||'Autor não informado')+'</p>'
   +'<p class="muted num">'+[b.pages?b.pages+' páginas':'',b.year,b.rating?'★ '+b.rating:''].filter(Boolean).join(' · ')+'</p>'+(b.cats?'<p class="muted">'+esc(b.cats)+'</p>':'')+'</div></div>'
   +'<p class="det-d" id="catalog-synopsis">'+(d?esc(d):'Sem sinopse disponível.')+'</p>'
   +'<div class="row">'+(inShelf(b.gid)?'<span class="pill">Na estante</span>':'<button class="btn btn-soft" data-act="sq-add" data-i="'+i+'" data-s="want">Quero ler</button><button class="btn btn-ghost" data-act="sq-add" data-i="'+i+'" data-s="read">Lendo</button>')
   +'<a class="btn btn-ghost" href="'+catalogLink(b)+'" target="_blank" rel="noopener">Ver no catálogo</a></div>'
   +'<div class="row"><button class="btn btn-quiet" type="button" data-act="close">Fechar</button></div>');
  const synopsis=$('#catalog-synopsis');
  if(synopsis&&!d)catalogDescription(b).then(desc=>{if(desc&&$('#catalog-synopsis')===synopsis)synopsis.textContent=shortDescription(desc,700);});
}
const _eyebrow2=eyebrow;
eyebrow=function(){return tab==='search'?'Catálogo de livros':_eyebrow2();};
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
  searchRequest?.abort();
  ++searchGeneration;
  SQ.q=e.target.value;SQ.loading=false;SQ.err='';SQ.res=null;
  paintSearchResults();
  if(q.length<2)return;
  searchDelay=setTimeout(()=>doSearch(q),750);
});
