/* Cores do app, nome do mascote e tela de aparência nos Ajustes */
const TEMAS=[
 {id:'lilas',n:'Lilás',h:268,p:1},
 {id:'rosapastel',n:'Rosa bebê',h:338,p:1},
 {id:'pessego',n:'Pêssego',h:18,p:1},
 {id:'manteiga',n:'Manteiga',h:48,p:1},
 {id:'menta',n:'Menta',h:152,p:1},
 {id:'ceu',n:'Azul céu',h:205,p:1},
 {id:'lavanda',n:'Lavanda',h:244,p:1},
 {id:'roxo',n:'Roxo',h:270,s:50,as:70,al:52},
 {id:'laranja',n:'Laranja',h:26,s:80,as:95,al:50},
 {id:'preto',n:'Preto',h:220,s:8,as:10,al:15,ad:86},
 {id:'rosa',n:'Rosa',h:332,s:62,as:80,al:56},
 {id:'vermelho',n:'Vermelho',h:2,s:65,as:78,al:48},
 {id:'amarelo',n:'Amarelo',h:46,s:80,as:96,al:52},
 {id:'verde',n:'Verde',h:140,s:50,as:60,al:38},
 {id:'marrom',n:'Marrom',h:24,s:42,as:48,al:38},
 {id:'azul',n:'Azul',h:214,s:70,as:80,al:50},
 {id:'turquesa',n:'Turquesa',h:174,s:55,as:70,al:38}
];
function hsl2rgb(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return[f(0),f(8),f(4)];}
const lumi=c=>{const t=c.map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*t[0]+.7152*t[1]+.0722*t[2];};
const onAcc=(h,s,l)=>lumi(hsl2rgb(h,s,l))>.35?'#1A1300':'#FFFFFF';
const H=(h,s,l)=>'hsl('+h+' '+s+'% '+l+'%)';
function vars(t,d){
  const h=t.h;
  if(t.p)return '--pet:'+H(h,d?55:50,d?70:56)+';--pet-deep:'+H(h,d?40:45,d?48:40)+';--pet-belly:'+H(h,d?60:70,d?92:94)+';--pet-wash:'+H(h,d?25:70,d?17:95)+';--pet-text:'+H(h,d?70:45,d?82:32)
   +';--accent:'+H(h,d?55:75,d?72:80)+';--on-accent:'+(d?'#1B1230':'#2A1F3D')+(d?'':';--bg:'+H(h,50,96)+';--surface-2:'+H(h,35,92));
  const s=t.s,al=d?(t.ad||Math.min(t.al+12,72)):t.al;
  return '--pet:'+H(h,s,d?60:36)+';--pet-deep:'+H(h,s,d?42:26)+';--pet-belly:'+H(h,55,90)+';--pet-wash:'+H(h,d?35:55,d?16:93)+';--pet-text:'+H(h,d?70:s,d?76:26)
   +';--accent:'+H(h,t.as,al)+';--on-accent:'+onAcc(h,t.as,al);
}
const temaAtual=()=>TEMAS.find(x=>x.id===(S&&S.tema))||TEMAS[0];
function applyTema(){
  let st=$('#tema-css');
  const t=temaAtual();
  if(!st){st=document.createElement('style');st.id='tema-css';document.head.appendChild(st);}
  st.textContent=':root{'+vars(t,false)+'}@media (prefers-color-scheme:dark){:root{'+vars(t,true)+'}}';
  const m=$('meta[name=theme-color]');
  if(m)m.setAttribute('content',t.p?H(t.h,50,56):H(t.h,t.s,t.al));
}
const swColor=t=>t.p?H(t.h,75,80):H(t.h,t.as,t.al);
const swBtn=t=>'<button type="button" class="sw" data-act="tema-set" data-v="'+t.id+'" aria-pressed="'+(temaAtual().id===t.id)+'" aria-label="'+t.n+'"><i style="background:'+swColor(t)+'"></i><span>'+t.n+'</span></button>';
function lookHtml(){
  const mc=S.mascote||'coruja';
  return '<div class="look" id="look-zone"><label>Tons pastel</label><div class="swatches">'+TEMAS.filter(t=>t.p).map(swBtn).join('')
   +'</div><label>Cores vivas</label><div class="swatches">'+TEMAS.filter(t=>!t.p).map(swBtn).join('')
   +'</div><label>Mascote</label><div class="mascs">'
   +MASC.map(m=>'<button type="button" class="mc" data-act="masc-set" data-v="'+m[0]+'" aria-pressed="'+(mc===m[0])+'" aria-label="'+m[1]+'"><div class="mc-i">'
     +petOf(m[0],2,'normal').replace(/role="img" aria-label="[^"]*"/,'aria-hidden="true"')+'</div><span>'+m[1]+'</span></button>').join('')
   +'</div>'+(mc==='avatar'?'<button class="btn btn-soft btn-block" type="button" data-act="av-open">Editar meu avatar</button>':'')+'</div>';
}
const _openSettings=openSettings;
openSettings=function(){
  _openSettings();
  const z=$('#wipe-zone');if(z)z.insertAdjacentHTML('beforebegin',lookHtml());
};
function openNome(){
  openSheet('<h2 id="sh-t">Nome do mascote</h2><form id="form-nome" novalidate><label for="nm-t">Como ele se chama?</label><input id="nm-t" type="text" maxlength="14" autocomplete="off" value="'+esc(S.petName)+'">'
   +'<div class="row"><button class="btn btn-primary" type="submit">Salvar</button><button class="btn btn-ghost" type="button" data-act="close">Cancelar</button></div></form>','nm-t');
}
document.addEventListener('click',function(e){
  const h=e.target.closest('.pet-card h2');if(h){openNome();return;}
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act;
  if(act!=='tema-set'&&act!=='masc-set')return;
  if(act==='tema-set')S.tema=a.dataset.v;else S.mascote=a.dataset.v;
  save();applyTema();
  const z=$('#look-zone');if(z)z.outerHTML=lookHtml();
  render();
});
document.addEventListener('submit',function(e){
  if(e.target.id!=='form-nome')return;
  S.petName=($('#nm-t').value||'').trim()||'Mascote';save();closeSheet();render();toast(['Nome salvo: '+S.petName]);
});
if(S.petName==='Tinta'){S.petName='Mascote';save();}
applyTema();
