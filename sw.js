'use strict';

// Önemli: Her dosya değişikliğinde versiyonu artır (v2.2.0 gibi)
const VERSION = 'v2.2.0-2026-03-01'; 
const CACHE = `eb-portfolio-${VERSION}`;

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./projects.html",
  "./about.html",
  "./blog.html",
  "./now.html",
  "./contact.html",
  "./404.html",
  "./offline.html",
  "./sitemap.xml",
  "./robots.txt",
  "./manifest.webmanifest",
  "./assets/styles.css",
  "./assets/app.js",
  "./assets/favicon.svg",
  "./assets/img/vidextract_logo.png",
  "./assets/data/projects.json",
  "./assets/data/posts.json"
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => (k.startsWith('eb-portfolio-') && k !== CACHE) ? caches.delete(k) : null))));
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./offline.html'))));
  } else {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    })));
  }
});