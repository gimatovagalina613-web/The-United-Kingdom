'use strict';
const countries=[
 {id:'scotland',name:'Scotland',capital:'Edinburgh',flag:'gb-sct',color:'#8c54cf',light:'#f0e6ff',x:277,y:208},
 {id:'england',name:'England',capital:'London',flag:'gb-eng',color:'#ed6665',light:'#ffeded',x:425,y:460},
 {id:'wales',name:'Wales',capital:'Cardiff',flag:'gb-wls',color:'#38a67c',light:'#e7f9ef',x:253,y:511},
 {id:'ni',name:'Northern Ireland',capital:'Belfast',flag:'gb',color:'#dda324',light:'#fff6d8',x:113,y:333}
];
const stages=[{title:'Build the UK map',instruction:'Drag each country onto its place on the map.',tray:'Your puzzle pieces'},{title:'Find the four capitals',instruction:'Drag each capital to the country it belongs to.',tray:'Capital city cards'},{title:'Match the flags',instruction:'Drag each flag to its country on the map.',tray:'Your flag collection'}];
const callouts={scotland:{x:451,y:153},england:{x:496,y:383},wales:{x:140,y:535},ni:{x:114,y:429}};
const associations={scotland:'Castles and bagpipes!',england:'Big Ben and London’s red buses!',wales:'The red dragon and daffodil!',ni:'Titanic and the Giant’s Causeway!'};
const cityScenes={scotland:'Edinburgh Castle',england:'Big Ben in London',wales:'Cardiff Castle',ni:'Belfast City Hall'};
let stage=0,selected=null,solved=[new Set(),new Set(),new Set()],geometry=[],order=[],suppressClick=false;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const shuffle=a=>a.slice().sort(()=>Math.random()-.5);
const state=()=>({stage:stage+1,matched:solved.map(s=>[...s]),selected});
function setFeedback(text,kind=''){const el=$('#feedback');el.textContent=text;el.className='feedback '+kind;}
function country(id){return countries.find(c=>c.id===id);}
function choose(id){if(solved[stage].has(id))return;selected=selected===id?null:id;$$('.piece').forEach(el=>{el.classList.toggle('selected',el.dataset.id===selected);el.setAttribute('aria-pressed',String(el.dataset.id===selected));});if(selected)setFeedback('Now tap its place on the map.');}
function drop(id,target){
 if(!country(id)||!country(target))return {correct:false,reason:'Unknown country'};
 if(solved[stage].has(id))return {correct:false,reason:'Already matched'};
 if(id!==target){setFeedback('Not quite! Try another place.','try');const el=$('.piece[data-id="'+id+'"]');el?.classList.add('shake');setTimeout(()=>el?.classList.remove('shake'),350);return {correct:false};}
 solved[stage].add(id);selected=null;render();const c=country(id);
 setFeedback(stage===0?'You found '+c.name+'! '+associations[c.id]:stage===1?c.capital+' is the capital of '+c.name+'.':c.id==='ni'?'Well done! The Union Flag is used here.':'Great! That is the flag of '+c.name+'.','good');
 if(solved[stage].size===4)setFeedback(stage===2?'All 12 matches complete! Your passport is ready.':'Mission complete! Ready for the next one?','good');
 return {correct:true,...state()};
}
function label(c,i){
 const done=solved[stage].has(c.id);c={...c,...callouts[c.id]};const y=c.y;
 if(stage===0&&!done)return `<g class="drop-label" role="button" tabindex="0" data-country="${c.id}" aria-label="Map place ${i+1}"><circle cx="${c.x}" cy="${y}" r="25" class="badge"/><text x="${c.x}" y="${y+8}" text-anchor="middle" class="number">${i+1}</text></g>`;
 let bottom=stage===0?'✓':stage===1?(done?c.capital:'Drop capital here'):(done?c.capital:'Drop flag here');
 const height=stage===2&&done?94:62;
 return `<g class="drop-label" role="button" tabindex="0" data-country="${c.id}" aria-label="${c.name}: ${done?'matched':'drop your '+(stage===1?'capital':'flag')+' here'}"><rect class="badge" x="${c.x-80}" y="${y-28}" width="160" height="${height}" rx="12"/><text x="${c.x}" y="${y-7}" text-anchor="middle" class="country-label">${c.name}</text>${stage===2&&done?`<image href="assets/${c.flag}.svg" x="${c.x-24}" y="${y+1}" width="48" height="29"/><text x="${c.x}" y="${y+50}" text-anchor="middle" class="answer">${c.capital}</text>`:`<text x="${c.x}" y="${y+17}" text-anchor="middle" class="answer">${bottom}</text>`}</g>`;
}
function texture(g,prefix){
 const [x,y,w,h]=g.box,id=prefix+'-'+g.id;
 return `<pattern id="${id}" patternUnits="userSpaceOnUse" x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><image href="assets/fill-${g.id}.webp" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/></pattern>`;
}
function render(){
 const s=stages[stage];$('#eyebrow').textContent='MISSION '+(stage+1)+' OF 3';$('#heading').textContent=s.title;$('#instruction').textContent=s.instruction;$('#tray-title').textContent=s.tray;$('#count').textContent=solved[stage].size+' / 4';$('#meter').style.width=solved[stage].size*25+'%';$('#tray-count').textContent=4-solved[stage].size+' left';
 $$('[data-stage]').forEach(el=>{let n=+el.dataset.stage;el.disabled=n>0&&solved[n-1].size<4;el.classList.toggle('active',n===stage);el.classList.toggle('complete',solved[n].size===4&&n!==stage);el.setAttribute('aria-current',n===stage?'step':'false');});
 $('#regions').innerHTML='<defs>'+geometry.map(g=>texture(g,'map-fill')).join('')+'</defs>'+countries.map(c=>{const g=geometry.find(g=>g.id===c.id);return `<path d="${g.path}" data-country="${c.id}" class="region illustrated ${solved[0].has(c.id)?'done':''}" style="--color:${c.color};--light:${c.light};fill:url(#map-fill-${c.id})"/>`;}).join('');
 $('#regions').innerHTML+=['border-halo','border-line'].map(cls=>`<g class="${cls}" aria-hidden="true" pointer-events="none">${geometry.map(g=>`<path d="${g.path}"/>`).join('')}</g>`).join('');
 $('#leaders').innerHTML=countries.map(c=>`<path d="M${c.x},${c.y} L${callouts[c.id].x},${callouts[c.id].y}" stroke="${c.color}" stroke-width="1.8" stroke-dasharray="4 4" fill="none" pointer-events="none"/>`).join('');
 $('#labels').innerHTML=countries.map(label).join('');
 $('#cards').innerHTML=order[stage].map(id=>{const c=country(id),g=geometry.find(g=>g.id===id),done=solved[stage].has(id);
 let visual=stage===0?`<svg viewBox="${g.box.join(' ')}" aria-hidden="true"><defs>${texture(g,'card-fill')}</defs><path d="${g.path}" fill="url(#card-fill-${id})" stroke="${c.color}" stroke-width="3"/></svg>`:stage===1?`<span class="postcard-scene"><img src="assets/city-${id}.webp" alt="${cityScenes[id]}" draggable="false">${done?'<span class="postcard-check" aria-hidden="true">✓</span>':''}</span>`:`<img src="assets/${c.flag}.svg" alt="${id==='ni'?'Union Flag':'Flag card'}">`;
 let text=stage===0?c.name:stage===1?c.capital:id==='ni'?'Union Flag':'Flag '+(countries.findIndex(x=>x.id===id)+1);
 // The flag round uses neutral card labels so the learner must recognise the flag.
 return `<button class="piece ${stage===1?'capital':''} ${done?'placed':''}" data-id="${id}" ${done?'disabled':''} aria-pressed="false" style="--color:${stage===2?'#4c95d0':c.color};--light:${stage===2?'#edf6ff':c.light}">${visual}<span class="postcard-name">${text}</span><span class="grab">${done?'✓ Matched':'Drag or tap'}</span></button>`;
 }).join('');
 $('#next').disabled=solved[stage].size!==4;$('#next').textContent=stage===2?'Collect your explorer badge':'Next mission';
}
function reset(){stage=0;selected=null;solved=[new Set(),new Set(),new Set()];order=[shuffle(countries.map(c=>c.id)),shuffle(countries.map(c=>c.id)),shuffle(countries.map(c=>c.id))];$('#win').open&&$('#win').close();render();setFeedback('Pick a piece and find its place!');}
function switchStage(n){if(n<0||n>2||n>0&&solved[n-1].size!==4)return false;stage=n;selected=null;render();setFeedback('Pick a card and find its place!');return true;}
function celebrate(){ $('#win').showModal();for(let i=0;i<45;i++){const el=document.createElement('i');el.className='confetti';el.style.left=Math.random()*100+'%';el.style.background=['#ef627c','#f7c13b','#38a97c','#8660d0','#459dc9'][i%5];el.style.animationDelay=Math.random()*.6+'s';document.body.append(el);setTimeout(()=>el.remove(),3600);}}
$('#reset').onclick=reset;$('#win-reset').onclick=reset;$('#review').onclick=()=>$('#win').close();$$('[data-stage]').forEach(el=>el.onclick=()=>switchStage(+el.dataset.stage));$('#next').onclick=()=>{if(solved[stage].size!==4)return;if(stage<2)switchStage(stage+1);else celebrate();};
$('#cards').addEventListener('click',e=>{const el=e.target.closest('.piece');if(el&&!suppressClick&&!el.disabled)choose(el.dataset.id);});
$('#map').addEventListener('click',e=>{const target=e.target.closest('[data-country]');if(target&&selected)drop(selected,target.dataset.country);});
$('#map').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();const t=e.target.closest('[data-country]');if(t&&selected)drop(selected,t.dataset.country);}});
let drag=null;
$('#cards').addEventListener('pointerdown',e=>{const el=e.target.closest('.piece');if(!el||el.disabled||e.button!==0)return;drag={id:el.dataset.id,el,startX:e.clientX,startY:e.clientY,ghost:null,pointerId:e.pointerId};el.setPointerCapture(e.pointerId);});
document.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointerId)return;const dist=Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY);if(!drag.ghost&&dist>7){drag.ghost=drag.el.cloneNode(true);drag.ghost.classList.add('ghost');drag.ghost.classList.remove('selected');drag.ghost.removeAttribute('id');drag.ghost.removeAttribute('aria-pressed');drag.ghost.setAttribute('aria-hidden','true');document.body.append(drag.ghost);drag.el.classList.add('drag-source');}if(drag.ghost){drag.ghost.style.left=e.clientX-75+'px';drag.ghost.style.top=e.clientY-50+'px';}});
function finishDrag(e,cancel=false){if(!drag||e.pointerId!==drag.pointerId)return;const d=drag;drag=null;d.el.classList.remove('drag-source');if(d.ghost){d.ghost.remove();suppressClick=true;setTimeout(()=>suppressClick=false,50);if(!cancel){const t=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-country]');if(t)drop(d.id,t.dataset.country);else setFeedback('Drop the card onto a country on the map.');}}}
document.addEventListener('pointerup',e=>finishDrag(e));document.addEventListener('pointercancel',e=>finishDrag(e,true));
async function init(){try{const r=await fetch('assets/map.json');if(!r.ok)throw Error('Map unavailable');geometry=await r.json();reset();}catch(e){setFeedback('The map could not load. Please refresh the page.','try');$('#heading').textContent='Let’s try again';return;}
 const context=document.modelContext;if(context?.registerTool){const lifecycle=new AbortController();const register=tool=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch(e){}};
 register({name:'get_puzzle_state',description:'Read the current UK puzzle mission and matched cards.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>state()});
 register({name:'match_puzzle_cards',description:'Match one or more cards to map countries in the current mission, with the same answer checking as dragging.',inputSchema:{type:'object',properties:{matches:{type:'array',items:{type:'object',properties:{card:{type:'string',enum:countries.map(c=>c.id)},target:{type:'string',enum:countries.map(c=>c.id)}},required:['card','target'],additionalProperties:false},maxItems:4}},required:['matches'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||!Array.isArray(input.matches)||input.matches.length>4||input.matches.some(m=>!country(m.card)||!country(m.target)))throw Error('Invalid matches');return input.matches.map(m=>drop(m.card,m.target));}});
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 }
}
init();
