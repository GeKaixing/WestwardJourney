const cache = new Map<string, HTMLImageElement>();

export async function loadImage(url: string): Promise<HTMLImageElement> {
  const cached = cache.get(url);
  if (cached) return cached;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  await img.decode();
  cache.set(url, img);
  return img;
}

export async function loadFonts(boldUrl: string, regularUrl: string): Promise<void> {
  const faces: FontFace[] = [];
  if (boldUrl) {
    faces.push(new FontFace("DIYKreonBold", `url(${boldUrl})`));
  }
  if (regularUrl) {
    faces.push(new FontFace("DIYKreonRegular", `url(${regularUrl})`));
  }
  const loaded = await Promise.all(faces.map((f) => f.load()));
  for (const face of loaded) {
    document.fonts.add(face);
  }
  await document.fonts.ready;
}
