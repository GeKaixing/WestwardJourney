import type { DescLine, DescSegment } from "./types";
import { DESC_MAX_WIDTH } from "./constants";

const ENERGY_ICON_RE = /^\{(\w+):energyIcons(?:\((\d*)\))?\}/;
const STAR_ICON_RE = /^\{(\w+):starIcons(?:\((\d*)\))?\}/;

interface RawToken {
  type: "text" | "energyIcon" | "starIcon" | "newline";
  text?: string;
  yellow?: boolean;
  green?: boolean;
  count?: number;
}

export function preprocessDescription(text: string, characterKey: string): string {
  let result = (text || "")
    .replace(/\n/g, "\n")
    .replace(/(\{singleStarIcon\})+/g, (match) => {
      const count = (match.match(/\{singleStarIcon\}/g) || []).length;
      return `{Stars:starIcons(${count})}`;
    })
    .replace(/\[gold\](.*?)\[\/gold\]/gi, "{$1}")
    .replace(/\[blue\]|\[\/blue\]|\[red\]|\[\/red\]/gi, "")
    .replace(/!D!|!M!|!B!|\[G\]|\[E\]/gi, "");

  if (characterKey !== "regent" && characterKey !== "colorless") {
    result = result.replace(/\{\w+:starIcons(?:\(\d*\))?\}/gi, "");
  }
  return result.trim() || " ";
}

function tokenizeDescription(text: string): RawToken[] {
  const tokens: RawToken[] = [];
  let yellow = false;
  let green = false;
  let buffer = "";
  let bufferType: "word" | "space" | null = null;

  const flush = () => {
    if (buffer && bufferType) {
      tokens.push({ type: "text", text: buffer, yellow, green });
      buffer = "";
      bufferType = null;
    }
  };

  let i = 0;
  while (i < text.length) {
    const ch = text[i]!;

    if (ch === "[") {
      const rest = text.slice(i);
      if (/^\[green\]/i.test(rest)) {
        flush();
        green = true;
        i += 7;
        continue;
      }
      if (/^\[\/green\]/i.test(rest)) {
        flush();
        green = false;
        i += 8;
        continue;
      }
    }

    if (ch === "{") {
      const rest = text.slice(i);
      const energyMatch = rest.match(ENERGY_ICON_RE);
      if (energyMatch) {
        flush();
        const count = energyMatch[2] ? Math.max(1, parseInt(energyMatch[2], 10)) : 1;
        tokens.push({ type: "energyIcon", count });
        i += energyMatch[0].length;
        continue;
      }
      const starMatch = rest.match(STAR_ICON_RE);
      if (starMatch) {
        flush();
        const count = starMatch[2] ? Math.max(1, parseInt(starMatch[2], 10)) : 1;
        tokens.push({ type: "starIcon", count });
        i += starMatch[0].length;
        continue;
      }
      flush();
      yellow = true;
      i += 1;
      continue;
    }

    if (ch === "}") {
      flush();
      yellow = false;
      i += 1;
      continue;
    }

    if (ch === "\n") {
      flush();
      tokens.push({ type: "newline" });
      i += 1;
      continue;
    }

    if (ch === " ") {
      if (bufferType !== "space") flush();
      bufferType = "space";
      buffer += ch;
      i += 1;
      continue;
    }

    if (bufferType !== "word") flush();
    bufferType = "word";
    buffer += ch;
    i += 1;
  }

  flush();
  return tokens;
}

function isIconSegment(seg: DescSegment): seg is Extract<DescSegment, { type: "energyIcon" | "starIcon" }> {
  return seg.type === "energyIcon" || seg.type === "starIcon";
}

export function measureSegment(ctx: CanvasRenderingContext2D, seg: DescSegment): number {
  if (isIconSegment(seg)) {
    if (seg.count >= 4) {
      return ctx.measureText(String(seg.count)).width + 28 + 2;
    }
    return 28 * seg.count + 2 * Math.max(0, seg.count - 1);
  }
  return ctx.measureText(seg.text).width;
}

export function wrapDescription(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth = DESC_MAX_WIDTH,
): DescLine[] {
  const tokens = tokenizeDescription(text);
  const lines: DescLine[] = [];
  let current: DescSegment[] = [];
  let currentWidth = 0;

  const flushLine = () => {
    if (current.length > 0) {
      lines.push({ segments: [...current] });
      current = [];
      currentWidth = 0;
    }
  };

  for (const token of tokens) {
    if (token.type === "newline") {
      flushLine();
      continue;
    }

    const segment: DescSegment =
      token.type === "energyIcon"
        ? { type: "energyIcon", count: token.count ?? 1 }
        : token.type === "starIcon"
          ? { type: "starIcon", count: token.count ?? 1 }
          : { type: "text", text: token.text ?? "", yellow: token.yellow, green: token.green };

    const width = measureSegment(ctx, segment);

    if (isIconSegment(segment) || width <= maxWidth) {
      if (currentWidth + width <= maxWidth || current.length === 0) {
        current.push(segment);
        currentWidth += width;
      } else {
        flushLine();
        current.push(segment);
        currentWidth = width;
      }
      continue;
    }

    const textSeg = segment as Extract<DescSegment, { type: "text" }>;
    let index = 0;
    while (index < textSeg.text.length) {
      let size = 1;
      let part = textSeg.text.slice(index, index + size);
      let partWidth = ctx.measureText(part).width;
      while (index + size < textSeg.text.length && partWidth <= maxWidth) {
        size += 1;
        part = textSeg.text.slice(index, index + size);
        partWidth = ctx.measureText(part).width;
      }
      if (partWidth > maxWidth && size > 1) {
        size -= 1;
        part = textSeg.text.slice(index, index + size);
        partWidth = ctx.measureText(part).width;
      }

      const piece: DescSegment = {
        type: "text",
        text: part,
        yellow: textSeg.yellow,
        green: textSeg.green,
      };
      if (currentWidth + partWidth <= maxWidth || current.length === 0) {
        current.push(piece);
        currentWidth += partWidth;
      } else {
        flushLine();
        current.push(piece);
        currentWidth = partWidth;
      }
      index += size;
    }
  }

  flushLine();
  return lines;
}
