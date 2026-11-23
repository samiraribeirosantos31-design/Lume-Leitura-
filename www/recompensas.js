/* Celebra os marcos que a sessão acabou de desbloquear. */
function extraReadingAchievements(j){
  const logs=S.logs.filter(l=>l.min>0&&(!S.demo||l.work));
  const sessions=logs.filter(l=>l.source==='timer'?l.timerMin>0:l.t===1);
  const days=new Set(logs.map(l=>l.date)).size;
  const marked=(S.notes||[]).filter(n=>!n.demo&&n.type==='destaque').length;
  return [
    ['days5','i-today','Pegando o ritmo','Leia em 5 dias diferentes.',days,5],
    ['days15','i-today','Hábito em construção','Leia em 15 dias diferentes.',days,15],
    ['days30','i-today','Trinta encontros','Leia em 30 dias diferentes.',days,30],
    ['days60','i-today','Companhia de longa data','Leia em 60 dias diferentes.',days,60],
    ['timed1','i-today','No seu tempo','Registre a primeira sessão cronometrada.',sessions.length,1],
    ['timed5','i-today','Hora marcada','Registre 5 sessões cronometradas.',sessions.length,5],
    ['timed20','i-today','Tempo bem lido','Registre 20 sessões cronometradas.',sessions.length,20],
    ['timed50','i-today','Ritual de leitura','Registre 50 sessões cronometradas.',sessions.length,50],
    ['opened10','i-books','Novas histórias','Comece 10 livros diferentes.',j.started,10],
    ['opened25','i-books','Curiosidade sem fim','Comece 25 livros diferentes.',j.started,25],
    ['done10','i-book','Dez últimas páginas','Conclua 10 livros com registro de leitura.',j.finished,10],
    ['done20','i-book','Estante de memórias','Conclua 20 livros com registro de leitura.',j.finished,20],
    ['highlight5','i-note','Vale guardar','Anote 5 destaques de livros.',marked,5]
  ].map(([id,icon,name,desc,cur,t])=>({id,icon,name,desc,cur,t}));
}
const REWARD_CHANNEL='lume-conquistas';
let rewardDismiss=0;
const rewardPlugin=()=>window.Capacitor?.Plugins?.LocalNotifications;
function announceReadingReward(before,after,fresh){
  const leveled=after.level>before.level;
  const rank='Nível '+after.level+' · '+journeyRank(after.level);
  const title=leveled?S.petName+' subiu de nível!':fresh.length===1?'Nova conquista!':'Novas conquistas!';
  const details=[...(leveled?[rank]:[]),...fresh.map(a=>a.name)];
  const root=$('#reward-pop');
  if(root){
    root.innerHTML='<section class="reward-notice"><span class="reward-medal" aria-hidden="true">'+ic('i-trophy')+'</span><div>'
      +'<div role="status"><b>'+esc(title)+'</b><p>'+esc(details.slice(0,3).join(' · '))+(details.length>3?' e mais '+(details.length-3):'')+'</p></div>'
      +'<button type="button" class="btn btn-soft" data-act="reward-view">Ver conquistas</button></div>'
      +'<button type="button" class="btn reward-close" data-act="reward-close" aria-label="Fechar aviso">×</button></section>';
    clearTimeout(rewardDismiss);rewardDismiss=setTimeout(clearReward,9500);
  }
  if(S.achievementAlerts!==false)sendRewardNotification(title,details.join(' · '));
}
function clearReward(){
  clearTimeout(rewardDismiss);
  const root=$('#reward-pop');if(root)root.innerHTML='';
}
async function sendRewardNotification(title,body){
  const n=rewardPlugin();if(!n)return;
  const profile=stateKey;
  try{
    const permission=await n.checkPermissions();
    if(permission.display!=='granted'||profile!==stateKey||S.achievementAlerts===false)return;
    await n.createChannel({id:REWARD_CHANNEL,name:'Conquistas do Lume',importance:3});
    if(profile!==stateKey||S.achievementAlerts===false)return;
    await n.schedule({notifications:[{
      id:30000+Math.floor(Math.random()*1000000000),title,body,channelId:REWARD_CHANNEL,extra:{kind:'lume-achievement'}
    }]});
  }catch(e){/* O aviso dentro do Lume continua disponível. */}
}
function showAchievementTab(){
  clearReward();closeSheet();tab='ach';render();window.scrollTo(0,0);
}
document.addEventListener('click',async e=>{
  const a=e.target.closest('[data-act]');
  if(a?.dataset.act==='reward-view')showAchievementTab();
  if(a?.dataset.act==='reward-close')clearReward();
  if(a?.dataset.act!=='reward-alerts'||a.disabled)return;
  const n=rewardPlugin(),profile=stateKey;if(!n)return;
  a.disabled=true;
  try{
    let perm=await n.checkPermissions();
    if(perm.display!=='granted'){
      perm=await n.requestPermissions();
      if(perm.display!=='granted'){toast(['Permita notificações do Lume nos ajustes do Android.']);return;}
      if(stateKey!==profile)return;
      S.achievementAlerts=true;
    }else{
      if(stateKey!==profile)return;
      S.achievementAlerts=S.achievementAlerts===false;
    }
    save();if(a.isConnected)openSettings('reading');
  }catch(e){toast(['Não foi possível ajustar os avisos de conquistas.']);}
  finally{a.disabled=false;}
});
rewardPlugin()?.addListener('localNotificationActionPerformed',e=>{
  if(e.notification?.extra?.kind==='lume-achievement')showAchievementTab();
});
