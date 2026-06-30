import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const HEROES = [
  "hero_bone_dragon",
  "hero_fairy_dragon",
  "hero_dragzilla",
  "hero_magic_dragon",
  "hero_storm_dragon",
];

const BASE = join(import.meta.dirname, "..", "frontend/public/assets/sprites/frame-sequences");

async function main() {
  for (const hero of HEROES) {
    const dir = join(BASE, hero);
    const files = (await readdir(dir)).filter((f) => f.endsWith(".png"));
    if (files.length === 0) continue;

    // Find max dimensions across all frames
    let maxW = 0;
    let maxH = 0;
    const meta = [];
    for (const f of files) {
      const buf = await readFile(join(dir, f));
      const { width, height } = await sharp(buf).metadata();
      maxW = Math.max(maxW, width);
      maxH = Math.max(maxH, height);
      meta.push({ name: f, buf, width, height });
    }

    console.log(`${hero}: padding all ${meta.length} frames to ${maxW}x${maxH}`);

    for (const { name, buf, width, height } of meta) {
      if (width === maxW && height === maxH) continue; // already max size
      const left = Math.round((maxW - width) / 2);
      const top = Math.round((maxH - height) / 2);
      const padded = await sharp({
        create: { width: maxW, height: maxH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
      })
        .composite([{ input: buf, left, top }])
        .png()
        .toBuffer();
      await writeFile(join(dir, name), padded);
    }
  }
  console.log("Done");
}

main().catch(console.error);
