// assets/components.js

const BASE_URL = (() => {
  const path = (location.pathname || "/").split("?")[0];
  const parts = path.split("/").filter(Boolean);
  const last = parts[parts.length - 1] || "";
  const isFile = last.includes(".");
  const depth = isFile ? Math.max(0, parts.length - 1) : parts.length;
  return depth <= 0 ? "" : "../".repeat(depth);
})();

// ORTAK ÜST MENÜ (FX Butonu Silindi)
const siteNav = `
  <nav class="nav">
    <div class="container nav-inner">
      <div style="display:flex; align-items:center; gap:14px;">
        <a class="logo" href="${BASE_URL}index.html" aria-label="Home">EB<span class="dot">.</span></a>
        <div class="nav-links" aria-label="Primary">
          <a class="nav-link" href="${BASE_URL}index.html" data-tr="Ana Sayfa" data-en="Home">Ana Sayfa</a>
          <a class="nav-link" href="${BASE_URL}projects.html" data-tr="Projeler" data-en="Projects">Projeler</a>
          <a class="nav-link" href="${BASE_URL}about.html" data-tr="Hakkımda" data-en="About">Hakkımda</a>
          <a class="nav-link" href="${BASE_URL}blog.html" data-tr="Yazılar" data-en="Blog">Yazılar</a>
          <a class="nav-link" href="${BASE_URL}now.html" data-tr="Şimdi" data-en="Now">Şimdi</a>
          <a class="nav-link" href="${BASE_URL}contact.html" data-tr="İletişim" data-en="Contact">İletişim</a>
        </div>
      </div>
      <div class="nav-controls">
        <button id="theme-btn" class="icon-btn" type="button" aria-label="Toggle theme"><i class="fa-solid fa-moon"></i></button>
        <button id="lang-btn" class="pill" type="button" aria-label="Toggle language">EN</button>
        <a class="icon-btn" href="https://github.com/idginity124" target="_blank" rel="noopener" aria-label="GitHub"><i class="fab fa-github"></i></a>
        <button id="menu-btn" class="nav-toggle" type="button" aria-label="Menu" aria-expanded="false"><i class="fa-solid fa-bars"></i></button>
      </div>
    </div>
  </nav>
`;

// ORTAK ALT KISIM (FOOTER)
const siteFooter = `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <strong>Ekrem Bulgan</strong>
          <div class="muted" style="margin-top:6px;" data-tr="AI • Bilgisayarlı Görü • Otomasyon" data-en="AI • Computer Vision • Automation">AI • Bilgisayarlı Görü • Otomasyon</div>
          <div class="muted" style="margin-top:10px;"><a href="mailto:ekrembulgan2@gmail.com">ekrembulgan2@gmail.com</a></div>
        </div>
        <div>
          <div class="muted" style="text-transform:uppercase; letter-spacing:.08em; font-size:.78rem;" data-tr="Kısayollar" data-en="Shortcuts">Kısayollar</div>
          <div class="footer-links" style="margin-top:10px;">
            <a href="${BASE_URL}projects.html" data-tr="Projeler" data-en="Projects">Projeler</a>
            <a href="${BASE_URL}about.html" data-tr="Hakkımda" data-en="About">Hakkımda</a>
            <a href="${BASE_URL}blog.html" data-tr="Yazılar" data-en="Blog">Yazılar</a>
            <a href="${BASE_URL}now.html" data-tr="Şimdi" data-en="Now">Şimdi</a>
            <a href="${BASE_URL}contact.html" data-tr="İletişim" data-en="Contact">İletişim</a>
          </div>
        </div>
        <div>
          <div class="muted" style="text-transform:uppercase; letter-spacing:.08em; font-size:.78rem;" data-tr="Bağlantılar" data-en="Links">Bağlantılar</div>
          <div class="footer-social" style="margin-top:10px;">
            <a class="icon-btn" href="https://linkedin.com/in/ekrembulgan" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
            <a class="icon-btn" href="https://github.com/idginity124" target="_blank" rel="noopener" aria-label="GitHub"><i class="fab fa-github"></i></a>
            <a class="icon-btn" href="${BASE_URL}assets/cv/Ekrem_Bulgan_CV.pdf" target="_blank" rel="noopener" aria-label="Resume"><i class="fa-solid fa-file-lines"></i></a>
            <a class="icon-btn" href="${BASE_URL}contact.html" aria-label="Contact"><i class="fa-regular fa-paper-plane"></i></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div>&copy; <span id="current-year">${new Date().getFullYear()}</span> Ekrem Bulgan</div>
        <div><span data-tr="Tüm hakları saklıdır." data-en="All rights reserved.">Tüm hakları saklıdır.</span></div>
      </div>
    </div>
  </footer>
`;

const navContainer = document.getElementById('site-nav-placeholder');
if (navContainer) navContainer.outerHTML = siteNav;

const footerContainer = document.getElementById('site-footer-placeholder');
if (footerContainer) footerContainer.outerHTML = siteFooter;