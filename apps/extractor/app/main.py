import os
import subprocess

import yt_dlp
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from . import r2
from .ffmpeg_tasks import FfmpegError, temp_dir, to_gif, to_mp3, remux_to_mp4
from .ytdlp import ExtractorInfoError, get_info

app = FastAPI()

EXTRACTOR_SECRET = os.environ.get("EXTRACTOR_SECRET", "")
SELF_TEST_URL = "https://x.com/jack/status/20"


def require_secret(x_secret: str | None) -> None:
    # Fail closed: an unset secret must never be treated as "no auth
    # required" — must match apps/api's EXTRACTOR_SECRET.
    if not EXTRACTOR_SECRET or x_secret != EXTRACTOR_SECRET:
        raise HTTPException(status_code=401, detail={"error": "unauthorized", "message": "missing or wrong x-secret"})


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    # Flattens FastAPI's default {"detail": {...}} into {"error", "message"}
    # directly at the response root — apps/api/src/container.ts parses this
    # shape to surface typed resolve errors (protected/age-restricted/etc.)
    # instead of a generic failure.
    if isinstance(exc.detail, dict):
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"error": "unavailable", "message": str(exc.detail)})


class InfoRequest(BaseModel):
    url: str


class ConvertRequest(BaseModel):
    id: str
    source: str


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "yt_dlp_version": yt_dlp.version.__version__}


@app.post("/info")
def info(req: InfoRequest, x_secret: str | None = Header(default=None)) -> dict:
    require_secret(x_secret)
    try:
        return get_info(req.url)
    except ExtractorInfoError as err:
        raise HTTPException(status_code=err.status, detail={"error": err.code, "message": err.message})


@app.post("/remux")
def remux(req: ConvertRequest, x_secret: str | None = Header(default=None)) -> dict:
    """Stream-copies an HLS-only (or otherwise non-progressive) source into
    a single downloadable mp4. Not yet called from apps/api — tier 1/2
    currently only ever surface progressive mp4 variants — kept here as a
    ready-to-wire capability for when an HLS-only tweet needs to be made
    downloadable."""
    require_secret(x_secret)
    with temp_dir() as tmp:
        try:
            out_path = remux_to_mp4(req.source, tmp)
        except FfmpegError as err:
            raise HTTPException(status_code=502, detail={"error": "unavailable", "message": str(err)})
        url = r2.upload_and_presign(out_path, f"{req.id}/remux.mp4", "video/mp4")
    return {"url": url, "filename": f"xeetloot-{req.id}.mp4"}


@app.post("/gif")
def gif(req: ConvertRequest, x_secret: str | None = Header(default=None)) -> dict:
    require_secret(x_secret)
    with temp_dir() as tmp:
        try:
            out_path = to_gif(req.source, tmp)
        except FfmpegError as err:
            raise HTTPException(status_code=502, detail={"error": "unavailable", "message": str(err)})
        url = r2.upload_and_presign(out_path, f"{req.id}/gif.gif", "image/gif")
    return {"url": url, "filename": f"xeetloot-{req.id}.gif"}


@app.post("/mp3")
def mp3(req: ConvertRequest, x_secret: str | None = Header(default=None)) -> dict:
    require_secret(x_secret)
    with temp_dir() as tmp:
        try:
            out_path = to_mp3(req.source, tmp)
        except FfmpegError as err:
            raise HTTPException(status_code=502, detail={"error": "unavailable", "message": str(err)})
        url = r2.upload_and_presign(out_path, f"{req.id}/mp3.mp3", "audio/mpeg")
    return {"url": url, "filename": f"xeetloot-{req.id}.mp3"}


@app.post("/update")
def update(x_secret: str | None = Header(default=None)) -> dict:
    """Best-effort, same-instance-lifetime-only fix: pip-upgrades yt-dlp,
    self-tests the upgrade in a fresh subprocess (this process's already-
    imported yt_dlp module wouldn't see the upgrade otherwise), then exits
    so the process manager restarts into the new version.

    IMPORTANT: Cloudflare Containers reset their disk on every stop (see
    https://developers.cloudflare.com/containers/) — this upgrade does NOT
    survive the container's next cold start. It only buys time until then.
    The durable fix is bumping the pinned version in requirements.txt and
    redeploying apps/api (which rebuilds this image). See README.md.
    """
    require_secret(x_secret)

    upgrade = subprocess.run(
        ["pip", "install", "--upgrade", "--no-cache-dir", "yt-dlp"],
        capture_output=True,
        text=True,
        timeout=120,
    )
    if upgrade.returncode != 0:
        raise HTTPException(status_code=502, detail={"error": "unavailable", "message": upgrade.stderr[-2000:]})

    # Brief: "/update bumps only after /health self-test passes" — verified
    # here via a real extraction, in a fresh process so it actually picks
    # up the newly installed version.
    probe = subprocess.run(
        [
            "python",
            "-c",
            f"import yt_dlp; yt_dlp.YoutubeDL({{'skip_download': True, 'quiet': True}}).extract_info('{SELF_TEST_URL}', download=False)",
        ],
        capture_output=True,
        text=True,
        timeout=60,
    )
    if probe.returncode != 0:
        raise HTTPException(
            status_code=502,
            detail={"error": "unavailable", "message": "self_test_failed: " + probe.stderr[-2000:]},
        )

    # Hard exit (not a graceful shutdown) — intentional, so the restart
    # actually re-imports yt_dlp fresh. The container's own restart policy
    # (docker-compose's `restart: unless-stopped` locally; Cloudflare's
    # Container lifecycle in production) brings the process back up.
    os._exit(0)
