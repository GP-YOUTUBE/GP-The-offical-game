import React, { useState } from 'react';
import {
  Play,
  ShoppingBag,
  HelpCircle,
  Volume2,
  VolumeX,
  Music,
  Trophy,
  Shield,
  Crosshair,
  ChevronLeft,
  ChevronRight,
  Zap,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { CharacterSkin } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface MenuScreenProps {
  highLevel: number;
  deaths: number;
  coins: number;
  totalKills: number;
  badgeCount: number;
  activeSkin: CharacterSkin;
  allSkins?: CharacterSkin[];
  unlockedSkinIds?: string[];
  onSelectSkin?: (skinId: string) => void;
  onStartGame: (startLevel?: number) => void;
  onOpenStore: () => void;
  sfxMuted: boolean;
  musicMuted: boolean;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  onResetSave: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  highLevel,
  deaths,
  coins,
  totalKills,
  badgeCount,
  activeSkin,
  allSkins = [],
  unlockedSkinIds = ['classic'],
  onSelectSkin,
  onStartGame,
  onOpenStore,
  sfxMuted,
  musicMuted,
  onToggleSfx,
  onToggleMusic,
  onResetSave,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedStartLevel, setSelectedStartLevel] = useState(1);

  // Calculate checkpoints: Level 1, and every 3rd level up to highLevel
  const checkpoints = [1];
  for (let l = 4; l <= highLevel; l += 3) {
    checkpoints.push(l);
  }

  // Skin cycling
  const currentSkinIndex = allSkins.findIndex(s => s.id === activeSkin.id);
  const handlePrevSkin = () => {
    if (allSkins.length === 0 || !onSelectSkin) return;
    const prevIdx = (currentSkinIndex - 1 + allSkins.length) % allSkins.length;
    const targetSkin = allSkins[prevIdx];
    if (unlockedSkinIds.includes(targetSkin.id)) {
      soundEngine.playSound('click');
      onSelectSkin(targetSkin.id);
    }
  };

  const handleNextSkin = () => {
    if (allSkins.length === 0 || !onSelectSkin) return;
    const nextIdx = (currentSkinIndex + 1) % allSkins.length;
    const targetSkin = allSkins[nextIdx];
    if (unlockedSkinIds.includes(targetSkin.id)) {
      soundEngine.playSound('click');
      onSelectSkin(targetSkin.id);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#070914] via-[#0b1022] to-[#04050a] overflow-y-auto">
      {/* Background Retro Grid & Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/25 via-transparent to-transparent pointer-events-none" />
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center my-auto py-4">
        {/* Title Logo */}
        <div className="mb-4 sm:mb-5">
          <div className="inline-block text-[10px] font-mono font-bold tracking-[0.25em] text-cyan-400 uppercase mb-1">
            ARCADE PLATFORM SHOOTER
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-200 to-cyan-400 font-['Press_Start_2P'] tracking-wider leading-relaxed drop-shadow-[0_4px_12px_rgba(249,115,22,0.4)]">
            GP: INFINITY
          </h1>
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400 mt-1">
            <span>BLASTER</span>
            <span className="text-slate-700">·</span>
            <span>KINETIC SHIELD</span>
            <span className="text-slate-700">·</span>
            <span>OVERCHARGE</span>
          </div>
        </div>

        {/* Hero Sprite Display & Skin Switcher */}
        <div className="relative mb-5 flex flex-col items-center">
          <div className="relative flex items-center gap-4">
            {allSkins.length > 1 && onSelectSkin && (
              <button
                onClick={handlePrevSkin}
                className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                title="Previous Unlocked Skin"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Hero Character Box */}
            <div
              className="group cursor-pointer relative"
              onClick={() => soundEngine.playSound('shield_deflect')}
              title="Click GP to activate shield aura!"
            >
              <div
                className="absolute -inset-2 rounded-3xl blur-md opacity-40 group-hover:opacity-80 transition duration-500 animate-pulse"
                style={{
                  background: `linear-gradient(45deg, ${activeSkin.colors.hair}, ${activeSkin.colors.shield})`,
                }}
              />
              <div className="relative w-28 h-28 rounded-2xl bg-slate-900/90 border-2 border-slate-700/90 flex flex-col items-center justify-center shadow-2xl overflow-hidden p-2 backdrop-blur-md">
                {/* Hair */}
                <div
                  className="w-14 h-7 rounded-t-2xl relative shadow-sm"
                  style={{ backgroundColor: activeSkin.colors.hair }}
                >
                  <div
                    className="absolute -top-1 left-2 w-4 h-3 rounded-full"
                    style={{ backgroundColor: activeSkin.colors.hair }}
                  />
                  <div
                    className="absolute -top-1.5 left-5 w-4 h-3.5 rounded-full"
                    style={{ backgroundColor: activeSkin.colors.hair }}
                  />
                  <div
                    className="absolute -top-1 left-8 w-4 h-3 rounded-full"
                    style={{ backgroundColor: activeSkin.colors.hair }}
                  />
                </div>

                {/* Face & Specs */}
                <div className="w-12 h-6 bg-yellow-300 flex items-center justify-center gap-1 relative">
                  <div className="w-3.5 h-3.5 border-2 border-black rounded-sm bg-white/95 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  </div>
                  <div className="w-1 h-0.5 bg-black" />
                  <div className="w-3.5 h-3.5 border-2 border-black rounded-sm bg-white/95 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  </div>
                </div>

                {/* Shirt & Emblem */}
                <div
                  className="w-12 h-8 rounded-b-md flex items-center justify-center relative shadow-inner"
                  style={{ backgroundColor: activeSkin.colors.shirt }}
                >
                  <span
                    className="text-xs font-black font-['Outfit']"
                    style={{ color: activeSkin.colors.emblem }}
                  >
                    GP
                  </span>
                  {/* Blaster */}
                  <div className="absolute -right-2.5 top-1.5 w-3.5 h-2 bg-slate-400 rounded-sm shadow-sm" />
                </div>

                {/* Shield Ring Effect */}
                <div
                  className="absolute inset-0 rounded-2xl border-2 pointer-events-none opacity-60 transition-colors"
                  style={{ borderColor: activeSkin.colors.shield }}
                />
              </div>
            </div>

            {allSkins.length > 1 && onSelectSkin && (
              <button
                onClick={handleNextSkin}
                className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                title="Next Unlocked Skin"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="mt-2 text-xs font-mono text-slate-400">
            HERO SUIT: <span className="text-sky-300 font-bold">{activeSkin.name}</span>
          </div>
        </div>

        {/* Checkpoint Level Selector if reached Lv 4+ */}
        {checkpoints.length > 1 && (
          <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 mb-4 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-semibold">START CHECKPOINT:</span>
            <div className="flex items-center gap-1.5">
              {checkpoints.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => {
                    soundEngine.playSound('click');
                    setSelectedStartLevel(lvl);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedStartLevel === lvl
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  LV {lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="w-full space-y-3 mb-5">
          {/* PLAY BUTTON (Vibrant Emerald) */}
          <button
            onClick={() => {
              soundEngine.playSound('jump');
              onStartGame(selectedStartLevel);
            }}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-400 text-white font-black font-mono text-base tracking-wider transition-all shadow-xl shadow-emerald-950/60 hover:shadow-emerald-500/30 active:scale-98 flex items-center justify-center gap-3 cursor-pointer border border-emerald-400/50 group"
          >
            <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
            <span>PLAY GP: INFINITY</span>
          </button>

          {/* STORE & ARMORY BUTTON (Indigo / Blue) */}
          <button
            onClick={() => {
              soundEngine.playSound('click');
              onOpenStore();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-700 hover:from-indigo-600 hover:to-blue-500 text-white font-bold font-mono text-sm tracking-wide transition-all shadow-lg shadow-indigo-950/50 hover:shadow-indigo-500/25 active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer border border-indigo-400/40"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-300" />
            <span>ARMORY & BLACKSMITH ({coins} GOLD)</span>
          </button>

          {/* HOW TO PLAY BUTTON (Tactical Slate) */}
          <button
            onClick={() => {
              soundEngine.playSound('click');
              setShowHelp(true);
            }}
            className="w-full py-2.5 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-semibold font-mono text-xs tracking-wide transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-slate-700/80 shadow-md"
          >
            <HelpCircle className="w-4 h-4 text-rose-400" />
            <span>MISSION BRIEFING & CONTROLS</span>
          </button>
        </div>

        {/* Telemetry Stat Strip */}
        <div className="w-full bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 flex items-center justify-around font-mono text-xs mb-4 shadow-xl">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" /> Best
            </span>
            <span className="font-bold text-sky-400 text-sm tabular-nums">LV {highLevel}</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 uppercase">Monsters</span>
            <span className="font-bold text-rose-400 text-sm tabular-nums">⚔️ {totalKills}</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 uppercase">Badges</span>
            <span className="font-bold text-amber-300 text-sm tabular-nums">🏆 {badgeCount}/10</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 uppercase">Gold Bank</span>
            <span className="font-bold text-amber-400 text-sm tabular-nums">{coins} G</span>
          </div>
        </div>

        {/* Bottom Audio Controls & Reset */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <button
            onClick={onToggleSfx}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            {sfxMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
            <span className="font-mono text-[11px]">SFX: {sfxMuted ? 'OFF' : 'ON'}</span>
          </button>

          <button
            onClick={onToggleMusic}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <Music className={`w-3.5 h-3.5 ${musicMuted ? 'text-slate-500' : 'text-purple-400'}`} />
            <span className="font-mono text-[11px]">Music: {musicMuted ? 'OFF' : 'ON'}</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-[11px] text-slate-500 hover:text-rose-400 underline cursor-pointer ml-1"
          >
            Reset
          </button>
        </div>
      </div>

      {/* How To Play & Controls Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 text-left shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-sky-400" />
                HOW TO PLAY GP: INFINITY
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              {/* Keyboard Controls Grid */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="font-bold text-sky-300 mb-2 flex items-center gap-1.5 text-xs font-['Outfit']">
                  <Crosshair className="w-4 h-4 text-sky-400" /> Desktop Keybindings:
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-amber-300 font-bold">A / D or ◀ / ▶</span>
                    <div className="text-slate-400 text-[10px]">Move GP Left / Right</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-emerald-300 font-bold">W / Space or ▲</span>
                    <div className="text-slate-400 text-[10px]">Jump / Double Jump</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-rose-300 font-bold">J or Z or Left Click</span>
                    <div className="text-slate-400 text-[10px]">Fire Equipped Weapon</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-cyan-300 font-bold">K or X or Right Click</span>
                    <div className="text-slate-400 text-[10px]">Hold Shield / Parry</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-purple-300 font-bold">Q or ULT Button</span>
                    <div className="text-slate-400 text-[10px]">Screen-Clearing Ultimate</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-sky-300 font-bold">1 - 5 or Tab</span>
                    <div className="text-slate-400 text-[10px]">Quick-Swap Guns</div>
                  </div>
                </div>
              </div>

              {/* Combat Mechanics Card */}
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50">
                <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5 text-xs font-['Outfit']">
                  <Shield className="w-4 h-4 text-cyan-400" /> Perfect Parry & Projectile Reflection:
                </div>
                <p className="text-slate-300">
                  Hold your shield to block enemy bullets. If you tap shield <strong>right as the bullet touches GP</strong>, you perform a <strong className="text-cyan-300">PERFECT PARRY</strong> which reflects the projectile directly back into enemies for massive counter damage!
                </p>
              </div>

              {/* Overcharge Card */}
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/50">
                <div className="font-bold text-purple-300 mb-1 flex items-center gap-1.5 text-xs font-['Outfit']">
                  <Zap className="w-4 h-4 text-purple-400" /> Overcharge Ultimate:
                </div>
                <p className="text-slate-300">
                  Landing hits and deflecting attacks fills your Overcharge Reactor. When it reaches 100%, press <strong className="text-purple-300">[Q]</strong> or the discharge button to vaporize all standard monsters on screen!
                </p>
              </div>

              {/* Progression Card */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50">
                <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5 text-xs font-['Outfit']">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Biomes, Bosses & Blacksmith:
                </div>
                <p className="text-slate-300">
                  Battle through Mountains, Tropical Beaches, and Cyber City. Every 3rd level features an Elite Boss. Collect gold coins and gems to buy the Piercing Railgun, Homing Rockets, and stylish hero armor!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold font-mono text-xs cursor-pointer shadow-lg active:scale-98 transition-all"
            >
              READY TO BATTLE!
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/50 rounded-2xl p-5 text-center shadow-2xl">
            <h4 className="text-sm font-bold text-rose-400 font-mono mb-2">
              RESET SAVE DATA?
            </h4>
            <p className="text-xs text-slate-300 mb-5">
              This will reset all your coins, unlocked weapons, and upgrades back to baseline.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetSave();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
