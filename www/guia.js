/* Apresentação inicial e guia do perfil atual. */
const guia=$('#guia');
const passos=[
  ['today','Registre sua leitura','Em Hoje, toque em Registrar leitura ou use o cronômetro para contar o tempo.'],
  ['search','Encontre um livro','Em Buscar, digite o título ou autor para ver opções do Google Livros.'],
  ['books','Acompanhe a estante','Em Livros, veja suas capas e o progresso de páginas em cada livro.'],
  ['notes','Guarde suas ideias','Em Notas, salve reflexões, citações e páginas para consultar depois.'],
  ['ach','Acompanhe as recompensas','Em Conquistas, veja os selos que ganhou. Em Hoje, acompanhe a evolução do mascote.'],
  ['settings','Deixe o Lume com a sua cara','Use a engrenagem para mudar a cor, acessar a conta e fazer backup. Toque no mascote para personalizá-lo.']
];
let passoGuia=-1;
const chaveGuia=()=>stateKey+':guia';
function terminouGuia(){try{return localStorage.getItem(chaveGuia())==='1';}catch(e){return false;}}
function fecharGuia(){
  try{localStorage.setItem(chaveGuia(),'1');}catch(e){}
  guia.close();tab='today';render();window.scrollTo(0,0);
}
function mostrarGuia(html){
  if(!guia?.showModal)return;
  guia.innerHTML=html;
  if(!guia.open)guia.showModal();
  guia.querySelector('button')?.focus();
}
function verPassoGuia(){
  const [destino,titulo,descricao]=passos[passoGuia];
  if(destino==='settings')tab='today';else tab=destino;
  render();window.scrollTo(0,0);
  mostrarGuia('<div class="guia-passo"><p class="guia-contagem">Passo '+(passoGuia+1)+' de '+passos.length+'</p>'
    +'<h2 id="guia-titulo">'+titulo+'</h2><p>'+descricao+'</p><div class="row">'
    +'<button class="btn btn-primary" data-act="guia-next">'+(passoGuia+1===passos.length?'Concluir':'Próximo')+'</button>'
    +'<button class="btn btn-ghost" data-act="guia-skip">Pular tutorial</button></div></div>');
}
function iniciarGuia(forcar=false){
  if(!guia?.showModal||(!forcar&&terminouGuia()))return;
  closeSheet();passoGuia=0;verPassoGuia();
}
window.iniciarGuia=iniciarGuia;
if(guia?.showModal){
  guia.addEventListener('cancel',e=>{e.preventDefault();if(passoGuia>=0)fecharGuia();else iniciarGuia();});
  let voltarConta=false;
  document.addEventListener('click',e=>{
    const act=e.target.closest('[data-act]')?.dataset.act;
    if(act==='guia-login'){voltarConta=true;guia.close();openConta();}
    if(act==='close'&&voltarConta&&!USR){voltarConta=false;mostrarBoasVindas();}
    if(act==='guia-local'){voltarConta=false;iniciarGuia();}
    if(act==='guia-rever')iniciarGuia(true);
    if(act==='guia-skip')fecharGuia();
    if(act==='guia-next'){
      passoGuia++;
      if(passoGuia===passos.length)fecharGuia();else verPassoGuia();
    }
  });
  function mostrarBoasVindas(){
    passoGuia=-1;
    mostrarGuia('<div class="guia-passo"><h2 id="guia-titulo">Boas-vindas ao Lume Leitura</h2>'
      +'<p>Organize seus livros e acompanhe seu ritmo de leitura.</p><div class="row">'
      +'<button class="btn btn-primary" data-act="guia-login">Entrar ou criar conta</button>'
      +'<button class="btn btn-ghost" data-act="guia-local">Continuar sem login</button></div>'
      +'<p class="hint">Com uma conta, você pode recuperar seu progresso em outro aparelho. Sem login, ele fica neste celular.</p>'
      +(!nvOk()?'<p class="hint">A sincronização da conta ainda não está disponível nesta versão.</p>':'')+'</div>');
  }
  if(!terminouGuia()){
    let restaurando=false;
    try{restaurando=nvOk()&&localStorage.getItem('lume-login')==='1';}catch(e){}
    if(!restaurando)mostrarBoasVindas();
    else fbInit().then(({auth})=>auth.onAuthStateChanged(user=>{
      if(!user&&!terminouGuia()&&!guia.open)mostrarBoasVindas();
    })).catch(mostrarBoasVindas);
  }
}
