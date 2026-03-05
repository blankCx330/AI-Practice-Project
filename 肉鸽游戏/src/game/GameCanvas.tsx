import React, { useRef, useEffect, useCallback } from 'react';
import { useGameStore } from './store';
import { GAME_CONFIG, COLORS, ENEMY_TYPES, MELEE_WEAPONS, PROJECTILE_CONFIGS } from './constants';
import type { Projectile, Enemy, Pickup, Player, Weapon, Vector2, FlyPhase } from './types';

// ============================================
// GameCanvas Component
// ============================================

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());
  
  const screen = useGameStore(s => s.screen);
  const update = useGameStore(s => s.update);
  const updatePlayerPosition = useGameStore(s => s.updatePlayerPosition);
  const addProjectile = useGameStore(s => s.addProjectile);
  const openShop = useGameStore(s => s.openShop);
  const pauseGame = useGameStore(s => s.pauseGame);
  const resumeGame = useGameStore(s => s.resumeGame);
  const isPaused = useGameStore(s => s.isPaused);
  const closeShop = useGameStore(s => s.closeShop);
  
  // Generate projectile ID
  const generateId = useCallback(() => {
    return `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);
  
  // Auto attack logic
  const handleAutoAttack = useCallback((currentTime: number) => {
    const store = useGameStore.getState();
    if (!store.player || store.screen !== 'playing' || store.isPaused) return;
    
    // Skip if any weapon is flying
    const anyWeaponFlying = store.player.weapons.some(w => w.isFlying);
    if (anyWeaponFlying) return;
    
    store.player.weapons.forEach((weapon, index) => {
      const attackSpeed = weapon.baseAttackSpeed * (1 + weapon.upgrade.attackSpeed / 100);
      const interval = 1000 / attackSpeed;
      const lastAttack = weapon.lastAttackTime || 0;
      
      if (currentTime - lastAttack < interval) return;
      
      // Calculate weapon position (orbiting player)
      const orbitAngle = weapon.orbitAngle + (index * Math.PI * 2 / store.player!.weapons.length);
      const weaponX = store.player!.position.x + Math.cos(orbitAngle) * (store.player!.size + 30);
      const weaponY = store.player!.position.y + Math.sin(orbitAngle) * (store.player!.size + 30);
      
      // Find nearest enemy within range
      const range = weapon.baseRange * (1 + weapon.upgrade.range / 100);
      let target: Enemy | null = null;
      let minDist = Infinity;
      
      for (const enemy of store.enemies) {
        const dist = Math.hypot(
          enemy.position.x - store.player!.position.x,
          enemy.position.y - store.player!.position.y
        );
        if (dist < range && dist < minDist && !enemy.isDying) {
          minDist = dist;
          target = enemy;
        }
      }
      
      if (target) {
        // Calculate direction to target
        const angle = Math.atan2(
          target.position.y - weaponY,
          target.position.x - weaponX
        );
        
        const baseDamage = weapon.baseDamage + weapon.upgrade.damage;
        const damage = baseDamage * (1 + store.player!.stats.attack / 100);
        
        // Check if melee or ranged weapon
        const isMelee = MELEE_WEAPONS.includes(weapon.id) || weapon.attackType === 'melee';
        
        if (isMelee) {
          // Melee weapon: start flying towards enemy
          const flySpeed = 8;
          const newWeapons = store.player!.weapons.map((w, i) => 
            i === index ? { 
              ...w, 
              lastAttackTime: currentTime, 
              targetAngle: angle,
              isFlying: true,
              flyPhase: 'outgoing' as const,
              flyPosition: { x: weaponX, y: weaponY },
              flyTarget: { x: target!.position.x, y: target!.position.y },
              flySpeed,
              hitEnemies: [],
            } : w
          );
          useGameStore.setState({
            player: { ...store.player!, weapons: newWeapons }
          });
        } else {
          // Ranged weapon: create projectile with weapon-specific visuals
          const projConfig = PROJECTILE_CONFIGS[weapon.id] || { color: COLORS.projectile, speed: 8, size: 6 };
          
          const projectile: Projectile = {
            id: generateId(),
            position: { x: weaponX, y: weaponY },
            velocity: {
              x: Math.cos(angle) * projConfig.speed,
              y: Math.sin(angle) * projConfig.speed,
            },
            size: projConfig.size,
            damage,
            criticalRate: store.player!.stats.criticalRate,
            criticalDamage: store.player!.stats.criticalDamage,
            pierce: weapon.basePierce + weapon.upgrade.pierce,
            lifetime: 2000,
            weaponId: weapon.id,
          };
          
          addProjectile(projectile);
          
          // Update weapon attack time
          const newWeapons = store.player!.weapons.map((w, i) => 
            i === index ? { ...w, lastAttackTime: currentTime, targetAngle: angle } : w
          );
          useGameStore.setState({
            player: { ...store.player!, weapons: newWeapons }
          });
        }
      }
    });
  }, [addProjectile, generateId]);
  
  // Handle player input
  const handleInput = useCallback((deltaTime: number) => {
    const store = useGameStore.getState();
    if (!store.player || store.screen !== 'playing' || store.isPaused) return;
    
    const speed = store.player.stats.moveSpeed;
    let dx = 0, dy = 0;
    
    if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) dy -= 1;
    if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) dy += 1;
    if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) dx -= 1;
    if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) dx += 1;
    
    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx = (dx / length) * speed * (deltaTime / 16);
      dy = (dy / length) * speed * (deltaTime / 16);
      
      const newX = Math.max(20, Math.min(GAME_CONFIG.canvas.width - 20, store.player.position.x + dx));
      const newY = Math.max(20, Math.min(GAME_CONFIG.canvas.height - 20, store.player.position.y + dy));
      
      updatePlayerPosition({ x: newX, y: newY });
    }
  }, [updatePlayerPosition]);
  
  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.add(key);
      
      if (key === 'b' && screen === 'playing') {
        openShop();
      }
      if (key === 'escape') {
        if (screen === 'paused') {
          resumeGame();
        } else if (screen === 'playing') {
          pauseGame();
        } else if (screen === 'shop') {
          closeShop();
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen, openShop, pauseGame, resumeGame, closeShop]);
  
  // Render function
  const render = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const store = useGameStore.getState();
    
    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid background
    drawGrid(ctx, width, height);
    
    // Draw pickups
    store.pickups.forEach(pickup => drawPickup(ctx, pickup));
    
    // Draw enemies (including dying ones with animation)
    store.enemies.forEach(enemy => drawEnemy(ctx, enemy));
    
    // Draw projectiles with weapon-specific visuals
    store.projectiles.forEach(proj => drawProjectile(ctx, proj));
    
    // Draw player
    if (store.player) {
      drawPlayer(ctx, store.player);
      drawWeapons(ctx, store.player);
    }
  }, []);
  
  // Main game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (canvas && ctx) {
      if (screen === 'playing' && !isPaused) {
        // Update game state
        update(deltaTime);
        
        // Handle input
        handleInput(deltaTime);
        
        // Auto attack
        handleAutoAttack(timestamp);
        
        // Update weapon flight
        updateWeaponFlight(deltaTime);
        
        // Update death animations
        updateDeathAnimations(deltaTime);
      }
      
      // Render
      render(ctx, canvas.width, canvas.height);
    }
    
    animationIdRef.current = requestAnimationFrame(gameLoop);
  }, [screen, isPaused, update, handleInput, handleAutoAttack, render]);
  
  // Start game loop
  useEffect(() => {
    animationIdRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationIdRef.current);
  }, [gameLoop]);
  
  return (
    <canvas
      ref={canvasRef}
      width={GAME_CONFIG.canvas.width}
      height={GAME_CONFIG.canvas.height}
      style={{
        display: 'block',
        margin: '0 auto',
        background: COLORS.background,
        borderRadius: '8px',
        border: '2px solid #374151',
      }}
    />
  );
};

// ============================================
// Helper Functions
// ============================================

const DEATH_ANIMATION_DURATION = 300;
const WEAPON_RETURN_SPEED = 10;

/**
 * Update weapon flight animation
 * Handles: outgoing (flying to target) -> returning (flying back to player)
 */
const updateWeaponFlight = (deltaTime: number) => {
  const store = useGameStore.getState();
  if (!store.player) return;
  
  const newEnemies = [...store.enemies];
  let enemiesUpdated = false;
  let weaponsUpdated = false;
  
  const newWeapons = store.player.weapons.map((weapon, index): Weapon => {
    if (!weapon.isFlying || !weapon.flyPosition) return weapon;
    
    let newFlyPosition = { ...weapon.flyPosition };
    let newFlyPhase: FlyPhase = weapon.flyPhase || 'outgoing';
    let newHitEnemies = weapon.hitEnemies ? [...weapon.hitEnemies] : [];
    
    const playerPos = store.player!.position;
    const orbitAngle = weapon.orbitAngle + (index * Math.PI * 2 / store.player!.weapons.length);
    const returnPosition: Vector2 = {
      x: playerPos.x + Math.cos(orbitAngle) * (store.player!.size + 30),
      y: playerPos.y + Math.sin(orbitAngle) * (store.player!.size + 30),
    };
    
    if (weapon.flyPhase === 'outgoing' && weapon.flyTarget) {
      // Flying towards target
      const dx = weapon.flyTarget.x - weapon.flyPosition.x;
      const dy = weapon.flyTarget.y - weapon.flyPosition.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist < 10) {
        // Reached target, start returning
        newFlyPhase = 'returning';
      } else {
        // Continue flying towards target
        const speed = weapon.flySpeed || 8;
        newFlyPosition.x += (dx / dist) * speed;
        newFlyPosition.y += (dy / dist) * speed;
        
        // Check collision with enemies during flight
        const pierce = weapon.basePierce + weapon.upgrade.pierce;
        
        for (const enemy of newEnemies) {
          if (enemy.isDying) continue;
          if (newHitEnemies.includes(enemy.id)) continue;
          if (newHitEnemies.length >= pierce) break;
          
          const enemyDist = Math.hypot(
            enemy.position.x - newFlyPosition.x,
            enemy.position.y - newFlyPosition.y
          );
          
          if (enemyDist < enemy.size + 15) {
            // Hit enemy
            const baseDamage = weapon.baseDamage + weapon.upgrade.damage;
            let finalDamage = baseDamage * (1 + store.player!.stats.attack / 100);
            
            if (Math.random() < store.player!.stats.criticalRate) {
              finalDamage *= store.player!.stats.criticalDamage;
            }
            
            enemy.stats.hp -= finalDamage;
            newHitEnemies.push(enemy.id);
            enemiesUpdated = true;
            
            if (enemy.stats.hp <= 0 && !enemy.isDying) {
              enemy.isDying = true;
              enemy.deathProgress = 0;
            }
            
            weaponsUpdated = true;
          }
        }
        
        // If pierced enough enemies, start returning
        if (newHitEnemies.length >= pierce) {
          newFlyPhase = 'returning';
        }
      }
    } else if (weapon.flyPhase === 'returning') {
      // Flying back to player
      const dx = returnPosition.x - weapon.flyPosition.x;
      const dy = returnPosition.y - weapon.flyPosition.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist < 20) {
        // Returned to player
        weaponsUpdated = true;
        return {
          ...weapon,
          isFlying: false,
          flyPhase: 'orbit',
          flyPosition: undefined,
          flyTarget: undefined,
          hitEnemies: [],
        };
      } else {
        // Continue flying back
        newFlyPosition.x += (dx / dist) * WEAPON_RETURN_SPEED;
        newFlyPosition.y += (dy / dist) * WEAPON_RETURN_SPEED;
      }
    }
    
    weaponsUpdated = true;
    return {
      ...weapon,
      flyPosition: newFlyPosition,
      flyPhase: newFlyPhase,
      hitEnemies: newHitEnemies,
    };
  });
  
  if (enemiesUpdated) {
    useGameStore.setState({ enemies: newEnemies });
  }
  if (weaponsUpdated) {
    useGameStore.setState({ player: { ...store.player!, weapons: newWeapons } });
  }
};

/**
 * Update weapon flight animation
 * Handles: outgoing (flying to target) -> returning (flying back to player)
 */
const updateWeaponFlight = (deltaTime: number) => {
  const store = useGameStore.getState();
  if (!store.player) return;
  
  const newEnemies = [...store.enemies];
  let enemiesUpdated = false;
  let weaponsUpdated = false;
  
  const newWeapons = store.player.weapons.map((weapon, index) => {
    if (!weapon.isFlying || !weapon.flyPosition) return weapon;
    
    let newFlyPosition = { ...weapon.flyPosition };
    let newFlyPhase: FlyPhase = weapon.flyPhase;
    let newHitEnemies = weapon.hitEnemies ? [...weapon.hitEnemies] : [];
    
    const playerPos = store.player!.position;
    const orbitAngle = weapon.orbitAngle + (index * Math.PI * 2 / store.player!.weapons.length);
    const returnPosition: Vector2 = {
      x: playerPos.x + Math.cos(orbitAngle) * (store.player!.size + 30),
      y: playerPos.y + Math.sin(orbitAngle) * (store.player!.size + 30),
    };
    
    if (weapon.flyPhase === 'outgoing' && weapon.flyTarget) {
      // Flying towards target
      const dx = weapon.flyTarget.x - weapon.flyPosition.x;
      const dy = weapon.flyTarget.y - weapon.flyPosition.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist < 10) {
        // Reached target, start returning
        newFlyPhase = 'returning' as FlyPhase;
      } else {
        // Continue flying towards target
        const speed = weapon.flySpeed || 8;
        newFlyPosition.x += (dx / dist) * speed;
        newFlyPosition.y += (dy / dist) * speed;
        
        // Check collision with enemies during flight
        const pierce = weapon.basePierce + weapon.upgrade.pierce;
        
        for (const enemy of newEnemies) {
          if (enemy.isDying) continue;
          if (newHitEnemies.includes(enemy.id)) continue;
          if (newHitEnemies.length >= pierce) break;
          
          const enemyDist = Math.hypot(
            enemy.position.x - newFlyPosition.x,
            enemy.position.y - newFlyPosition.y
          );
          
          if (enemyDist < enemy.size + 15) {
            // Hit enemy
            const baseDamage = weapon.baseDamage + weapon.upgrade.damage;
            let finalDamage = baseDamage * (1 + store.player!.stats.attack / 100);
            
            if (Math.random() < store.player!.stats.criticalRate) {
              finalDamage *= store.player!.stats.criticalDamage;
            }
            
            enemy.stats.hp -= finalDamage;
            newHitEnemies.push(enemy.id);
            enemiesUpdated = true;
            
            if (enemy.stats.hp <= 0 && !enemy.isDying) {
              enemy.isDying = true;
              enemy.deathProgress = 0;
            }
            
            weaponsUpdated = true;
          }
        }
        
        // If pierced enough enemies, start returning
        if (newHitEnemies.length >= pierce) {
          newFlyPhase = 'returning' as FlyPhase;
        }
      }
    } else if (weapon.flyPhase === 'returning') {
      // Flying back to player
      const dx = returnPosition.x - weapon.flyPosition.x;
      const dy = returnPosition.y - weapon.flyPosition.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist < 20) {
        // Returned to player
        weaponsUpdated = true;
        return {
          ...weapon,
          isFlying: false,
    }
    
    weaponsUpdated = true;
    return {
      ...weapon,
      flyPosition: newFlyPosition,
      flyPhase: newFlyPhase as FlyPhase,
      hitEnemies: newHitEnemies,
    } as Weapon;
  });
  
  if (enemiesUpdated) {
    useGameStore.setState({ enemies: newEnemies });
  }
  if (weaponsUpdated) {
    useGameStore.setState({ player: { ...store.player!, weapons: newWeapons } });
  }
};

const updateDeathAnimations = (deltaTime: number) => {
  const store = useGameStore.getState();
  const newEnemies = store.enemies.map(enemy => {
    if (enemy.isDying && enemy.deathProgress !== undefined) {
      const newProgress = enemy.deathProgress + deltaTime / DEATH_ANIMATION_DURATION;
      return { ...enemy, deathProgress: Math.min(1, newProgress) };
    }
    return enemy;
  }).filter(enemy => !enemy.isDying || (enemy.deathProgress !== undefined && enemy.deathProgress < 1));
  
  useGameStore.setState({ enemies: newEnemies });
};

// ============================================
// Drawing Helper Functions
// ============================================

const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  
  const gridSize = 50;
  
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player) => {
  const { position, size, stats } = player;
  
  // Draw player body
  ctx.beginPath();
  ctx.arc(position.x, position.y, size, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.player;
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Draw HP bar
  const hpBarWidth = size * 2;
  const hpBarHeight = 4;
  const hpBarX = position.x - hpBarWidth / 2;
  const hpBarY = position.y - size - 10;
  
  ctx.fillStyle = '#374151';
  ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
  
  const hpPercent = stats.currentHp / stats.maxHp;
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);
};

const drawWeapons = (ctx: CanvasRenderingContext2D, player: Player) => {
  const { position, size, weapons } = player;
  
  weapons.forEach((weapon, index) => {
    let weaponX: number;
    let weaponY: number;
    let rotation: number;
    
    // Check if weapon is flying
    if (weapon.isFlying && weapon.flyPosition) {
      // Use flying position
      weaponX = weapon.flyPosition.x;
      weaponY = weapon.flyPosition.y;
      
      // Calculate rotation based on flight direction
      if (weapon.flyTarget && weapon.flyPhase === 'outgoing') {
        rotation = Math.atan2(
          weapon.flyTarget.y - weaponY,
          weapon.flyTarget.x - weaponX
        );
      } else {
        // Returning - point towards player
        rotation = Math.atan2(
          position.y - weaponY,
          position.x - weaponX
        );
      }
      
      // Draw trail effect for flying weapons
      drawWeaponTrail(ctx, weapon, weaponX, weaponY);
    } else {
      // Normal orbit position
      const orbitAngle = weapon.orbitAngle + (index * Math.PI * 2 / weapons.length) + (Date.now() * 0.002);
      weaponX = position.x + Math.cos(orbitAngle) * (size + 30);
      weaponY = position.y + Math.sin(orbitAngle) * (size + 30);
      
      // Use target angle for aiming if available
      rotation = orbitAngle;
      if (weapon.targetAngle !== undefined) {
        const currentAngle = weapon.currentAngle ?? orbitAngle;
        const angleDiff = weapon.targetAngle - currentAngle;
        const normalizedDiff = ((angleDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
        rotation = currentAngle + normalizedDiff * 0.1;
      }
    }
    
    // Draw weapon with rotation
    ctx.save();
    ctx.translate(weaponX, weaponY);
    ctx.rotate(rotation + Math.PI / 4); // Offset for natural look
    
    // Attack animation scale
    let scale = 1;
    if (weapon.isAttacking && weapon.attackProgress !== undefined) {
      scale = 1 + Math.sin(weapon.attackProgress * Math.PI) * 0.3;
    }
    
    // Larger scale for flying weapons
    if (weapon.isFlying) {
      scale = 1.2;
    }
    
    ctx.font = `${20 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Glow for attacking or flying
    if (weapon.isAttacking || weapon.isFlying) {
      ctx.shadowColor = weapon.isFlying ? '#ff6b6b' : '#ffd700';
      ctx.shadowBlur = 15;
    }
    
    ctx.fillText(weapon.icon, 0, 0);
    ctx.shadowBlur = 0;
    ctx.restore();
  });
};

/**
 * Draw trail effect for flying weapons
 */
const drawWeaponTrail = (ctx: CanvasRenderingContext2D, weapon: Weapon, x: number, y: number) => {
  if (!weapon.flyTarget || weapon.flyPhase !== 'outgoing') return;
  
  // Draw motion trail
  const dx = weapon.flyTarget.x - x;
  const dy = weapon.flyTarget.y - y;
  const dist = Math.hypot(dx, dy);
  
  if (dist > 0) {
    const trailLength = Math.min(dist, 40);
    const trailX = x - (dx / dist) * trailLength;
    const trailY = y - (dy / dist) * trailLength;
    
    ctx.beginPath();
    ctx.moveTo(trailX, trailY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
};

const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
  const { position, size, stats, type, isDying, deathProgress } = enemy;
  
  // Get enemy type color
  const enemyType = ENEMY_TYPES.find(t => t.id === type);
  const color = enemyType?.color || COLORS.enemy;
  
  // Handle death animation
  let drawSize = size;
  let alpha = 1;
  
  if (isDying && deathProgress !== undefined) {
    // Shrink and fade
    drawSize = size * (1 - deathProgress * 0.5);
    alpha = 1 - deathProgress;
    
    // Flash white near end
    if (deathProgress > 0.7) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(position.x, position.y, drawSize + 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  ctx.globalAlpha = alpha;
  
  // Draw enemy
  ctx.beginPath();
  ctx.arc(position.x, position.y, drawSize, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw HP bar (only if not dying)
  if (!isDying) {
    const hpBarWidth = size * 2;
    const hpBarHeight = 3;
    const hpBarX = position.x - hpBarWidth / 2;
    const hpBarY = position.y - size - 8;
    
    ctx.fillStyle = '#374151';
    ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
    
    const hpPercent = stats.hp / stats.maxHp;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);
  }
  
  ctx.globalAlpha = 1;
};

const drawProjectile = (ctx: CanvasRenderingContext2D, proj: Projectile) => {
  const { position, size, weaponId } = proj;
  
  // Get weapon-specific color
  const projConfig = PROJECTILE_CONFIGS[weaponId];
  const color = projConfig?.color || COLORS.projectile;
  
  ctx.beginPath();
  ctx.arc(position.x, position.y, size, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  
  // Glow effect
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
};

const drawPickup = (ctx: CanvasRenderingContext2D, pickup: Pickup) => {
  const { position, size, type, isFlying } = pickup;
  
  const icon = type === 'gold' ? '💰' : type === 'exp' ? '✨' : '📦';
  
  // Draw pickup
  ctx.font = `${size * 2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (isFlying) {
    // Glow effect when flying
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 15;
  }
  
  ctx.fillText(icon, position.x, position.y);
  ctx.shadowBlur = 0;
};

export default GameCanvas;