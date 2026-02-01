


## GitHub Pages (En üst seviye kurulum)

1) Repo'ya bu dosyaları koyun (root).  
2) **Settings → Pages** bölümünden **Build and deployment = GitHub Actions** seçin.  
3) `main` branch'e push yaptığınızda otomatik deploy olur (`.github/workflows/pages.yml`).

### SEO notu
- `robots.txt` içinde sitemap yolu `/sitemap.xml` olarak ayarlı. İsterseniz absolute URL ile değiştirebilirsiniz.
- Paylaşım kartları için `og:image` / `twitter:image` otomatik olarak absolute URL'ye çevrilir (runtime).
