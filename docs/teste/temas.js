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
const onAcc=(h,s,l)=>lumi(hsl2rgb(h,s,l))>.179?'#000000':'#FFFFFF';
const H=(h,s,l)=>'hsl('+h+' '+s+'% '+l+'%)';
function vars(t){
  const {h,p}=t,s=p?50:t.s,as=p?75:t.as,al=p?80:t.al;
  return Object.entries({
    bg:H(h,p?48:s*.65,p?96:93),surface:H(h,s*.48,99), 'surface-2':H(h,s*.78,p?92:87),
    line:H(h,s*.48,p?86:77), ink:H(h,24,15),'ink-2':H(h,21,34),'ink-3':H(h,18,43),
    pet:H(h,s,p?56:42),'pet-deep':H(h,s,p?40:30),'pet-belly':H(h,s,93),
    'on-pet':onAcc(h,s,p?56:42),'pet-wash':H(h,s,p?94:88),'pet-text':H(h,s,26),accent:H(h,as,al),'on-accent':onAcc(h,as,al)
  }).map(([name,value])=>'--'+name+':'+value).join(';');
}
const temaAtual=()=>TEMAS.find(x=>x.id===(S&&S.tema))||TEMAS[0];
function applyTema(){
  let st=$('#tema-css');
  const t=temaAtual();
  if(!st){st=document.createElement('style');st.id='tema-css';document.head.appendChild(st);}
  st.textContent=':root{'+vars(t)+'}';
  const m=$('meta[name=theme-color]');
  if(m)m.setAttribute('content',t.p?H(t.h,50,56):H(t.h,t.s,t.al));
}
let lookDraft=null;
const swColor=t=>t.p?H(t.h,75,80):H(t.h,t.as,t.al);
const swBtn=t=>'<button type="button" class="sw" data-act="tema-set" data-v="'+t.id+'" aria-pressed="'+((lookDraft?.tema||temaAtual().id)===t.id)+'" aria-label="'+t.n+'"><i style="background:'+swColor(t)+'"></i><span>'+t.n+'</span></button>';
function paletteHtml(){
  return '<section class="look" id="look-zone"><h3>Cores do app</h3><label>Tons pastel</label><div class="swatches">'+TEMAS.filter(t=>t.p).map(swBtn).join('')
   +'</div><label>Cores vivas</label><div class="swatches">'+TEMAS.filter(t=>!t.p).map(swBtn).join('')
   +'</div><button class="btn btn-primary btn-block" type="button" data-act="look-save">Salvar cores</button></section>';
}
document.addEventListener('click',function(e){
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act;
  if(act==='look-open'){
    lookDraft={tema:temaAtual().id};
    openSheet('<h2 id="sh-t">Aparência</h2>'+paletteHtml()+'<button class="btn btn-quiet btn-block" data-act="settings">Voltar aos ajustes</button>');
  }
  if(act==='look-save'&&lookDraft){
    const before=S.tema;S.tema=lookDraft.tema;
    if(!save()){S.tema=before;toast(['Não foi possível salvar a aparência']);return;}
    applyTema();closeSheet();render();toast(['Cores salvas']);
  }
  if(act==='tema-set'&&lookDraft){
    lookDraft.tema=a.dataset.v;const z=$('#look-zone');if(z)z.outerHTML=paletteHtml();
  }
});
if(S.mascote==='avatar'){S.mascote='coruja';save();}
applyTema();
