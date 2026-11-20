/* Estantes: Lendo, Quero ler e Concluídos, capas e amostra */
const _bookCard2=bookCard;
bookCard=function(b){
  let h=_bookCard2(b);
  const want=b.shelf==='want'&&!b.done;
  if(b.cover&&b.cover.indexOf('https://')===0)h=h.replace('<div class="book-top">','<div class="book-top"><img class="cv" src="'+esc(b.cover)+'" alt="" loading="lazy">');
  if(want)h=h.replace('Não iniciado','Quero ler');
  let extra='';
  if(want)extra+='<button class="btn btn-primary" data-act="bk-start" data-id="'+b.id+'">Começar a ler</button>';
  if(b.gid)extra+='<a class="btn btn-quiet" href="'+bkLink(b.gid)+'" target="_blank" rel="noopener">Amostra</a>';
  return extra?h.replace('<button class="btn btn-quiet"',extra+'<button class="btn btn-quiet"'):h;
};
viewBooks=function(){
  const top='<div class="row"><button class="btn btn-primary" data-act="add">'+ic('i-plus')+' Adicionar livro</button><button class="btn btn-ghost" data-act="go-search">'+ic('i-search')+' Buscar livros</button></div>';
  if(!S.books.length)return top+'<section class="card empty"><h2>Sua estante está vazia</h2><p class="muted">Busque um livro no Google Livros ou adicione o que você está lendo.</p></section>';
  const lendo=S.books.filter(b=>!b.done&&b.shelf!=='want'),quero=S.books.filter(b=>!b.done&&b.shelf==='want'),lidos=S.books.filter(b=>b.done);
  const sec=(t,l)=>l.length?'<h2 class="sec">'+t+' ('+l.length+')</h2><section class="card shelf">'+l.map(bookCard).join('')+'</section>':'';
  return top+sec('Lendo',lendo)+sec('Quero ler',quero)+sec('Concluídos',lidos);
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
  if(a.dataset.act==='bk-start'){
    const b=S.books.find(x=>x.id===a.dataset.id);
    if(b){b.shelf='read';save();render();toast(['Movido para Lendo: '+b.title]);}
  }
  if(a.dataset.act==='go-search'){tab='search';render();window.scrollTo(0,0);}
});
