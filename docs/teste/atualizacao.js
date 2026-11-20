/* Atualização: módulo isolado; não altera os registros nem substitui save/render. */
(function(){
  'use strict';
  var API='https://api.github.com/repos/samiraribeirosantos31-design/Lume-Leitura-/releases/tags/latest';
  var PAGE='https://samiraribeirosantos31-design.github.io/Lume-Leitura-/';
  var KEY='lume-atualizacao-v1',ID=1711,busy=false,latest=null,notice=null;
  var build=window.LUME_BUILD||{code:0,name:'atual'};
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function write(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}}
  function plugin(){return window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.LocalNotifications;}
  function native(){return !!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());}
  function message(t){var e=document.getElementById('up-msg');if(e)e.textContent=t;}
  function paint(){
    if(!latest||latest.code<=build.code)return;
    var el=document.getElementById('lume-update');
    if(!el){el=document.createElement('section');el.id='lume-update';el.className='card lume-update';el.setAttribute('aria-label','Atualização disponível');el.setAttribute('role','status');var main=document.getElementById('view');if(!main)return;main.parentNode.insertBefore(el,main);}
    el.innerHTML='<h2>Nova versão Android disponível</h2><p>O Lume Leitura '+esc(latest.name)+' já pode ser baixado.</p><button class="btn btn-primary btn-block" type="button" data-act="up-open">Ver atualização e instruções</button>';
  }
  async function openPage(){
    var br=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Browser;
    try{if(native()&&br){await br.open({url:PAGE});return;}}catch(e){}
    window.open(PAGE,'_blank','noopener');
  }
  async function notify(){
    if(!latest)return;
    var prefs=read();if(prefs.notified===latest.code)return;
    try{
      var n=plugin();
      if(native()&&n){
        var permission=await n.checkPermissions();
        if(permission.display!=='granted')return;
        await n.schedule({notifications:[{id:ID,title:'Lume Leitura atualizado',body:'Toque para baixar a versão '+latest.name+' e ver como instalar.',extra:{kind:'lume-update'}}]});
      }else if('Notification' in window&&Notification.permission==='granted'){
        notice=new Notification('Nova versão do Lume Leitura',{body:'Toque para ver o download e as instruções.',tag:'lume-update'});
        notice.onclick=function(){openPage();notice.close();};
      }else return;
      prefs=read();prefs.notified=latest.code;write(prefs);
    }catch(e){/* O aviso dentro do app permanece disponível. */}
  }
  async function check(force){
    if(busy)return;
    var prefs=read();
    if(prefs.latest&&Number.isSafeInteger(prefs.latest.code)&&/^[0-9.]{1,30}$/.test(prefs.latest.name)){latest=prefs.latest;paint();}
    if(!force&&prefs.checked&&Date.now()-prefs.checked<21600000)return;
    busy=true;message('Verificando versão...');
    var controller=new AbortController(),timeout=setTimeout(function(){controller.abort();},8000);
    try{
      var response=await fetch(API,{signal:controller.signal,cache:'no-store',headers:{Accept:'application/vnd.github+json'}});
      if(!response.ok)throw new Error('http');
      var data=await response.json(),body=String(data.body||'');
      var code=/LUME_BUILD_CODE=(\d+)/.exec(body),name=/LUME_VERSION=([0-9.]+)/.exec(body);
      var apk=(data.assets||[]).some(function(a){return a.name==='app-debug.apk';});
      if(data.draft||data.prerelease||!apk||!code||!name)throw new Error('sem-versao');
      var number=Number(code[1]);if(!Number.isSafeInteger(number)||number<1||name[1].length>30)throw new Error('versao');
      latest={code:number,name:name[1]};prefs=read();prefs.latest=latest;prefs.checked=Date.now();write(prefs);
      if(number>build.code){paint();message('Nova versão '+latest.name+' disponível.');await notify();}
      else message('Você está na versão mais recente.');
    }catch(e){message('Não foi possível verificar agora. Tente novamente com internet.');}
    finally{clearTimeout(timeout);busy=false;}
  }
  async function permissions(){
    try{
      var n=plugin();
      if(native()&&n){await n.requestPermissions();}
      else if('Notification' in window){await Notification.requestPermission();}
      await check(true);
      var allowed=native()&&n?(await n.checkPermissions()).display==='granted':('Notification' in window&&Notification.permission==='granted');
      if(!allowed)message('Permissão não concedida. O aviso dentro do app continua funcionando.');
      else {message('Avisos ativados. A verificação acontece ao abrir ou retornar ao app.');await notify();}
    }catch(e){message('Use o aviso dentro do app para consultar as atualizações.');}
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest('[data-act]');if(!a)return;
    if(a.dataset.act==='up-open')openPage();
    if(a.dataset.act==='up-check')check(true);
    if(a.dataset.act==='up-enable')permissions();
    if(a.dataset.act==='settings'){
      var zone=document.getElementById('wipe-zone');if(!zone)return;
      var p=document.createElement('div');p.className='zone';p.id='up-zone';
      p.innerHTML='<b>Atualizações</b><p>Versão '+esc(build.name)+'. A verificação acontece ao abrir ou retornar ao app, com internet.</p><p id="up-msg" role="status"></p><div class="row"><button type="button" class="btn btn-soft" data-act="up-check">Verificar atualização</button><button type="button" class="btn btn-ghost" data-act="up-enable">Ativar avisos</button><button type="button" class="btn btn-quiet" data-act="up-open">Página de download</button></div>';
      zone.parentNode.insertBefore(p,zone);
    }
  });
  document.addEventListener('visibilitychange',function(){if(!document.hidden)check(false);});
  window.addEventListener('online',function(){check(false);});
  var n=plugin();
  if(native()&&n)n.addListener('localNotificationActionPerformed',function(e){if(e.notification&&e.notification.extra&&e.notification.extra.kind==='lume-update')openPage();});
  check(false);
})();
