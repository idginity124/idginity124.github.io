/* EB Effects Engine (Optimized & Lightweight) */
'use strict';
(() => {
  const mReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReduced = !!(mReduced && mReduced.matches);
  const state = { enabled: false, anime: false };
  const palette = { primary: '#8b5cf6', accent: '#22d3ee', clearRGB: '0,0,0' };

  let layer, canvas, ctx, w, h, dpr, raf, running = false, lastT = 0;
  let columns = [], petals = [];
  const glyphs = '01{}/\\|+-=_*#@~$%&;:'.split('');

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = 1; // Performans için 1'e sabitledim
    canvas.width = w; canvas.height = h;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    seedCode(); seedPetals();
  }

  function seedCode() {
    const count = Math.floor(w / 40); // Yoğunluğu azalttım
    columns = new Array(count).fill(0).map((_, i) => ({
      x: i * 40, y: Math.random() * h, speed: 0.8 + Math.random() * 1.5, step: 20
    }));
  }

  function seedPetals() {
    const count = window.innerWidth < 820 ? 12 : 30; 
    petals = new Array(count).fill(0).map(() => ({
      x: Math.random() * w, y: Math.random() * h, vx: -0.5 + Math.random(),
      vy: 0.5 + Math.random(), size: 4 + Math.random() * 6, phase: Math.random() * 6,
      hue: 200 + Math.random() * 60, alpha: 0.2 + Math.random() * 0.3
    }));
  }

  function draw(ts) {
    if (!running) return;
    const dt = Math.min((ts - lastT) / 1000, 0.1);
    lastT = ts;

    ctx.clearRect(0, 0, w, h); // Temiz temizleme (Shadow yok)

    if (state.enabled) {
      ctx.font = '12px monospace';
      ctx.fillStyle = `rgba(139, 92, 246, 0.2)`;
      columns.forEach(col => {
        col.y += col.speed * 60 * dt;
        if (col.y > h) col.y = -20;
        ctx.fillText(glyphs[Math.floor(Math.random()*glyphs.length)], col.x, col.y);
      });
    }

    if (state.anime) {
      petals.forEach(p => {
        p.phase += dt;
        p.x += (p.vx + Math.sin(p.phase) * 0.5) * 50 * dt;
        p.y += p.vy * 50 * dt;
        if (p.y > h) p.y = -20;
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
    }
    raf = requestAnimationFrame(draw);
  }

  window.EBFX = {
    set: (n) => {
      state.enabled = !!n.enabled; state.anime = !!n.anime;
      if (!running && (state.enabled || state.anime)) {
        if (!canvas) {
          layer = document.querySelector('.fx-layer');
          canvas = document.querySelector('#fx-canvas');
          ctx = canvas.getContext('2d');
          resize();
        }
        running = true; lastT = performance.now(); draw(lastT);
      } else if (!state.enabled && !state.anime) {
        running = false; if(ctx) ctx.clearRect(0, 0, w, h);
      }
    },
    stop: () => { running = false; },
    start: () => { if((state.enabled || state.anime) && !running) { running = true; lastT = performance.now(); draw(lastT); } }
  };
})();