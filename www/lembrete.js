/* Lembrete diário para ler: notificação no app instalado e alternativas na web */
const LN=()=>window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications;
const lem=()=>Object.assign({on:false,h:20,m:0},S.lembrete||{});
const hhmm=l=>pad(l.h)+':'+pad(l.m);
const MSGS=['Hora de ler um pouquinho! Seu mascote está te esperando.','Que tal 10 minutos de leitura hoje?','Sua sequência de leitura agradece. Vamos ler?'];
async function lemAgendar(){
  const l=lem(),n=LN();
  if(!n)return 'web';
  try{
    await n.cancel({notifications:[{id:1}]});
    if(!l.on)return 'off';
    const p=await n.requestPermissions();
    if(p.display!=='granted')return 'negado';
    await n.schedule({notifications:[{id:1,title:'Lume Leitura',body:MSGS[new Date().getDate()%MSGS.length],schedule:{on:{hour:l.h,minute:l.m},allowWhileIdle:true}}]});
    return 'ok';
  }catch(e){return 'erro';}
}
let lemT=null;
function lemWeb(){
  clearTimeout(lemT);const l=lem();
  if(LN()||!l.on||!('Notification' in window)||Notification.permission!=='granted')return;
  const d=new Date();d.setHours(l.h,l.m,0,0);let ms=d-Date.now();if(ms<0)return;
  lemT=setTimeout(()=>{if(minutesOn(today())===0){try{new Notification('Lume Leitura',{body:MSGS[0],icon:'icones/icone-192.png'});}catch(e){}}},Math.min(ms,2147000000));
}
function lemIcs(){
  const l=lem(),d=new Date(),z=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'T'+pad(l.h)+pad(l.m)+'00';
  const t=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Lume Leitura//PT','BEGIN:VEVENT','UID:lume-leitura-lembrete','DTSTART:'+z,'DTEND:'+z,'RRULE:FREQ=DAILY','SUMMARY:Hora de ler (Lume Leitura)','BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:Hora de ler um pouquinho!','TRIGGER:PT0M','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/calendar'}));a.download='lembrete-lume.ics';document.body.appendChild(a);a.click();a.remove();
}
function lemHtml(){
  const l=lem(),nat=!!LN();
  return '<div class="look" id="lem-zone"><label>Lembrete para ler</label>'
   +'<div class="row lem-r"><button type="button" class="chip" data-act="lem-toggle" aria-pressed="'+l.on+'">'+(l.on?'Ligado':'Desligado')+'</button>'
   +'<input id="lem-h" type="time" value="'+hhmm(l)+'" aria-label="Horário do lembrete"></div>'
   +'<p class="muted" id="lem-msg">'+(nat?'Você receberá uma notificação todos os dias nesse horário.':'No navegador, a notificação só aparece com o app aberto. Para um aviso de verdade, use o botão abaixo e adicione ao calendário do celular.')+'</p>'
   +(nat?'':'<button type="button" class="btn btn-soft btn-block" data-act="lem-ics">Adicionar lembrete ao calendário</button>')+'</div>';
}
function lemMsg(t){const m=$('#lem-msg');if(m)m.textContent=t;}
document.addEventListener('click',async function(e){
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act;
  if(act==='lem-ics'){lemIcs();return;}
  if(act!=='lem-toggle')return;
  const l=lem();l.on=!l.on;S.lembrete=l;save();
  if(l.on&&!LN()&&'Notification' in window&&Notification.permission==='default'){try{await Notification.requestPermission();}catch(x){}}
  const r=await lemAgendar();lemWeb();
  const z=$('#lem-zone');if(z)z.outerHTML=lemHtml();
  if(r==='negado')lemMsg('A permissão de notificação foi negada. Ative nas configurações do celular.');
  else if(r==='ok')toast(['Lembrete ligado para '+hhmm(l)]);
});
document.addEventListener('change',async function(e){
  if(e.target.id!=='lem-h'||!e.target.value)return;
  const p=e.target.value.split(':'),l=lem();l.h=+p[0];l.m=+p[1];S.lembrete=l;save();
  await lemAgendar();lemWeb();
});
const _viewToday3=viewToday;
viewToday=function(){
  const h=_viewToday3(),l=lem(),d=new Date();
  if(!l.on||minutesOn(today())>0||d.getHours()*60+d.getMinutes()<l.h*60+l.m)return h;
  return '<div class="demo lem-b"><p>Hora de ler! Você ainda não leu hoje.</p><button class="btn btn-ghost" data-act="log">Registrar leitura</button></div>'+h;
};
lemAgendar();lemWeb();
