import { useSettingsStore } from "../../store";
import { BGM_CONFIG, type Zone } from "./AudioConfig";

let audio: HTMLAudioElement | null = null;
let currentTrack = "";

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio();
    audio.loop = true;
  }
  return audio;
}

function getVolume(): number {
  const { masterVolume, musicVolume } = useSettingsStore.getState();
  return (masterVolume / 100) * (musicVolume / 100);
}

export function playBGM(src: string) {
  if (currentTrack === src) return;
  const a = getAudio();
  a.src = src;
  a.volume = getVolume();
  currentTrack = src;
  a.play().catch(() => {
    document.addEventListener("pointerdown", () => a.play().catch(() => {}), { once: true });
  });
}

export function stopBGM() {
  const a = getAudio();
  a.pause();
  a.currentTime = 0;
  currentTrack = "";
}

export function updateBGMVolume() {
  if (audio) audio.volume = getVolume();
}

export function playMainMenuBGM() {
  playBGM(BGM_CONFIG.mainMenu);
}

export function playShopBGM() {
  playBGM(BGM_CONFIG.shop);
}

export function playBattleBGM(zone: Zone, type: "normal" | "elite" | "boss") {
  const zoneConfig = BGM_CONFIG[zone];
  const tracks = zoneConfig[type];
  const track = tracks[Math.floor(Math.random() * tracks.length)];
  playBGM(track);
}
