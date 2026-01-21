# Ekrem Bulgan — Portfolio (GitHub Pages)

This is a **static** portfolio site that works on **GitHub Pages** (no backend required).

## Pages

- `index.html` — Home
- `projects.html` — Projects list (rendered from JSON)
- `projects/*.html` — One page per project (case study format + TOC)
- `blog.html` — Writing (rendered from JSON)
- `blog/*.html` — Individual posts
- `about.html` — About
- `now.html` — Now page
- `contact.html` — Contact
- `404.html` — Custom 404

## Main data files

### Projects

Edit: `assets/data/projects.json`

- The **Projects** page (`projects.html`) is generated from this file.
- Each item should point to a detail page in `projects/<id>.html`.

### Blog posts

Edit: `assets/data/posts.json`

- The **Blog** page (`blog.html`) is generated from this file.
- Each post points to a file under `blog/<slug>.html`.

## How to add a new project

1. Copy `projects/_template.html` → `projects/<your-project>.html`
2. Update the content + links inside the page.
3. Add a new entry to `assets/data/projects.json`.
4. Deploy (commit + push). GitHub Pages will serve it.

## How to add a new blog post

1. Copy an existing post in `blog/` (or create a new HTML file).
2. Add a new entry to `assets/data/posts.json`.
3. Deploy (commit + push).

## Assets

- Styles: `assets/styles.css`
- JS: `assets/app.js`
- CV PDF: `assets/cv/Ekrem_Bulgan_CV.pdf`

## SEO

- `sitemap.xml`
- `robots.txt`
- `manifest.webmanifest`

---

If you want, you can turn the blog into a Jekyll collection later. For now, it stays **simple + static**.
