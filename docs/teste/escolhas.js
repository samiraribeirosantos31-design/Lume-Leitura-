/* Listas do Lume: seleção dentro do formulário, com títulos inteiros. */
function choiceField(id,label,items,value,{search=false,locked=false}={}){
  const active=items.find(item=>String(item.value)===String(value))||items[0];
  if(!active)return '';
  const field='<input type="hidden" id="'+esc(id)+'" value="'+esc(active.value)+'">';
  if(locked)return field+'<p class="choice-locked"><b>'+esc(active.label)+'</b></p>';
  return '<details class="lume-choice" data-choice="'+esc(id)+'">'
    +'<summary id="'+esc(id)+'-control" aria-label="'+esc(label)+'" class="choice-summary"><span data-choice-label>'+esc(active.label)+'</span><span aria-hidden="true">⌄</span></summary>'+field
    +(search?'<input class="choice-find" aria-label="Buscar pelo título ou autor" type="search" placeholder="Buscar pelo título ou autor" autocomplete="off">':'')
    +'<div class="choice-options" role="group" aria-label="'+esc(label)+'">'+items.map(item=>{
      const on=item===active;
      return '<button type="button" class="choice-item" data-act="choice-pick" data-v="'+esc(item.value)+'" aria-pressed="'+on+'">'
        +'<span><b>'+esc(item.label)+'</b>'+(item.detail?'<small>'+esc(item.detail)+'</small>':'')+'</span><span class="choice-check" aria-hidden="true">✓</span></button>';
    }).join('')+'<p data-choice-empty hidden>Nenhuma opção encontrada.</p></div></details>';
}
function bookChoices(books){
  return books.map(b=>({value:b.id,label:b.title,detail:b.author||''}));
}
function numberChoices(count,unit){
  return Array.from({length:count},(_,n)=>({value:n,label:pad(n)+(unit?' '+unit:'')}));
}
function setChoice(id,value){
  const field=$('#'+id);
  if(!field)return false;
  const list=field.closest?.('.lume-choice');
  if(list){
    const items=$$('[data-act="choice-pick"]',list);
    const selected=items.find(item=>item.dataset.v===String(value));
    if(!selected)return false;
    items.forEach(item=>item.setAttribute('aria-pressed',String(item===selected)));
    $('[data-choice-label]',list).textContent=$('b',selected).textContent;
  }
  field.value=String(value);
  return true;
}
function dismissChoice(){
  const list=$('.lume-choice[open]');if(!list)return false;
  list.open=false;$('summary',list)?.focus({preventScroll:true});
  return true;
}
const choiceNorm=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act="choice-pick"]');
  if(a){
    const list=a.closest('.lume-choice'),id=list.dataset.choice;
    if(setChoice(id,a.dataset.v))$('#'+id).dispatchEvent(new Event('change',{bubbles:true}));
    list.open=false;$('summary',list)?.focus({preventScroll:true});
    return;
  }
  const current=e.target.closest('.lume-choice');
  for(const list of $$('.lume-choice[open]'))if(list!==current)list.open=false;
});
document.addEventListener('input',e=>{
  if(!e.target.matches?.('.choice-find'))return;
  const list=e.target.closest('.lume-choice'),query=choiceNorm(e.target.value.trim());
  let visible=false;
  for(const option of $$('[data-act="choice-pick"]',list)){
    option.hidden=!choiceNorm(option.textContent).includes(query);
    if(!option.hidden)visible=true;
  }
  $('[data-choice-empty]',list).hidden=visible;
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&dismissChoice()){e.preventDefault();e.stopImmediatePropagation();}
});
