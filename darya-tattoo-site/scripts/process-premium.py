from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import numpy as np
import cv2

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "darya" / "premium"
OUT.mkdir(parents=True, exist_ok=True)
CUTOUTS = {2, 3, 4, 5, 6, 10, 12, 13, 19, 23, 26, 27, 39, 40}


def cover(im: Image.Image, size=(1080, 1350)) -> Image.Image:
    sw, sh = im.size
    tw, th = size
    scale = max(tw / sw, th / sh)
    nw, nh = round(sw * scale), round(sh * scale)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = max(0, (nw - tw) // 2)
    top = max(0, (nh - th) // 2)
    return im.crop((left, top, left + tw, top + th))


def grade(src: Path, dst: Path, accent: tuple[int, int, int]) -> None:
    im = cover(Image.open(src).convert("RGB"))
    number = int(dst.stem.split("-")[-1])
    if number in CUTOUTS:
        # Segment at low resolution, then feather the matte at full size. This
        # keeps the photographed tattoo untouched and only replaces the room.
        small = np.array(im.resize((360, 450), Image.Resampling.LANCZOS))
        mh, mw = small.shape[:2]
        matte = np.full((mh, mw), cv2.GC_PR_BGD, np.uint8)
        matte[:10, :] = matte[-10:, :] = matte[:, :10] = matte[:, -10:] = cv2.GC_BGD
        cv2.ellipse(matte, (mw // 2, mh // 2), (int(mw * .39), int(mh * .47)), 0, 0, 360, cv2.GC_PR_FGD, -1)
        cv2.grabCut(
            cv2.cvtColor(small, cv2.COLOR_RGB2BGR), matte, None,
            np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64),
            5, cv2.GC_INIT_WITH_MASK,
        )
        alpha = np.where((matte == cv2.GC_FGD) | (matte == cv2.GC_PR_FGD), 255, 0).astype("uint8")
        alpha = Image.fromarray(alpha).resize(im.size, Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(11))
        h0, w0 = im.size[1], im.size[0]
        yy0, xx0 = np.mgrid[0:h0, 0:w0]
        nx0, ny0 = (xx0 - w0 * .5) / (w0 * .5), (yy0 - h0 * .5) / (h0 * .5)
        glow = np.exp(-(((nx0 + (.68 if number % 2 else -.68)) / .42) ** 2 + ((ny0 + .06) / .62) ** 2) * 2.0)
        bg = np.zeros((h0, w0, 3), dtype=np.float32)
        bg[:] = [18, 4, 9]
        bg += glow[..., None] * np.array([92, 7, 20], dtype=np.float32)
        rng = np.random.default_rng(number)
        bg += rng.normal(0, 3.5, (h0, w0, 1))
        background = Image.fromarray(np.clip(bg, 0, 255).astype("uint8"))
        im = Image.composite(im, background, alpha)
    im = ImageOps.autocontrast(im, cutoff=(0.6, 0.4))
    im = ImageEnhance.Color(im).enhance(0.82)
    im = ImageEnhance.Contrast(im).enhance(1.12)
    im = ImageEnhance.Brightness(im).enhance(0.9)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=118, threshold=4))

    a = np.asarray(im).astype(np.float32) / 255.0
    h, w, _ = a.shape
    yy, xx = np.mgrid[0:h, 0:w]
    nx = (xx - w * 0.5) / (w * 0.5)
    ny = (yy - h * 0.48) / (h * 0.52)
    radial = np.sqrt(nx * nx + ny * ny)

    lum = a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722

    # Remove the accidental green/cyan cast of the source interiors. Those hues
    # become deep wine in the shadows, while skin and ink remain neutral.
    hsv = cv2.cvtColor((a * 255).astype(np.uint8), cv2.COLOR_RGB2HSV)
    hue, sat = hsv[..., 0], hsv[..., 1].astype(np.float32) / 255.0
    green = ((hue >= 34) & (hue <= 108)).astype(np.float32) * np.clip((sat - .12) / .55, 0, 1)
    green *= np.clip(.45 + radial * .55, 0, 1)
    green_dominance = np.clip(
        (a[..., 1] - np.maximum(a[..., 0] * .90, a[..., 2] * .82)) * 6.0 + .04,
        0,
        1,
    )
    green = np.maximum(green, green_dominance) * np.clip(.48 + radial * .52, 0, 1)
    wine_green = np.stack((lum * .30 + .035, lum * .045 + .012, lum * .105 + .024), axis=-1)
    a = a * (1 - green[..., None] * .9) + wine_green * green[..., None] * .9
    shadow = np.clip((0.58 - lum) / 0.58, 0, 1) ** 1.35
    wine = np.array([0.19, 0.018, 0.045], dtype=np.float32)
    a = a * (1 - shadow[..., None] * 0.25) + wine * shadow[..., None] * 0.25

    vignette = np.clip((radial - 0.35) / 0.95, 0, 1) ** 1.5
    a *= (1 - vignette[..., None] * 0.46)

    # A soft studio lamp behind the subject; alternate the side so the grid feels alive.
    side = -0.76 if number % 2 else 0.76
    lamp = np.exp(-(((nx - side) / 0.42) ** 2 + ((ny + 0.05) / 0.72) ** 2) * 2.2)
    lamp_color = np.array(accent, dtype=np.float32) / 255.0
    a = a + lamp[..., None] * lamp_color * 0.15

    # Keep the centre readable: the artwork remains the brightest and sharpest area.
    spot = np.exp(-((nx / 0.58) ** 2 + ((ny + 0.02) / 0.76) ** 2) * 1.5)
    a *= (0.92 + spot[..., None] * 0.12)

    rng = np.random.default_rng(abs(hash(src.name)) % (2**32))
    grain = rng.normal(0, 0.007, (h, w, 1)).astype(np.float32)
    a = np.clip(a + grain, 0, 1)
    Image.fromarray((a * 255).astype(np.uint8)).save(dst, "WEBP", quality=91, method=6)


accents = [(116, 12, 34), (72, 22, 47), (127, 24, 34), (59, 22, 51)]
social = ROOT / "assets" / "darya" / "social"
for index, src in enumerate(sorted(social.glob("darya-social-*.webp")), 1):
    grade(src, OUT / f"premium-{index:02}.webp", accents[(index - 1) % len(accents)])

for index, name in enumerate(("darya-02.jpg", "darya-03.jpg", "darya-04.jpg", "darya-09.jpg", "darya-15.jpg"), 37):
    grade(ROOT / "assets" / "darya" / name, OUT / f"premium-{index:02}.webp", accents[(index - 1) % len(accents)])
