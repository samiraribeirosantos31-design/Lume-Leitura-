/* Silhuetas originais, com anatomia própria para cada criatura. */
const FANTASTIC=['dragao','fenix','grifo','fantasma'];
const fPath=(d,fill,line,width=2.4)=>'<path d="'+d+'" fill="'+fill+'"'+(line?' stroke="'+line+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round"':'')+'/>';
const fDot=(x,y,r,c)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'"/>';
function creatureEye(x,y,mood,accent='#efda9d'){
  const line='#262638';
  if(mood==='blink'||mood==='happy')return fPath('M'+(x-8)+' '+y+'q8 '+(mood==='blink'?7:-8)+' 16 0','none',line,2.8);
  return fPath('M'+(x-9)+' '+y+'q9-9 17-2-7 8-17 2Z',accent,line,1.8)
    +fDot(x+2,y-1.5,2.6,line)+fDot(x+2.8,y-2.5,1,'#fff8e4')
    +(mood==='sleepy'?fPath('M'+(x-8)+' '+(y-3)+'q8 4 15 0','none',line,2.3):'');
}
const fantasyShadow='<ellipse cx="100" cy="177" rx="69" ry="6" fill="var(--shadow)"/>';
function dragonShape(tier,mood,gear){
  const line='#213b3b',deep='#254f4d',body='#3c7971',lit='#569d88',gold='#ead69f';
  const wing=fPath('M95 124C67 114 38 109 19 125 24 99 15 74 7 57 38 72 53 69 72 40 67 75 85 91 107 94Z','#305758',line)
   +fPath('M22 67Q56 93 95 112M66 54Q60 84 91 108M23 114q30-13 61-1','none','#9fbd9c',2.6)
   +(tier>=2?fPath('M29 109Q16 96 13 79l12 8q17 10 44 18M43 87q14-10 20-25l6 29 13 10Z','#82a990'): '');
  return gear.back+fPath('M104 151Q75 178 39 171 10 167 24 147q-6 18 24 10 18-5 33-21Z',deep,line)
   +fPath('M32 155 18 144l4 17 11 1Z',gold,line)
   +'<g transform="rotate('+(-tier*3)+' 103 112)">'+wing+'</g>'
   +fPath('M68 150q-2-29 25-47l16-39 37 24-14 28q9 14 8 32 0 22-21 23H73Z',body,line)
   +fPath('M108 117q21 5 19 33-2 10-15 13H86q-7-18 3-31Z','#a6c5a1')
   +fPath('M79 136q4-6 17-8l-9 23-9 7h-15q-7-3 5-11M118 140q12-1 21 12l15 7q4 4-5 8h-19q-8 0-15-9',lit,line)
   +fPath('M109 87 96 72 96 59l15 9 12-7-2 13',gold,line)
   +fPath('M107 87l7-22 24-9 13 6 12 11 25 14-5 12-37 7-19-6-14 8Z',lit,line)
   +fPath('M116 67Q127 61 135 43q7 17 2 25m14-4q13-5 15-17 5 14-3 24',gold,line)
   +fPath('M154 82q15-1 28 9l-10 6-23 3-11-6Z','#a4c6a0')
   +fDot(176,91,1.8,line)+fPath('M145 97q19 4 31-4l-8 8','none',line,1.8)
   +creatureEye(144,79,mood)
   +fPath('M104 127l6 4m-11 3 6 4m-11 2 6 4','none','#668e65',1.7)
   +(tier>=1?fPath('m89 99-11-10 3 17m21-20-9-13 1 24','none','#b4cb9d',3):'')
   +(tier>=3?fPath('M93 117q-9-22-17-32l4 20 16 25m23-52 6 4 8-7','none','#efdb9f',2.3):'')
   +gear.front;
}
function phoenixShape(tier,mood,gear){
  const line='#713b39',gold='#f7c878';
  const feather=fPath('M99 122c-47 12-70-14-83-43 14 8 30 16 46 13-27-22-37-38-41-54 19 15 49 32 77 31q10 22 1 53Z','#ac5944',line)
    +fPath('M29 47q21 34 53 42m-54-2q21 26 59 25','none','#eaa061',3)
    +fPath('M54 66q13 9 31 9l11 24q-26-8-42-33Z','#e99554');
  return gear.back+fPath('M113 123q-11 39-58 52l-32 5q32-15 41-39 4-12 19-26Z','#ad5945',line)
    +fPath('M103 127q-16 38-62 42 25-14 31-38l15-13',gold,line)
    +(tier>=2?fPath('M80 159q-19 21-63 24 29-8 47-40m43-8q-14 33-39 43 19-18 22-38','#e88a55',line,2):'')
    +'<g transform="rotate('+(-tier*4)+' 104 110)">'+feather+'</g>'
    +fPath('M83 126q-5-20 9-38l10-22 28-2 13 25-14 15q7 22-17 46l-19 3Z','#c86b51',line)
    +fPath('M106 89q24 3 18 21-5 18-20 29h-17q-1-34 19-50Z',gold)
    +fPath('M102 76q6-22 30-20 10 4 13 12l-5 21-31 8q-17 0-17-11Z','#e99a55',line)
    +fPath('M100 69q-1-14 15-24l-6 17q18-11 30-10l-12 13Z',gold,line)
    +fPath('M137 75q16-2 21 9l-11 10 2-9-12 1Z','#ebbc6f',line)
    +creatureEye(128,76,mood,'#fff0bd')
    +fPath('M98 140q-8 10-13 13m13-8q11-4 15 6','none',line,3)
    +(tier>=3?fPath('M31 84 17 72m36 89-17 10m121-51 13-14m-10 1 4 7','none','#dd9551',3):'')
    +gear.front;
}
function griffinShape(tier,mood,gear){
  const line='#523d35',brown='#8f6649',cream='#f1d8a0';
  return gear.back+fPath('M77 155q-31 17-48-1-11-11-1-23 7-2 9 4-8 1-6 9 10 17 40-1',brown,line)
    +'<g transform="rotate('+(-tier*3)+' 101 111)">'
    +fPath('M99 119C60 122 31 105 23 67q11 11 22 8-21-17-27-36 31 15 72 26 22 18 18 43Z','#795d50',line)
    +fPath('M28 48q24 36 63 44m-53-8q15 24 57 26m-22-37 15 22','none','#cba976',3)+'</g>'
    +fPath('M50 151q0-33 44-41l16-22 27 9 4 37-9 28-29 5-15-10-13 10H49q-9-8 1-16Z',brown,line)
    +fPath('M114 100q-2 18 14 39l-17 17-11-14-9-3 6-19 9-17Z','#e3b57d')
    +fPath('M131 135q10-3 13 10l-3 12 15 4-2 7h-25l-4-6m-48-17q10 7 8 16l-18 4', '#ab8055',line)
    +fPath('M108 98 104 84l8-17 15-9 22 3 14 17-7 21-21 9-14-9-8 5Z',cream,line)
    +fPath('M108 75l-6-16 16 7m25-3 14-12-2 18','#e4be83',line)
    +fPath('M152 80q22-5 34 6-2 13-12 17l2-9-19 1-8-8Z','#d99e54',line)
    +creatureEye(143,79,mood,'#fff0b3')
    +(tier>=1?fPath('M66 98q6 13 23 21m-33-10 7 8','none','#e3bd87',2):'')
    +(tier>=3?fPath('m104 109 8 8 9-5m-3-48 9-5 16 3','none','#e4a964',2):'')
    +gear.front;
}
function ghostShape(tier,mood,gear){
  const line='#545876',shade='#a4a0c9';
  return gear.back+fPath('M56 136Q42 121 36 113q-3-8 5-8l16 8q-2-49 36-68 36-9 51 25 10 21 3 43 13-7 22-18 12-3 8 10-10 18-23 28Q149 156 161 163q-25 4-39-10-19 22-37 17 8-12 3-19-7 13-32 10 6-11 0-25Z','#c0bfd9',line)
    +fPath('M75 101q0-24 17-32 17-9 37 4-24-4-37 26-5 12-18 24Z','#e9e5f1')
    +fPath('M133 114q8 16 2 27 8 12 15 15-18-2-27-15-7 14-23 18 11-12 5-23Z',shade)
    +creatureEye(88,94,mood,'#fff2e3')+creatureEye(120,93,mood,'#fff2e3')
    +fPath('M98 106q6 6 12 0','none',line,2.2)
    +(tier>=1?fPath('M41 144q-13 0-22-15m142 10q12-2 22-12','none','#9894bd',2.7):'')
    +(tier>=2?fPath('m79 67 8 5 7-9m45 10 7 7m-92 2 3 8','none','#eee6f2',2.5):'')
    +(tier>=3?fPath('M71 43q22-25 54-8m-74 16 5-6m87-4 7 4','none','#9085b1',2.8):'')
    +gear.front;
}
function fantasticMascot(kind,stage,mood,gear){
  const tier=gear.level>=50?3:gear.level>=30?2:gear.level>=20?1:0;
  const art={dragao:dragonShape,fenix:phoenixShape,grifo:griffinShape,fantasma:ghostShape}[kind];
  return svgHead(stage)+'<g class="bob" data-creature="'+kind+'">'+fantasyShadow+art(tier,mood,gear)+'</g></svg>';
}
