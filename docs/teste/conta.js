/* Conta e dados na nuvem (Firebase Auth + Firestore) */
const NV=window.NUVEM||{};
const nvOk=()=>!!(NV.apiKey&&NV.projectId&&NV.appId);
const nativo=()=>!!window.Capacitor;
let FB=null,USR=null,syncMsg='',pushT=null,fbBusy=null;
const loadJs=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});
function fbInit(){
  if(fbBusy)return fbBusy;
  fbBusy=(async()=>{
    if(!nvOk())throw new Error('cfg');
    const B='https://www.gstatic.com/firebasejs/10.12.2/firebase-';
    await loadJs(B+'app-compat.js');await loadJs(B+'auth-compat.js');await loadJs(B+'firestore-compat.js');
    firebase.initializeApp(NV);
    FB={auth:firebase.auth(),db:firebase.firestore()};
    FB.auth.onAuthStateChanged(u=>{USR=u;try{localStorage.setItem('lume-login',u?'1':'');}catch(e){}if(u)depoisLogin();else refreshConta();});
    return FB;
  })();
  fbBusy.catch(()=>{fbBusy=null;});
  return fbBusy;
}
const docRef=()=>FB.db.collection('usuarios').doc(USR.uid);
function legivel(e){
  const c=(e&&e.code)||String(e);
  const m={'auth/invalid-email':'E-mail inválido.','auth/user-not-found':'Conta não encontrada.','auth/wrong-password':'Senha incorreta.','auth/invalid-credential':'E-mail ou senha incorretos.',
    'auth/email-already-in-use':'Este e-mail já tem conta. Use Entrar.','auth/weak-password':'A senha precisa ter pelo menos 6 caracteres.','auth/too-many-requests':'Muitas tentativas. Espere um pouco.',
    'auth/network-request-failed':'Sem internet. Tente de novo.','auth/popup-closed-by-user':'A janela do Google foi fechada.','auth/unauthorized-domain':'Este endereço ainda não foi liberado no Firebase.',
    'auth/operation-not-allowed':'Esse tipo de login não está ativado no Firebase.','permission-denied':'Sem permissão. Confira as regras do Firestore.'};
  return m[c]||'Algo deu errado. Tente de novo.';
}
function dadosSeguros(o){return o&&o.v===1&&Array.isArray(o.books)&&Array.isArray(o.logs);}
function adotar(cloud,ts){
  cloud.upd=ts;S=cloud;S.notes=S.notes||[];
  _saveRaw();applyTema();render();
}
async function depoisLogin(){
  try{
    const snap=await docRef().get();
    if(!snap.exists){syncMsg='Conta conectada.';await enviar();refreshConta();return;}
    const d=snap.data();let cloud=null;try{cloud=JSON.parse(d.dados);}catch(e){}
    if(!dadosSeguros(cloud)){await enviar();refreshConta();return;}
    const vazio=S.demo||(!S.books.length&&!S.logs.length);
    if(vazio){adotar(cloud,d.upd||Date.now());syncMsg='Dados carregados da nuvem.';}
    else if((d.upd||0)>(S.upd||0)){perguntar(cloud,d.upd);return;}
    else await enviar();
  }catch(e){syncMsg=legivel(e);}
  refreshConta();
}
function perguntar(cloud,ts){
  window._cl={c:cloud,t:ts};
  openSheet('<h2 id="sh-t">Dados diferentes</h2><p class="muted">A nuvem tem dados mais recentes do que os deste aparelho. Qual você quer manter?</p>'
   +'<div class="row"><button class="btn btn-primary" data-act="cl-nuvem">Usar os da nuvem</button><button class="btn btn-ghost" data-act="cl-local">Manter os deste aparelho</button></div>');
}
async function enviar(){
  if(!FB||!USR||S.demo)return;
  try{await docRef().set({dados:JSON.stringify(S),upd:S.upd||Date.now()});syncMsg='Sincronizado às '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+'.';}
  catch(e){syncMsg=legivel(e);}
  refreshConta();
}
const _saveRaw=save;
save=function(){S.upd=Date.now();_saveRaw();if(USR){clearTimeout(pushT);pushT=setTimeout(enviar,2500);}};

function contaHtml(){
  let o='<h2 id="sh-t">Conta e dados</h2>';
  if(!nvOk())o+='<p class="muted">O login na nuvem ainda não foi ativado neste app. Seus dados continuam salvos neste aparelho, e você pode fazer backup abaixo.</p>';
  else if(!USR)o+='<form id="form-login" novalidate><p class="muted">Entre para guardar seus dados na nuvem e abri-los em outro celular.</p>'
    +'<label for="cl-e">E-mail</label><input id="cl-e" type="email" autocomplete="email" inputmode="email">'
    +'<label for="cl-s">Senha</label><input id="cl-s" type="password" autocomplete="current-password">'
    +'<p class="err" id="cl-err" role="alert"></p><div class="row"><button class="btn btn-primary" type="submit">Entrar</button><button class="btn btn-ghost" type="button" data-act="cl-criar">Criar conta</button></div>'
    +'<div class="row">'+(nativo()?'':'<button class="btn btn-soft" type="button" data-act="cl-google">Entrar com Google</button>')+'<button class="btn btn-quiet" type="button" data-act="cl-reset">Esqueci a senha</button></div></form>';
  else o+='<p>Conectado como <b>'+esc(USR.email||'conta Google')+'</b></p><p class="muted" id="cl-msg">'+esc(syncMsg||'Seus dados são sincronizados automaticamente.')+'</p>'
    +'<div class="row"><button class="btn btn-soft" data-act="cl-sync">Sincronizar agora</button><button class="btn btn-ghost" data-act="cl-sair">Sair</button></div>';
  return o+(window.backupHtml?backupHtml():'')+'<div class="row"><button class="btn btn-quiet" type="button" data-act="close">Fechar</button></div>';
}
function openConta(){
  openSheet(contaHtml());
  if(nvOk()&&!FB)fbInit().then(()=>{if($('#form-login')||$('#cl-msg'))refreshConta();}).catch(()=>{const e=$('#cl-err');if(e)e.textContent='Não foi possível carregar o login. Verifique a internet.';});
}
function refreshConta(){
  const s=$('.sheet');if(!s||!/Conta e dados/.test(s.textContent.slice(0,40)))return;
  const keep=$('#cl-e')?$('#cl-e').value:'';
  s.innerHTML=contaHtml();if($('#cl-e'))$('#cl-e').value=keep;
}
const err=m=>{const e=$('#cl-err');if(e)e.textContent=m;};
async function tentar(fn){try{await fbInit();await fn();}catch(e){err(e.message==='cfg'?'Login não configurado.':legivel(e));}}
const _openSettings2=openSettings;
openSettings=function(){
  _openSettings2();
  const z=$('#wipe-zone');if(z)z.insertAdjacentHTML('beforebegin','<button class="btn btn-soft btn-block" type="button" data-act="conta">Conta e dados'+(USR?' (conectado)':'')+'</button>');
};
document.addEventListener('click',function(e){
  const a=e.target.closest('[data-act]');if(!a)return;
  const em=()=>($('#cl-e')||{}).value||'',pw=()=>($('#cl-s')||{}).value||'';
  switch(a.dataset.act){
    case 'conta':openConta();break;
    case 'cl-criar':tentar(()=>FB.auth.createUserWithEmailAndPassword(em().trim(),pw()));break;
    case 'cl-google':tentar(()=>FB.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()));break;
    case 'cl-reset':tentar(async()=>{if(!em().trim())return err('Digite seu e-mail acima.');await FB.auth.sendPasswordResetEmail(em().trim());err('Enviamos um e-mail para trocar a senha.');});break;
    case 'cl-sair':tentar(async()=>{await FB.auth.signOut();syncMsg='';});break;
    case 'cl-sync':S.upd=Date.now();enviar();break;
    case 'cl-nuvem':adotar(window._cl.c,window._cl.t);syncMsg='Dados carregados da nuvem.';closeSheet();toast(['Dados da nuvem carregados']);break;
    case 'cl-local':S.upd=Date.now();enviar();closeSheet();toast(['Dados deste aparelho enviados']);break;
  }
});
document.addEventListener('submit',function(e){
  if(e.target.id==='form-login')tentar(()=>FB.auth.signInWithEmailAndPassword(($('#cl-e').value||'').trim(),$('#cl-s').value));
});
try{if(nvOk()&&localStorage.getItem('lume-login')==='1')fbInit().catch(()=>{});}catch(e){}
