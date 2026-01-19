"""VidExtract Web API

A small FastAPI wrapper around yt-dlp so the portfolio page (vidextract.html)
can actually download videos/audio.

IMPORTANT:
- Run locally by default.
- Only download content you have rights to.
- Consider restricting access if you deploy publicly.
"""

from __future__ import annotations

import os
import re
import shutil
import tempfile
import uuid
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

from fastapi import BackgroundTasks, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

try:
    from yt_dlp import YoutubeDL
except Exception as e:  # pragma: no cover
    raise RuntimeError(
        "yt-dlp is required. Install requirements: pip install -r requirements.txt"
    ) from e


APP_NAME = "vidextract-web-api"

# --- Security defaults (change via env vars) --------------------------------
# By default, allow YouTube only.
DEFAULT_ALLOWED_DOMAINS = "youtube.com,youtu.be"
ALLOWED_DOMAINS = [d.strip().lower() for d in os.getenv("VX_ALLOWED_DOMAINS", DEFAULT_ALLOWED_DOMAINS).split(",") if d.strip()]

# If set to 1, allow any HTTPS URL (not recommended for public deployments).
ALLOW_ANY_URL = os.getenv("VX_ALLOW_ANY_URL", "0").strip() == "1"

# If set to 1, allow plain http (not recommended). Default is https only.
ALLOW_HTTP = os.getenv("VX_ALLOW_HTTP", "0").strip() == "1"

# Where downloads are stored temporarily
BASE_TMP_DIR = Path(os.getenv("VX_TMP_DIR", Path(tempfile.gettempdir()) / "vidextract_web"))
BASE_TMP_DIR.mkdir(parents=True, exist_ok=True)


def _is_allowed_url(url: str) -> bool:
    try:
        p = urlparse(url)
    except Exception:
        return False

    if p.scheme not in ("https", "http"):
        return False
    if p.scheme == "http" and not ALLOW_HTTP:
        return False

    host = (p.hostname or "").lower()
    if not host:
        return False

    if ALLOW_ANY_URL:
        return True

    # allow exact domain or subdomain
    for d in ALLOWED_DOMAINS:
        if host == d or host.endswith("." + d):
            return True

    return False


def _safe_filename(name: str) -> str:
    # Keep it conservative for Windows/macOS/Linux.
    name = re.sub(r"\s+", " ", name).strip()
    name = re.sub(r"[^a-zA-Z0-9._ -]", "_", name)
    name = name.strip(" .")
    return name[:140] if name else "download"


def _pick_downloaded_file(folder: Path) -> Path:
    files = [p for p in folder.glob("**/*") if p.is_file()]
    if not files:
        raise FileNotFoundError("No output file produced.")
    # Prefer the biggest file (video) or the newest.
    files.sort(key=lambda p: (p.stat().st_size, p.stat().st_mtime), reverse=True)
    return files[0]


def _ydl_common_opts(tmp_dir: Path) -> dict:
    return {
        "outtmpl": str(tmp_dir / "%(title).120s__%(id)s.%(ext)s"),
        "restrictfilenames": True,
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "retries": 3,
        "socket_timeout": 20,
    }


def _download(url: str, mode: str, fmt: str) -> Path:
    tmp_dir = BASE_TMP_DIR / str(uuid.uuid4())
    tmp_dir.mkdir(parents=True, exist_ok=True)

    ydl_opts = _ydl_common_opts(tmp_dir)

    mode = (mode or "video").lower().strip()
    fmt = (fmt or "best").lower().strip()

    # Format strategy
    # - best: best available
    # - mp4: best mp4 (compatible)
    # - m4a: best m4a audio
    # - mp3: extract to mp3 (requires ffmpeg)

    if mode not in {"video", "audio"}:
        raise ValueError("Invalid mode")

    if fmt == "best":
        ydl_opts["format"] = "bestvideo*+bestaudio/best" if mode == "video" else "bestaudio/best"
    elif fmt == "mp4":
        # progressive mp4 when possible
        ydl_opts["format"] = "best[ext=mp4]/best"
    elif fmt == "m4a":
        ydl_opts["format"] = "bestaudio[ext=m4a]/bestaudio/best"
    elif fmt == "mp3":
        ydl_opts["format"] = "bestaudio/best"
        ydl_opts["postprocessors"] = [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "0",
            }
        ]
    else:
        raise ValueError("Invalid format")

    # Download
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    return _pick_downloaded_file(tmp_dir)


def _info(url: str) -> dict:
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "noplaylist": True,
    }

    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    # Keep response small and safe for UI
    return {
        "title": info.get("title"),
        "uploader": info.get("uploader") or info.get("channel"),
        "duration": info.get("duration"),
        "thumbnail": info.get("thumbnail"),
        "webpage_url": info.get("webpage_url") or url,
    }


app = FastAPI(title=APP_NAME)

# CORS: OK for local dev; lock down if deployed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "app": APP_NAME,
        "allowed_domains": ALLOWED_DOMAINS,
        "allow_any_url": ALLOW_ANY_URL,
    }


@app.get("/api/info")
def info(url: str = Query(..., min_length=8, max_length=2048)):
    if not _is_allowed_url(url):
        raise HTTPException(
            status_code=400,
            detail={
                "error": "URL_NOT_ALLOWED",
                "message": "URL is not allowed by this server configuration.",
                "allowed_domains": ALLOWED_DOMAINS,
                "allow_any_url": ALLOW_ANY_URL,
            },
        )

    try:
        return _info(url)
    except Exception as e:
        raise HTTPException(status_code=400, detail={"error": "INFO_FAILED", "message": str(e)})


@app.get("/api/download")
def download(
    background_tasks: BackgroundTasks,
    url: str = Query(..., min_length=8, max_length=2048),
    mode: str = Query("video", pattern="^(video|audio)$"),
    format: str = Query("best", alias="format", pattern="^(best|mp4|m4a|mp3)$"),
):
    if not _is_allowed_url(url):
        raise HTTPException(
            status_code=400,
            detail={
                "error": "URL_NOT_ALLOWED",
                "message": "URL is not allowed by this server configuration.",
                "allowed_domains": ALLOWED_DOMAINS,
                "allow_any_url": ALLOW_ANY_URL,
            },
        )

    try:
        file_path = _download(url, mode, format)
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": "BAD_REQUEST", "message": str(e)})
    except Exception as e:
        # Common causes: ffmpeg missing (for mp3), geo restriction, network, etc.
        raise HTTPException(status_code=500, detail={"error": "DOWNLOAD_FAILED", "message": str(e)})

    # Cleanup folder after response
    root = file_path.parent

    def _cleanup(p: Path):
        try:
            shutil.rmtree(p, ignore_errors=True)
        except Exception:
            pass

    background_tasks.add_task(_cleanup, root)

    download_name = _safe_filename(file_path.stem) + file_path.suffix

    return FileResponse(
        path=str(file_path),
        media_type="application/octet-stream",
        filename=download_name,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
