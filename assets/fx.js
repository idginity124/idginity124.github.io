/*
  EB Effects Engine (GitHub Pages friendly)
  - Dev FX: subtle code-rain
  - Anime FX: sakura petals + sparkles
  - Auto disables on prefers-reduced-motion / Save-Data
*/

'use strict';

(() => {
  const mReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReduced = !!(mReduced && mReduced.matches);
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const lowPower = prefersReduced || saveData;

  const state = {
    enabled: false,
    anime: false,
  };

  const palette = {
    primary: '#8b5cf6',
    accent: '#22d3ee',
    clearRGB: '0,0,0',
  };

  function readCSSPalette() {
    try {
      const cs = getComputedStyle(document.documentElement);
      const p = cs.getPropertyValue('--primary').trim();
      const a = cs.getPropertyValue('--accent').trim();
      const c = cs.getPropertyValue('--fx-clear').trim();
      if (p) palette.primary = p;
      if (a) palette.accent = a;
      if (c) palette.clearRGB = c;
    } catch { /* ignore */ }
  }


  let layer = null;
  let canvas = null;
  let ctx = null;
  let w = 0;
  let h = 0;
  let dpr = 1;

  let raf = 0;
  let running = false;
  let lastT = 0;

  // Dev FX (code rain)
  let columns = [];
  const glyphs = '01{}[]()<>/\\|+-=_*#@~$%&;:'.split('');
  let colW = 16;

  // Anime FX (petals)
  let petals = [];
  let sparkles = [];

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function $(sel, root = document) { return root.querySelector(sel); }

  function ensureLayer() {
    layer = $('.fx-layer');
    canvas = $('#fx-canvas');

    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'fx-layer';
      layer.setAttribute('aria-hidden', 'true');
      document.body.prepend(layer);
    }

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'fx-canvas';
      layer.appendChild(canvas);
    }

    ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return false;

    resize();
    window.addEventListener('resize', onResize, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else maybeStart();
    });

    // Auto disable if user turns on reduced motion after load
    if (mReduced) {
      mReduced.addEventListener?.('change', () => {
        if (mReduced.matches) {
          stop(true);
        } else {
          maybeStart();
        }
      });
    }

    return true;
  }

  let _rzT = 0;
  function onResize() {
    const now = performance.now();
    if (now - _rzT < 120) return;
    _rzT = now;
    resize();
  }

  function resize() {
    w = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
    h = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
    dpr = clamp(window.devicePixelRatio || 1, 1, 2);

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    readCSSPalette();

    // Re-seed
    seedCode();
    seedPetals();
  }

  function seedCode() {
    // Reduce density on mobile
    const isMobile = (w <= 820);
    colW = isMobile ? 18 : 16;

    const count = Math.floor(w / colW);
    columns = new Array(count).fill(0).map((_, i) => {
      const speed = (isMobile ? 0.55 : 0.85) + Math.random() * (isMobile ? 0.65 : 1.05);
      return {
        x: i * colW,
        y: Math.random() * h,
        speed,
        step: 12 + Math.floor(Math.random() * 12),
      };
    });
  }

  function seedPetals() {
    const isMobile = (w <= 820);
    const count = clamp(Math.floor((w * h) / (isMobile ? 52000 : 36000)), 16, isMobile ? 34 : 52);

    petals = new Array(count).fill(0).map(() => makePetal(true));
    sparkles = [];
  }

  function makePetal(randomY) {
    const size = 6 + Math.random() * 12;
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -20 - Math.random() * 80,
      vx: (-0.25 + Math.random() * 0.5),
      vy: 0.55 + Math.random() * 1.25,
      rot: Math.random() * Math.PI * 2,
      vr: (-0.02 + Math.random() * 0.04),
      size,
      sway: 0.6 + Math.random() * 1.4,
      phase: Math.random() * 6.2,
      hue: 330 + Math.random() * 22, // pink-ish
      alpha: 0.26 + Math.random() * 0.18,
    };
  }

  function makeSparkle(x, y) {
    return {
      x,
      y,
      r: 0.5 + Math.random() * 1.8,
      a: 0.35 + Math.random() * 0.35,
      life: 0,
      ttl: 1.2 + Math.random() * 0.8,
      vx: (-0.15 + Math.random() * 0.3),
      vy: (-0.35 - Math.random() * 0.7),
    };
  }

  function clearWithFade(alpha) {
    // Fade trail (theme-aware)
    const rgb = palette.clearRGB || '0,0,0';
    ctx.fillStyle = `rgba(${rgb},${alpha})`;
    ctx.fillRect(0, 0, w, h);
  }

  function drawCode(dt) {
    // Subtle, not full matrix
    ctx.save();
    ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

    // Slight fade; alpha depends on mode
    clearWithFade(state.anime ? 0.14 : 0.10);

    const c1 = palette.accent || '#22d3ee';
    const c2 = palette.primary || '#8b5cf6';

    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      col.y += col.speed * (dt * 60);
      if (col.y > h + 40) {
        col.y = -20;
        col.speed = 0.65 + Math.random() * 1.25;
      }

      // draw a few glyphs per column
      const steps = state.anime ? 2 : 3;
      for (let s = 0; s < steps; s++) {
        const y = col.y - s * col.step;
        if (y < -24 || y > h + 24) continue;

        const ch = glyphs[(Math.random() * glyphs.length) | 0];
        const t = (i / Math.max(1, columns.length));
        const mix = (s === 0) ? 0.75 : 0.45;

        ctx.fillStyle = s === 0
          ? `rgba(255,255,255,${state.anime ? 0.10 : 0.16})`
          : `rgba(255,255,255,${state.anime ? 0.05 : 0.08})`;

        // color glow layer
        ctx.shadowBlur = state.anime ? 10 : 14;
        ctx.shadowColor = (t < 0.5 ? c1 : c2);

        // character itself
        ctx.fillText(ch, col.x, y);
      }
    }

    ctx.restore();
  }

  function drawPetals(dt) {
    // Don't fully clear again; code renderer already faded background.
    // If anime-only and fx disabled, we still need a fade.
    if (!state.enabled) {
      clearWithFade(0.12);
    }

    // Petals
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];

      p.phase += dt * 1.4;
      p.x += (p.vx + Math.sin(p.phase) * 0.35 * p.sway) * (dt * 60);
      p.y += p.vy * (dt * 60);
      p.rot += p.vr * (dt * 60);

      if (p.y > h + 40 || p.x < -60 || p.x > w + 60) {
        petals[i] = makePetal(false);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      // Sakura-ish petal shape
      const s = p.size;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${p.alpha})`;
      ctx.shadowBlur = 18;
      ctx.shadowColor = `hsla(${p.hue}, 90%, 65%, 0.35)`;

      ctx.beginPath();
      ctx.moveTo(0, -s * 0.6);
      ctx.bezierCurveTo(s * 0.55, -s * 0.75, s * 0.75, -s * 0.1, 0, s);
      ctx.bezierCurveTo(-s * 0.75, -s * 0.1, -s * 0.55, -s * 0.75, 0, -s * 0.6);
      ctx.closePath();
      ctx.fill();

      // small highlight
      ctx.globalAlpha = p.alpha * 0.55;
      ctx.shadowBlur = 0;
      ctx.fillStyle = `hsla(${p.hue}, 85%, 86%, 0.55)`;
      ctx.beginPath();
      ctx.ellipse(-s * 0.14, -s * 0.1, s * 0.18, s * 0.32, -0.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Sparkles
    if (sparkles.length) {
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const sp = sparkles[i];
        sp.life += dt;
        sp.x += sp.vx * (dt * 60);
        sp.y += sp.vy * (dt * 60);
        const t = sp.life / sp.ttl;

        if (t >= 1) {
          sparkles.splice(i, 1);
          continue;
        }

        const a = sp.a * (1 - t);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.shadowBlur = 14;
        ctx.shadowColor = 'rgba(255,110,180,0.55)';

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r * (1 + t * 0.8), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Cap sparkles
    if (sparkles.length > 80) sparkles.length = 80;
  }

  function step(ts) {
    if (!running) return;

    // 30-45fps cap (skip frames)
    if (!lastT) lastT = ts;
    const delta = ts - lastT;
    if (delta < 22) {
      raf = requestAnimationFrame(step);
      return;
    }

    const dt = clamp(delta / 1000, 0, 0.05);
    lastT = ts;

    // If neither enabled, stop
    if (!state.enabled && !state.anime) {
      stop();
      return;
    }

    // Clear initial
    // We keep trails; but on first run after start, ensure transparent
    // (We can't easily detect first frame, so just clear when dt is huge)
    if (delta > 180) {
      ctx.clearRect(0, 0, w, h);
    }

    // Render order: code first (acts as fading background) then petals
    if (state.enabled) drawCode(dt);
    if (state.anime) drawPetals(dt);

    raf = requestAnimationFrame(step);
  }

  function start() {
    if (running) return;
    if (lowPower) return;
    if (!canvas || !ctx) {
      if (!ensureLayer()) return;
    }

    running = true;
    lastT = 0;
    raf = requestAnimationFrame(step);
  }

  function stop(clear = false) {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastT = 0;
    if (clear && ctx) ctx.clearRect(0, 0, w, h);
  }

  function maybeStart() {
    if (lowPower) return;
    if (document.hidden) return;
    if (state.enabled || state.anime) start();
  }

  function set(next) {
    state.enabled = !!(next && next.enabled);
    state.anime = !!(next && next.anime);

    readCSSPalette();

    // Update layer visibility
    if (!layer) {
      // If effects are enabled, create layer
      if (state.enabled || state.anime) ensureLayer();
    }

    if (layer) {
      layer.classList.toggle('is-on', (state.enabled || state.anime) && !lowPower);
    }

    if (lowPower) {
      stop(true);
      return;
    }

    if (state.enabled || state.anime) start();
    else stop(true);
  }

  // Click sparkles (only when anime is enabled; also avoid on coarse pointers)
  function initClickSparkles() {
    const finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (!finePointer) return;

    document.addEventListener('pointerdown', (e) => {
      if (!state.anime || lowPower) return;
      if (e.button !== 0) return;
      // Keep sparkles away from UI elements for readability (still okay)
      const x = e.clientX;
      const y = e.clientY;
      for (let i = 0; i < 6; i++) {
        sparkles.push(makeSparkle(x + (-6 + Math.random() * 12), y + (-6 + Math.random() * 12)));
      }
    }, { passive: true });
  }

  // Public API
  window.EBFX = {
    lowPower,
    set,
    start,
    stop,
  };

  // If some page wants FX immediately before app.js runs, read body classes.
  // (app.js will call set() anyway)
  document.addEventListener('DOMContentLoaded', () => {
    initClickSparkles();
    const b = document.body;
    const enabled = b.classList.contains('fx-on');
    const anime = b.classList.contains('anime-on');
    if (enabled || anime) set({ enabled, anime });
  });
})();
