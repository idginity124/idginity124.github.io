// ============================================================
//  firebase-content.js  v2
//  Firestore'dan içerik çekip sayfa elementlerini günceller.
// ============================================================

import { initializeApp }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, orderBy, query }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Config'i firebase-config.js'den al
let FIREBASE_CONFIG = null;
try {
  const mod = await import("./firebase-config.js");
  FIREBASE_CONFIG = mod.default;
} catch {
  console.warn("[FB] firebase-config.js bulunamadı, JSON fallback kullanılıyor.");
  loadFromJSON();
}

if (!FIREBASE_CONFIG) throw new Error("No Firebase config");

const app = initializeApp(FIREBASE_CONFIG);
const db  = getFirestore(app);

// Aktif dil
function lang() {
  try { return localStorage.getItem("eb_lang") || "tr"; } catch { return "tr"; }
}

// Hangi sayfadayız
const page = (() => {
  const p = location.pathname.split("/").pop() || "index.html";
  if (p === "" || p === "index.html") return "index";
  if (p === "about.html")    return "about";
  if (p === "now.html")      return "now";
  if (p === "projects.html") return "projects";
  if (p === "blog.html")     return "blog";
  return "other";
})();

// ── INDEX ────────────────────────────────────────────────────
function patchIndex(data) {
  const l = lang();

  // Hero başlık
  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle && data["title-tr"]) {
    heroTitle.textContent = l === "tr" ? data["title-tr"] : (data["title-en"] || data["title-tr"]);
    heroTitle.setAttribute("data-tr", data["title-tr"]);
    heroTitle.setAttribute("data-en", data["title-en"] || "");
  }

  // Hero alt metin
  const heroSub = document.querySelector(".hero-subtitle");
  if (heroSub && data["subtitle-tr"]) {
    heroSub.textContent = l === "tr" ? data["subtitle-tr"] : (data["subtitle-en"] || data["subtitle-tr"]);
    heroSub.setAttribute("data-tr", data["subtitle-tr"]);
    heroSub.setAttribute("data-en", data["subtitle-en"] || "");
  }

  // Typewriter
  const tw = document.getElementById("typewriter");
  if (tw) {
    if (data["typewriter-tr"]) tw.setAttribute("data-lines-tr", data["typewriter-tr"]);
    if (data["typewriter-en"]) tw.setAttribute("data-lines-en", data["typewriter-en"]);
  }

  // Badge
  const badge = document.querySelector(".hero .badge");
  if (badge && data["badge-tr"]) {
    badge.textContent = l === "tr" ? data["badge-tr"] : (data["badge-en"] || data["badge-tr"]);
    badge.setAttribute("data-tr", data["badge-tr"]);
    badge.setAttribute("data-en", data["badge-en"] || "");
  }

  // Profil kartı rol
  const role = document.querySelector(".profile-role");
  if (role && data["role-tr"]) {
    role.textContent = l === "tr" ? data["role-tr"] : (data["role-en"] || data["role-tr"]);
    role.setAttribute("data-tr", data["role-tr"]);
    role.setAttribute("data-en", data["role-en"] || "");
  }

  // Profil mini-v (odak, yaklaşım, çıktı)
  const miniVals = document.querySelectorAll(".mini-v");
  if (miniVals[0] && data["focus-tr"]) {
    miniVals[0].textContent = l === "tr" ? data["focus-tr"] : (data["focus-en"] || data["focus-tr"]);
    miniVals[0].setAttribute("data-tr", data["focus-tr"]);
    miniVals[0].setAttribute("data-en", data["focus-en"] || "");
  }
  if (miniVals[2] && data["output-tr"]) {
    miniVals[2].textContent = l === "tr" ? data["output-tr"] : (data["output-en"] || data["output-tr"]);
    miniVals[2].setAttribute("data-tr", data["output-tr"]);
    miniVals[2].setAttribute("data-en", data["output-en"] || "");
  }
}

// ── ABOUT ────────────────────────────────────────────────────
function patchAbout(data) {
  const l = lang();

  // İlk prose paragrafı = özet
  const summaryP = document.querySelector(".prose p");
  if (summaryP && data["summary-tr"]) {
    summaryP.textContent = l === "tr" ? data["summary-tr"] : (data["summary-en"] || data["summary-tr"]);
    summaryP.setAttribute("data-tr", data["summary-tr"]);
    summaryP.setAttribute("data-en", data["summary-en"] || "");
  }

  // Odak fact (ilk fact-v)
  const facts = document.querySelectorAll(".fact-v");
  if (facts[0] && data["focus-tr"]) {
    facts[0].textContent = l === "tr" ? data["focus-tr"] : (data["focus-en"] || data["focus-tr"]);
    facts[0].setAttribute("data-tr", data["focus-tr"]);
    facts[0].setAttribute("data-en", data["focus-en"] || "");
  }

  // Timeline 2. ve 3. madde
  const bullets = document.querySelectorAll("#timeline .bullets li");
  if (bullets[1] && data["timeline2-tr"]) {
    bullets[1].textContent = data["timeline2-tr"];
    bullets[1].setAttribute("data-tr", data["timeline2-tr"]);
  }
  if (bullets[2] && data["timeline3-tr"]) {
    bullets[2].textContent = data["timeline3-tr"];
    bullets[2].setAttribute("data-tr", data["timeline3-tr"]);
  }
}

// ── NOW ──────────────────────────────────────────────────────
function patchNow(data) {
  const l = lang();

  // Şu an odak bullets — ilk panel
  const panels = document.querySelectorAll(".panel");
  if (panels[0]) {
    const fBullets = panels[0].querySelectorAll(".bullets li");
    [["focus1-tr","focus1-en"],["focus2-tr",""],["focus3-tr",""]].forEach(([ktr,ken], i) => {
      if (fBullets[i] && data[ktr]) {
        const val = (l === "en" && ken && data[ken]) ? data[ken] : data[ktr];
        fBullets[i].textContent = val;
        fBullets[i].setAttribute("data-tr", data[ktr]);
      }
    });
  }

  // Açık olduğum — ikinci panel
  if (panels[1]) {
    const oBullets = panels[1].querySelectorAll(".bullets li");
    ["open1-tr","open2-tr","open3-tr"].forEach((key, i) => {
      if (oBullets[i] && data[key]) {
        oBullets[i].textContent = data[key];
        oBullets[i].setAttribute("data-tr", data[key]);
      }
    });
  }

  // Yakın hedefler prose
  const goalP = document.querySelector(".panel .prose p");
  if (goalP && data["goals-tr"]) {
    goalP.textContent = l === "tr" ? data["goals-tr"] : (data["goals-en"] || data["goals-tr"]);
    goalP.setAttribute("data-tr", data["goals-tr"]);
    goalP.setAttribute("data-en", data["goals-en"] || "");
  }
}

// ── PROJELER & YAZILAR (global cache) ───────────────────────
async function loadProjects() {
  try {
    const snap = await getDocs(collection(db, "projects"));
    if (!snap.empty) window.__fbProjects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { /* JSON'a düş */ }
}

async function loadPosts() {
  try {
    const q = query(collection(db, "posts"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    if (!snap.empty) window.__fbPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { /* JSON'a düş */ }
}

// ── JSON FALLBACK ────────────────────────────────────────────
async function loadFromJSON() {
  try {
    const r1 = await fetch("assets/data/projects.json");
    const j1 = await r1.json();
    window.__fbProjects = j1.projects;
  } catch {}
  try {
    const r2 = await fetch("assets/data/posts.json");
    const j2 = await r2.json();
    window.__fbPosts = j2.posts;
  } catch {}
}

// ── ANA ÇALIŞMA ──────────────────────────────────────────────
async function run() {
  try {
    const promises = [loadProjects(), loadPosts()];

    if (page === "index") {
      const snap = await getDoc(doc(db, "content", "hero"));
      if (snap.exists()) patchIndex(snap.data());
    } else if (page === "about") {
      const snap = await getDoc(doc(db, "content", "about"));
      if (snap.exists()) patchAbout(snap.data());
    } else if (page === "now") {
      const snap = await getDoc(doc(db, "content", "now"));
      if (snap.exists()) patchNow(snap.data());
    }

    await Promise.all(promises);
  } catch(e) {
    console.warn("[FB] Error, falling back to JSON:", e.message);
    await loadFromJSON();
  }
}

// DOM hazır olunca çalıştır
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", run);
} else {
  run();
}

// Dil değişince yeniden uygula
window.addEventListener("eb:langchange", () => run());

export { db };
