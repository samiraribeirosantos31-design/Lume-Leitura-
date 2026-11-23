/* Criaturas de frente, com poses e proporções próprias. */
const FANTASTIC=['dragao','fenix','grifo'];
const fPath=(d,fill,line,width=2.6)=>'<path d="'+d+'" fill="'+fill+'"'+(line?' stroke="'+line+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round"':'')+'/>';
const fDot=(x,y,r,c)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'"/>';
const mirrored=art=>art+'<g transform="translate(200 0) scale(-1 1)">'+art+'</g>';
const fantasyShadow='<ellipse cx="100" cy="180" rx="70" ry="6" fill="var(--shadow)"/>';
function frontEyes(y,x,mood,color){
  const ink='#1f2535';
  if(mood==='blink'||mood==='happy')return mirrored(fPath('M'+(x-8)+' '+y+'q8 '+(mood==='blink'?6:-8)+' 16 0','none',ink,3));
  return mirrored(fPath('M'+(x-10)+' '+(y-3)+'q11-4 20 6-3 9-14 6-6-3-6-12Z','#fff2d3',ink,1.6)
    +fDot(x+1,y+2,5,color)+fDot(x+1,y+2,2.5,ink)+fDot(x-1,y,.9,'#fff'));
}
function dragonShape(tier,mood,gear){
  const ink='#26353d',edge='#334460',green='#3c887b',mint='#78b6a0',belly='#e6cf96';
  const wing=fPath('M80 132C60 108 45 97 22 100l-8-17L5 39l28 14 14-22 14 26 15-5q-8 35 18 55Z','#536b8e',ink)
    +fPath('M9 46Q30 79 68 98m-23-59q2 42 23 59m7-39q-14 24-6 41m-47-4q9-21 34-14','none','#a5bad1',2)
    +fPath('M14 51q17 21 37 30L24 88Z','#7898b7');
  const horn=fPath('M58 72Q37 67 38 40l10-18q0 19 13 26l14 5Z','#e7c589',ink)
    +fPath('M43 48q7 7 18 9','none','#a97651',2);
  let tail=fPath('M92 160q-21 30-56 19Q8 170 19 149q0 18 25 14 12-2 21-16Z','#4d9586',ink)
    +fPath('M25 163 10 152l2 13 16 4Z',belly,ink);
  const chest=fPath('M76 113q-19 19-18 50l15 13h54l15-13q1-31-18-50Z','#448f83',ink)
    +fPath('M87 119h26q16 22 12 49H75q-4-27 12-49Z',belly)
    +fPath('M79 148q21 8 42 0m-45 12q24 8 48 0','none','#c19a65',2);
  const feet=mirrored(fPath('M79 139q-9-14-22-3l-5 20-10 12q-3 7 8 7h22q11-5 7-36Z',green,ink)
    +fPath('M52 168l-4 6m12-8-3 8m11-7-2 7','none','#d7c393',2));
  const face=fPath('M49 85Q47 62 68 56l13-16 19 9 19-9 13 16q21 6 19 29l-6 27-17 20H72l-17-20Z',green,ink)
    +mirrored(fPath('M61 81q2-13 20-17l10 12-10 3-9-2Z',edge))
    +fPath('M84 63 100 54l16 9-16 11Z','#a8d2b3')
    +fPath('M65 107q2-14 16-13h38q14-1 16 13 5 18-17 25H82q-22-7-17-25Z',mint,ink)
    +fPath('M79 113l5 2m37-2-5 2m-26 6q10 7 20 0','none',ink,2.2)
    +mirrored(fPath('M83 126l4 4 3-3','#f9e7b6'));
  return gear.back+tail+mirrored('<g transform="rotate('+(-tier*4)+' 82 118)">'+wing+'</g>')+chest+feet+mirrored(horn)+face+frontEyes(88,77,mood,'#9a6226')
   +(tier>=1?mirrored(fPath('m57 102 7 4-5 5m0 10 5 5 4-3','none','#b1cfac',2)):'')
   +(tier>=2?mirrored(fPath('M20 59q-5 19 8 31m5-19 9 4','none','#f1d49b',2.5)):'')
   +gear.front;
}
function phoenixShape(tier,mood,gear){
  const ink='#763948',red='#c75947',rust='#a74648',outer='#e4764e',gold='#f5bc6e';
  const wing=fPath('M81 134Q51 134 25 106L9 75l21 13Q13 65 12 45l31 26Q25 41 27 26q22 26 39 28l17 17 9 31Z',rust,ink)
    +fPath('M29 33q11 35 41 45M17 54q6 29 50 51m-45-12q25 30 54 29','none','#f6aa62',3)
    +fPath('M34 49q22 18 38 24l4 18Q46 85 34 49Z',outer);
  const plumage=fPath('M86 127q-25 8-20 27-16 12-34 24 22-4 43-20-12 15-13 24 21-9 31-24l7 22 7-22q10 15 31 24-1-9-13-24 21 16 43 20-18-12-34-24 5-19-20-27Z',red,ink)
    +mirrored(fPath('M82 142q-6 16-19 28 21-8 28-22Z',gold));
  const body=fPath('M69 89q-14 31 3 58l16 17q12 8 24 0l16-17q17-27 3-58Z',red,ink)
    +fPath('M79 110q21-17 42 0-1 38-21 51-20-13-21-51Z',gold);
  const feet=mirrored(fPath('M85 151q-10 4-12 16m3-4q-9-2-12 4m13-4q5 2 5 6','none','#8c5038',3));
  const face=fPath('M63 89l8-26 17-13 12 3 12-3 17 13 8 26-14 22-23 8-23-8Z',outer,ink)
    +fPath('M82 61l-6-18 14 6q1-14 11-28l5 24 12-5-2 18Z',gold,ink)
    +mirrored(fPath('M68 83q13-16 26-6l-6 10q-8-7-20-4Z','#ffcb7d'))
    +fPath('M86 100q14-12 28 0l-14 14Z','#ffe09a',ink,2);
  return gear.back+plumage+mirrored('<g transform="rotate('+(-tier*4)+' 88 109)">'+wing+'</g>')+body+feet+face+frontEyes(88,78,mood,'#a9445d')
    +(tier>=1?mirrored(fPath('M20 67q12 21 30 26m-11-33 6 9','none','#ffce80',2)):'')
    +(tier>=2?fDot(100,125,5,'#fff0ba')+mirrored(fPath('M51 46l-9-14m4 18-10-5','none','#f8ce80',2)):'')
    +gear.front;
}
function griffinShape(tier,mood,gear){
  const ink='#513e42',tan='#ae805d',gold='#e1b97a',ivory='#f1e6ca';
  const wing=fPath('M79 129Q54 124 24 98l-12-17 18 8Q10 68 10 50l26 17q-17-18-13-34 22 18 45 21 9 15 18 36Z','#88696a',ink)
    +fPath('M26 39Q45 65 70 77M17 63q15 25 54 35m-46-5q18 19 51 25','none','#d7b790',2.8)
    +fPath('M38 48q12 27 34 37l-4-21Z','#bb9691');
  const body=fPath('M75 108q-27 10-28 50l17 17h72l17-17q-1-40-28-50Z',tan,ink)
    +fPath('M79 113q21 10 42 0l-2 38-19 24-19-24Z','#d9b789')
    +mirrored(fPath('M76 142q-11-14-21-4l-9 29-5 7q3 7 15 6l26-3 3-8Z',gold,ink)
    +fPath('M52 173l-3 5m11-6-2 6m10-7-2 6','none','#775045',2.3));
  const face=fPath('M53 85l5-20-4-25 24 14 22-9 22 9 24-14-4 25 5 20-9 17 3 12-19-4-7 14-15-5-15 5-7-14-19 4 3-12Z',ivory,ink)
    +mirrored(fPath('M60 49l15 11-14 6Z','#d2af87')
      +fPath('M66 77q11-11 27 0l-1 10q-15-11-27-3Z','#c99b74'))
    +fPath('M85 95l15-8 15 8-6 13-9 6-9-6Z','#df9f55',ink,2.3)
    +fPath('M100 99v9','none','#965835',2);
  return gear.back+fPath('M81 161q-26 14-54 6-14-7-8-19 5-9 12-3-10 3-5 9 10 12 49-5Z',tan,ink)
    +mirrored('<g transform="rotate('+(-tier*4)+' 84 110)">'+wing+'</g>')+body+face+frontEyes(85,78,mood,'#8d552b')
    +(tier>=1?mirrored(fPath('M61 110l5 3m5 3 3 5','none','#b08b7e',2)):'')
    +(tier>=2?mirrored(fPath('M25 55q7 27 33 40','none','#ebce9c',2.6)):'')
    +gear.front;
}
function fantasticMascot(kind,stage,mood,gear){
  const tier=gear.level>=30?2:gear.level>=20?1:0;
  const art={dragao:dragonShape,fenix:phoenixShape,grifo:griffinShape}[kind];
  return svgHead(stage)+'<g class="bob" data-creature="'+kind+'" data-pose="front">'+fantasyShadow+art(tier,mood,gear)+'</g></svg>';
}
