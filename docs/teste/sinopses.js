/* Tradução de sinopses em inglês, com o tradutor local do aparelho. */
const SYNOPSIS_MAX=6000;
const synopsisNative=()=>window.Capacitor?.Plugins?.BookTranslator;
const synopsisActionLabel=()=>synopsisNative()?'Traduzir com o Google':'Traduzir';
const synopsisWeb=()=>typeof window.Translator?.create==='function'?window.Translator:null;
const synopsisCache=new Map();
function probablyEnglish(text,language){
  const words=text.toLowerCase().match(/[\p{L}]+/gu)||[];
  const en=new Set(['the','and','this','with','from','into','about','they','their','her','his','was','were','will','where','when','book','story','after','before','becomes','of']);
  const pt=new Set(['uma','das','dos','não','mais','seu','pela','pelo','seus','história','que','com','para','também','escrita','livro','anos','quando']);
  const match=set=>words.filter(w=>set.has(w)).length;
  const english=match(en),portuguese=match(pt);
  return english>=2&&english>portuguese || /^en(?:-|$)/i.test(language||'')&&portuguese<=english;
}

function bookSynopsis(text,language,{limit=460,empty='Sem sinopse disponível.'}={}){
  text=String(text||'').slice(0,SYNOPSIS_MAX).trim();
  const canTranslate=!!(synopsisNative()||synopsisWeb())&&probablyEnglish(text,language);
  return '<div class="book-synopsis" data-synopsis="'+esc(text)+'" data-limit="'+limit+'" data-language="'+esc(language||'')+'">'
    +'<p class="det-d" data-synopsis-text>'+esc(text?shortDescription(text,limit):empty)+'</p>'
    +'<div class="synopsis-actions"><button class="synopsis-link" type="button" data-act="synopsis-more"'+(text.length>limit?'':' hidden')+' aria-expanded="false">Ver mais</button>'
    +'<button class="synopsis-link" type="button" data-act="synopsis-translate"'+(canTranslate&&text?'':' hidden')+ '>'+synopsisActionLabel()+'</button></div>'
    +'<p class="synopsis-status" role="status" data-synopsis-status></p>'
    +'<div class="synopsis-credit" data-synopsis-credit hidden><a href="https://translate.google.com/" target="_blank" rel="noopener"><img src="icones/google-translate-credit.png" alt="Tradução pelo Google Tradutor" loading="lazy"></a>'
    +'<details><summary>Sobre a tradução</summary><p>Este serviço pode conter traduções do Google. O Google não oferece garantias sobre exatidão, confiabilidade, adequação, comercialização ou respeito a direitos de terceiros.</p></details></div></div>';
}
async function identifySynopsis(root){
  const provider=synopsisNative();
  if(!root||!provider?.identify||!root.dataset.synopsis)return;
  const text=root.dataset.synopsis;
  try{
    const {language}=await provider.identify({text});
    if(root.isConnected&&root.dataset.synopsis===text&&language&&language!=='und'){
      $('[data-act="synopsis-translate"]',root).hidden=!/^en(?:-|$)/i.test(language);
    }
  }catch(e){}
}

async function synopsisTranslation(text){
  if(synopsisCache.has(text))return synopsisCache.get(text);
  const provider=synopsisNative();
  const translate=async()=>{
    if(provider?.translate){
      const result=await provider.translate({text});
      if(typeof result?.text!=='string'||!result.text.trim())throw Error('Sem tradução');
      return {text:result.text,google:true};
    }
    const api=synopsisWeb();
    if(!api)throw Error('Tradutor indisponível');
    const translator=await api.create({sourceLanguage:'en',targetLanguage:'pt'});
    try{return {text:await translator.translate(text),google:false};}
    finally{translator.destroy();}
  };
  const task=translate().catch(error=>{if(synopsisCache.get(text)===task)synopsisCache.delete(text);throw error;});
  if(synopsisCache.size>=24)synopsisCache.delete(synopsisCache.keys().next().value);
  synopsisCache.set(text,task);
  return task;
}
function paintSynopsis(root){
  const translated=root.dataset.translated==='yes';
  const text=translated?root.dataset.translation:root.dataset.synopsis;
  const limit=Number(root.dataset.limit),expanded=root.dataset.expanded==='yes';
  const paragraph=$('[data-synopsis-text]',root);
  paragraph.textContent=expanded?text:shortDescription(text,limit);
  paragraph.lang=translated?'pt':'en';
  const more=$('[data-act="synopsis-more"]',root),toggle=$('[data-act="synopsis-translate"]',root);
  more.hidden=text.length<=limit;
  more.textContent=expanded?'Ver menos':'Ver mais';
  more.setAttribute('aria-expanded',String(expanded));
  toggle.textContent=translated?'Ver original':synopsisActionLabel();
  $('[data-synopsis-credit]',root).hidden=!(translated&&root.dataset.google==='yes');
}

document.addEventListener('click',async e=>{
  const action=e.target.closest('[data-act]');
  if(!['synopsis-more','synopsis-translate'].includes(action?.dataset.act))return;
  const root=action.closest('.book-synopsis');
  if(!root||!root.dataset.synopsis||action.disabled)return;
  if(action.dataset.act==='synopsis-more'){
    root.dataset.expanded=root.dataset.expanded==='yes'?'no':'yes';
    paintSynopsis(root);return;
  }
  const status=$('[data-synopsis-status]',root);
  if(root.dataset.translated==='yes'){
    root.dataset.translated='no';status.textContent='';paintSynopsis(root);return;
  }
  action.disabled=true;
  status.textContent='Preparando a tradução…';
  try{
    const result=await synopsisTranslation(root.dataset.synopsis);
    if(!root.isConnected)return;
    root.dataset.translation=result.text;
    root.dataset.translated='yes';
    root.dataset.google=result.google?'yes':'no';
    status.textContent='';paintSynopsis(root);
  }catch(e){if(root.isConnected)status.textContent='Tradução indisponível agora. O primeiro uso pode precisar de internet.';}
  finally{action.disabled=false;}
});
