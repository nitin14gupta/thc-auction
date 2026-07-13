from io import BytesIO

from PIL import Image

MAX_UPLOAD_BYTES = 8 * 1024 * 1024


def convert_to_webp(raw_bytes: bytes, quality: int = 85) -> BytesIO:
    image = Image.open(BytesIO(raw_bytes))
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGB")

    out = BytesIO()
    image.save(out, format="WEBP", quality=quality)
    out.seek(0)
    return out
