/* Desenhos originais dos mascotes e suas silhuetas de evolução. */
MASC.push(
  ['macaco','Macaquinho'],
  ['dragao','Dragão estudioso',10],['fenix','Fênix',10],['grifo','Grifo',10],['fantasma','Fantasma',10],
  ['cervo','Cervo lunar',40],['serpente','Serpente estelar',50],
  ['lobo','Lobo do eclipse',60],['aurora','Guardião da aurora',70]
);

AN.gato.back=(()=>{
  const ears=AN.gato.back;
  return ()=>ears()+'<path d="M146 159q29 5 28-18c-1-12 14-15 15-2 2 25-17 39-44 34" fill="#D9814A"/>';
})();
AN.macaco={fur:'#AD6D48',belly:'#F7D69B',feet:'#794D37',lid:'#F8CFAC',
  back:()=>earsRound('#AD6D48','#F2BC91',99,23)+'<path d="M145 164q40 8 35-26-3-13-12-6" '+stk('#794D37',9)+'/>',
  mark:()=>'<path d="M100 88c-29-28-59 7-42 34-3 42 86 42 84 0 17-27-13-62-42-34Z" fill="#F8CFAC"/><path d="M89 65l9-14 2 13 10-11 1 14" '+stk('#794D37',4)+'/>',
  face:()=>'<ellipse cx="100" cy="123" rx="7" ry="4" fill="#794D37"/>'+mouth('#794D37')};

const creatureWings=(outer,inner)=>'<path d="M58 149C21 143 9 97 16 63q19 25 55 45m71 41c37-6 49-52 42-86q-19 25-55 45" fill="'+outer+'"/><path d="M55 134Q31 113 27 92m118 42q24-21 28-42" '+stk(inner,4)+'/>';
const diamond=(x,y,fill)=>'<path d="M0-11 7 0 0 11-7 0Z" transform="translate('+x+' '+y+')" fill="'+fill+'"/>';
AN.dragao={fur:'#427E76',belly:'#B4E6BB',feet:'#2D605B',
  back:()=>creatureWings('#346562','#A5D9A4')+tri('53 77 42 38 78 66','#E6BE62')+tri('147 77 158 38 122 66','#E6BE62'),
  mark:()=>diamond(100,77,'#B4E6BB')+diamond(55,118,'#99DAB1')+diamond(145,118,'#99DAB1'),
  face:()=>'<ellipse cx="100" cy="129" rx="26" ry="16" fill="#B4E6BB"/><circle cx="92" cy="123" r="3" fill="#285651"/><circle cx="108" cy="123" r="3" fill="#285651"/>'+mouth('#285651')};
AN.fenix={fur:'#E76A4E',belly:'#FFD197',feet:'#A7473B',
  back:()=>'<path d="M58 157Q7 151 14 90q14 19 32 18Q12 62 28 35q18 29 48 55m66 67q51-6 44-67-14 19-32 18 34-46 18-73-18 29-48 55M86 64q1-42 34-48-15 22-5 47Z" fill="#B84B45"/>',
  mark:()=>'<path d="M42 109q24-22 51-11L56 119m102-10q-24-22-51-11l37 21" fill="#FFD197"/>',
  face:()=>'<path d="M91 119q10-8 19 0l-10 16Z" fill="#FFDE6C" stroke="#6D4237" stroke-width="2"/>'};
AN.grifo={fur:'#B38350',belly:'#FFF0BC',feet:'#986944',lid:'#FFF0BC',
  back:()=>creatureWings('#725746','#E9B970')+tri('51 81 50 39 86 70','#E4B780')+tri('149 81 150 39 114 70','#E4B780'),
  mark:()=>'<path d="M39 110q9-35 61-36 52 1 61 36l-18 19-10-4-15 22-18-11-19 11-14-22-10 4Z" fill="#FFF0BC"/>',
  face:()=>'<path d="M89 122q22-20 28 1l-10 14-2-12Z" fill="#D8873C" stroke="#754832" stroke-width="2"/>'};
AN.fantasma={fur:'#C5BBEA',belly:'#F0E7FF',feet:'transparent',
  back:()=>'<path d="M50 102q-17 5-28 30-4 7 2 11 4 2 13-6m113-35q17 5 28 30 4 7-2 11-4 2-13-6M53 150l-9 22q-3 8 6 9l24-8q12 17 27 1 15 15 28-1l21 8q10 2 8-9l-9-21Z" fill="#A99ADB"/>',
  mark:()=>diamond(100,77,'#755EAC'),face:()=>'<ellipse cx="100" cy="133" rx="6" ry="8" fill="#695091"/>'};
AN.cervo={fur:'#7E9AAE',belly:'#ECF1FC',feet:'#465E7F',
  back:()=>'<path d="M70 77Q37 61 37 22m16 43-24-7M53 51l8-22m69 48q33-16 33-55m-16 43 24-7m-24-7-8-22" '+stk('#526A91',7)+'/>'+tri('45 83 35 65 70 69','#7E9AAE')+tri('155 83 165 65 130 69','#7E9AAE'),
  mark:()=>'<path d="M108 68a13 13 0 1 0 3 16q-17 1-3-16Z" fill="#ECF1FC"/>',face:()=>nose('#465E7F')+mouth('#465E7F')};
AN.serpente={fur:'#547D9E',belly:'#BAE0F4',feet:'transparent',
  back:()=>'<path d="M115 168q46 18 61-15 5-14-9-23 7 47-65 32" fill="#41618A"/>'+creatureWings('#496787','#97C9E4'),
  mark:()=>diamond(100,72,'#E4F6FF')+diamond(55,122,'#BAE0F4')+diamond(145,122,'#BAE0F4'),
  face:()=>'<path d="M88 126q12 14 24 0" '+stk('#293F60',3)+'/>'};
AN.lobo={fur:'#535476',belly:'#D2CFEE',feet:'#34344A',
  back:()=>tri('43 94 49 34 84 68','#535476')+tri('157 94 151 34 116 68','#535476')+tri('54 75 54 51 70 66','#B2AFD3')+tri('146 75 146 51 130 66','#B2AFD3'),
  mark:()=>diamond(100,76,'#FFD889')+'<path d="M40 128 59 115l22 10 19 17 19-17 22-10 19 13-25 25H65Z" fill="#D2CFEE"/>',
  face:()=>nose('#272740')+mouth('#272740')};
AN.aurora={fur:'#6888AA',belly:'#D5F3F3',feet:'#485D8C',
  back:()=>creatureWings('#736BB7','#92DAD7')+tri('49 76 52 39 83 65','#6888AA')+tri('151 76 148 39 117 65','#6888AA')+diamond(100,34,'#FFD683'),
  mark:()=>'<path d="M54 108q20-20 46 12 26-32 46-12l-14 32q-32 13-64 0Z" fill="#D5F3F3"/>'+diamond(100,75,'#FFEAA4'),
  face:()=>nose('#43597D')+mouth('#43597D')};

function journeyAura(level){
  if(level<10)return '';
  if(level<20)return '<path d="M17 139q-17-56 29-86m137 86q17-56-29-86" '+stk('var(--pet)',3)+'/>';
  const color=level<30?'var(--pet)':level<50?'#B97820':level<70?'#7351B8':'#426FB0';
  return '<g class="'+(level>=30?'myth-aura':'')+'" fill="none" stroke="'+color+'" stroke-width="3"><circle cx="100" cy="105" r="91" stroke-dasharray="'+(level<30?'5 16':'2 12')+'"/>'
    +(level>=30?'<ellipse cx="100" cy="106" rx="94" ry="65" transform="rotate(-35 100 106)" opacity=".76"/>':'')
    +(level>=50?'<ellipse cx="100" cy="106" rx="94" ry="65" transform="rotate(35 100 106)" opacity=".62"/>':'')
    +(level===70?'<path d="M13 105h174M100 16v178" stroke-dasharray="3 10" opacity=".58"/>':'')+'</g>'
    +(level>=30?diamond(26,55,color)+diamond(176,145,color):'')
    +(level===70?diamond(100,13,'#B97820')+diamond(100,187,'#B97820'):'');
}
