/* ============================================================
   JS/main.js — Tashreef Muhammad Academic Portfolio
   ============================================================ */

// ---------- THEME TOGGLE ----------
(() => {
  const storageKey = 'theme';
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const btnId = 'theme-toggle';

  function apply(choice) {
    const btn = document.getElementById(btnId);
    if (choice === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      if (btn) { btn.textContent = '🌙'; btn.title = 'Switch to dark'; }
    } else if (choice === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (btn) { btn.textContent = '☀️'; btn.title = 'Switch to light'; }
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (btn) {
        btn.textContent = '🖥️';
        btn.title = `Auto (system is ${mql.matches ? 'dark' : 'light'})`;
      }
    }
  }

  let choice = localStorage.getItem(storageKey) || 'auto';

  document.addEventListener('DOMContentLoaded', () => {
    apply(choice);

    const btn = document.getElementById(btnId);
    if (btn) btn.addEventListener('click', () => {
      choice = choice === 'dark' ? 'light' : choice === 'light' ? 'auto' : 'dark';
      localStorage.setItem(storageKey, choice);
      apply(choice);
    });

    // Sticky header shadow
    const sh = document.querySelector('.site-header');
    const onScroll = () => {
      if (!sh) return;
      sh.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Footer year
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    // Active nav highlight
    const sections = document.querySelectorAll('main .section[id]');
    const navLinks = Array.from(document.querySelectorAll('.primary-nav a'))
      .filter(a => a.hash && document.querySelector(a.hash));

    if (sections.length && navLinks.length) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('id');
          const link = navLinks.find(a => a.hash === `#${id}`);
          if (!link) return;
          navLinks.forEach(a => a.classList.remove('active'));
          link.classList.add('active');
        });
      }, { rootMargin: '-40% 0px -50% 0px', threshold: [0, 1] });
      sections.forEach(s => io.observe(s));
    }

    // Mobile nav
    const toggle = document.getElementById('nav-toggle');
    const drawer = document.getElementById('nav-drawer');
    const overlay = document.getElementById('nav-overlay');
    const closeBtn = document.getElementById('nav-close');

    function openNav() {
      drawer && drawer.classList.add('open');
      overlay && overlay.classList.add('open');
      toggle && toggle.setAttribute('aria-expanded', 'true');
    }
    function closeNav() {
      drawer && drawer.classList.remove('open');
      overlay && overlay.classList.remove('open');
      toggle && toggle.setAttribute('aria-expanded', 'false');
    }
    toggle   && toggle.addEventListener('click', openNav);
    closeBtn && closeBtn.addEventListener('click', closeNav);
    overlay  && overlay.addEventListener('click', closeNav);
    drawer   && drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

    // Scroll reveal
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length) {
      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      reveals.forEach(el => revealObserver.observe(el));
    }

    // Animated counters
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
      const cio = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          cio.unobserve(entry.target);
          const target = parseInt(entry.target.getAttribute('data-count'), 10);
          const suffix = entry.target.getAttribute('data-suffix') || '';
          const duration = 900;
          const start = performance.now();
          function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            entry.target.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.5 });
      counters.forEach(el => cio.observe(el));
    }
  });

  mql.addEventListener('change', () => {
    if ((localStorage.getItem(storageKey) || 'auto') === 'auto') apply('auto');
  });
})();

// ---------- Data fetch (HTTP cache handles freshness automatically) ----------
async function getJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn('getJSON failed', e);
    return null;
  }
}

const $ = (s, r = document) => r.querySelector(s);

// ---------- RENDERERS ----------

function renderProjects(items, { containerSel, featuredOnly = true, limit = 3 } = {}) {
  const grid = $(containerSel);
  if (!grid || !items) return;
  grid.innerHTML = '';
  let list = featuredOnly ? items.filter(p => p.featured) : items.slice();
  if (limit) list = list.slice(0, limit);
  for (const p of list) {
    const card = document.createElement('article');
    card.className = 'card reveal';

    const head = document.createElement('div');
    head.className = 'card-head';
    const h3 = document.createElement('h3'); h3.textContent = p.title || 'Untitled';
    head.appendChild(h3);
    if (p.badge) {
      const b = document.createElement('span'); b.className = 'badge'; b.textContent = p.badge;
      head.appendChild(b);
    }
    card.appendChild(head);

    if (p.description) {
      const d = document.createElement('p');
      d.style.fontSize = '.875rem'; d.style.margin = '0 0 8px'; d.style.color = 'var(--muted)';
      d.textContent = p.description;
      card.appendChild(d);
    }

    if (p.links && Object.keys(p.links).length) {
      const links = document.createElement('div');
      links.className = 'links';
      const mk = (label, href) => {
        const a = document.createElement('a');
        a.textContent = label; a.href = href; a.rel = 'noopener noreferrer'; a.target = '_blank';
        return a;
      };
      const parts = [];
      if (p.links.paper)    parts.push(mk('Paper', p.links.paper));
      if (p.links.preprint) parts.push(mk('Preprint', p.links.preprint));
      if (p.links.dataset)  parts.push(mk('Dataset', p.links.dataset));
      if (p.links.code)     parts.push(mk('Code', p.links.code));
      if (p.links.page)     parts.push(mk('Page', p.links.page));
      parts.forEach((a, i) => {
        links.appendChild(a);
        if (i < parts.length - 1) links.append(' · ');
      });
      card.appendChild(links);
    }

    if (Array.isArray(p.tags) && p.tags.length) {
      const tags = document.createElement('div');
      tags.className = 'tags'; tags.style.marginTop = '8px';
      p.tags.forEach(t => {
        const chip = document.createElement('span');
        chip.className = 'chip small'; chip.textContent = t;
        tags.appendChild(chip);
      });
      card.appendChild(tags);
    }

    grid.appendChild(card);
  }

  // re-trigger reveal observer
  setTimeout(() => triggerReveal(), 50);
}

function renderPublications(items, { containerSel, selectedOnly = true, limit = 5, filterType = null } = {}) {
  const ul = document.querySelector(containerSel);
  if (!ul || !items) return;
  ul.innerHTML = '';

  let list = items.slice().sort((a, b) => (b.year || 0) - (a.year || 0));
  if (selectedOnly) list = list.filter(p => p.selected);
  if (filterType && filterType !== 'all') list = list.filter(p => p.type === filterType);
  if (limit) list = list.slice(0, limit);

  for (const p of list) {
    const li = document.createElement('li');

    // Head row
    const head = document.createElement('div');
    head.className = 'pub-head';

    const title = document.createElement('span');
    title.className = 'pub-title'; title.textContent = p.title || 'Untitled';
    head.appendChild(title);

    if (p.type) {
      const badge = document.createElement('span');
      badge.className = 'chip small';
      const typeLabel = { journal: 'Journal', conference: 'Conference', preprint: 'Preprint' }[p.type] || p.type.toUpperCase();
      badge.textContent = typeLabel;
      head.appendChild(badge);
    }

    if (p.bibtex) {
      const btn = document.createElement('button');
      btn.className = 'btn-mini'; btn.type = 'button'; btn.textContent = 'BibTeX';
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(p.bibtex);
          btn.textContent = 'Copied!';
          setTimeout(() => btn.textContent = 'BibTeX', 1500);
        } catch { alert('Copy failed'); }
      });
      head.appendChild(btn);
    }
    li.appendChild(head);

    // Meta
    const meta = [];
    if (p.authors) meta.push(p.authors);
    if (p.venue)   meta.push(p.venue);
    if (p.year)    meta.push(p.year);
    if (meta.length) {
      const metaEl = document.createElement('div');
      metaEl.className = 'pub-meta'; metaEl.textContent = meta.join(' · ');
      li.appendChild(metaEl);
    }

    // Under review
    if (p.status === 'under_review' && (p.submitted_to || p.journal_rank)) {
      const st = document.createElement('div');
      st.className = 'pub-status-line';
      const parts = ['Under Review'];
      if (p.submitted_to) parts.push(`at ${p.submitted_to}`);
      if (p.publisher || p.journal_rank) {
        const extra = [p.publisher, p.journal_rank].filter(Boolean);
        parts.push(`(${extra.join(', ')})`);
      }
      st.textContent = parts.join(' ');
      li.appendChild(st);
    }

    // Links
    const linkDefs = [];
    if (p.doi)      linkDefs.push({ label: 'DOI', href: p.doi });
    if (p.preprint) linkDefs.push({ label: 'Preprint', href: p.preprint });
    if (p.code)     linkDefs.push({ label: 'Code', href: p.code });
    if (linkDefs.length) {
      const linksEl = document.createElement('div');
      linksEl.className = 'pub-links';
      linkDefs.forEach((l, i) => {
        const a = document.createElement('a');
        a.href = l.href; a.textContent = l.label;
        a.rel = 'noopener noreferrer'; a.target = '_blank';
        linksEl.appendChild(a);
        if (i < linkDefs.length - 1) linksEl.append(' · ');
      });
      li.appendChild(linksEl);
    }

    ul.appendChild(li);
  }
}

function renderDatasets(items, { containerSel } = {}) {
  const list = $(containerSel);
  if (!list || !items) return;
  list.innerHTML = '';
  for (const d of items) {
    const row = document.createElement('div');
    row.className = 'list-item';

    const left = document.createElement('div');
    const title = document.createElement('strong'); title.textContent = d.name || 'Dataset';
    left.appendChild(title);
    if (d.blurb) {
      const bl = document.createElement('div');
      bl.className = 'muted small'; bl.textContent = d.blurb;
      left.appendChild(bl);
    }

    const right = document.createElement('div');
    right.className = 'links';
    const parts = [];
    if (d.doi)  { const a = document.createElement('a'); a.href = d.doi; a.textContent = 'DOI'; a.rel = 'noopener'; a.target = '_blank'; parts.push(a); }
    if (d.code) { const a = document.createElement('a'); a.href = d.code; a.textContent = 'Code'; a.rel = 'noopener'; a.target = '_blank'; parts.push(a); }
    parts.forEach((a, i) => { right.appendChild(a); if (i < parts.length - 1) right.append(' · '); });

    row.append(left, right);
    list.appendChild(row);
  }
}

function triggerReveal() {
  const reveals = document.querySelectorAll('.reveal:not(.visible)');
  if (!reveals.length) return;
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); }
    });
  }, { threshold: 0.06 });
  reveals.forEach(el => ro.observe(el));
}

// ---------- FILTER TABS (publications page) ----------
function initFilterTabs(allItems, containerSel) {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const type = tab.getAttribute('data-filter');
      renderPublications(allItems, {
        containerSel,
        selectedOnly: false,
        limit: null,
        filterType: type
      });
    });
  });
}

// ---------- INIT ----------
(async function init() {
  const metrics  = await getJSON('/Data/metrics.json');
  const projects = await getJSON('/Data/projects.json');
  const pubs     = await getJSON('/Data/publications.json');
  const datasets = await getJSON('/Data/datasets.json');

  const path      = location.pathname.toLowerCase();
  const onIndex   = path === '/' || path.endsWith('/index.html');
  const onProjects = path.endsWith('/projects.html');
  const onPubs    = path.endsWith('/publications.html');

  if (onIndex && pubs && datasets && metrics) {
    const total    = pubs.length;
    const peer     = pubs.filter(p => p.type === 'journal' || p.type === 'conference').length;
    const cites    = metrics.citesGS;
    const datasetCount = datasets.length;

    const metricMap = {
      'm-total':    total,
      'm-peer':     peer,
      'm-cites':    cites,
      'm-datasets': datasetCount
    };

    Object.entries(metricMap).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (!el || val === undefined) return;
      // Animate count-up now that real value is known
      const duration = 900;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * val);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
    renderProjects(projects,   { containerSel: '#featured .card-grid', featuredOnly: true, limit: 6 });
    renderPublications(pubs,   { containerSel: '#publications .pubs', selectedOnly: true, limit: 5 });
    renderDatasets(datasets,   { containerSel: '#datasets .list' });
  }

  if (onProjects) {
    renderProjects(projects, { containerSel: '.card-grid', featuredOnly: false, limit: null });
  }

  if (onPubs && pubs) {
    renderPublications(pubs, { containerSel: '.pubs', selectedOnly: false, limit: null });
    initFilterTabs(pubs, '.pubs');

    // Update tab counts
    const counts = {
      all: pubs.length,
      journal: pubs.filter(p => p.type === 'journal').length,
      conference: pubs.filter(p => p.type === 'conference').length,
      preprint: pubs.filter(p => p.type === 'preprint').length,
    };
    document.querySelectorAll('.filter-tab').forEach(tab => {
      const f = tab.getAttribute('data-filter');
      const badge = tab.querySelector('.pub-count');
      if (badge && counts[f] !== undefined) badge.textContent = counts[f];
    });
  }

  // Trigger scroll reveal for statically-rendered elements
  document.addEventListener('DOMContentLoaded', triggerReveal);
  triggerReveal();
})();