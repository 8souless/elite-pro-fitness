import os
import sys
from pathlib import Path
from PIL import Image

def trim_emblem(src: Path, dst: Path, pad_ratio: float = 0.04) -> tuple[int, int]:
    dst.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(src).convert("RGBA")
    alpha = im.getchannel("A")
    mask = alpha.point(lambda a: 255 if a > 16 else 0)
    bbox = mask.getbbox()
    if not bbox:
        raise ValueError("Emblem image is completely transparent")
    
    cropped = im.crop(bbox)
    cw, ch = cropped.size
    
    pad_x = int(cw * pad_ratio)
    pad_y = int(ch * pad_ratio)
    new_w = cw + 2 * pad_x
    new_h = ch + 2 * pad_y
    
    padded = Image.new("RGBA", (new_w, new_h), (0, 0, 0, 0))
    padded.paste(cropped, (pad_x, pad_y))
    
    padded.save(dst, format="PNG", optimize=True)
    webp_dst = dst.with_suffix(".webp")
    padded.save(webp_dst, format="WEBP", quality=90)
    
    return new_w, new_h

def to_webp(src: Path, dst: Path, max_w: int, quality: int = 82) -> tuple[int, int]:
    dst.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(src)
    w, h = im.size
    if w > max_w:
        new_h = int(h * (max_w / w))
        im = im.resize((max_w, new_h), Image.Resampling.LANCZOS)
        w, h = max_w, new_h
    
    im.save(dst, format="WEBP", quality=quality)
    return w, h

def main():
    repo_root = Path(__file__).resolve().parent.parent
    src_logo = repo_root / "assets" / "logo-stacked.png"
    dst_emblem = repo_root / "assets" / "brand" / "epf-emblem.png"
    
    if src_logo.exists():
        w, h = trim_emblem(src_logo, dst_emblem)
        print(f"Trimmed emblem to {dst_emblem} ({w}x{h})")
    else:
        print(f"Warning: {src_logo} not found")
        
    gen_dir = repo_root / "assets" / "gen"
    if gen_dir.exists():
        for png_file in gen_dir.glob("*.png"):
            stem = png_file.stem
            max_w = 1400 if stem.startswith("prog-") else 2400
            webp_file = gen_dir / f"{stem}.webp"
            w, h = to_webp(png_file, webp_file, max_w)
            print(f"Converted {png_file.name} -> {webp_file.name} ({w}x{h})")

if __name__ == "__main__":
    main()
