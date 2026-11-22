/* Mascotes (parte 3): mais bichinhos fofos */
const tri=(pts,f)=>'<path d="M'+pts+'Z" fill="'+f+'" stroke="'+f+'" stroke-width="6" stroke-linejoin="round"/>';
const whisk=(c)=>'<path d="M62 128H36M62 135L38 144M138 128H164M138 135L162 144" '+stk(c,2.5)+'/>';
AN.gato={fur:'#F4B183',belly:'#FFF1E4',feet:'#E39A66',
  back:()=>tri('48 80 50 42 82 66','#F4B183')+tri('152 80 150 42 118 66','#F4B183')+tri('56 70 56 54 70 63','#F7A8B8')+tri('144 70 144 54 130 63','#F7A8B8'),
  mark:()=>'<g '+stk('#D9814A',4)+'><path d="M100 66v12M88 69l3 10M112 69l-3 10"/></g>',
  face:()=>'<ellipse cx="100" cy="130" rx="17" ry="11" fill="#FFF1E4"/><path d="M95 121h10l-5 6Z" fill="#F28FA4" stroke="#F28FA4" stroke-width="2" stroke-linejoin="round"/><path d="M100 127Q100 135 93 135M100 127Q100 135 107 135" '+stk('#8A5A44',2.5)+'/>'+whisk('#8A6B58')};
AN.cachorro={fur:'#EBCFA6',belly:'#FFF3E0',feet:'#C99A66',
  back:()=>'',
  mark:()=>'<ellipse cx="124" cy="103" rx="19" ry="17" fill="#B07B4A"/><ellipse cx="38" cy="100" rx="16" ry="32" transform="rotate(12 38 100)" fill="#B07B4A"/><ellipse cx="162" cy="100" rx="16" ry="32" transform="rotate(-12 162 100)" fill="#B07B4A"/>',
  face:()=>'<ellipse cx="100" cy="132" rx="27" ry="19" fill="#FFF3E0"/><ellipse cx="100" cy="121" rx="11" ry="8" fill="#3A2A22"/><path d="M100 129v6M92 136Q100 141 108 136" '+stk('#3A2A22',3)+'/><path d="M95 138Q100 152 105 138Z" fill="#F28FA4"/>'};
AN.coelho={fur:'#F7F1F5',belly:'#FFFFFF',feet:'#EBDDE6',
  back:()=>'<ellipse cx="72" cy="40" rx="15" ry="38" transform="rotate(-8 72 40)" fill="#F7F1F5"/><ellipse cx="128" cy="40" rx="15" ry="38" transform="rotate(8 128 40)" fill="#F7F1F5"/>'
    +'<ellipse cx="72" cy="42" rx="7" ry="27" transform="rotate(-8 72 42)" fill="#F9B8CC"/><ellipse cx="128" cy="42" rx="7" ry="27" transform="rotate(8 128 42)" fill="#F9B8CC"/>',
  mark:()=>'',
  face:()=>'<ellipse cx="100" cy="122" rx="6" ry="4.5" fill="#F28FA4"/><path d="M100 126v5M93 134Q100 139 107 134" '+stk('#B98AA0',3)+'/>'};
AN.raposa={fur:'#EE8A3C',belly:'#FFF4E6',feet:'#7A4A2A',
  back:()=>tri('46 86 46 36 88 66','#EE8A3C')+tri('154 86 154 36 112 66','#EE8A3C')+tri('54 72 54 50 72 64','#5B3A29')+tri('146 72 146 50 128 64','#5B3A29'),
  mark:()=>'<path d="M38 124Q60 106 84 136Q60 152 38 124Z" fill="#FFF4E6"/><path d="M162 124Q140 106 116 136Q140 152 162 124Z" fill="#FFF4E6"/>',
  face:()=>'<ellipse cx="100" cy="134" rx="21" ry="14" fill="#FFF4E6"/><path d="M94 120h12l-6 8Z" fill="#3A2A22" stroke="#3A2A22" stroke-width="3" stroke-linejoin="round"/>'+mouth('#3A2A22')};
AN.porquinho={fur:'#F7B6C8',belly:'#FBD0DC',feet:'#E88AA6',
  back:()=>tri('50 78 42 48 76 62','#F092B0')+tri('150 78 158 48 124 62','#F092B0'),
  mark:()=>'',
  face:()=>'<ellipse cx="100" cy="130" rx="22" ry="16" fill="#F092B0"/><ellipse cx="91" cy="130" rx="3.5" ry="5.5" fill="#B84C70"/><ellipse cx="109" cy="130" rx="3.5" ry="5.5" fill="#B84C70"/>'};
AN.pinguim={fur:'#2D3447',belly:'#FFFFFF',feet:'#FFB02E',lid:'#FFFFFF',
  back:()=>'<ellipse cx="34" cy="124" rx="12" ry="28" transform="rotate(14 34 124)" fill="#2D3447"/><ellipse cx="166" cy="124" rx="12" ry="28" transform="rotate(-14 166 124)" fill="#2D3447"/>',
  mark:()=>'<path d="M100 76C70 72 52 94 56 118C60 140 84 148 100 148C116 148 140 140 144 118C148 94 130 72 100 76Z" fill="#FFFFFF"/>',
  face:()=>'<path d="M89 120Q100 111 111 120Q100 135 89 120Z" fill="#FFB02E"/>'};

AN.capivara={fur:'#AC7951',belly:'#E3B989',feet:'#7B4F35',
  back:()=>earsRound('#AC7951','#8B5B43',65,13),mark:()=>'',
  face:()=>'<ellipse cx="100" cy="130" rx="47" ry="22" fill="#D5A278"/><ellipse cx="100" cy="122" rx="15" ry="8" fill="#6A4534"/>'+mouth('#6A4534')};
AN.axolote={fur:'#FFBFD5',belly:'#FFE8F2',feet:'#E992B5',
  back:()=>'<path d="M52 99 27 76m26 33-30-3m29 13-25 12m121-32 25-23m-26 33 30-3m-29 13 25 12" stroke="#DC699C" stroke-width="11" stroke-linecap="round"/>',
  mark:()=>'<circle cx="63" cy="119" r="5" fill="#DC699C"/><circle cx="137" cy="119" r="5" fill="#DC699C"/>',
  face:()=>'<path d="M86 126q14 17 28 0" '+stk('#94476F',4)+'/>'};
AN.lontra={fur:'#986B52',belly:'#F6DEBC',feet:'#6A4836',
  back:()=>earsRound('#986B52','#D6A47E',64,16)+'<path d="M145 169q41 9 32-26" '+stk('#986B52',15)+'/>',
  mark:()=>'',
  face:()=>'<ellipse cx="100" cy="129" rx="30" ry="19" fill="#F6DEBC"/><ellipse cx="100" cy="120" rx="11" ry="6" fill="#654333"/>'+mouth('#654333')+whisk('#654333')};
