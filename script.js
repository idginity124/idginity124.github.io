/*
  Portfolio template upgrades
  - Language toggle (TR/EN) + persistent preference
  - Theme toggle (dark/light) + persistent preference
  - Mobile nav
  - Scroll progress, scroll-spy, reveal animations
  - Project modal
  - Contact helpers (copy email + mailto draft)
*/

// 🔧 Change this to your real address
const CONTACT_EMAIL = "EkremBulgan2@gmail.com";

const STORAGE = {
  lang: "eb_lang",
  theme: "eb_theme",
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

let currentLang = "tr";

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function setLanguage(lang) {
  currentLang = lang === "en" ? "en" : "tr";
  document.documentElement.lang = currentLang;
  localStorage.setItem(STORAGE.lang, currentLang);

  const langBtn = $("#lang-btn");
  if (langBtn) langBtn.textContent = currentLang === "tr" ? "EN" : "TR";

  // Text nodes
  $$('[data-tr][data-en]').forEach((el) => {
    const value = currentLang === "tr" ? el.getAttribute("data-tr") : el.getAttribute("data-en");
    if (typeof value === "string") el.textContent = value;
  });

  // Placeholders
  $$('[data-tr-placeholder][data-en-placeholder]').forEach((el) => {
    const value = currentLang === "tr" ? el.getAttribute("data-tr-placeholder") : el.getAttribute("data-en-placeholder");
    if (typeof value === "string") el.setAttribute("placeholder", value);
  });

  // If modal is open, keep it consistent
  const modal = $("#project-modal");
  if (modal?.classList.contains("is-open")) {
    const active = modal._activeProject;
    if (active) fillModalFromProject(active);
  }
}

function toggleLanguage() {
  setLanguage(currentLang === "tr" ? "en" : "tr");
}

function setTheme(theme) {
  const t = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = t;
  localStorage.setItem(STORAGE.theme, t);

  const icon = $("#theme-btn i");
  if (icon) {
    icon.className = t === "light" ? "fa-solid fa-moon" : "fa-solid fa-sun";
  }
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme || "dark";
  setTheme(current === "dark" ? "light" : "dark");
}

function initNav() {
  const toggle = $("#nav-toggle");
  const links = $("#nav-links");
  if (!toggle || !links) return;

  const closeNav = () => {
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close on link click
  $$("a.nav-link", links).forEach((a) => a.addEventListener("click", closeNav));

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!document.body.classList.contains("nav-open")) return;
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (target.closest("#site-nav")) return;
    closeNav();
  });
}

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

function initToTop() {
  const btn = $("#to-top");
  if (!btn) return;

  const update = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    btn.classList.toggle("is-visible", y > 700);
  };

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
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
    { threshold: 0.12 }
  );

  items.forEach((el) => obs.observe(el));
}

function initScrollSpy() {
  const links = $$(".nav-link");
  const sections = links
    .map((a) => {
      const id = a.getAttribute("href")?.slice(1);
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  if (!links.length || !sections.length) return;

  const byId = new Map(links.map((a) => [a.getAttribute("href")?.slice(1), a]));

  const obs = new IntersectionObserver(
    (entries) => {
      // Pick the most visible section
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
      if (!visible) return;
      const id = visible.target.id;
      links.forEach((a) => a.classList.remove("active"));
      const active = byId.get(id);
      active?.classList.add("active");
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: [0.05, 0.1, 0.2, 0.4] }
  );

  sections.forEach((s) => obs.observe(s));
}

function fillModalFromProject(projectEl) {
  const modal = $("#project-modal");
  if (!modal) return;

  const title = projectEl.getAttribute("data-title") || "Project";
  const link = projectEl.getAttribute("data-link") || "#";
  const desc =
    currentLang === "tr"
      ? projectEl.getAttribute("data-tr-desc") || ""
      : projectEl.getAttribute("data-en-desc") || "";

  const tagsRaw = projectEl.getAttribute("data-tags") || "";
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  $("#modal-title").textContent = title;
  $("#modal-desc").textContent = desc;
  const tagsWrap = $("#modal-tags");
  tagsWrap.innerHTML = "";
  tags.forEach((t) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = t;
    tagsWrap.appendChild(span);
  });

  const modalLink = $("#modal-link");
  modalLink.href = link;

  modal._activeProject = projectEl;
}

function openModal(projectEl) {
  const modal = $("#project-modal");
  if (!modal) return;
  fillModalFromProject(projectEl);
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = $("#project-modal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  modal._activeProject = null;
}

function initModal() {
  const modal = $("#project-modal");
  if (!modal) return;

  // Open via button
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const openBtn = target.closest("[data-open-modal]");
    if (openBtn) {
      e.preventDefault();
      const card = openBtn.closest(".project-card");
      if (card) openModal(card);
      return;
    }

    // Open by clicking on the card itself (but not on links)
    const card = target.closest(".project-card");
    if (card && !target.closest("a")) {
      openModal(card);
    }

    // Close
    if (target.closest("[data-close-modal]")) {
      closeModal();
    }
  });

  // Keyboard support: Enter/Space on cards, Esc to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();

    const active = document.activeElement;
    if (!active || !(active instanceof Element)) return;

    // Only trigger when the card itself is focused (not a link/button inside the card)
    if (!active.classList.contains("project-card")) return;
    const card = active;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal(card);
    }
  });
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
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

function initContact() {
  const emailBtn = $("#email-btn");
  const copyBtn = $("#copy-email-btn");
  const form = $("#contact-form");

  const emailToast = () => showToast(currentLang === "tr" ? "E-posta hazır." : "Email ready.");

  emailBtn?.addEventListener("click", async () => {
    const ok = await copyToClipboard(CONTACT_EMAIL);
    showToast(ok ? (currentLang === "tr" ? "E-posta kopyalandı." : "Email copied.") : (currentLang === "tr" ? "Kopyalanamadı." : "Copy failed."));
  });

  copyBtn?.addEventListener("click", async () => {
    const ok = await copyToClipboard(CONTACT_EMAIL);
    showToast(ok ? (currentLang === "tr" ? "E-posta kopyalandı." : "Email copied.") : (currentLang === "tr" ? "Kopyalanamadı." : "Copy failed."));
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (new FormData(form).get("name") || "").toString().trim();
    const email = (new FormData(form).get("email") || "").toString().trim();
    const message = (new FormData(form).get("message") || "").toString().trim();

    const subject = encodeURIComponent(`Portfolio Contact — ${name || ""}`.trim());
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent from portfolio site.`
    );

    // Opens the user's email client with a ready draft
    window.location.href = `mailto:${encodeURIComponent(CONTACT_EMAIL)}?subject=${subject}&body=${body}`;
    emailToast();
  });
}

function initFooterYear() {
  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());
}

function init() {
  // Language
  const storedLang = localStorage.getItem(STORAGE.lang);
  const browserLang = (navigator.language || "").toLowerCase().startsWith("tr") ? "tr" : "en";
  setLanguage(storedLang || document.documentElement.lang || browserLang);
  $("#lang-btn")?.addEventListener("click", toggleLanguage);

  // Theme
  const storedTheme = localStorage.getItem(STORAGE.theme);
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  setTheme(storedTheme || (prefersLight ? "light" : "dark"));
  $("#theme-btn")?.addEventListener("click", toggleTheme);

  initNav();
  initScrollProgress();
  initToTop();
  initReveal();
  initScrollSpy();
  initModal();
  initContact();
  initFooterYear();
}

document.addEventListener("DOMContentLoaded", init);
