import { Container, AnimatedSprite, Texture, ImageSource } from "pixi.js";

const BASE = "/assets/sprites/frame-sequences";
const ANIM_SPEED = 0.4;

interface ManifestData {
  [characterId: string]: {
    [animName: string]: number[];
  };
}

type OffsetData = Record<string, { dx: number; dy: number }>;
type OffsetMap = Record<string, OffsetData>;

let manifestCache: ManifestData | null = null;
let offsetCache: OffsetMap | null = null;

async function loadManifest(): Promise<ManifestData> {
  if (manifestCache) return manifestCache;
  const res = await fetch(`${BASE}/manifest.json`);
  manifestCache = (await res.json()) as ManifestData;
  return manifestCache;
}

async function loadOffsets(): Promise<OffsetMap> {
  if (offsetCache) return offsetCache;
  try {
    const res = await fetch(`${BASE}/anim-offsets.json`);
    offsetCache = (await res.json()) as OffsetMap;
  } catch {
    offsetCache = {};
  }
  return offsetCache;
}

async function loadTexture(url: string): Promise<Texture> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(Texture.from(new ImageSource({ resource: img })));
    img.onerror = () => reject(new Error(`Failed to load: ${url}`));
    img.src = url;
  });
}

export class FrameSequenceSprite {
  private container = new Container();
  private sprite: AnimatedSprite | null = null;
  private frameTextures = new Map<string, Texture[]>();
  private _loaded = false;
  private _currentAnim = "";
  private _characterId = "";
  private _loop = true;
  onComplete: (() => void) | null = null;

  get isLoaded(): boolean { return this._loaded; }
  get displayContainer(): Container { return this.container; }
  get currentAnimation(): string { return this._currentAnim; }
  get characterId(): string { return this._characterId; }

  get animationNames(): string[] {
    return [...this.frameTextures.keys()];
  }

  async load(characterId: string): Promise<void> {
    this._characterId = characterId;
    const manifest = await loadManifest();
    const anims = manifest[characterId];
    if (!anims) throw new Error(`Character not found: ${characterId}`);

    const promises: Promise<void>[] = [];
    for (const [animName, frames] of Object.entries(anims)) {
      promises.push(this.loadFrames(characterId, animName, frames));
    }
    await Promise.all(promises);

    // Pre-load animation offset data
    await loadOffsets();

    this._loaded = true;
  }

  private async loadFrames(characterId: string, animName: string, frames: number[]): Promise<void> {
    const textures: Texture[] = [];
    for (const frameIdx of frames) {
      const url = `${BASE}/${characterId}/${characterId}-${animName}_${frameIdx}.png`;
      try {
        const tex = await loadTexture(url);
        textures.push(tex);
      } catch {
        console.warn(`Missing frame: ${url}`);
      }
    }
    if (textures.length > 0) {
      this.frameTextures.set(animName, textures);
    }
  }

  play(animName: string, loop = true): void {
    const textures = this.frameTextures.get(animName);
    if (!textures || textures.length === 0) return;

    if (this.sprite && this._currentAnim === animName && this.sprite.playing && this._loop === loop) return;

    this._currentAnim = animName;
    this._loop = loop;

    if (!this.sprite) {
      this.sprite = new AnimatedSprite(textures);
      this.sprite.anchor.set(0.5);
      this.sprite.animationSpeed = ANIM_SPEED;
      this.container.addChild(this.sprite);
    } else {
      this.sprite.textures = textures;
      this.sprite.currentFrame = 0;
      this.sprite.anchor.set(0.5);
    }

    // Apply per-animation offset so character visual center stays consistent
    const charOffsets = offsetCache?.[this._characterId];
    const offset = charOffsets?.[animName];
    if (offset) {
      this.sprite.position.set(offset.dx, offset.dy);
    } else {
      this.sprite.position.set(0, 0);
    }

    this.sprite.loop = loop;
    this.sprite.onComplete = loop ? undefined : () => {
      this.onComplete?.();
      this._currentAnim = "";
    };
    this.sprite.play();
  }

  stop(): void {
    this.sprite?.stop();
  }

  destroy(): void {
    this.stop();
    if (this.sprite) {
      this.sprite.removeFromParent();
      this.sprite.destroy();
      this.sprite = null;
    }
    this.frameTextures.clear();
    this._loaded = false;
    this._currentAnim = "";
    this.onComplete = null;
  }
}
