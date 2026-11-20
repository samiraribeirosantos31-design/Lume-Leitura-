/* Firebase Auth e sincronização por perfil, com proteção contra conflito. */
const NV=window.NUVEM||{};
const nvOk=()=>!!(NV.apiKey&&NV.projectId&&NV.appId);
const nativo=()=>!!window.Capacitor;
let FB=null,USR=null,perfil=null,syncMsg='',pushT=null,fbBusy=null;
const loadJs=src=>new Promise((ok,no)=>{
  const s=document.createElement('script');s.src=src;s.onload=ok;
  s.onerror=()=>{s.remove();no(new Error('SDK indisponível'));};document.head.appendChild(s);
});
function fbInit(){
  if(fbBusy)return fbBusy;
  fbBusy=(async()=>{
    if(!nvOk())throw new Error('cfg');
    const B='https://www.gstatic.com/firebasejs/10.12.2/firebase-';
    if(!window.firebase)await loadJs(B+'app-compat.js');
    if(!firebase.auth)await loadJs(B+'auth-compat.js');
    if(!firebase.firestore)await loadJs(B+'firestore-compat.js');
    if(!firebase.apps.length)firebase.initializeApp(NV);
    FB={auth:firebase.auth(),db:firebase.firestore()};
    FB.auth.onAuthStateChanged(trocarPerfil);
    return FB;
  })();
  fbBusy.catch(()=>{fbBusy=null;});
  return fbBusy;
}
function legivel(e){
  const m={'auth/invalid-email':'E-mail inválido.','auth/invalid-credential':'E-mail ou senha incorretos.',
    'auth/email-already-in-use':'Este e-mail já tem conta. Use Entrar.','auth/weak-password':'Use pelo menos 6 caracteres.',
    'auth/network-request-failed':'Sem internet. Tente de novo.','auth/popup-closed-by-user':'A janela de login foi fechada.',
    'auth/unauthorized-domain':'Este endereço ainda precisa ser liberado no Firebase.',
    'auth/operation-not-allowed':'Este tipo de login ainda precisa ser ativado no Firebase.',
    'auth/account-exists-with-different-credential':'Entre pelo método já associado a este e-mail.',
    'permission-denied':'A nuvem recusou o acesso. Seus dados seguem neste aparelho.'};
  return m[e?.code]||'Serviço indisponível no momento. Tente novamente.';
}
function dadosSeguros(o){
  return !!(o&&o.v===1&&Number.isFinite(o.goal)&&
    Array.isArray(o.books)&&o.books.every(b=>b&&typeof b.id==='string'&&typeof b.title==='string'&&Number.isFinite(b.total)&&Number.isFinite(b.page))&&
    Array.isArray(o.logs)&&o.logs.every(l=>l&&typeof l.date==='string'&&Number.isFinite(l.min))&&
    (!o.notes||Array.isArray(o.notes)&&o.notes.every(n=>n&&typeof n.text==='string')));
}
function normalizarPerfil(dados){
  return {...dados,notes:(dados.notes||[]).map(n=>({...n,type:n.type||'nota'})),
    petName:dados.petName||'Mascote',mascote:dados.mascote==='avatar'?'coruja':dados.mascote,
    seen:Array.isArray(dados.seen)?dados.seen:[]};
}
const _saveRaw=save;
function metaPerfil(key){
  try{return JSON.parse(localStorage.getItem(key+':sync'))||{};}catch(e){return {};}
}
function registrarSync(p){
  try{localStorage.setItem(p.key+':sync',JSON.stringify({rev:p.rev,pending:p.pending}));}catch(e){}
}
async function trocarPerfil(user){
  clearTimeout(pushT);
  if(!user&&stateKey===KEY){
    try{localStorage.removeItem('lume-login');}catch(e){}
    refreshConta();return;
  }
  USR=user;
  stateKey=user?KEY+':uid:'+user.uid:KEY;
  try{localStorage.setItem('lume-login',user?'1':'');}catch(e){}
  const local=load();
  S=dadosSeguros(local)?normalizarPerfil(local):emptyState();
  perfil=user?{key:stateKey,ref:FB.db.collection('usuarios').doc(user.uid),ready:false,writing:false,
    rev:0,pending:false,...metaPerfil(stateKey)}:null;
  syncMsg=user?'Carregando o progresso da conta…':'';
  closeSheet();tab='today';ask=null;tmBook=null;tmAsk=false;applyTema();render();
  const p=perfil;
  if(p)await carregarPerfil(p);
  if(perfil===p)window.iniciarGuia?.();
}
async function carregarPerfil(p){
  try{
    const snap=await p.ref.get({source:'server'});
    if(perfil!==p)return;
    const remote=snap.exists?snap.data():null;
    const rev=remote?.rev||0;
    if(remote&&p.pending&&rev!==p.rev)throw new Error('conflito');
    if(remote&&!p.pending){
      const cloud=JSON.parse(remote.dados);
      if(!dadosSeguros(cloud))throw new Error('dados');
      S=normalizarPerfil(cloud);_saveRaw();applyTema();render();
    }
    p.rev=rev;p.ready=true;registrarSync(p);
    syncMsg=remote?'Progresso carregado da nuvem.':'Conta conectada.';
    if(p.pending)await enviar();
  }catch(e){
    if(perfil===p)syncMsg=e.message==='conflito'?mensagemConflito():'Nuvem indisponível. Seu progresso está neste aparelho.';
  }
  if(perfil===p)refreshConta();
}
function mensagemConflito(){
  return 'Há uma versão diferente na nuvem. Seus dados locais foram preservados. Exporte um backup antes de resolver a diferença.';
}
async function enviar(){
  const p=perfil;
  if(!p||!p.ready||p.writing||!p.pending)return;
  p.writing=true;
  const dados=JSON.stringify(S);
  try{
    await FB.db.runTransaction(async tx=>{
      const snap=await tx.get(p.ref);
      if((snap.exists?snap.data().rev||0:0)!==p.rev)throw new Error('conflito');
      tx.set(p.ref,{dados,rev:p.rev+1});
    });
    p.rev++;
    if(perfil===p){
      p.pending=JSON.stringify(S)!==dados;registrarSync(p);
      syncMsg=p.pending?'Alterações aguardando sincronização.':'Progresso sincronizado.';
    }else{
      try{if(localStorage.getItem(p.key)===dados)p.pending=false;}catch(e){}
      registrarSync(p);
    }
  }catch(e){
    if(perfil===p)syncMsg=e.message==='conflito'?mensagemConflito():legivel(e)+' Os dados seguem neste aparelho.';
    if(e.message==='conflito')p.ready=false;
  }finally{
    p.writing=false;
    if(perfil===p)refreshConta();
    if(perfil===p&&p.ready&&p.pending&&JSON.stringify(S)!==dados)enviar();
  }
}
save=function(){
  const stored=_saveRaw();
  if(perfil&&stored){
    perfil.pending=true;registrarSync(perfil);
    clearTimeout(pushT);pushT=setTimeout(enviar,800);
  }
  return stored;
};
function contaHtml(){
  let o='<h2 id="sh-t">Conta e dados</h2>';
  if(!nvOk())o+='<p class="muted">O login na nuvem ainda precisa ser ativado. Você pode usar o app neste aparelho e exportar um backup.</p>';
  else if(!USR)o+='<form id="form-login" novalidate><p class="muted">Entre para sincronizar em outros aparelhos. O progresso sem login fica separado.</p>'
    +'<label for="cl-e">E-mail</label><input id="cl-e" type="email" autocomplete="email" inputmode="email">'
    +'<label for="cl-s">Senha</label><input id="cl-s" type="password" autocomplete="current-password">'
    +'<p class="err" id="cl-err" role="alert"></p><div class="row"><button class="btn btn-primary" type="submit">Entrar</button><button class="btn btn-ghost" type="button" data-act="cl-criar">Criar conta</button></div>'
    +'<div class="row">'+(!nativo()&&NV.authDomain&&NV.google?'<button class="btn btn-soft" type="button" data-act="cl-google">Entrar com Google</button>':'')
    +(!nativo()&&NV.facebook?'<button class="btn btn-soft" type="button" data-act="cl-facebook">Entrar com Facebook</button>':'')
    +'<button class="btn btn-quiet" type="button" data-act="cl-reset">Esqueci a senha</button></div></form>';
  else o+='<p>Conectado como <b>'+esc(USR.email||USR.displayName||'leitor')+'</b></p><p class="muted" id="cl-msg">'+esc(syncMsg)+'</p>'
    +'<div class="row"><button class="btn btn-soft" data-act="cl-sync">Sincronizar agora</button><button class="btn btn-ghost" data-act="cl-sair">Sair</button></div>';
  return o+(window.backupHtml?backupHtml():'')+'<div class="row"><button class="btn btn-quiet" type="button" data-act="close">Fechar</button></div>';
}
function openConta(){
  openSheet(contaHtml());
  if(nvOk()&&!FB)fbInit().catch(()=>err('Não foi possível carregar o login. Verifique a internet.'));
}
function refreshConta(){const msg=$('#cl-msg');if(msg)msg.textContent=syncMsg;}
const err=m=>{const e=$('#cl-err');if(e)e.textContent=m;};
async function tentar(fn){try{await fbInit();await fn();}catch(e){err(legivel(e));}}
const _openSettings2=openSettings;
openSettings=function(){
  _openSettings2();
  const z=$('#wipe-zone');if(z)z.insertAdjacentHTML('beforebegin','<button class="btn btn-soft btn-block" type="button" data-act="conta">Conta e dados'+(USR?' (conectado)':'')+'</button>');
};
document.addEventListener('click',function(e){
  const a=e.target.closest('[data-act]');if(!a)return;
  const em=()=>($('#cl-e')?.value||'').trim(),pw=()=>$('#cl-s')?.value||'';
  switch(a.dataset.act){
    case 'conta':openConta();break;
    case 'cl-criar':tentar(()=>FB.auth.createUserWithEmailAndPassword(em(),pw()));break;
    case 'cl-google':tentar(()=>FB.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()));break;
    case 'cl-facebook':tentar(()=>FB.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider()));break;
    case 'cl-reset':tentar(async()=>{if(!em())return err('Digite seu e-mail acima.');await FB.auth.sendPasswordResetEmail(em());err('Confira seu e-mail para trocar a senha.');});break;
    case 'cl-sair':tentar(async()=>{await enviar();await FB.auth.signOut();});break;
    case 'cl-sync':if(perfil?.ready){if(perfil.pending)enviar();else carregarPerfil(perfil);}else if(perfil)carregarPerfil(perfil);break;
  }
});
document.addEventListener('submit',function(e){
  if(e.target.id==='form-login')tentar(()=>FB.auth.signInWithEmailAndPassword($('#cl-e').value.trim(),$('#cl-s').value));
});
try{if(nvOk()&&localStorage.getItem('lume-login')==='1')fbInit().catch(()=>{});}catch(e){}
