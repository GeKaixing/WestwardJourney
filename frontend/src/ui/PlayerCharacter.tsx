import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Application, ImageSource, Container } from "pixi.js";
import { Spine, SpineTexture } from "@esotericsoftware/spine-pixi-v8";
import { SkeletonBinary, TextureAtlas, AtlasAttachmentLoader } from "@esotericsoftware/spine-core";

const SPINEBOY_BASE = "https://raw.githubusercontent.com/pixijs/spine-v8/main/examples/assets";
const SPINEBOY_SKEL = `${SPINEBOY_BASE}/spineboy-pro.skel`;
const SPINEBOY_ATLAS_URL = `${SPINEBOY_BASE}/spineboy-pma.atlas`;

export interface PlayerCharacterHandle {
  triggerAttack: () => void;
  isReady: () => boolean;
  getStage: () => Container | null;
}

export interface PlayerCharacterProps {
  onReady?: () => void;
  onError?: () => void;
}

async function loadSpineAssets(): Promise<Spine> {
  const [skelBuf, atlasText] = await Promise.all([
    fetch(SPINEBOY_SKEL).then((r) => r.arrayBuffer()),
    fetch(SPINEBOY_ATLAS_URL).then((r) => r.text()),
  ]);

  const atlas = new TextureAtlas(atlasText);
  const atlasBase = SPINEBOY_BASE + "/";
  for (const page of atlas.pages) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = atlasBase + page.name;
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

export const PlayerCharacter = forwardRef<PlayerCharacterHandle, PlayerCharacterProps>(
  function PlayerCharacter({ onReady, onError }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const spineRef = useRef<Spine | null>(null);
    const appRef = useRef<Application | null>(null);
    const readyRef = useRef(false);
    const [failed, setFailed] = useState(false);

    const triggerAttack = () => {
      const spineboy = spineRef.current;
      if (!spineboy) return;
      const entry = spineboy.state.setAnimation(1, "shoot", false);
      entry.listener = {
        complete: () => {
          spineRef.current?.state.clearTrack(1);
        },
      };
    };

    useImperativeHandle(ref, () => ({
      triggerAttack,
      isReady: () => readyRef.current,
      getStage: () => appRef.current?.stage ?? null,
    }), []);

    useEffect(() => {
      if (!containerRef.current) return;
      const el = containerRef.current;

      let app: Application | null = null;
      let initPromise: Promise<void> | null = null;
      let destroyed = false;

      const reposition = () => {
        const spineboy = spineRef.current;
        const slot = document.querySelector('[data-player-id="player"]');
        if (!slot || !spineboy) return;
        const rect = slot.getBoundingClientRect();
        const b = spineboy.getBounds();
        const slotSize = Math.min(rect.width, rect.height);
        const scale = (slotSize * 0.75) / (b.width || 1);
        const facing = spineboy.scale.x < 0 ? -1 : 1;
        spineboy.scale.set(scale * facing, scale);
        const nb = spineboy.getBounds();
        spineboy.x = rect.left + (rect.width - nb.width) / 2 - nb.x;
        spineboy.y = rect.top + (rect.height - nb.height) / 2 - nb.y;
      };

      const onResize = () => {
        if (app && !destroyed) {
          app.renderer.resize(window.innerWidth, window.innerHeight);
          reposition();
        }
      };

      initPromise = (async () => {
        app = new Application();
        await app.init({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundAlpha: 0,
          antialias: true,
        });
        if (destroyed) return;

        const canvas = app.canvas as HTMLCanvasElement;
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.pointerEvents = "none";
        el.appendChild(canvas);
        appRef.current = app;

        let spineboy: Spine;
        try {
          spineboy = await loadSpineAssets();
        } catch (e) {
          if (destroyed) return;
          console.error("PlayerCharacter spine load failed:", e);
          setFailed(true);
          onError?.();
          return;
        }
        if (destroyed) return;

        spineboy.state.data.defaultMix = 0.2;
        app.stage.addChild(spineboy);
        spineboy.state.setAnimation(0, "idle", true);
        spineRef.current = spineboy;
        reposition();
        readyRef.current = true;
        onReady?.();

        window.addEventListener("resize", onResize);
      })();

      return () => {
        destroyed = true;
        window.removeEventListener("resize", onResize);
        readyRef.current = false;
        spineRef.current = null;
        appRef.current = null;
        const finalize = () => {
          if (app) {
            const canvas = app.canvas as HTMLCanvasElement | undefined;
            app.destroy(true, { children: true, texture: true });
            if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
            app = null;
          }
        };
        if (initPromise) initPromise.finally(finalize);
        else finalize();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (failed) return null;

    return (
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 z-10"
        aria-hidden={true}
      />
    );
  },
);
