const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf=n=>Number(n).toLocaleString('pt-BR');
const pl=(n,a,b)=>n===1?a:b;
const pad=n=>String(n).padStart(2,'0');
const dkey=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const addDays=(d,n)=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()+n);return x;};
const today=()=>dkey(new Date());
const uid=()=>Math.random().toString(36).slice(2,9);
const ic=(id,fill)=>'<svg class="i'+(fill?' fill':'')+'" aria-hidden="true"><use href="#'+id+'"/></svg>';

const KEY='lume-leitura-v1';
const STAGES=['Ovo','Filhote','Leitor','Sábio','Lendário'];
const CUTS=[0,30,200,600,1500];
let S=null, tab='today', ask=null, lastFocus=null, tt=null;

function load(){
  try{const raw=localStorage.getItem(KEY);if(raw){const s=JSON.parse(raw);if(s&&s.v===1)return s;}}catch(e){}
  return null;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}

function seed(){
  const now=new Date();
  const L=(back,bookId,min,pages,extra)=>({id:uid(),date:dkey(addDays(now,-back)),bookId:bookId,min:min,pages:pages,pts:min+pages+(extra||0)});
  return {v:1,goal:20,petName:'Tinta',demo:true,seen:null,
    books:[
      {id:'b1',title:'Dom Casmurro',author:'Machado de Assis',total:256,page:104,done:false},
      {id:'b2',title:'Iracema',author:'José de Alencar',total:160,page:160,done:true},
      {id:'b3',title:'Memórias Póstumas de Brás Cubas',author:'Machado de Assis',total:272,page:0,done:false}
    ],
    logs:[L(9,'b2',25,30,10),L(8,'b2',20,28,10),L(7,'b2',30,40,10),L(5,'b2',25,32,10),L(4,'b2',22,30,60),
          L(3,'b1',24,31,10),L(2,'b1',20,26,10),L(1,'b1',28,37,10),L(0,'b1',8,10,0)]};
}

const sum=(a,k)=>a.reduce((t,x)=>t+(x[k]||0),0);
const points=()=>sum(S.logs,'pts');
const minutesOn=k=>S.logs.reduce((t,l)=>l.date===k?t+l.min:t,0);
function stageOf(p){let s=0;for(let i=0;i<CUTS.length;i++){if(p>=CUTS[i])s=i;}return s;}
function streak(){
  let d=new Date();
  if(minutesOn(dkey(d))<S.goal)d=addDays(d,-1);
  let n=0;
  while(minutesOn(dkey(d))>=S.goal&&n<4000){n++;d=addDays(d,-1);}
  return n;
}
function longest(){
  const m={};S.logs.forEach(l=>{m[l.date]=(m[l.date]||0)+l.min;});
  const keys=Object.keys(m).filter(k=>m[k]>=S.goal).sort();
  let best=0,run=0,prev=null;
  keys.forEach(k=>{
    const d=new Date(k+'T12:00:00');
    if(prev&&Math.round((d-prev)/864e5)===1)run++;else run=1;
    if(run>best)best=run;prev=d;
  });
  return best;
}
function achs(){
  const m=sum(S.logs,'min'),pg=sum(S.logs,'pages'),done=S.books.filter(b=>b.done).length,ls=longest(),pts=points();
  const list=[
    {id:'first',icon:'i-book',name:'Primeira leitura',desc:'Registre sua primeira leitura.',cur:Math.min(S.logs.length,1),t:1},
    {id:'s3',icon:'i-flame',name:'Três dias firmes',desc:'Bata a meta 3 dias seguidos.',cur:ls,t:3},
    {id:'s7',icon:'i-flame',name:'Semana inteira',desc:'Bata a meta 7 dias seguidos.',cur:ls,t:7},
    {id:'s30',icon:'i-flame',name:'Mês de leitura',desc:'Bata a meta 30 dias seguidos.',cur:ls,t:30},
    {id:'m100',icon:'i-today',name:'100 minutos',desc:'Some 100 minutos de leitura.',cur:m,t:100},
    {id:'m1000',icon:'i-today',name:'Mil minutos',desc:'Some 1.000 minutos de leitura.',cur:m,t:1000},
    {id:'p100',icon:'i-book',name:'100 páginas',desc:'Leia 100 páginas no total.',cur:pg,t:100},
    {id:'p1000',icon:'i-book',name:'1.000 páginas',desc:'Leia 1.000 páginas no total.',cur:pg,t:1000},
    {id:'b1',icon:'i-check',name:'Primeiro livro',desc:'Termine um livro.',cur:done,t:1},
    {id:'b5',icon:'i-books',name:'Estante cheia',desc:'Termine 5 livros.',cur:done,t:5},
    {id:'pet3',icon:'i-star',name:'Sábio da estante',desc:'Leve '+S.petName+' ao estágio Sábio.',cur:pts,t:CUTS[3]}
  ];
  return list.map(a=>({id:a.id,icon:a.icon,name:a.name,desc:a.desc,t:a.t,ok:a.cur>=a.t,cur:Math.min(a.cur,a.t)}));
}
const unlockedIds=()=>achs().filter(a=>a.ok).map(a=>a.id);

function pet(stage,mood){
  const sp=(x,y,s)=>'<path d="M0-9Q0 0 9 0Q0 0 0 9Q0 0-9 0Q0 0 0-9Z" transform="translate('+x+' '+y+') scale('+s+')" fill="var(--accent)"/>';
  let o='<svg viewBox="0 0 200 200" role="img" aria-label="'+esc(S.petName)+', estágio '+STAGES[stage]+'">';
  if(stage===0){
    o+='<g class="bob"><ellipse cx="100" cy="180" rx="44" ry="8" fill="var(--shadow)"/>'
     +'<path d="M100 26C139 26 162 88 162 126C162 158 135 178 100 178C65 178 38 158 38 126C38 88 61 26 100 26Z" fill="var(--pet)"/>'
     +'<circle cx="78" cy="78" r="7" fill="var(--pet-deep)" opacity=".35"/><circle cx="126" cy="64" r="5" fill="var(--pet-deep)" opacity=".35"/>'
     +'<circle cx="122" cy="96" r="8" fill="var(--pet-deep)" opacity=".35"/><circle cx="70" cy="150" r="6" fill="var(--pet-deep)" opacity=".35"/>'
     +'<path d="M52 128l16-14 14 16 16-16 14 16 16-16 16 14 14-14" fill="none" stroke="var(--eye)" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/></g></svg>';
    return o;
  }
  if(stage===4){
    o+='<circle cx="100" cy="112" r="92" fill="var(--accent)" opacity=".16"/>'+sp(26,40,1.2)+sp(176,58,1)+sp(160,18,.8)+sp(40,150,.7);
  }
  o+='<g class="bob"><ellipse cx="100" cy="182" rx="54" ry="8" fill="var(--shadow)"/>';
  o+='<ellipse cx="38" cy="130" rx="10" ry="19" transform="rotate(14 38 130)" fill="var(--pet-deep)"/><ellipse cx="162" cy="130" rx="10" ry="19" transform="rotate(-14 162 130)" fill="var(--pet-deep)"/>';
  if(stage>=2)o+='<path d="M56 72L62 42L86 62Z" fill="var(--pet-deep)"/><path d="M144 72L138 42L114 62Z" fill="var(--pet-deep)"/>';
  o+='<ellipse cx="100" cy="116" rx="64" ry="60" fill="var(--pet)"/><ellipse cx="100" cy="138" rx="40" ry="34" fill="var(--pet-belly)"/>';
  o+='<ellipse cx="74" cy="178" rx="15" ry="7" fill="var(--pet-deep)"/><ellipse cx="126" cy="178" rx="15" ry="7" fill="var(--pet-deep)"/>';
  if(mood==='happy'){
    o+='<path d="M64 108Q78 90 92 108" fill="none" stroke="var(--pupil)" stroke-width="5" stroke-linecap="round"/><path d="M108 108Q122 90 136 108" fill="none" stroke="var(--pupil)" stroke-width="5" stroke-linecap="round"/>';
  }else{
    o+='<circle cx="78" cy="104" r="15" fill="var(--eye)"/><circle cx="122" cy="104" r="15" fill="var(--eye)"/>'
     +'<circle cx="80" cy="106" r="7" fill="var(--pupil)"/><circle cx="124" cy="106" r="7" fill="var(--pupil)"/>'
     +'<circle cx="83" cy="102" r="2.5" fill="var(--eye)"/><circle cx="127" cy="102" r="2.5" fill="var(--eye)"/>';
    if(mood==='sleepy')o+='<path d="M62 105a16 16 0 0 1 32 0Z" fill="var(--pet)"/><path d="M106 105a16 16 0 0 1 32 0Z" fill="var(--pet)"/><path d="M62 105h32M106 105h32" stroke="var(--pet-deep)" stroke-width="3" stroke-linecap="round"/>';
  }
  if(stage>=3)o+='<circle cx="78" cy="104" r="19" fill="none" stroke="var(--pupil)" stroke-width="4"/><circle cx="122" cy="104" r="19" fill="none" stroke="var(--pupil)" stroke-width="4"/><path d="M97 104h6" stroke="var(--pupil)" stroke-width="4"/>';
  o+='<path d="M93 118L107 118L100 129Z" fill="var(--accent)"/><circle cx="60" cy="124" r="6" fill="var(--blush)" opacity=".55"/><circle cx="140" cy="124" r="6" fill="var(--blush)" opacity=".55"/>';
  if(stage>=3)o+='<path d="M94 46h12v26l-6-6-6 6Z" fill="var(--accent)"/>';
  o+='<path d="M58 150Q80 142 100 152Q120 142 142 150L142 178Q120 170 100 180Q80 170 58 178Z" fill="var(--accent)"/>'
   +'<path d="M64 152Q82 146 98 154L98 173Q82 166 64 172Z" fill="var(--page)"/><path d="M136 152Q118 146 102 154L102 173Q118 166 136 172Z" fill="var(--page)"/>'
   +'<path d="M70 160Q82 156 92 160M70 166Q82 162 92 166M108 160Q118 156 130 160M108 166Q118 162 130 166" fill="none" stroke="var(--ink-3)" stroke-width="2" stroke-linecap="round"/>';
  o+='</g></svg>';
  return o;
     }

