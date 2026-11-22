/* Backup manual: copiar e restaurar os dados por texto (funciona em qualquer celular) */
let pendingRestore=null;
function backupHtml(){
  pendingRestore=null;
  return '<div class="zone"><b>Backup manual</b><p>Copie seus dados e guarde em um lugar seguro, como o app de notas do celular. Para restaurar, cole o texto abaixo.</p>'
   +'<div class="row"><button class="btn btn-ghost" type="button" data-act="bk-copy">Copiar meus dados</button></div>'
   +'<label for="bk-t">Restaurar a partir do backup</label><textarea id="bk-t" rows="3" placeholder="Cole aqui o texto do backup"></textarea>'
   +'<p class="hint" id="bk-e" role="status"></p><div class="row"><button class="btn btn-ghost" type="button" data-act="bk-imp">Restaurar</button></div></div>';
}
const bkMsg=m=>{const e=$('#bk-e');if(e)e.textContent=m;};
document.addEventListener('click',function(e){
  const a=e.target.closest('[data-act]');if(!a)return;
  if(a.dataset.act==='bk-copy'){
    const txt=JSON.stringify(S),t=$('#bk-t');
    const fallback=()=>{if(t){t.value=txt;t.focus();t.select();}bkMsg('Selecione o texto da caixa e copie.');};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(()=>bkMsg('Dados copiados. Cole em um lugar seguro.'),fallback);
    else fallback();
  }
  if(a.dataset.act==='bk-imp'){
    let o=null;try{o=JSON.parse(($('#bk-t').value||'').trim());}catch(x){}
    if(!dadosSeguros(o))return bkMsg('Esse texto não parece um backup do Lume Leitura.');
    pendingRestore={data:o,profile:stateKey};
    confirmAction('Restaurar backup?','O backup substituirá os dados do perfil atual.','bk-imp-yes','Restaurar backup');
  }
  if(a.dataset.act==='bk-imp-yes'&&pendingRestore?.profile===stateKey){
    const antes=S;S=normalizarPerfil(pendingRestore.data);pendingRestore=null;
    if(!save()){S=antes;closeSheet();return toast(['Não foi possível salvar neste aparelho.']);}
    applyTema();closeSheet();render();toast(['Dados restaurados']);
  }
});
