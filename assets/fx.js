/*
  EB Effects Engine (Ultra-Lightweight)
  - Sadece hafif kod yağmuru içerir.
  - Anime/Sakura efektleri performans için kaldırıldı.
*/
'use strict';

(() => {
  const lowPower = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = { enabled: false };
  const palette = { primary: '#8b5cf6', accent: '#22d3ee', clearRGB: '0,0,0' };

  let layer = null, canvas = null, ctx = null;
  let w = 0, h = 0, raf = 0, running = false, lastT = 0;
  let columns = [];
  const glyphs = '01{}[]()<>/\\|+-=_*#@~$%&;:'.split('');

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    if(canvas) {
      canvas.width = w;
      canvas.height = h;
    }
    const count = Math.floor(w / 20);
    columns = new Array(count).fill(0).map((_, i) => ({
      x: i * 20,
      y: Math.random() * h,
      speed: 0.8 + Math.random() * 1.5
    }));
  }

  function draw(ts) {
    if (!running) return;
    const dt = Math.min((ts - lastT) / 1000, 0.05);
    lastT = ts;

    // Arka planı hafifçe temizle (iz efekti için)
    ctx.fillStyle = `rgba(0,0,0,0.15)`;
    ctx.fillRect(0, 0, w, h);

    if (state.enabled) {
      ctx.font = '14px monospace';
      ctx.fillStyle = `rgba(139, 92, 246, 0.3)`;
      
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        col.y += col.speed * (dt * 60);
        if (col.y > h) col.y = -20;
        ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], col.x, col.y);
      }
    }

    raf = requestAnimationFrame(draw);
  }

  window.EBFX = {
    set: (n) => {
      state.enabled = !!n.enabled;
      if (!running && state.enabled && !lowPower) {
        if (!canvas) {
          layer = document.querySelector('.fx-layer');
          canvas = document.querySelector('#fx-canvas');
          ctx = canvas.getContext('2d', { alpha: false }); // Performans artışı
          resize();
          window.addEventListener('resize', resize);
        }
        running = true;
        lastT = performance.now();
        raf = requestAnimationFrame(draw);
      } else if (!state.enabled) {
        running = false;
        cancelAnimationFrame(raf);
        if(ctx) ctx.clearRect(0, 0, w, h);
      }
    },
    stop: () => { running = false; },
    start: () => { if(state.enabled && !running && !lowPower) { running = true; lastT = performance.now(); draw(lastT); } }
  };
})();