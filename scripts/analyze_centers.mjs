import { readFile, readdir, writeFile } from "node:fs/promises";
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

async function getNonTransparentCenter(buf) {
  const res = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const data = res.data;
  const width = res.info.width;
  const height = res.info.height;

  let minX = width, minY = height, maxX = 0, maxY = 0;
  const pixelCount = width * height;
  for (let i = 0; i < pixelCount; i++) {
    const alpha = data[i * 4 + 3];
    if (alpha > 0) {
      const x = i % width;
      const y = Math.floor(i / width);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) return { cx: 0, cy: 0 };
  return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

async function main() {
  const result = {};

  for (const hero of HEROES) {
    const dir = join(BASE, hero);
    const files = (await readdir(dir)).filter((f) => f.endsWith(".png"));

    const animMap = {};
    for (const f of files) {
      const match = f.match(/hero_.+?-(\w+)_(\d+)\.png/);
      if (!match) continue;
      const [, anim, idx] = match;
      if (!animMap[anim]) animMap[anim] = [];
      animMap[anim].push(parseInt(idx));
    }

    const animData = {};
    for (const [anim, indices] of Object.entries(animMap)) {
      const sorted = indices.sort((a, b) => a - b);
      const firstFile = `${hero}-${anim}_${sorted[0]}.png`;
      const buf = await readFile(join(dir, firstFile));
      const { width, height } = await sharp(buf).metadata();
      const { cx, cy } = await getNonTransparentCenter(buf);
      animData[anim] = { cx, cy, w: width, h: height, count: indices.length };
    }

    result[hero] = animData;

    console.log(`\n=== ${hero} ===`);
    for (const [anim, { cx, cy, w, h, count }] of Object.entries(animData)) {
      console.log(`  ${anim} (${count}f) ${w}x${h} center=(${cx.toFixed(1)}, ${cy.toFixed(1)})`);
    }

    const idle = animData["idle"];
    if (idle) {
      for (const [anim, d] of Object.entries(animData)) {
        if (anim === "idle") continue;
        const dx = Math.round((idle.cx - d.cx) + (d.w - idle.w) / 2);
        const dy = Math.round((idle.cy - d.cy) + (d.h - idle.h) / 2);
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          console.log(`  >> ${anim} vs idle: offset (${dx}, ${dy})`);
        }
      }
    }
  }

  // Write per-animation offsets relative to idle
  const offsets = {};
  for (const [hero, anims] of Object.entries(result)) {
    const idle = anims["idle"];
    if (!idle) { offsets[hero] = {}; continue; }
    const heroOffsets = {};
    for (const [anim, d] of Object.entries(anims)) {
      if (anim === "idle") {
        heroOffsets[anim] = { dx: 0, dy: 0 };
      } else {
        heroOffsets[anim] = {
          dx: Math.round((idle.cx - d.cx) + (d.w - idle.w) / 2),
          dy: Math.round((idle.cy - d.cy) + (d.h - idle.h) / 2),
        };
      }
    }
    offsets[hero] = heroOffsets;
  }

  await writeFile(join(BASE, "anim-offsets.json"), JSON.stringify(offsets, null, 2));
  console.log("\nWritten anim-offsets.json");
}

main().catch(console.error);
