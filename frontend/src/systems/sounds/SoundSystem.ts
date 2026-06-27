let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function vol(v: number) {
  return v * (useSettingsStore.getState().sfxVolume / 100);
}

import { useSettingsStore } from "../../store";

export function toggleMute(val?: boolean) {
  muted = val ?? !muted;
}

function osc(freq: number, dur: number, type: OscillatorType, v: number) {
  const audio = getCtx();
  if (muted || v === 0) return;
  const o = audio.createOscillator();
  const g = audio.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol(v), audio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + dur);
  o.connect(g).connect(audio.destination);
  o.start();
  o.stop(audio.currentTime + dur);
}

function noise(type: "white" | "pink", dur: number, filterFreq: number, v: number) {
  const audio = getCtx();
  if (muted || v === 0) return;
  const sr = audio.sampleRate;
  const len = sr * dur;
  const buf = audio.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  if (type === "pink") {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    }
  } else {
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = audio.createBufferSource();
  src.buffer = buf;
  const f = audio.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = filterFreq;
  f.Q.value = 1;
  const g = audio.createGain();
  g.gain.setValueAtTime(vol(v), audio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + dur);
  src.connect(f).connect(g).connect(audio.destination);
  src.start();
}

export function init() { getCtx(); return Promise.resolve(); }

export const playCard = () => osc(207.65, 0.0625, "square", 0.3);
export const selectCard = () => { osc(261.63, 0.125, "sine", 0.1); };
export const cardToHand = () => noise("pink", 0.1, 1000, 0.3);
export const startTurn = () => noise("pink", 0.3, 800, 0.5);
export const endTurn = () => noise("pink", 0.3, 400, 0.3);
export const startGame = () => { for (const f of [207.65, 293.66, 440, 523.25]) osc(f, 0.25, "sine", 0.03); };
export const playCoin = () => [523.25, 659.25, 783.99, 880, 1046.5].forEach((f, i) => setTimeout(() => osc(f, 0.1, "triangle", 0.5), i * 100));
export const buttonClick = () => osc(880, 0.05, "sine", 0.08);
export const heal = () => [440, 554.37, 659.25].forEach((f, i) => setTimeout(() => osc(f, 0.2, "sine", 0.15), i * 120));
export const upgrade = () => { osc(523.25, 0.3, "triangle", 0.2); setTimeout(() => osc(783.99, 0.4, "triangle", 0.2), 150); };
export const pageEnter = () => noise("pink", 0.2, 600, 0.2);
