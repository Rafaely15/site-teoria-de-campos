"""Prepara os arquivos de logo do site a partir das artes originais.

As artes enviadas ja vem em PNG com canal alfa real (fundo transparente), entao
aqui so recortamos as margens vazias e geramos o favicon. Nao ha remocao de
fundo: a versao anterior precisava disso porque a arte vinha sobre um fundo
cinza; estas nao.

Rode este script de novo se trocar as artes de origem.
"""
from PIL import Image

BASE = r"C:\Users\Carla Batista\Documents\projeto-site-grupo\Site-para-grupo-de-pesquisa\assets"

# arte de origem -> arquivo gerado
SOURCES = {
    # lockup completo (buraco negro + wordmark) — usado grande no hero
    r"C:\Users\Carla Batista\Downloads\QCAMPO (1).png": "qcampo-logo-amber.png",
    # so o disco — usado pequeno no cabecalho e no rodape
    r"C:\Users\Carla Batista\Downloads\Design sem nome (1).png": "qcampo-mark.png",
}


def trim(im, pad_ratio=0.02, thr=3):
    """Recorta as margens transparentes, deixando uma folga proporcional."""
    alpha = im.split()[3]
    bbox = alpha.point(lambda v: 255 if v > thr else 0).getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    pad = int(max(r - l, b - t) * pad_ratio)
    return im.crop((max(0, l - pad), max(0, t - pad),
                    min(im.width, r + pad), min(im.height, b + pad)))


for src, name in SOURCES.items():
    out = trim(Image.open(src).convert("RGBA"))
    out.save(f"{BASE}\\{name}")
    print("salvo", name, out.size)

# favicon a partir do disco, em quadrado
mark = Image.open(f"{BASE}\\qcampo-mark.png")
side = max(mark.size)
square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
square.paste(mark, ((side - mark.width) // 2, (side - mark.height) // 2))
square.resize((128, 128), Image.LANCZOS).save(f"{BASE}\\favicon.png")
print("salvo favicon.png 128x128")
