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
 ['view','title','eyebrow','sheet-root','toast','wipe-zone','up-msg'].forEach(id=>elements.set(id,element()));
 const parent=element();elements.forEach(e=>e.parentNode=parent);
 const doc={hidden:false,activeElement:null,body:element(),head:element(),
  createElement:element,getElementById:id=>elements.get(id)||null,
  querySelector:s=>s.startsWith('#')?elements.get(s.slice(1))||null:null,querySelectorAll:()=>[],
  addEventListener:(e,f)=>(events[e]??=[]).push(f)};
 let callbacks={},calls=0;
 const notifications={checkPermissions:async()=>({display:options.permission||'granted'}),requestPermissions:async()=>({display:options.permission||'granted'}),schedule:async n=>scheduled.push(...n.notifications),cancel:async()=>{},addListener:(event,cb)=>{callbacks[event]=cb;}};
 const ctx={document:doc,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},console,Date,Math,JSON,Number,String,Array,Object,Promise,AbortController,
  setInterval(){},setTimeout:()=>1,clearTimeout(){},navigator:{},location:{protocol:'http:'},
  addEventListener(){},scrollTo(){},open:u=>opened.push(u),
  fetch:async url=>{calls++;if(options.offline)throw Error('offline');
   if(url.includes('googleapis.com/books'))return {ok:true,json:async()=>({items:[{id:'test-volume',volumeInfo:{title:'Livro de teste',pageCount:100,authors:['Autora'],imageLinks:{thumbnail:'https://example.org/capa.png'}}}]})};
   return {ok:true,json:async()=>options.release||{body:'LUME_BUILD_CODE=111 LUME_VERSION=1.1.1',assets:[{name:'app-debug.apk'}]}};}
 };
 ctx.window=ctx;
 if(options.native)ctx.Capacitor={isNativePlatform:()=>true,Plugins:{LocalNotifications:notifications,Browser:{open:async({url})=>opened.push(url)}}};
 vm.createContext(ctx);
 files.forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f}));
 const evaluate=code=>vm.runInContext(code,ctx);
 const click=async act=>{const a={dataset:{act}};for(const f of events.click||[])await f({target:{closest:s=>s==='[data-act]'?a:null}});};
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
