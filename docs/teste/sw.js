/* Service worker: deixa o app abrir sem internet depois da primeira visita */
const CACHE='lume-v9';
const ARQ=['./','index.html','style.css','style2.css','extra.css','extra2.css','evolucao.css','evolucao.js','mascotes4.js','mascote-painel.js','ajustes.js','nuvem-config.js','app1.js','app2.js','app3.js','notas.js','cronometro.js',
  'mascotes1.js','mascotes2.js','mascotes3.js','ritmo.js','lembrete.js','temas.js','busca.js','estantes.js','backup.js','conta.js','interacoes.js','guia.js','manifest.webmanifest','icone.svg','build-info.js','atualizacao.js','atualizacao.css'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARQ)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>/^lume-v[0-9]+$/.test(n)&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(c=>c.match(r,{ignoreSearch:true}).then(hit=>{
    if(hit)return hit;
    const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res;}).catch(()=>hit||(r.mode==='navigate'?c.match('index.html'):Response.error()));
    return net;
  })));
});
