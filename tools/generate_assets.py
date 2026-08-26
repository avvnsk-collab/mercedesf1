from pathlib import Path
from math import sin, cos, radians
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'balance-2'
OUT.mkdir(parents=True, exist_ok=True)
W = H = 480
CX = CY = 240
CYAN = (0, 184, 200)
WHITE = (245, 245, 245)
SILVER = (178, 184, 188)

font_paths = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
]
font_path = next((p for p in font_paths if Path(p).exists()), font_paths[-1])

def font(size):
    return ImageFont.truetype(font_path, size)

def centered(draw, xy, text, fnt, fill, anchor='mm'):
    draw.text(xy, text, font=fnt, fill=fill, anchor=anchor)

# Dark carbon/Mercedes-star background
im = Image.new('RGB', (W, H), (1, 4, 5))
d = ImageDraw.Draw(im)
for y in range(22, 452, 20):
    for x in range(24, 458, 20):
        dist = ((x-CX)**2 + (y-CY)**2) ** 0.5
        if dist > 226:
            continue
        alpha = max(10, int(48 - dist / 8))
        c = (alpha, alpha+2, alpha+3)
        r = 4
        # tiny three-spoke star pattern
        d.line((x, y-r, x, y+r), fill=c, width=1)
        d.line((x, y, x-r, y+3), fill=c, width=1)
        d.line((x, y, x+r, y+3), fill=c, width=1)

# Teal glow in lower half behind car
glow = Image.new('RGBA', (W, H), (0,0,0,0))
gd = ImageDraw.Draw(glow)
for r in range(150, 10, -5):
    a = max(0, int(45 * (1-r/150)))
    gd.ellipse((CX-r, 308-r//2, CX+r, 308+r//2), fill=(0, 180, 190, a))
glow = glow.filter(ImageFilter.GaussianBlur(22))
im = Image.alpha_composite(im.convert('RGBA'), glow)
d = ImageDraw.Draw(im)

# Outer rim and correct 60-minute / 12-hour scale
d.ellipse((4,4,476,476), outline=(155,160,164,255), width=1)
d.ellipse((9,9,471,471), outline=(40,45,48,255), width=2)
for i in range(60):
    a = radians(i * 6 - 90)
    is_hour = i % 5 == 0
    r1 = 214 if is_hour else 220
    r2 = 230
    x1, y1 = CX + r1*cos(a), CY + r1*sin(a)
    x2, y2 = CX + r2*cos(a), CY + r2*sin(a)
    d.line((x1,y1,x2,y2), fill=WHITE+(255,), width=4 if is_hour else 1)

# Static thin base ring; dynamic cyan step progress overlays this in JS
d.ellipse((15,15,465,465), outline=(15, 75, 80, 255), width=3)

# Mercedes emblem (simple geometric rendering)
d.ellipse((211, 34, 269, 92), outline=(210,215,218,255), width=2)
d.ellipse((216, 39, 264, 87), outline=(110,115,118,255), width=1)
for ang in (-90, 30, 150):
    a = radians(ang)
    x, y = CX + 22*cos(a), 63 + 22*sin(a)
    d.line((240,63,x,y), fill=(220,225,228,255), width=3)

# Brand block
centered(d, (240, 105), 'AMG', font(24), WHITE+(255,))
centered(d, (240, 128), 'PETRONAS', font(22), CYAN+(255,))
centered(d, (240, 146), 'FORMULA ONE TEAM', font(12), (205,205,205,255))

# Static icons/labels for data blocks
# heart icon
hx, hy = 100, 111
d.ellipse((hx-8,hy-7,hx+1,hy+2), fill=CYAN+(255,)); d.ellipse((hx,hy-7,hx+9,hy+2), fill=CYAN+(255,))
d.polygon([(hx-8,hy-1),(hx+9,hy-1),(hx,hy+11)], fill=CYAN+(255,))
centered(d, (100, 150), 'BPM', font(12), (190,190,190,255))
# battery/lightning icon
bx, by = 380, 111
d.polygon([(bx+1,by-13),(bx-9,by+3),(bx-1,by+3),(bx-7,by+15),(bx+10,by-5),(bx+2,by-5)], fill=CYAN+(255,))
centered(d, (380, 150), '%', font(12), (215,215,215,255))
# weather icon
centered(d, (220, 132), '☁', font(29), WHITE+(255,))
# separator over car
d.line((150,326,330,326), fill=(150,155,158,255), width=1)

# Stylized front-view F1 car silhouette
# halo/cockpit
d.ellipse((229, 330, 251, 351), fill=(12,14,15,255), outline=(130,135,138,255), width=1)
d.rectangle((235,342,245,386), fill=(20,22,23,255))
# rear wing
d.rectangle((190,340,290,345), fill=(16,18,19,255))
d.rectangle((184,345,196,352), fill=(10,11,12,255)); d.rectangle((284,345,296,352), fill=(10,11,12,255))
# body/nose
d.polygon([(220,352),(260,352),(270,389),(252,404),(228,404),(210,389)], fill=(18,20,21,255), outline=(90,95,98,255))
# tires
for box in [(153,360,185,410),(295,360,327,410)]: d.rounded_rectangle(box, radius=7, fill=(6,7,8,255), outline=(50,52,54,255))
# front wing
d.polygon([(132,397),(205,386),(220,398),(260,398),(275,386),(348,397),(338,411),(142,411)], fill=(10,12,13,255), outline=(65,70,72,255))
# teal underglow line
d.line((150,414,330,414), fill=CYAN+(220,), width=2)

# shoe / steps motif, lifted slightly versus earlier draft
sx, sy = 179, 426
d.polygon([(sx-10,sy+6),(sx+5,sy-9),(sx+14,sy+1),(sx+28,sy+4),(sx+31,sy+11),(sx-4,sy+11)], fill=CYAN+(255,))
centered(d, (240, 462), 'ШАГИ', font(14), (165,165,165,255))

# Save background without dynamic numbers/time/date
bg = im.convert('RGB')
bg.save(OUT / 'bg.jpg', quality=88, optimize=True, progressive=True)

# Red seconds marker on transparent 480x480 layer, pivot at screen centre.
p = Image.new('RGBA', (W,H), (0,0,0,0))
pd = ImageDraw.Draw(p)
pd.polygon([(240,438),(231,454),(250,449)], fill=(255,0,0,255))
p.save(OUT / 'second_pointer.png', optimize=True)

# Store preview required by app metadata
preview = bg.resize((324,324), Image.Resampling.LANCZOS)
preview.save(OUT / 'preview.png', optimize=True)
print('Generated', OUT)
