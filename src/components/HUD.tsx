import React from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  Pause,
  ShoppingBag,
  Gamepad2,
  Zap,
  Flame,
  Crosshair,
  Gauge,
  Rocket,
  Shield,
  Monitor,
  Heart,
  Skull,
} from 'lucide-react';
import { BiomeType, Monster, WeaponType } from '../types/game';
import { WEAPON_REGISTRY } from '../game/constants';

interface HUDProps {
  level: number;
  deaths: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  coins: number;
  biome: BiomeType;
  boss: Monster | null;
  remainingMonsters?: number;
  comboCount: number;
  comboMultiplier: number;
  ultimateEnergy: number;
  maxUltimateEnergy: number;
  ultimateActive: boolean;
  equippedWeapon: WeaponType;
  unlockedWeapons: WeaponType[];
  crtFilter?: boolean;
  onToggleCrt?: () => void;
  onSelectWeapon: (w: WeaponType) => void;
  onTriggerUltimate: () => void;
  showTouchControls: boolean;
  onToggleTouchControls: () => void;
  onPause: () => void;
  onOpenStore: () => void;
  sfxMuted: boolean;
  musicMuted: boolean;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  deaths,
  hp,
  maxHp,
  shield,
  maxShield,
  coins,
  biome,
  boss,
  remainingMonsters = 0,
  comboCount,
  comboMultiplier,
  ultimateEnergy,
  maxUltimateEnergy,
  ultimateActive,
  equippedWeapon,
  unlockedWeapons,
  crtFilter = false,
  onToggleCrt,
  onSelectWeapon,
  onTriggerUltimate,
  showTouchControls,
  onToggleTouchControls,
  onPause,
  onOpenStore,
  sfxMuted,
  musicMuted,
  onToggleSfx,
  onToggleMusic,
}) => {
  const shieldPercent = Math.max(0, Math.min(100, (shield / maxShield) * 100));
  const ultPercent = Math.max(0, Math.min(100, (ultimateEnergy / maxUltimateEnergy) * 100));
  const isUltReady = ultPercent >= 100;

  const getWeaponIcon = (w: WeaponType) => {
    switch (w) {
      case 'plasma':
        return <Zap className="w-3.5 h-3.5 text-purple-400" />;
      case 'spread':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'railgun':
        return <Gauge className="w-3.5 h-3.5 text-emerald-400" />;
      case 'missiles':
        return <Rocket className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Crosshair className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  const getBiomeLabel = (b: BiomeType) => {
    switch (b) {
      case 'MOUNTAIN':
        return 'CRAG MOUNTAIN';
      case 'BEACH':
        return 'TROPICAL BEACH';
      case 'CITY':
        return 'NEON CYBER CITY';
      default:
        return b;
    }
  };

  const getComboPraise = (count: number) => {
    if (count >= 10) return 'GODLIKE!';
    if (count >= 7) return 'ULTRA!';
    if (count >= 5) return 'SAVAGE!';
    if (count >= 3) return 'AWESOME!';
    return 'NICE!';
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-2 sm:p-4 flex flex-col justify-between z-20">
      {/* Top Cockpit Header Bar */}
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        {/* Left Section: Hero Status Cockpit */}
        <div className="flex flex-col gap-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-2xl p-2.5 sm:p-3 pointer-events-auto shadow-2xl">
          {/* Header Row: Level + Biome + Deaths */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="font-bold text-sky-400 font-['Press_Start_2P'] text-[9px] sm:text-[10px] tracking-tight">
              LV {level}
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-amber-300 font-semibold uppercase tracking-wider text-[10px]">
              {getBiomeLabel(biome)}
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-rose-400 font-semibold text-[10px] tabular-nums">
              ☠️ {deaths}
            </span>
          </div>

          {/* Health Hearts */}
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              {Array.from({ length: maxHp }).map((_, idx) => {
                const filled = idx < hp;
                const isCritical = hp === 1 && filled;
                return (
                  <div
                    key={idx}
                    className={`relative w-4 h-4 rounded-md flex items-center justify-center transition-transform ${
                      filled
                        ? isCritical
                          ? 'animate-pulse scale-110 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.9)]'
                          : 'text-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]'
                        : 'text-slate-800'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${filled ? 'fill-rose-500' : 'fill-slate-800 stroke-slate-700'}`} />
                  </div>
                );
              })}
            </div>
            <span className="text-[10px] font-mono text-slate-400 tabular-nums font-semibold">
              {hp}/{maxHp} HP
            </span>
          </div>

          {/* Kinetic Shield Energy Gauge */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300">
              <span className="flex items-center gap-1 font-semibold">
                <Shield className="w-2.5 h-2.5 text-cyan-400" />
                SHIELD
              </span>
              <span className="tabular-nums font-bold">{Math.round(shield)}/{maxShield}</span>
            </div>
            <div className="w-32 sm:w-40 h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-950 p-[1px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-300 transition-all duration-75 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                style={{ width: `${shieldPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center Section: Boss Health Bar or Wave Threat Meter */}
        <div className="flex flex-col items-center gap-1 flex-1 max-w-xs sm:max-w-md mx-2">
          {boss ? (
            <div className="w-full bg-slate-950/90 backdrop-blur-md border border-rose-500/60 rounded-2xl p-2 sm:p-2.5 pointer-events-auto shadow-2xl">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-rose-400 font-bold font-['Press_Start_2P'] text-[9px] sm:text-[10px] tracking-wide flex items-center gap-1.5">
                  <Skull className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  <span>{boss.name || 'BOSS'}</span>
                  {boss.hp < boss.maxHp * 0.4 && (
                    <span className="text-amber-400 text-[8px] animate-bounce">[ENRAGED]</span>
                  )}
                </span>
                <span className="text-slate-300 text-[10px] tabular-nums font-bold">
                  {Math.max(0, boss.hp)} / {boss.maxHp}
                </span>
              </div>
              <div className="w-full h-2.5 sm:h-3 bg-slate-900 rounded-full overflow-hidden border border-rose-950 p-[1px]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-600 via-amber-500 to-red-400 transition-all duration-100 shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                  style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/70 border border-slate-800/80 backdrop-blur-md rounded-full px-3 py-1 font-mono text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>STAGE THREAT:</span>
              <span className="text-amber-300 font-bold tabular-nums">
                {remainingMonsters > 0 ? `${remainingMonsters} MONSTERS ACTIVE` : 'WAVE PURGED!'}
              </span>
            </div>
          )}

          {/* Dynamic Combo Multiplier Banner */}
          {comboCount > 1 && (
            <div className="bg-gradient-to-r from-amber-500/25 via-orange-500/25 to-rose-500/25 border border-amber-500/60 backdrop-blur-md rounded-xl px-3 py-1 flex items-center gap-2 animate-bounce shadow-xl shadow-orange-500/15">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-black font-['Press_Start_2P'] text-amber-300 tracking-wider">
                {getComboPraise(comboCount)} x{comboCount}
              </span>
              <span className="text-[10px] font-mono text-orange-200 font-bold tabular-nums">
                ({comboMultiplier.toFixed(1)}x COINS)
              </span>
            </div>
          )}
        </div>

        {/* Right Section: Gold, CRT, Sound & Settings Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Gold Coin Bank Counter */}
          <div className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-500/50 backdrop-blur-md rounded-xl px-2.5 py-1.5 text-amber-300 font-mono text-xs sm:text-sm font-bold shadow-lg">
            <span className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-[10px] font-black shadow-sm">
              G
            </span>
            <span className="tabular-nums font-bold">{coins}</span>
          </div>

          {/* Store / Armory Button */}
          <button
            onClick={onOpenStore}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer active:scale-95 shadow-md"
            title="Open Armory & Upgrades [S]"
          >
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline font-['Outfit'] font-bold">Armory</span>
          </button>

          {/* CRT Scanline Toggle */}
          {onToggleCrt && (
            <button
              onClick={onToggleCrt}
              className={`p-2 rounded-xl border transition-colors cursor-pointer active:scale-95 shadow-md ${
                crtFilter
                  ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-400'
              }`}
              title={crtFilter ? 'Disable CRT Scanlines' : 'Enable Retro CRT Scanlines'}
            >
              <Monitor className="w-4 h-4" />
            </button>
          )}

          {/* Touch Controls Toggle */}
          <button
            onClick={onToggleTouchControls}
            className={`p-2 rounded-xl border transition-colors cursor-pointer active:scale-95 shadow-md ${
              showTouchControls
                ? 'bg-sky-500/20 border-sky-400/60 text-sky-300'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-400'
            }`}
            title={showTouchControls ? 'Hide Touch Controls' : 'Show Touch Controls'}
          >
            <Gamepad2 className="w-4 h-4" />
          </button>

          {/* Audio Controls */}
          <button
            onClick={onToggleSfx}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition-colors cursor-pointer active:scale-95 shadow-md"
            title={sfxMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {sfxMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>

          <button
            onClick={onToggleMusic}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition-colors cursor-pointer active:scale-95 shadow-md"
            title={musicMuted ? 'Start Chiptune Music' : 'Mute Music'}
          >
            <Music className={`w-4 h-4 ${musicMuted ? 'text-slate-500' : 'text-purple-400'}`} />
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-mono text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-md"
            title="Pause Game [Esc]"
          >
            <Pause className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline font-mono">PAUSE</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar: Weapon Arsenal Selector & Ultimate Reactor Gauge */}
      <div className="flex items-end justify-between gap-3 pointer-events-auto">
        {/* Weapon Arsenal Strip with Hotkeys */}
        <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-2xl p-1.5 shadow-2xl">
          {unlockedWeapons.map((w, index) => {
            const isEquipped = equippedWeapon === w;
            const info = WEAPON_REGISTRY[w];
            return (
              <button
                key={w}
                onClick={() => onSelectWeapon(w)}
                className={`relative px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isEquipped
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 shadow-lg shadow-sky-500/25 scale-102 ring-1 ring-sky-300'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={`Equip ${info.name} [Hotkey: ${index + 1}]`}
              >
                <span className={`text-[9px] font-mono px-1 rounded ${isEquipped ? 'bg-slate-950/30 text-slate-900' : 'bg-slate-800 text-slate-500'}`}>
                  {index + 1}
                </span>
                {getWeaponIcon(w)}
                <span className="hidden md:inline font-['Outfit'] font-bold text-[11px] whitespace-nowrap">
                  {info.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Ultimate Overcharge Reactor */}
        <div className="flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-md border border-purple-900/60 rounded-2xl p-2 sm:p-2.5 shadow-2xl">
          <div className="flex flex-col gap-0.5 text-right font-mono">
            <span className="text-[9px] uppercase tracking-wider text-purple-300 font-bold flex items-center justify-end gap-1">
              <span>REACTOR [Q]</span>
              {isUltReady && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
            </span>
            <div className="w-24 sm:w-36 h-2 bg-slate-900 rounded-full overflow-hidden border border-purple-900/80 p-[1px]">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  isUltReady
                    ? 'bg-gradient-to-r from-purple-500 via-pink-400 to-amber-300 animate-pulse shadow-[0_0_10px_rgba(217,70,239,0.8)]'
                    : 'bg-gradient-to-r from-purple-700 to-indigo-500'
                }`}
                style={{ width: `${ultPercent}%` }}
              />
            </div>
          </div>

          <button
            disabled={!isUltReady || ultimateActive}
            onClick={onTriggerUltimate}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-black font-mono text-xs flex items-center gap-1.5 transition-all ${
              isUltReady
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 text-white shadow-[0_0_20px_rgba(217,70,239,0.9)] animate-bounce cursor-pointer active:scale-95 border border-purple-200'
                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-60'
            }`}
            title="Overcharge Ultimate Screen Wipe [Q]"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="whitespace-nowrap">{isUltReady ? 'DISCHARGE' : `${Math.round(ultPercent)}%`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
