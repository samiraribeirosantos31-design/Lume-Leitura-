/* Acessórios em camadas, presos à cabeça, ao peito ou aos ombros. */
const wardrobe={
  bow:['chest','<path d="M0 0-13-6v12L0 2l13 4V-6Z" fill="#6d91ac" stroke="#294558" stroke-width="1.5"/><rect x="-3" y="-3" width="6" height="7" rx="2" fill="#c2d5e2"/>'],
  scarf:['chest','<path d="M-24-4Q0 7 24-4l-2 8Q1 14-21 5Zm40 7 6 0 4 14-9-1Z" fill="#b5574d" stroke="#783732" stroke-width="2"/><path d="m21 14 5-1" stroke="#efb09a" stroke-width="2"/>'],
  star:['chest','<path d="m10-8 2 5 6 1-4 4 1 6-5-3-5 3 1-6-4-4 6-1Z" fill="#ffdb87" stroke="#986426" stroke-width="1.5"/>'],
  cap:['head','<path d="M-25 0q0-16 16-18h11q16 1 21 16l-3 5H-23Z" fill="#516d95" stroke="#293e60" stroke-width="2"/><path d="M-26 2q20-6 48-1l9 4q3 5-10 5H-23q-7 0-3-8Z" fill="#334d73"/><path d="M-10-4h5" stroke="#e7c68c" stroke-width="3" stroke-linecap="round"/>'],
  felt:['head','<path d="M-22 1l4-14q3-7 11-6l9 3 8-3q8 0 10 9l3 12Z" fill="#6a4937" stroke="#432d26" stroke-width="2"/><path d="M-22-1q20 5 44 0v5h-44Z" fill="#bd9466"/><ellipse cy="5" rx="33" ry="5" fill="#49332d"/>'],
  scholar:['head','<path d="M-21-3v11L0 15 21 8V-3" fill="#435575"/><path d="M-34-6 0-19 34-6 0 6Z" fill="#536b91" stroke="#303e5c" stroke-width="2"/><path d="M28-4v18" stroke="#e7b67d" stroke-width="3"/><circle cx="28" cy="15" r="3" fill="#edcf87"/>'],
  wizard:['head','<path d="M-23 1-5-34 22-43 11-26 21 1Z" fill="#614c8b" stroke="#3f3160" stroke-width="2"/><path d="M-24 0q24 7 47-1l4 8q-23 7-56 0Z" fill="#40335f"/><circle cx="4" cy="-5" r="3" fill="#ffde9f"/>'],
  glasses:['eyes','<circle cx="-22" r="14" fill="none" stroke="#4f3934" stroke-width="3"/><circle cx="22" r="14" fill="none" stroke="#4f3934" stroke-width="3"/><path d="M-8 0H8m-43-3-6-4m76 4 6-4" stroke="#4f3934" stroke-width="2.5" fill="none"/>'],
  crown:['head','<path d="m-26 4-4-22 14 9 16-19 15 19 14-9-5 23Z" fill="#ffe198" stroke="#986029" stroke-width="2.5"/><path d="m0-12 5 7-5 7-5-7Z" fill="#9673b8"/>'],
  cape:['back','<path d="M-37-30Q-44 2-67 34q67 20 134 0Q44 2 37-30Z" fill="#69486e" stroke="#4a355c" stroke-width="3"/><path d="M-37-16-52 39m89-55 15 55" stroke="#b385ac" stroke-width="2" fill="none"/>'],
  satchel:['hip','<path d="M-16 3Q-12-18-5-22" fill="none" stroke="#6e462f" stroke-width="4"/><path d="M-13-2H12l4 17q-14 6-29 0Z" fill="#9f694d" stroke="#694332" stroke-width="2"/><path d="M-11 4h24m-10 0v5" stroke="#f9cc8b" stroke-width="2"/>'],
  orb:['hip','<circle cy="-3" r="12" fill="#a9a9e9" stroke="#625685" stroke-width="2"/><path d="M4-11Q-5-8-1 2q-10-3-7-9 3-5 12-4Z" fill="#fff1d0"/><path d="M-7 11H7" stroke="#d7b474" stroke-width="3" stroke-linecap="round"/>'],
  wings:['back','<path d="M-36 17Q-93 20-89-53q18 23 51 39m74 31q57 3 53-70-18 23-51 39" fill="#d1e8ee" stroke="#676f9e" stroke-width="3"/>']
};
const petMounts={
  coruja:{head:[100,57,1],chest:[100,139,.95]},
  leao:{head:[100,58,1],chest:[100,145,.9]},
  gato:{head:[99,60,.9],chest:[100,143,.88]},
  cachorro:{head:[100,61,.98],chest:[100,144,.9]},
  coelho:{head:[100,50,.78],chest:[100,144,.85]},
  borboleta:{head:[100,63,.53],chest:[100,106,.56],eyes:[100,82,.43],back:[100,120,.6],hip:[116,140,.7]},
  dragao:{head:[100,53,.86],chest:[100,142,.78],eyes:[100,89,1],back:[100,131,.94],hip:[139,151,.80]},
  fenix:{head:[100,62,.73],chest:[100,123,.75],eyes:[100,89,1],back:[100,112,.81],hip:[130,145,.72]},
  grifo:{head:[100,58,.81],chest:[100,132,.77],eyes:[100,86,1],back:[100,123,.89],hip:[141,147,.75]}
};
function mascotGarment(kind,key,level){
  const [slot,art]=wardrobe[key]||[];
  const defaults={head:[100,61,.95],chest:[100,145,.9],eyes:[100,104,1],back:[100,130,1],hip:[148,153,.95]};
  const [x,y,size,tilt=0]=petMounts[kind]?.[slot]||defaults[slot]||[0,0,1];
  const fit=art?'<g data-wardrobe="'+key+'" transform="translate('+x+' '+y+') rotate('+tilt+') scale('+size+')">'+art+'</g>':'';
  return {back:slot==='back'?fit:'',front:slot==='back'?'':fit,head:slot==='head',eyes:slot==='eyes',level};
}
