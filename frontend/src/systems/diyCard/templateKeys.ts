import type { CardRarity, CardType, Character, TemplateKeys } from "./types";

export function normalizeCharacter(character: Character | string): string {
  const value = String(character || "").toLowerCase().trim();
  if (value === "the regent" || value === "regent") return "regent";
  if (["ironclad", "silent", "defect", "necrobinder", "colorless", "quest"].includes(value)) {
    return value;
  }
  if (["status", "curse", "event", "token"].includes(value)) return "colorless";
  return value.replace(/\s+/g, "_") || "colorless";
}

export function getTemplateKeys(
  cardType: CardType,
  character: Character,
  cardRarity: CardRarity,
): TemplateKeys {
  const type = cardType.toLowerCase();
  const charKey = normalizeCharacter(character);
  const rarity = String(cardRarity || "").toLowerCase();
  const isAncient = rarity === "ancient";
  const isQuest =
    String(character).toLowerCase() === "quest" || rarity === "quest";

  return {
    frame: isAncient ? "card_frame_ancient_s.tres" : `card_frame_${isQuest ? "quest" : type}_s.tres`,
    portraitBorder: isAncient
      ? null
      : `card_portrait_border_${isQuest ? "skill" : type}_s.tres`,
    banner: isAncient ? "ancient_banner.tres" : "card_banner.tres",
    energy: `energy_${charKey}.tres`,
  };
}

export function normalizeFormCharacter(character: Character): Character {
  return character;
}

export function applyCharacterRules<T extends { character: Character; cardType: CardType; cardRarity: CardRarity }>(
  form: T,
): T {
  if (form.character === "quest") {
    return { ...form, cardType: "skill", cardRarity: "quest" };
  }
  if (form.character === "status") {
    return { ...form, cardType: "skill", cardRarity: "status" };
  }
  if (form.character === "curse") {
    return { ...form, cardType: "skill", cardRarity: "curse" };
  }
  if (["curse", "status", "quest"].includes(form.cardRarity)) {
    return { ...form, cardRarity: "common" };
  }
  return form;
}

export function getTypeLabel(
  cardType: CardType,
  character: Character,
  locale = "zh",
): string {
  const rarity = String(character).toLowerCase();
  const special: Record<string, Record<string, string>> = {
    quest: { zh: "任务", en: "Quest" },
    status: { zh: "状态", en: "Status" },
    curse: { zh: "诅咒", en: "Curse" },
  };
  if (special[rarity]) {
    return special[rarity]![locale] ?? special[rarity]!.en!;
  }

  const types: Record<string, Record<string, string>> = {
    attack: { zh: "攻击", en: "Attack" },
    skill: { zh: "技能", en: "Skill" },
    power: { zh: "能力", en: "Power" },
  };
  const key = cardType.toLowerCase();
  return types[key]?.[locale] ?? types[key]?.en ?? cardType;
}
