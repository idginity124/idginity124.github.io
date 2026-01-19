// Language toggle + Contact helpers (GitHub Pages friendly)

let currentLang = "tr";

function setLanguage(lang) {
  currentLang = lang === "en" ? "en" : "tr";
  document.documentElement.lang = currentLang;

  // Toggle button label
  const langBtn = document.getElementById("lang-btn");
  if (langBtn) langBtn.innerText = currentLang === "tr" ? "EN" : "TR";

  // Update text content
  document.querySelectorAll("[data-tr][data-en]").forEach((el) => {
    const value = currentLang === "tr" ? el.getAttribute("data-tr") : el.getAttribute("data-en");
    if (value != null) el.innerText = value;
  });
}

function toggleLanguage() {
  setLanguage(currentLang === "tr" ? "en" : "tr");
}

// ----------------------------
// Multiple email + spam protection
// ----------------------------

// ✅ Buraya istediğin kadar ekle.
// Spam botlarını zorlamak için maili parçalıyoruz.
const mailParts = [
  ["ekrembulgan2", "gmail.com"],
  ["EkremBulgan", "proton.me"],
];

function getEmails() {
  return mailParts.map((p) => `${p[0]}@${p[1]}`);
}

function initContact() {
  const emailListEl = document.getElementById("emailList");
  const sendBtn = document.getElementById("sendMail");
  const copyBtn = document.getElementById("copyMail");
  const statusEl = document.getElementById("copyStatus");

  if (!emailListEl || !sendBtn || !copyBtn) return; // sayfada contact yoksa çık

  const emails = getEmails();

  // ekranda göster
  emailListEl.textContent = "📧 " + emails.join(" • ");

  // Mailto aç
  sendBtn.addEventListener("click", () => {
    const subject = currentLang === "tr" ? "İletişim" : "Contact";
    const body =
      currentLang === "tr"
        ? "Merhaba,\n\nSize ulaşmak istiyorum."
        : "Hi,\n\nI'd like to get in touch.";

    const mailto =
      `mailto:${emails.join(",")}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  });

  // Kopyala
  copyBtn.addEventListener("click", async () => {
    const text = emails.join(", ");
    try {
      await navigator.clipboard.writeText(text);
      if (statusEl) {
        statusEl.textContent = currentLang === "tr" ? "✅ Kopyalandı" : "✅ Copied";
        window.setTimeout(() => (statusEl.textContent = ""), 2200);
      }
    } catch (e) {
      // Clipboard API bazı tarayıcılarda/HTTP dışı ortamlarda kısıtlı olabilir
      if (statusEl) statusEl.textContent = currentLang === "tr" ? "Kopyalama desteklenmiyor" : "Copy not supported";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setLanguage("tr");
  initContact();
});
