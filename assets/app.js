/*
  Ekrem Bulgan Portfolio - Main Script
  Combined & Refactored
  Features:
  - Language toggle (TR/EN)
  - Theme toggle (Dark/Light)
  - Mobile Navigation
  - Scroll Progress & Reveal Animations
  - Project Modal
  - Contact Helpers & VidExtract Demo
*/

// 🔧 Konfigürasyon
const CONTACT_EMAIL = "ekrembulgan2@gmail.com";
const STORAGE = {
  lang: "eb_lang",
  theme: "eb_theme",
};

// 🛠 Yardımcı Fonksiyonlar (Selector)
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Durum Değişkeni
let currentLang = "tr";

/* -------------------------------------------------------------------------- */
/* UI COMPONENTS                                */
/* -------------------------------------------------------------------------- */

// Toast Mesaj Gösterimi
function showToast(message) {
  let toast = $("#toast");
  
  // Eğer HTML'de toast yoksa dinamik oluştur (Yedek)
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("is-visible");
  
  // Varsa eski timer'ı temizle
  if (showToast._t) window.clearTimeout(showToast._t);
  
  // 2.4 saniye sonra gizle
  showToast._t = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

// Kopyalama İşlemi (Clipboard)
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback: Eski tarayıcılar için
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

/* -------------------------------------------------------------------------- */
/* LANGUAGE HANDLER                               */
/* -------------------------------------------------------------------------- */

function setLanguage(lang) {
  currentLang = lang === "en" ? "en" : "tr";
  document.documentElement.lang = currentLang;
  localStorage.setItem(STORAGE.lang, currentLang);

  // Nav butonunu güncelle
  const langBtn = $("#lang-btn");
  if (langBtn) langBtn.textContent = currentLang === "tr" ? "EN" : "TR";

  // 1. Düz metinleri güncelle (data-tr / data-en)
  $$('[data-tr][data-en]').forEach((el) => {
    const value = currentLang === "tr" ? el.getAttribute("data-tr") : el.getAttribute("data-en");
    if (value) el.textContent = value;
  });

  // 2. Placeholderları güncelle (inputlar için)
  $$('[data-tr-placeholder][data-en-placeholder]').forEach((el) => {
    const value = currentLang === "tr" ? el.getAttribute("data-tr-placeholder") : el.getAttribute("data-en-placeholder");
    if (value) el.setAttribute("placeholder", value);
  });

  // 3. Eğer modal açıksa onun dilini de anlık değiştir
  const modal = $("#project-modal");
  if (modal?.classList.contains("is-open") && modal._activeProject) {
    fillModalFromProject(modal._activeProject);
  }
}

function toggleLanguage() {
  setLanguage(currentLang === "tr" ? "en" : "tr");
}

/* -------------------------------------------------------------------------- */
/* THEME HANDLER                                */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* NAVIGATION & MENU                              */
/* -------------------------------------------------------------------------- */

function initNav() {
  const btn = $("#menu-btn");
  const panel = $("#mobile-panel");
  
  if (!btn || !panel) return;

  const closeNav = () => {
    panel.style.display = "none";
    btn.setAttribute("aria-expanded", "false");
  };

  const openNav = () => {
    panel.style.display = "block";
    btn.setAttribute("aria-expanded", "true");
  };

  // Toggle button
  btn.addEventListener("click", () => {
    const isOpen = panel.style.display === "block";
    isOpen ? closeNav() : openNav();
  });

  // Dışarı tıklayınca kapat
  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && e.target !== btn) closeNav();
  });

  // Linke tıklayınca kapat
  $$("a", panel).forEach((a) => a.addEventListener("click", closeNav));
}

// Aktif sayfayı menüde işaretle
function setActiveNav() {
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const links = $$(".nav-links a, .mobile-panel a");
  
  links.forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (!href) return;
    // Tam eşleşme veya ana sayfa kontrolü
    const isMatch = href === path || (path === "" && href.includes("index"));
    a.classList.toggle("active", isMatch);
  });
}

/* -------------------------------------------------------------------------- */
/* SCROLL & ANIMATIONS                             */
/* -------------------------------------------------------------------------- */

function initScrollProgress() {
  const bar = $("#progress-bar"); // style.css'te .top-progress__bar olmalı
  if (!bar) return;

  const update = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = height > 0 ? (scrollTop / height) * 100 : 0;
    bar.style.width = `${pct}%`;
  };
  
  window.addEventListener("scroll", update, { passive: true });
  update();
}

function initToTop() {
  const btn = $("#to-top"); // HTML'de ekli olmalı
  if (!btn) return;

  const update = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    btn.classList.toggle("is-visible", y > 700);
  };

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", update, { passive: true });
  update();
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

/* -------------------------------------------------------------------------- */
/* PROJECT MODAL                                */
/* -------------------------------------------------------------------------- */

function fillModalFromProject(projectEl) {
  const modal = $("#project-modal");
  if (!modal) return;

  const title = projectEl.getAttribute("data-title") || "Project";
  const link = projectEl.getAttribute("data-link") || "#";
  // Dile göre açıklama seç
  const desc = currentLang === "tr"
      ? projectEl.getAttribute("data-tr-desc") || ""
      : projectEl.getAttribute("data-en-desc") || "";

  const tagsRaw = projectEl.getAttribute("data-tags") || "";
  const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

  $("#modal-title").textContent = title;
  $("#modal-desc").textContent = desc;
  
  const tagsWrap = $("#modal-tags");
  if (tagsWrap) {
    tagsWrap.innerHTML = "";
    tags.forEach((t) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = t;
      tagsWrap.appendChild(span);
    });
  }

  const modalLink = $("#modal-link");
  if (modalLink) modalLink.href = link;

  modal._activeProject = projectEl;
}

function openModal(projectEl) {
  const modal = $("#project-modal");
  if (!modal) return;
  fillModalFromProject(projectEl);
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden"; // Scroll'u kilitle
}

function closeModal() {
  const modal = $("#project-modal");
  if (!modal) return;
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
  modal._activeProject = null;
}

function initModal() {
  const modal = $("#project-modal");
  if (!modal) return;

  // Tıklama olayları
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    // 1. Modalı açan buton mu?
    const openBtn = target.closest("[data-open-modal]");
    if (openBtn) {
      e.preventDefault();
      const card = openBtn.closest(".project-card");
      if (card) openModal(card);
      return;
    }

    // 2. Kartın kendisine tıklandı mı? (Linklere tıklanmadıysa)
    const card = target.closest(".project-card");
    if (card && !target.closest("a") && !target.closest("button")) {
      openModal(card);
    }

    // 3. Kapatma butonu veya Overlay mi?
    if (target.closest("[data-close-modal]") || target.classList.contains("modal__overlay")) {
      closeModal();
    }
  });

  // ESC tuşu ile kapatma
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

/* -------------------------------------------------------------------------- */
/* CONTACT & FORMS                                */
/* -------------------------------------------------------------------------- */

function initContact() {
  // Mailto linklerini otomatik ayarla
  $$("a[data-email]").forEach((a) => {
    a.setAttribute("href", `mailto:${CONTACT_EMAIL}`);
    a.textContent = CONTACT_EMAIL;
  });

  // Kopyalama butonu
  const copyBtn = $("#copy-email"); // contact.html'deki ID
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const ok = await copyToClipboard(CONTACT_EMAIL);
      if (ok) {
        showToast(currentLang === "tr" ? "E-posta kopyalandı." : "Email copied.");
        // Buton metnini geçici değiştir
        const originalText = copyBtn.textContent;
        copyBtn.textContent = currentLang === "tr" ? "Kopyalandı ✓" : "Copied ✓";
        setTimeout(() => copyBtn.textContent = originalText, 1500);
      } else {
        showToast(currentLang === "tr" ? "Hata oluştu." : "Error.");
      }
    });
  }

  // İletişim Formu (Mailto Draft Oluşturucu)
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

/* -------------------------------------------------------------------------- */
/* DEMO FEATURES                                */
/* -------------------------------------------------------------------------- */

function wireVidextractDemo() {
  const form = $("#extract-form");
  const out = $("#extract-output");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = new FormData(form).get("url");

    const msg = currentLang === "tr"
      ? `> İstek gönderildi: ${url}\n> HATA: Backend bağlantısı bulunamadı.\n> Bu statik bir demodu. Gerçek işlem için API gerekir.`
      : `> Request sent: ${url}\n> ERROR: No backend connection.\n> This is a static demo. Real extraction requires an API.`;

    if (out) out.textContent = msg;
  });
}

function initFooterYear() {
  const y = $("#year"); // HTML'de <span id="year"></span> olmalı
  if (y) y.textContent = String(new Date().getFullYear());
}

/* -------------------------------------------------------------------------- */
/* INITIALIZATION                               */
/* -------------------------------------------------------------------------- */

function init() {
  // 1. Dil Ayarları
  const storedLang = localStorage.getItem(STORAGE.lang);
  const browserLang = (navigator.language || "").toLowerCase().startsWith("tr") ? "tr" : "en";
  setLanguage(storedLang || document.documentElement.lang || browserLang);

  // 2. Tema Ayarları
  const storedTheme = localStorage.getItem(STORAGE.theme);
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  setTheme(storedTheme || (prefersLight ? "light" : "dark"));

  // 3. Event Listenerlar
  $("#lang-btn")?.addEventListener("click", toggleLanguage);
  $("#theme-btn")?.addEventListener("click", toggleTheme);

  // 4. Modülleri Başlat
  initNav();
  setActiveNav();
  initScrollProgress();
  initToTop();
  initReveal();
  initModal();
  initContact();
  wireVidextractDemo();
  initFooterYear();
  
  console.log("Ekrem Bulgan Portfolio initialized.");
}

// Sayfa yüklendiğinde başlat
document.addEventListener("DOMContentLoaded", init);