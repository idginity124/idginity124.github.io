/* Multi-page shared behavior (TR/EN) + nav + basic UI */

const CONTACT_EMAIL = "ekrembulgan2@gmail.com";
const LANG_KEY = "eb_lang";

function getCurrentLang() {
  return localStorage.getItem(LANG_KEY) || "tr";
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  applyLang(lang);
}

function applyLang(lang) {
  document.documentElement.setAttribute("lang", lang);

  const btn = document.getElementById("lang-btn");
  if (btn) btn.textContent = lang === "tr" ? "EN" : "TR";

  const nodes = document.querySelectorAll("[data-tr]");
  nodes.forEach((el) => {
    const tr = el.getAttribute("data-tr");
    const en = el.getAttribute("data-en");
    if (lang === "tr" && tr != null) el.textContent = tr;
    if (lang === "en" && en != null) el.textContent = en;
  });
  const placeholders = document.querySelectorAll("[data-tr-placeholder]");
  placeholders.forEach((el) => {
    const tr = el.getAttribute("data-tr-placeholder");
    const en = el.getAttribute("data-en-placeholder");
    if (lang === "tr" && tr != null) el.setAttribute("placeholder", tr);
    if (lang === "en" && en != null) el.setAttribute("placeholder", en);
  });

}

function toggleLanguage() {
  const next = getCurrentLang() === "tr" ? "en" : "tr";
  setLang(next);
}

function setActiveNav() {
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const links = document.querySelectorAll(".nav-links a, .mobile-panel a");
  links.forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (!href) return;
    const isMatch = href === path || (path === "" && href.includes("index"));
    a.classList.toggle("active", isMatch);
  });
}

function setupMobileMenu() {
  const btn = document.getElementById("menu-btn");
  const panel = document.getElementById("mobile-panel");
  if (!btn || !panel) return;

  const close = () => {
    panel.style.display = "none";
    btn.setAttribute("aria-expanded", "false");
  };
  const open = () => {
    panel.style.display = "block";
    btn.setAttribute("aria-expanded", "true");
  };

  btn.addEventListener("click", () => {
    const isOpen = panel.style.display === "block";
    isOpen ? close() : open();
  });

  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && e.target !== btn) close();
  });

  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}

function wireContactHelpers() {
  // Set mailto links automatically
  document.querySelectorAll("a[data-email]").forEach((a) => {
    a.setAttribute("href", `mailto:${CONTACT_EMAIL}`);
    a.textContent = CONTACT_EMAIL;
  });

  // Copy email button
  const copyBtn = document.getElementById("copy-email");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(CONTACT_EMAIL);
        copyBtn.textContent = getCurrentLang() === "tr" ? "Kopyalandı ✓" : "Copied ✓";
        setTimeout(() => {
          copyBtn.textContent = getCurrentLang() === "tr" ? "E-postayı Kopyala" : "Copy Email";
        }, 1400);
      } catch {
        alert(CONTACT_EMAIL);
      }
    });
  }
}

function wireContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("contact-note");
  const setStatus = (msg) => { if (status) status.textContent = msg; };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = (fd.get("name") || "").toString().trim();
    const email = (fd.get("email") || "").toString().trim();
    const message = (fd.get("message") || "").toString().trim();

    const lang = getCurrentLang();
    const subject = lang === "tr" ? `Portföy İletişim: ${name || "(isimsiz)"}` : `Portfolio Contact: ${name || "(no name)"}`;
    const bodyLines = [
      name ? `Name: ${name}` : "",
      email ? `Email: ${email}` : "",
      "",
      message || "",
    ].filter(Boolean);

    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    setStatus(lang === "tr" ? "E-posta taslağı açılıyor…" : "Opening email draft…");
    window.location.href = mailto;
  });
}

function wireVidextractDemo() {
  const form = document.getElementById("extract-form");
  if (!form) return;

  const out = document.getElementById("extract-output");
  const setOut = (msg) => { if (out) out.textContent = msg; };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const lang = getCurrentLang();
    const url = new FormData(form).get("url");

    setOut(
      lang === "tr"
        ? `Bu sayfa statik bir demo. (Girdi: ${url}) VidExtract'i webde çalıştırmak için bir backend/API gerekir.`
        : `This is a static demo. (Input: ${url}) To run VidExtract on the web you need a backend/API.`
    );

    // Example of how it WOULD look if you had an API endpoint:
    // fetch('/api/extract', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ url }) })
    //   .then(r => r.json())
    //   .then(data => setOut(JSON.stringify(data, null, 2)))
    //   .catch(() => setOut(lang === 'tr' ? 'API hatası' : 'API error'));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyLang(getCurrentLang());
  setActiveNav();
  setupMobileMenu();
  wireContactHelpers();
  wireContactForm();
  wireVidextractDemo();
});
