import { Routes, Route } from "react-router-dom";
import { TitleScene } from "./scenes/TitleScene";
import { CharacterSelectScene } from "./scenes/CharacterSelectScene";
import { MapScene } from "./scenes/MapScene";
import { BattleScene } from "./scenes/BattleScene";
import { RestScene } from "./scenes/RestScene";
import { RewardScene } from "./scenes/RewardScene";
import { ShopScene } from "./scenes/ShopScene";
import { EventScene } from "./scenes/EventScene";
import { DiyCardScene } from "./scenes/DiyCardScene";
import { DeckScene } from "./scenes/DeckScene";
import { SettingsScene } from "./scenes/SettingsScene";
import { SpineBoyScene } from "./scenes/spine/SpineBoyScene";

export function App() {
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Routes>
        <Route path="/" element={<TitleScene />} />
        <Route path="/select" element={<CharacterSelectScene />} />
        <Route path="/map" element={<MapScene />} />
        <Route path="/battle" element={<BattleScene />} />
        <Route path="/rest" element={<RestScene />} />
        <Route path="/reward" element={<RewardScene />} />
        <Route path="/shop" element={<ShopScene />} />
        <Route path="/event" element={<EventScene />} />
        <Route path="/deck" element={<DeckScene />} />
        <Route path="/settings" element={<SettingsScene />} />
        <Route path="/tools/diy-card" element={<DiyCardScene />} />
        <Route path="/spine-demo" element={<SpineBoyScene />} />
      </Routes>
    </div>
  );
}
