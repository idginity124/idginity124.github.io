/*
  Ekrem Bulgan Portfolio
  UI + Language + Theme + Projects + Blog + Skills widgets (GitHub Pages friendly)
*/

'use strict';

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------

const CONTACT_EMAIL = "ekrembulgan2@gmail.com";
const STORAGE = {
  lang: "eb_lang",
  theme: "eb_theme",
  fx: "eb_fx",
  anime: "eb_anime",
};

// ---------------------------------------------------------------------------
// UTILS
// ---------------------------------------------------------------------------

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

let currentLang = "tr";

// RAF throttle helper (prevents scroll handlers from running too frequently)
function rafThrottle(fn) {
  let ticking = false;
  return (...args) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      try { fn(...args); } catch { /* ignore */ }
    });
  };
}

function showToast(message) {
  let toast = $("#toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("is-visible");

  if (showToast._t) window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function langValue(v, fallback = "") {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    return v[currentLang] || v.tr || v.en || fallback;
  }
  return fallback;
}

function makeSlug(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-_]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

const BASE = (() => {
  const path = (location.pathname || "/").split("?")[0];
  const parts = path.split("/").filter(Boolean);

  // If URL ends with a slash, treat it as a folder (depth = parts.length)
  // If it's a file, depth = parts.length - 1
  const last = parts[parts.length - 1] || "";
  const isFile = last.includes(".");
  const depth = isFile ? Math.max(0, parts.length - 1) : parts.length;

  if (depth <= 0) return "";
  return "../".repeat(depth);
})();

const __jsonCache = new Map();
async function fetchJSON(relPath) {
  const url = BASE + relPath;
  if (__jsonCache.has(url)) return __jsonCache.get(url);

  const p = fetch(url, { cache: "force-cache" })
    .then((r) => {
      if (!r.ok) throw new Error(`Failed to fetch ${url} (${r.status})`);
      return r.json();
    })
    .catch((e) => {
      console.warn("fetchJSON error:", e);
      return null;
    });

  __jsonCache.set(url, p);
  return p;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(currentLang === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// LANGUAGE
// ---------------------------------------------------------------------------

function setLanguage(lang) {
  currentLang = lang === "en" ? "en" : "tr";
  document.documentElement.lang = currentLang;
  localStorage.setItem(STORAGE.lang, currentLang);

  const langBtn = $("#lang-btn");
  if (langBtn) langBtn.textContent = currentLang === "tr" ? "EN" : "TR";

  // Text nodes
  $$('[data-tr][data-en]').forEach((el) => {
    const value = currentLang === "tr" ? el.getAttribute("data-tr") : el.getAttribute("data-en");
    if (value != null) el.textContent = value;
  });

  // Placeholder
  $$('[data-tr-placeholder][data-en-placeholder]').forEach((el) => {
    const value = currentLang === "tr" ? el.getAttribute("data-tr-placeholder") : el.getAttribute("data-en-placeholder");
    if (value != null) el.setAttribute("placeholder", value);
  });

  // aria-label
  $$('[data-tr-aria][data-en-aria]').forEach((el) => {
    const value = currentLang === "tr" ? el.getAttribute("data-tr-aria") : el.getAttribute("data-en-aria");
    if (value != null) el.setAttribute("aria-label", value);
  });

  // Re-render dynamic content that depends on language
  rerenderDynamic();
}

function toggleLanguage() {
  setLanguage(currentLang === "tr" ? "en" : "tr");
}

function initLanguage() {
  const langBtn = $("#lang-btn");
  if (langBtn) langBtn.addEventListener("click", toggleLanguage);
}

// ---------------------------------------------------------------------------
// THEME
// ---------------------------------------------------------------------------

function setTheme(theme) {
  const t = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = t;
  localStorage.setItem(STORAGE.theme, t);

  const icon = $("#theme-btn i");
  if (icon) {
    icon.className = t === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
  }

  // Refresh FX palette when theme changes
  if (window.EBFX && typeof window.EBFX.set === 'function') {
    window.EBFX.set({ enabled: document.body.classList.contains('fx-on'), anime: document.body.classList.contains('anime-on') });
  }
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme || "dark";
  setTheme(current === "dark" ? "light" : "dark");
}

function initTheme() {
  const themeBtn = $("#theme-btn");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
}

// ---------------------------------------------------------------------------
// NAVIGATION
// ---------------------------------------------------------------------------

function setActiveNav() {
  const pathname = (location.pathname || "").toLowerCase();
  const file = (pathname.split("/").pop() || "index.html").toLowerCase();
  const current = file || "index.html";

  const inProjects = pathname.includes("/projects/");
  const inBlog = pathname.includes("/blog/");

  const links = $$(".nav-links a");

  links.forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    const hrefFile = (href.split("/").pop() || "").toLowerCase();

    let isMatch = hrefFile === current || (current === "index.html" && (hrefFile === "" || hrefFile === "/"));

    if (!isMatch && inProjects && hrefFile === "projects.html") isMatch = true;
    if (!isMatch && inBlog && hrefFile === "blog.html") isMatch = true;

    a.classList.toggle("active", isMatch);
  });
}

function initNav() {
  const btn = $("#menu-btn");
  if (!btn) return;

  const close = () => {
    document.body.classList.remove("nav-open");
    btn.setAttribute("aria-expanded", "false");
  };

  const toggle = () => {
    const open = document.body.classList.toggle("nav-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggle();
  });

  $$(".nav-links a").forEach((a) => a.addEventListener("click", close));

  document.addEventListener("click", (e) => {
    if (!document.body.classList.contains("nav-open")) return;
    const nav = $(".nav");
    if (nav && !nav.contains(e.target)) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

// ---------------------------------------------------------------------------
// SCROLL UX
// ---------------------------------------------------------------------------

function initScrollProgress() {
  const bar = $("#progress-bar");
  if (!bar) return;

  const update = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = height > 0 ? (scrollTop / height) * 100 : 0;
    bar.style.width = `${pct}%`;
  };

  const onScroll = rafThrottle(update);
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}

function initReveal() {
  const items = $$(".reveal");
  if (!items.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          obs.unobserve(e.target);
        }
      }
    },
    { threshold: 0.14 }
  );

  items.forEach((el) => obs.observe(el));
}

function initBackToTop() {
  const btn = $("#to-top");
  if (!btn) return;

  const update = () => {
    const show = (window.scrollY || document.documentElement.scrollTop || 0) > 520;
    btn.classList.toggle("is-visible", show);
  };

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const onScroll = rafThrottle(update);
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}

// Smooth-scroll performance guard
// - Adds body.is-scrolling during scroll, letting CSS disable expensive effects
// - Pauses canvas FX while scrolling (major jank reduction)
function initScrollPerfGuard() {
  let t = 0;
  let active = false;

  const pauseFx = () => {
    if (!window.EBFX) return;
    if (!document.body.classList.contains('fx-on') && !document.body.classList.contains('anime-on')) return;
    try { window.EBFX.stop(false); } catch { /* ignore */ }
  };

  const resumeFx = () => {
    if (!window.EBFX) return;
    if (!document.body.classList.contains('fx-on') && !document.body.classList.contains('anime-on')) return;
    try { window.EBFX.start(); } catch { /* ignore */ }
  };

  const onScroll = () => {
    if (!active) {
      active = true;
      document.body.classList.add('is-scrolling');
      pauseFx();
    }

    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => {
      active = false;
      document.body.classList.remove('is-scrolling');
      resumeFx();
    }, 140);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

function initFooterYear() {
  const el = $("#current-year");
  if (el) el.textContent = String(new Date().getFullYear());
}

function initLightbox() {
  const imgs = Array.from(document.querySelectorAll('main img, .prose img, .screens img, .gallery img'))
    .filter(img => {
      const src = (img.getAttribute('src') || '').toLowerCase();
      // ignore tiny icons / logos in nav/footer
      const w = parseInt(img.getAttribute('width') || '0', 10);
      const h = parseInt(img.getAttribute('height') || '0', 10);
      if (w && h && (w <= 140 || h <= 140)) return false;
      return src.endsWith('.png') || src.endsWith('.jpg') || src.endsWith('.jpeg') || src.endsWith('.webp') || src.endsWith('.gif') || src.endsWith('.svg');
    });

  if (!imgs.length) return;

  let backdrop = document.querySelector('.lightbox-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'lightbox-backdrop';
    backdrop.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Close">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <img class="lightbox-img" alt="">
      <div class="lightbox-hint" data-tr="Kapatmak için Esc" data-en="Press Esc to close">Kapatmak için Esc</div>
    `;
    document.body.appendChild(backdrop);
  }

  const lbImg = backdrop.querySelector('.lightbox-img');
  const closeBtn = backdrop.querySelector('.lightbox-close');

  const close = () => {
    backdrop.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    lbImg.removeAttribute('src');
    lbImg.setAttribute('alt', '');
  };

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
  closeBtn.addEventListener('click', close);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('is-open')) close();
  });

  imgs.forEach(img => {
    img.classList.add('zoomable');
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', img.getAttribute('alt') || 'Preview image');

    const open = () => {
      const src = img.getAttribute('src');
      if (!src) return;
      lbImg.setAttribute('src', src);
      lbImg.setAttribute('alt', img.getAttribute('alt') || '');
      backdrop.classList.add('is-open');
      document.body.classList.add('no-scroll');
    };

    img.addEventListener('click', open);
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });
}

// ---------------------------------------------------------------------------
// CONTACT
// ---------------------------------------------------------------------------

function initContact() {
  // Email anchors
  $$('a[data-email]').forEach((a) => {
    a.setAttribute("href", `mailto:${CONTACT_EMAIL}`);
    a.textContent = CONTACT_EMAIL;
  });

  // Copy button
  const copyBtn = $("#copy-email");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const ok = await copyToClipboard(CONTACT_EMAIL);
      showToast(ok ? (currentLang === "tr" ? "E-posta kopyalandı." : "Email copied.") : (currentLang === "tr" ? "Kopyalama başarısız." : "Copy failed."));
    });
  }

  // Quick message form (mailto)
  const form = $("#contact-form");
  const note = $("#contact-note");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const fd = new FormData(form);
      const name = (fd.get("name") || "").toString().trim();
      const subjectInput = (fd.get("subject") || "").toString().trim();
      const message = (fd.get("message") || "").toString().trim();

      const subject = subjectInput
        ? `Contact: ${subjectInput}`
        : currentLang === "tr"
          ? `Portföy İletişim: ${name}`
          : `Portfolio Contact: ${name}`;

      const bodyLines = [
        name ? `Name: ${name}` : "",
        `Message:\n${message}`,
        "\n---",
        "Sent from portfolio site.",
      ].filter(Boolean);

      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
      if (note) note.textContent = currentLang === "tr" ? "E-posta uygulaması açılıyor..." : "Opening email client...";
      window.location.href = mailto;
      showToast(currentLang === "tr" ? "Taslak oluşturuldu." : "Draft created.");
    });
  }
}

function initCVDownload() {
  const btn = $("#download-cv");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const cvUrl = BASE + "assets/cv/Ekrem_Bulgan_CV.pdf";
    window.open(cvUrl, "_blank");
    showToast(currentLang === "tr" ? "CV açılıyor..." : "Opening resume...");
  });
}

// ---------------------------------------------------------------------------
// DYNAMIC FEATURES (Projects / Blog / Skills)
// ---------------------------------------------------------------------------

let __dynamicRerenders = [];
function rerenderDynamic() {
  for (const fn of __dynamicRerenders) {
    try { fn(); } catch (e) { /* ignore */ }
  }
}

function pillButton(labelTr, labelEn, active = false) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'chip' + (active ? ' active' : '');
  b.textContent = currentLang === 'tr' ? labelTr : labelEn;
  b.dataset.tr = labelTr;
  b.dataset.en = labelEn;
  return b;
}

function renderTags(tags = []) {
  const wrap = document.createElement('div');
  wrap.className = 'tags';
  for (const t of tags) {
    const s = document.createElement('span');
    s.className = 'tag';
    s.textContent = t;
    wrap.appendChild(s);
  }
  return wrap;
}

// ------------------------------ Projects page ------------------------------

let __projectsState = {
  data: null,
  search: '',
  status: 'all',
  category: 'all',
  tag: null,
  sort: 'featured',
};

function applyProjectFilters(projects) {
  const q = (__projectsState.search || '').toLowerCase().trim();
  let out = projects.slice();

  if (__projectsState.status !== 'all') {
    out = out.filter((p) => (p.status && p.status.code) === __projectsState.status);
  }

  if (__projectsState.category !== 'all') {
    out = out.filter((p) => Array.isArray(p.category) && p.category.map(String).includes(__projectsState.category));
  }

  if (__projectsState.tag) {
    out = out.filter((p) => Array.isArray(p.tags) && p.tags.map(String).includes(__projectsState.tag));
  }

  if (q) {
    out = out.filter((p) => {
      const hay = [
        p.name,
        langValue(p.summary),
        ...(p.tags || []),
        ...(p.category || []),
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }

  if (__projectsState.sort === 'az') {
    out.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  } else if (__projectsState.sort === 'za') {
    out.sort((a, b) => String(b.name).localeCompare(String(a.name)));
  } else if (__projectsState.sort === 'featured') {
    out.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }

  return out;
}

function projectCard(p) {
  const card = document.createElement('article');
  card.className = 'card project-card reveal';

  const icon = document.createElement('div');
  icon.className = 'card-icon';
  icon.innerHTML = `<i class="${p.icon || 'fa-solid fa-layer-group'}"></i>`;

  const titleRow = document.createElement('div');
  titleRow.className = 'project-card__top';

  const title = document.createElement('h3');
  title.textContent = p.name || 'Project';

  const badge = document.createElement('span');
  badge.className = 'status-pill ' + ((p.status && p.status.code) || '');
  badge.textContent = langValue(p.status, '');

  titleRow.appendChild(title);
  titleRow.appendChild(badge);

  const desc = document.createElement('p');
  desc.className = 'muted';
  desc.textContent = langValue(p.summary, '');

  const meta = document.createElement('div');
  meta.className = 'meta-line';
  meta.textContent = [langValue(p.type), langValue(p.platform)].filter(Boolean).join(' • ');

  const tags = renderTags((p.tags || []).slice(0, 4));

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const details = document.createElement('a');
  details.className = 'btn btn-small btn-ghost';
  details.href = BASE + (p.detail || '#');
  details.innerHTML = `<i class="fa-solid fa-file-lines"></i><span>${currentLang === 'tr' ? 'Detaylar' : 'Details'}</span>`;

  actions.appendChild(details);

  if (p.links && p.links.releases) {
    const rel = document.createElement('a');
    rel.className = 'btn btn-small btn-ghost';
    rel.href = p.links.releases;
    rel.target = '_blank';
    rel.rel = 'noopener';
    rel.innerHTML = `<i class="fa-solid fa-box"></i><span>${currentLang === 'tr' ? 'Releases' : 'Releases'}</span>`;
    actions.appendChild(rel);
  }

  if (p.links && p.links.github) {
    const gh = document.createElement('a');
    gh.className = 'btn btn-small btn-primary';
    gh.href = p.links.github;
    gh.target = '_blank';
    gh.rel = 'noopener';
    gh.innerHTML = `<i class="fab fa-github"></i><span>GitHub</span>`;
    actions.appendChild(gh);
  }

  // Cover (optional)
  if (p.cover) {
    const cover = document.createElement('div');
    cover.className = 'project-cover';

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.alt = `${p.name || 'Project'} cover`;
    img.src = BASE + p.cover;

    cover.appendChild(img);
    cover.appendChild(icon); // icon overlays the cover
    card.appendChild(cover);
  } else {
    card.appendChild(icon);
  }

  card.appendChild(titleRow);
  card.appendChild(meta);
  card.appendChild(desc);
  card.appendChild(tags);
  card.appendChild(actions);

  return card;
}

function renderProjects() {
  const grid = $("#projects-grid");
  const empty = $("#projects-empty");
  const countEl = $("#projects-count");

  if (!grid || !__projectsState.data) return;

  const projects = applyProjectFilters(__projectsState.data.projects || []);

  grid.innerHTML = '';
  projects.forEach((p) => grid.appendChild(projectCard(p)));

  if (countEl) {
    countEl.textContent = String(projects.length);
  }

  if (empty) {
    empty.classList.toggle('is-visible', projects.length === 0);
  }

  // Re-init reveals for newly rendered cards
  initReveal();
}

function syncProjectsUI() {
  const search = $("#project-search");
  if (search && search.value !== __projectsState.search) search.value = __projectsState.search;

  $$('.chip[data-filter]').forEach((b) => {
    const type = b.dataset.filter;
    const value = b.dataset.value;
    const isActive = (type === 'status' && value === __projectsState.status)
      || (type === 'category' && value === __projectsState.category);
    b.classList.toggle('active', isActive);
  });

  const tagEl = $("#active-tag");
  if (tagEl) {
    if (__projectsState.tag) {
      tagEl.textContent = __projectsState.tag;
      tagEl.classList.add('is-visible');
    } else {
      tagEl.classList.remove('is-visible');
    }
  }

  const sort = $("#project-sort");
  if (sort) sort.value = __projectsState.sort;
}

async function initProjectsPage() {
  const app = $("#projects-app");
  if (!app) return;

  const data = await fetchJSON('assets/data/projects.json');
  if (!data || !data.projects) return;

  __projectsState.data = data;

  // Init from query params
  const qp = new URLSearchParams(location.search || '');
  const status = qp.get('status');
  const category = qp.get('category');
  const tag = qp.get('tag');
  const q = qp.get('q');

  if (status) __projectsState.status = status;
  if (category) __projectsState.category = category;
  if (tag) __projectsState.tag = tag;
  if (q) __projectsState.search = q;

  // Search
  const search = $("#project-search");
  if (search) {
    search.addEventListener('input', (e) => {
      __projectsState.search = e.target.value || '';
      renderProjects();
    });
  }

  // Chips
  $$('.chip[data-filter]').forEach((b) => {
    b.addEventListener('click', () => {
      const type = b.dataset.filter;
      const value = b.dataset.value;

      if (type === 'status') __projectsState.status = value;
      if (type === 'category') __projectsState.category = value;

      renderProjects();
      syncProjectsUI();
    });
  });

  // Clear tag
  const clearTag = $("#clear-tag");
  if (clearTag) {
    clearTag.addEventListener('click', () => {
      __projectsState.tag = null;
      renderProjects();
      syncProjectsUI();
    });
  }

  // Sort
  const sort = $("#project-sort");
  if (sort) {
    sort.addEventListener('change', (e) => {
      __projectsState.sort = e.target.value || 'featured';
      renderProjects();
    });
  }

  // Tag-click from rendered cards (event delegation)
  const grid = $("#projects-grid");
  if (grid) {
    grid.addEventListener('click', (e) => {
      const tag = e.target && e.target.classList && e.target.classList.contains('tag') ? e.target.textContent : null;
      if (!tag) return;
      __projectsState.tag = tag;
      renderProjects();
      syncProjectsUI();
      showToast(currentLang === 'tr' ? `Filtre: ${tag}` : `Filter: ${tag}`);
    });
  }

  // Dynamic rerender for language changes
  __dynamicRerenders.push(() => {
    syncProjectsUI();
    renderProjects();
  });

  syncProjectsUI();
  renderProjects();
}

// ------------------------------- Blog pages --------------------------------

let __postsData = null;

function postCard(p) {
  const card = document.createElement('article');
  card.className = 'card post-card reveal';

  const top = document.createElement('div');
  top.className = 'post-card__top';

  const title = document.createElement('h3');
  title.textContent = langValue(p.title, 'Post');

  const badge = document.createElement('span');
  badge.className = 'status-pill draft';
  badge.textContent = p.draft ? (currentLang === 'tr' ? 'Taslak' : 'Draft') : (currentLang === 'tr' ? 'Yayın' : 'Published');

  top.appendChild(title);
  if (p.draft) top.appendChild(badge);

  const meta = document.createElement('div');
  meta.className = 'meta-line';
  meta.textContent = [formatDate(p.date), langValue(p.readingTime)].filter(Boolean).join(' • ');

  const desc = document.createElement('p');
  desc.className = 'muted';
  desc.textContent = langValue(p.summary, '');

  const tags = renderTags((p.tags || []).slice(0, 4));

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const read = document.createElement('a');
  read.className = 'btn btn-small btn-primary';
  read.href = BASE + (p.path || '#');
  read.innerHTML = `<i class="fa-solid fa-book-open"></i><span>${currentLang === 'tr' ? 'Oku' : 'Read'}</span>`;

  actions.appendChild(read);

  card.appendChild(top);
  card.appendChild(meta);
  card.appendChild(desc);
  card.appendChild(tags);
  card.appendChild(actions);

  return card;
}

function renderPostsInto(containerSel, limit = null) {
  const grid = $(containerSel);
  if (!grid || !__postsData) return;

  // Default: hide drafts from public lists
  const posts = (__postsData.posts || []).filter((p) => !p.draft).slice();
  posts.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  const out = limit ? posts.slice(0, limit) : posts;

  grid.innerHTML = '';
  out.forEach((p) => grid.appendChild(postCard(p)));

  // Blog list extras (count + empty state)
  if (containerSel === '#posts-grid') {
    const countEl = $('#posts-count');
    if (countEl) countEl.textContent = String(posts.length);

    const empty = $('#posts-empty');
    if (empty) empty.classList.toggle('is-visible', out.length === 0);
  }

  initReveal();
}

async function initBlogPages() {
  // blog index
  const blogApp = $("#blog-app");
  const latest = $("#latest-writing");

  if (!blogApp && !latest) return;

  const data = await fetchJSON('assets/data/posts.json');
  if (!data || !data.posts) return;
  __postsData = data;

  if (blogApp) {
    __dynamicRerenders.push(() => renderPostsInto('#posts-grid'));
    renderPostsInto('#posts-grid');
  }

  if (latest) {
    __dynamicRerenders.push(() => renderPostsInto('#latest-writing', 3));
    renderPostsInto('#latest-writing', 3);
  }
}

// ------------------------------- Skills widget ------------------------------

async function initSkillsWidget() {
  const wrap = $("#skills-app");
  if (!wrap) return;

  const data = await fetchJSON('assets/data/projects.json');
  if (!data || !data.projects) return;

  const projects = data.projects;

  const skills = [
    { key: 'Python', icon: 'fab fa-python', tags: ['Python'] },
    { key: 'Computer Vision', icon: 'fa-solid fa-eye', tags: ['Computer Vision', 'AI'] },
    { key: 'Desktop Apps', icon: 'fa-solid fa-desktop', tags: ['Desktop'] },
    { key: 'Automation', icon: 'fa-solid fa-gears', tags: ['Automation', 'Workflow'] },
    { key: 'Security', icon: 'fa-solid fa-shield-halved', tags: ['Security'] },
    { key: 'Web', icon: 'fa-solid fa-globe', tags: ['Web'] },
  ];

  const grid = $("#skills-grid", wrap);
  const result = $("#skills-result", wrap);
  if (!grid || !result) return;

  function matchesSkill(p, skill) {
    const tags = (p.tags || []).map(String);
    return skill.tags.some((t) => tags.includes(t));
  }

  function renderResult(skill) {
    const matched = projects.filter((p) => matchesSkill(p, skill));

    result.innerHTML = '';

    const h = document.createElement('div');
    h.className = 'skills-result__head';

    const title = document.createElement('div');
    title.className = 'skills-result__title';
    title.textContent = currentLang === 'tr' ? `İlgili projeler: ${skill.key}` : `Related projects: ${skill.key}`;

    const hint = document.createElement('div');
    hint.className = 'muted';
    hint.textContent = currentLang === 'tr'
      ? 'Projeye gitmek için isimlere tıkla. (Projeler sayfasına filtreli geçiş yapar)'
      : 'Click a project to open it. (Also available as a filtered Projects view)';

    h.appendChild(title);
    h.appendChild(hint);

    const list = document.createElement('div');
    list.className = 'skills-result__list';

    matched.forEach((p) => {
      const a = document.createElement('a');
      a.className = 'mini-link';
      a.href = BASE + (p.detail || '#');
      a.textContent = p.name;
      list.appendChild(a);
    });

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const openFiltered = document.createElement('a');
    openFiltered.className = 'btn btn-small btn-ghost';
    openFiltered.href = BASE + `projects.html?tag=${encodeURIComponent(skill.tags[0] || skill.key)}`;
    openFiltered.innerHTML = `<i class="fa-solid fa-filter"></i><span>${currentLang === 'tr' ? 'Projeler sayfasında filtrele' : 'Open filtered Projects'}</span>`;

    actions.appendChild(openFiltered);

    result.appendChild(h);
    result.appendChild(list);
    result.appendChild(actions);

    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Render skill buttons
  grid.innerHTML = '';
  skills.forEach((s, idx) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'skill-card';
    b.innerHTML = `<div class="skill-ic"><i class="${s.icon}"></i></div><div class="skill-t">${s.key}</div><div class="skill-d muted">${currentLang === 'tr' ? 'Projelerle eşleştir' : 'Map to projects'}</div>`;

    b.addEventListener('click', () => {
      $$('.skill-card', grid).forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      renderResult(s);
    });

    grid.appendChild(b);

    if (idx === 0) {
      // Default select first
      requestAnimationFrame(() => {
        b.classList.add('active');
        renderResult(s);
      });
    }
  });

  __dynamicRerenders.push(() => {
    // Repaint labels inside current selection
    const active = $('.skill-card.active', grid);
    const idx = active ? $$('.skill-card', grid).indexOf(active) : 0;
    grid.innerHTML = '';
    skills.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'skill-card' + (i == idx ? ' active' : '');
      b.innerHTML = `<div class="skill-ic"><i class="${s.icon}"></i></div><div class="skill-t">${s.key}</div><div class="skill-d muted">${currentLang === 'tr' ? 'Projelerle eşleştir' : 'Map to projects'}</div>`;
      b.addEventListener('click', () => {
        $$('.skill-card', grid).forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        renderResult(s);
      });
      grid.appendChild(b);
    });
    renderResult(skills[Math.max(0, idx)]);
  });
}

// ------------------------------- Auto TOC ----------------------------------

function initTOC() {
  const toc = $("#toc");
  if (!toc) return;

  const panels = $$('.panel[id]');
  if (!panels.length) return;

  const list = document.createElement('div');
  list.className = 'toc-list';

  const items = [];
  panels.forEach((p) => {
    const h = $('.panel-title', p) || $('h2', p) || $('h3', p);
    if (!h) return;
    const id = p.id;
    const a = document.createElement('a');
    a.href = `#${id}`;
    a.textContent = h.textContent.trim();
    a.className = 'toc-link';
    list.appendChild(a);
    items.push({ id, el: p, link: a });
  });

  toc.innerHTML = '';

  const head = document.createElement('div');
  head.className = 'toc-head';
  head.textContent = currentLang === 'tr' ? 'Bu sayfada' : 'On this page';

  toc.appendChild(head);
  toc.appendChild(list);

  const obs = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const top = visible[0].target;
      const id = top.id;
      items.forEach((it) => it.link.classList.toggle('active', it.id === id));
    },
    { rootMargin: '-20% 0px -72% 0px', threshold: [0.1, 0.2, 0.3, 0.4, 0.5] }
  );

  items.forEach((it) => obs.observe(it.el));

  __dynamicRerenders.push(() => initTOC());
}

// ------------------------------ Share / Copy link ---------------------------

function initCopyLink() {
  const btn = $("#copy-link");
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const ok = await copyToClipboard(location.href);
    showToast(ok ? (currentLang === 'tr' ? 'Link kopyalandı.' : 'Link copied.') : (currentLang === 'tr' ? 'Kopyalama başarısız.' : 'Copy failed.'));
  });
}


// ---------------------------------------------------------------------------
// FX + ANIME (visual identity toggles)
// ---------------------------------------------------------------------------

let __fxState = { fx: false, anime: false };

function applyFxState() {
  document.body.classList.toggle('fx-on', __fxState.fx);
  document.body.classList.toggle('anime-on', __fxState.anime);

  localStorage.setItem(STORAGE.fx, __fxState.fx ? '1' : '0');
  localStorage.setItem(STORAGE.anime, __fxState.anime ? '1' : '0');

  const fxBtn = $('#fx-btn');
  if (fxBtn) fxBtn.classList.toggle('active', __fxState.fx);

  const animeBtn = $('#anime-btn');
  if (animeBtn) animeBtn.classList.toggle('active', __fxState.anime);

  if (window.EBFX && typeof window.EBFX.set === 'function') {
    window.EBFX.set({ enabled: __fxState.fx, anime: __fxState.anime });
  }
}

function setFx(on) {
  __fxState.fx = !!on;
  if (!__fxState.fx) __fxState.anime = false;
  applyFxState();

  initImpactFx({ prefersReduced, saveData, isMobile });
}

function setAnime(on) {
  __fxState.anime = !!on;
  if (__fxState.anime) __fxState.fx = true;
  applyFxState();
}

function initEffects() {
  const storedFx = localStorage.getItem(STORAGE.fx);
  const storedAnime = localStorage.getItem(STORAGE.anime);

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;

  // Defaults: FX on for desktop unless user prefers reduced motion / Save-Data.
  const isMobile = window.matchMedia && window.matchMedia('(max-width: 820px)').matches;
  const defaultFx = !(prefersReduced || saveData || isMobile);

  __fxState.fx = storedFx != null ? storedFx === '1' : defaultFx;
  __fxState.anime = storedAnime != null ? storedAnime === '1' : false;
  if (__fxState.anime) __fxState.fx = true;

  const fxBtn = $('#fx-btn');
  if (fxBtn) fxBtn.addEventListener('click', () => setFx(!__fxState.fx));

  const animeBtn = $('#anime-btn');
  if (animeBtn) animeBtn.addEventListener('click', () => setAnime(!__fxState.anime));

  // Auto-disable if user turns on reduced motion after load
  const m = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (m && m.addEventListener) {
    m.addEventListener('change', () => {
      if (m.matches) setFx(false);
    });
  }

  applyFxState();
}



// -------------------------- Anime Impact FX (desktop) -----------------------
let __impactListenerAttached = false;

function spawnImpactRing(x, y){
  const el = document.createElement('div');
  el.className = 'impact-ring';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  // Slight tint using current CSS variable (primary/accent)
  const primary = getComputedStyle(document.body).getPropertyValue('--primary').trim();
  if (primary) el.style.borderColor = primary;
  document.body.appendChild(el);
  window.setTimeout(() => { try { el.remove(); } catch {} }, 700);
}

function initImpactFx({prefersReduced, saveData, isMobile}){
  if (__impactListenerAttached) return;
  __impactListenerAttached = true;

  const canRun = () => {
    if (prefersReduced || saveData || isMobile) return false;
    if (!document.body.classList.contains('anime-on')) return false;
    if (document.body.classList.contains('is-scrolling')) return false;
    return true;
  };

  document.addEventListener('pointerdown', (e) => {
    // only primary click/tap
    if (e.button != null && e.button !== 0) return;
    // avoid while selecting text / interacting with inputs
    const t = e.target;
    if (t && (t.closest && (t.closest('input, textarea, select, button, a, [role="button"]')))) return;
    if (!canRun()) return;
    spawnImpactRing(e.clientX, e.clientY);
  }, { passive: true });
}

// ---------------------------------------------------------------------------
// HERO TYPEWRITER (subtle, optional)
// ---------------------------------------------------------------------------

let __typeTimer = null;

function stopTypewriter() {
  if (__typeTimer) {
    window.clearTimeout(__typeTimer);
    __typeTimer = null;
  }
}

function initTypewriter() {
  const el = $('#typewriter');
  if (!el) return;

  // Re-run typewriter on language change (rerenderDynamic)
  if (!el.dataset.twBound) {
    el.dataset.twBound = '1';
    __dynamicRerenders.push(() => initTypewriter());
  }

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const linesTr = (el.getAttribute('data-lines-tr') || '').split('|').map(s => s.trim()).filter(Boolean);
  const linesEn = (el.getAttribute('data-lines-en') || '').split('|').map(s => s.trim()).filter(Boolean);

  const getLines = () => (currentLang === 'tr'
    ? (linesTr.length ? linesTr : linesEn)
    : (linesEn.length ? linesEn : linesTr));

  const lines = getLines();

  stopTypewriter();

  // Reduced motion: show first line only
  if (prefersReduced) {
    el.textContent = lines[0] || '';
    return;
  }

  if (!lines.length) return;

  let lineIdx = 0;
  let charIdx = 0;
  let deleting = false;

  const typeSpeed = 34;
  const deleteSpeed = 22;
  const pauseAtEnd = 900;

  function tick() {
    const current = lines[lineIdx] || '';

    if (!deleting) {
      charIdx++;
      el.textContent = current.slice(0, charIdx);

      if (charIdx >= current.length) {
        deleting = true;
        __typeTimer = window.setTimeout(tick, pauseAtEnd);
        return;
      }

      __typeTimer = window.setTimeout(tick, typeSpeed);
      return;
    }

    // deleting
    charIdx--;
    el.textContent = current.slice(0, Math.max(0, charIdx));

    if (charIdx <= 0) {
      deleting = false;
      lineIdx = (lineIdx + 1) % lines.length;
      __typeTimer = window.setTimeout(tick, 260);
      return;
    }

    __typeTimer = window.setTimeout(tick, deleteSpeed);
  }

  tick();
}


// ---------------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------------

async function init() {
  // Language
  const storedLang = localStorage.getItem(STORAGE.lang);
  const browserLang = (navigator.language || "").toLowerCase().startsWith("tr") ? "tr" : "en";
  setLanguage(storedLang || document.documentElement.lang || browserLang);
  initLanguage();

  // Theme
  const storedTheme = localStorage.getItem(STORAGE.theme);
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  setTheme(storedTheme || (prefersLight ? "light" : "dark"));
  initTheme();

  // FX / Anime
  initEffects();
  initTypewriter();

  // Nav
  initNav();
  setActiveNav();

  // UX
  initScrollProgress();
  initScrollPerfGuard();
  initReveal();
  initBackToTop();
  initFooterYear();
  initLightbox();

  // Page-specific
  initContact();
  initCVDownload();
  initCopyLink();
  initTOC();

  // Dynamic pages
  await Promise.all([
    initProjectsPage(),
    initBlogPages(),
    initSkillsWidget(),
  ]);

  console.log("Portfolio initialized.");
}

document.addEventListener("DOMContentLoaded", init);
