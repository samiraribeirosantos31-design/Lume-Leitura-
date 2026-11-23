/* Galeria, acessórios e trilha secreta do mascote. */
const PET_GEAR=[
  ['none','Sem item',0,'M28 28l44 44M50 24a26 26 0 1 1-.1 0'],
  ['bow','Gravata',0,'M49 49 23 34v32l26-15h2l26 15V34L51 49Z'],
  ['star','Estrela',0,'m50 20 9 19 21 3-15 15 4 22-19-10-19 10 4-22-15-15 21-3Z'],
  ['scarf','Lenço',0,'M21 30q29 21 58 0v17L68 56l10 25-17-4-7-20q-18 2-33-10Z'],
  ['cap','Boné',0,'M17 61q1-30 29-34 32 2 34 34ZM18 61q38-8 66 1l8 7-74-2Z'],
  ['felt','Chapéu clássico',5,'M24 57l7-23 16 4 17-7 12 26ZM11 62q31-10 78 0-3 12-78 0Z'],
  ['glasses','Óculos redondos',5,'M43 54a14 14 0 1 1-28 0 14 14 0 0 1 28 0Zm42 0a14 14 0 1 1-28 0 14 14 0 0 1 28 0ZM43 54h14'],
  ['scholar','Chapéu de estudioso',10,'M14 39 50 23l36 16-36 17ZM28 47v19l22 9 22-9V47m10-5v24'],
  ['wizard','Chapéu de mago',20,'M24 63 46 28l32-9-12 18 10 27M13 66q35-6 74 0v9H13Z'],
  ['cape','Capa',20,'m35 24 15 12 15-12 17 50q-32 14-64 0Z'],
  ['satchel','Bolsa',20,'M22 32h56v43H22Zm13 0V21h30v11M22 51h56m-28-7v13'],
  ['crown','Tiara solar',30,'m21 31 15 17 14-28 14 28 15-17-8 41H29Z'],
  ['orb','Orbe lunar',50,'M50 22a24 24 0 1 1-.1 0m-17 48 17 10 17-10'],
  ['wings','Asas astrais',60,'M50 72Q9 69 14 25q22 18 36 47 14-29 36-47 5 44-36 47Z']
];
const gearIcons=([,name,,path])=>'<svg viewBox="0 0 100 100" aria-hidden="true"><path d="'+path+'" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>'+name+'</span>';
function mascotArt(kind,stage,mood,accessory,level=1){
  const art=petOf(kind,stage,mood,mascotGarment(kind,accessory,level));
  if(stage===0)return art;
  return art.replace(/^(<svg[^>]*>)/,'$1'+journeyAura(level));
}
function canUseMascot(kind,level){
  return MASC.some(([id,,required=1])=>kind===id&&level>=required);
}
function canUseGear(key,level){
  return PET_GEAR.some(([id,,required])=>key===id&&level>=required);
}
pet=function(stage,mood){
  const level=readingJourney().level;
  return mascotArt(canUseMascot(S.mascote,level)?S.mascote:'coruja',stage,mood,canUseGear(S.petAccessory,level)?S.petAccessory:'none',level);
};
let petDraft=null;
function petTiles(items,level){
  return '<div class="mascs pet-grid">'+items.map(([id,name,required=1])=>{
    if(level<required){
      const hidden=required>=40;
      return '<div class="mc pet-locked"><span class="mc-i">'+(hidden?'?':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>')+'</span><span>'+(hidden?'Nível '+required:name+' · nível '+required)+'</span></div>';
    }
    const art=mascotArt(id,2,'normal','none',level).replace(/role="img" aria-label="[^"]*"/,'aria-hidden="true"');
    return '<button type="button" class="mc" data-act="masc-set" data-v="'+id+'" aria-pressed="'+(petDraft.kind===id)+'"><span class="mc-i">'+art+'</span><span>'+name+'</span></button>';
  }).join('')+'</div>';
}
function petSecretHtml(j){
  return '<p class="hint">'+(j.level<50?'A trilha até o nível 50 foi revelada.':'A trilha até o nível 70 foi revelada.')+'</p>'
    +petTiles(MASC.filter(([, ,level=1])=>level>=40&&level<=j.ceiling),j.level)
    +(j.level>=50?'<div class="pet-challenge"><h3>Deus da leitura</h3><p>Chegue ao nível 69, comece 100 livros e conclua pelo menos 30.</p>'
      +'<div><b>'+Math.min(100,j.started)+' / 100</b> iniciados <b>'+Math.min(30,j.finished)+' / 30</b> concluídos</div></div>':'');
}
function petEditorBody(j){
  const stage=Math.max(1,journeyStage(j));
  const selected=MASC.find(m=>m[0]===petDraft.kind);
  const tabs=[['species','Mascotes'],['gear','Acessórios'],...(j.level>=30?[['secret','Trilha secreta']]:[])];
  let items=petTiles(MASC.filter(m=>(m[2]||1)===1),j.level)+'<h3>Mascotes fantásticos</h3>'+petTiles(MASC.filter(m=>m[2]===10),j.level);
  if(petDraft.panel==='gear')items='<p class="hint">Roupas especiais a partir do nível 20.</p><div class="mascs pet-grid">'+PET_GEAR.filter(g=>g[2]<=j.ceiling).map(g=>{
    const [key,name,required]=g;
    return j.level<required?'<div class="mc pet-locked pet-gear">'+gearIcons(g)+'<small>Nível '+required+'</small></div>'
      :'<button type="button" class="mc pet-gear" data-act="pet-gear" data-v="'+key+'" aria-pressed="'+(petDraft.accessory===key)+'">'+gearIcons(g)+'</button>';
  }).join('')+'</div>';
  if(petDraft.panel==='secret')items=petSecretHtml(j);
  return '<div class="pet-editor-preview" aria-live="polite">'+mascotArt(petDraft.kind,stage,'normal',petDraft.accessory,j.level)
    +'<div><b>'+selected[1]+'</b><p class="hint">Nível '+j.level+' · '+journeyRank(j.level)+'</p></div></div>'
    +'<nav class="pet-editor-tabs" aria-label="Personalização">'+tabs.map(([key,name])=>'<button type="button" class="btn btn-soft" data-act="pet-panel" data-v="'+key+'" aria-pressed="'+(key===petDraft.panel)+'">'+name+'</button>').join('')+'</nav>'+items;
}
function openMascot(panel='species'){
  const j=readingJourney();
  petDraft={kind:canUseMascot(S.mascote,j.level)?S.mascote:'coruja',accessory:canUseGear(S.petAccessory,j.level)?S.petAccessory:'none',
    panel:panel==='secret'&&j.level>=30?'secret':'species'};
  openSheet('<h2 id="sh-t">Meu mascote</h2><form id="form-mascot" novalidate><label for="nm-t">Nome</label><input id="nm-t" maxlength="14" autocomplete="off" value="'+esc(S.petName)+'">'
    +'<div id="pet-controls">'+petEditorBody(j)+'</div><div class="row pet-editor-actions"><button class="btn btn-primary" type="submit">Salvar mascote</button>'
    +'<button class="btn btn-ghost" type="button" data-act="close">Cancelar</button></div></form>',null,'sheet-mascot');
}
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act;
  if(!['pet-secret','masc-set','pet-gear','pet-panel'].includes(act))return;
  if(act==='pet-secret')openMascot('secret');
  const controls=$('#pet-controls');
  if(!controls||!petDraft)return;
  const j=readingJourney();
  if(act==='masc-set'&&canUseMascot(a.dataset.v,j.level))petDraft.kind=a.dataset.v;
  else if(act==='pet-gear'&&canUseGear(a.dataset.v,j.level))petDraft.accessory=a.dataset.v;
  else if(act==='pet-panel'&&(['species','gear'].includes(a.dataset.v)||(a.dataset.v==='secret'&&j.level>=30)))petDraft.panel=a.dataset.v;
  else return;
  controls.innerHTML=petEditorBody(j);
  if(e.detail===0)$('[data-act="'+act+'"][aria-pressed="true"]',controls)?.focus({preventScroll:true});
});
document.addEventListener('submit',function(e){
  if(e.target.id!=='form-mascot'||!petDraft)return;
  const j=readingJourney();
  if(!canUseMascot(petDraft.kind,j.level)||!canUseGear(petDraft.accessory,j.level))return;
  const fields={petName:S.petName,mascote:S.mascote,petAccessory:S.petAccessory};
  Object.assign(S,{petName:($('#nm-t').value||'').trim()||'Mascote',mascote:petDraft.kind,petAccessory:petDraft.accessory});
  if(!save()){Object.assign(S,fields);toast(['Não foi possível salvar o mascote']);return;}
  closeSheet();render();toast(['Mascote salvo']);
});
