from PIL import Image

def test_emblem_is_tight_and_transparent():
    im = Image.open("assets/brand/epf-emblem.webp").convert("RGBA")
    bbox = im.getchannel("A").point(lambda a: 255 if a > 16 else 0).getbbox()
    w, h = im.size
    assert (bbox[2] - bbox[0]) / w >= 0.90 and (bbox[3] - bbox[1]) / h >= 0.90
    assert im.getpixel((0, 0))[3] == 0
    assert max(w, h) >= 900

def test_emblem_webp_exists():
    assert Image.open("assets/brand/epf-emblem.webp").size[0] >= 600


GEN = ["facade-dusk", "interior-ring", "zone-juniors", "zone-ladies", "zone-adults", "zone-squad",
       "zone-community", "prog-kids", "prog-juniors", "prog-adults", "prog-ladies",
       "texture-timetable", "texture-pricing"]

def test_generated_stills_present_and_sized():
    import os
    for n in GEN:
        p = f"assets/gen/{n}.webp"
        w, h = Image.open(p).size
        assert w >= (1400 if n.startswith("prog-") else 2000), n
        assert 1.25 <= w / h <= 1.9, n
        assert os.path.getsize(p) < 650_000, n
