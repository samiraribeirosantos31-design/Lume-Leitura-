function week(){
  const a=[];
  for(let i=6;i>=0;i--){const d=addDays(new Date(),-i);a.push({d:d,min:minutesOn(dkey(d)),today:i===0});}
  return a;
}
function eyebrow(){
  if(tab==='today')return new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
  if(tab==='books'){const n=S.books.length,d=S.books.filter(b=>b.done).length;return n+' '+pl(n,'livro','livros')+' · '+d+' '+pl(d,'concluído','concluídos');}
  const a=achs();return a.filter(x=>x.ok).length+' de '+a.length+' conquistas';
}
function demoBanner(){
  if(!S.demo)return '';
  if(ask==='clear')return '<div class="demo"><p>Apagar os livros e leituras de exemplo e começar do zero?</p><div class="row"><button class="btn btn-danger" data-act="wipe-yes">Apagar exemplos</button><button class="btn btn-ghost" data-act="ask-no">Cancelar</button></div></div>';
  return '<div class="demo"><p>Você está vendo dados de exemplo. Registre leituras para testar e apague tudo quando quiser.</p><button class="btn btn-ghost" data-act="ask-clear">Começar do zero</button></div>';
}
function viewToday(){
  const mins=minutesOn(today()),pts=points(),st=stageOf(pts),sk=streak(),met=mins>=S.goal;
  const mood=met?'happy':(mins===0?'sleepy':'normal');
  let msg;
  if(st===0&&pts===0)msg='Adicione um livro e registre uma leitura para chocar o ovo.';
  else if(st===0)msg='O ovo está rachando. Continue lendo.';
  else if(met)msg=esc(S.petName)+' está radiante com a meta de hoje.';
  else if(mins>0)msg='Faltam '+(S.goal-mins)+' min para a meta de hoje.';
  else if(sk>0)msg='Leia hoje para manter a sequência de '+sk+' '+pl(sk,'dia','dias')+'.';
  else msg='Seu mascote está dormindo. Leia alguns minutos para acordá-lo.';
  const frac=st<4?(pts-CUTS[st])/(CUTS[st+1]-CUTS[st]):1;
  const xpl=st<4?nf(pts)+' / '+nf(CUTS[st+1])+' pts · próximo: '+STAGES[st+1]:nf(pts)+' pts · estágio máximo';
  const C=2*Math.PI*50,dash=C*Math.min(1,mins/S.goal);
  const w=week(),scale=Math.max(S.goal,...w.map(x=>x.min),1);
  const cols=w.map(x=>{
    const h=x.min?Math.max(3,Math.round(x.min/scale*100)):3;
    return '<div class="col"><span class="v num">'+(x.min||'')+'</span><div class="b'+(x.min>=S.goal?' ok':'')+'" style="height:'+h+'px"></div></div>';
  }).join('');
  const days=w.map(x=>'<span class="'+(x.today?'t':'')+'">'+(x.today?'hoje':x.d.toLocaleDateString('pt-BR',{weekday:'short'}).replace('.',''))+'</span>').join('');
  return demoBanner()
   +'<section class="pet-card"><div class="pet">'+pet(st,mood)+'</div><div><p class="eyebrow">Estágio '+(st+1)+' de 5</p>'
   +'<h2>'+esc(S.petName)+' <span class="stage">'+STAGES[st]+'</span></h2><p class="mood">'+msg+'</p>'
   +'<div class="xp" role="img" aria-label="'+esc(xpl)+'"><i style="width:'+Math.round(frac*100)+'%"></i></div><p class="xp-l num">'+xpl+'</p></div></section>'
   +'<section class="card goal"><div class="ring-w"><svg viewBox="0 0 120 120" role="img" aria-label="'+mins+' de '+S.goal+' minutos hoje">'
   +'<circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface-2)" stroke-width="12"/>'
   +'<circle cx="60" cy="60" r="50" fill="none" stroke="'+(met?'var(--accent)':'var(--pet)')+'" stroke-width="12" stroke-linecap="round" stroke-dasharray="'+dash.toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 60 60)"/></svg>'
   +'<div class="ring-t"><b class="num">'+mins+'</b><span>de '+S.goal+' min</span></div></div>'
   +'<div class="stats"><div class="stat"><span class="ic">'+ic('i-flame',1)+'</span><div><b class="num">'+sk+'</b><span class="l">'+pl(sk,'dia seguido','dias seguidos')+'</span></div></div>'
   +'<div class="stat"><span class="ic">'+ic('i-star',1)+'</span><div><b class="num">'+nf(pts)+'</b><span class="l">pontos</span></div></div></div></section>'
   +'<button class="btn btn-primary btn-block" data-act="log">'+ic('i-plus')+' Registrar leitura</button>'
   +'<section class="card"><div class="chart-h"><h2>Últimos 7 dias</h2><span class="muted">linha tracejada: meta de '+S.goal+' min</span></div>'
   +'<div class="plot">'+cols+'<div class="goal-line" style="bottom:'+Math.round(S.goal/scale*100)+'px"></div></div><div class="days">'+days+'</div></section>';
}
function bookCard(b){
  const pct=Math.round(b.page/b.total*100);
  const pill=b.done?'<span class="pill">Concluído</span>':(b.page===0?'<span class="pill off">Não iniciado</span>':'');
  const actions=ask==='rm:'+b.id
    ?'<div class="confirm"><p>Remover este livro? As leituras já registradas continuam valendo pontos.</p><div class="row"><button class="btn btn-danger" data-act="rm-yes" data-id="'+b.id+'">Remover</button><button class="btn btn-ghost" data-act="ask-no">Cancelar</button></div></div>'
    :'<div class="row">'+(b.done?'':'<button class="btn btn-soft" data-act="log" data-id="'+b.id+'">Registrar leitura</button>')+'<button class="btn btn-quiet" data-act="rm" data-id="'+b.id+'">Remover</button></div>';
  return '<article class="book"><div class="book-top"><div><h3>'+esc(b.title)+'</h3>'+(b.author?'<p class="muted">'+esc(b.author)+'</p>':'')+'</div>'+pill+'</div>'
   +'<div class="track" role="img" aria-label="'+pct+'% lido"><i style="width:'+pct+'%"></i></div>'
   +'<div class="book-meta num"><span>'+nf(b.page)+' de '+nf(b.total)+' páginas</span><span>'+pct+'%</span></div>'+actions+'</article>';
}
function viewBooks(){
  const add='<button class="btn btn-primary btn-block" data-act="add">'+ic('i-plus')+' Adicionar livro</button>';
  if(!S.books.length)return add+'<section class="card empty"><h2>Sua estante está vazia</h2><p class="muted">Adicione o livro que você está lendo para registrar páginas e minutos.</p></section>';
  const open=S.books.filter(b=>!b.done),done=S.books.filter(b=>b.done);
  let o=add;
  if(open.length)o+='<h2 class="sec">Lendo</h2><section class="card shelf">'+open.map(bookCard).join('')+'</section>';
  if(done.length)o+='<h2 class="sec">Concluídos</h2><section class="card shelf">'+done.map(bookCard).join('')+'</section>';
  return o;
}
function viewAch(){
  return '<ul class="ach-grid">'+achs().map(a=>
    '<li class="ach'+(a.ok?' on':'')+'"><span class="ach-ic">'+ic(a.icon,a.icon==='i-flame')+'</span><h3>'+esc(a.name)+'</h3><p>'+esc(a.desc)+'</p>'
    +'<div class="track" role="img" aria-label="'+a.cur+' de '+a.t+'"><i style="width:'+Math.round(a.cur/a.t*100)+'%"></i></div>'
    +'<span class="n num">'+(a.ok?'Conquistada':nf(a.cur)+' / '+nf(a.t))+'</span></li>').join('')+'</ul>';
}
function render(){
  $$('[data-tab]').forEach(b=>{const on=b.dataset.tab===tab;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));});
  $('#title').textContent={today:'Hoje',books:'Livros',ach:'Conquistas'}[tab];
  $('#eyebrow').textContent=eyebrow();
  $('#view').innerHTML=tab==='today'?viewToday():tab==='books'?viewBooks():viewAch();
    }
