import { Routes, Route } from "react-router-dom";
import { TitleScene } from "./scenes/TitleScene";
import { CharacterSelectScene } from "./scenes/CharacterSelectScene";
import { MapScene } from "./scenes/MapScene";
import { BattleScene } from "./scenes/BattleScene";
import { RestScene } from "./scenes/RestScene";
import { RewardScene } from "./scenes/RewardScene";
import { ShopScene } from "./scenes/ShopScene";
import { EventScene } from "./scenes/EventScene";

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
      </Routes>
    </div>
  );
}
