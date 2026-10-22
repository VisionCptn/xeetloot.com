"""yt-dlp wrapper — resolve tier 2, used only after apps/api's syndication
tier (tier 1) misses. See apps/api/src/syndication.ts for tier 1.
"""

import yt_dlp
from yt_dlp.utils import DownloadError

# Substring match against yt-dlp's own DownloadError message — there is no
# structured error code from yt-dlp itself, just prose, so this is
# necessarily a best-effort classification. Order matters: checked
# age-restricted before private, since some messages mention both.
_AGE_RESTRICTED_PATTERNS = ("age-restricted", "sign in to confirm your age", "nsfw")
_PROTECTED_PATTERNS = ("protected", "private account", "not authorized to view")
_NOT_FOUND_PATTERNS = ("no longer exists", "has been deleted", "suspended", "unable to find", "not available")


def classify_error(message: str) -> tuple[str, int]:
    lower = message.lower()
    if any(p in lower for p in _AGE_RESTRICTED_PATTERNS):
        return "age_restricted", 403
    if any(p in lower for p in _PROTECTED_PATTERNS):
        return "protected_account", 403
    if any(p in lower for p in _NOT_FOUND_PATTERNS):
        return "not_found", 404
    return "unavailable", 502


def extract_info(url: str) -> dict:
    ydl_opts = {
        "skip_download": True,
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        return ydl.extract_info(url, download=False)


def normalize_formats(info: dict) -> list[dict]:
    """Keeps only direct, progressive mp4 files — mirrors tier 1's own
    filter (apps/api/src/mapMedia.ts): an HLS manifest isn't a single
    downloadable file, and the non-negotiable rule is that resolve only
    ever hands back direct media URLs."""
    formats = info.get("formats") or []
    result = []
    for f in formats:
        if f.get("protocol") in ("m3u8", "m3u8_native"):
            continue
        if f.get("ext") != "mp4":
            continue
        if not f.get("url"):
            continue
        result.append(
            {
                "url": f["url"],
                "ext": f["ext"],
                "width": f.get("width"),
                "height": f.get("height"),
                "vbr": f.get("vbr") or f.get("tbr"),
                "abr": f.get("abr"),
            }
        )
    return result


class ExtractorInfoError(Exception):
    def __init__(self, code: str, status: int, message: str):
        self.code = code
        self.status = status
        self.message = message
        super().__init__(message)


def get_info(url: str) -> dict:
    """Raises ExtractorInfoError with a typed code on any failure."""
    try:
        data = extract_info(url)
    except DownloadError as err:
        message = str(err)
        # The tweet is accessible but just has no video — a legitimate
        # "nothing to resolve" outcome, not a failure. This should rarely
        # be reached in practice: tier 1 (syndication) already saw this
        # same accessible tweet and would normally have returned its
        # photos/text directly, never falling through to tier 2 at all.
        if "no video could be found" in message.lower():
            return {"title": None, "formats": []}
        code, status = classify_error(message)
        raise ExtractorInfoError(code, status, message) from err
    except Exception as err:  # yt-dlp can raise plain exceptions too
        raise ExtractorInfoError("unavailable", 502, str(err)) from err

    return {"title": data.get("title"), "formats": normalize_formats(data)}
