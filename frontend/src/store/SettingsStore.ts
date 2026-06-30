import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ResolutionOption = "1920x1080" | "2560x1440" | "1280x720";
export type WindowMode = "windowed" | "fullscreen" | "borderless";
export type QualityPreset = "low" | "medium" | "high" | "ultra";
export type Language = "zh" | "en";

export interface SettingsState {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  resolution: ResolutionOption;
  windowMode: WindowMode;
  quality: QualityPreset;
  language: Language;
  showDamageNumbers: boolean;
  screenShake: boolean;
  speedMode: boolean;
  showHandCount: boolean;
  keyBindings: Record<string, string>;

  setMasterVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  setResolution: (v: ResolutionOption) => void;
  setWindowMode: (v: WindowMode) => void;
  setQuality: (v: QualityPreset) => void;
  setLanguage: (v: Language) => void;
  setShowDamageNumbers: (v: boolean) => void;
  setScreenShake: (v: boolean) => void;
  setSpeedMode: (v: boolean) => void;
  setShowHandCount: (v: boolean) => void;
  setKeyBinding: (action: string, key: string) => void;
  resetKeyBindings: () => void;
  resetToDefaults: () => void;
}

const DEFAULT_KEY_BINDINGS: Record<string, string> = {
  endTurn: "E",
  drawPile: "D",
  discardPile: "S",
  exhaustPile: "X",
  handSort: "Space",
  pause: "Escape",
};

const DEFAULTS = {
  masterVolume: 100,
  musicVolume: 100,
  sfxVolume: 100,
  resolution: "1920x1080" as ResolutionOption,
  windowMode: "windowed" as WindowMode,
  quality: "high" as QualityPreset,
  language: "zh" as Language,
  showDamageNumbers: true,
  screenShake: true,
  speedMode: false,
  showHandCount: true,
  keyBindings: { ...DEFAULT_KEY_BINDINGS },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      setMasterVolume: (v) => set({ masterVolume: v }),
      setMusicVolume: (v) => set({ musicVolume: v }),
      setSfxVolume: (v) => set({ sfxVolume: v }),
      setResolution: (v) => set({ resolution: v }),
      setWindowMode: (v) => set({ windowMode: v }),
      setQuality: (v) => set({ quality: v }),
      setLanguage: (v) => set({ language: v }),
      setShowDamageNumbers: (v) => set({ showDamageNumbers: v }),
      setScreenShake: (v) => set({ screenShake: v }),
      setSpeedMode: (v) => set({ speedMode: v }),
      setShowHandCount: (v) => set({ showHandCount: v }),
      setKeyBinding: (action, key) =>
        set((s) => ({ keyBindings: { ...s.keyBindings, [action]: key } })),
      resetKeyBindings: () => set({ keyBindings: { ...DEFAULT_KEY_BINDINGS } }),
      resetToDefaults: () => set({ ...DEFAULTS }),
    }),
    { name: "westward-journey-settings" },
  ),
);
