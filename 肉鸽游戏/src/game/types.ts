/**
 * 游戏类型定义文件
 * Rogue Survivor - 肉鸽游戏
 */

// ============================================
// 基础类型
// ============================================

/**
 * 2D向量坐标
 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * 矩形区域
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================
// 玩家类型
// ============================================

/**
 * 玩家属性
 */
export interface PlayerStats {
  /** 最大生命值 */
  maxHp: number;
  /** 当前生命值 */
  currentHp: number;
  /** 攻击力 */
  attack: number;
  /** 防御力 */
  defense: number;
  /** 移动速度 */
  moveSpeed: number;
  /** 拾取范围 */
  pickupRange: number;
  /** 暴击率 */
  criticalRate: number;
  /** 暴击伤害倍率 */
  criticalDamage: number;
}

/**
 * 玩家实体
 */
export interface Player {
  id: string;
  position: Vector2;
  size: number;
  stats: PlayerStats;
  weapons: Weapon[];
  passives: Passive[];
  experience: number;
  level: number;
  gold: number;
  characterId: string;
}

// ============================================
// 敌人类型
// ============================================

/**
 * 敌人属性
 */
export interface EnemyStats {
  /** 当前生命值 */
  hp: number;
  /** 最大生命值 */
  maxHp: number;
  /** 攻击力 */
  attack: number;
  /** 防御力 */
  defense: number;
  /** 移动速度 */
  moveSpeed: number;
  /** 攻击范围 */
  attackRange: number;
  /** 攻击冷却时间(ms) */
  attackCooldown: number;
}

/**
 * 敌人实体
 */
export interface Enemy {
  id: string;
  type: string;
  position: Vector2;
  size: number;
  stats: EnemyStats;
  experienceValue: number;
  goldValue: number;
  lastAttackTime?: number;
  /** 是否正在死亡 */
  isDying?: boolean;
  /** 死亡动画进度 0-1 */
  deathProgress?: number;
}

// ============================================
// 投射物类型
// ============================================


// ============================================
// 投射物类型
// ============================================

/**
 * 投射物实体
 */
export interface Projectile {
  id: string;
  position: Vector2;
  velocity: Vector2;
  size: number;
  damage: number;
  criticalRate: number;
  criticalDamage: number;
  /** 穿透次数 */
  pierce: number;
  /** 生命周期(ms) */
  lifetime: number;
  weaponId: string;
}

// ============================================
// 拾取物类型
// ============================================

/**
 * 拾取物类型
 */
export type PickupType = 'gold' | 'exp' | 'chest';

/**
 * 拾取物实体
 */
export interface Pickup {
  id: string;
  type: PickupType;
  position: Vector2;
  value: number;
  size: number;
  /** 是否正在飞向玩家 */
  isFlying: boolean;
}

// ============================================
// 武器系统类型
// ============================================

/**
 * 攻击类型
 */
export type AttackType = 'melee' | 'ranged';

/**
 * 武器类型
 */
export type WeaponType = 'sword' | 'bow' | 'magic' | 'axe' | 'dagger';

/**
 * 武器飞行阶段
 */
export type FlyPhase = 'orbit' | 'outgoing' | 'returning';



/**
 * 武器升级信息
 */
export interface WeaponUpgrade {
  level: number;
  damage: number;
  attackSpeed: number;
  range: number;
  pierce: number;
}

/**
 * 武器实体
 */
export interface Weapon {
  id: string;
  name: string;
  description: string;
  type: WeaponType;
  /** 攻击类型：近战或远程 */
  attackType: AttackType;
  baseDamage: number;
  baseAttackSpeed: number;
  baseRange: number;
  basePierce: number;
  /** 环绕角度(用于环绕类武器) */
  orbitAngle: number;
  upgrade: WeaponUpgrade;
  icon: string;
  price: number;
  lastAttackTime?: number;
  /** 当前朝向角度(用于瞄准) */
  currentAngle?: number;
  /** 目标朝向角度 */
  targetAngle?: number;
  /** 是否正在攻击(用于动画) */
  isAttacking?: boolean;
  /** 攻击动画进度 0-1 */
  attackProgress?: number;
  /** 是否正在飞行(近战武器飞向敌人) */
  isFlying?: boolean;
  /** 飞行位置 */
  flyPosition?: Vector2;
  /** 飞行目标位置 */
  flyTarget?: Vector2;
  /** 飞行阶段 */
  flyPhase?: FlyPhase;
  /** 飞行速度 */
  flySpeed?: number;
  /** 已命中的敌人ID列表(防止重复伤害) */
  hitEnemies?: string[];
}

// ============================================
// 被动技能类型
// ============================================

/**
 * 被动效果类型
 */
export type PassiveEffectType = 
  | 'attack' 
  | 'defense' 
  | 'moveSpeed' 
  | 'maxHp' 
  | 'pickupRange' 
  | 'criticalRate' 
  | 'criticalDamage';

/**
 * 被动效果
 */
export type PassiveEffect = 
  | { type: 'attack'; value: number }
  | { type: 'defense'; value: number }
  | { type: 'moveSpeed'; value: number }
  | { type: 'maxHp'; value: number }
  | { type: 'pickupRange'; value: number }
  | { type: 'criticalRate'; value: number }
  | { type: 'criticalDamage'; value: number };

/**
 * 被动道具实体
 */
export interface Passive {
  id: string;
  name: string;
  description: string;
  effect: PassiveEffect;
  stack: number;
  maxStack: number;
  icon: string;
  price: number;
}

// ============================================
// 角色系统类型
// ============================================

/**
 * 可选角色
 */
export interface Character {
  id: string;
  name: string;
  description: string;
  baseStats: PlayerStats;
  defaultWeapon: string;
  icon: string;
}

// ============================================
// 技能系统类型
// ============================================

/**
 * 技能选项类型
 */
export type SkillOptionType = 'weapon' | 'passive' | 'upgrade';

/**
 * 升级时的技能选项
 */
export interface SkillOption {
  id: string;
  type: SkillOptionType;
  weaponId?: string;
  passiveId?: string;
  name: string;
  description: string;
  icon: string;
}

// ============================================
// 游戏状态类型
// ============================================

/**
 * 游戏画面状态
 */
export type GameScreen = 'menu' | 'playing' | 'levelUp' | 'shop' | 'paused' | 'gameOver';

/**
 * 排行榜条目
 */
export interface LeaderboardEntry {
  rank: number;
  score: number;
  time: number;
  characterId: string;
  date: string;
}

// ============================================
// 游戏配置类型
// ============================================

/**
 * 画布配置
 */
export interface CanvasConfig {
  width: number;
  height: number;
}

/**
 * 难度配置
 */
export interface DifficultyConfig {
  /** 难度增加间隔(ms) */
  increaseInterval: number;
  /** 初始敌人生成间隔(ms) */
  baseSpawnRate: number;
  /** 最小生成间隔(ms) */
  minSpawnRate: number;
  /** 生成间隔衰减系数 */
  spawnRateDecay: number;
  /** 敌人HP增长系数 */
  hpGrowth: number;
  /** 敌人攻击增长系数 */
  attackGrowth: number;
}

/**
 * 经验配置
 */
export interface ExperienceConfig {
  /** 首级所需经验 */
  baseRequired: number;
  /** 经验增长系数 */
  growthFactor: number;
}

/**
 * 拾取配置
 */
export interface PickupConfig {
  /** 拾取物飞行速度 */
  flySpeed: number;
  /** 拾取范围阈值 */
  flyThreshold: number;
}

/**
 * 玩家配置
 */
export interface PlayerConfig {
  baseSize: number;
  basePickupRange: number;
}

/**
 * 游戏全局配置
 */
export interface GameConfig {
  canvas: CanvasConfig;
  difficulty: DifficultyConfig;
  experience: ExperienceConfig;
  pickup: PickupConfig;
  player: PlayerConfig;
}

// ============================================
// 商店系统类型
// ============================================

/**
 * 商店物品(武器或被动)
 */
export type ShopItem = Weapon | Passive;

// ============================================
// 敌人配置类型
// ============================================

/**
 * 敌人类型配置
 */
export interface EnemyTypeConfig {
  id: string;
  name: string;
  baseStats: EnemyStats;
  experienceValue: number;
  goldValue: number;
  size: number;
  color: string;
  icon?: string;
}