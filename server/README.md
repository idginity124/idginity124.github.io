# VidExtract Web API (FastAPI + yt-dlp)

This folder makes the **VidExtract Web** page (`../vidextract.html`) actually work.

## 1) Install

```bash
cd server
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
```

### Optional: FFmpeg (for MP3 / merging)
- If you want **MP3** conversion or better video merge quality, install FFmpeg and make sure it is in your PATH.

## 2) Run

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

- Health check: `http://localhost:8000/api/health`

## 3) Open the portfolio

Open `../vidextract.html` in a browser.

- If you open the file directly (`file://`), the UI will try `http://localhost:8000/api` automatically.
- If you host the site, set a reverse proxy so `/api` points to this server.

## Security notes

- By default, the API only accepts URLs from: `youtube.com` and `youtu.be`.
- You can change this via env var:

```bash
# Allow additional domains (comma-separated)
VX_ALLOWED_DOMAINS="youtube.com,youtu.be,soundcloud.com" 

# Allow any URL (NOT recommended for public deployments)
VX_ALLOW_ANY_URL=1
```

**Only download content you have the rights to, and follow platform terms of service.**
