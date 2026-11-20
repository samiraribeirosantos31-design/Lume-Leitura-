/* Mascotes (parte 2): leão, onça, borboleta e escolha do mascote */
function maneBack(st){
  const rx=st>=2?82:72,ry=st>=2?76:66;let o='<ellipse cx="100" cy="112" rx="'+rx+'" ry="'+ry+'" fill="#B4651E"/>';
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2;o+='<circle cx="'+(100+Math.cos(a)*rx).toFixed(1)+'" cy="'+(112+Math.sin(a)*ry).toFixed(1)+'" r="13" fill="#B4651E"/>';}
  return o+'<circle cx="58" cy="62" r="14" fill="#F2B452"/><circle cx="142" cy="62" r="14" fill="#F2B452"/><circle cx="58" cy="62" r="7" fill="#FFD79A"/><circle cx="142" cy="62" r="7" fill="#FFD79A"/>';
}
AN.leao={fur:'#F2B452',belly:'#FFE5B4',feet:'#D69034',
  back:maneBack,
  mark:()=>'',
  face:()=>'<ellipse cx="100" cy="131" rx="27" ry="19" fill="#FFEBC4"/>'+nose('#5A3A22')+mouth('#5A3A22')};
const rosette=(x,y)=>'<circle cx="'+x+'" cy="'+y+'" r="6" fill="#C98A1F" stroke="#3A2A12" stroke-width="3"/>';
AN.onca={fur:'#E3AA3C',belly:'#FFE8B5',feet:'#C98A1F',
  back:()=>earsRound('#E3AA3C','#3A2A12',64,16),
  mark:()=>[[100,66],[76,72],[124,72],[48,112],[152,112],[54,146],[146,146],[100,86]].map(p=>rosette(p[0],p[1])).join('')
    +'<circle cx="86" cy="150" r="3.5" fill="#3A2A12"/><circle cx="114" cy="150" r="3.5" fill="#3A2A12"/>',
  face:()=>'<ellipse cx="100" cy="131" rx="27" ry="19" fill="#FFF1D2"/>'+nose('#3A2A12')+mouth('#3A2A12')};

function petBorboleta(stage,mood){
  let o=svgHead(stage);
  if(stage===4)o+=aura();
  o+='<g class="bob"><ellipse cx="100" cy="182" rx="40" ry="7" fill="var(--shadow)"/>';
  o+='<g'+(stage===1?' transform="translate(100 182) scale(.82) translate(-100 -182)"':'')+'>';
  o+='<ellipse cx="56" cy="86" rx="46" ry="58" transform="rotate(-24 56 86)" fill="var(--pet)"/><ellipse cx="144" cy="86" rx="46" ry="58" transform="rotate(24 144 86)" fill="var(--pet)"/>'
   +'<ellipse cx="68" cy="140" rx="32" ry="38" transform="rotate(28 68 140)" fill="var(--accent)"/><ellipse cx="132" cy="140" rx="32" ry="38" transform="rotate(-28 132 140)" fill="var(--accent)"/>';
  if(stage>=2)o+='<circle cx="46" cy="76" r="11" fill="var(--pet-belly)"/><circle cx="154" cy="76" r="11" fill="var(--pet-belly)"/><circle cx="66" cy="148" r="7" fill="var(--pet-belly)"/><circle cx="134" cy="148" r="7" fill="var(--pet-belly)"/>';
  if(stage>=3)o+='<circle cx="72" cy="108" r="5" fill="var(--pet-belly)"/><circle cx="128" cy="108" r="5" fill="var(--pet-belly)"/>';
  o+='<ellipse cx="100" cy="128" rx="16" ry="50" fill="#3B2F3A"/><circle cx="100" cy="82" r="24" fill="#3B2F3A"/>';
  o+='<path d="M90 62Q82 42 70 38M110 62Q118 42 130 38" '+stk('#3B2F3A',4)+'/><circle cx="70" cy="38" r="5" fill="#3B2F3A"/><circle cx="130" cy="38" r="5" fill="#3B2F3A"/>';
  if(mood==='happy')o+='<path d="M86 84Q92 76 98 84M102 84Q108 76 114 84" '+stk('#FFFFFF',3.5)+'/>';
  else{
    o+='<circle cx="91" cy="82" r="7" fill="#FFFFFF"/><circle cx="109" cy="82" r="7" fill="#FFFFFF"/><circle cx="92" cy="83" r="3.5" fill="#141C33"/><circle cx="110" cy="83" r="3.5" fill="#141C33"/>';
    if(mood==='sleepy')o+='<path d="M84 82a7 7 0 0 1 14 0Z" fill="#3B2F3A"/><path d="M102 82a7 7 0 0 1 14 0Z" fill="#3B2F3A"/>';
  }
  o+='<path d="M94 94Q100 99 106 94" '+stk('#FFFFFF',3)+'/>';
  if(stage>=3)o+='<circle cx="91" cy="82" r="10" '+stk('#FFFFFF',3)+'/><circle cx="109" cy="82" r="10" '+stk('#FFFFFF',3)+'/>';
  if(stage>=4)o+='<path d="M80 62l5-16 15 11 15-11 5 16Z" fill="var(--accent)" stroke="var(--on-accent)" stroke-width="2" stroke-linejoin="round"/>';
  return o+'</g></g></svg>';
}
function petOf(kind,stage,mood){
  if(stage===0||kind==='coruja'||!kind||(kind!=='borboleta'&&!AN[kind]))return _petCoruja(stage,mood);
  return kind==='borboleta'?petBorboleta(stage,mood):petAnimal(kind,stage,mood);
}
pet=function(stage,mood){return petOf(S.mascote||'coruja',stage,mood);};
