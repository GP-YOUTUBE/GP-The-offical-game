export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'STORE' | 'GAME_OVER' | 'LEVEL_CLEAR';

export type BiomeType = 'MOUNTAIN' | 'BEACH' | 'CITY';

export type WeaponType = 'blaster' | 'plasma' | 'spread' | 'railgun' | 'missiles';

export interface PlayerStats {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  speed: number;
  jumpPower: number;
  grounded: boolean;
  facing: 'left' | 'right';
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  shieldActive: boolean;
  shieldParryTimer: number; // Perfect parry window
  shieldBashCooldown: number;
  isBashing: boolean;
  shootTimer: number;
  animFrame: number;
  animTimer: number;
  coyoteTimer: number;
  jumpBufferTimer: number;
  hasDoubleJump: boolean;
  canDoubleJump: boolean;
  isInvulnerable: boolean;
  invulnerableTimer: number;
  chargeTime: number; // For Railgun charge
  ultimateEnergy: number; // 0 to 100
  maxUltimateEnergy: number;
  ultimateActive: boolean;
  ultimateTimer: number;
  equippedWeapon: WeaponType;
  unlockedWeapons: WeaponType[];
}

export type MonsterType = 'slime' | 'snake' | 'drone' | 'boss';

export interface Monster {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: MonsterType;
  hp: number;
  maxHp: number;
  vx: number;
  vy: number;
  facing?: 'left' | 'right';
  shootTimer?: number;
  animTimer: number;
  bossPhase?: number;
  attackTimer?: number;
  name?: string;
  hitFlash?: number; // White flash on taking damage
  isEnraged?: boolean;
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type?: 'ground' | 'floating' | 'shop_platform' | 'moving';
  vx?: number;
  vy?: number;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

export interface SpringPad {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  bouncePower: number;
  animTimer: number;
}

export interface BreakableCrate {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  damage: number;
  color?: string;
  isLaser?: boolean;
  isHoming?: boolean;
  targetId?: string;
  isPiercing?: boolean;
  size?: number;
}

export interface EnemyBullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color?: string;
  size?: number;
  isReflected?: boolean; // Reflected by perfect parry!
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  alpha: number;
  shape?: 'square' | 'circle' | 'spark' | 'ring' | 'casing' | 'smoke' | 'bubble';
  rotation?: number;
  vRot?: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  scale?: number;
}

export type DropType = 'coin' | 'gem' | 'heart' | 'battery' | 'star' | 'magnet_orb';

export interface LootDrop {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: DropType;
  value: number;
  life: number;
  grounded: boolean;
}

export interface ShopUpgrade {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  cost: number;
  costMultiplier: number;
  icon: string;
  category: 'weapon' | 'defense' | 'mobility' | 'utility';
}

export interface CharacterSkin {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  colors: {
    hair: string;
    shirt: string;
    shield: string;
    emblem: string;
    pants: string;
    trailColor?: string;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardCoins: number;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export interface ComboState {
  count: number;
  timer: number;
  multiplier: number;
  maxCombo: number;
}

export interface GameSaveData {
  coins: number;
  highLevel: number;
  deaths: number;
  totalKills: number;
  maxCombo: number;
  activeSkin: string;
  unlockedSkins: string[];
  unlockedWeapons: WeaponType[];
  equippedWeapon: WeaponType;
  upgrades: Record<string, number>;
  achievements: string[]; // Unlocked achievement IDs
  audioEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
}
