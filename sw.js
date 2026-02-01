/* Simple Service Worker for Ekrem Bulgan Portfolio
   - Offline-first for core shell
   - Network-first for HTML (keeps content fresh)
*/
'use strict';

const VERSION = 'v2.1.0-2026-02-01';
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
  "./feed.xml",
  "./robots.txt",
  "./manifest.webmanifest",
  "./assets/styles.css",
  "./assets/app.js",
  "./assets/fx.js",
  "./assets/favicon.svg",
  "./assets/img/vidextract_logo.png",
  "./assets/data/projects.json",
  "./assets/data/posts.json",
  "./blog/cv-deploy-checklist.html",
  "./blog/desktop-tool-ux.html",
  "./blog/shipping-mindset.html",
  "./projects/aviansense-ai.html",
  "./projects/ciphervault.html",
  "./projects/deskmind-ai.html",
  "./projects/lingopark.html",
  "./projects/mediamanagerpro.html",
  "./projects/quiz-app.html",
  "./projects/sysgaze.html",
  "./projects/vidextract.html"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});


self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k.startsWith('eb-portfolio-') && k !== CACHE) ? caches.delete(k) : null))
    ).then(() => self.clients.claim())
  );
});

function isHTMLRequest(req) {
  return req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  if (isHTMLRequest(req)) {
    // Network-first for navigation
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match('./offline.html')))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
      return res;
    }))
  );
});
