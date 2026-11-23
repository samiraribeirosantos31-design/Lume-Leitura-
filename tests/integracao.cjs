const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../www');
const files=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
function harness(options={}){
 const elements=new Map(),events={},storage=new Map(options.storage||[]),scheduled=[],opened=[];
 function element(){
  return {innerHTML:'',textContent:'',style:{},dataset:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},getAttribute(){},
   focus(){},select(){},remove(){},insertAdjacentHTML(){},appendChild(e){if(e.id)elements.set(e.id,e)},insertBefore(e){if(e.id)elements.set(e.id,e)}};
 }
 ['view','title','eyebrow','sheet-root','toast','wipe-zone','up-msg','reward-pop'].forEach(id=>elements.set(id,element()));
 const parent=element();elements.forEach(e=>e.parentNode=parent);
 const doc={hidden:false,activeElement:null,body:element(),head:element(),
  createElement:element,getElementById:id=>elements.get(id)||null,
  querySelector:s=>s.startsWith('#')?elements.get(s.slice(1))||null:null,querySelectorAll:()=>[],
  addEventListener:(e,f)=>(events[e]??=[]).push(f)};
 let callbacks={},calls=0;
 const notifications={checkPermissions:async()=>({display:options.permission||'granted'}),requestPermissions:async()=>({display:options.permission||'granted'}),createChannel:async()=>{},schedule:async n=>scheduled.push(...n.notifications),cancel:async()=>{},addListener:(event,cb)=>{const prior=callbacks[event];callbacks[event]=async e=>{if(prior)await prior(e);return cb(e);};}};
 const ctx={document:doc,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},console,Date,Math,JSON,Number,String,Array,Object,Promise,AbortController,
  setInterval(){},setTimeout:()=>1,clearTimeout(){},navigator:{onLine:!options.offline},location:{protocol:'http:'},
  addEventListener(){},scrollTo(){},open:u=>opened.push(u),
  fetch:async url=>{calls++;if(options.offline)throw Error('offline');
   if(url.includes('googleapis.com/books')&&options.googleUnavailable)return {ok:false,status:429};
   if(url.includes('openlibrary.org/search.json'))return {ok:true,json:async()=>({docs:[{key:'/works/OL123W',title:'O céu é violeta',author_name:['Autora'],cover_i:20,number_of_pages_median:120,first_publish_year:2021}]})};
   if(url.includes('openlibrary.org/works/OL123W.json'))return {ok:true,json:async()=>({description:{value:'Resumo da edição'}})};
   if(url.includes('googleapis.com/books'))return {ok:true,json:async()=>({items:[{id:'test-volume',volumeInfo:{title:'Livro de teste',pageCount:100,authors:['Autora'],imageLinks:{thumbnail:'https://example.org/capa.png'}}}]})};
   return {ok:true,json:async()=>options.release||{body:'LUME_BUILD_CODE=111 LUME_VERSION=1.1.1',assets:[{name:'app-debug.apk'}]}};}
 };
 ctx.window=ctx;
 if(options.native)ctx.Capacitor={isNativePlatform:()=>true,Plugins:{LocalNotifications:notifications,Browser:{open:async({url})=>opened.push(url)},ReadingTimer:options.readingTimer}};
 vm.createContext(ctx);
 files.forEach(f=>{
  vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
  if(f==='nuvem-config.js'&&options.config)ctx.NUVEM=options.config;
 });
 const evaluate=code=>vm.runInContext(code,ctx);
 const click=async (act,dataset={})=>{const a={dataset:{act,...dataset},setAttribute(){}};for(const f of events.click||[])await f({target:{closest:s=>s==='[data-act]'?a:null}});};
 return {evaluate,click,elements,storage,scheduled,opened,callbacks,calls:()=>calls};
}
async function settle(){for(let i=0;i<20;i++)await Promise.resolve();}
test('pacote completo carrega sem colisões; lilás inicial e apenas mascotes animais',async()=>{
 const h=harness();await settle();
 assert.equal(h.evaluate('temaAtual().id'),'lilas');
 assert.equal(h.evaluate('TEMAS.length'),17);
 assert.equal(h.evaluate("MASC.some(([id])=>id==='avatar')"),false);
 assert.equal(h.evaluate("petOf('avatar',2,'normal')===petOf('coruja',2,'normal')"),true);
 assert.equal(h.evaluate("S.demo||S.books.length>0||S.logs.length>0"),false);
 assert.match(h.evaluate('viewToday()'),/Semáforo de ritmo/);
 assert.ok(h.evaluate('TABS.search'));
 assert.equal(h.evaluate('nvOk()'),false);
});
test('Google Livros usa a API e normaliza resultados',async()=>{
 const h=harness();await h.evaluate("doSearch('Machado de Assis')");await settle();
 assert.equal(h.evaluate('SQ.res[0].title'),'Livro de teste');
 assert.equal(h.evaluate('SQ.res[0].pages'),100);
 h.evaluate("pickShelf(0,'want')");
 assert.equal(h.evaluate("S.books.find(b=>b.gid==='test-volume').shelf"),'want');
});
test('nova versão mostra aviso e notificação; toque abre só o download oficial',async()=>{
 const h=harness({native:true});const before=h.storage.get('lume-leitura-v1');await settle();
 assert.match(h.elements.get('lume-update').innerHTML,/1.1.1/);
 assert.equal(h.scheduled.filter(n=>n.id===1711).length,1);
 await h.callbacks.localNotificationActionPerformed({notification:{extra:{kind:'lume-update'}}});
 assert.equal(h.opened[0],'https://samiraribeirosantos31-design.github.io/Lume-Leitura-/');
 await h.click('up-check');await settle();
 assert.equal(h.scheduled.filter(n=>n.id===1711).length,1);
 assert.equal(h.storage.get('lume-leitura-v1'),before,'verificar versão não modifica livros');
});
test('sem permissão mantém aviso interno e não envia notificação Android',async()=>{
 const h=harness({native:true,permission:'denied'});await settle();
 assert.ok(h.elements.get('lume-update'));
 assert.equal(h.scheduled.filter(n=>n.id===1711).length,0);
});
test('versão atual e release sem APK não anunciam atualização',async()=>{
 for(const release of [{body:'LUME_BUILD_CODE=110 LUME_VERSION=1.1.0',assets:[{name:'app-debug.apk'}]},{body:'LUME_BUILD_CODE=999 LUME_VERSION=9.0.0',assets:[]}]){
  const h=harness({release});await settle();assert.equal(h.elements.has('lume-update'),false);
 }
});
test('offline preserva o aviso conhecido e os registros; consultas têm intervalo',async()=>{
 const data=JSON.stringify({latest:{code:112,name:'1.1.2'},checked:0});
 const h=harness({offline:true,storage:[['lume-atualizacao-v1',data]]});await settle();
 assert.match(h.elements.get('lume-update').innerHTML,/1.1.2/);
 const cached=harness({storage:[['lume-atualizacao-v1',JSON.stringify({latest:{code:112,name:'1.1.2'},checked:Date.now()})]]});await settle();
 assert.equal(cached.calls(),0);
});
test('dados da primeira versão continuam sendo carregados',()=>{
 const old={v:1,goal:20,petName:'Tinta',demo:false,seen:[],books:[{id:'b1',title:'Meu livro',total:100,page:5,done:false}],logs:[],notes:[{id:'n1',bookId:'b1',page:5,text:'Minha nota',date:'2026-11-20'}]};
 const h=harness({storage:[['lume-leitura-v1',JSON.stringify(old)]]});
 assert.equal(h.evaluate('S.books[0].title'),'Meu livro');
 assert.equal(h.evaluate('S.notes[0].text'),'Minha nota');
});

test('os marcos evoluem cedo e as conquistas obtidas são preservadas',()=>{
 const h=harness();
 assert.equal(h.evaluate('[0,15,60,160,350].map(stageOf).join()'),'0,1,2,3,4');
 assert.equal(h.evaluate("petOf('coruja',2,'normal')!==petOf('coruja',4,'normal')"),true);
 assert.equal(h.evaluate("S.seen=['s3'];achs().find(a=>a.id==='s3').ok"),true);
});
test('a aparência só é persistida ao salvar e migra o avatar antigo',async()=>{
 const old={v:1,goal:20,petName:'Luz',demo:false,seen:[],books:[],logs:[],mascote:'avatar'};
 const h=harness({storage:[['lume-leitura-v1',JSON.stringify(old)]]});
 assert.equal(h.evaluate('S.mascote'),'coruja');
 h.evaluate("lookDraft={tema:'menta',mascote:'coruja'}");
 assert.equal(h.evaluate('temaAtual().id'),'lilas');
 await h.click('look-save');
 assert.equal(JSON.parse(h.storage.get('lume-leitura-v1')).tema,'menta');
});
test('o progresso do visitante e da conta é isolado, inclusive com conflito de revisão',async()=>{
 const h=harness();
 h.evaluate(`S.petName='Local';save();
   FB={db:{collection:()=>({doc:()=>({get:async()=>({
     exists:true,data:()=>({rev:1,dados:JSON.stringify({...emptyState(),petName:'Conta'})})
   })})})}};
 `);
 await h.evaluate("trocarPerfil({uid:'abc'})");
 assert.equal(h.evaluate('S.petName'),'Conta');
 h.evaluate(`S.petName='Conta local';save();
  FB.db.runTransaction=async fn=>fn({get:async()=>({exists:true,data:()=>({rev:2})}),
    set:()=>{throw Error('tentou sobrescrever a nuvem');}});
 `);
 await h.evaluate('enviar()');
 assert.match(h.evaluate('syncMsg'),/versão diferente/);
 assert.equal(h.evaluate('perfil.pending'),true);
 await h.evaluate('trocarPerfil(null)');
 assert.equal(h.evaluate('S.petName'),'Local');
 assert.equal(JSON.parse(h.storage.get('lume-leitura-v1:uid:abc')).petName,'Conta local');
});

test('busca recorre à Open Library e persiste o resumo no livro selecionado',async()=>{
 const h=harness({googleUnavailable:true});
 await h.evaluate("doSearch('O céu é violeta')");
 assert.equal(h.evaluate('SQ.res[0].gid'),'ol:OL123W');
 await h.evaluate("pickShelf(0,'want')");
 assert.equal(h.evaluate('S.books[0].desc'),'Resumo da edição');
 assert.match(h.evaluate('viewBooks()'),/O céu é violeta/);
 assert.match(h.evaluate('viewBooks()'),/data-act="bk-details"/);
});
test('pesquisa offline encontra livros salvos e reconhece acentos',async()=>{
 const old={v:1,goal:20,petName:'Luz',demo:false,seen:[],books:[{id:'b1',title:'O céu é violeta',total:100,page:5}],logs:[],notes:[]};
 const h=harness({offline:true,storage:[['lume-leitura-v1',JSON.stringify(old)]]});
 await h.evaluate("doSearch('ceu violeta')");
 assert.equal(h.evaluate('SQ.res[0].localId'),'b1');
 assert.match(h.evaluate('searchResults()'),/Resultados da sua estante/);
 assert.doesNotMatch(h.evaluate('searchResults()'),/data-act="sq-add"/);
});
test('reabre a cópia do último perfil offline e marca as mudanças pendentes',()=>{
 const key='lume-leitura-v1',account=key+':uid:abc';
 const local={v:1,goal:20,petName:'Local',demo:false,seen:[],books:[],logs:[],notes:[]};
 const h=harness({offline:true,config:{apiKey:'test',projectId:'test',appId:'test'},storage:[
  [key,JSON.stringify(local)],[key+':active',account],[account,JSON.stringify({...local,petName:'Conta'})]
 ]});
 assert.equal(h.evaluate('S.petName'),'Conta');
 h.evaluate("S.petName='Alteração offline';save();");
 assert.equal(JSON.parse(h.storage.get(account)).petName,'Alteração offline');
 assert.equal(JSON.parse(h.storage.get(key)).petName,'Local');
 assert.equal(JSON.parse(h.storage.get(account+':sync')).pending,true);
});


test('duração separa horas de minutos e recusa campo maior que 59',()=>{
 const h=harness();
 h.elements.set('f-hours',{value:'1'});h.elements.set('f-min',{value:'25'});
 assert.equal(h.evaluate('formReadingMinutes()'),85);
 h.elements.get('f-min').value='60';
 assert.equal(Number.isNaN(h.evaluate('formReadingMinutes()')),true);
});
test('remoção usa confirmação central e preserva os registros de leitura',async()=>{
 const h=harness();
 h.evaluate("S.books=[{id:'b',title:'Meu livro',page:10,total:100}];S.logs=[{id:'l',bookId:'b',min:12}];");
 await h.click('rm',{id:'b'});
 assert.match(h.elements.get('sheet-root').innerHTML,/sheet-center/);
 assert.equal(h.evaluate('S.books.length'),1);
 await h.click('rm-yes',{id:'b'});
 assert.equal(h.evaluate('S.books.length'),0);
 assert.equal(h.evaluate('S.logs.length'),1);
});
test('mudar de estante preserva o histórico e o ponto de leitura original',()=>{
 const h=harness();
 h.evaluate("S.books=[{id:'b',title:'Meu livro',page:28,total:100}];shelfMove(S.books[0],'done');");
 assert.equal(h.evaluate('S.books[0].done'),true);
 assert.equal(h.evaluate('S.books[0].page'),100);
 h.evaluate("shelfMove(S.books[0],'read');");
 assert.equal(h.evaluate('S.books[0].page'),28);
 assert.equal(h.evaluate('S.logs.length'),0);
});
test('cronômetro central é único, modo noturno restaura brilho e a notificação reabre a sessão',async()=>{
 let state,openSession;
 const brightness=[];
 const plugin={
  publish:async({session})=>{state=session;},
  read:async()=>({session:state}),clear:async()=>{state=null;},
  setNightBrightness:async({enabled})=>brightness.push(enabled),
  addListener:async(event,handler)=>{if(event==='openSession')openSession=handler;},
  takeOpenSession:async()=>({})
 };
 const h=harness({native:true,readingTimer:plugin});
 h.evaluate("S.books=[{id:'b',title:'Meu livro',page:10,total:100}];startReadingTimer('b');");
 await settle();
 const sheet=h.elements.get('sheet-root');
 assert.equal(state.running,true);
 assert.match(sheet.innerHTML,/sheet-center reading-focus/);
 assert.equal((sheet.innerHTML.match(/role="timer"/g)||[]).length,1);
 assert.doesNotMatch(h.evaluate('viewToday()'),/role="timer"|Descartar/);
 h.elements.set('tm-focus-time',{});
 await h.click('tm-night');
 await settle();
 assert.deepEqual(brightness,[true]);
 assert.equal(h.evaluate('readingDim'),true);
 assert.equal(h.evaluate('temaAtual().id'),'lilas');
 await h.click('close');
 h.elements.delete('tm-focus-time');
 await settle();
 assert.deepEqual(brightness,[true,false]);
 assert.equal(h.evaluate('S.timer.running'),true);
 assert.equal(sheet.innerHTML,'');
 await openSession({id:'outro-perfil'});
 assert.equal(sheet.innerHTML,'');
 state={...state,running:false,fin:true,acc:61000,changedAt:state.changedAt+1000};
 await openSession({id:state.id});
 assert.equal(h.evaluate('S.timer.fin'),true);
 assert.equal(h.evaluate('tmMs()'),61000);
 assert.match(sheet.innerHTML,/sheet-center.*Registrar leitura/);
 await h.click('close');
 assert.equal(h.evaluate('S.timer.fin'),true);
 assert.match(h.evaluate('viewToday()'),/Tempo pronto para registrar/);
});

test('confirmar o registro salva o tempo e a página juntos',()=>{
 const h=harness();
 h.evaluate("S.books=[{id:'b',title:'Meu livro',page:10,total:100}]; S.timer={id:'t',bookId:'b',fin:true,acc:720000};");
 for(const [id,value] of Object.entries({'f-book':'b','timer-session':'t','f-hours':'9','f-min':'59','f-page':'24'}))h.elements.set(id,{value});
 h.elements.set('f-err',{textContent:''});
 h.evaluate('const workingSave=save;save=()=>false;submitLog()');
 assert.equal(h.evaluate('S.timer.id'),'t');
 assert.equal(h.evaluate('S.logs.length'),0);
 assert.equal(h.evaluate('S.books[0].page'),10);
 assert.match(h.elements.get('f-err').textContent,/continua disponível/);
 h.evaluate('save=workingSave;submitLog()');
 const persisted=JSON.parse(h.storage.get('lume-leitura-v1'));
 assert.equal(persisted.timer,null);
 assert.equal(persisted.logs[0].t,1);
 assert.equal(persisted.logs[0].min,12);
 assert.equal(persisted.books[0].page,24);
});
test('trechos são dos livros correspondentes e a legenda leva ao download oficial',()=>{
 const h=harness();
 assert.equal(h.evaluate("bookQuotes({id:'b',title:'Quincas Borba',author:'Machado de Assis'}).length"),1);
 assert.equal(h.evaluate("bookQuotes({id:'b',title:'Obra desconhecida'}).length"),0);
 assert.match(h.evaluate("shareText({title:'Meu livro',author:'Ana',desc:'Descrição'})"),/Descrição.*github\.io/s);
});

test('mascote sugere após a primeira leitura, reage após a quarta e dá tempo para a rotina',()=>{
 const h=harness();
 h.evaluate(`S.books=Array.from({length:4},(_,i)=>({id:'r'+i,title:'Livro '+i,author:'Autora'}));
  const logFor=(i,date,mins)=>({bookId:'r'+i,date,min:mins,pts:mins,pages:0});`);
 assert.doesNotMatch(h.evaluate('viewToday()'),/pet-bubble pet-advice/);
 h.evaluate('S.logs=[logFor(0,today(),25)]');
 assert.match(h.evaluate('viewToday()'),/class="pet-bubble pet-advice" data-mood="normal"/);
 h.evaluate('S.logs.push(logFor(1,today(),1),logFor(2,today(),1))');
 assert.equal(h.evaluate('journeyMood(readingJourney(),27)'),'normal');
 h.evaluate('S.logs.push(logFor(3,today(),1))');
 assert.equal(h.evaluate('journeyMood(readingJourney(),28)'),'happy');
 h.evaluate('S.logs.forEach(l=>l.date=dkey(addDays(new Date(),-1)))');
 assert.equal(h.evaluate('journeyMood(readingJourney(),0)'),'normal');
 h.evaluate('S.logs.forEach(l=>l.date=dkey(addDays(new Date(),-8)))');
 assert.equal(h.evaluate('journeyMood(readingJourney(),0)'),'sleepy');
});

test('trilha abre no 30 e se expande no 50; mascotes secretos ficam sem nome e imagem',async()=>{
 const h=harness();
 h.evaluate(`S.books=[{id:'x',title:'Leitura'}];const log={bookId:'x',date:today(),min:20,pages:0,finished:false,pts:899};S.logs=[log];`);
 assert.doesNotMatch(h.evaluate('viewToday()'),/pet-secret/);
 await h.click('pet-touch');
 assert.doesNotMatch(h.elements.get('sheet-root').innerHTML,/Trilha secreta|pet-face|data-v="cervo"/);
 h.evaluate('log.pts=900');
 assert.equal(h.evaluate('readingJourney().level'),30);
 await h.click('pet-secret');
 let html=h.elements.get('sheet-root').innerHTML;
 assert.match(html,/>\?<\/span><span>Nível 40/);
 assert.doesNotMatch(html,/Cervo lunar|Lobo do eclipse|Nível 60|Deus da leitura/);
 h.evaluate('log.pts=1450');
 await h.click('pet-secret');
 html=h.elements.get('sheet-root').innerHTML;
 assert.match(html,/Serpente estelar/);
 assert.match(html,/>\?<\/span><span>Nível 60/);
 assert.doesNotMatch(html,/Lobo do eclipse|Guardião da aurora/);
 assert.match(html,/Deus da leitura/);
});

test('nível 70 exige 100 obras iniciadas e 30 concluídas no registro, inclusive depois de editar a estante',async()=>{
 const h=harness();
 h.evaluate(`
   S.books=Array.from({length:101},(_,i)=>({id:'r'+i,title:'Livro '+i,author:'Autora',done:true,total:200,page:200}));
   S.logs=S.books.slice(0,99).map((b,i)=>({bookId:b.id,date:today(),min:1,pages:48,pts:i<30?99:49,finished:i<30,work:bookIdentity(b)}));
   const lastBook=S.books[99];
   const extraLog={bookId:lastBook.id,date:today(),min:1,pages:1,pts:2,finished:false,work:bookIdentity(lastBook)};
   S.books.push({...S.books[0],id:'clone',title:' LIVRO 0! '});
   S.logs.push({...S.logs[0],bookId:'clone',work:bookIdentity(S.books.at(-1))});
 `);
 assert.equal(h.evaluate('readingJourney().started'),99);
 assert.equal(h.evaluate('readingJourney().level'),69);
 h.evaluate('S.logs.pop(); S.logs.push(extraLog); delete S.logs[0].finished; S.logs[0].pts=49');
 assert.equal(h.evaluate('readingJourney().started'),100);
 assert.equal(h.evaluate('readingJourney().finished'),29);
 assert.equal(h.evaluate('readingJourney().level'),69);
 h.evaluate('S.logs[0].pts+=50');
 assert.equal(h.evaluate('readingJourney().finished'),30);
 assert.equal(h.evaluate('readingJourney().level'),70);
 assert.match(h.evaluate('viewToday()'),/Deus da leitura/);
 await h.click('rm-yes',{id:'r0'});
 assert.equal(h.evaluate('readingJourney().level'),70);
});

test('dados de demonstração não evoluem o mascote e Ajustes abre com leitura separada',async()=>{
 const h=harness({native:true,readingTimer:{}});
 h.evaluate('S=seed()');
 assert.equal(h.evaluate('readingJourney().started'),0);
 assert.equal(h.evaluate('readingJourney().level'),1);
 await h.click('settings');
 const sheet=h.elements.get('sheet-root');
 assert.match(sheet.innerHTML,/Leitura e avisos/);
 assert.doesNotMatch(sheet.innerHTML,/form-set|up-enable|data-act="wipe"/);
 await h.click('settings-section',{v:'reading'});
 assert.match(sheet.innerHTML,/form-set/);
 assert.match(sheet.innerHTML,/tm-alerts/);
 assert.match(sheet.innerHTML,/lem-toggle/);
 await h.click('settings-section',{v:'updates'});
 assert.match(sheet.innerHTML,/up-check/);
 await h.click('settings-section',{v:'data'});
 assert.match(sheet.innerHTML,/demo-limpar/);
});

test('XP antigo é preservado e registros manuais só avançam até o nível 10',()=>{
 const h=harness();
 h.evaluate(`const step=(source,date=today(),timerMin=50)=>({source,date,bookId:'a',min:200,pages:200,pts:400,timerMin});`);
 h.evaluate("S.logs=[step('manual'),step('manual')]");
 assert.equal(h.evaluate('readingJourney().level'),10);
 assert.equal(h.evaluate('readingJourney().score'),160);
 h.evaluate("S.logs.push(step('timer'),step('timer',today(),200),step('manual'))");
 assert.equal(h.evaluate('readingJourney().score'),340);
 h.evaluate("S.logs=[step('timer',today(),180),step('manual')]");
 assert.equal(h.evaluate('readingJourney().score'),180);
 h.evaluate("S.logs=[step(undefined),step('manual')]");
 assert.equal(h.evaluate('readingJourney().score'),400);
 h.evaluate("S.logs=Array.from({length:100},(_,i)=>({...step('manual'),bookId:'b'+i,finished:i<30}))");
 assert.equal(h.evaluate('readingJourney().level'),10);
});

test('o balão alterna entre sugestão e citação e os retratos usam roupas por espécie',()=>{
 const h=harness();
 h.evaluate("S.books=[{id:'b',title:'Dom Casmurro',author:'Machado de Assis'}];openingReadingQuote('b');");
 assert.match(h.evaluate("mascotVoiceHtml('Vamos ler?','normal')"),/pet-advice/);
 h.evaluate('readingQuote.due=0');
 const bubble=h.evaluate("mascotVoiceHtml('Vamos ler?','normal')");
 assert.match(bubble,/pet-quote/);
 assert.doesNotMatch(bubble,/Vamos ler/);
 h.evaluate('readingQuote.shown=1');
 assert.match(h.evaluate("mascotVoiceHtml('Vamos ler?','normal')"),/pet-advice/);
 assert.match(h.evaluate("mascotArt('leao',2,'normal','bow',8)"),/data-wardrobe="bow" transform="translate\(100 145\)/);
 assert.match(h.evaluate("mascotArt('fantasma',3,'normal','bow',10)"),/data-creature="fantasma".*data-wardrobe="bow" transform="translate\(103 119\)/);
 assert.notEqual(h.evaluate("mascotArt('dragao',3,'normal','none',10)"),h.evaluate("mascotArt('dragao',3,'normal','none',50)"));
});

test('uma sessão agrupa novos marcos no app e no Android e respeita a permissão',async()=>{
 for(const permission of ['granted','denied']){
   const h=harness({native:true,permission});
   h.evaluate("S.books=[{id:'b',title:'Livro',page:0,total:300}];");
   for(const [id,value] of Object.entries({'f-book':'b','f-hours':'0','f-min':'20','f-page':'1'}))h.elements.set(id,{value});
   h.evaluate('submitLog()');
   await settle();
   assert.match(h.elements.get('reward-pop').innerHTML,/subiu de nível/);
   const sent=()=>h.scheduled.filter(n=>n.extra?.kind==='lume-achievement');
   assert.equal(sent().length,permission==='granted'?1:0);
   h.evaluate('render()');
   await settle();
   assert.equal(sent().length,permission==='granted'?1:0);
   await h.click('reward-view');
   assert.equal(h.evaluate('tab'),'ach');
 }
});
