import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Application } from "pixi.js";
import { FrameSequenceSprite } from "../../systems/sprites/FrameSequenceSprite";

interface ManifestAnim {
  anim: string;
  frames: number[];
}

interface ManifestChar {
  anims: ManifestAnim[];
}

type Manifest = Record<string, ManifestChar>;

type CharGroup = { label: string; prefix: string };

const GROUPS: CharGroup[] = [
  { label: "Boss", prefix: "bosspit" },
  { label: "Hero", prefix: "hero" },
  { label: "Monster", prefix: "monster" },
];

function charLabel(id: string): string {
  const map: Record<string, string> = {
    bosspit_evil_wizard: "邪恶巫师", bosspit_flag: "旗帜", bosspit_giant_plant: "巨植",
    bosspit_giant_plant_root: "巨植之根", bosspit_gold_colossus: "黄金巨像",
    hero_aquatic_man: "水人", hero_bardbarian: "吟游野蛮人", hero_bone_dragon: "骨龙",
    hero_brozerker: "狂战士", hero_brute_dragon: "暴龙", hero_catapult_knight: "投石骑士",
    hero_centaur: "半人马", hero_cyclops_wizard: "独眼法师", hero_dark_horse: "黑马",
    hero_demon_totem: "恶魔图腾", hero_dragon_lady: "龙女", hero_dragzilla: "龙斯拉",
    hero_druidinatrix: "德鲁伊女巫", hero_dwarven_archer: "矮人弓箭手", hero_electroyeti: "电雪人",
    hero_fairy_dragon: "仙龙", hero_faith_healer: "信仰治疗者", hero_frost_giant: "霜巨人",
    hero_genie: "精灵", hero_groovy_druid: "时髦德鲁伊", hero_magic_dragon: "魔龙",
    hero_medusa: "美杜莎", hero_minotaur: "牛头人", hero_ninja_dwarf: "忍者矮人",
    hero_orc_monk: "兽人武僧", hero_pirate: "海盗", hero_polemaster: "棍术大师",
    hero_rabid_dragon: "狂龙", hero_red_shaman: "红萨满", hero_roller_viking: "轮滑维京人",
    hero_sand_dragon: "沙龙", hero_satyr: "萨提尔", hero_savage_cutie: "野蛮甜心",
    hero_shadow_assassin: "暗影刺客", hero_skeleton_king: "骷髅王", hero_snake_dragon: "蛇龙",
    hero_sniper_wolf: "狙击狼", hero_spikey_dragon: "刺龙", hero_storm_dragon: "风暴龙",
    hero_unicorgi: "独角柯基", hero_vampire_dragon: "吸血鬼龙", hero_vulcan_elf: "火神精灵",
    hero_zombie_squire: "僵尸侍从",
    monster_archer_grunt: "弓箭兵", monster_archer_magic: "魔法弓箭手", monster_archer_phys: "物理弓箭手",
    monster_cauldron: "魔锅", monster_cloud: "云怪", monster_eyeball: "眼球怪",
    monster_goblin: "哥布林", monster_head_crab: "头蟹", monster_inferno_spider: "地狱蜘蛛",
    monster_kamikaze_gnome: "自爆侏儒", monster_magic_golem: "魔法傀儡", monster_magic_imp: "魔法小鬼",
    monster_man_eating_plant: "食人花", monster_mr_smashy: "粉碎先生", monster_mushroom: "蘑菇怪",
    monster_phys_golem: "物理傀儡", monster_phys_imp: "物理小鬼", monster_scarecrow: "稻草人",
    monster_skeleton_deer: "骷髅鹿", monster_sprite_buff: "增益精灵", monster_sprite_heal: "治疗精灵",
    monster_squid: "鱿鱼怪", monster_test_dummy: "测试假人", monster_troll_blob: "巨魔软泥",
    monster_wraith: "幽灵",
  };
  return map[id] ?? id;
}

export function FrameDemoScene() {
  const pixiRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<FrameSequenceSprite | null>(null);
  const [manifest, setManifest] = useState<Manifest>({});
  const [charId, setCharId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnim, setCurrentAnim] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/assets/sprites/frame-sequences/manifest.json")
      .then((r) => r.json())
      .then((m: Manifest) => {
        setManifest(m);
        const keys = Object.keys(m).sort();
        if (keys.length > 0) setCharId(keys[0]!);
      })
      .catch(() => setError("加载 manifest 失败"));
  }, []);

  const groupedChars = useMemo(() => {
    const ids = Object.keys(manifest).sort();
    const q = search.toLowerCase();
    const filtered = q ? ids.filter((id) => id.includes(q) || charLabel(id).includes(q)) : ids;
    return GROUPS.map((g) => ({
      ...g,
      chars: filtered.filter((id) => id.startsWith(g.prefix)),
    })).filter((g) => g.chars.length > 0);
  }, [manifest, search]);

  useEffect(() => {
    if (!pixiRef.current || !charId) return;
    const el = pixiRef.current;
    let destroyed = false;
    let app: Application | undefined;

    const run = async () => {
      setLoading(true);
      setError(null);
      setCurrentAnim("");

      app = new Application();
      try {
        await app.init({
          width: el.clientWidth,
          height: el.clientHeight,
          background: "#1a1a2e",
          antialias: true,
          autoStart: false,
        });
      } catch (e) {
        if (!destroyed) setError(String(e));
        return;
      }
      if (destroyed) return;

      el.appendChild(app.canvas);
      app.start();

      const seq = new FrameSequenceSprite();
      seqRef.current = seq;
      seq.onComplete = () => {
        setCurrentAnim("");
        if (!destroyed) seq.play("idle", true);
      };

      try {
        await seq.load(charId);
        if (destroyed) return;
        app.stage.addChild(seq.displayContainer);
        seq.displayContainer.x = app.screen.width / 2;
        seq.displayContainer.y = app.screen.height / 2 - 40;
        seq.play("idle", true);
        setCurrentAnim("idle");
      } catch (e) {
        if (!destroyed) setError(String(e));
      }
      setLoading(false);
    };

    run();

    return () => {
      destroyed = true;
      if (seqRef.current) {
        seqRef.current.destroy();
        seqRef.current = null;
      }
      if (app) {
        try { app.destroy({ removeView: true }, { children: true, texture: true }); } catch { /* ResizePlugin bug */ }
      }
    };
  }, [charId]);

  const handlePlay = (anim: string) => {
    const seq = seqRef.current;
    if (!seq) return;
    const loop = anim === "idle" || anim === "walk" || anim === "victory";
    seq.play(anim, loop);
    setCurrentAnim(anim);
  };

  return (
    <div className="flex h-screen flex-col bg-[#1a1a2e] text-gray-200">
      <div className="flex items-center gap-4 border-b border-gray-700 px-6 py-3">
        <h1 className="font-display text-xl font-bold text-purple-400">帧序列动画 Demo</h1>
        <span className="text-xs text-gray-500">{Object.keys(manifest).length} 个角色</span>
        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/spine-demo"
            className="text-sm text-purple-400 underline hover:text-purple-300 transition-colors"
          >
            Spine 动画 Demo →
          </Link>
          <Link
            to="/"
            className="text-sm text-gray-400 underline hover:text-gray-200"
          >
            返回首页
          </Link>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 overflow-y-auto border-r border-gray-700">
          <div className="sticky top-0 bg-[#1a1a2e] p-3">
            <input
              type="text"
              placeholder="搜索角色..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded bg-gray-800 px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div className="px-3 pb-3">
            {groupedChars.map((g) => (
              <div key={g.prefix} className="mb-3">
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{g.label} ({g.chars.length})</h3>
                <div className="flex flex-col gap-0.5">
                  {g.chars.map((id) => (
                    <button
                      key={id}
                      onClick={() => setCharId(id)}
                      className={`rounded px-3 py-1.5 text-left text-xs transition-colors ${
                        charId === id
                          ? "bg-purple-800 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                      }`}
                    >
                      <span className="block truncate">{charLabel(id)}</span>
                      <span className="block truncate text-[10px] text-gray-600">{id}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {groupedChars.length === 0 && (
              <p className="mt-4 text-center text-xs text-gray-500">无匹配</p>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <div ref={pixiRef} className="flex-1" />
          <div className="flex items-center gap-3 border-t border-gray-700 px-6 py-2 text-xs text-gray-500">
            {loading && <span className="text-yellow-400">加载中...</span>}
            {error && <span className="text-red-400">错误: {error}</span>}
            {currentAnim && <span>当前动画: <span className="font-bold text-purple-300">{currentAnim}</span></span>}
          </div>
        </div>
        <div className="w-56 overflow-y-auto border-l border-gray-700 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">动画</h2>
          <div className="flex flex-col gap-1">
            {Object.entries(manifest[charId] ?? {}).map(([anim, frames]) => {
              const isCurrent = currentAnim === anim;
              return (
                <button
                  key={anim}
                  onClick={() => handlePlay(anim)}
                  className={`rounded px-3 py-2 text-left text-sm transition-colors ${
                    isCurrent
                      ? "bg-purple-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  }`}
                >
                  {anim} <span className="text-[10px] text-gray-600">({frames.length}帧)</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-gray-600">
            idle / walk / victory = 循环<br />其他 = 播放一次后返回 idle
          </p>
        </div>
      </div>
    </div>
  );
}
