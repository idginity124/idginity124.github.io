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
  const pathname = (location.pathname || "").toLowerCase();
  const file = (pathname.split("/").pop() || "index.html").toLowerCase();
  const current = file || "index.html";

  // If we're inside /projects/, highlight the Projects nav item.
  const inProjects = pathname.includes("/projects/");

  const links = $$(".nav-links a");

  links.forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    const hrefFile = (href.split("/").pop() || "").toLowerCase();

    let isMatch = hrefFile === current || (current === "index.html" && (hrefFile === "" || hrefFile === "/"));

    if (!isMatch && inProjects && hrefFile === "projects.html") {
      isMatch = true;
    }

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

  console.log("Portfolio initialized.");
}

document.addEventListener("DOMContentLoaded", init);
