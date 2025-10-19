// Theme toggle (Light/Dark/Auto) — Jekyll build
(() => {
  const storageKey='theme'; const mql=window.matchMedia('(prefers-color-scheme: dark)');
  function apply(theme){
    const btn=document.getElementById('theme-toggle');
    if(theme==='light'){ document.documentElement.setAttribute('data-theme','light'); if(btn){btn.textContent='🌙'; btn.setAttribute('aria-label','Switch to dark theme');} }
    else if(theme==='dark'){ document.documentElement.setAttribute('data-theme','dark'); if(btn){btn.textContent='☀️'; btn.setAttribute('aria-label','Switch to light theme');} }
    else{ document.documentElement.removeAttribute('data-theme'); const dark=mql.matches; if(btn){btn.textContent=dark?'☀️':'🌙'; btn.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');} }
  }
  let choice=localStorage.getItem(storageKey)||'auto'; apply(choice);
  document.addEventListener('click',(e)=>{ if(!e.target.closest('#theme-toggle')) return;
    choice=(choice==='dark')?'light':(choice==='light')?'auto':'dark'; localStorage.setItem(storageKey,choice); apply(choice);
  });
  mql.addEventListener('change',()=>{ if((localStorage.getItem(storageKey)||'auto')==='auto') apply('auto'); });
})();

async function getJSON(url, key, ttlMs=3600*1000){
  try{
    const now=Date.now(); const raw=localStorage.getItem(key);
    if(raw){ const {t,data}=JSON.parse(raw); if(now-t<ttlMs) return data; }
    const res=await fetch(url,{cache:'no-store'}); if(!res.ok) throw new Error(url+': '+res.status);
    const data=await res.json(); localStorage.setItem(key, JSON.stringify({t:Date.now(), data})); return data;
  }catch(e){ console.warn(e.message); return null; }
}
const $=(s,r=document)=>r.querySelector(s);
// Metrics
function applyMetrics(m){ if(!m) return; const map={ '#pubs-total':m.pubsTotal,'#pubs-peer':m.pubsPeer,'#cites-gs':m.citesGS,'#cites-scopus':m.citesScopus,'#metrics-asof':`as of ${m.asOf}` };
  Object.entries(map).forEach(([sel,val])=>{ const el=$(sel); if(el&&val!==undefined) el.textContent=val; });
}
// Projects
function renderProjects(items,{containerSel,featuredOnly=true,limit=3}={}){
  const grid=$(containerSel); if(!grid||!items) return; grid.innerHTML='';
  let list=featuredOnly?items.filter(p=>p.featured):items.slice(); if(limit) list=list.slice(0,limit);
  for(const p of list){
    const card=document.createElement('article'); card.className='card';
    const head=document.createElement('div'); head.className='card-head';
    const h3=document.createElement('h3'); h3.textContent=p.title||'Untitled'; head.appendChild(h3);
    if(p.badge){ const b=document.createElement('span'); b.className='badge'; b.textContent=p.badge; head.appendChild(b); }
    card.appendChild(head);
    if(p.description){ const d=document.createElement('p'); d.textContent=p.description; card.appendChild(d); }
    if(p.links && Object.keys(p.links).length){
      const links=document.createElement('p'); links.className='links';
      const mk=(label,href)=>{ const a=document.createElement('a'); a.textContent=label; a.href=href; a.rel='noopener'; return a; };
      const parts=[]; if(p.links.paper) parts.push(mk('Paper (DOI)',p.links.paper)); if(p.links.dataset) parts.push(mk('Dataset (DOI)',p.links.dataset)); if(p.links.code) parts.push(mk('Code',p.links.code));
      parts.forEach((a,i)=>{ links.appendChild(a); if(i<parts.length-1){ const dot=document.createElement('span'); dot.textContent=' · '; links.appendChild(dot);} });
      card.appendChild(links);
    }
    if(Array.isArray(p.tags)&&p.tags.length){ const tags=document.createElement('div'); tags.className='tags'; p.tags.forEach(t=>{ const chip=document.createElement('span'); chip.className='chip small'; chip.textContent=t; tags.appendChild(chip); }); card.appendChild(tags); }
    grid.appendChild(card);
  }
}
// Publications
function renderPublications(items,{containerSel,selectedOnly=true,limit=5}={}){
  const ul=$(containerSel); if(!ul||!items) return; ul.innerHTML='';
  let list=items.slice().sort((a,b)=>(b.year||0)-(a.year||0)); if(selectedOnly) list=list.filter(p=>p.selected); if(limit) list=list.slice(0,limit);
  for(const p of list){ const li=document.createElement('li'); const s=document.createElement('strong'); s.textContent=p.title||'Untitled'; li.appendChild(s);
    const meta=[]; if(p.venue) meta.push(p.venue); if(p.year) meta.push(p.year); li.appendChild(document.createTextNode(` — ${meta.join(', ')}. `));
    if(p.doi){ const a=document.createElement('a'); a.href=p.doi; a.textContent='DOI'; a.rel='noopener'; li.appendChild(a); } ul.appendChild(li); }
}
// Datasets
function renderDatasets(items,{containerSel}={}){
  const list=$(containerSel); if(!list||!items) return; list.innerHTML='';
  for(const d of items){ const row=document.createElement('div'); row.className='list-item';
    const left=document.createElement('div'); left.innerHTML=`<strong>${d.name}</strong> — ${d.blurb||''}`;
    const right=document.createElement('div'); if(d.doi){ const a=document.createElement('a'); a.href=d.doi; a.textContent='DOI'; a.rel='noopener'; right.appendChild(a); }
    row.appendChild(left); row.appendChild(right); list.appendChild(row); }
}
// Init
(async function init(){
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
  const metrics=await getJSON('{{ "/Data/metrics.json" | relative_url }}','metrics.json'); applyMetrics(metrics);
  const path=location.pathname.toLowerCase();
  const onIndex=path.endsWith('/')||path.endsWith('/index.html');
  const onProjects=path.endsWith('/projects.html');
  const onPubs=path.endsWith('/publications.html');
  const projects=await getJSON('{{ "/Data/projects.json" | relative_url }}','projects.json');
  if(onIndex) renderProjects(projects,{containerSel:'#featured .card-grid',featuredOnly:true,limit=6});
  if(onProjects) renderProjects(projects,{containerSel:'.card-grid',featuredOnly:false,limit:null});
  const pubs=await getJSON('{{ "/Data/publications.json" | relative_url }}','publications.json');
  if(onIndex) renderPublications(pubs,{containerSel:'#publications .pubs',selectedOnly:true,limit=5});
  if(onPubs) renderPublications(pubs,{containerSel:'.pubs',selectedOnly:false,limit:null});
  const datasets=await getJSON('{{ "/Data/datasets.json" | relative_url }}','datasets.json'); 
  if(onIndex) renderDatasets(datasets,{containerSel:'#datasets .list'});
})();