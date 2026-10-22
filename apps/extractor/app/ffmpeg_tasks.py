"""ffmpeg invocations for /remux, /gif and /mp3. ffmpeg reads directly from
the source URL (its own HTTP client) — no separate download step needed.
"""

import subprocess
import tempfile
from pathlib import Path

GIF_MAX_DURATION_SECONDS = 15
GIF_WIDTH = 480
FFMPEG_TIMEOUT_SECONDS = 120


class FfmpegError(Exception):
    pass


def _run(args: list[str]) -> None:
    result = subprocess.run(args, capture_output=True, text=True, timeout=FFMPEG_TIMEOUT_SECONDS)
    if result.returncode != 0:
        raise FfmpegError(result.stderr[-2000:])


def remux_to_mp4(source_url: str, tmp_dir: str) -> str:
    """Stream-copy (no re-encode) — for sources ffmpeg can already decode
    container-wise but that aren't a single progressive mp4 file (e.g. an
    HLS manifest)."""
    out_path = str(Path(tmp_dir) / "remux.mp4")
    _run(["ffmpeg", "-y", "-i", source_url, "-c", "copy", "-movflags", "+faststart", out_path])
    return out_path


def to_gif(source_url: str, tmp_dir: str) -> str:
    out_path = str(Path(tmp_dir) / "output.gif")
    filter_chain = (
        f"fps=15,scale={GIF_WIDTH}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"
    )
    _run(
        [
            "ffmpeg",
            "-y",
            "-t",
            str(GIF_MAX_DURATION_SECONDS),
            "-i",
            source_url,
            "-vf",
            filter_chain,
            out_path,
        ]
    )
    return out_path


def to_mp3(source_url: str, tmp_dir: str) -> str:
    out_path = str(Path(tmp_dir) / "output.mp3")
    _run(["ffmpeg", "-y", "-i", source_url, "-vn", "-acodec", "libmp3lame", "-b:a", "192k", out_path])
    return out_path


def temp_dir():
    return tempfile.TemporaryDirectory(prefix="xeetloot-")
