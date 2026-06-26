import type { CardConfig } from "@shared/types/CardConfig";
import type { DiyCardFormState, Sts2Manifest } from "../systems/diyCard/types";
import { loadFonts, loadImage } from "../systems/diyCard/imageCache";
import { renderSts2Card } from "../systems/diyCard/renderSts2Card";

const MANIFEST_URL = "/diy-card-assets-sts2/manifest.json";

const CARD_TYPE_MAP: Record<string, DiyCardFormState["cardType"]> = {
  attack: "attack",
  skill: "skill",
  power: "power",
  status: "status",
  curse: "curse",
};

const RARITY_MAP: Record<string, DiyCardFormState["cardRarity"]> = {
  basic: "basic",
  common: "common",
  uncommon: "uncommon",
  rare: "rare",
};

class CardImageGenerator {
  private manifest: Sts2Manifest | null = null;
  private ready = false;
  private initPromise: Promise<void> | null = null;
  private cache = new Map<string, string>();

  private async init(): Promise<void> {
    if (this.ready) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const res = await fetch(MANIFEST_URL);
      if (!res.ok) throw new Error("Failed to load manifest");
      const manifest: Sts2Manifest = await res.json();
      this.manifest = manifest;

      const bold = "/diy-card-assets-sts2/Kreon-Bold.ttf";
      const regular = "/diy-card-assets-sts2/Kreon-Regular.ttf";
      try { await loadFonts(bold, regular); } catch {}

      const total = manifest.atlases.length + (manifest.typePlaque ? 1 : 0);
      let loaded = 0;
      const mark = () => { loaded++; };
      for (const url of manifest.atlases) {
        loadImage(url).then(mark).catch(mark);
      }
      if (manifest.typePlaque) {
        loadImage(manifest.typePlaque).then(mark).catch(mark);
      } else {
        mark();
      }

      await new Promise<void>((resolve) => {
        const check = () => {
          if (loaded >= total) resolve();
          else setTimeout(check, 30);
        };
        check();
      });

      this.ready = true;
    })();

    return this.initPromise;
  }

  async getCardImageUrl(config: CardConfig, upgraded: boolean): Promise<string> {
    const cacheKey = `${config.id}_${upgraded}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    await this.init();
    const manifest = this.manifest;
    if (!manifest) throw new Error("Manifest not loaded");

    const form: DiyCardFormState = {
      cardType: CARD_TYPE_MAP[config.type.toLowerCase()] ?? "skill",
      character: "colorless",
      cardRarity: RARITY_MAP[config.rarity.toLowerCase()] ?? "common",
      cardName: config.name,
      description: upgraded && config.upgradedDescription ? config.upgradedDescription : config.description,
      orbCost: String(config.cost),
      starCost: "",
      upgraded,
      costGreen: false,
    };

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    try {
      await document.fonts.ready;
      await renderSts2Card(canvas, manifest, form, null, { locale: "zh" });
    } catch (e) {
      console.error("Card render failed:", config.id, e);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, 726, 924);
      ctx.fillStyle = "#aaa";
      ctx.font = "28px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(config.name, 363, 462);
    }

    const dataUrl = canvas.toDataURL("image/png");
    this.cache.set(cacheKey, dataUrl);
    return dataUrl;
  }

  getCachedImageUrl(configId: string, upgraded: boolean): string | undefined {
    return this.cache.get(`${configId}_${upgraded}`);
  }
}

export const cardImageGenerator = new CardImageGenerator();
