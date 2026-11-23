/* Atalhos de toque, destaques do mascote e compartilhamento. */
let hold=null, heldElement=null;
function resetHold(){if(hold){clearTimeout(hold.timeout);hold=null;}}
document.addEventListener('pointerdown',e=>{
  const target=e.target.closest('[data-hold]');
  if(!target||e.button!==0||e.isPrimary===false)return;
  heldElement=null;resetHold();
  hold={x:e.clientX,y:e.clientY,pointer:e.pointerId,timeout:setTimeout(()=>{
    heldElement=target;hold=null;
    const b=S.books.find(item=>item.id===target.dataset.id);if(b)shelfMenu(b);
  },550)};
});
document.addEventListener('pointermove',e=>{
  if(hold?.pointer===e.pointerId&&Math.hypot(e.clientX-hold.x,e.clientY-hold.y)>12)resetHold();
});
for(const event of ['pointerup','pointercancel','scroll'])document.addEventListener(event,resetHold,true);
document.addEventListener('contextmenu',e=>{if(e.target.closest('[data-hold]'))e.preventDefault();});
document.addEventListener('click',e=>{
  const target=e.target.closest?.('[data-hold]');
  if(target&&target===heldElement){heldElement=null;e.preventDefault();e.stopImmediatePropagation();}
},true);

const LUME_URL='https://samiraribeirosantos31-design.github.io/Lume-Leitura-/';
const SHARE_LINE='Organize sua estante e acompanhe suas leituras no Lume Leitura.';
const QUOTE_LIMIT=180;
const knownQuotes=[
  {id:'dom-casmurro-ressaca',title:'Dom Casmurro',author:'Machado de Assis',text:'Olhos de ressaca? Vá, de ressaca.'},
  {id:'dom-casmurro-retorica',title:'Dom Casmurro',author:'Machado de Assis',text:'Retórica dos namorados, dá-me uma comparação exata e poética para dizer o que foram aqueles olhos de Capitu.'},
  {id:'quincas-batatas',title:'Quincas Borba',author:'Machado de Assis',text:'Ao vencedor, as batatas!'},
  {id:'bras-marcela',title:'Memórias Póstumas de Brás Cubas',author:'Machado de Assis',text:'Marcela amou-me durante quinze meses e onze contos de réis'}
];
const quoteNorm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
let readingQuote=null,lastQuote=null,voiceTimer=0,blinkTimer=0;
function bookQuotes(book){
  const title=quoteNorm(book.title),author=quoteNorm(book.author);
  return [
    ...S.notes.filter(n=>!n.demo&&n.type==='destaque'&&n.bookId===book.id&&n.text.trim().length<=QUOTE_LIMIT)
      .map(n=>({id:n.id,text:n.text.trim(),origin:'Trecho destacado',bookId:book.id})).filter(q=>q.text),
    ...knownQuotes.filter(q=>title===quoteNorm(q.title)&&(!author||author.includes(quoteNorm(q.author))))
      .map(q=>({...q,origin:'Clássico em domínio público',bookId:book.id}))
  ];
}
function queueMascotBlink(){
  clearTimeout(blinkTimer);
  const image=$('.pet-touch');
  if(tab!=='today'||!image||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  blinkTimer=setTimeout(()=>{
    const j=readingJourney(),stage=journeyStage(j);
    if(image.isConnected&&tab==='today'&&!document.hidden&&!$('.sheet')&&stage>0){
      const mood=journeyMood(j,minutesOn(today()));
      image.innerHTML=pet(stage,'blink');
      setTimeout(()=>{if(image.isConnected)image.innerHTML=pet(stage,mood);},160);
    }
    queueMascotBlink();
  },16000+Math.round(Math.random()*16000));
}
function openingReadingQuote(bookId){
  const book=S.books.find(b=>b.id===bookId);
  if(!book||S.petQuotes===false)return;
  const options=bookQuotes(book).filter(q=>q.id!==lastQuote);
  if(!options.length)return;
  if(readingQuote?.profile===stateKey&&(!readingQuote.shown||Date.now()-readingQuote.shown<18000))return;
  const item=options[Math.floor(Math.random()*options.length)];
  lastQuote=item.id;
  readingQuote={...item,profile:stateKey,due:Date.now()+22000,shown:0};
  scheduleMascotVoice();
}
function activeMascotQuote(now){
  const q=readingQuote;
  if(S.petQuotes===false||q?.profile!==stateKey||now<q.due||!S.books.some(b=>b.id===q.bookId))return null;
  if(!q.shown&&!document.hidden&&!$('.sheet'))q.shown=now;
  return q.shown&&now<q.shown+16000?q:null;
}
function mascotVoiceHtml(advice,mood){
  const q=activeMascotQuote(Date.now());
  const text=q?.text||advice;
  if(!text)return '';
  if(q){
    const brief=text.length>58?text.slice(0,56).trimEnd()+'…':text;
    return '<button class="pet-bubble pet-quote" type="button" data-act="quote-open" aria-label="Ler trecho completo">“'+esc(brief)+'”</button>';
  }
  return '<p class="pet-bubble pet-advice" data-mood="'+mood+'">'+esc(text)+'</p>';
}
function scheduleMascotVoice(){
  clearTimeout(voiceTimer);
  const q=readingQuote,root=$('#pet-voice');
  if(tab!=='today'||!root||q?.profile!==stateKey||S.petQuotes===false)return;
  const now=Date.now(),remains=q.shown?q.shown+16000-now:q.due-now;
  if(!S.books.some(b=>b.id===q.bookId)||q.shown&&remains<=0)return;
  voiceTimer=setTimeout(()=>{
    if(tab!=='today'||!root.isConnected||q!==readingQuote)return;
    const j=readingJourney(),mins=minutesOn(today()),mood=journeyMood(j,mins);
    root.innerHTML=mascotVoiceHtml(journeySuggestion(j,mins,mood),mood);
    scheduleMascotVoice();
  },Math.max(1500,remains));
}
function quoteDetails(){
  const b=S.books.find(x=>x.id===readingQuote?.bookId);
  if(!b||readingQuote?.profile!==stateKey)return;
  openSheet('<h2 id="sh-t">Trecho de leitura</h2><p>“'+esc(readingQuote.text)+'”</p><p class="hint">'+esc(b.title)+' · '+esc(readingQuote.origin)+'</p>'
    +'<div class="row"><button class="btn btn-primary" data-act="quote-share">Compartilhar trecho</button><button class="btn btn-ghost" data-act="close">Fechar</button></div>',null,'sheet-center');
}
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]');if(!a)return;
  if(a.dataset.act==='pet-touch')openMascot();
  if(a.dataset.act==='quote-open')quoteDetails();
  if(a.dataset.act==='quote-share'&&readingQuote?.profile===stateKey){
    const b=S.books.find(x=>x.id===readingQuote.bookId);if(b)shareReadingCard(b,readingQuote.text);
  }
  if(a.dataset.act==='quote-toggle'){
    S.petQuotes=S.petQuotes===false;save();render();openSettings('reading');
  }
});
const interactiveRender=render;
render=function(){interactiveRender();trackTimer();scheduleMascotVoice();queueMascotBlink();};

function shareText(book,quote){
  const name=book.title+(book.author?' — '+book.author:'');
  const content=quote?'“'+quote+'”':String(book.desc||'').trim()||(book.total?book.total+' páginas':'');
  return [name,content,SHARE_LINE,LUME_URL].filter(Boolean).join('\n\n');
}
async function shareCover(book){
  const url=httpsOnly(book.cover);
  if(!url)return null;
  try{
    const db=await coverStore();
    if(db){
      const req=db.transaction('images').objectStore('images').get(url);
      const cached=await new Promise(resolve=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null);});
      if(cached)return await createImageBitmap(cached);
    }
    const response=await fetch(url,{signal:AbortSignal.timeout(3000)});
    if(response.ok){const blob=await response.blob();if(blob.size<=900000)return await createImageBitmap(blob);}
  }catch(e){}
  try{
    const host=new URL(url).hostname;
    const trusted=['books.google.com','books.googleusercontent.com','covers.openlibrary.org'];
    const http=window.Capacitor?.Plugins?.CapacitorHttp;
    if(!http||!trusted.includes(host))return null;
    const response=await http.get({url,responseType:'arraybuffer',connectTimeout:3000,readTimeout:3000});
    if(response.status!==200||typeof response.data!=='string'||response.data.length>1200000)return null;
    return createImageBitmap(new Blob([Uint8Array.from(atob(response.data),c=>c.charCodeAt(0))]));
  }catch(e){return null;}
}
function printLines(ctx,text,x,y,width,lineHeight,max){
  const pending=String(text||'').trim().split(/\s+/);
  const lines=[];let line='';
  for(const word of pending){
    const next=line?line+' '+word:word;
    if(line&&ctx.measureText(next).width>width){lines.push(line);line=word;}
    else line=next;
  }
  if(line)lines.push(line);
  lines.slice(0,max).forEach((value,i)=>{
    let end=value;
    if(i===max-1&&lines.length>max)end+='…';
    while(ctx.measureText(end).width>width&&end.length>2)end=end.slice(0,-2)+'…';
    ctx.fillText(end,x,y+i*lineHeight);
  });
  return y+Math.min(max,lines.length)*lineHeight;
}
async function shareImage(book,quote){
  const canvas=document.createElement('canvas');canvas.width=840;canvas.height=840;
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  ctx.fillStyle='#eee3fa';ctx.fillRect(0,0,840,840);
  ctx.fillStyle='#2e2143';ctx.font='700 28px sans-serif';ctx.fillText('LUME LEITURA',48,65);
  const cover=await shareCover(book);
  let x=48,w=744;
  if(cover){
    const scale=Math.min(230/cover.width,345/cover.height),width=cover.width*scale;
    ctx.drawImage(cover,48+(230-width)/2,120,width,cover.height*scale);cover.close?.();x=310;w=482;
  }
  ctx.font='700 42px sans-serif';
  const next=printLines(ctx,book.title,x,150,w,50,4);
  ctx.font='26px sans-serif';ctx.fillStyle='#4c3c60';
  const meta=printLines(ctx,book.author,x,next+14,w,34,2);
  ctx.font='30px sans-serif';ctx.fillStyle='#2e2143';
  printLines(ctx,quote?'“'+quote+'”':book.desc||(book.total?book.total+' páginas':''),x,meta+42,w,39,Math.max(2,Math.floor((640-meta)/39)));
  ctx.fillStyle='#5b3980';ctx.fillRect(0,680,840,160);
  ctx.fillStyle='#fff';ctx.font='700 29px sans-serif';
  printLines(ctx,SHARE_LINE,48,738,744,36,2);
  ctx.font='22px sans-serif';ctx.fillText('Baixe o app pelo link da mensagem.',48,805);
  return canvas.toDataURL('image/jpeg',0.86).split(',')[1];
}
let sharingCard=false;
async function shareReadingCard(book,quote=''){
  if(sharingCard)return;
  sharingCard=true;
  const text=shareText(book,quote),plugins=window.Capacitor?.Plugins,share=plugins?.Share;
  try{
    if(share){
      let files;
      try{
        const data=await shareImage(book,quote);
        if(data&&plugins.Filesystem){
          const saved=await plugins.Filesystem.writeFile({path:'lume-compartilhar-'+Date.now()+'.jpg',data,directory:'CACHE'});
          files=[saved.uri];
        }
      }catch(e){}
      await share.share({title:book.title,text,files,dialogTitle:'Compartilhar do Lume Leitura'});
    }else if(navigator.share)await navigator.share({title:book.title,text});
    else if(navigator.clipboard){await navigator.clipboard.writeText(text);toast(['Mensagem copiada']);}
    else openSheet('<h2 id="sh-t">Copiar mensagem</h2><textarea readonly aria-label="Mensagem">'+esc(text)+'</textarea><button class="btn btn-ghost" data-act="close">Fechar</button>');
  }catch(e){
    const message=String(e?.message||'').toLowerCase();
    if(e?.name!=='AbortError'&&!/cancel/.test(message))toast(['Não foi possível compartilhar agora.']);
  }finally{sharingCard=false;}
}
