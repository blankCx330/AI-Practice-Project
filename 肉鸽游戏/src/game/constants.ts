import type {
  GameConfig,
  Character,
  Weapon,
  Passive,
  EnemyTypeConfig,
  SkillOption,
  Player,
} from './types';

// ============================================
// 游戏全局配置
// ============================================

export const GAME_CONFIG: GameConfig = {
  canvas: {
    width: 1200,
    height: 800,
  },
  difficulty: {
    increaseInterval: 30000,
    baseSpawnRate: 1500,
    minSpawnRate: 200,
    spawnRateDecay: 0.95,
    hpGrowth: 1.1,
    attackGrowth: 1.05,
  },
  experience: {
    baseRequired: 100,
    growthFactor: 1.5,
  },
  pickup: {
    flySpeed: 15,
    flyThreshold: 80,
  },
  player: {
    baseSize: 20,
    basePickupRange: 80,
  },
};

// ============================================
// 可选角色配置
// ============================================

export const CHARACTERS: Character[] = [
  {
    id: 'warrior',
    name: '战士',
    description: '高生命值，高初始攻击力',
    baseStats: {
      maxHp: 150,
      currentHp: 150,
      attack: 20,
      defense: 5,
      moveSpeed: 3,
      pickupRange: 80,
      criticalRate: 0.1,
      criticalDamage: 1.5,
    },
    defaultWeapon: 'sword',
    icon: '⚔️',
  },
  {
    id: 'archer',
    name: '弓箭手',
    description: '高攻速，高暴击率',
    baseStats: {
      maxHp: 100,
      currentHp: 100,
      attack: 15,
      defense: 2,
      moveSpeed: 4,
      pickupRange: 80,
      criticalRate: 0.25,
      criticalDamage: 2.0,
    },
    defaultWeapon: 'bow',
    icon: '🏹',
  },
  {
    id: 'mage',
    name: '法师',
    description: '高伤害，高范围攻击',
    baseStats: {
      maxHp: 80,
      currentHp: 80,
      attack: 25,
      defense: 0,
      moveSpeed: 3.5,
      pickupRange: 100,
      criticalRate: 0.15,
      criticalDamage: 1.8,
    },
    defaultWeapon: 'magic',
    icon: '🔮',
  },
  {
    id: 'assassin',
    name: '刺客',
    description: '超高移速，高暴击伤害',
    baseStats: {
      maxHp: 90,
      currentHp: 90,
      attack: 18,
      defense: 1,
      moveSpeed: 5,
      pickupRange: 80,
      criticalRate: 0.3,
      criticalDamage: 2.5,
    },
    defaultWeapon: 'dagger',
    icon: '🗡️',
  },
];

// ============================================
// 武器配置
// ============================================

/** 近战武器ID列表 */
export const MELEE_WEAPONS = ['sword', 'axe', 'dagger'];

/** 远程武器ID列表 */
export const RANGED_WEAPONS = ['bow', 'magic'];

/** 投射物视觉配置 */
export const PROJECTILE_CONFIGS: Record<string, { color: string; speed: number; size: number }> = {
  bow: { color: '#D2691E', speed: 12, size: 5 },
  magic: { color: '#9370DB', speed: 7, size: 8 },
};

export const WEAPONS: Weapon[] = [
  {
    id: 'sword',
    name: '利剑',
    description: '环绕身边的剑，定期攻击最近敌人',
    type: 'sword',
    attackType: 'melee',
    baseDamage: 10,
    baseAttackSpeed: 1.0,
    baseRange: 150,
    basePierce: 1,
    orbitAngle: 0,
    upgrade: { level: 0, damage: 0, attackSpeed: 0, range: 0, pierce: 0 },
    icon: '⚔️',
    price: 100,
  },
  {
    id: 'bow',
    name: '长弓',
    description: '远程攻击武器，高攻速和远射程',
    type: 'bow',
    attackType: 'ranged',
    baseDamage: 8,
    baseAttackSpeed: 1.5,
    baseRange: 250,
    basePierce: 1,
    orbitAngle: 0,
    upgrade: { level: 0, damage: 0, attackSpeed: 0, range: 0, pierce: 0 },
    icon: '🏹',
    price: 150,
  },
  {
    id: 'magic',
    name: '法杖',
    description: '魔法攻击，可穿透多个敌人',
    type: 'magic',
    attackType: 'ranged',
    baseDamage: 15,
    baseAttackSpeed: 0.8,
    baseRange: 180,
    basePierce: 2,
    orbitAngle: 0,
    upgrade: { level: 0, damage: 0, attackSpeed: 0, range: 0, pierce: 0 },
    icon: '🔮',
    price: 200,
  },
  {
    id: 'axe',
    name: '战斧',
    description: '高伤害近战武器，可穿透多个敌人',
    type: 'axe',
    attackType: 'melee',
    baseDamage: 25,
    baseAttackSpeed: 0.6,
    baseRange: 120,
    basePierce: 3,
    orbitAngle: 0,
    upgrade: { level: 0, damage: 0, attackSpeed: 0, range: 0, pierce: 0 },
    icon: '🪓',
    price: 250,
  },
  {
    id: 'dagger',
    name: '匕首',
    description: '轻便武器，极快的攻击速度',
    type: 'dagger',
    attackType: 'melee',
    baseDamage: 6,
    baseAttackSpeed: 2.0,
    baseRange: 100,
    basePierce: 1,
    orbitAngle: 0,
    upgrade: { level: 0, damage: 0, attackSpeed: 0, range: 0, pierce: 0 },
    icon: '🗡️',
    price: 80,
  },
  {
    id: 'spear',
    name: '长矛',
    description: '中距离武器，平衡的伤害和穿透',
    type: 'sword',
    attackType: 'melee',
    baseDamage: 12,
    baseAttackSpeed: 0.9,
    baseRange: 200,
    basePierce: 2,
    orbitAngle: 0,
    upgrade: { level: 0, damage: 0, attackSpeed: 0, range: 0, pierce: 0 },
    icon: '🔱',
    price: 180,
  },
  {
    id: 'shield',
    name: '盾牌',
    description: '防御型武器，提供防御加成',
    type: 'sword',
    attackType: 'melee',
    baseDamage: 5,
    baseAttackSpeed: 1.2,
    baseRange: 80,
    basePierce: 1,
    orbitAngle: 0,
    upgrade: { level: 0, damage: 0, attackSpeed: 0, range: 0, pierce: 0 },
    icon: '🛡️',
    price: 120,
  },
];

// ============================================
// 被动道具配置
// ============================================

export const PASSIVES: Passive[] = [
  {
    id: 'health',
    name: '生命之心',
    description: '+20最大生命值',
    effect: { type: 'maxHp', value: 20 },
    stack: 0,
    maxStack: 10,
    icon: '❤️',
    price: 50,
  },
  {
    id: 'strength',
    name: '力量宝石',
    description: '+5攻击力',
    effect: { type: 'attack', value: 5 },
    stack: 0,
    maxStack: 8,
    icon: '💪',
    price: 60,
  },
  {
    id: 'defense',
    name: '护盾碎片',
    description: '+2防御力',
    effect: { type: 'defense', value: 2 },
    stack: 0,
    maxStack: 8,
    icon: '🛡️',
    price: 50,
  },
  {
    id: 'speed',
    name: '疾风之靴',
    description: '+0.5移动速度',
    effect: { type: 'moveSpeed', value: 0.5 },
    stack: 0,
    maxStack: 5,
    icon: '👟',
    price: 70,
  },
  {
    id: 'luck',
    name: '幸运硬币',
    description: '+5%暴击率',
    effect: { type: 'criticalRate', value: 0.05 },
    stack: 0,
    maxStack: 6,
    icon: '🍀',
    price: 80,
  },
  {
    id: 'fury',
    name: '狂怒之石',
    description: '+10%暴击伤害',
    effect: { type: 'criticalDamage', value: 0.1 },
    stack: 0,
    maxStack: 6,
    icon: '💥',
    price: 90,
  },
  {
    id: 'magnet',
    name: '磁铁',
    description: '+20拾取范围',
    effect: { type: 'pickupRange', value: 20 },
    stack: 0,
    maxStack: 5,
    icon: '🧲',
    price: 60,
  },
];

// ============================================
// 敌人类型配置
// ============================================

export const ENEMY_TYPES: EnemyTypeConfig[] = [
  {
    id: 'basic',
    name: '普通敌人',
    baseStats: {
      hp: 30,
      maxHp: 30,
      attack: 5,
      defense: 0,
      moveSpeed: 1.5,
      attackRange: 30,
      attackCooldown: 1000,
    },
    experienceValue: 10,
    goldValue: 5,
    size: 15,
    color: '#ff6b6b',
  },
  {
    id: 'fast',
    name: '快速敌人',
    baseStats: {
      hp: 20,
      maxHp: 20,
      attack: 3,
      defense: 0,
      moveSpeed: 3,
      attackRange: 25,
      attackCooldown: 800,
    },
    experienceValue: 8,
    goldValue: 3,
    size: 12,
    color: '#4ecdc4',
  },
  {
    id: 'tank',
    name: '坦克敌人',
    baseStats: {
      hp: 80,
      maxHp: 80,
      attack: 10,
      defense: 3,
      moveSpeed: 0.8,
      attackRange: 35,
      attackCooldown: 1500,
    },
    experienceValue: 25,
    goldValue: 15,
    size: 25,
    color: '#845ec2',
  },
  {
    id: 'swarm',
    name: '群体敌人',
    baseStats: {
      hp: 15,
      maxHp: 15,
      attack: 3,
      defense: 0,
      moveSpeed: 2.5,
      attackRange: 20,
      attackCooldown: 600,
    },
    experienceValue: 5,
    goldValue: 2,
    size: 10,
    color: '#ffc75f',
  },
];

// ============================================
// 颜色配置
// ============================================

export const COLORS = {
  player: '#4a9eff',
  playerOutline: '#3b82f6',
  enemy: '#ff6b6b',
  projectile: '#ffd93d',
  background: '#1a1a2e',
  grid: '#2a2a4e',
  hpBar: {
    background: '#374151',
    fill: '#ef4444',
  },
  expBar: {
    background: '#374151',
    fill: '#a855f7',
  },
  pickup: {
    gold: '#fbbf24',
    exp: '#a855f7',
    chest: '#f97316',
  },
} as const;

// ============================================
// 工具函数
// ============================================

export function getRequiredExperience(level: number): number {
  return Math.floor(
    GAME_CONFIG.experience.baseRequired *
      Math.pow(GAME_CONFIG.experience.growthFactor, level - 1)
  );
}

export const getSpawnRate = (difficulty: number): number => {
  return Math.max(
    GAME_CONFIG.difficulty.minSpawnRate,
    GAME_CONFIG.difficulty.baseSpawnRate * 
    Math.pow(GAME_CONFIG.difficulty.spawnRateDecay, difficulty - 1)
  );
};

export const getEnemyHpMultiplier = (difficulty: number): number => {
  return Math.pow(GAME_CONFIG.difficulty.hpGrowth, (difficulty - 1) / 2);
};

export const getEnemyAttackMultiplier = (difficulty: number): number => {
  return Math.pow(GAME_CONFIG.difficulty.attackGrowth, (difficulty - 1) / 2);
};

export function getSkillOptions(
  player: Player,
  availableWeapons: Weapon[],
  availablePassives: Passive[]
): SkillOption[] {
  const options: SkillOption[] = [];

  const newWeapons = availableWeapons.filter(
    (w) => !player.weapons.some((pw) => pw.id === w.id)
  );

  const upgradeableWeapons = player.weapons.filter(
    (w) => w.upgrade.level < 5
  );

  const stackablePassives = availablePassives.filter((p) => {
    const owned = player.passives.find((op) => op.id === p.id);
    return !owned || (owned && owned.stack < owned.maxStack);
  });

  const weaponOptions: SkillOption[] = newWeapons
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .map((w) => ({
      id: `weapon-new-${w.id}`,
      type: 'weapon' as const,
      weaponId: w.id,
      name: w.name,
      description: `获得新武器: ${w.description}`,
      icon: w.icon,
    }));

  const upgradeOptions: SkillOption[] = upgradeableWeapons
    .sort(() => Math.random() - 0.5)
    .slice(0, 1)
    .map((w) => ({
      id: `weapon-upgrade-${w.id}`,
      type: 'weapon' as const,
      weaponId: w.id,
      name: `${w.name}升一级`,
      description: `升级${w.name}到${w.upgrade.level + 1}级`,
      icon: w.icon,
    }));

  const passiveOptions: SkillOption[] = stackablePassives
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .map((p) => ({
      id: `passive-${p.id}`,
      type: 'passive' as const,
      passiveId: p.id,
      name: p.name,
      description: p.description,
      icon: p.icon,
    }));

  options.push(...weaponOptions, ...upgradeOptions, ...passiveOptions);

  return options.sort(() => Math.random() - 0.5).slice(0, 3);
}

export const getShopItems = (player: Player): (Weapon | Passive)[] => {
  const weapons = WEAPONS.filter(w => {
    const owned = player.weapons.some(pw => pw.id === w.id);
    return !owned;
  });
  
  const passives = PASSIVES.filter(p => {
    const owned = player.passives.find(op => op.id === p.id);
    return !owned || (owned && owned.stack < owned.maxStack);
  });
  
  const selectedWeapons = weapons.sort(() => Math.random() - 0.5).slice(0, 3);
  const selectedPassives = passives.sort(() => Math.random() - 0.5).slice(0, 2);
  
  return [...selectedWeapons, ...selectedPassives];
};

export const getWeaponUpgradePrice = (weapon: Weapon): number => {
  return Math.floor(weapon.price * Math.pow(1.5, weapon.upgrade.level));
};

// ============================================
// 本地存储工具
// ============================================

const LEADERBOARD_KEY = 'rogue_survivor_leaderboard';
const MAX_LEADERBOARD_ENTRIES = 10;

export const getLeaderboard = () => {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveScore = (score: number, time: number, characterId: string) => {
  const leaderboard = getLeaderboard();
  
  leaderboard.push({
    rank: 0,
    score,
    time,
    characterId,
    date: new Date().toISOString(),
  });
  
  leaderboard.sort((a: { score: number }, b: { score: number }) => b.score - a.score);
  
  const top10 = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES).map(
    (e: { score: number; time: number; characterId: string; date: string }, i: number) => ({
      ...e,
      rank: i + 1,
    })
  );
  
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(top10));
  return top10;
};