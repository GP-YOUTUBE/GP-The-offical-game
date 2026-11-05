import React, { useState } from 'react';
import {
  Crosshair,
  Zap,
  Flame,
  Heart,
  Shield,
  RefreshCw,
  ChevronsUp,
  Sparkles,
  Check,
  Lock,
  X,
  ShoppingBag,
  User,
  ShieldAlert,
  Radiation,
  Gauge,
  Rocket,
  Trophy,
  Star,
  Layers,
} from 'lucide-react';
import { Achievement, CharacterSkin, ShopUpgrade, WeaponType } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { WEAPON_REGISTRY } from '../game/constants';

interface StoreModalProps {
  coins: number;
  upgrades: Record<string, number>;
  upgradeConfigs: ShopUpgrade[];
  skins: CharacterSkin[];
  activeSkinId: string;
  unlockedSkinIds: string[];
  equippedWeapon: WeaponType;
  unlockedWeapons: WeaponType[];
  achievements: Achievement[];
  onUpgrade: (upgradeId: string, cost: number) => void;
  onEquipSkin: (skinId: string) => void;
  onUnlockSkin: (skinId: string, cost: number) => void;
  onEquipWeapon: (weapon: WeaponType) => void;
  onUnlockWeapon: (weapon: WeaponType, cost: number) => void;
  onClaimAchievement: (achievementId: string, reward: number) => void;
  onClose: () => void;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  coins,
  upgrades,
  upgradeConfigs,
  skins,
  activeSkinId,
  unlockedSkinIds,
  equippedWeapon,
  unlockedWeapons,
  achievements,
  onUpgrade,
  onEquipSkin,
  onUnlockSkin,
  onEquipWeapon,
  onUnlockWeapon,
  onClaimAchievement,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'upgrades' | 'weapons' | 'skins' | 'achievements'>('upgrades');
  const [upgradeCategory, setUpgradeCategory] = useState<'all' | 'weapon' | 'defense' | 'mobility' | 'utility'>('all');
  const [previewSkinId, setPreviewSkinId] = useState<string>(activeSkinId);

  const getUpgradeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crosshair':
        return <Crosshair className="w-5 h-5 text-sky-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-red-400" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'RefreshCw':
        return <RefreshCw className="w-5 h-5 text-teal-400" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-purple-400" />;
      case 'ChevronsUp':
        return <ChevronsUp className="w-5 h-5 text-indigo-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-sky-400" />;
      case 'Radioactive':
      case 'Radiation':
        return <Radiation className="w-5 h-5 text-pink-400" />;
      default:
        return <Zap className="w-5 h-5 text-sky-400" />;
    }
  };

  const filteredUpgrades = upgradeConfigs.filter(u => {
    if (upgradeCategory === 'all') return true;
    return u.category === upgradeCategory;
  });

  const previewSkin = skins.find(s => s.id === previewSkinId) || skins[0];
  const unlockedBadgesCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded-2xl text-indigo-400 shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] tracking-tight flex items-center gap-2">
                <span>GP Armory & Blacksmith</span>
              </h2>
              <p className="text-xs text-slate-400">
                Unlock lethal sidearms, kinetic shield mods, and hero battle suits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Gold Pill Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/80 border border-amber-500/50 rounded-xl text-amber-300 font-mono text-sm font-bold shadow-md">
              <span className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-[10px] font-black">
                G
              </span>
              <span className="tabular-nums font-bold">{coins}</span>
            </div>

            <button
              onClick={() => {
                soundEngine.playSound('click');
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Armory [Esc]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 pt-2 gap-2 bg-slate-950/50 overflow-x-auto">
          <button
            onClick={() => {
              soundEngine.playSound('click');
              setActiveTab('upgrades');
            }}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'upgrades'
                ? 'text-sky-400 border-sky-400 bg-slate-800/90 shadow-sm'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Power Upgrades</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playSound('click');
              setActiveTab('weapons');
            }}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'weapons'
                ? 'text-sky-400 border-sky-400 bg-slate-800/90 shadow-sm'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Arsenal ({unlockedWeapons.length}/{Object.keys(WEAPON_REGISTRY).length})</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playSound('click');
              setActiveTab('skins');
            }}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'skins'
                ? 'text-sky-400 border-sky-400 bg-slate-800/90 shadow-sm'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Hero Wardrobe</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playSound('click');
              setActiveTab('achievements');
            }}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'achievements'
                ? 'text-amber-400 border-amber-400 bg-slate-800/90 shadow-sm'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Badges ({unlockedBadgesCount}/{achievements.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: UPGRADES */}
          {activeTab === 'upgrades' && (
            <div>
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl mb-4 border border-slate-800/80 overflow-x-auto">
                {(['all', 'weapon', 'defense', 'mobility', 'utility'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      soundEngine.playSound('click');
                      setUpgradeCategory(cat);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors whitespace-nowrap cursor-pointer ${
                      upgradeCategory === cat
                        ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredUpgrades.map(upg => {
                  const currentLevel = upgrades[upg.id] ?? upg.level;
                  const isMax = currentLevel >= upg.maxLevel;
                  const cost = Math.round(
                    upg.cost * Math.pow(upg.costMultiplier, currentLevel - (upg.level === 0 ? 0 : 1))
                  );
                  const canAfford = coins >= cost;

                  return (
                    <div
                      key={upg.id}
                      className="flex flex-col justify-between p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 hover:border-slate-600 transition-all shadow-md group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 shadow-inner group-hover:scale-105 transition-transform">
                              {getUpgradeIcon(upg.icon)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white font-['Outfit']">
                                {upg.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                TIER {currentLevel} OF {upg.maxLevel}
                              </div>
                            </div>
                          </div>

                          {/* Level Segment Indicator */}
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: upg.maxLevel }).map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-2.5 h-2 rounded-sm transition-all ${
                                  idx < currentLevel
                                    ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]'
                                    : 'bg-slate-900 border border-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                          {upg.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-700/60">
                        <div className="text-xs font-mono">
                          {!isMax ? (
                            <span className="text-amber-300 font-bold flex items-center gap-1 tabular-nums">
                              <span>Cost:</span> {cost} G
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> MASTERED
                            </span>
                          )}
                        </div>

                        <button
                          disabled={isMax || !canAfford}
                          onClick={() => {
                            if (!isMax && canAfford) {
                              soundEngine.playSound('gem');
                              onUpgrade(upg.id, cost);
                            }
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1 ${
                            isMax
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : canAfford
                              ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/25 active:scale-95'
                              : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                          }`}
                        >
                          {isMax ? 'MAXED' : canAfford ? 'UPGRADE' : 'NEED COINS'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: WEAPONS ARSENAL */}
          {activeTab === 'weapons' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(WEAPON_REGISTRY) as WeaponType[]).map(wId => {
                const weapon = WEAPON_REGISTRY[wId];
                const isUnlocked = unlockedWeapons.includes(wId) || weapon.cost === 0;
                const isEquipped = equippedWeapon === wId;
                const canAfford = coins >= weapon.cost;

                return (
                  <div
                    key={wId}
                    className={`flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                      isEquipped
                        ? 'bg-sky-950/40 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)] ring-1 ring-sky-400/50'
                        : 'bg-slate-800/70 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2.5">
                        <div
                          className="p-2.5 rounded-xl border flex items-center justify-center shadow-inner"
                          style={{ backgroundColor: `${weapon.color}25`, borderColor: weapon.color }}
                        >
                          {wId === 'plasma' && <Zap className="w-5 h-5 text-purple-400" />}
                          {wId === 'spread' && <Flame className="w-5 h-5 text-orange-400" />}
                          {wId === 'railgun' && <Gauge className="w-5 h-5 text-emerald-400" />}
                          {wId === 'missiles' && <Rocket className="w-5 h-5 text-rose-400" />}
                          {wId === 'blaster' && <Crosshair className="w-5 h-5 text-sky-400" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white font-['Outfit']">
                            {weapon.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            Power: {weapon.damageMultiplier}x · Velocity: {weapon.bulletSpeed}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                        {weapon.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-700/70">
                      <div className="text-xs font-mono">
                        {isUnlocked ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> In Inventory
                          </span>
                        ) : (
                          <span className="text-amber-300 font-bold tabular-nums">{weapon.cost} G</span>
                        )}
                      </div>

                      {isEquipped ? (
                        <div className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-400/50 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> EQUIPPED
                        </div>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => {
                            soundEngine.playSound('click');
                            onEquipWeapon(wId);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold font-mono transition-all cursor-pointer active:scale-95 shadow-sm"
                        >
                          EQUIP
                        </button>
                      ) : (
                        <button
                          disabled={!canAfford}
                          onClick={() => {
                            if (canAfford) {
                              soundEngine.playSound('achievement');
                              onUnlockWeapon(wId, weapon.cost);
                            }
                          }}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25 active:scale-95'
                              : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>UNLOCK</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: HERO WARDROBE (SKINS) */}
          {activeTab === 'skins' && (
            <div className="space-y-4">
              {/* Live Preview Display of Selected Skin */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-5">
                <div
                  className="w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center p-2 relative shadow-2xl overflow-hidden shrink-0"
                  style={{
                    backgroundColor: previewSkin.colors.shirt,
                    borderColor: previewSkin.colors.shield,
                  }}
                >
                  <div
                    className="w-10 h-5 rounded-t-xl mb-0.5 shadow-sm"
                    style={{ backgroundColor: previewSkin.colors.hair }}
                  />
                  <div className="w-9 h-4 bg-yellow-300 rounded-sm flex items-center justify-center gap-0.5">
                    <div className="w-2 h-2 border border-black rounded-sm bg-white" />
                    <div className="w-2 h-2 border border-black rounded-sm bg-white" />
                  </div>
                  <span
                    className="text-[8px] font-black font-['Outfit'] mt-0.5"
                    style={{ color: previewSkin.colors.emblem }}
                  >
                    GP
                  </span>
                </div>

                <div>
                  <div className="text-base font-bold text-white font-['Outfit']">
                    {previewSkin.name}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {previewSkin.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs font-mono text-slate-400">
                    <span>Aura:</span>
                    <div
                      className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                      style={{ backgroundColor: previewSkin.colors.shield }}
                      title="Kinetic Shield Aura"
                    />
                    <span>Trail:</span>
                    <div
                      className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                      style={{ backgroundColor: previewSkin.colors.trailColor }}
                      title="Jet Thruster Vapor Trail"
                    />
                  </div>
                </div>
              </div>

              {/* Grid of Skins */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {skins.map(skin => {
                  const isUnlocked = unlockedSkinIds.includes(skin.id) || skin.cost === 0;
                  const isEquipped = activeSkinId === skin.id;
                  const canAfford = coins >= skin.cost;

                  return (
                    <div
                      key={skin.id}
                      onClick={() => setPreviewSkinId(skin.id)}
                      className={`flex flex-col justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        previewSkinId === skin.id
                          ? 'border-sky-400/80 bg-slate-800/90'
                          : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-10 h-10 rounded-xl border flex flex-col items-center justify-center p-1 shrink-0"
                          style={{
                            backgroundColor: skin.colors.shirt,
                            borderColor: skin.colors.shield,
                          }}
                        >
                          <div
                            className="w-5 h-2.5 rounded-t-sm"
                            style={{ backgroundColor: skin.colors.hair }}
                          />
                          <div className="w-5 h-2 bg-yellow-300 rounded-sm" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white font-['Outfit']">
                            {skin.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                            {skin.description}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/70">
                        <span className="text-xs font-mono font-bold">
                          {isUnlocked ? (
                            <span className="text-slate-400 font-medium text-[11px]">Unlocked</span>
                          ) : (
                            <span className="text-amber-300 tabular-nums">{skin.cost} G</span>
                          )}
                        </span>

                        {isEquipped ? (
                          <span className="text-xs font-bold text-sky-400 flex items-center gap-1 font-mono">
                            <Check className="w-3.5 h-3.5" /> ACTIVE
                          </span>
                        ) : isUnlocked ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              soundEngine.playSound('click');
                              onEquipSkin(skin.id);
                            }}
                            className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold font-mono transition-all cursor-pointer active:scale-95"
                          >
                            EQUIP
                          </button>
                        ) : (
                          <button
                            disabled={!canAfford}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (canAfford) {
                                soundEngine.playSound('achievement');
                                onUnlockSkin(skin.id, skin.cost);
                              }
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1 ${
                              canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25 active:scale-95'
                                : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                            }`}
                          >
                            <Lock className="w-3 h-3" />
                            <span>UNLOCK</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: BADGES & TROPHIES */}
          {activeTab === 'achievements' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs font-mono text-amber-300">
                <span>TROPHY PROGRESSION</span>
                <span className="font-bold">{unlockedBadgesCount} / {achievements.length} BADGES CLAIMED</span>
              </div>

              {achievements.map(ach => (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    ach.unlocked
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                      : 'bg-slate-800/50 border-slate-700/60 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        ach.unlocked
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-600'
                      }`}
                    >
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                        <span>{ach.title}</span>
                        {ach.unlocked && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded-md font-semibold">
                            COMPLETED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{ach.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-amber-300 flex items-center justify-end gap-1 tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      +{ach.rewardCoins} G
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Earn gold by defeating monsters, parrying attacks, and clearing biomes</span>
          <button
            onClick={() => {
              soundEngine.playSound('click');
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium font-mono text-xs transition-colors cursor-pointer"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};
