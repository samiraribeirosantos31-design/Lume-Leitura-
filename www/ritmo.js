/* Semáforo de ritmo: compara os minutos lidos nos últimos 7 dias com a meta */
const SEM=[
 {id:'vermelho',n:'Lento demais',c:'#E5484D',t:'Você leu bem menos do que a meta. Que tal um bloco curto de 10 minutos hoje?'},
 {id:'verde',n:'No ritmo',c:'#30A46C',t:'Seu ritmo está equilibrado. Continue assim!'},
 {id:'amarelo',n:'Acelerado',c:'#F5B700',t:'Você está lendo acima da meta. Ótimo! Lembre de descansar e aproveitar o que leu.'},
 {id:'roxo',n:'Rápido demais',c:'#8B5CF6',t:'Muito acima da meta. Cuidado com o cansaço, e pense em subir a meta diária.'}
];
function ritmoRatio(){
  const alvo=Math.max(1,S.goal)*7;let m=0;
  for(let i=0;i<7;i++)m+=minutesOn(dkey(addDays(new Date(),-i)));
  return {m:m,alvo:alvo,r:m/alvo};
}
function ritmoEstado(r){return r<0.6?0:(r<=1.25?1:(r<=2?2:3));}
function semaforoCard(){
  const x=ritmoRatio(),i=ritmoEstado(x.r),g=S.goal;
  const faixas=[
    'menos de '+Math.round(g*7*.6)+' min na semana',
    'de '+Math.round(g*7*.6)+' a '+Math.round(g*7*1.25)+' min',
    'de '+(Math.round(g*7*1.25)+1)+' a '+Math.round(g*14)+' min',
    'mais de '+Math.round(g*14)+' min'
  ];
  const luz=SEM.map((s,k)=>'<span class="lz'+(k===i?' on':'')+'" style="--c:'+s.c+'"></span>').join('');
  const leg=SEM.map((s,k)=>'<li'+(k===i?' class="on"':'')+'><i style="background:'+s.c+'"></i><div><b>'+s.n+'</b><span>'+faixas[k]+'</span></div></li>').join('');
  return '<section class="card sem"><div class="chart-h"><h2>Semáforo de ritmo</h2><span class="muted">últimos 7 dias</span></div>'
   +'<div class="sem-top"><div class="lzs" aria-hidden="true">'+luz+'</div><div><p class="sem-n" style="color:'+SEM[i].c+'"><b>'+SEM[i].n+'</b></p><p class="muted">'+nf(x.m)+' min lidos, de uma meta de '+nf(x.alvo)+' min ('+g+' por dia).</p></div></div>'
   +'<p class="muted">'+SEM[i].t+'</p>'
   +'<details><summary>O que significam as cores?</summary><ul class="sem-l">'+leg+'</ul><p class="muted">O cálculo compara quanto você leu nos últimos 7 dias com a sua meta diária multiplicada por 7.</p></details></section>';
}
const _viewToday2=viewToday;
viewToday=function(){
  const h=_viewToday2(),key='<section class="card goal">',i=h.indexOf(key);
  return i>=0?h.slice(0,i)+semaforoCard()+h.slice(i):h+semaforoCard();
};
