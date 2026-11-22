/* Níveis do mascote derivados das leituras guardadas no perfil. */
const LEVEL_POINTS=[[1,0],[5,60],[10,160],[20,350],[30,900],[50,1450],[69,4300]];
const levelThresholds=[0,0];
for(let i=1;i<LEVEL_POINTS.length;i++){
  const [from,a]=LEVEL_POINTS[i-1], [to,b]=LEVEL_POINTS[i];
  for(let level=from+1;level<=to;level++)levelThresholds[level]=Math.ceil(a+(b-a)*(level-from)/(to-from));
}

function bookIdentity(book){
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  return 'book:'+normalize(book.title)+'|'+normalize(book.author);
}

function readingJourney(){
  const books=new Map(S.books.map(book=>[book.id,book]));
  const works=new Map();
  let first='',last='',score=0,latest=null;
  for(const log of S.logs){
    if(!(log.min>0||log.pages>0))continue;
    if(S.demo&&!log.work&&['b1','b2','b3'].includes(log.bookId))continue;
    const book=books.get(log.bookId);
    const key=log.work||(book?bookIdentity(book):'legacy:'+log.bookId);
    const complete=log.finished===true||(log.finished==null&&log.pts-log.min-log.pages>=50);
    works.set(key,Boolean(works.get(key)||complete));
    score+=Number(log.pts)||0;
    if(!first||log.date<first)first=log.date;
    if(!last||log.date>=last){last=log.date;latest=log;}
  }
  const started=works.size, finished=[...works.values()].filter(Boolean).length;
  let level=1;
  while(level<69&&levelThresholds[level+1]<=score)level++;
  if(started>=100&&finished>=30)level=70;
  return {started,finished,first,last,latest,score,level,ceiling:level<30?30:level<50?50:70};
}

function journeyRank(level){
  if(level===70)return 'Deus da leitura';
  if(level>=60)return 'Guardião astral';
  if(level>=50)return 'Mítico';
  if(level>=40)return 'Oráculo';
  if(level>=30)return 'Divino';
  if(level>=20)return 'Lendário';
  if(level>=10)return 'Guardião';
  if(level>=5)return 'Leitor';
  return 'Aprendiz';
}

function journeyStage(j){
  if(j.score<15&&j.level<70)return 0;
  if(j.level<5)return 1;
  if(j.level<10)return 2;
  return j.level<20?3:4;
}

function journeyMood(j,mins){
  if(j.started<=3)return 'normal';
  if(mins>=S.goal)return 'happy';
  const now=new Date();
  // Avalia o ritmo semanal depois de uma semana de uso e dois dias completos de pausa.
  if(j.first<=dkey(addDays(now,-7))&&j.last<dkey(addDays(now,-2))){
    const weekly=Array.from({length:7},(_,i)=>minutesOn(dkey(addDays(now,-i)))).reduce((a,b)=>a+b,0);
    if(weekly<S.goal*7*.6)return 'sleepy';
  }
  return 'normal';
}

function journeySuggestion(j,mins,mood){
  if(!j.started)return '';
  if(mood==='happy')return ['Você bateu a meta de hoje!','Seu tempo de leitura rendeu a meta de hoje.'][new Date().getDate()%2];
  if(mood==='sleepy')return 'Que tal voltar com uma página quando tiver um tempinho?';
  const book=S.books.find(b=>b.id===j.latest?.bookId&&!b.done&&b.page<b.total);
  if(book&&new Date().getDate()%2===0)return 'Que tal retomar “'+book.title+'”'+(book.page?' da página '+book.page:'')+'?';
  if(mins>0&&mins<S.goal)return 'Se quiser seguir hoje, faltam '+(S.goal-mins)+' min para sua meta.';
  return book?'Se tiver alguns minutos, leia só mais uma página.':'Quando escolher sua próxima leitura, experimente começar com cinco minutos.';
}

function nextJourneyReward(j){
  if(j.level<10)return 'Nível 10 · Mascotes fantásticos';
  if(j.level<20)return 'Nível 20 · Roupas e acessórios';
  if(j.level<30)return 'Nível 30 · Divino';
  if(j.level<50)return 'Trilha secreta · até o nível 50';
  if(j.level<70)return 'Trilha secreta · até o nível 70';
  return 'Evolução final alcançada';
}

function journeyProgress(j){
  if(j.level===70)return {percent:100,label:'Nível máximo'};
  if(j.level===69)return {percent:Math.min(99,Math.round(50*Math.min(1,j.started/100)+50*Math.min(1,j.finished/30))),label:'Rumo ao nível 70'};
  const low=levelThresholds[j.level], high=levelThresholds[j.level+1];
  return {percent:Math.max(0,Math.min(100,Math.floor(100*(j.score-low)/(high-low)))),label:nf(j.score)+' / '+nf(high)+' pts'};
}

function journeyAchievements(j){
  const rewards=[
    {id:'journey10',name:'Guardião da estante',desc:'Alcance o nível 10 e libere mascotes fantásticos.',cur:j.level,t:10},
    {id:'journey20',name:'Estilo lendário',desc:'Alcance o nível 20 e libere as primeiras roupas.',cur:j.level,t:20},
    {id:'journey30',name:'Mascote divino',desc:'Alcance o nível 30.',cur:j.level,t:30}
  ];
  if(j.level>=30)rewards.push({id:'journey50',name:'Trilha mítica',desc:'Alcance o nível 50.',cur:j.level,t:50});
  if(j.level>=50)rewards.push({id:'journey70',name:'Deus da leitura',desc:'Comece 100 livros e conclua pelo menos 30 com registros de leitura.',cur:j.level,t:70});
  return rewards.map(reward=>({...reward,icon:'i-star'}));
}
