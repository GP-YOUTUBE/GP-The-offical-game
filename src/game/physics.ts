import {
  BiomeType,
  BreakableCrate,
  Bullet,
  EnemyBullet,
  FloatingText,
  LootDrop,
  Monster,
  Particle,
  Platform,
  PlayerStats,
  SpringPad,
  WeaponType,
} from '../types/game';
import { CANVAS_HEIGHT, CANVAS_WIDTH, WEAPON_REGISTRY } from './constants';

export function getBiomeForLevel(level: number): BiomeType {
  const cycle = (level - 1) % 3;
  if (cycle === 0) return 'MOUNTAIN';
  if (cycle === 1) return 'BEACH';
  return 'CITY';
}

export function createPlatformsForLevel(level: number, biome: BiomeType): {
  platforms: Platform[];
  springs: SpringPad[];
  crates: BreakableCrate[];
} {
  const groundY = CANVAS_HEIGHT - 35;
  const platforms: Platform[] = [
    { x: 0, y: groundY, w: CANVAS_WIDTH, h: 45, type: 'ground' },
  ];
  const springs: SpringPad[] = [];
  const crates: BreakableCrate[] = [];

  if (biome === 'MOUNTAIN') {
    // Stepped rocky crags with moving hover ledge
    platforms.push(
      { x: 140, y: CANVAS_HEIGHT - 110, w: 120, h: 18, type: 'floating' },
      { x: 300, y: CANVAS_HEIGHT - 180, w: 130, h: 18, type: 'floating' },
      {
        x: 480,
        y: CANVAS_HEIGHT - 130,
        w: 110,
        h: 18,
        type: 'moving',
        vx: 1.2,
        minX: 450,
        maxX: 640,
      },
      { x: 670, y: CANVAS_HEIGHT - 210, w: 100, h: 18, type: 'floating' },
      { x: 330, y: CANVAS_HEIGHT - 265, w: 90, h: 18, type: 'floating' },
    );

    // Spring pad on lower left crag
    springs.push({
      id: `spring-mtn-${level}`,
      x: 160,
      y: CANVAS_HEIGHT - 122,
      w: 24,
      h: 12,
      bouncePower: -11.5,
      animTimer: 0,
    });

    // Mystery Crates
    crates.push(
      { id: `c1-${level}`, x: 330, y: CANVAS_HEIGHT - 204, w: 22, h: 22, hp: 2, maxHp: 2 },
      { id: `c2-${level}`, x: 700, y: CANVAS_HEIGHT - 234, w: 22, h: 22, hp: 2, maxHp: 2 },
    );
  } else if (biome === 'BEACH') {
    // Tropical piers with vertical hover platform
    platforms.push(
      { x: 100, y: CANVAS_HEIGHT - 100, w: 130, h: 18, type: 'floating' },
      {
        x: 270,
        y: CANVAS_HEIGHT - 160,
        w: 120,
        h: 18,
        type: 'moving',
        vy: 0.9,
        minY: CANVAS_HEIGHT - 210,
        maxY: CANVAS_HEIGHT - 140,
      },
      { x: 440, y: CANVAS_HEIGHT - 220, w: 130, h: 18, type: 'floating' },
      { x: 620, y: CANVAS_HEIGHT - 140, w: 130, h: 18, type: 'floating' },
      { x: 170, y: CANVAS_HEIGHT - 230, w: 110, h: 18, type: 'floating' },
    );

    // Spring pad on ground for high beach jumps
    springs.push({
      id: `spring-bch-${level}`,
      x: 50,
      y: groundY - 12,
      w: 24,
      h: 12,
      bouncePower: -12.5,
      animTimer: 0,
    });

    crates.push(
      { id: `c1-${level}`, x: 470, y: CANVAS_HEIGHT - 244, w: 22, h: 22, hp: 2, maxHp: 2 },
    );
  } else {
    // CITY: Shop building platform + floating cyber beams
    platforms.push(
      { x: 110, y: CANVAS_HEIGHT - 100, w: 110, h: 18, type: 'floating' },
      { x: 260, y: CANVAS_HEIGHT - 145, w: 150, h: 18, type: 'shop_platform' },
      {
        x: 460,
        y: CANVAS_HEIGHT - 210,
        w: 110,
        h: 18,
        type: 'moving',
        vx: -1.3,
        minX: 430,
        maxX: 620,
      },
      { x: 630, y: CANVAS_HEIGHT - 130, w: 130, h: 18, type: 'floating' },
      { x: 480, y: CANVAS_HEIGHT - 280, w: 100, h: 18, type: 'floating' },
    );

    springs.push({
      id: `spring-cty-${level}`,
      x: 650,
      y: CANVAS_HEIGHT - 142,
      w: 24,
      h: 12,
      bouncePower: -12.0,
      animTimer: 0,
    });

    crates.push(
      { id: `c1-${level}`, x: 140, y: CANVAS_HEIGHT - 124, w: 22, h: 22, hp: 2, maxHp: 2 },
      { id: `c2-${level}`, x: 510, y: CANVAS_HEIGHT - 304, w: 22, h: 22, hp: 2, maxHp: 2 },
    );
  }

  return { platforms, springs, crates };
}

export function createMonstersForLevel(level: number, biome: BiomeType): Monster[] {
  const monsters: Monster[] = [];
  const hpMultiplier = 1 + (level - 1) * 0.28;

  if (level % 3 === 0) {
    // Boss Wave!
    const bossHp = Math.round(45 * hpMultiplier);
    let bossName = 'CRAG TITAN';
    if (biome === 'BEACH') bossName = 'KRAKEN CRAB';
    if (biome === 'CITY') bossName = 'OMEGA MECH';

    monsters.push({
      id: `boss-${level}`,
      x: CANVAS_WIDTH - 190,
      y: CANVAS_HEIGHT - 125,
      w: 68,
      h: 74,
      type: 'boss',
      name: bossName,
      hp: bossHp,
      maxHp: bossHp,
      vx: -1.4,
      vy: 0,
      animTimer: 0,
      shootTimer: 0,
      attackTimer: 0,
      bossPhase: 1,
    });

    // Minions accompanying boss
    monsters.push({
      id: `minion-${level}-1`,
      x: 280,
      y: CANVAS_HEIGHT - 220,
      w: 26,
      h: 28,
      type: 'slime',
      hp: Math.round(3 * hpMultiplier),
      maxHp: Math.round(3 * hpMultiplier),
      vx: 1.3,
      vy: 0,
      animTimer: 0,
    });
    return monsters;
  }

  // Regular Levels
  // 1. Gelatinous Slimes
  monsters.push({
    id: `slime-1-${level}`,
    x: 210,
    y: CANVAS_HEIGHT - 145,
    w: 28,
    h: 30,
    type: 'slime',
    hp: Math.round(3 * hpMultiplier),
    maxHp: Math.round(3 * hpMultiplier),
    vx: 1.4,
    vy: 0,
    animTimer: 0,
  });

  monsters.push({
    id: `slime-2-${level}`,
    x: 530,
    y: CANVAS_HEIGHT - 155,
    w: 28,
    h: 30,
    type: 'slime',
    hp: Math.round(3 * hpMultiplier),
    maxHp: Math.round(3 * hpMultiplier),
    vx: -1.3,
    vy: 0,
    animTimer: 25,
  });

  // 2. Venom Spitting Snakes
  monsters.push({
    id: `snake-1-${level}`,
    x: 340,
    y: CANVAS_HEIGHT - 212,
    w: 30,
    h: 36,
    type: 'snake',
    hp: Math.round(4 * hpMultiplier),
    maxHp: Math.round(4 * hpMultiplier),
    vx: 0,
    vy: 0,
    shootTimer: 25,
    animTimer: 0,
  });

  // 3. Aerial Cyber Drones
  if (level >= 2) {
    monsters.push({
      id: `drone-1-${level}`,
      x: 660,
      y: CANVAS_HEIGHT - 240,
      w: 28,
      h: 24,
      type: 'drone',
      hp: Math.round(3 * hpMultiplier),
      maxHp: Math.round(3 * hpMultiplier),
      vx: -1.6,
      vy: 0,
      animTimer: 0,
      shootTimer: 50,
    });
  }

  if (level >= 4) {
    monsters.push({
      id: `snake-2-${level}`,
      x: 690,
      y: CANVAS_HEIGHT - 232,
      w: 30,
      h: 36,
      type: 'snake',
      hp: Math.round(5 * hpMultiplier),
      maxHp: Math.round(5 * hpMultiplier),
      vx: 0,
      vy: 0,
      shootTimer: 55,
      animTimer: 15,
    });
  }

  if (level >= 5) {
    monsters.push({
      id: `drone-2-${level}`,
      x: 200,
      y: CANVAS_HEIGHT - 270,
      w: 28,
      h: 24,
      type: 'drone',
      hp: Math.round(4 * hpMultiplier),
      maxHp: Math.round(4 * hpMultiplier),
      vx: 1.5,
      vy: 0,
      animTimer: 10,
      shootTimer: 70,
    });
  }

  return monsters;
}

export function createBloodParticles(
  x: number,
  y: number,
  color: string,
  count = 8,
  shape: 'spark' | 'circle' | 'smoke' | 'ring' = 'spark'
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      size: Math.random() * 3.5 + 2,
      color,
      life: 25 + Math.random() * 20,
      maxLife: 45,
      alpha: 1,
      shape,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.2,
    });
  }
  return particles;
}

export function checkAABB(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function calculateUpgradedPlayerStats(
  upgrades: Record<string, number>,
  equippedWeapon: WeaponType
): {
  maxHp: number;
  maxShield: number;
  shieldRegenRate: number;
  shootCooldown: number;
  bulletDamage: number;
  multiShotLevel: number;
  hasDoubleJump: boolean;
  hasShieldBash: boolean;
  magnetRange: number;
  ultimateGainMultiplier: number;
  bulletSpeed: number;
} {
  const hpLevel = upgrades['max_hp'] || 1;
  const shieldCapLevel = upgrades['shield_cap'] || 1;
  const shieldRegenLevel = upgrades['shield_regen'] || 1;
  const fireRateLevel = upgrades['fire_rate'] || 1;
  const damageLevel = upgrades['blaster_damage'] || 1;
  const multiShotLevel = upgrades['multi_shot'] || 1;
  const doubleJumpLevel = upgrades['double_jump'] || 0;
  const shieldBashLevel = upgrades['shield_bash'] || 0;
  const magnetLevel = upgrades['coin_magnet'] || 0;
  const ultLevel = upgrades['ultimate_booster'] || 0;

  const weaponInfo = WEAPON_REGISTRY[equippedWeapon] || WEAPON_REGISTRY.blaster;

  const baseCooldown = weaponInfo.fireCooldown;
  const effectiveCooldown = Math.max(
    4,
    Math.round(baseCooldown - (fireRateLevel - 1) * 1.5)
  );

  const baseDamage = Math.round(damageLevel * weaponInfo.damageMultiplier);

  return {
    maxHp: 8 + (hpLevel - 1) * 2,
    maxShield: 100 + (shieldCapLevel - 1) * 35,
    shieldRegenRate: 0.14 + (shieldRegenLevel - 1) * 0.09,
    shootCooldown: effectiveCooldown,
    bulletDamage: Math.max(1, baseDamage),
    multiShotLevel,
    hasDoubleJump: doubleJumpLevel > 0,
    hasShieldBash: shieldBashLevel > 0,
    magnetRange: magnetLevel * 85,
    ultimateGainMultiplier: 1 + ultLevel * 0.5,
    bulletSpeed: weaponInfo.bulletSpeed,
  };
}
