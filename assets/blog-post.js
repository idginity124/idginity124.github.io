(function(){
  const $ = (sel) => document.querySelector(sel);
  const q = new URLSearchParams(location.search);
  const slug = (q.get('slug') || '').trim();

  const titleEl = $('#post-title');
  const metaEl = $('#post-meta');
  const contentEl = $('#post-content');
  const errEl = $('#post-error');

  const copyBtn = $('#copy-link');
  if (copyBtn) copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      copyBtn.classList.add('ok');
      setTimeout(()=>copyBtn.classList.remove('ok'), 900);
    } catch (e) {}
  });

  function showError(msg){
    errEl.style.display = 'block';
    errEl.innerHTML = `<strong>${msg}</strong>`;
  }

  async function fetchText(url){
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) throw new Error(res.status);
    return await res.text();
  }

  // tiny frontmatter parser (--- ... ---)
  function parseFrontmatter(md){
    const fm = { data: {}, body: md };
    const m = md.match(/^---\s*[\r\n]+([\s\S]*?)\r?\n---\s*[\r\n]+([\s\S]*)$/);
    if (!m) return fm;
    const raw = m[1];
    fm.body = m[2];
    raw.split(/\r?\n/).forEach(line => {
      const idx = line.indexOf(':');
      if (idx === -1) return;
      const k = line.slice(0, idx).trim();
      const v = line.slice(idx+1).trim();
      fm.data[k] = v;
    });
    return fm;
  }

  function parseTags(v){
    // tags: [A, B]
    if (!v) return [];
    const m = v.match(/^\[(.*)\]$/);
    const inner = m ? m[1] : v;
    return inner.split(',').map(s=>s.trim()).filter(Boolean);
  }

  function formatDateISO(iso){
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const lang = (window.__getLang && window.__getLang()) || 'tr';
    return d.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { year:'numeric', month:'short', day:'2-digit' });
  }

  async function run(){
    if (!slug){
      titleEl.textContent = 'Post';
      showError('Eksik parametre: slug');
      return;
    }

    // language-aware: try slug.tr.md / slug.en.md then slug.md
    const lang = (window.__getLang && window.__getLang()) || 'tr';
    const candidates = [
      `../content/blog/${slug}.${lang}.md`,
      `../content/blog/${slug}.md`,
    ];

    let md = null;
    for (const u of candidates){
      try { md = await fetchText(u); break; } catch (e) {}
    }
    if (md == null){
      titleEl.textContent = slug;
      showError('Yazı bulunamadı. (MD dosyası eksik olabilir)');
      return;
    }

    const fm = parseFrontmatter(md);
    const clean = fm.body;

    // Render markdown safely
    const html = window.marked ? window.marked.parse(clean) : clean;
    const safe = window.DOMPurify ? window.DOMPurify.sanitize(html) : html;

    const fmTitle = (fm.data.title || slug).replace(/^"|"$/g,'');
    const fmDate = (fm.data.date || '').replace(/^"|"$/g,'');
    const tags = parseTags((fm.data.tags || '').replace(/^"|"$/g,''));

    titleEl.textContent = fmTitle;
    metaEl.textContent = [formatDateISO(fmDate), tags.length ? tags.join(' • ') : ''].filter(Boolean).join(' • ');

    contentEl.innerHTML = safe;
  }

  // Wait for marked to load (defer)
  window.addEventListener('DOMContentLoaded', () => setTimeout(run, 0));
})();