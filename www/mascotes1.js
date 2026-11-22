/* Mascotes (parte 1): base comum e bichinhos de corpo redondo */
const MASC=[['coruja','Coruja'],['gato','Gato'],['cachorro','Cachorro'],['coelho','Coelho'],['panda','Panda'],['urso','Urso'],['raposa','Raposa'],['porquinho','Porquinho'],['pinguim','Pinguim'],['tigre','Tigre'],['leao','Leão'],['onca','Onça'],['borboleta','Borboleta'],['capivara','Capivara'],['axolote','Axolote'],['lontra','Lontra']];
const _petCoruja=pet;
const AN={};
const spk=(x,y,s)=>'<path d="M0-9Q0 0 9 0Q0 0 0 9Q0 0-9 0Q0 0 0-9Z" transform="translate('+x+' '+y+') scale('+s+')" fill="var(--accent)"/>';
const aura=()=>'<circle cx="100" cy="112" r="92" fill="var(--accent)" opacity=".16"/>'+spk(26,40,1.2)+spk(176,58,1)+spk(160,18,.8)+spk(40,150,.7);
const svgHead=(st)=>'<svg viewBox="0 0 200 200" role="img" aria-label="'+esc(S.petName)+', estágio '+STAGES[st]+'">';
const stk=(c,w)=>'fill="none" stroke="'+c+'" stroke-width="'+(w||3)+'" stroke-linecap="round" stroke-linejoin="round"';

function eyesOf(mood,c){
  if(mood==='blink')return '<path d="M65 103q13 12 26 0m18 0q13 12 26 0" '+stk(c.arc||'var(--pupil)',4)+'/>';
  if(mood==='happy')return '<path d="M64 108Q78 90 92 108" '+stk(c.arc||'var(--pupil)',5)+'/><path d="M108 108Q122 90 136 108" '+stk(c.arc||'var(--pupil)',5)+'/>';
  let o='<circle cx="78" cy="104" r="15" fill="var(--eye)"/><circle cx="122" cy="104" r="15" fill="var(--eye)"/>'
   +'<circle cx="80" cy="106" r="7" fill="var(--pupil)"/><circle cx="124" cy="106" r="7" fill="var(--pupil)"/>'
   +'<circle cx="83" cy="102" r="2.5" fill="var(--eye)"/><circle cx="127" cy="102" r="2.5" fill="var(--eye)"/>';
  if(mood==='sleepy')o+='<path d="M62 105a16 16 0 0 1 32 0Z" fill="'+(c.lid||c.fur)+'"/><path d="M106 105a16 16 0 0 1 32 0Z" fill="'+(c.lid||c.fur)+'"/><path d="M62 105h32M106 105h32" '+stk('var(--pet-deep)',3)+'/>';
  return o;
}
function petAnimal(kind,stage,mood){
  const c=AN[kind];
  let o=svgHead(stage);
  if(stage===4)o+=aura();
  if(stage>=3)o+='<circle cx="100" cy="105" r="89" fill="var(--accent)" opacity=".23"/>';
  o+='<g class="bob"><ellipse cx="100" cy="182" rx="54" ry="8" fill="var(--shadow)"/>';
  o+='<g'+(stage===1?' transform="translate(100 182) scale(.82) translate(-100 -182)"':'')+'>';
  if(stage>=3)o+='<path d="M48 119Q100 146 152 119L176 174Q100 192 24 174Z" fill="var(--pet-deep)"/>';
  o+=c.back(stage);
  o+='<ellipse cx="100" cy="116" rx="64" ry="60" fill="'+c.fur+'"/><ellipse cx="100" cy="140" rx="38" ry="32" fill="'+c.belly+'"/>';
  o+='<ellipse cx="74" cy="178" rx="15" ry="7" fill="'+c.feet+'"/><ellipse cx="126" cy="178" rx="15" ry="7" fill="'+c.feet+'"/>';
  o+=c.mark();
  o+=eyesOf(mood,c);
  o+=c.face();
  if(mood==='speak')o+='<ellipse cx="100" cy="138" rx="8" ry="6" fill="var(--pupil)"/>';
  o+='<circle cx="60" cy="126" r="6" fill="var(--blush)" opacity=".5"/><circle cx="140" cy="126" r="6" fill="var(--blush)" opacity=".5"/>';
  if(stage>=3)o+='<circle cx="78" cy="104" r="19" '+stk('var(--pupil)',4)+'/><circle cx="122" cy="104" r="19" '+stk('var(--pupil)',4)+'/><path d="M97 104h6" '+stk('var(--pupil)',4)+'/>';
  if(stage>=2)o+='<path d="M58 152Q80 144 100 154Q120 144 142 152L142 180Q120 172 100 182Q80 172 58 180Z" fill="var(--accent)"/>'
   +'<path d="M64 154Q82 148 98 156L98 175Q82 168 64 174Z" fill="var(--page)"/><path d="M136 154Q118 148 102 156L102 175Q118 168 136 174Z" fill="var(--page)"/>'
   +'<path d="M70 162Q82 158 92 162M70 168Q82 164 92 168M108 162Q118 158 130 162M108 168Q118 164 130 168" '+stk('var(--ink-3)',2)+'/>';
  if(stage===3)o+='<path d="M75 64h50l-8-17H83Z" fill="var(--pet-deep)"/><path d="M67 63h66v6H67Z" fill="var(--accent)"/>';
  if(stage>=4)o+='<path d="M78 56l6-18 16 12 16-12 6 18Z" fill="var(--accent)" stroke="var(--on-accent)" stroke-width="2" stroke-linejoin="round"/>';
  return o+'</g></g></svg>';
}
const earsRound=(fur,inner,y,r)=>'<circle cx="54" cy="'+y+'" r="'+r+'" fill="'+fur+'"/><circle cx="146" cy="'+y+'" r="'+r+'" fill="'+fur+'"/>'
  +(inner?'<circle cx="54" cy="'+y+'" r="'+(r/2)+'" fill="'+inner+'"/><circle cx="146" cy="'+y+'" r="'+(r/2)+'" fill="'+inner+'"/>':'');
const mouth=(c)=>'<path d="M100 129v6M92 138Q100 143 108 138" '+stk(c,3)+'/>';
const nose=(c)=>'<path d="M91 119h18l-9 10Z" fill="'+c+'" stroke="'+c+'" stroke-width="3" stroke-linejoin="round"/>';

AN.panda={fur:'#F6F6F3',belly:'#FFFFFF',feet:'#26262B',arc:'#FFFFFF',lid:'#26262B',
  back:()=>earsRound('#26262B',null,66,19),
  mark:()=>'<ellipse cx="76" cy="106" rx="17" ry="22" transform="rotate(20 76 106)" fill="#26262B"/><ellipse cx="124" cy="106" rx="17" ry="22" transform="rotate(-20 124 106)" fill="#26262B"/>',
  face:()=>'<ellipse cx="100" cy="122" rx="10" ry="7" fill="#26262B"/>'+mouth('#26262B')};
AN.urso={fur:'#A06B3B',belly:'#C9976A',feet:'#7A4F2A',
  back:()=>earsRound('#A06B3B','#D9B48A',66,17),
  mark:()=>'',
  face:()=>'<ellipse cx="100" cy="128" rx="28" ry="21" fill="#E0BE96"/><ellipse cx="100" cy="120" rx="10" ry="7" fill="#3B2616"/>'+mouth('#3B2616')};
AN.tigre={fur:'#F4A029',belly:'#FFF0D6',feet:'#D97E12',
  back:()=>earsRound('#F4A029','#FFD9A8',64,16),
  mark:()=>'<g '+stk('#2B2118',5)+'><path d="M100 62v16M86 66l4 12M114 66l-4 12M40 108h14M42 122l12-5M160 108h-14M158 122l-12-5"/></g>',
  face:()=>'<ellipse cx="100" cy="131" rx="28" ry="19" fill="#FFF6E8"/>'+nose('#E5677E')+mouth('#2B2118')};
