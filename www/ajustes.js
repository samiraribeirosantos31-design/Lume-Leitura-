/* Menu de ajustes e telas de cada grupo. */
function settingsItem(action,label,detail,value=''){
  return '<button type="button" class="settings-item" data-act="'+action+'" data-v="'+value+'">'
    +'<span><b>'+label+'</b><small>'+detail+'</small></span><span aria-hidden="true">›</span></button>';
}
function openSettings(section=''){
  const titles={reading:'Leitura e avisos',updates:'Atualizações',data:'Dados do aparelho'};
  const back='<button type="button" class="btn btn-ghost btn-block" data-act="settings">Voltar aos ajustes</button>';
  let body;
  if(section==='reading'){
    body='<form id="form-set" novalidate><label for="f-goal">Meta diária (minutos)</label>'
      +'<div class="stepper"><button type="button" data-act="step" data-d="-5" aria-label="Diminuir 5 minutos">−</button>'
      +'<input id="f-goal" type="number" inputmode="numeric" min="5" max="240" step="5" value="'+S.goal+'">'
      +'<button type="button" data-act="step" data-d="5" aria-label="Aumentar 5 minutos">+</button></div>'
      +'<p class="err" id="f-err" role="alert"></p><button class="btn btn-primary btn-block" type="submit">Salvar meta</button></form>'
      +lemHtml()+(readingPlugin()?settingsItem('tm-alerts','Cronômetro nas notificações',S.timerAlerts===false?'Desativado':'Ativado'):'')
      +(rewardPlugin()?settingsItem('reward-alerts','Notificações de conquistas',S.achievementAlerts===false?'Desativadas':'Usar permissão do Android'):'')
      +settingsItem('quote-toggle','Trechos do mascote',S.petQuotes===false?'Desativados':'Ativados')+back;
  }else if(section==='updates'){
    body=window.lumeUpdatesSettings()+back;
  }else if(section==='data'){
    body='<p class="hint">Você pode guardar uma cópia do seu progresso em Conta e dados.</p>'
      +(S.demo?'<button class="btn btn-ghost btn-block" type="button" data-act="demo-limpar">Remover dados de demonstração</button>':'')
      +'<button class="btn btn-danger btn-block" type="button" data-act="wipe">Apagar todos os dados</button>'+back;
  }else{
    body=settingsItem('settings-section','Leitura e avisos','Meta de '+S.goal+' min, lembretes e cronômetro','reading')
      +settingsItem('look-open','Aparência','Cores do app')
      +settingsItem('conta','Conta e dados','Perfil e backup')
      +settingsItem('settings-section','Atualizações','Versão, avisos e download','updates')
      +settingsItem('guia-rever','Rever tutorial','Passos para usar o Lume')
      +settingsItem('settings-section','Dados do aparelho','Limpar dados do perfil','data')
      +'<button type="button" class="btn btn-ghost btn-block" data-act="close">Fechar</button>';
  }
  openSheet('<h2 id="sh-t">'+(titles[section]||'Ajustes')+'</h2><div class="settings-stack">'+body+'</div>',null,'sheet-settings');
}
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]');
  if(a?.dataset.act==='settings-section')openSettings(a.dataset.v);
});
