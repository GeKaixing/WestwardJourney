import { useEffect, useRef } from "react";
import { type Container, ImageSource } from "pixi.js";
import { Spine, SpineTexture } from "@esotericsoftware/spine-pixi-v8";
import { SkeletonBinary, TextureAtlas, AtlasAttachmentLoader } from "@esotericsoftware/spine-core";

const DRAGON_BASE = "/assets/spine/dragon";
const DRAGON_SKEL = `${DRAGON_BASE}/dragon-ess.skel`;
const DRAGON_ATLAS_URL = `${DRAGON_BASE}/dragon-pma.atlas`;

async function loadDragonSpine(): Promise<Spine> {
  const [skelBuf, atlasText] = await Promise.all([
    fetch(DRAGON_SKEL).then((r) => r.arrayBuffer()),
    fetch(DRAGON_ATLAS_URL).then((r) => r.text()),
  ]);

  const atlas = new TextureAtlas(atlasText);
  for (const page of atlas.pages) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = DRAGON_BASE + "/" + page.name;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });
    page.setTexture(SpineTexture.from(new ImageSource({ resource: img })));
  }

  const attachmentLoader = new AtlasAttachmentLoader(atlas);
  const binary = new SkeletonBinary(attachmentLoader);
  const skeletonData = binary.readSkeletonData(new Uint8Array(skelBuf));
  return new Spine({ skeletonData });
}

export function EnemyCharacter({
  stage,
  enemyId,
}: {
  stage: Container;
  enemyId: string;
}) {
  const spineRef = useRef<Spine | null>(null);

  useEffect(() => {
    let destroyed = false;

    const reposition = () => {
      const el = document.querySelector(`[data-enemy-id="${enemyId}"]`);
      const dragon = spineRef.current;
      if (!el || !dragon) return;
      const rect = el.getBoundingClientRect();
      const nb = dragon.getBounds();
      dragon.x = rect.left + (rect.width - nb.width) / 2 - nb.x;
      dragon.y = rect.top + (rect.height - nb.height) / 2 - nb.y;
    };

    (async () => {
      let dragon: Spine;
      try {
        dragon = await loadDragonSpine();
      } catch (e) {
        console.error("Dragon spine load failed:", e);
        return;
      }
      if (destroyed) return;

      dragon.state.data.defaultMix = 0.2;
      dragon.state.setAnimation(0, "flying", true);
      dragon.autoUpdate = true;

      const b = dragon.getBounds();
      const scale = 256 / (b.width || 1);
      dragon.scale.set(-scale, scale);

      stage.addChild(dragon);
      spineRef.current = dragon;
      reposition();

      window.addEventListener("resize", reposition);
    })();

    return () => {
      destroyed = true;
      window.removeEventListener("resize", reposition);
      if (spineRef.current) {
        spineRef.current.removeFromParent();
        spineRef.current = null;
      }
    };
  }, [stage, enemyId]);

  return null;
}
