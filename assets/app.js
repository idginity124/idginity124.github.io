/*
  Ekrem Bulgan Portfolio
  UI + Language + Theme + Demos (VidExtract Web)
*/

'use strict';

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------

const CONTACT_EMAIL = "ekrembulgan2@gmail.com";
const STORAGE = {
  lang: "eb_lang",
  theme: "eb_theme",
  apiBase: "eb_api_base",
};

// ---------------------------------------------------------------------------
// UTILS
// ---------------------------------------------------------------------------

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

let currentLang = "tr";

function safeText(el, value) {
  if (!el) return;
  el.textContent = value;
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

  // Toast-like / status text that we store in data-
  $$('[data-tr-aria][data-en-aria]').forEach((el) => {
    const value = currentLang === "tr" ? el.getAttribute("data-tr-aria") : el.getAttribute("data-en-aria");
    if (value != null) el.setAttribute("aria-label", value);
  });
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
    // When we're in dark mode, show moon (switch to light). When in light, show sun (switch to dark).
    icon.className = t === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
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
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const links = $$(".nav-links a");

  links.forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    const isMatch = href === path || (path === "" && href.includes("index"));
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

  // Close when clicking any nav link
  $$(".nav-links a").forEach((a) => a.addEventListener("click", close));

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!document.body.classList.contains("nav-open")) return;
    const nav = $(".nav");
    if (nav && !nav.contains(e.target)) close();
  });

  // Close on ESC
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

  update();
  window.addEventListener("scroll", update, { passive: true });
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

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initFooterYear() {
  const el = $("#current-year");
  if (el) el.textContent = String(new Date().getFullYear());
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
        : (currentLang === "tr" ? `Portföy İletişim: ${name}` : `Portfolio Contact: ${name}`);

      const bodyLines = [
        name ? `Name: ${name}` : "",
        `Message:\n${message}`,
        "\n---",
        "Sent from portfolio site."
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
    const cvUrl = "assets/cv/Ekrem_Bulgan_CV.pdf";
    window.open(cvUrl, "_blank");
    showToast(currentLang === "tr" ? "CV açılıyor..." : "Opening CV...");
  });
}

// ---------------------------------------------------------------------------
// VidExtract Web (YouTube Downloader)
// ---------------------------------------------------------------------------

function getApiBase() {
  const meta = document.querySelector('meta[name="api-base"]');
  const fromMeta = meta && meta.getAttribute("content") ? meta.getAttribute("content").trim() : "";

  if (fromMeta) return fromMeta;
  if (localStorage.getItem(STORAGE.apiBase)) return localStorage.getItem(STORAGE.apiBase);

  // If the site is opened as a file, default to localhost API.
  if (location.protocol === "file:") return "http://localhost:8000/api";

  // Same-origin default (reverse proxy recommended)
  return "/api";
}

async function pingApi(apiBase) {
  try {
    const res = await fetch(`${apiBase}/health`, { method: "GET" });
    if (!res.ok) return { ok: false };
    const data = await res.json().catch(() => ({}));
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "";
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

function initVidExtractWeb() {
  const form = $("#vx-form");
  if (!form) return;

  const apiBase = getApiBase();
  const statusEl = $("#api-status");
  const urlEl = $("#vx-url");
  const modeEl = $("#vx-mode");
  const fmtEl = $("#vx-format");
  const rightsEl = $("#vx-rights");
  const previewBtn = $("#vx-preview-btn");
  const logEl = $("#vx-log");
  const previewWrap = $("#vx-preview");
  const thumbEl = $("#vx-thumb");
  const titleEl = $("#vx-title");
  const metaEl = $("#vx-meta");

  let apiOk = false;

  const setStatus = (type, text) => {
    if (!statusEl) return;
    statusEl.classList.remove("good", "warn", "bad");
    statusEl.classList.add(type);
    statusEl.textContent = text;
  };

  const writeLog = (text) => {
    if (!logEl) return;
    logEl.textContent = text;
  };

  const updatePreview = (info) => {
    if (!previewWrap) return;
    previewWrap.hidden = false;

    if (thumbEl) thumbEl.src = info.thumbnail || "";
    safeText(titleEl, info.title || "");

    const parts = [];
    if (info.uploader) parts.push(info.uploader);
    if (info.duration != null) parts.push(formatDuration(info.duration));
    if (info.view_count != null) parts.push(`${info.view_count.toLocaleString()} views`);
    safeText(metaEl, parts.join(" • "));
  };

  // 1) Ping API
  (async () => {
    setStatus("warn", currentLang === "tr" ? "Backend kontrol ediliyor…" : "Checking backend…");

    const ping = await pingApi(apiBase);
    apiOk = ping.ok;

    if (apiOk) {
      const v = (ping.data && ping.data.version) ? ` (v${ping.data.version})` : "";
      setStatus("good", (currentLang === "tr" ? "Backend bağlı" : "Backend connected") + v);
    } else {
      setStatus(
        "bad",
        currentLang === "tr"
          ? "Backend bulunamadı. Demo için server'ı çalıştırın (aşağıdaki yönergeler)."
          : "Backend not found. Start the server for the live demo (see instructions below)."
      );
    }
  })();

  // 2) Preview
  const doPreview = async () => {
    const url = (urlEl ? urlEl.value : "").trim();
    if (!url) {
      showToast(currentLang === "tr" ? "Lütfen bir URL girin." : "Please enter a URL.");
      return;
    }

    if (!apiOk) {
      showToast(currentLang === "tr" ? "Backend yok: Önizleme yapılamıyor." : "No backend: preview unavailable.");
      return;
    }

    writeLog(currentLang === "tr" ? "> Bilgi alınıyor…" : "> Fetching info…");

    try {
      const res = await fetch(`${apiBase}/info?url=${encodeURIComponent(url)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data && data.detail ? data.detail : (currentLang === "tr" ? "Önizleme hatası." : "Preview error.");
        writeLog(`> ERROR: ${msg}`);
        showToast(msg);
        return;
      }

      updatePreview(data);
      writeLog(currentLang === "tr" ? "> Hazır." : "> Ready.");
    } catch (e) {
      writeLog(`> ERROR: ${String(e)}`);
      showToast(currentLang === "tr" ? "Ağ hatası." : "Network error.");
    }
  };

  if (previewBtn) previewBtn.addEventListener("click", doPreview);

  // 3) Download
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const url = (urlEl ? urlEl.value : "").trim();
    const mode = (modeEl ? modeEl.value : "video").trim();
    const fmt = (fmtEl ? fmtEl.value : "best").trim();
    const rightsOk = rightsEl ? !!rightsEl.checked : true;

    if (!url) {
      showToast(currentLang === "tr" ? "Lütfen bir URL girin." : "Please enter a URL.");
      return;
    }

    if (!rightsOk) {
      showToast(currentLang === "tr" ? "Devam etmek için onay kutusunu işaretleyin." : "Please tick the confirmation box to continue.");
      return;
    }

    if (!apiOk) {
      showToast(currentLang === "tr" ? "Backend yok: İndirme yapılamıyor." : "No backend: download unavailable.");
      return;
    }

    // Optional: Fetch preview first (fast validation)
    await doPreview();

    const dlUrl = `${apiBase}/download?url=${encodeURIComponent(url)}&mode=${encodeURIComponent(mode)}&format=${encodeURIComponent(fmt)}`;

    writeLog(currentLang === "tr" ? "> İndirme başlatıldı (tarayıcı indiriyor)…" : "> Download started (browser will download)…");
    showToast(currentLang === "tr" ? "İndirme başlatıldı." : "Download started.");

    // Navigate to the download endpoint so the browser handles the file
    window.location.href = dlUrl;
  });
}

// ---------------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------------

function init() {
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

  // Nav
  initNav();
  setActiveNav();

  // UX
  initScrollProgress();
  initReveal();
  initBackToTop();
  initFooterYear();

  // Page-specific
  initContact();
  initCVDownload();
  initVidExtractWeb();

  console.log("Portfolio initialized.");
}

document.addEventListener("DOMContentLoaded", init);
