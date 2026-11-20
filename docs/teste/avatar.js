/* Avatar: o leitor cria um mascote parecido com ele mesmo */
const AV_PELE=['#FDDCC4','#F5C29B','#DDA070','#B97A4E','#8A5634','#5E3A22'];
const AV_COR=['#2B1D14','#5A3A22','#A8652C','#E2B04A','#C8472F','#8B5CF6','#F58BC0','#9CA3AF'];
const AV_ROUPA=['#B79CF2','#F7A8D0','#8EC5FF','#8FDB9B','#FFD84D','#FF9E7A','#4B4B63'];
const AV_EST=[['curto','Curto'],['longo','Longo'],['cacheado','Cacheado'],['coque','Coque'],['tranca','Tranças'],['careca','Sem cabelo']];
const AV_ACC=[['nenhum','Nenhum'],['oculos','Óculos'],['laco','Laço'],['bone','Boné']];
const AV_PAD={pele:1,est:'longo',cor:1,roupa:0,acc:'nenhum'};
const avOpt=()=>Object.assign({},AV_PAD,S.avatar||{});

function petAvatar(stage,mood){
  const a=avOpt(),pele=AV_PELE[a.pele]||AV_PELE[1],cor=AV_COR[a.cor]||AV_COR[0],rou=AV_ROUPA[a.roupa]||AV_ROUPA[0];
  let o=svgHead(stage);
  if(stage===4)o+=aura();
  o+='<g class="bob"><ellipse cx="100" cy="184" rx="52" ry="8" fill="var(--shadow)"/>';
  o+='<g'+(stage===1?' transform="translate(100 184) scale(.82) translate(-100 -184)"':'')+'>';
  const e=a.est;
  if(e==='longo')o+='<path d="M52 92Q50 38 100 38Q150 38 148 92L154 156Q100 168 46 156Z" fill="'+cor+'"/>';
  if(e==='cacheado')for(let i=0;i<11;i++){const t=Math.PI*(1.08+i*.084*1.0);o+='<circle cx="'+(100+Math.cos(t)*48).toFixed(1)+'" cy="'+(92+Math.sin(t)*44).toFixed(1)+'" r="17" fill="'+cor+'"/>';}
  if(e==='coque')o+='<circle cx="100" cy="40" r="19" fill="'+cor+'"/>';
  if(e==='tranca')o+='<path d="M58 100Q46 130 56 160M142 100Q154 130 144 160" '+stk(cor,13)+'/><circle cx="56" cy="162" r="6" fill="var(--accent)"/><circle cx="144" cy="162" r="6" fill="var(--accent)"/>';
  o+='<path d="M40 192Q40 148 100 148Q160 148 160 192Z" fill="'+rou+'"/><rect x="86" y="128" width="28" height="26" rx="10" fill="'+pele+'"/>';
  o+='<circle cx="54" cy="96" r="9" fill="'+pele+'"/><circle cx="146" cy="96" r="9" fill="'+pele+'"/><circle cx="100" cy="92" r="46" fill="'+pele+'"/>';
  if(e!=='careca'){
    o+=(e==='curto'||e==='coque')
      ?'<path d="M54 90Q50 44 100 44Q150 44 146 90Q136 64 100 64Q64 64 54 90Z" fill="'+cor+'"/>'
      :'<path d="M54 94Q48 40 100 42Q152 40 146 94Q138 62 104 60Q84 74 54 94Z" fill="'+cor+'"/>';
    if(e==='cacheado')o+='<circle cx="68" cy="62" r="13" fill="'+cor+'"/><circle cx="100" cy="52" r="14" fill="'+cor+'"/><circle cx="132" cy="62" r="13" fill="'+cor+'"/>';
  }
  if(mood==='happy')o+='<path d="M72 98Q80 88 88 98M112 98Q120 88 128 98" '+stk('#3B2A22',4)+'/>';
  else{
    o+='<circle cx="80" cy="98" r="6.5" fill="#3B2A22"/><circle cx="120" cy="98" r="6.5" fill="#3B2A22"/><circle cx="82" cy="96" r="2" fill="#fff"/><circle cx="122" cy="96" r="2" fill="#fff"/>';
    if(mood==='sleepy')o+='<path d="M72 99Q80 104 88 99M112 99Q120 104 128 99" '+stk('#3B2A22',3.5)+'/>';
  }
  o+='<circle cx="68" cy="114" r="7" fill="#F28FA4" opacity=".4"/><circle cx="132" cy="114" r="7" fill="#F28FA4" opacity=".4"/>';
  o+=mood==='happy'?'<path d="M88 116Q100 134 112 116Z" fill="#8A2F3E"/>':(mood==='sleepy'?'<path d="M94 120h12" '+stk('#8A4A44',3.5)+'/>':'<path d="M90 116Q100 126 110 116" '+stk('#8A4A44',3.5)+'/>');
  if(a.acc==='oculos'||stage>=3)o+='<circle cx="80" cy="98" r="14" '+stk('#3B2A22',3.5)+'/><circle cx="120" cy="98" r="14" '+stk('#3B2A22',3.5)+'/><path d="M94 98h12" '+stk('#3B2A22',3.5)+'/>';
  if(a.acc==='laco')o+='<path d="M128 52l-18-8v18ZM128 52l18-8v18Z" fill="var(--accent)" stroke="var(--on-accent)" stroke-width="2" stroke-linejoin="round"/><circle cx="128" cy="53" r="5" fill="var(--on-accent)"/>';
  if(a.acc==='bone')o+='<path d="M54 74Q56 38 100 38Q144 38 146 74Z" fill="var(--accent)"/><path d="M140 70H176Q170 80 146 80Z" fill="var(--accent)" stroke="var(--on-accent)" stroke-width="2" stroke-linejoin="round"/>';
  if(stage>=2)o+='<path d="M58 158Q80 150 100 160Q120 150 142 158L142 186Q120 178 100 188Q80 178 58 186Z" fill="var(--accent)"/><path d="M64 160Q82 154 98 162L98 181Q82 174 64 180Z" fill="var(--page)"/><path d="M136 160Q118 154 102 162L102 181Q118 174 136 180Z" fill="var(--page)"/>';
  if(stage>=4)o+='<path d="M78 50l6-18 16 12 16-12 6 18Z" fill="var(--accent)" stroke="var(--on-accent)" stroke-width="2" stroke-linejoin="round"/>';
  return o+'</g></g></svg>';
}
const _petOf=petOf;
petOf=function(k,s,m){return k==='avatar'&&s>0?petAvatar(s,m):_petOf(k,s,m);};

function avSwatches(act,list,cur){
  return '<div class="chips">'+list.map((c,i)=>'<button type="button" class="sw av-c" data-act="'+act+'" data-v="'+i+'" aria-pressed="'+(cur===i)+'" aria-label="Cor '+(i+1)+'"><i style="background:'+c+'"></i></button>').join('')+'</div>';
}
function avChips(act,list,cur){
  return '<div class="chips">'+list.map(c=>'<button type="button" class="chip" data-act="'+act+'" data-v="'+c[0]+'" aria-pressed="'+(cur===c[0])+'">'+c[1]+'</button>').join('')+'</div>';
}
function avBody(){
  const a=avOpt();
  return '<div class="av-prev">'+petAvatar(2,'happy').replace(/role="img" aria-label="[^"]*"/,'aria-hidden="true"')+'</div>'
   +'<label>Tom de pele</label>'+avSwatches('av-pele',AV_PELE,a.pele)
   +'<label>Cabelo</label>'+avChips('av-est',AV_EST,a.est)
   +'<label>Cor do cabelo</label>'+avSwatches('av-cor',AV_COR,a.cor)
   +'<label>Roupa</label>'+avSwatches('av-roupa',AV_ROUPA,a.roupa)
   +'<label>Acessório</label>'+avChips('av-acc',AV_ACC,a.acc);
}
function openAvatar(){
  openSheet('<h2 id="sh-t">Meu avatar</h2><p class="muted">Monte um mascote com a sua cara. Ele cresce junto com a sua leitura.</p><div id="av-body">'+avBody()+'</div>'
   +'<div class="row"><button class="btn btn-primary" type="button" data-act="av-ok">Pronto</button></div>');
}
document.addEventListener('click',function(e){
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act;
  if(act==='av-open'||(act==='masc-set'&&a.dataset.v==='avatar'&&!S.avatar)){openAvatar();return;}
  if(act==='av-ok'){closeSheet();render();return;}
  const m={'av-pele':['pele',1],'av-cor':['cor',1],'av-roupa':['roupa',1],'av-est':['est',0],'av-acc':['acc',0]}[act];
  if(!m)return;
  S.avatar=avOpt();S.avatar[m[0]]=m[1]?+a.dataset.v:a.dataset.v;S.mascote='avatar';
  save();const b=$('#av-body');if(b)b.innerHTML=avBody();
});
