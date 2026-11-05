import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { MenuScreen } from './components/MenuScreen';
import { StoreModal } from './components/StoreModal';
import { ACHIEVEMENTS_LIST, CHARACTER_SKINS, INITIAL_UPGRADES, STORAGE_KEY } from './game/constants';
import { CharacterSkin, GameSaveData, WeaponType } from './types/game';
import { soundEngine } from './audio/soundEngine';

export default function App() {
  const loadSaveData = (): GameSaveData => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          coins: typeof parsed.coins === 'number' ? parsed.coins : 0,
          highLevel: typeof parsed.highLevel === 'number' ? parsed.highLevel : 1,
          deaths: typeof parsed.deaths === 'number' ? parsed.deaths : 0,
          totalKills: typeof parsed.totalKills === 'number' ? parsed.totalKills : 0,
          maxCombo: typeof parsed.maxCombo === 'number' ? parsed.maxCombo : 0,
          activeSkin: parsed.activeSkin || 'classic',
          unlockedSkins: Array.isArray(parsed.unlockedSkins) ? parsed.unlockedSkins : ['classic'],
          equippedWeapon: parsed.equippedWeapon || 'blaster',
          unlockedWeapons: Array.isArray(parsed.unlockedWeapons) ? parsed.unlockedWeapons : ['blaster'],
          upgrades: parsed.upgrades || {},
          achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
          audioEnabled: parsed.audioEnabled ?? true,
          musicEnabled: parsed.musicEnabled ?? true,
          sfxVolume: parsed.sfxVolume ?? 0.5,
          musicVolume: parsed.musicVolume ?? 0.3,
        };
      }
    } catch {
      // Fallback
    }

    return {
      coins: 0,
      highLevel: 1,
      deaths: 0,
      totalKills: 0,
      maxCombo: 0,
      activeSkin: 'classic',
      unlockedSkins: ['classic'],
      equippedWeapon: 'blaster',
      unlockedWeapons: ['blaster'],
      upgrades: {
        blaster_damage: 1,
        fire_rate: 1,
        multi_shot: 1,
        max_hp: 1,
        shield_cap: 1,
        shield_regen: 1,
        shield_bash: 0,
        double_jump: 0,
        coin_magnet: 0,
        ultimate_booster: 0,
      },
      achievements: [],
      audioEnabled: true,
      musicEnabled: true,
      sfxVolume: 0.5,
      musicVolume: 0.3,
    };
  };

  const [saveData, setSaveData] = useState<GameSaveData>(loadSaveData);
  const [currentView, setCurrentView] = useState<'menu' | 'playing' | 'store'>('menu');
  const [startLevel, setStartLevel] = useState(1);
  const [sfxMuted, setSfxMuted] = useState(!saveData.audioEnabled);
  const [musicMuted, setMusicMuted] = useState(!saveData.musicEnabled);
  const [sfxVolume, setSfxVolume] = useState(saveData.sfxVolume);
  const [musicVolume, setMusicVolume] = useState(saveData.musicVolume);

  useEffect(() => {
    soundEngine.setSfxVolume(sfxVolume);
    soundEngine.setMusicVolume(musicVolume);
    if (sfxMuted) soundEngine.toggleSfx();
    if (musicMuted) soundEngine.toggleMusic();
  }, []);

  useEffect(() => {
    try {
      const dataToSave: GameSaveData = {
        ...saveData,
        audioEnabled: !sfxMuted,
        musicEnabled: !musicMuted,
        sfxVolume,
        musicVolume,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch {
      // Storage restricted
    }
  }, [saveData, sfxMuted, musicMuted, sfxVolume, musicVolume]);

  const activeSkin: CharacterSkin =
    CHARACTER_SKINS.find(s => s.id === saveData.activeSkin) || CHARACTER_SKINS[0];

  const handleUpdateCoins = (newCoins: number) => {
    setSaveData(prev => ({ ...prev, coins: Math.max(0, newCoins) }));
  };

  const handleAddCoins = (amount: number) => {
    setSaveData(prev => ({ ...prev, coins: Math.max(0, prev.coins + amount) }));
  };

  const handleUpdateDeaths = (newDeaths: number) => {
    setSaveData(prev => ({ ...prev, deaths: newDeaths }));
  };

  const handleUpdateHighLevel = (newHigh: number) => {
    setSaveData(prev => ({ ...prev, highLevel: Math.max(prev.highLevel, newHigh) }));
  };

  const handleIncrementKills = () => {
    setSaveData(prev => ({ ...prev, totalKills: prev.totalKills + 1 }));
  };

  const handleUpgradeItem = (upgradeId: string, cost: number) => {
    setSaveData(prev => {
      if (prev.coins < cost) return prev;
      const initialCfg = INITIAL_UPGRADES.find(u => u.id === upgradeId);
      const defaultLvl = initialCfg ? initialCfg.level : 0;
      const currentLvl = prev.upgrades[upgradeId] !== undefined ? prev.upgrades[upgradeId] : defaultLvl;

      return {
        ...prev,
        coins: prev.coins - cost,
        upgrades: {
          ...prev.upgrades,
          [upgradeId]: currentLvl + 1,
        },
      };
    });
  };

  const handleEquipSkin = (skinId: string) => {
    setSaveData(prev => ({ ...prev, activeSkin: skinId }));
  };

  const handleUnlockSkin = (skinId: string, cost: number) => {
    if (saveData.coins < cost) return;
    setSaveData(prev => ({
      ...prev,
      coins: prev.coins - cost,
      unlockedSkins: [...prev.unlockedSkins, skinId],
      activeSkin: skinId,
    }));
  };

  const handleEquipWeapon = (weapon: WeaponType) => {
    setSaveData(prev => ({ ...prev, equippedWeapon: weapon }));
  };

  const handleUnlockWeapon = (weapon: WeaponType, cost: number) => {
    if (saveData.coins < cost) return;
    setSaveData(prev => ({
      ...prev,
      coins: prev.coins - cost,
      unlockedWeapons: [...prev.unlockedWeapons, weapon],
      equippedWeapon: weapon,
    }));
  };

  const handleUnlockAchievement = (id: string, reward: number) => {
    setSaveData(prev => {
      if (prev.achievements.includes(id)) return prev;
      return {
        ...prev,
        coins: prev.coins + reward,
        achievements: [...prev.achievements, id],
      };
    });
  };

  const handleToggleSfx = () => {
    const unmuted = soundEngine.toggleSfx();
    setSfxMuted(!unmuted);
  };

  const handleToggleMusic = () => {
    const unmuted = soundEngine.toggleMusic();
    setMusicMuted(!unmuted);
  };

  const handleSfxVolume = (vol: number) => {
    setSfxVolume(vol);
    soundEngine.setSfxVolume(vol);
  };

  const handleMusicVolume = (vol: number) => {
    setMusicVolume(vol);
    soundEngine.setMusicVolume(vol);
  };

  const handleResetSave = () => {
    const defaultData: GameSaveData = {
      coins: 0,
      highLevel: 1,
      deaths: 0,
      totalKills: 0,
      maxCombo: 0,
      activeSkin: 'classic',
      unlockedSkins: ['classic'],
      equippedWeapon: 'blaster',
      unlockedWeapons: ['blaster'],
      upgrades: {
        blaster_damage: 1,
        fire_rate: 1,
        multi_shot: 1,
        max_hp: 1,
        shield_cap: 1,
        shield_regen: 1,
        shield_bash: 0,
        double_jump: 0,
        coin_magnet: 0,
        ultimate_booster: 0,
      },
      achievements: [],
      audioEnabled: true,
      musicEnabled: true,
      sfxVolume: 0.5,
      musicVolume: 0.3,
    };
    setSaveData(defaultData);
    localStorage.removeItem(STORAGE_KEY);
    soundEngine.playSound('enemy_kill');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#05060b] text-slate-100 flex flex-col font-sans select-none">
      {currentView === 'menu' && (
        <MenuScreen
          highLevel={saveData.highLevel}
          deaths={saveData.deaths}
          coins={saveData.coins}
          totalKills={saveData.totalKills}
          badgeCount={saveData.achievements.length}
          activeSkin={activeSkin}
          allSkins={CHARACTER_SKINS}
          unlockedSkinIds={saveData.unlockedSkins}
          onSelectSkin={handleEquipSkin}
          onStartGame={(chosenLevel?: number) => {
            if (chosenLevel) setStartLevel(chosenLevel);
            setCurrentView('playing');
          }}
          onOpenStore={() => setCurrentView('store')}
          sfxMuted={sfxMuted}
          musicMuted={musicMuted}
          onToggleSfx={handleToggleSfx}
          onToggleMusic={handleToggleMusic}
          onResetSave={handleResetSave}
        />
      )}

      {currentView === 'playing' && (
        <GameCanvas
          initialLevel={startLevel}
          coins={saveData.coins}
          deaths={saveData.deaths}
          highLevel={saveData.highLevel}
          totalKills={saveData.totalKills}
          upgrades={saveData.upgrades}
          activeSkinId={saveData.activeSkin}
          unlockedSkinIds={saveData.unlockedSkins}
          equippedWeapon={saveData.equippedWeapon}
          unlockedWeapons={saveData.unlockedWeapons}
          unlockedAchievements={saveData.achievements}
          sfxMuted={sfxMuted}
          musicMuted={musicMuted}
          sfxVolume={sfxVolume}
          musicVolume={musicVolume}
          onUpdateCoins={handleUpdateCoins}
          onAddCoins={handleAddCoins}
          onUpdateDeaths={handleUpdateDeaths}
          onUpdateHighLevel={handleUpdateHighLevel}
          onIncrementKills={handleIncrementKills}
          onUpgradeItem={handleUpgradeItem}
          onEquipSkin={handleEquipSkin}
          onUnlockSkin={handleUnlockSkin}
          onEquipWeapon={handleEquipWeapon}
          onUnlockWeapon={handleUnlockWeapon}
          onUnlockAchievement={handleUnlockAchievement}
          onToggleSfx={handleToggleSfx}
          onToggleMusic={handleToggleMusic}
          onSfxVolumeChange={handleSfxVolume}
          onMusicVolumeChange={handleMusicVolume}
          onReturnToMainMenu={() => setCurrentView('menu')}
        />
      )}

      {currentView === 'store' && (
        <div className="relative w-full h-full flex items-center justify-center bg-[#070913]">
          <StoreModal
            coins={saveData.coins}
            upgrades={saveData.upgrades}
            upgradeConfigs={INITIAL_UPGRADES}
            skins={CHARACTER_SKINS}
            activeSkinId={saveData.activeSkin}
            unlockedSkinIds={saveData.unlockedSkins}
            equippedWeapon={saveData.equippedWeapon}
            unlockedWeapons={saveData.unlockedWeapons}
            achievements={ACHIEVEMENTS_LIST.map(a => ({
              ...a,
              unlocked: saveData.achievements.includes(a.id),
            }))}
            onUpgrade={handleUpgradeItem}
            onEquipSkin={handleEquipSkin}
            onUnlockSkin={handleUnlockSkin}
            onEquipWeapon={handleEquipWeapon}
            onUnlockWeapon={handleUnlockWeapon}
            onClaimAchievement={handleUnlockAchievement}
            onClose={() => setCurrentView('menu')}
          />
        </div>
      )}
    </div>
  );
}
