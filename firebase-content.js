// ============================================================
//  firebase-content.js
//  Firestore'dan içerikleri çekip sayfaya yansıtır.
//  Tüm HTML sayfalarına bu script eklenir.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import FIREBASE_CONFIG from "./firebase-config.js";

const app = initializeApp(FIREBASE_CONFIG);
const db  = getFirestore(app);

// Aktif dili al (app.js ile uyumlu)
function getLang() {
  try { return localStorage.getItem("eb_lang") || "tr"; } catch { return "tr"; }
}

// data-fb-key="collection/docId/field" olan elementleri doldur
async function fillElements() {
  const elements = document.querySelectorAll("[data-fb-key]");
  if (!elements.length) return;

  // Hangi doc'lar lazım — grupla
  const needed = {};
  elements.forEach(el => {
    const [col, docId] = el.getAttribute("data-fb-key").split("/");
    const key = `${col}/${docId}`;
    if (!needed[key]) needed[key] = { col, docId, els: [] };
    needed[key].els.push(el);
  });

  await Promise.all(Object.values(needed).map(async ({ col, docId, els }) => {
    try {
      const snap = await getDoc(doc(db, col, docId));
      if (!snap.exists()) return;
      const data = snap.data();
      const lang = getLang();

      els.forEach(el => {
        const field = el.getAttribute("data-fb-key").split("/")[2];
        if (!field || !(field in data)) return;
        const val = data[field];
        // Çok dilli obje mi? { tr: "...", en: "..." }
        const text = (val && typeof val === "object") ? (val[lang] || val.tr || "") : val;
        if (text) el.textContent = text;
      });
    } catch (e) {
      console.warn("Firebase content load error:", e);
    }
  }));
}

// projects.json yerine Firestore'dan proje listesi
export async function getProjects() {
  try {
    const snap = await getDocs(collection(db, "projects"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    // Firestore'a ulaşılamazsa mevcut JSON'a düş
    const res = await fetch("assets/data/projects.json");
    const json = await res.json();
    return json.projects;
  }
}

// posts yerine Firestore'dan yazılar
export async function getPosts() {
  try {
    const q = query(collection(db, "posts"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    const res = await fetch("assets/data/posts.json");
    const json = await res.json();
    return json.posts;
  }
}

// Sayfa yüklenince çalıştır
document.addEventListener("DOMContentLoaded", fillElements);

export { db };
