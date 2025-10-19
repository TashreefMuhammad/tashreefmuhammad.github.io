// ---------- THEME TOGGLE (Light → Dark → Auto with explicit "Auto" icon) ----------
(() => {
  const storageKey = 'theme';
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const btnId = 'theme-toggle';

  function apply(choice) {
    const btn = document.getElementById(btnId);
    if (choice === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      if (btn) { btn.textContent = '🌙'; btn.title = 'Switch to dark'; btn.setAttribute('aria-label', 'Switch to dark theme'); }
    } else if (choice === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (btn) { btn.textContent = '☀️'; btn.title = 'Switch to light'; btn.setAttribute('aria-label', 'Switch to light theme'); }
    } else {
      document.documentElement.removeAttribute('data-theme'); // Auto = follow system
      const dark = mql.matches;
      if (btn) {
        btn.textContent = '🖥️'; // explicit "Auto" icon
        btn.title = `Auto (system is ${dark ? 'dark' : 'light'})`;
        btn.setAttribute('aria-label', 'Auto theme (follow system)');
      }
    }
  }

  let choice = localStorage.getItem(storageKey) || 'auto';

  document.addEventListener('DOMContentLoaded', () => {
    apply(choice);

    const btn = document.getElementById(btnId);
    if (btn) btn.addEventListener('click', () => {
      choice = (choice === 'dark') ? 'light' : (choice === 'light') ? 'auto' : 'dark';
      localStorage.setItem(storageKey, choice);
      apply(choice);
    });

    // Sticky header shadow on scroll
    const sh = document.querySelector('.site-header');
    const onScroll = () => {
      if (!sh) return;
      if (window.scrollY > 8) sh.classList.add('scrolled'); else sh.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Footer year
    const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

    // Active section highlight (nav)
    const sections = document.querySelectorAll('main .section[id]');
    const navLinks = Array.from(document.querySelectorAll('.nav a'))
      .filter(a => a.hash && document.querySelector(a.hash));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        const link = navLinks.find(a => a.hash === `#${id}`);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: [0, 1] });

    sections.forEach(s => io.observe(s));
  });

  mql.addEventListener('change', () => {
    if ((localStorage.getItem(storageKey) || 'auto') === 'auto') apply('auto');
  });
})();

// ---------- Data cache/version (bump when Data/*.json changes) ----------
const DATA_VERSION = '2025-10-20-02';
const URL_FORCE_REFRESH = new URLSearchParams(location.search).has('refresh');

// ---------- UTILITIES ----------
async function getJSON(url, key, ttlMs = 3600 * 1000) {
  const storageKey = `${key}@${DATA_VERSION}`;
  const fetchURL = `${url}?v=${DATA_VERSION}`;
  try {
    const now = Date.now();
    if (!URL_FORCE_REFRESH) {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.t && (now - parsed.t < ttlMs) && parsed.data) {
          return parsed.data;
        }
      }
    } else {
      Object.keys(localStorage).forEach(k => { if (k.startsWith(key + '@')) localStorage.removeItem(k); });
    }

    const res = await fetch(fetchURL, { cache: 'no-store' });
    if (!res.ok) throw new Error(fetchURL + ': ' + res.status);
    const data = await res.json();
    if (data && (Array.isArray(data) || typeof data === 'object')) {
      localStorage.setItem(storageKey, JSON.stringify({ t: now, data }));
    }
    return data;
  } catch (e) {
    console.warn('getJSON failed', e);
    return null;
  }
}
const $ = (s, r = document) => r.querySelector(s);

// ---------- RENDERERS ----------
function renderProjects(items, { containerSel, featuredOnly = true, limit = 3 } = {}) {
  const grid = $(containerSel); if (!grid || !items) return; grid.innerHTML = '';
  let list = featuredOnly ? items.filter(p => p.featured) : items.slice(); if (limit) list = list.slice(0, limit);
  for (const p of list) {
    const card = document.createElement('article'); card.className = 'card';
    const head = document.createElement('div'); head.className = 'card-head';
    const h3 = document.createElement('h3'); h3.textContent = p.title || 'Untitled'; head.appendChild(h3);
    if (p.badge) { const b = document.createElement('span'); b.className = 'badge'; b.textContent = p.badge; head.appendChild(b); }
    card.appendChild(head);
    if (p.description) { const d = document.createElement('p'); d.textContent = p.description; card.appendChild(d); }
    if (p.links && Object.keys(p.links).length) {
      const links = document.createElement('p'); links.className = 'links';
      const mk = (label, href) => { const a = document.createElement('a'); a.textContent = label; a.href = href; a.rel = 'noopener'; return a; };
      const parts = [];
      if (p.links.paper)   parts.push(mk('Paper (DOI)', p.links.paper));
      if (p.links.preprint)parts.push(mk('Preprint', p.links.preprint));
      if (p.links.dataset) parts.push(mk('Dataset (DOI)', p.links.dataset));
      if (p.links.code)    parts.push(mk('Code', p.links.code));
      if (p.links.page)    parts.push(mk('Page', p.links.page));
      parts.forEach((a, i) => { links.appendChild(a); if (i < parts.length - 1) links.append(' · '); });
      card.appendChild(links);
    }
    if (Array.isArray(p.tags) && p.tags.length) {
      const tags = document.createElement('div'); tags.className = 'tags';
      p.tags.forEach(t => { const chip = document.createElement('span'); chip.className = 'chip small'; chip.textContent = t; tags.appendChild(chip); });
      card.appendChild(tags);
    }
    grid.appendChild(card);
  }
}

function renderPublications(items, { containerSel, selectedOnly = true, limit = 5 } = {}) {
  const ul = $(containerSel); if (!ul || !items) return; ul.innerHTML = '';
  let list = items.slice().sort((a, b) => (b.year || 0) - (a.year || 0));
  if (selectedOnly) list = list.filter(p => p.selected);
  if (limit) list = list.slice(0, limit);

  for (const p of list) {
    const li = document.createElement('li');

    // title + type badge
    const head = document.createElement('div');
    head.style.display = 'flex'; head.style.gap = '8px'; head.style.alignItems = 'baseline'; head.style.flexWrap = 'wrap';
    const title = document.createElement('strong'); title.textContent = p.title || 'Untitled';
    head.appendChild(title);

    if (p.type) {
      const badge = document.createElement('span'); badge.className = 'chip small';
      badge.textContent = p.type.toUpperCase();
      head.appendChild(badge);
    }
    li.appendChild(head);

    // meta line
    const meta = [];
    if (p.authors) meta.push(p.authors);
    if (p.venue) meta.push(p.venue);
    if (p.year)  meta.push(p.year);
    if (meta.length) {
      const metaEl = document.createElement('div');
      metaEl.className = 'muted small';
      metaEl.textContent = meta.join(' · ');
      li.appendChild(metaEl);
    }

    // links
    const links = [];
    if (p.doi)      links.push({label:'DOI', href:p.doi});
    if (p.preprint) links.push({label:'Preprint', href:p.preprint});
    if (p.code)     links.push({label:'Code', href:p.code});
    if (links.length) {
      const linksEl = document.createElement('div'); linksEl.className = 'links';
      links.forEach((l, i) => {
        const a = document.createElement('a'); a.href = l.href; a.textContent = l.label; a.rel = 'noopener';
        linksEl.appendChild(a); if (i < links.length - 1) linksEl.append(' · ');
      });
      li.appendChild(linksEl);
    }

    ul.appendChild(li);
  }
}

function renderDatasets(items, { containerSel } = {}) {
  const list = $(containerSel); if (!list || !items) return; list.innerHTML = '';
  for (const d of items) {
    const row = document.createElement('div'); row.className = 'list-item';
    const left = document.createElement('div');
    const title = document.createElement('strong'); title.textContent = d.name || 'Dataset';
    left.appendChild(title);
    if (d.blurb) left.append(` — ${d.blurb}`);

    const right = document.createElement('div');
    const parts = [];
    if (d.doi)  { const a = document.createElement('a'); a.href = d.doi;  a.textContent = 'DOI';  a.rel='noopener'; parts.push(a); }
    if (d.code) { const a = document.createElement('a'); a.href = d.code; a.textContent = 'Code'; a.rel='noopener'; parts.push(a); }
    if (d.page) { const a = document.createElement('a'); a.href = d.page; a.textContent = 'Page'; a.rel='noopener'; parts.push(a); }
    parts.forEach((a,i)=>{ right.appendChild(a); if(i<parts.length-1) right.append(' · '); });

    row.append(left, right); list.appendChild(row);
  }
}

// ---------- INIT ----------
(async function init() {
  // Data fetch (absolute root paths)
  const metrics  = await getJSON('/Data/metrics.json',      'metrics.json');
  const projects = await getJSON('/Data/projects.json',     'projects.json');
  const pubs     = await getJSON('/Data/publications.json', 'publications.json');
  const datasets = await getJSON('/Data/datasets.json',     'datasets.json');

  const path = location.pathname.toLowerCase();
  const onIndex    = path === '/' || path.endsWith('/index.html');
  const onProjects = path.endsWith('/projects.html');
  const onPubs     = path.endsWith('/publications.html');

  if (onIndex) {
    renderProjects(projects,    { containerSel: '#featured .card-grid', featuredOnly: true, limit: 6 });
    renderPublications(pubs,    { containerSel: '#publications .pubs', selectedOnly: true,  limit: 5 });
    renderDatasets(datasets,    { containerSel: '#datasets .list' });
  }
  if (onProjects) { renderProjects(projects, { containerSel: '.card-grid', featuredOnly: false, limit: null }); }
  if (onPubs)     { renderPublications(pubs, { containerSel: '.pubs', selectedOnly: false,     limit: null }); }
})();
