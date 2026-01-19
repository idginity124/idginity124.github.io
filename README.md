# Portfolio + VidExtract Web Demo

This project contains a **static portfolio website** and an optional **FastAPI backend** used by the VidExtract web demo.

## Structure

- `index.html` — home
- `projects.html` — projects
- `vidextract.html` — VidExtract web demo (needs API)
- `contact.html` — contact
- `assets/` — CSS, JS, images
- `server/` — FastAPI + yt-dlp API

## Run the site (static)

You can open `index.html` directly, but for best results use a local web server:

```bash
# from project root
python -m http.server 5173
```

Then open: http://localhost:5173

## Run VidExtract API

See `server/README.md`.

> ⚠️ Only download content you have the rights to, and follow platform ToS.
