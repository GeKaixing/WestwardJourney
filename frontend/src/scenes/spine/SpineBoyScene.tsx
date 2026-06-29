import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Application, Container, Graphics, ImageSource } from "pixi.js";
import { Spine, SpineTexture } from "@esotericsoftware/spine-pixi-v8";
import { SkeletonBinary, TextureAtlas, AtlasAttachmentLoader } from "@esotericsoftware/spine-core";

const SPINEBOY_BASE = "https://raw.githubusercontent.com/pixijs/spine-v8/main/examples/assets";
const SPINEBOY_SKEL = `${SPINEBOY_BASE}/spineboy-pro.skel`;
const SPINEBOY_ATLAS_URL = `${SPINEBOY_BASE}/spineboy-pma.atlas`;

const SPEED_WALK = 3;
const SPEED_RUN = 6;
// 背景相对角色水平位移的视差系数
const BG_PARALLAX = 0.35;

const BG_COLORS = [
  0x1a1a2e, 0x16213e, 0x0f3460, 0x533483, 0x1b1b1b, 0x2d2d2d, 0x3a3a3a, 0x4a4a4a,
];

function buildBackground(bg: Container, w: number, h: number) {
  bg.removeChildren();
  for (let i = 0; i < BG_COLORS.length; i++) {
    const slice = new Graphics()
      .rect(0, 0, w, h / BG_COLORS.length)
      .fill({ color: BG_COLORS[i] });
    slice.y = (i * h) / BG_COLORS.length;
    bg.addChild(slice);
  }
  const ground = new Graphics()
    .rect(0, h - 60, w + 200, 60)
    .fill({ color: 0x2d5016 });
  bg.addChild(ground);
  for (let i = 0; i < 40; i++) {
    const tree = new Graphics()
      .rect(0, 0, 8, 40 + Math.random() * 60)
      .fill({ color: 0x1a3a0a });
    tree.x = Math.random() * (w + 400);
    tree.y = h - 60 - (40 + Math.random() * 60);
    bg.addChild(tree);
  }
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

export function SpineBoyScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [status, setStatus] = useState("启动中…");

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    // 输入状态：方向与加速完全解耦
    const KEY_STATE: Record<string, boolean> = {};
    let animDir = "";
    // 背景平移量，由角色相对中心的水平偏移驱动，避免与角色回拉互相打架
    let bgOffset = 0;

    let app: Application | null = null;
    let initPromise: Promise<void> | null = null;
    let destroyed = false;
    let spineboy: Spine | null = null;
    let bgContainer: Container | null = null;
    let hint: HTMLDivElement | null = null;

    // 走 track 1 的单次动作（jump/shoot），播完自动清空轨道，
    // 避免停留在最后一帧持续叠加在移动动画之上。
    const triggerOneShot = (anim: string) => {
      if (!spineboy) return;
      const entry = spineboy.state.setAnimation(1, anim, false);
      entry.listener = {
        complete: () => {
          spineboy?.state.clearTrack(1);
        },
      };
    };

    const onKeyDown = (e: KeyboardEvent) => {
      KEY_STATE[e.key.toLowerCase()] = true;
      if (e.key === " ") triggerOneShot("jump");
      if (e.key.toLowerCase() === "j") triggerOneShot("shoot");
    };

    const onKeyUp = (e: KeyboardEvent) => {
      KEY_STATE[e.key.toLowerCase()] = false;
    };

    // 让 spineboy 全身可见且脚踩地面：按屏幕高度自适应缩放，
    // 并用 getBounds() 把包围盒底部对齐到地面线（GROUND_Y = h - 60）。
    const layoutScene = (w: number, h: number) => {
      if (bgContainer) buildBackground(bgContainer, w, h);
      if (!spineboy) return;

      const groundY = h - 60;
      // 目标可视高度：地面以上区域的 70%，留出上方边距与下方投影空间
      const targetH = Math.max(200, groundY * 0.7);
      const b = spineboy.getBounds();
      const curH = b.height || 1;
      const scale = Math.min(spineboy.scale.x, spineboy.scale.y) || 1;
      const targetScale = (scale * targetH) / curH;
      // 保留水平朝向（向右为正，向左为负）
      const facing = spineboy.scale.x < 0 ? -1 : 1;
      spineboy.scale.set(targetScale * facing, targetScale);

      // 重新取包围盒，把角色底部对齐到地面、水平居中
      const nb = spineboy.getBounds();
      spineboy.x = w / 2 - (nb.x + nb.width / 2 - spineboy.x);
      spineboy.y = spineboy.y + (groundY - (nb.y + nb.height));
    };

    const onResize = () => {
      if (app && !destroyed) {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        layoutScene(window.innerWidth, window.innerHeight);
      }
    };

    initPromise = (async () => {
      app = new Application();
      await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        background: BG_COLORS[0],
        antialias: true,
      });
      if (destroyed) return;
      const canvas = app.canvas as HTMLCanvasElement;
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      el.appendChild(canvas);

      bgContainer = new Container();
      buildBackground(bgContainer, window.innerWidth, window.innerHeight);
      app.stage.addChild(bgContainer);

      const spineContainer = new Container();
      app.stage.addChild(spineContainer);

      setStatus("加载 Spine 资源中…");
      try {
        spineboy = await loadSpineAssets();
      } catch (e) {
        if (destroyed) return;
        console.error("Spine failed:", e);
        setStatus(`加载失败: ${e instanceof Error ? e.message : "未知错误"}`);
        return;
      }

      if (destroyed) return;

      spineboy.state.data.defaultMix = 0.2;
      spineContainer.addChild(spineboy);
      // setAnimation 后包围盒才稳定，先放舞台再布局（缩放 + 对齐地面）
      spineboy.state.setAnimation(0, "idle", true);
      layoutScene(window.innerWidth, window.innerHeight);
      setStatus("");

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      window.addEventListener("resize", onResize);

      hint = document.createElement("div");
      hint.textContent = "方向键/WASD 移动，Space 跳跃，J 射击（Shift 加速）";
      hint.style.cssText = `
        position:absolute; color:#aaa; font:14px monospace;
        bottom:8px; left:50%; transform:translateX(-50%);
        background:rgba(0,0,0,0.6); padding:4px 12px; border-radius:4px;
      `;
      el.appendChild(hint);

      app.ticker.add(() => {
        if (!spineboy) return;

        // 水平方向（仅左右键 / A / D）
        let dir = 0;
        if (KEY_STATE["arrowleft"] || KEY_STATE["a"]) dir -= 1;
        if (KEY_STATE["arrowright"] || KEY_STATE["d"]) dir += 1;

        // 加速：Shift 或上下键视为加速意图（上下不再产生横向位移，仅切换 run）
        const boost =
          KEY_STATE["shift"] ||
          KEY_STATE["arrowup"] ||
          KEY_STATE["w"] ||
          KEY_STATE["arrowdown"] ||
          KEY_STATE["s"];

        if (dir !== 0) {
          const speed = boost ? SPEED_RUN : SPEED_WALK;
          const anim = boost ? "run" : "walk";
          if (animDir !== anim) {
            spineboy.state.setAnimation(0, anim, true);
            animDir = anim;
          }
          spineboy.x += dir * speed;
          spineboy.scale.x = dir > 0 ? Math.abs(spineboy.scale.x) : -Math.abs(spineboy.scale.x);
          // 背景随角色移动做视差平移
          bgOffset -= dir * speed * BG_PARALLAX;
        } else if (animDir !== "idle") {
          spineboy.state.setAnimation(0, "idle", true);
          animDir = "idle";
        }

        // 单一来源驱动背景平移：基于角色相对中心的水平偏移映射，
        // 角色回到中心时背景也回到 0，两者不再互相打架。
        const center = window.innerWidth / 2;
        const targetBg = -(spineboy.x - center) * BG_PARALLAX;
        bgOffset += (targetBg - bgOffset) * 0.1;
        if (bgContainer) bgContainer.x = bgOffset;
      });
    })();

    return () => {
      destroyed = true;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      if (hint) hint.remove();
      // 异步竞态：等 init 完成后再销毁，避免 init 仍在进行时
      // canvas 尚未挂载或 app 尚未就绪导致的残留 / 泄漏。
      const finalize = () => {
        if (app) {
          const canvas = app.canvas as HTMLCanvasElement | undefined;
          app.destroy(true, { children: true, texture: true });
          if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
          app = null;
        }
      };
      if (initPromise) {
        initPromise.finally(finalize);
      } else {
        finalize();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} className="block w-full h-full" />
      {status && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xl z-20">
          {status}
        </div>
      )}
      <button
        className="absolute top-4 left-4 z-10 rounded bg-black/50 px-3 py-1 text-sm text-white hover:bg-black/70"
        onClick={() => navigate("/")}
      >
        ← 返回
      </button>
    </div>
  );
}
