import base64
import os
from io import BytesIO
from PIL import Image

SRC = r"C:\Users\admin\Desktop\666-e743b96e-edf0-42f4-abef-f0c33117b367.jpg"
PUBLIC = r"C:\Users\admin\Desktop\kaifa\converty-site\public"


def center_crop_square(img: Image.Image) -> Image.Image:
    w, h = img.size
    size = min(w, h)
    left = (w - size) // 2
    top = (h - size) // 2
    return img.crop((left, top, left + size, top + size))


def to_png_data_uri(img: Image.Image) -> str:
    buf = BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/png;base64,{b64}"


def make_svg(data_uri: str, width: int, height: int) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}">'
        f'<image href="{data_uri}" width="{width}" height="{height}" />'
        f'</svg>'
    )


def main():
    img = Image.open(SRC).convert("RGBA")
    square = center_crop_square(img)

    os.makedirs(os.path.join(PUBLIC, "icons"), exist_ok=True)

    # 256 logo
    logo = square.resize((256, 256), Image.Resampling.LANCZOS)
    logo_path = os.path.join(PUBLIC, "logo.png")
    logo.save(logo_path, format="PNG")
    print(f"saved {logo_path}")

    # favicon.svg / logo.svg (base64 embedded PNG for sharp rendering at any size)
    data_uri = to_png_data_uri(logo)
    for name, size in [("favicon.svg", 32), ("logo.svg", 256)]:
        svg_path = os.path.join(PUBLIC, name)
        with open(svg_path, "w", encoding="utf-8") as f:
            f.write(make_svg(data_uri, size, size))
        print(f"saved {svg_path}")

    # favicon.ico multi-size
    ico_sizes = [16, 32, 48, 64]
    ico_imgs = [square.resize((s, s), Image.Resampling.LANCZOS) for s in ico_sizes]
    ico_path = os.path.join(PUBLIC, "favicon.ico")
    ico_imgs[0].save(
        ico_path,
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
        append_images=ico_imgs[1:],
    )
    print(f"saved {ico_path}")

    # PWA icons
    icon_192 = square.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save(os.path.join(PUBLIC, "icons", "icon-192x192.png"), format="PNG")
    print("saved icons/icon-192x192.png")

    icon_512 = square.resize((512, 512), Image.Resampling.LANCZOS)
    icon_512.save(os.path.join(PUBLIC, "icons", "icon-512x512.png"), format="PNG")
    print("saved icons/icon-512x512.png")

    # Apple touch icon
    icon_180 = square.resize((180, 180), Image.Resampling.LANCZOS)
    icon_180.save(os.path.join(PUBLIC, "icons", "apple-touch-icon.png"), format="PNG")
    print("saved icons/apple-touch-icon.png")

    # Maskable icon: keep content within center 80% safe zone, use 70% content to be safe
    mask_size = 192
    padding = int(mask_size * 0.15)
    content_size = mask_size - 2 * padding
    maskable = Image.new("RGBA", (mask_size, mask_size), (0, 0, 0, 0))
    content = square.resize((content_size, content_size), Image.Resampling.LANCZOS)
    maskable.paste(content, (padding, padding), content)
    maskable.save(os.path.join(PUBLIC, "icons", "icon-192-maskable.png"), format="PNG")
    print("saved icons/icon-192-maskable.png")


if __name__ == "__main__":
    main()
