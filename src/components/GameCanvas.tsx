import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  BiomeType,
  BreakableCrate,
  Bullet,
  CharacterSkin,
  EnemyBullet,
  FloatingText,
  GameState,
  LootDrop,
  Monster,
  Particle,
  Platform,
  PlayerStats,
  SpringPad,
  WeaponType,
} from '../types/game';
import {
  ACHIEVEMENTS_LIST,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CHARACTER_SKINS,
  INITIAL_UPGRADES,
  WEAPON_REGISTRY,
} from '../game/constants';
import { GameRenderer } from '../game/renderer';
import {
  calculateUpgradedPlayerStats,
  checkAABB,
  createBloodParticles,
  createMonstersForLevel,
  createPlatformsForLevel,
  getBiomeForLevel,
} from '../game/physics';
import { soundEngine } from '../audio/soundEngine';
import { HUD } from './HUD';
import { TouchControls } from './TouchControls';
import { PauseModal } from './PauseModal';
import { StoreModal } from './StoreModal';
import { GameOverModal } from './GameOverModal';

interface GameCanvasProps {
  initialLevel?: number;
  coins: number;
  deaths: number;
  highLevel: number;
  totalKills: number;
  upgrades: Record<string, number>;
  activeSkinId: string;
  unlockedSkinIds: string[];
  equippedWeapon: WeaponType;
  unlockedWeapons: WeaponType[];
  unlockedAchievements: string[];
  sfxMuted: boolean;
  musicMuted: boolean;
  sfxVolume: number;
  musicVolume: number;
  onUpdateCoins: (newCoins: number) => void;
  onAddCoins: (amount: number) => void;
  onUpdateDeaths: (newDeaths: number) => void;
  onUpdateHighLevel: (newHigh: number) => void;
  onIncrementKills: () => void;
  onUpgradeItem: (upgradeId: string, cost: number) => void;
  onEquipSkin: (skinId: string) => void;
  onUnlockSkin: (skinId: string, cost: number) => void;
  onEquipWeapon: (w: WeaponType) => void;
  onUnlockWeapon: (w: WeaponType, cost: number) => void;
  onUnlockAchievement: (id: string, reward: number) => void;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  onSfxVolumeChange: (vol: number) => void;
  onMusicVolumeChange: (vol: number) => void;
  onReturnToMainMenu: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  initialLevel = 1,
  coins,
  deaths,
  highLevel,
  totalKills,
  upgrades,
  activeSkinId,
  unlockedSkinIds,
  equippedWeapon,
  unlockedWeapons,
  unlockedAchievements,
  sfxMuted,
  musicMuted,
  sfxVolume,
  musicVolume,
  onUpdateCoins,
  onAddCoins,
  onUpdateDeaths,
  onUpdateHighLevel,
  onIncrementKills,
  onUpgradeItem,
  onEquipSkin,
  onUnlockSkin,
  onEquipWeapon,
  onUnlockWeapon,
  onUnlockAchievement,
  onToggleSfx,
  onToggleMusic,
  onSfxVolumeChange,
  onMusicVolumeChange,
  onReturnToMainMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [level, setLevel] = useState(initialLevel);
  const [currentBiome, setCurrentBiome] = useState<BiomeType>(getBiomeForLevel(initialLevel));
  const [levelClearBanner, setLevelClearBanner] = useState(false);
  const [bossIntroBanner, setBossIntroBanner] = useState<string | null>(null);
  const [screenShake, setScreenShake] = useState(0);
  const [crtEnabled, setCrtEnabled] = useState(false);

  // Combos & Multipliers
  const [comboCount, setComboCount] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const comboTimerRef = useRef(0);
  const totalParriesRef = useRef(0);

  const isDyingRef = useRef(false);
  const isAdvancingRef = useRef(false);

  const activeSkin = CHARACTER_SKINS.find(s => s.id === activeSkinId) || CHARACTER_SKINS[0];
  const calculatedStats = calculateUpgradedPlayerStats(upgrades, equippedWeapon);

  // Player State
  const playerRef = useRef<PlayerStats>({
    x: 80,
    y: 200,
    w: 30,
    h: 46,
    vx: 0,
    vy: 0,
    speed: 3.8,
    jumpPower: -8.8,
    grounded: false,
    facing: 'right',
    hp: calculatedStats.maxHp,
    maxHp: calculatedStats.maxHp,
    shield: calculatedStats.maxShield,
    maxShield: calculatedStats.maxShield,
    shieldActive: false,
    shieldParryTimer: 0,
    shieldBashCooldown: 0,
    isBashing: false,
    shootTimer: 0,
    animFrame: 0,
    animTimer: 0,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    hasDoubleJump: calculatedStats.hasDoubleJump,
    canDoubleJump: true,
    isInvulnerable: false,
    invulnerableTimer: 0,
    chargeTime: 0,
    ultimateEnergy: 0,
    maxUltimateEnergy: 100,
    ultimateActive: false,
    ultimateTimer: 0,
    equippedWeapon,
    unlockedWeapons,
  });

  // Entities Refs
  const platformsRef = useRef<Platform[]>([]);
  const springsRef = useRef<SpringPad[]>([]);
  const cratesRef = useRef<BreakableCrate[]>([]);
  const monstersRef = useRef<Monster[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const enemyBulletsRef = useRef<EnemyBullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const lootRef = useRef<LootDrop[]>([]);
  const timeOfDayRef = useRef<number>(0.15);

  // Key Inputs
  const keysRef = useRef<{
    left: boolean;
    right: boolean;
    jump: boolean;
    shoot: boolean;
    shield: boolean;
  }>({
    left: false,
    right: false,
    jump: false,
    shoot: false,
    shield: false,
  });

  const [touchKeys, setTouchKeys] = useState(keysRef.current);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024;
    }
    return false;
  });

  // Track dynamic weapon and stat changes
  useEffect(() => {
    const p = playerRef.current;
    p.equippedWeapon = equippedWeapon;
    p.unlockedWeapons = unlockedWeapons;
  }, [equippedWeapon, unlockedWeapons]);

  useEffect(() => {
    const stats = calculateUpgradedPlayerStats(upgrades, equippedWeapon);
    const p = playerRef.current;
    p.maxHp = stats.maxHp;
    p.hp = Math.min(p.hp, stats.maxHp);
    p.maxShield = stats.maxShield;
    p.hasDoubleJump = stats.hasDoubleJump;
  }, [upgrades, equippedWeapon]);

  // Achievement Check Helper
  const checkAchievement = useCallback((id: string) => {
    if (!unlockedAchievements.includes(id)) {
      const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
      if (ach) {
        onUnlockAchievement(id, ach.rewardCoins);
        soundEngine.playSound('achievement');
        floatingTextsRef.current.push({
          id: `ach-${Date.now()}`,
          text: `BADGE: ${ach.title}! +${ach.rewardCoins}G`,
          x: CANVAS_WIDTH / 2,
          y: 70,
          vy: -0.3,
          color: '#fbbf24',
          life: 90,
          maxLife: 90,
        });
      }
    }
  }, [unlockedAchievements, onUnlockAchievement]);

  // Spawn Level
  const initLevel = useCallback((lvl: number, keepHealth = false) => {
    const biome = getBiomeForLevel(lvl);
    setCurrentBiome(biome);

    const world = createPlatformsForLevel(lvl, biome);
    platformsRef.current = world.platforms;
    springsRef.current = world.springs;
    cratesRef.current = world.crates;
    monstersRef.current = createMonstersForLevel(lvl, biome);

    bulletsRef.current = [];
    enemyBulletsRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    lootRef.current = [];

    const p = playerRef.current;
    p.x = 80;
    p.y = 200;
    p.vx = 0;
    p.vy = 0;
    p.grounded = false;
    p.facing = 'right';
    p.canDoubleJump = true;
    p.shield = p.maxShield;
    isDyingRef.current = false;
    isAdvancingRef.current = false;
    if (!keepHealth) {
      p.hp = p.maxHp;
    }

    if (lvl >= 10) {
      checkAchievement('level_ten');
    }

    // Boss Warning Banner
    if (lvl % 3 === 0) {
      soundEngine.playSound('boss_roar');
      let bName = 'CRAG TITAN';
      if (biome === 'BEACH') bName = 'KRAKEN CRAB';
      if (biome === 'CITY') bName = 'OMEGA MECH';
      setBossIntroBanner(`⚠️ WARNING: ${bName} DETECTED! ⚠️`);
      setTimeout(() => setBossIntroBanner(null), 1800);
    }
  }, [checkAchievement]);

  // Handle Level Transition
  const advanceLevel = useCallback(() => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    const nextLvl = level + 1;
    setLevel(nextLvl);
    if (nextLvl > highLevel) {
      onUpdateHighLevel(nextLvl);
    }

    // Level clear bonus coins
    const bonusCoins = 20 + nextLvl * 6;
    onAddCoins(bonusCoins);

    floatingTextsRef.current.push({
      id: `clear-${Date.now()}`,
      text: `LEVEL CLEAR! +${bonusCoins} COINS!`,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2 - 20,
      vy: -0.5,
      color: '#38bdf8',
      life: 80,
      maxLife: 80,
    });

    setLevelClearBanner(true);
    soundEngine.playSound('level_clear');

    setTimeout(() => {
      setLevelClearBanner(false);
      initLevel(nextLvl, true);
      isAdvancingRef.current = false;
    }, 1200);
  }, [level, highLevel, onUpdateHighLevel, onAddCoins, initLevel]);

  // Handle Player Death
  const handlePlayerDeath = useCallback(() => {
    if (isDyingRef.current) return;
    isDyingRef.current = true;
    const newDeaths = deaths + 1;
    onUpdateDeaths(newDeaths);
    soundEngine.playSound('game_over');
    setGameState('GAME_OVER');
  }, [deaths, onUpdateDeaths]);

  // Trigger Ultimate Overcharge Screen Wipe
  const triggerUltimate = useCallback(() => {
    const p = playerRef.current;
    if (p.ultimateEnergy < 100 || p.ultimateActive) return;

    p.ultimateEnergy = 0;
    p.ultimateActive = true;
    p.ultimateTimer = 45;

    soundEngine.playSound('ultimate_blast');
    setScreenShake(14);
    checkAchievement('overcharged');

    // Massive screen flare particles
    for (let i = 0; i < 40; i++) {
      particlesRef.current.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 8 + 4,
        color: ['#a855f7', '#ec4899', '#38bdf8', '#facc15'][Math.floor(Math.random() * 4)],
        life: 40,
        maxLife: 40,
        alpha: 1,
        shape: 'ring',
      });
    }

    // Deal massive damage to all monsters
    monstersRef.current.forEach(m => {
      m.hp -= 35;
      m.hitFlash = 10;
      floatingTextsRef.current.push({
        id: `ult-dmg-${Date.now()}-${m.id}`,
        text: 'OVERCHARGE -35! ⚡',
        x: m.x + m.w / 2,
        y: m.y,
        vy: -1.2,
        color: '#facc15',
        life: 50,
        maxLife: 50,
      });
    });

    // Clear all enemy bullets on screen!
    enemyBulletsRef.current = [];
  }, [checkAchievement]);

  // Cycle Weapon
  const cycleWeapon = useCallback(() => {
    const idx = unlockedWeapons.indexOf(equippedWeapon);
    const nextIdx = (idx + 1) % unlockedWeapons.length;
    onEquipWeapon(unlockedWeapons[nextIdx]);
    soundEngine.playSound('click');
  }, [equippedWeapon, unlockedWeapons, onEquipWeapon]);

  // Initial Level Setup
  useEffect(() => {
    initLevel(level, false);
    if (!musicMuted) {
      soundEngine.startMusic();
    }
    return () => {
      soundEngine.stopMusic();
    };
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') {
        if (e.key === 'Escape') {
          if (gameState === 'PAUSED') setGameState('PLAYING');
          if (gameState === 'STORE') setGameState('PLAYING');
        }
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 'a' || key === 'arrowleft') {
        keysRef.current.left = true;
      }
      if (key === 'd' || key === 'arrowright') {
        keysRef.current.right = true;
      }
      if (key === 'w' || key === 'arrowup' || key === ' ') {
        keysRef.current.jump = true;
        playerRef.current.jumpBufferTimer = 6;
      }
      if (key === 'j' || key === 'z') {
        keysRef.current.shoot = true;
      }
      if (key === 'k' || key === 'x') {
        keysRef.current.shield = true;
      }
      if (key === 'q') {
        triggerUltimate();
      }
      if (key === 'tab') {
        e.preventDefault();
        cycleWeapon();
      }
      if (['1', '2', '3', '4', '5'].includes(key)) {
        const slot = parseInt(key) - 1;
        if (slot < unlockedWeapons.length) {
          onEquipWeapon(unlockedWeapons[slot]);
          soundEngine.playSound('click');
        }
      }
      if (key === 'escape' || key === 'p') {
        setGameState('PAUSED');
      }
      if (key === 's') {
        soundEngine.playSound('click');
        setGameState('STORE');
      }
      if (key === 'c') {
        soundEngine.playSound('click');
        setCrtEnabled(prev => !prev);
      }
      if (key === 'e' && currentBiome === 'CITY') {
        const p = playerRef.current;
        if (p.x >= 280 && p.x <= 400 && p.y > CANVAS_HEIGHT - 220) {
          soundEngine.playSound('coin');
          setGameState('STORE');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') keysRef.current.left = false;
      if (key === 'd' || key === 'arrowright') keysRef.current.right = false;
      if (key === 'w' || key === 'arrowup' || key === ' ') {
        keysRef.current.jump = false;
        if (playerRef.current.vy < -3) playerRef.current.vy *= 0.5;
      }
      if (key === 'j' || key === 'z') keysRef.current.shoot = false;
      if (key === 'k' || key === 'x') keysRef.current.shield = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, currentBiome, cycleWeapon, onEquipWeapon, triggerUltimate, unlockedWeapons]);

  // Touch handlers
  const handleTouchStart = (action: 'left' | 'right' | 'jump' | 'shoot' | 'shield') => {
    keysRef.current[action] = true;
    setTouchKeys({ ...keysRef.current });
    if (action === 'jump') {
      playerRef.current.jumpBufferTimer = 6;
    }
  };

  const handleTouchEnd = (action: 'left' | 'right' | 'jump' | 'shoot' | 'shield') => {
    keysRef.current[action] = false;
    setTouchKeys({ ...keysRef.current });
    if (action === 'jump' && playerRef.current.vy < -3) {
      playerRef.current.vy *= 0.5;
    }
  };

  // Main 60fps Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = new GameRenderer(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
    let animationId: number;

    const loop = () => {
      if (gameState === 'PLAYING') {
        const p = playerRef.current;
        const keys = keysRef.current;
        const currentStats = calculateUpgradedPlayerStats(upgrades, p.equippedWeapon);

        // Day/Night progression
        timeOfDayRef.current = (timeOfDayRef.current + 0.0002) % 1;
        renderer.updateSkyClouds();

        // Combo decay timer
        if (comboTimerRef.current > 0) {
          comboTimerRef.current--;
          if (comboTimerRef.current <= 0) {
            setComboCount(0);
            setComboMultiplier(1);
          }
        }

        // Moving platforms update
        platformsRef.current.forEach(plat => {
          if (plat.type === 'moving') {
            if (plat.vx) {
              plat.x += plat.vx;
              if (plat.minX !== undefined && plat.x <= plat.minX) plat.vx = Math.abs(plat.vx);
              if (plat.maxX !== undefined && plat.x + plat.w >= plat.maxX) plat.vx = -Math.abs(plat.vx);
            }
            if (plat.vy) {
              plat.y += plat.vy;
              if (plat.minY !== undefined && plat.y <= plat.minY) plat.vy = Math.abs(plat.vy);
              if (plat.maxY !== undefined && plat.y >= plat.maxY) plat.vy = -Math.abs(plat.vy);
            }
          }
        });

        // Springs animation
        springsRef.current.forEach(s => {
          if (s.animTimer > 0) s.animTimer--;
        });

        // Player Movement
        if (keys.left) {
          p.vx = -p.speed;
          p.facing = 'left';
        } else if (keys.right) {
          p.vx = p.speed;
          p.facing = 'right';
        } else {
          p.vx *= 0.78;
          if (Math.abs(p.vx) < 0.1) p.vx = 0;
        }

        // Coyote Time & Jump Buffering
        if (p.grounded) {
          p.coyoteTimer = 6;
          p.canDoubleJump = true;
        } else if (p.coyoteTimer > 0) {
          p.coyoteTimer--;
        }

        if (p.jumpBufferTimer > 0) {
          p.jumpBufferTimer--;
          if (p.coyoteTimer > 0) {
            p.vy = p.jumpPower;
            p.grounded = false;
            p.coyoteTimer = 0;
            p.jumpBufferTimer = 0;
            soundEngine.playSound('jump');
            particlesRef.current.push(
              ...createBloodParticles(p.x + p.w / 2, p.y + p.h, '#e2e8f0', 5)
            );
          } else if (p.hasDoubleJump && p.canDoubleJump) {
            p.vy = p.jumpPower * 0.94;
            p.canDoubleJump = false;
            p.jumpBufferTimer = 0;
            soundEngine.playSound('double_jump');
            particlesRef.current.push(
              ...createBloodParticles(p.x + p.w / 2, p.y + p.h, '#38bdf8', 9)
            );
          }
        }

        // Gravity
        p.vy += 0.46;
        if (p.vy > 12) p.vy = 12;

        p.x += p.vx;
        p.y += p.vy;
        p.animTimer++;

        // Screen Boundaries
        if (p.x < 0) {
          p.x = 0;
          p.vx = 0;
        }
        if (p.x + p.w > CANVAS_WIDTH) {
          p.x = CANVAS_WIDTH - p.w;
          p.vx = 0;
        }

        // Platform Collisions
        p.grounded = false;
        platformsRef.current.forEach(plat => {
          if (
            p.x + p.w > plat.x &&
            p.x < plat.x + plat.w &&
            p.y + p.h >= plat.y &&
            p.y + p.h <= plat.y + plat.h + p.vy + 2 &&
            p.vy >= 0
          ) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.grounded = true;
            // Transfer horizontal velocity of moving platform
            if (plat.vx) p.x += plat.vx;
          }
        });

        // Spring Bounce Pads Collision
        springsRef.current.forEach(s => {
          if (
            p.x + p.w > s.x &&
            p.x < s.x + s.w &&
            p.y + p.h >= s.y &&
            p.y + p.h <= s.y + s.h + 8 &&
            p.vy >= 0
          ) {
            p.vy = s.bouncePower;
            p.grounded = false;
            p.canDoubleJump = true;
            s.animTimer = 15;
            soundEngine.playSound('spring_bounce');
            particlesRef.current.push(
              ...createBloodParticles(s.x + s.w / 2, s.y, '#f59e0b', 8)
            );
          }
        });

        // Invulnerability
        if (p.isInvulnerable) {
          p.invulnerableTimer--;
          if (p.invulnerableTimer <= 0) p.isInvulnerable = false;
        }

        // Shield & Perfect Parry Window
        const prevShield = p.shieldActive;
        p.shieldActive = keys.shield && p.shield > 0;
        if (!prevShield && p.shieldActive) {
          p.shieldParryTimer = 12; // 12-frame window for perfect parry!
        }
        if (p.shieldParryTimer > 0) p.shieldParryTimer--;

        if (p.shieldActive) {
          p.shield = Math.max(0, p.shield - 0.45);
        } else {
          p.shield = Math.min(p.maxShield, p.shield + currentStats.shieldRegenRate);
        }

        // Ultimate timer cooldown
        if (p.ultimateActive) {
          p.ultimateTimer--;
          if (p.ultimateTimer <= 0) p.ultimateActive = false;
        }

        // Player Shooting
        if (keys.shoot && p.shootTimer <= 0) {
          const bx = p.facing === 'right' ? p.x + p.w + 4 : p.x - 12;
          const baseVx = p.facing === 'right' ? currentStats.bulletSpeed : -currentStats.bulletSpeed;
          const damage = currentStats.bulletDamage;
          const weapon = p.equippedWeapon;

          if (weapon === 'railgun') {
            bulletsRef.current.push({
              id: `rail-${Date.now()}`,
              x: bx,
              y: p.y + 14,
              vx: baseVx * 1.3,
              vy: 0,
              life: 55,
              damage: damage * 2.5,
              isLaser: true,
              isPiercing: true,
              color: '#22c55e',
            });
            soundEngine.playSound('railgun');
            setScreenShake(3);
          } else if (weapon === 'missiles') {
            bulletsRef.current.push({
              id: `mis-${Date.now()}`,
              x: bx,
              y: p.y + 12,
              vx: baseVx * 0.85,
              vy: (Math.random() - 0.5) * 1.5,
              life: 80,
              damage: damage * 1.4,
              isHoming: true,
              color: '#ef4444',
            });
            soundEngine.playSound('missile');
          } else if (weapon === 'spread' || currentStats.multiShotLevel > 1) {
            [-1.5, 0, 1.5].forEach((vySpread, sIdx) => {
              bulletsRef.current.push({
                id: `spread-${Date.now()}-${sIdx}`,
                x: bx,
                y: p.y + 14,
                vx: baseVx,
                vy: vySpread,
                life: 60,
                damage,
                color: weapon === 'plasma' ? '#a855f7' : '#f97316',
              });
            });
            soundEngine.playSound(weapon === 'plasma' ? 'plasma' : 'shoot');
          } else {
            // Standard Blaster
            bulletsRef.current.push({
              id: `b-${Date.now()}-${Math.random()}`,
              x: bx,
              y: p.y + 14,
              vx: baseVx,
              vy: 0,
              life: 65,
              damage,
              color: '#38bdf8',
            });
            soundEngine.playSound('shoot');
          }

          p.shootTimer = currentStats.shootCooldown;
        }

        if (p.shootTimer > 0) p.shootTimer--;

        // Update Player Bullets
        bulletsRef.current.forEach(b => {
          // Homing logic towards closest monster
          if (b.isHoming && monstersRef.current.length > 0) {
            const target = monstersRef.current[0];
            const dx = target.x + target.w / 2 - b.x;
            const dy = target.y + target.h / 2 - b.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 5) {
              b.vx += (dx / dist) * 0.45;
              b.vy += (dy / dist) * 0.45;
            }
          }

          b.x += b.vx;
          b.y += b.vy;
          b.life--;

          // Monster collision
          monstersRef.current.forEach(m => {
            if (
              checkAABB(
                { x: b.x, y: b.y, w: 10, h: 6 },
                { x: m.x, y: m.y, w: m.w, h: m.h }
              )
            ) {
              m.hp -= b.damage;
              m.hitFlash = 4;
              if (!b.isPiercing) b.life = 0;

              // Overcharge energy gain
              p.ultimateEnergy = Math.min(
                p.maxUltimateEnergy,
                p.ultimateEnergy + 3.5 * currentStats.ultimateGainMultiplier
              );
              if (p.ultimateEnergy >= 100) {
                soundEngine.playSound('ultimate_ready');
              }

              soundEngine.playSound('enemy_hit');
              particlesRef.current.push(
                ...createBloodParticles(b.x, b.y, '#f59e0b', 5)
              );

              floatingTextsRef.current.push({
                id: `dmg-${Date.now()}-${Math.random()}`,
                text: `-${Math.round(b.damage)}`,
                x: m.x + m.w / 2 + (Math.random() * 12 - 6),
                y: m.y,
                vy: -0.8,
                color: b.damage >= 3 ? '#facc15' : '#ffffff',
                life: 35,
                maxLife: 35,
              });
            }
          });

          // Breakable Crates collision
          cratesRef.current.forEach(crate => {
            if (
              checkAABB(
                { x: b.x, y: b.y, w: 10, h: 6 },
                { x: crate.x, y: crate.y, w: crate.w, h: crate.h }
              )
            ) {
              crate.hp -= b.damage;
              b.life = 0;
              soundEngine.playSound('crate_break');
              particlesRef.current.push(
                ...createBloodParticles(b.x, b.y, '#ca8a04', 6)
              );

              if (crate.hp <= 0) {
                // Drop power-up / loot from crate
                lootRef.current.push({
                  id: `crate-drop-${Date.now()}`,
                  x: crate.x + crate.w / 2,
                  y: crate.y,
                  vx: (Math.random() - 0.5) * 2,
                  vy: -3,
                  type: Math.random() > 0.5 ? 'gem' : 'heart',
                  value: 8,
                  life: 300,
                  grounded: false,
                });
              }
            }
          });
        });
        bulletsRef.current = bulletsRef.current.filter(b => b.life > 0);
        cratesRef.current = cratesRef.current.filter(c => c.hp > 0);

        // Update Monsters
        monstersRef.current.forEach(m => {
          m.animTimer++;
          if (m.hitFlash && m.hitFlash > 0) m.hitFlash--;

          // Slimes
          if (m.type === 'slime') {
            m.x += m.vx;
            if (m.x < 110 || m.x + m.w > CANVAS_WIDTH - 80) m.vx *= -1;
          }

          // Snakes
          if (m.type === 'snake') {
            m.shootTimer = (m.shootTimer || 0) + 1;
            if (m.shootTimer > 90) {
              const dir = p.x < m.x ? -4.5 : 4.5;
              enemyBulletsRef.current.push({
                id: `eb-${Date.now()}-${Math.random()}`,
                x: dir < 0 ? m.x - 6 : m.x + m.w + 6,
                y: m.y + 10,
                vx: dir,
                vy: 0,
                life: 110,
                color: '#c084fc',
              });
              m.shootTimer = 0;
            }
          }

          // Drones
          if (m.type === 'drone') {
            m.x += m.vx;
            m.y += Math.sin(m.animTimer * 0.08) * 1.5;
            if (m.x < 100 || m.x > CANVAS_WIDTH - 120) m.vx *= -1;
            m.shootTimer = (m.shootTimer || 0) + 1;
            if (m.shootTimer > 115) {
              enemyBulletsRef.current.push({
                id: `eb-drone-${Date.now()}`,
                x: m.x + m.w / 2,
                y: m.y + m.h,
                vx: (p.x - m.x) * 0.02,
                vy: 3.2,
                life: 90,
                color: '#38bdf8',
              });
              m.shootTimer = 0;
            }
          }

          // Boss AI
          if (m.type === 'boss') {
            m.x += m.vx;
            if (m.x < 140 || m.x + m.w > CANVAS_WIDTH - 80) m.vx *= -1;
            m.attackTimer = (m.attackTimer || 0) + 1;

            if (m.attackTimer === 75) {
              soundEngine.playSound('boss_roar');
              setScreenShake(7);
              enemyBulletsRef.current.push(
                {
                  id: `b-wave-1-${Date.now()}`,
                  x: m.x,
                  y: CANVAS_HEIGHT - 45,
                  vx: -4.8,
                  vy: 0,
                  life: 120,
                  color: '#ef4444',
                  size: 9,
                },
                {
                  id: `b-wave-2-${Date.now()}`,
                  x: m.x + m.w,
                  y: CANVAS_HEIGHT - 45,
                  vx: 4.8,
                  vy: 0,
                  life: 120,
                  color: '#ef4444',
                  size: 9,
                }
              );
            }

            if (m.attackTimer > 150) {
              const bDir = p.x < m.x ? -1 : 1;
              [-1, 0, 1].forEach(spread => {
                enemyBulletsRef.current.push({
                  id: `b-spread-${Date.now()}-${spread}`,
                  x: m.x + m.w / 2,
                  y: m.y + m.h / 2,
                  vx: bDir * 4.4,
                  vy: spread * 2.2,
                  life: 100,
                  color: '#f97316',
                  size: 7,
                });
              });
              m.attackTimer = 0;
            }
          }

          // Monster Death Handling
          if (m.hp <= 0) {
            soundEngine.playSound('enemy_kill');
            onIncrementKills();
            checkAchievement('first_blood');

            // Combo increment
            const newCombo = comboCount + 1;
            const newMult = Math.min(4.0, 1 + newCombo * 0.25);
            setComboCount(newCombo);
            setComboMultiplier(newMult);
            comboTimerRef.current = 160; // ~2.6 seconds window

            if (newCombo >= 5) {
              checkAchievement('combo_king');
              soundEngine.playSound('combo', newCombo);
            }

            if (m.type === 'boss') {
              if (m.name?.includes('TITAN')) checkAchievement('boss_crag');
              if (m.name?.includes('KRAKEN')) checkAchievement('boss_kraken');
              if (m.name?.includes('OMEGA')) checkAchievement('boss_omega');
            }

            particlesRef.current.push(
              ...createBloodParticles(m.x + m.w / 2, m.y + m.h / 2, '#ef4444', 16)
            );

            // Explosive coin & gem fountain
            const dropCount = m.type === 'boss' ? 10 : 3;
            for (let i = 0; i < dropCount; i++) {
              lootRef.current.push({
                id: `loot-${Date.now()}-${i}-${Math.random()}`,
                x: m.x + m.w / 2 + (Math.random() * 20 - 10),
                y: m.y + m.h / 2,
                vx: Math.random() * 5 - 2.5,
                vy: -(Math.random() * 4 + 2),
                type: m.type === 'boss' && i === 0 ? 'gem' : Math.random() > 0.8 ? 'heart' : 'coin',
                value: Math.round((m.type === 'boss' ? 12 : 3) * newMult),
                life: 300,
                grounded: false,
              });
            }
          }
        });
        monstersRef.current = monstersRef.current.filter(m => m.hp > 0);

        // Update Enemy Bullets
        enemyBulletsRef.current.forEach(eb => {
          eb.x += eb.vx;
          eb.y += eb.vy;
          eb.life--;

          // Reflected bullet hitting monsters!
          if (eb.isReflected) {
            monstersRef.current.forEach(m => {
              if (
                checkAABB(
                  { x: eb.x - 5, y: eb.y - 5, w: 10, h: 10 },
                  { x: m.x, y: m.y, w: m.w, h: m.h }
                )
              ) {
                m.hp -= 8;
                m.hitFlash = 6;
                eb.life = 0;
                soundEngine.playSound('enemy_hit');
                floatingTextsRef.current.push({
                  id: `parry-hit-${Date.now()}`,
                  text: 'PARRY REVERSAL -8! ⚡',
                  x: m.x + m.w / 2,
                  y: m.y - 10,
                  vy: -1.0,
                  color: '#38bdf8',
                  life: 40,
                  maxLife: 40,
                });
              }
            });
            return;
          }

          // Player collision check
          if (
            checkAABB(
              { x: eb.x - 4, y: eb.y - 4, w: 8, h: 8 },
              { x: p.x, y: p.y, w: p.w, h: p.h }
            )
          ) {
            if (p.shieldActive && p.shield > 0) {
              // PERFECT PARRY MECHANIC!
              if (p.shieldParryTimer > 0) {
                soundEngine.playSound('perfect_parry');
                setScreenShake(4);
                totalParriesRef.current++;
                if (totalParriesRef.current >= 10) checkAchievement('parry_master');

                // Reflect bullet back!
                eb.isReflected = true;
                eb.vx = -eb.vx * 1.5;
                eb.vy = (Math.random() - 0.5) * 2;
                eb.color = '#38bdf8';
                eb.life = 90;

                floatingTextsRef.current.push({
                  id: `parry-${Date.now()}`,
                  text: 'PERFECT PARRY! 🛡️⚡',
                  x: p.x + p.w / 2,
                  y: p.y - 14,
                  vy: -0.9,
                  color: '#38bdf8',
                  life: 35,
                  maxLife: 35,
                });
              } else {
                // Normal shield deflection
                soundEngine.playSound('shield_deflect');
                particlesRef.current.push(
                  ...createBloodParticles(eb.x, eb.y, activeSkin.colors.shield, 6)
                );
                p.shield = Math.max(0, p.shield - 5);
                eb.life = 0;
              }
            } else if (!p.isInvulnerable) {
              p.hp--;
              p.isInvulnerable = true;
              p.invulnerableTimer = 45;
              soundEngine.playSound('hit');
              setScreenShake(8);
              particlesRef.current.push(
                ...createBloodParticles(p.x + p.w / 2, p.y + p.h / 2, '#ef4444', 8)
              );
              floatingTextsRef.current.push({
                id: `hurt-${Date.now()}`,
                text: '-1 HP',
                x: p.x + p.w / 2,
                y: p.y - 10,
                vy: -0.6,
                color: '#ef4444',
                life: 35,
                maxLife: 35,
              });
              eb.life = 0;
            }
          }
        });
        enemyBulletsRef.current = enemyBulletsRef.current.filter(eb => eb.life > 0);

        // Player vs Monster Physical Collision
        monstersRef.current.forEach(m => {
          if (
            checkAABB(
              { x: p.x, y: p.y, w: p.w, h: p.h },
              { x: m.x, y: m.y, w: m.w, h: m.h }
            )
          ) {
            if (p.shieldActive && p.shield > 0) {
              m.vx *= -1.2;
              soundEngine.playSound('shield_deflect');
              p.shield = Math.max(0, p.shield - 7);
            } else if (!p.isInvulnerable) {
              p.hp--;
              p.isInvulnerable = true;
              p.invulnerableTimer = 45;
              soundEngine.playSound('hit');
              setScreenShake(6);
              p.vy = -4;
              p.vx = p.x < m.x ? -5 : 5;
            }
          }
        });

        // Update Loot Drops
        lootRef.current.forEach(item => {
          item.vy += 0.25;
          item.x += item.vx;
          item.y += item.vy;
          item.life--;

          platformsRef.current.forEach(plat => {
            if (
              item.x >= plat.x &&
              item.x <= plat.x + plat.w &&
              item.y >= plat.y - 4 &&
              item.y <= plat.y + 8 &&
              item.vy >= 0
            ) {
              item.y = plat.y - 4;
              item.vy = 0;
              item.vx *= 0.8;
            }
          });

          // Magnet Attraction
          if (currentStats.magnetRange > 0) {
            const dx = p.x + p.w / 2 - item.x;
            const dy = p.y + p.h / 2 - item.y;
            const dist = Math.hypot(dx, dy);
            if (dist < currentStats.magnetRange) {
              item.vx += (dx / dist) * 0.75;
              item.vy += (dy / dist) * 0.75;
            }
          }

          // Pickup
          const distToPlayer = Math.hypot(
            p.x + p.w / 2 - item.x,
            p.y + p.h / 2 - item.y
          );
          if (distToPlayer < 24) {
            if (item.type === 'coin') {
              onAddCoins(item.value);
              soundEngine.playSound('coin');
              floatingTextsRef.current.push({
                id: `coin-${Date.now()}-${Math.random()}`,
                text: `+${item.value}G`,
                x: item.x,
                y: item.y - 8,
                vy: -0.5,
                color: '#eab308',
                life: 30,
                maxLife: 30,
              });
            } else if (item.type === 'gem') {
              onAddCoins(item.value * 3);
              soundEngine.playSound('gem');
              floatingTextsRef.current.push({
                id: `gem-${Date.now()}`,
                text: `+${item.value * 3}G GEM!`,
                x: item.x,
                y: item.y - 12,
                vy: -0.6,
                color: '#38bdf8',
                life: 40,
                maxLife: 40,
              });
            } else if (item.type === 'heart') {
              p.hp = Math.min(p.maxHp, p.hp + 2);
              soundEngine.playSound('heart');
              floatingTextsRef.current.push({
                id: `heal-${Date.now()}`,
                text: '+2 HP ❤️',
                x: item.x,
                y: item.y - 8,
                vy: -0.5,
                color: '#22c55e',
                life: 30,
                maxLife: 30,
              });
            }

            item.life = 0;
          }
        });
        lootRef.current = lootRef.current.filter(item => item.life > 0);

        // Update Particles
        particlesRef.current.forEach(pt => {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life--;
          pt.alpha = pt.life / pt.maxLife;
        });
        particlesRef.current = particlesRef.current.filter(pt => pt.life > 0);

        // Update Floating Combat Texts
        floatingTextsRef.current.forEach(ft => {
          ft.y += ft.vy;
          ft.life--;
        });
        floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.life > 0);

        // Check Fall Off or Zero HP -> Death
        if ((p.y > CANVAS_HEIGHT + 30 || p.hp <= 0) && !isDyingRef.current) {
          handlePlayerDeath();
        }

        // Check All Monsters Defeated -> Next Wave!
        if (monstersRef.current.length === 0 && !isAdvancingRef.current) {
          advanceLevel();
        }
      }

      // RENDER PASS
      ctx.save();

      // Screen Shake
      if (screenShake > 0) {
        const sx = (Math.random() - 0.5) * screenShake;
        const sy = (Math.random() - 0.5) * screenShake;
        ctx.translate(sx, sy);
        setScreenShake(prev => Math.max(0, prev - 0.5));
      }

      // Background with Day/Night cycle
      renderer.drawBackground(timeOfDayRef.current, currentBiome);

      // Platforms, Springs, Crates
      renderer.drawPlatforms(platformsRef.current, currentBiome);
      renderer.drawSprings(springsRef.current);
      renderer.drawCrates(cratesRef.current);

      // Loot Drops
      renderer.drawLootDrops(lootRef.current);

      // Bullets
      renderer.drawBullets(bulletsRef.current);
      renderer.drawEnemyBullets(enemyBulletsRef.current);

      // Monsters
      renderer.drawMonsters(monstersRef.current);

      // Hero GP Player
      renderer.drawGPPlayer(playerRef.current, activeSkin);

      // Particles & Floating Damage Texts
      renderer.drawParticles(particlesRef.current);
      renderer.drawFloatingTexts(floatingTextsRef.current);

      ctx.restore();

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [
    gameState,
    level,
    currentBiome,
    upgrades,
    activeSkin,
    coins,
    screenShake,
    advanceLevel,
    handlePlayerDeath,
    onAddCoins,
    onIncrementKills,
    checkAchievement,
  ]);

  const currentBoss = monstersRef.current.find(m => m.type === 'boss') || null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-[#05060b] overflow-hidden select-none"
    >
      <div className="relative w-full h-full max-w-[1200px] max-h-[675px] aspect-video flex items-center justify-center p-1 sm:p-2 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border-2 border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full object-contain block bg-[#0a0d18] rounded-xl border border-slate-800 shadow-2xl"
        />

        {/* Retro CRT Scanlines & Screen Vignette Overlay */}
        {crtEnabled && (
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-75 mix-blend-overlay rounded-xl z-10 shadow-[inset_0_0_80px_rgba(0,0,0,0.7)]" />
        )}

        {/* Level Clear Overlay Banner */}
        {levelClearBanner && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="bg-slate-950/90 border border-sky-400/80 rounded-2xl px-6 py-4 shadow-2xl text-center animate-bounce">
              <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-200 to-amber-300 font-['Press_Start_2P']">
                LEVEL CLEAR!
              </div>
              <div className="text-xs font-mono text-amber-300 mt-1">
                PREPARING NEXT WAVE...
              </div>
            </div>
          </div>
        )}

        {/* Boss Warning Banner */}
        {bossIntroBanner && (
          <div className="absolute top-16 inset-x-0 flex items-center justify-center pointer-events-none z-30 animate-pulse">
            <div className="bg-rose-950/90 border border-rose-500 rounded-2xl px-6 py-2.5 shadow-2xl text-rose-300 font-bold font-['Press_Start_2P'] text-xs sm:text-sm">
              {bossIntroBanner}
            </div>
          </div>
        )}

        {/* City SHOP prompt overlay */}
        {currentBiome === 'CITY' &&
          gameState === 'PLAYING' &&
          playerRef.current.x >= 280 &&
          playerRef.current.x <= 400 &&
          playerRef.current.y > CANVAS_HEIGHT - 220 && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-amber-500/20 border border-amber-400/60 rounded-xl px-4 py-1.5 backdrop-blur-md text-amber-300 font-mono text-xs flex items-center gap-2 pointer-events-auto z-20 shadow-lg animate-pulse">
              <span>Press [E] or tap here to enter the SHOP</span>
              <button
                onClick={() => {
                  soundEngine.playSound('coin');
                  setGameState('STORE');
                }}
                className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px] cursor-pointer"
              >
                ENTER
              </button>
            </div>
          )}

        {/* Heads Up Display (HUD) */}
        {gameState === 'PLAYING' && (
          <HUD
            level={level}
            deaths={deaths}
            hp={playerRef.current.hp}
            maxHp={playerRef.current.maxHp}
            shield={playerRef.current.shield}
            maxShield={playerRef.current.maxShield}
            coins={coins}
            biome={currentBiome}
            boss={currentBoss}
            remainingMonsters={monstersRef.current.length}
            comboCount={comboCount}
            comboMultiplier={comboMultiplier}
            ultimateEnergy={playerRef.current.ultimateEnergy}
            maxUltimateEnergy={playerRef.current.maxUltimateEnergy}
            ultimateActive={playerRef.current.ultimateActive}
            equippedWeapon={equippedWeapon}
            unlockedWeapons={unlockedWeapons}
            crtFilter={crtEnabled}
            onToggleCrt={() => setCrtEnabled(prev => !prev)}
            onSelectWeapon={onEquipWeapon}
            onTriggerUltimate={triggerUltimate}
            showTouchControls={showTouchControls}
            onToggleTouchControls={() => setShowTouchControls(prev => !prev)}
            onPause={() => setGameState('PAUSED')}
            onOpenStore={() => setGameState('STORE')}
            sfxMuted={sfxMuted}
            musicMuted={musicMuted}
            onToggleSfx={onToggleSfx}
            onToggleMusic={onToggleMusic}
          />
        )}

        {/* Touch Controls */}
        {gameState === 'PLAYING' && showTouchControls && (
          <TouchControls
            onInputStart={handleTouchStart}
            onInputEnd={handleTouchEnd}
            onTriggerUltimate={triggerUltimate}
            onCycleWeapon={cycleWeapon}
            isUltReady={playerRef.current.ultimateEnergy >= 100}
            activeKeys={touchKeys}
          />
        )}

        {/* Pause Modal */}
        {gameState === 'PAUSED' && (
          <PauseModal
            onResume={() => setGameState('PLAYING')}
            onOpenStore={() => setGameState('STORE')}
            onRestart={() => {
              initLevel(level, false);
              setGameState('PLAYING');
            }}
            onMainMenu={onReturnToMainMenu}
            sfxVolume={sfxVolume}
            musicVolume={musicVolume}
            onSfxVolumeChange={onSfxVolumeChange}
            onMusicVolumeChange={onMusicVolumeChange}
          />
        )}

        {/* Store Modal */}
        {gameState === 'STORE' && (
          <StoreModal
            coins={coins}
            upgrades={upgrades}
            upgradeConfigs={INITIAL_UPGRADES}
            skins={CHARACTER_SKINS}
            activeSkinId={activeSkinId}
            unlockedSkinIds={unlockedSkinIds}
            equippedWeapon={equippedWeapon}
            unlockedWeapons={unlockedWeapons}
            achievements={ACHIEVEMENTS_LIST.map(a => ({
              ...a,
              unlocked: unlockedAchievements.includes(a.id),
            }))}
            onUpgrade={onUpgradeItem}
            onEquipSkin={onEquipSkin}
            onUnlockSkin={onUnlockSkin}
            onEquipWeapon={onEquipWeapon}
            onUnlockWeapon={onUnlockWeapon}
            onClaimAchievement={onUnlockAchievement}
            onClose={() => setGameState('PLAYING')}
          />
        )}

        {/* Game Over Modal */}
        {gameState === 'GAME_OVER' && (
          <GameOverModal
            level={level}
            deaths={deaths}
            coins={coins}
            highLevel={highLevel}
            onRespawn={() => {
              initLevel(level, false);
              setGameState('PLAYING');
            }}
            onOpenStore={() => setGameState('STORE')}
            onMainMenu={onReturnToMainMenu}
          />
        )}
      </div>
    </div>
  );
};
