"""S3-compatible client for Cloudflare R2. Used by /remux, /gif and /mp3 to
upload their ffmpeg output and hand back a presigned GET URL — apps/api
then wraps that in its own /dl HMAC link (see apps/api/src/convert.ts) so
every download goes through one signed, range-aware proxy regardless of
source.

R2 objects are expected to be deleted automatically after 1h by a bucket
lifecycle rule configured in the Cloudflare dashboard — see README.md for
why that rule isn't (and can't cleanly be) created from here.
"""

import os

import boto3
from botocore.config import Config

PRESIGN_EXPIRES_IN_SECONDS = 60 * 60  # matches the R2 lifecycle delete-after-1h rule


def _client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{os.environ['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def upload_and_presign(local_path: str, key: str, content_type: str) -> str:
    """Uploads `local_path` to `key` in the configured bucket and returns a
    presigned GET URL valid for PRESIGN_EXPIRES_IN_SECONDS. The bucket name
    (`xeetloot-media`) must match apps/api/wrangler.toml's MEDIA_BUCKET
    binding, and the presigned URL's host (`<account>.r2.cloudflarestorage.
    com`) must match the allowlist in apps/api/src/dl.ts."""
    client = _client()
    bucket = os.environ["R2_BUCKET_NAME"]
    client.upload_file(local_path, bucket, key, ExtraArgs={"ContentType": content_type})
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=PRESIGN_EXPIRES_IN_SECONDS,
    )
