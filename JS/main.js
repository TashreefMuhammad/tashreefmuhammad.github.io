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
  });

  mql.addEventListener('change', () => {
    if ((localStorage.getItem(storageKey) || 'auto') === 'auto') apply('auto');
  });
})();

// ---------- UTILITIES ----------
async function getJSON(url, key, ttlMs = 3600 * 1000) {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.t && (now - parsed.t < ttlMs) && parsed.data) {
        return parsed.data;
      }
    }
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(url + ': ' + res.status);
    const data = await res.json();
    if (data && (Array.isArray(data) || typeof data === 'object')) {
      localStorage.setItem(key, JSON.stringify({ t: Date.now(), data }));
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
      const parts = []; if (p.links.paper) parts.push(mk('Paper (DOI)', p.links.paper)); if (p.links.dataset) parts.push(mk('Dataset (DOI)', p.links.dataset)); if (p.links.code) parts.push(mk('Code', p.links.code));
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
  let list = items.slice().sort((a, b) => (b.year || 0) - (a.year || 0)); if (selectedOnly) list = list.filter(p => p.selected); if (limit) list = list.slice(0, limit);
  for (const p of list) {
    const li = document.createElement('li'); const s = document.createElement('strong'); s.textContent = p.title || 'Untitled'; li.appendChild(s);
    const meta = []; if (p.venue) meta.push(p.venue); if (p.year) meta.push(p.year); li.append(` — ${meta.join(', ')}. `);
    if (p.doi) { const a = document.createElement('a'); a.href = p.doi; a.textContent = 'DOI'; a.rel = 'noopener'; li.appendChild(a); }
    ul.appendChild(li);
  }
}
function renderDatasets(items, { containerSel } = {}) {
  const list = $(containerSel); if (!list || !items) return; list.innerHTML = '';
  for (const d of items) {
    const row = document.createElement('div'); row.className = 'list-item';
    const left = document.createElement('div'); left.innerHTML = `<strong>${d.name}</strong> — ${d.blurb || ''}`;
    const right = document.createElement('div'); if (d.doi) { const a = document.createElement('a'); a.href = d.doi; a.textContent = 'DOI'; a.rel = 'noopener'; right.appendChild(a); }
    row.append(left, right); list.appendChild(row);
  }
}

// ---------- INIT ----------
(async function init() {
  // Data fetch (absolute root paths)
  const metrics = await getJSON('/Data/metrics.json', 'metrics.json');
  const projects = await getJSON('/Data/projects.json', 'projects.json');
  const pubs = await getJSON('/Data/publications.json', 'publications.json');
  const datasets = await getJSON('/Data/datasets.json', 'datasets.json');

  const path = location.pathname.toLowerCase();
  const onIndex = path === '/' || path.endsWith('/index.html');
  const onProjects = path.endsWith('/projects.html');
  const onPubs = path.endsWith('/publications.html');

  if (onIndex) {
    renderProjects(projects, { containerSel: '#featured .card-grid', featuredOnly: true, limit:6 });
    renderPublications(pubs, { containerSel: '#publications .pubs', selectedOnly: true, limit:5 });
    renderDatasets(datasets, { containerSel: '#datasets .list' });
  }
  if (onProjects) { renderProjects(projects, { containerSel: '.card-grid', featuredOnly: false, limit: null }); }
  if (onPubs) { renderPublications(pubs, { containerSel: '.pubs', selectedOnly: false, limit: null }); }
})();