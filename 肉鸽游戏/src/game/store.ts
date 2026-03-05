import { create } from 'zustand';
import type { Player, Enemy, Projectile, Pickup, GameScreen, SkillOption, LeaderboardEntry, Vector2, Weapon, Passive, EnemyStats, ShopItem } from './types';
import { GAME_CONFIG, CHARACTERS, WEAPONS, PASSIVES, ENEMY_TYPES, getRequiredExperience, getSpawnRate, getEnemyHpMultiplier, getEnemyAttackMultiplier, getWeaponUpgradePrice, getLeaderboard, saveScore as saveScoreToStorage } from './constants';

interface GameStore {
  screen: GameScreen;
  isPaused: boolean;
  time: number;
  score: number;
  difficulty: number;
  lastSpawnTime: number;
  player: Player | null;
  enemies: Enemy[];
  projectiles: Projectile[];
  pickups: Pickup[];
  levelUpOptions: SkillOption[];
  shopItems: ShopItem[];
  leaderboard: LeaderboardEntry[];
  
  startGame: (characterId: string) => void;
  update: (deltaTime: number) => void;
  updatePlayerPosition: (position: Vector2) => void;
  addProjectile: (projectile: Projectile) => void;
  removeProjectile: (id: string) => void;
  addEnemy: (enemy: Enemy) => void;
  removeEnemy: (id: string) => void;
  addPickup: (pickup: Pickup) => void;
  removePickup: (id: string) => void;
  addExperience: (amount: number) => void;
  addGold: (amount: number) => void;
  purchaseWeapon: (weaponId: string) => boolean;
  purchasePassive: (passiveId: string) => boolean;
  upgradeWeapon: (weaponId: string) => boolean;
  selectSkill: (optionId: string) => void;
  openShop: () => void;
  closeShop: () => void;
  endGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  goToMenu: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const spawnEnemy = (difficulty: number): Enemy => {
  const enemyType = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
  const hpMultiplier = getEnemyHpMultiplier(difficulty);
  const attackMultiplier = getEnemyAttackMultiplier(difficulty);
  
  const side = Math.floor(Math.random() * 4);
  let x: number, y: number;
  
  if (side === 0) { x = Math.random() * GAME_CONFIG.canvas.width; y = -20; }
  else if (side === 1) { x = GAME_CONFIG.canvas.width + 20; y = Math.random() * GAME_CONFIG.canvas.height; }
  else if (side === 2) { x = Math.random() * GAME_CONFIG.canvas.width; y = GAME_CONFIG.canvas.height + 20; }
  else { x = -20; y = Math.random() * GAME_CONFIG.canvas.height; }
  
  const stats: EnemyStats = {
    hp: Math.floor(enemyType.baseStats.hp * hpMultiplier),
    maxHp: Math.floor(enemyType.baseStats.maxHp * hpMultiplier),
    attack: Math.floor(enemyType.baseStats.attack * attackMultiplier),
    defense: enemyType.baseStats.defense,
    moveSpeed: enemyType.baseStats.moveSpeed,
    attackRange: enemyType.baseStats.attackRange,
    attackCooldown: enemyType.baseStats.attackCooldown,
  };
  
  return {
    id: generateId(), type: enemyType.id, position: { x, y }, size: enemyType.size, stats,
    experienceValue: Math.floor(enemyType.experienceValue * (1 + (difficulty - 1) * 0.1)),
    goldValue: Math.floor(enemyType.goldValue * (1 + (difficulty - 1) * 0.1)),
  };
};

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'menu', isPaused: false, time: 0, score: 0, difficulty: 1, lastSpawnTime: 0,
  player: null, enemies: [], projectiles: [], pickups: [], levelUpOptions: [], shopItems: [], leaderboard: getLeaderboard(),
  
  startGame: (characterId) => {
    const character = CHARACTERS.find(c => c.id === characterId);
    if (!character) return;
    const defaultWeapon = WEAPONS.find(w => w.id === character.defaultWeapon);
    const player: Player = {
      id: 'player', position: { x: GAME_CONFIG.canvas.width / 2, y: GAME_CONFIG.canvas.height / 2 },
      size: GAME_CONFIG.player.baseSize, stats: { ...character.baseStats },
      weapons: defaultWeapon ? [{ ...defaultWeapon, upgrade: { level: 1, damage: 0, attackSpeed: 0, range: 0, pierce: 0 }, lastAttackTime: 0 }] : [],
      passives: [], experience: 0, level: 1, gold: 0, characterId,
    };
    set({ screen: 'playing', time: 0, score: 0, difficulty: 1, lastSpawnTime: 0, player, enemies: [], projectiles: [], pickups: [], isPaused: false, levelUpOptions: [], shopItems: [] });
  },
  
  update: (deltaTime) => {
    const state = get();
    if (state.screen !== 'playing' || state.isPaused || !state.player) return;
    
    const newTime = state.time + deltaTime;
    const newDifficulty = Math.floor(newTime / GAME_CONFIG.difficulty.increaseInterval) + 1;
    const newScore = state.score + Math.floor(deltaTime / 100);
    const spawnRate = getSpawnRate(newDifficulty);
    let newEnemies = [...state.enemies];
    let newLastSpawnTime = state.lastSpawnTime;
    
    if (newTime - state.lastSpawnTime >= spawnRate) { newEnemies.push(spawnEnemy(newDifficulty)); newLastSpawnTime = newTime; }
    
    const currentPlayer = state.player;
    newEnemies = newEnemies.map((enemy) => {
      const dx = currentPlayer.position.x - enemy.position.x;
      const dy = currentPlayer.position.y - enemy.position.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0) return { ...enemy, position: { x: enemy.position.x + (dx / dist) * enemy.stats.moveSpeed * (deltaTime / 16), y: enemy.position.y + (dy / dist) * enemy.stats.moveSpeed * (deltaTime / 16) } };
      return enemy;
    });
    
    let playerHp = currentPlayer.stats.currentHp;
    const now = Date.now();
    newEnemies.forEach((enemy) => {
      const dist = Math.hypot(currentPlayer.position.x - enemy.position.x, currentPlayer.position.y - enemy.position.y);
      if (dist < enemy.stats.attackRange + currentPlayer.size && (!enemy.lastAttackTime || now - enemy.lastAttackTime > enemy.stats.attackCooldown)) {
        playerHp = Math.max(0, playerHp - Math.max(1, enemy.stats.attack - currentPlayer.stats.defense));
        enemy.lastAttackTime = now;
      }
    });
    
    let newProjectiles = state.projectiles.map((proj) => ({ ...proj, position: { x: proj.position.x + proj.velocity.x * (deltaTime / 16), y: proj.position.y + proj.velocity.y * (deltaTime / 16) }, lifetime: proj.lifetime - deltaTime }))
      .filter((proj) => proj.lifetime > 0 && proj.position.x >= -50 && proj.position.x <= GAME_CONFIG.canvas.width + 50 && proj.position.y >= -50 && proj.position.y <= GAME_CONFIG.canvas.height + 50);
    
    const deadEnemyIds: string[] = [], hitProjectileIds: string[] = [];
    let totalExp = 0, totalGold = 0;
    const newPickups: Pickup[] = [];
    
    newProjectiles.forEach((proj) => {
      if (hitProjectileIds.includes(proj.id)) return;
      newEnemies.forEach((enemy) => {
        if (deadEnemyIds.includes(enemy.id)) return;
        if (Math.hypot(proj.position.x - enemy.position.x, proj.position.y - enemy.position.y) < proj.size + enemy.size) {
          let damage = proj.damage;
          if (Math.random() < proj.criticalRate) damage *= proj.criticalDamage;
          enemy.stats.hp -= damage;
          proj.pierce--;
          if (proj.pierce <= 0) hitProjectileIds.push(proj.id);
          if (enemy.stats.hp <= 0) {
            deadEnemyIds.push(enemy.id);
            totalExp += enemy.experienceValue;
            totalGold += enemy.goldValue;
            if (Math.random() < 0.3) newPickups.push({ id: generateId(), type: Math.random() < 0.5 ? 'gold' : 'exp', position: { ...enemy.position }, value: Math.random() < 0.5 ? enemy.goldValue : enemy.experienceValue, size: 8, isFlying: false });
          }
        }
      });
    });
    
    newEnemies = newEnemies.filter((e) => !deadEnemyIds.includes(e.id));
    newProjectiles = newProjectiles.filter((p) => !hitProjectileIds.includes(p.id));
    
    let updatedPickups = [...state.pickups, ...newPickups];
    const collectedPickupIds: string[] = [];
    updatedPickups = updatedPickups.map((pickup) => {
      const dist = Math.hypot(pickup.position.x - currentPlayer.position.x, pickup.position.y - currentPlayer.position.y);
      let updated = dist < currentPlayer.stats.pickupRange ? { ...pickup, isFlying: true } : pickup;
      if (updated.isFlying) {
        const dx = currentPlayer.position.x - updated.position.x, dy = currentPlayer.position.y - updated.position.y;
        const flyDist = Math.hypot(dx, dy);
        if (flyDist < currentPlayer.size + updated.size) { collectedPickupIds.push(updated.id); if (updated.type === 'exp') totalExp += updated.value; else if (updated.type === 'gold') totalGold += updated.value; return updated; }
        return { ...updated, position: { x: updated.position.x + (dx / flyDist) * GAME_CONFIG.pickup.flySpeed * (deltaTime / 16), y: updated.position.y + (dy / flyDist) * GAME_CONFIG.pickup.flySpeed * (deltaTime / 16) } };
      }
      return updated;
    }).filter((p) => !collectedPickupIds.includes(p.id));
    
    let newPlayer = { ...currentPlayer, stats: { ...currentPlayer.stats, currentHp: playerHp }, gold: currentPlayer.gold + totalGold };
    let newExp = newPlayer.experience + totalExp, newLevel = newPlayer.level, levelUpTriggered = false;
    while (newExp >= getRequiredExperience(newLevel)) { newExp -= getRequiredExperience(newLevel); newLevel++; levelUpTriggered = true; newPlayer.stats.maxHp += 10; newPlayer.stats.currentHp = Math.min(newPlayer.stats.currentHp + 10, newPlayer.stats.maxHp); newPlayer.stats.attack += 2; }
    newPlayer.experience = newExp;
    newPlayer.level = newLevel;
    
    if (playerHp <= 0) { const finalScore = newScore + newPlayer.gold; set({ screen: 'gameOver', player: newPlayer, time: newTime, score: finalScore, leaderboard: saveScoreToStorage(finalScore, newTime, newPlayer.characterId) }); return; }
    
    set({ time: newTime, score: newScore, difficulty: newDifficulty, lastSpawnTime: newLastSpawnTime, player: newPlayer, enemies: newEnemies, projectiles: newProjectiles, pickups: updatedPickups });
    
    if (levelUpTriggered) {
      const availableWeapons = WEAPONS.filter(w => !newPlayer.weapons.some(pw => pw.id === w.id));
      const upgradeableWeapons = newPlayer.weapons.filter(w => w.upgrade.level < 5);
      const availablePassives = PASSIVES.filter(p => { const owned = newPlayer.passives.find(op => op.id === p.id); return !owned || (owned && owned.stack < owned.maxStack); });
      const weaponOptions: SkillOption[] = availableWeapons.sort(() => Math.random() - 0.5).slice(0, 2).map(w => ({ id: `weapon-${w.id}`, type: 'weapon' as const, weaponId: w.id, name: w.name, description: `获得新武器: ${w.description}`, icon: w.icon }));
      const upgradeOptions: SkillOption[] = upgradeableWeapons.sort(() => Math.random() - 0.5).slice(0, 1).map(w => ({ id: `upgrade-${w.id}`, type: 'upgrade' as const, weaponId: w.id, name: `${w.name}升一级`, description: `升级${w.name}到${w.upgrade.level + 1}级`, icon: w.icon }));
      const passiveOptions: SkillOption[] = availablePassives.sort(() => Math.random() - 0.5).slice(0, 1).map(p => ({ id: `passive-${p.id}`, type: 'passive' as const, passiveId: p.id, name: p.name, description: p.description, icon: p.icon }));
      set({ screen: 'levelUp', levelUpOptions: [...weaponOptions, ...upgradeOptions, ...passiveOptions].sort(() => Math.random() - 0.5).slice(0, 3) });
    }
  },
  
  updatePlayerPosition: (position) => { const state = get(); if (!state.player) return; set({ player: { ...state.player, position: { x: Math.max(state.player.size, Math.min(GAME_CONFIG.canvas.width - state.player.size, position.x)), y: Math.max(state.player.size, Math.min(GAME_CONFIG.canvas.height - state.player.size, position.y)) } } }); },
  addProjectile: (projectile) => { set((state) => ({ projectiles: [...state.projectiles, projectile] })); },
  removeProjectile: (id) => { set((state) => ({ projectiles: state.projectiles.filter((p) => p.id !== id) })); },
  addEnemy: (enemy) => { set((state) => ({ enemies: [...state.enemies, enemy] })); },
  removeEnemy: (id) => { set((state) => ({ enemies: state.enemies.filter((e) => e.id !== id) })); },
  addPickup: (pickup) => { set((state) => ({ pickups: [...state.pickups, pickup] })); },
  removePickup: (id) => { set((state) => ({ pickups: state.pickups.filter((p) => p.id !== id) })); },
  addExperience: (amount) => { const state = get(); if (!state.player) return; set({ player: { ...state.player, experience: state.player.experience + amount } }); },
  addGold: (amount) => { const state = get(); if (!state.player) return; set({ player: { ...state.player, gold: state.player.gold + amount } }); },
  
  purchaseWeapon: (weaponId) => { const state = get(); if (!state.player) return false; const weapon = WEAPONS.find(w => w.id === weaponId); if (!weapon || state.player.gold < weapon.price || state.player.weapons.some(w => w.id === weaponId)) return false; set({ player: { ...state.player, gold: state.player.gold - weapon.price, weapons: [...state.player.weapons, { ...weapon, upgrade: { level: 1, damage: 0, attackSpeed: 0, range: 0, pierce: 0 }, lastAttackTime: 0 }] } }); return true; },
  purchasePassive: (passiveId) => { const state = get(); if (!state.player) return false; const passive = PASSIVES.find(p => p.id === passiveId); if (!passive || state.player.gold < passive.price) return false; const existingPassive = state.player.passives.find(p => p.id === passiveId); if (existingPassive && existingPassive.stack >= existingPassive.maxStack) return false; const effectKey = passive.effect.type as keyof typeof state.player.stats; const newStats = { ...state.player.stats, [effectKey]: state.player.stats[effectKey] + passive.effect.value }; if (passive.effect.type === 'maxHp') newStats.currentHp = newStats.currentHp + passive.effect.value; set({ player: { ...state.player, gold: state.player.gold - passive.price, passives: existingPassive ? state.player.passives.map(p => p.id === passiveId ? { ...p, stack: p.stack + 1 } : p) : [...state.player.passives, { ...passive, stack: 1 }], stats: newStats } }); return true; },
  upgradeWeapon: (weaponId) => { const state = get(); if (!state.player) return false; const weaponIndex = state.player.weapons.findIndex(w => w.id === weaponId); if (weaponIndex === -1) return false; const weapon = state.player.weapons[weaponIndex]; const upgradePrice = getWeaponUpgradePrice(weapon); if (state.player.gold < upgradePrice || weapon.upgrade.level >= 5) return false; const newWeapons = [...state.player.weapons]; newWeapons[weaponIndex] = { ...weapon, upgrade: { level: weapon.upgrade.level + 1, damage: weapon.upgrade.damage + Math.floor(weapon.baseDamage * 0.2), attackSpeed: weapon.upgrade.attackSpeed + 10, range: weapon.upgrade.range + 5, pierce: weapon.upgrade.pierce + (weapon.upgrade.level % 3 === 0 ? 1 : 0) } }; set({ player: { ...state.player, gold: state.player.gold - upgradePrice, weapons: newWeapons } }); return true; },
  
  selectSkill: (optionId) => { const state = get(); if (!state.player) return; const option = state.levelUpOptions.find(o => o.id === optionId); if (!option) { set({ screen: 'playing', levelUpOptions: [] }); return; } let newPlayer = { ...state.player }; if (option.type === 'weapon' && option.weaponId) { const weapon = WEAPONS.find(w => w.id === option.weaponId); if (weapon && !newPlayer.weapons.some(w => w.id === option.weaponId)) newPlayer.weapons = [...newPlayer.weapons, { ...weapon, upgrade: { level: 1, damage: 0, attackSpeed: 0, range: 0, pierce: 0 }, lastAttackTime: 0 }]; } else if (option.type === 'upgrade' && option.weaponId) { const weaponIndex = newPlayer.weapons.findIndex(w => w.id === option.weaponId); if (weaponIndex !== -1) { const weapon = newPlayer.weapons[weaponIndex]; newPlayer.weapons = [...newPlayer.weapons]; newPlayer.weapons[weaponIndex] = { ...weapon, upgrade: { level: weapon.upgrade.level + 1, damage: weapon.upgrade.damage + Math.floor(weapon.baseDamage * 0.2), attackSpeed: weapon.upgrade.attackSpeed + 10, range: weapon.upgrade.range + 5, pierce: weapon.upgrade.pierce + (weapon.upgrade.level % 3 === 0 ? 1 : 0) } }; } } else if (option.type === 'passive' && option.passiveId) { const passive = PASSIVES.find(p => p.id === option.passiveId); if (passive) { const effectKey = passive.effect.type as keyof typeof newPlayer.stats; newPlayer.stats = { ...newPlayer.stats, [effectKey]: newPlayer.stats[effectKey] + passive.effect.value }; if (passive.effect.type === 'maxHp') newPlayer.stats.currentHp = newPlayer.stats.currentHp + passive.effect.value; const existingPassive = newPlayer.passives.find(p => p.id === option.passiveId); newPlayer.passives = existingPassive ? newPlayer.passives.map(p => p.id === option.passiveId ? { ...p, stack: p.stack + 1 } : p) : [...newPlayer.passives, { ...passive, stack: 1 }]; } } set({ player: newPlayer, screen: 'playing', levelUpOptions: [] }); },
  
  openShop: () => { const state = get(); if (state.screen !== 'playing' || !state.player) return; const weapons = WEAPONS.filter(w => !state.player!.weapons.some(pw => pw.id === w.id)); const passives = PASSIVES.filter(p => { const owned = state.player!.passives.find(op => op.id === p.id); return !owned || (owned && owned.stack < owned.maxStack); }); set({ screen: 'shop', shopItems: [...weapons.sort(() => Math.random() - 0.5).slice(0, 3), ...passives.sort(() => Math.random() - 0.5).slice(0, 2)], isPaused: true }); },
  closeShop: () => { set({ screen: 'playing', isPaused: false }); },
  endGame: () => { const state = get(); if (!state.player) return; const finalScore = state.score + state.player.gold; set({ screen: 'gameOver', score: finalScore, leaderboard: saveScoreToStorage(finalScore, state.time, state.player.characterId) }); },
  pauseGame: () => { set({ isPaused: true, screen: 'paused' }); },
  resumeGame: () => { set({ isPaused: false, screen: 'playing' }); },
  restartGame: () => { const state = get(); if (state.player) get().startGame(state.player.characterId); },
  goToMenu: () => { set({ screen: 'menu', isPaused: false, player: null, enemies: [], projectiles: [], pickups: [], time: 0, score: 0, difficulty: 1 }); },
}));

export default useGameStore;