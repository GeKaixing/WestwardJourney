import type { CardConfig } from "@shared/types/CardConfig";
import type { DiyCardFormState, Sts2Manifest } from "../systems/diyCard/types";
import { loadFonts, loadImage } from "../systems/diyCard/imageCache";
import { renderSts2Card } from "../systems/diyCard/renderSts2Card";
import { CharacterClass } from "@shared/enums/CharacterClass";

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
  legendary: "rare",
  event: "event",
  ancient: "ancient",
};

// ponytail: card id → frontend/public/card/ artwork path
const CARD_ART: Record<string, string> = {
  strike: "/card/basics/打击.png",
  defend: "/card/basics/防御.png",
  // 骨龙
  bone_spear: "/card/骨龙/白骨突刺.png",
  bone_armor: "/card/骨龙/骸骨护甲.png",
  corrupting_touch: "/card/骨龙/腐蚀之触.png",
  undead_rising: "/card/骨龙/亡灵复生.png",
  bone_bond: "/card/骨龙/命骨相连.png",
  skeleton_legion: "/card/骨龙/骷髅军团.png",
  whisper_of_dead: "/card/骨龙/亡者低语.png",
  death_harvest: "/card/骨龙/死亡收割.png",
  // 仙龙
  heavens_grace: "/card/仙龙/天恩.png",
  divine_insight: "/card/仙龙/灵悟.png",
  scale_of_light: "/card/仙龙/鳞光盾.png",
  holy_radiance: "/card/仙龙/圣光普照.png",
  purifying_light: "/card/仙龙/净化之光.png",
  flash_of_insight: "/card/仙龙/灵光一闪.png",
  dragon_soul_blessing: "/card/仙龙/龙魂护佑.png",
  cycle_of_heaven: "/card/仙龙/天道轮回.png",
  return_to_origin: "/card/仙龙/归元诀.png",
  // 龙斯拉
  kings_wrath: "/card/龙斯拉/龙王怒击.png",
  dragon_majesty: "/card/龙斯拉/龙威.png",
  royal_command: "/card/龙斯拉/王权降临.png",
  dragon_breath: "/card/龙斯拉/龙之吐息.png",
  iron_scales: "/card/龙斯拉/铁甲龙鳞.png",
  kings_guard: "/card/龙斯拉/龙王护卫.png",
  dragon_god_possession: "/card/龙斯拉/龙神附体.png",
  final_dragon_roar: "/card/龙斯拉/终极龙吟.png",
  // 魔龙
  abyssal_sand: "/card/魔龙/深渊流沙.png",
  demon_core: "/card/魔龙/魔核护体.png",
  hellfire: "/card/魔龙/地狱烈焰.png",
  abyss_gaze: "/card/魔龙/深渊凝视.png",
  chaos_fire: "/card/魔龙/混沌之火.png",
  abyss_armor: "/card/魔龙/深渊护甲.png",
  demon_pact: "/card/魔龙/恶魔契约.png",
  soul_cleave: "/card/魔龙/裂魂斩.png",
  // 风暴龙
  thunder_strike: "/card/风暴龙/雷突.png",
  wind_step: "/card/风暴龙/风步.png",
  storm_breath: "/card/风暴龙/风暴吐息.png",
  lightning_flash: "/card/风暴龙/电光一闪.png",
  storm_shield: "/card/风暴龙/暴风护盾.png",
  thunderbolt: "/card/风暴龙/雷霆万钧.png",
  wind_sprint: "/card/风暴龙/风之疾走.png",
  eye_of_hurricane: "/card/风暴龙/飓风之眼.png",
  thunderstorm: "/card/风暴龙/雷云风暴.png",
};

const CHARACTER_CLASS_TO_STS: Record<CharacterClass, DiyCardFormState["character"]> = {
  [CharacterClass.BoneDragon]: "ironclad",
  [CharacterClass.ImmortalDragon]: "regent",
  [CharacterClass.Longsila]: "defect",
  [CharacterClass.DemonDragon]: "silent",
  [CharacterClass.StormDragon]: "necrobinder",
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

  async getCardImageUrl(config: CardConfig, upgraded: boolean, playerCharacterClass?: CharacterClass): Promise<string> {
    const cacheKey = `${config.id}_${upgraded}_${playerCharacterClass ?? "default"}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      await this.init();
    } catch {
      // ponytail: show name-only card if manifest/atlases fail
    }

    const canvas = document.createElement("canvas");
    canvas.width = 726; canvas.height = 924;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      const dataUrl = canvas.toDataURL("image/png");
      this.cache.set(cacheKey, dataUrl);
      return dataUrl;
    }

    const manifest = this.manifest;
    const hasAssets = !!manifest;

    let character: DiyCardFormState["character"] = "colorless";
    try {
      character = config.characterClass 
        ? CHARACTER_CLASS_TO_STS[config.characterClass] 
        : playerCharacterClass 
          ? CHARACTER_CLASS_TO_STS[playerCharacterClass]
          : "colorless";
    } catch {}

    const form: DiyCardFormState = {
      cardType: CARD_TYPE_MAP[config.type.toLowerCase()] ?? "skill",
      character,
      cardRarity: RARITY_MAP[config.rarity.toLowerCase()] ?? "common",
      cardName: config.name,
      description: upgraded && config.upgradedDescription ? config.upgradedDescription : config.description,
      orbCost: String(config.cost),
      starCost: "",
      upgraded,
      costGreen: false,
    };

    if (hasAssets) {
      try {
        await document.fonts.ready;
        const artworkUrl = CARD_ART[config.id] ?? null;
        await renderSts2Card(canvas, manifest!, form, artworkUrl, { locale: "zh" });
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
    } else {
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, 726, 924);
      ctx.fillStyle = "#aaa";
      ctx.font = "28px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(config.name, 363, 462);
    }

    let dataUrl: string;
    try {
      dataUrl = canvas.toDataURL("image/png");
    } catch {
      dataUrl = "";
    }
    this.cache.set(cacheKey, dataUrl);
    return dataUrl;
  }

  getCachedImageUrl(configId: string, upgraded: boolean): string | undefined {
    return this.cache.get(`${configId}_${upgraded}`);
  }
}

export const cardImageGenerator = new CardImageGenerator();
