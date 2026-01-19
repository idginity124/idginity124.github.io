/*
  Ekrem Bulgan Portfolio - Main Script
  Final Clean Version
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
/* UI COMPONENTS (Toast & Clipboard)                                */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* LANGUAGE HANDLER                               */
/* -------------------------------------------------------------------------- */

function setLanguage(lang) {
  currentLang = lang === "en" ? "en" : "tr";
  document.documentElement.lang = currentLang;
  localStorage.setItem(STORAGE.lang, currentLang);

  const langBtn = $("#lang-btn");
  if (langBtn) langBtn.textContent = currentLang === "tr" ? "EN" : "TR";

  // Metinleri güncelle
  $$('[data-tr][data-en]').forEach((el) => {
    const value = currentLang === "tr" ? el.getAttribute("data-tr") : el.getAttribute("data-en");
    if (value) el.textContent = value;
  });

  // Input Placeholderları güncelle
  $$('[data-tr-placeholder][data-en-placeholder]').forEach((el) => {
    const value = currentLang === "tr" ? el.getAttribute("data-tr-placeholder") : el.getAttribute("data-en-placeholder");
    if (value) el.setAttribute("placeholder", value);
  });
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

function initTheme() {
  const themeBtn = $("#theme-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", toggleTheme);
  }
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

  btn.addEventListener("click", () => {
    const isOpen = panel.style.display === "block";
    isOpen ? closeNav() : openNav();
  });

  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && e.target !== btn) closeNav();
  });

  $$("a", panel).forEach((a) => a.addEventListener("click", closeNav));
}

function setActiveNav() {
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const links = $$(".nav-links a, .mobile-panel a");
  
  links.forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (!href) return;
    const isMatch = href === path || (path === "" && href.includes("index"));
    a.classList.toggle("active", isMatch);
  });
}

/* -------------------------------------------------------------------------- */
/* CONTACT & CV DOWNLOAD                            */
/* -------------------------------------------------------------------------- */

function initContact() {
  // 1. Mailto Linkleri
  $$("a[data-email]").forEach((a) => {
    a.setAttribute("href", `mailto:${CONTACT_EMAIL}`);
    a.textContent = CONTACT_EMAIL;
  });

  // 2. Kopyalama Butonu
  const copyBtn = $("#copy-email");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const ok = await copyToClipboard(CONTACT_EMAIL);
      if (ok) {
        showToast(currentLang === "tr" ? "E-posta kopyalandı." : "Email copied.");
      } else {
        showToast(currentLang === "tr" ? "Hata oluştu." : "Error.");
      }
    });
  }

  // 3. İletişim Formu
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
  const btn = document.getElementById("download-cv");
  if (!btn) return;
  
  btn.addEventListener("click", () => {
    // PDF yolunun doğru olduğundan emin ol: assets/cv/Ekrem_Bulgan_CV.pdf
    const cvUrl = "assets/cv/Ekrem_Bulgan_CV.pdf";
    window.open(cvUrl, '_blank');
    
    showToast(currentLang === "tr" ? "CV indiriliyor..." : "Downloading CV...");
  });
}

/* -------------------------------------------------------------------------- */
/* OTHER FEATURES (Scroll, Reveal, Demo, Footer)                    */
/* -------------------------------------------------------------------------- */

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
  // contact.html içinde footer yıl ID'si belirtilmemiş olabilir, bu yüzden güvenli seçim yapıyoruz
  const y = $("#current-year") || $("#year") || $("footer p span"); 
  if (y && !isNaN(y.textContent)) { // Sadece sayı ise veya boşsa güncelle
      y.textContent = String(new Date().getFullYear());
  }
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

  // 3. Modülleri Başlat
  initTheme();         // Tema butonunu bağla
  initNav();           // Menüyü bağla
  setActiveNav();      // Aktif sayfayı işaretle
  initScrollProgress();// Scroll çubuğu (varsa)
  initReveal();        // Animasyonlar
  initContact();       // İletişim formu ve kopyalama
  initCVDownload();    // CV İndirme
  wireVidextractDemo();// VidExtract demosu
  initFooterYear();    // Footer yılı
  
  console.log("Ekrem Bulgan Portfolio initialized.");
}

// Sayfa yüklendiğinde başlat
document.addEventListener("DOMContentLoaded", init);