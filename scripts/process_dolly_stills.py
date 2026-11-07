import os
from PIL import Image

src_doorway = r"C:\Users\chahb\.gemini\antigravity\brain\2905c0b0-c761-4fe6-b9be-42cea4e936d4\elite_pro_gym_doorway_entry_v2_1794037797986.jpg"
src_corridor = r"C:\Users\chahb\.gemini\antigravity\brain\2905c0b0-c761-4fe6-b9be-42cea4e936d4\elite_pro_gym_heavy_bags_tracking_1794037814968.jpg"

dest_dir = os.path.abspath("assets/gen")
os.makedirs(dest_dir, exist_ok=True)

pairs = [
    (src_doorway, "dolly-doorway"),
    (src_corridor, "dolly-corridor")
]

for src_path, name in pairs:
    with Image.open(src_path) as img:
        img_rgb = img.convert("RGB")
        target_size = (1600, 900)
        resized = img_rgb.resize(target_size, Image.Resampling.LANCZOS)
        
        # Save WebP and PNG
        webp_path = os.path.join(dest_dir, f"{name}.webp")
        png_path = os.path.join(dest_dir, f"{name}.png")
        
        resized.save(webp_path, format="WEBP", quality=85)
        resized.save(png_path, format="PNG", optimize=True)
        print(f"Processed {name} -> {webp_path}")

print("Transition assets successfully converted and saved.")
