/* Animais aquáticos da coleção básica, com o mesmo guarda-roupa. */
const AQUATIC=['pinguim','axolote','lontra','tartaruga','polvo','foca','baleia'];
MASC.push(['tartaruga','Tartaruga-marinha'],['polvo','Polvo'],['foca','Foca'],['baleia','Baleia']);
AN.tartaruga={fur:'#69a384',belly:'#dfe6b0',feet:'#4d866b',
  back:()=>'<ellipse cx="100" cy="119" rx="78" ry="61" fill="#526d56"/><path d="M50 113q-28 1-39 38 25 1 44-19m95-19q28 1 39 38-25 1-44-19" fill="#79af8c" stroke="#4d866b" stroke-width="3"/>',
  mark:()=>'<path d="m100 64 8 5v8l-8 5-8-5v-8Zm-37 18 5 3v6l-5 3-5-3v-6Zm74 0 5 3v6l-5 3-5-3v-6Z" fill="#4f8369"/>',
  face:()=>mouth('#3f6253')};
AN.polvo={fur:'#ac6f9b',belly:'#edc4d5',feet:'#945782',
  back:()=>'<path d="M66 121q-29 4-39 28-6 17 15 18 8 0 9-8-16 5-12-7 5-12 24-12m71-19q29 4 39 28 6 17-15 18-8 0-9-8 16 5 12-7-5-12-24-12" fill="#ac6f9b" stroke="#724a70" stroke-width="3"/>',
  mark:()=>'<path d="M78 75q10-8 22-7" '+stk('#d49cbb',4)+'/>',
  face:()=>'<ellipse cx="100" cy="131" rx="9" ry="7" fill="#7e4b77"/><circle cx="100" cy="130" r="3" fill="#e7a6bb"/>'};
AN.foca={fur:'#97adc3',belly:'#e1eaf3',feet:'#768ca6',
  back:()=>'<path d="M58 133q-28 3-35 24 17 5 38-7m81-17q28 3 35 24-17 5-38-7" fill="#8299b3" stroke="#647c92" stroke-width="3"/>',
  mark:()=>'<path d="M48 118q18-9 37 7m67-7q-18-9-37 7" '+stk('#bac9da',4)+'/>',
  face:()=>'<ellipse cx="100" cy="129" rx="25" ry="16" fill="#e1eaf3"/>'+nose('#4c647c')+mouth('#4c647c')+whisk('#6d8195')};
AN.baleia={fur:'#6998be',belly:'#d4e7f3',feet:'#527fa5',
  back:()=>'<path d="M145 104q17-5 15-27 10-13 24-15-5 12-2 16 7-3 14 1-3 17-33 23l-11 17Z" fill="#517a9e"/><path d="M85 52q-7-11-14-12m26 11v-15m11 16q6-9 13-9" '+stk('#7eafcf',4)+'/>',
  mark:()=>'<path d="M40 132q60-17 120 0v13q-60-10-120 0Z" fill="#a4c8df"/>',
  face:()=>'<path d="M85 130q15 13 30 0" '+stk('#3c5e79',3.5)+'/>'};
Object.assign(petMounts,{
  tartaruga:{head:[100,62,.88],chest:[100,146,.88]},
  polvo:{head:[100,54,1],chest:[100,144,.88]},
  foca:{head:[100,57,.92],chest:[100,146,.87]},
  baleia:{head:[100,58,.88],chest:[100,147,.9]}
});
