/* =============================================================
   main.js — Tashreef Muhammad
   Everything on the page is rendered from /Data/*.json.
   To change content, edit the JSON. This file rarely needs edits.
   ============================================================= */

/* ---------- small helpers ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const attr = (s) => esc(s);

async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`${path} → ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Could not load', path, err);
    return null;
  }
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- inline icons ---------- */
const ICON = {
  mail:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6 9 7 9-7"/></svg>',
  file:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 2.5H6.5A1.5 1.5 0 0 0 5 4v16a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 20V7.5z"/><path d="M14 2.5V8h5"/></svg>',
  scholar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3 1.5 8.5 12 14l10.5-5.5z"/><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>',
  github:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.8a10.2 10.2 0 0 0-3.2 19.9c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.7-1.4-2.3-.3-4.7-1.1-4.7-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.7 5 .4.3.7 1 .7 2v2.9c0 .3.2.6.7.5A10.2 10.2 0 0 0 12 1.8"/></svg>',
  orcid:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M8.2 17H6.8V8.7h1.4zM7.5 7.4a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8M10 8.7h3.3c3.1 0 4.5 2.2 4.5 4.2 0 2.1-1.7 4.1-4.5 4.1H10zm1.4 1.2v5.9h1.8c2.6 0 3.2-2 3.2-3 0-1.6-1-2.9-3.2-2.9z"/></svg>',
  link:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 13a4 4 0 0 0 5.7.4l3-3A4 4 0 0 0 13 4.7l-1.7 1.7"/><path d="M14 11a4 4 0 0 0-5.7-.4l-3 3A4 4 0 0 0 11 19.3l1.7-1.7"/></svg>',
  linkedin:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5M3 9h4v12H3zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.6 4.78 6V21h-4v-5.5c0-1.3-.02-3-1.85-3-1.85 0-2.13 1.44-2.13 2.92V21h-4z"/></svg>',
  sun:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.2M12 19.8V22M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2 12h2.2M19.8 12H22M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/></svg>',
  moon:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2"/></svg>',
  auto:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="4" width="19" height="13" rx="1.8"/><path d="M8.5 20.5h7"/></svg>',
  arrow:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" width="15" height="15"><path d="M5 12h13M13 6l6 6-6 6"/></svg>'
};

/* ---------- theme ---------- */
(function theme() {
  const KEY = 'theme';
  const mql = window.matchMedia('(prefers-color-scheme: dark)');

  function apply(choice) {
    const btn = document.getElementById('theme-toggle');
    if (choice === 'light')      document.documentElement.setAttribute('data-theme', 'light');
    else if (choice === 'dark')  document.documentElement.setAttribute('data-theme', 'dark');
    else                         document.documentElement.removeAttribute('data-theme');

    if (btn) {
      btn.innerHTML = choice === 'light' ? ICON.sun : choice === 'dark' ? ICON.moon : ICON.auto;
      btn.title = choice === 'auto'
        ? `Theme: follows your system (${mql.matches ? 'dark' : 'light'})`
        : `Theme: ${choice}`;
      btn.setAttribute('aria-label', btn.title);
    }
  }

  let choice = localStorage.getItem(KEY) || 'auto';
  apply(choice);

  document.addEventListener('DOMContentLoaded', () => {
    apply(choice);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', () => {
      choice = choice === 'auto' ? 'light' : choice === 'light' ? 'dark' : 'auto';
      localStorage.setItem(KEY, choice);
      apply(choice);
    });
  });

  mql.addEventListener('change', () => {
    if ((localStorage.getItem(KEY) || 'auto') === 'auto') apply('auto');
  });
})();

/* ---------- header behaviour ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const header = $('.site-header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 6);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  const toggle  = document.getElementById('nav-toggle');
  const drawer  = document.getElementById('nav-drawer');
  const overlay = document.getElementById('nav-overlay');
  const close   = document.getElementById('nav-close');

  const open  = () => { drawer?.classList.add('open'); overlay?.classList.add('open'); toggle?.setAttribute('aria-expanded', 'true'); };
  const shut  = () => { drawer?.classList.remove('open'); overlay?.classList.remove('open'); toggle?.setAttribute('aria-expanded', 'false'); };
  toggle?.addEventListener('click', open);
  close?.addEventListener('click', shut);
  overlay?.addEventListener('click', shut);
  drawer && $$('a', drawer).forEach(a => a.addEventListener('click', shut));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });

  // active section in nav
  const sections = $$('main section[id]');
  const navLinks = $$('.primary-nav a').filter(a => a.hash && document.getElementById(a.hash.slice(1)));
  if (sections.length && navLinks.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const link = navLinks.find(a => a.hash === `#${e.target.id}`);
        if (!link) return;
        navLinks.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => io.observe(s));
  }
});

/* ---------- shared state ---------- */
const DATA = {};

function areaColor(key) {
  const a = DATA.site?.areas?.[key];
  return a ? `var(${a.colorVar})` : 'var(--accent)';
}
function areaLabel(key, short = true) {
  const a = DATA.site?.areas?.[key];
  if (!a) return '';
  return short ? a.short : a.label;
}

/** Publications actually shown on the site, honouring display.showPreprints. */
function visiblePubs() {
  const showPre = !!DATA.site?.display?.showPreprints;
  return (DATA.pubs || []).filter(p => showPre || p.status !== 'preprint');
}

function sortPubs(list) {
  const rank = { under_review: 0, published: 1, preprint: 2 };
  return list.slice().sort((a, b) =>
    (rank[a.status] ?? 3) - (rank[b.status] ?? 3) || (b.year || 0) - (a.year || 0) ||
    a.title.localeCompare(b.title)
  );
}

const STATUS_LABEL = { published: 'Published', under_review: 'Under review', preprint: 'Preprint' };
const TYPE_LABEL   = { journal: 'Journal', conference: 'Conference', preprint: 'Preprint' };

/* ---------- fragments ---------- */
function statusTag(status) {
  if (!status) return '';
  return `<span class="tag tag--${attr(status)}"><span class="dot"></span>${esc(STATUS_LABEL[status] || status)}</span>`;
}

function areaTag(area) {
  if (!area || area === 'other') return '';
  return `<span class="tag tag--area" style="color:${areaColor(area)};border-color:${areaColor(area)}33">${esc(areaLabel(area))}</span>`;
}

function linkTag(label, href) {
  if (!href) return '';
  return `<a class="pub-link" href="${attr(href)}" target="_blank" rel="noopener">${esc(label)}</a>`;
}

/** Bolds "Muhammad, T." inside an author string. */
function markSelf(authors) {
  return esc(authors).replace(/(Muhammad,\s*T\.)/g, '<span class="self">$1</span>');
}

/* ---------- renderers ---------- */

function renderHero(mount) {
  const s = DATA.site, m = DATA.metrics;
  if (!mount || !s) return;
  const p = s.profile, l = s.links;

  mount.innerHTML = `
    <div class="hero-grid">
      <div>
        <h1 class="hero-name">${esc(p.name)}</h1>
        <p class="hero-role">${esc(p.role)} · <a href="${attr(p.affiliationUrl)}" target="_blank" rel="noopener">${esc(p.affiliation)}</a></p>

        <p class="hero-statement">${esc(p.positioning)}</p>
        <p class="hero-summary">${esc(p.summary)}</p>

        <div class="hero-seeking"><span class="pip"></span>${esc(p.seeking)}</div>

        <div class="hero-links">
          <a class="hero-link solid" href="${attr(l.cv)}" target="_blank" rel="noopener">${ICON.file} Curriculum vitae</a>
          <a class="hero-link" href="mailto:${attr(l.email)}">${ICON.mail} Email</a>
          <a class="hero-link" href="${attr(l.scholar)}" target="_blank" rel="noopener">${ICON.scholar} Scholar</a>
          <a class="hero-link" href="${attr(l.github)}" target="_blank" rel="noopener">${ICON.github} GitHub</a>
          <a class="hero-link" href="${attr(l.orcid)}" target="_blank" rel="noopener">${ICON.orcid} ORCID</a>
        </div>
      </div>

      <div class="hero-aside">
        <div class="portrait-row">
          <img class="portrait" src="${attr(p.photo)}" alt="${attr(p.name)}" width="78" height="78"/>
          <div class="portrait-meta">
            <strong>${esc(p.location)}</strong>
            ${m ? `Google Scholar h-index ${esc(m.scholar.hIndex)} · Scopus h-index ${esc(m.scopus.hIndex)}<br>Figures as of ${esc(m.asOf)}` : ''}
          </div>
        </div>
        <div class="panel" id="citation-panel"></div>
      </div>
    </div>`;

  renderChart($('#citation-panel'));
}

/**
 * Citations-per-year chart. Bars for the yearly count, a line through the
 * same points so the trend reads at a glance. Drawn once on load.
 */
function renderChart(mount) {
  const m = DATA.metrics;
  if (!mount || !m?.citationsByYear?.length) return;

  const pts = m.citationsByYear;
  const W = 440, H = 186;
  const padL = 30, padR = 14, padT = 26, padB = 26;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const max = Math.max(...pts.map(d => d.count));
  const step = innerW / pts.length;

  const x = i => padL + step * i + step / 2;
  const y = v => padT + innerH - (v / (max * 1.12)) * innerH;

  const gridVals = [0, Math.round(max / 2), max];
  const grid = gridVals.map(v => `
    <line class="grid-line" x1="${padL}" x2="${W - padR}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/>
    <text class="axis-label" x="${padL - 7}" y="${(y(v) + 3.5).toFixed(1)}" text-anchor="end">${v}</text>`).join('');

  const barW = Math.min(26, step * 0.5);
  const bars = pts.map((d, i) => {
    const partial = i === pts.length - 1;
    return `<rect class="bar${partial ? ' partial' : ''}" x="${(x(i) - barW / 2).toFixed(1)}" y="${y(d.count).toFixed(1)}"
      width="${barW.toFixed(1)}" height="${(padT + innerH - y(d.count)).toFixed(1)}" rx="1.5"/>`;
  }).join('');

  const line = pts.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.count).toFixed(1)}`).join(' ');
  const area = `${line} L${x(pts.length - 1).toFixed(1)},${(padT + innerH).toFixed(1)} L${x(0).toFixed(1)},${(padT + innerH).toFixed(1)} Z`;

  const nodes = pts.map((d, i) =>
    `<circle class="node${reduceMotion ? '' : ' draw'}" cx="${x(i).toFixed(1)}" cy="${y(d.count).toFixed(1)}" r="3.4"/>`).join('');

  const values = pts.map((d, i) =>
    `<text class="value-label${reduceMotion ? '' : ' draw'}" x="${x(i).toFixed(1)}" y="${(y(d.count) - 9).toFixed(1)}" text-anchor="middle">${d.count}</text>`).join('');

  const xLabels = pts.map((d, i) =>
    `<text class="axis-label" x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${d.year}</text>`).join('');

  const total = pts.reduce((a, b) => a + b.count, 0);

  mount.innerHTML = `
    <div class="panel-head">
      <span class="panel-title">Citations per year</span>
      <span class="panel-sub">Google Scholar</span>
    </div>
    <div class="panel-body">
      <svg class="chart" viewBox="0 0 ${W} ${H}" role="img"
           aria-label="Citations per year from ${pts[0].year} to ${pts[pts.length - 1].year}, totalling ${total}.">
        ${grid}
        ${bars}
        <path class="series-area${reduceMotion ? '' : ' draw'}" d="${area}"/>
        <path class="series-line${reduceMotion ? '' : ' draw'}" d="${line}" pathLength="1000" style="--len:1000"/>
        ${nodes}
        ${values}
        ${xLabels}
      </svg>
    </div>
    <div class="panel-foot">
      <span>${esc(m.chartNote)}</span>
      <span>${m.scholar.citations} total · h-index ${m.scholar.hIndex} · i10 ${m.scholar.i10Index}</span>
    </div>`;
}

function renderStats(mount) {
  const pubs = visiblePubs(), m = DATA.metrics;
  if (!mount || !m) return;

  const peer   = pubs.filter(p => p.status === 'published' && p.type !== 'preprint').length;
  const review = pubs.filter(p => p.status === 'under_review').length;
  const data   = (DATA.datasets || []).length;

  const cells = [
    { v: peer,               l: 'Peer-reviewed papers' },
    { v: review,             l: 'Manuscripts under review' },
    { v: m.scholar.citations, l: `Citations · Scholar, ${m.asOf}` },
    { v: data,               l: 'Open datasets with DOIs' }
  ];

  mount.innerHTML = `<div class="stat-strip">${cells.map(c => `
    <div class="stat">
      <span class="stat-value" data-count="${c.v}">0</span>
      <span class="stat-label">${esc(c.l)}</span>
    </div>`).join('')}</div>`;

  countUp(mount);
}

function countUp(root) {
  const els = $$('[data-count]', root);
  if (!els.length) return;
  if (reduceMotion) { els.forEach(el => el.textContent = el.dataset.count); return; }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const target = parseInt(e.target.dataset.count, 10) || 0;
      const t0 = performance.now(), dur = 850;
      const tick = now => {
        const k = Math.min((now - t0) / dur, 1);
        e.target.textContent = Math.round((1 - Math.pow(1 - k, 3)) * target);
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  els.forEach(el => io.observe(el));

  // Safety net: if the observer never fires (printing, screenshotting, an
  // unusual viewport), the real numbers still appear.
  setTimeout(() => {
    els.forEach(el => {
      if (el.textContent === '0') el.textContent = el.dataset.count;
    });
  }, 3000);
}

function renderResearch(mount) {
  const s = DATA.site;
  if (!mount || !s?.research) return;
  const pubs = visiblePubs();

  mount.innerHTML = `<div class="research-list">${s.research.map(r => {
    const n = pubs.filter(p => p.area === r.area).length;
    const d = (DATA.datasets || []).filter(x => x.area === r.area).length;
    const bits = [];
    if (n) bits.push(`${n} paper${n === 1 ? '' : 's'}`);
    if (d) bits.push(`${d} dataset${d === 1 ? '' : 's'}`);
    return `
      <div class="research-row" style="--area-color:${areaColor(r.area)}">
        <div class="research-key">
          <span class="research-swatch"></span>
          <h3>${esc(r.heading)}</h3>
          <span class="research-count">${esc(bits.join(' · '))}</span>
        </div>
        <div class="research-body"><p>${esc(r.body)}</p></div>
        <ul class="research-threads">${(r.threads || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>`;
  }).join('')}</div>`;
}

function pubMarkup(p) {
  const tags = [
    statusTag(p.status),
    p.type ? `<span class="tag tag--plain">${esc(TYPE_LABEL[p.type] || p.type)}</span>` : '',
    p.rank ? `<span class="tag tag--rank tag--plain">${esc(p.rank)}</span>` : '',
    areaTag(p.area)
  ].filter(Boolean).join('');

  const venue = p.status === 'under_review'
    ? `Submitted to <em>${esc(p.submittedTo || p.venue)}</em>${p.publisher ? ` · ${esc(p.publisher)}` : ''}`
    : `<em>${esc(p.venue)}</em>${p.venueNote ? ` · ${esc(p.venueNote)}` : ''}`;

  const links = [
    linkTag('DOI', p.doi),
    linkTag('Preprint', p.preprint),
    linkTag('Code', p.code),
    linkTag('Data', p.data),
    p.bibtex ? `<button class="pub-link" type="button" data-bibtex="${attr(p.id)}">BibTeX</button>` : ''
  ].filter(Boolean).join('');

  return `
    <li class="pub" style="--area-color:${areaColor(p.area)}"
        data-status="${attr(p.status)}" data-type="${attr(p.type)}" data-area="${attr(p.area)}"
        data-search="${attr((p.title + ' ' + p.authors + ' ' + p.venue).toLowerCase())}">
      <h3 class="pub-title">${esc(p.title)}</h3>
      <p class="pub-authors">${markSelf(p.authors)}</p>
      <p class="pub-venue">${venue} <span class="pub-year">· ${esc(p.year)}</span></p>
      <div class="pub-tags">${tags}</div>
      <div class="pub-links">${links}</div>
    </li>`;
}

function renderPubs(mount, { selectedOnly = false, limit = null } = {}) {
  if (!mount) return;
  let list = sortPubs(visiblePubs());
  if (selectedOnly) list = list.filter(p => p.selected);
  if (limit) list = list.slice(0, limit);

  mount.innerHTML = `<ul class="pubs">${list.map(pubMarkup).join('')}</ul>`;
  wireBibtex(mount);
}

function wireBibtex(root) {
  $$('[data-bibtex]', root).forEach(btn => {
    btn.addEventListener('click', async () => {
      const p = (DATA.pubs || []).find(x => x.id === btn.dataset.bibtex);
      if (!p) return;
      try {
        await navigator.clipboard.writeText(p.bibtex);
        btn.textContent = 'Copied';
        btn.classList.add('copied');
      } catch {
        btn.textContent = 'Copy failed';
      }
      setTimeout(() => { btn.textContent = 'BibTeX'; btn.classList.remove('copied'); }, 1600);
    });
  });
}

/* ---------- publications page: filters ---------- */
function renderPubFilters(mount, listMount) {
  if (!mount) return;
  const pubs = visiblePubs();
  const areas = DATA.site?.areas || {};

  const count = (fn) => pubs.filter(fn).length;

  const statusSet = [
    ['all', 'All', pubs.length],
    ['published', 'Published', count(p => p.status === 'published')],
    ['under_review', 'Under review', count(p => p.status === 'under_review')]
  ];
  if (DATA.site?.display?.showPreprints) {
    statusSet.push(['preprint', 'Preprint', count(p => p.status === 'preprint')]);
  }

  const typeSet = [
    ['all', 'All', pubs.length],
    ['journal', 'Journal', count(p => p.type === 'journal')],
    ['conference', 'Conference', count(p => p.type === 'conference')]
  ];

  const areaSet = [['all', 'All', pubs.length]].concat(
    Object.keys(areas)
      .filter(k => count(p => p.area === k) > 0)
      .map(k => [k, areas[k].short, count(p => p.area === k)])
  );

  const group = (name, set) => `
    <div class="filter-group">
      <span>${esc(name)}</span>
      <div class="filter-set" data-group="${attr(name.toLowerCase())}">
        ${set.map(([v, label, n], i) => `
          <button class="filter-btn" type="button" data-value="${attr(v)}"
                  aria-pressed="${i === 0 ? 'true' : 'false'}">
            ${esc(label)} <span class="count">${n}</span>
          </button>`).join('')}
      </div>
    </div>`;

  mount.innerHTML = `
    ${group('Status', statusSet)}
    ${group('Type', typeSet)}
    ${group('Area', areaSet)}
    <div class="filter-search">
      <span>Search</span>
      <label class="sr-only" for="pub-search">Search publications</label>
      <input id="pub-search" type="search" placeholder="Title, author or venue" autocomplete="off"/>
    </div>`;

  const state = { status: 'all', type: 'all', area: 'all', q: '' };
  const resultLine = $('#result-line');

  function applyFilters() {
    const items = $$('.pub', listMount);
    let shown = 0;
    items.forEach(li => {
      const ok =
        (state.status === 'all' || li.dataset.status === state.status) &&
        (state.type   === 'all' || li.dataset.type   === state.type)   &&
        (state.area   === 'all' || li.dataset.area   === state.area)   &&
        (!state.q || li.dataset.search.includes(state.q));
      li.hidden = !ok;
      if (ok) shown++;
    });

    if (resultLine) {
      resultLine.textContent = shown === items.length
        ? `Showing all ${items.length} entries.`
        : `Showing ${shown} of ${items.length} entries.`;
    }

    const empty = $('#pub-empty');
    if (empty) empty.hidden = shown !== 0;
  }

  $$('.filter-set', mount).forEach(set => {
    const key = set.dataset.group;
    set.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      $$('.filter-btn', set).forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      state[key] = btn.dataset.value;
      applyFilters();
    });
  });

  const search = $('#pub-search', mount);
  search?.addEventListener('input', () => {
    state.q = search.value.trim().toLowerCase();
    applyFilters();
  });

  applyFilters();
}

/* ---------- artifacts ---------- */
function artifactMarkup(a) {
  const links = [
    linkTag('Paper', a.links?.paper),
    linkTag('Preprint', a.links?.preprint),
    linkTag('Data', a.links?.data),
    linkTag('Code', a.links?.code)
  ].filter(Boolean).join('');

  return `
    <article class="artifact" style="--area-color:${areaColor(a.area)}"
             data-area="${attr(a.area)}" data-status="${attr(a.status)}">
      <div class="artifact-head">
        <div>
          <h3>${esc(a.title)}</h3>
          <span class="artifact-kind">${esc(a.kind)}</span>
        </div>
        ${statusTag(a.status)}
      </div>
      <p>${esc(a.description)}</p>
      <div class="artifact-tags">${(a.tags || []).map(t => `<span class="tag tag--plain">${esc(t)}</span>`).join('')}</div>
      <div class="artifact-links">${links}</div>
    </article>`;
}

function renderArtifacts(mount, { featuredOnly = false, limit = null } = {}) {
  if (!mount) return;
  const showPre = !!DATA.site?.display?.showPreprints;
  let list = (DATA.artifacts || []).filter(a => showPre || a.status !== 'preprint');
  if (featuredOnly) list = list.filter(a => a.featured);
  if (limit) list = list.slice(0, limit);
  mount.innerHTML = `<div class="artifact-grid">${list.map(artifactMarkup).join('')}</div>`;
}

function renderArtifactFilters(mount, listMount) {
  if (!mount) return;
  const areas = DATA.site?.areas || {};
  const items = $$('.artifact', listMount);
  const present = Object.keys(areas).filter(k => items.some(i => i.dataset.area === k));

  mount.innerHTML = `
    <div class="filter-group">
      <span>Research area</span>
      <div class="filter-set" data-group="area">
        <button class="filter-btn" type="button" data-value="all" aria-pressed="true">All <span class="count">${items.length}</span></button>
        ${present.map(k => {
          const n = items.filter(i => i.dataset.area === k).length;
          return `<button class="filter-btn" type="button" data-value="${attr(k)}" aria-pressed="false">${esc(areas[k].short)} <span class="count">${n}</span></button>`;
        }).join('')}
      </div>
    </div>`;

  $('.filter-set', mount).addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    $$('.filter-btn', mount).forEach(b => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
    const v = btn.dataset.value;
    items.forEach(i => i.hidden = !(v === 'all' || i.dataset.area === v));
  });
}

/* ---------- datasets ---------- */
function renderDatasets(mount) {
  if (!mount || !DATA.datasets) return;
  mount.innerHTML = `<div class="dataset-list">${DATA.datasets.map(d => `
    <div class="dataset-row" style="--area-color:${areaColor(d.area)}">
      <div>
        <h3 class="dataset-name">${esc(d.name)} <span class="pub-year small">· ${esc(d.year)}</span></h3>
        <p class="dataset-full">${esc(d.fullName)}</p>
        <p class="dataset-blurb">${esc(d.blurb)}</p>
      </div>
      <div class="dataset-actions">
        ${linkTag(d.repository || 'DOI', d.doi)}
        ${linkTag('Code', d.code)}
      </div>
    </div>`).join('')}</div>`;
}

/* ---------- CV blocks ---------- */
function timelineMarkup(items, roleKey, orgKey) {
  return `<div class="timeline">${items.map(it => `
    <div class="tl-item">
      <div class="tl-when">
        <span class="from">${esc(it.from)}</span>
        ${it.present ? '<span class="tl-present">Present</span>' : `<span>to ${esc(it.to)}</span>`}
      </div>
      <div>
        <h3 class="tl-role">${esc(it[roleKey])}</h3>
        <p class="tl-org">${it.orgUrl
            ? `<a href="${attr(it.orgUrl)}" target="_blank" rel="noopener">${esc(it[orgKey])}</a>`
            : esc(it[orgKey])}${it.location ? ` · ${esc(it.location)}` : ''}</p>
        ${it.badges?.length ? `<div class="tl-badges">${it.badges.map(b => `<span class="tag tag--plain">${esc(b)}</span>`).join('')}</div>` : ''}
        <ul class="tl-notes">${(it.notes || []).map(n => `<li>${esc(n)}</li>`).join('')}</ul>
      </div>
    </div>`).join('')}</div>`;
}

function renderExperience(mount) {
  if (!mount || !DATA.cv?.experience) return;
  mount.innerHTML = timelineMarkup(DATA.cv.experience, 'role', 'org');
}

function renderEducation(mount) {
  if (!mount || !DATA.cv?.education) return;
  const items = DATA.cv.education.map(e => ({ ...e, org: e.institution, orgUrl: '' }));
  mount.innerHTML = timelineMarkup(items, 'degree', 'org');
}

function renderGrants(mount) {
  if (!mount || !DATA.cv?.grants) return;
  mount.innerHTML = DATA.cv.grants.map(g => `
    <div class="grant">
      <div class="grant-head">
        <h3 class="grant-title">${esc(g.title)}</h3>
        <span class="tag tag--under_review"><span class="dot"></span>${esc(g.role)}</span>
      </div>
      <p class="grant-meta">${esc(g.funder)} · ${esc(g.period)}</p>
      <p class="grant-summary">${esc(g.summary)}</p>
      <p class="subhead">Outputs</p>
      <ul class="grant-outcomes">${(g.outcomes || []).map(o => `
        <li>${o.url ? `<a href="${attr(o.url)}" target="_blank" rel="noopener">${esc(o.text)}</a>` : esc(o.text)}
          ${o.note ? `<span class="outcome-note">${esc(o.note)}</span>` : ''}
        </li>`).join('')}</ul>
    </div>`).join('');
}

function renderTeaching(mount) {
  const t = DATA.cv?.teaching;
  if (!mount || !t) return;
  mount.innerHTML = `
    <p class="section-note" style="margin-bottom:16px">${esc(t.context)}</p>
    <p class="subhead">Courses taught</p>
    <div class="course-list">
      ${t.courses.map(c => `<span class="course">${esc(c.name)}${c.code ? `<code>${esc(c.code)}</code>` : ''}</span>`).join('')}
    </div>
    <p class="subhead" style="margin-top:24px">Open course material</p>
    <p class="small muted" style="margin-bottom:12px">${esc(t.note)}</p>
    <div class="resource-list">
      ${t.resources.map(r => `
        <a class="resource" href="${attr(r.url)}" target="_blank" rel="noopener">
          <span><strong>${esc(r.name)}</strong><span>${esc(r.description)}</span></span>
          <span class="arrow">${ICON.arrow}</span>
        </a>`).join('')}
    </div>`;
}

function renderService(mount) {
  const cv = DATA.cv;
  if (!mount || !cv) return;
  mount.innerHTML = `
    <div class="two-col">
      <div>
        <p class="subhead">Service and leadership</p>
        <ul class="plain-list">
          ${cv.service.map(s => `
            <li><strong>${esc(s.role)}</strong>
              <span class="sub">${esc(s.org)} · ${esc(s.period)}</span>
              ${s.note ? `<div>${esc(s.note)}</div>` : ''}
            </li>`).join('')}
        </ul>

        <p class="subhead" style="margin-top:28px">Awards</p>
        <ul class="plain-list">
          ${cv.awards.map(a => `
            <li><strong>${esc(a.name)}</strong>
              <span class="sub">${esc(a.issuer)} · ${esc(a.year)}</span>
              <div>${esc(a.detail)}</div>
            </li>`).join('')}
        </ul>
      </div>

      <div>
        <p class="subhead">Professional memberships</p>
        <ul class="plain-list">
          ${cv.memberships.map(m => `
            <li><strong>${esc(m.org)}</strong>
              <span class="sub">${esc(m.grade)}${m.detail ? ` · ${esc(m.detail)}` : ''}</span>
            </li>`).join('')}
        </ul>

        <p class="subhead" style="margin-top:28px">Languages</p>
        <ul class="plain-list">
          ${cv.languages.map(l => `
            <li><strong>${esc(l.name)}</strong>
              <span class="sub">${esc(l.level)} · ${esc(l.detail)}</span>
            </li>`).join('')}
        </ul>
      </div>
    </div>`;
}

function renderContact(mount) {
  const s = DATA.site;
  if (!mount || !s) return;
  mount.innerHTML = `
    <div class="contact-panel">
      <div>
        <h2>Get in touch</h2>
        <p>${esc(s.profile.seeking)} If your group works on temporal representation, forecasting under sparse coverage, or benchmark design, I would be glad to hear from you.</p>
      </div>
      <div class="hero-links">
        <a class="hero-link solid" href="mailto:${attr(s.links.email)}">${ICON.mail} ${esc(s.links.email)}</a>
        <a class="hero-link" href="${attr(s.links.linkedin)}" target="_blank" rel="noopener">${ICON.linkedin} LinkedIn</a>
      </div>
    </div>`;
}

/* ---------- boot ---------- */
(async function init() {
  const [site, metrics, pubs, datasets, artifacts, cv] = await Promise.all([
    loadJSON('/Data/site.json'),
    loadJSON('/Data/metrics.json'),
    loadJSON('/Data/publications.json'),
    loadJSON('/Data/datasets.json'),
    loadJSON('/Data/artifacts.json'),
    loadJSON('/Data/cv.json')
  ]);

  Object.assign(DATA, { site, metrics, pubs, datasets, artifacts, cv });

  const start = () => {
    // Home page
    renderHero($('#mount-hero'));
    renderStats($('#mount-stats'));
    renderResearch($('#mount-research'));
    renderPubs($('#mount-selected-pubs'), {
      selectedOnly: true,
      limit: site?.display?.selectedPublicationCount || 5
    });
    renderArtifacts($('#mount-featured-artifacts'), {
      featuredOnly: true,
      limit: site?.display?.featuredArtifactCount || 4
    });
    renderDatasets($('#mount-datasets'));
    renderGrants($('#mount-grants'));
    renderExperience($('#mount-experience'));
    renderEducation($('#mount-education'));
    renderTeaching($('#mount-teaching'));
    renderService($('#mount-service'));
    renderContact($('#mount-contact'));

    // Publications page
    const pubList = $('#mount-all-pubs');
    if (pubList) {
      renderPubs(pubList, { selectedOnly: false });
      renderPubFilters($('#mount-pub-filters'), pubList);
    }

    // Code & data page
    const artList = $('#mount-all-artifacts');
    if (artList) {
      renderArtifacts(artList, { featuredOnly: false });
      renderArtifactFilters($('#mount-artifact-filters'), artList);
    }

    // Preprint notice, shown only when preprints are hidden
    const notice = $('#preprint-note');
    if (notice && site) {
      const hidden = (pubs || []).filter(p => p.status === 'preprint').length;
      notice.hidden = site.display.showPreprints || hidden === 0;
      const n = $('#preprint-count', notice);
      if (n) n.textContent = hidden;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
