import React from 'react';
import { useGameStore } from './store';
import { CHARACTERS, getRequiredExperience, getWeaponUpgradePrice } from './constants';
import type { Passive } from './types';
// ============================================
// 主UI组件
// ============================================

export const GameUI: React.FC = () => {
  const screen = useGameStore(s => s.screen);
  
  switch (screen) {
    case 'menu':
      return <CharacterSelect />;
    case 'playing':
      return <HUD />;
    case 'levelUp':
      return <LevelUpOverlay />;
    case 'shop':
      return <ShopOverlay />;
    case 'paused':
      return <PausedOverlay />;
    case 'gameOver':
      return <GameOverOverlay />;
    default:
      return null;
  }
};

// ============================================
// 角色选择界面
// ============================================

const CharacterSelect: React.FC = () => {
  const startGame = useGameStore(s => s.startGame);
  
  return (
    <div className="character-select">
      <h1 className="game-title">🎮 肉鸽游戏</h1>
      <h2>选择你的角色</h2>
      <div className="characters-grid">
        {CHARACTERS.map(char => (
          <div 
            key={char.id} 
            className="character-card"
            onClick={() => startGame(char.id)}
          >
            <span className="character-icon">{char.icon}</span>
            <h3>{char.name}</h3>
            <p className="character-desc">{char.description}</p>
            <div className="character-stats">
              <div className="stat">
                <span>❤️</span>
                <span>{char.baseStats.maxHp}</span>
              </div>
              <div className="stat">
                <span>⚔️</span>
                <span>{char.baseStats.attack}</span>
              </div>
              <div className="stat">
                <span>🛡️</span>
                <span>{char.baseStats.defense}</span>
              </div>
              <div className="stat">
                <span>👟</span>
                <span>{char.baseStats.moveSpeed}</span>
              </div>
              <div className="stat">
                <span>🎯</span>
                <span>{Math.round(char.baseStats.criticalRate * 100)}%</span>
              </div>
              <div className="stat">
                <span>💥</span>
                <span>{char.baseStats.criticalDamage}x</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="controls-info">
        <p>🎮 <strong>WASD</strong> 或 <strong>方向键</strong> 移动</p>
        <p>🛒 按 <strong>B</strong> 打开商店</p>
        <p>⏸️ 按 <strong>ESC</strong> 暂停游戏</p>
      </div>
    </div>
  );
};

// ============================================
// 游戏HUD
// ============================================

const HUD: React.FC = () => {
  const player = useGameStore(s => s.player);
  const time = useGameStore(s => s.time);
  const score = useGameStore(s => s.score);
  const difficulty = useGameStore(s => s.difficulty);
  
  if (!player) return null;
  
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  const expRequired = getRequiredExperience(player.level);
  const expPercent = (player.experience / expRequired) * 100;
  const hpPercent = (player.stats.currentHp / player.stats.maxHp) * 100;
  
  return (
    <div className="hud">
      <div className="hud-top">
        <div className="hp-section">
          <div className="hp-bar">
            <div className="hp-fill" style={{ width: `${hpPercent}%` }} />
          </div>
          <span className="hp-text">
            ❤️ {player.stats.currentHp}/{player.stats.maxHp}
          </span>
        </div>
        <div className="level-badge">
          <span className="level-icon">⭐</span>
          <span>Lv.{player.level}</span>
        </div>
        <div className="gold-display">
          <span>💰</span>
          <span>{player.gold}</span>
        </div>
      </div>
      
      <div className="hud-middle">
        <div className="exp-section">
          <div className="exp-bar">
            <div className="exp-fill" style={{ width: `${expPercent}%` }} />
          </div>
          <span className="exp-text">
            {player.experience}/{expRequired} EXP
          </span>
        </div>
      </div>
      
      <div className="hud-bottom">
        <div className="stat-item">
          <span>⏱️</span>
          <span>{formatTime(time)}</span>
        </div>
        <div className="stat-item">
          <span>💫</span>
          <span>{score}</span>
        </div>
        <div className="stat-item difficulty">
          <span>📈</span>
          <span>难度 {difficulty}</span>
        </div>
        <div className="stat-item">
          <span>⚔️</span>
          <span>{player.weapons.length}</span>
        </div>
      </div>
      
      <div className="hud-hint">
        按 B 打开商店
      </div>
    </div>
  );
};

// ============================================
// 升级选择界面
// ============================================

const LevelUpOverlay: React.FC = () => {
  const levelUpOptions = useGameStore(s => s.levelUpOptions);
  const selectSkill = useGameStore(s => s.selectSkill);
  const player = useGameStore(s => s.player);
  
  if (!player) return null;
  
  return (
    <div className="overlay level-up-overlay">
      <div className="overlay-content">
        <h2>🎉 升级！</h2>
        <p>选择一项奖励</p>
        <div className="skill-options">
          {levelUpOptions.map(option => (
            <div 
              key={option.id}
              className="skill-option"
              onClick={() => selectSkill(option.id)}
            >
              <span className="skill-icon">{option.icon}</span>
              <div className="skill-info">
                <h4>{option.name}</h4>
                <p>{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// 商店界面
// ============================================

const ShopOverlay: React.FC = () => {
  const shopItems = useGameStore(s => s.shopItems);
  const player = useGameStore(s => s.player);
  const purchaseWeapon = useGameStore(s => s.purchaseWeapon);
  const purchasePassive = useGameStore(s => s.purchasePassive);
  const upgradeWeapon = useGameStore(s => s.upgradeWeapon);
  const closeShop = useGameStore(s => s.closeShop);
  
  if (!player) return null;
  
  const ownedWeapons = player.weapons;
  
  return (
    <div className="overlay shop-overlay">
      <div className="overlay-content shop-content">
        <div className="shop-header">
          <h2>🛒 商店</h2>
          <div className="player-gold">
            <span>💰</span>
            <span>{player.gold}</span>
          </div>
          <button className="close-btn" onClick={closeShop}>✕</button>
        </div>
        
        {/* 已拥有的武器 - 可升级 */}
        {ownedWeapons.length > 0 && (
          <div className="shop-section">
            <h3>⚔️ 武器升级</h3>
            <div className="shop-items">
              {ownedWeapons.map(weapon => {
                const upgradePrice = getWeaponUpgradePrice(weapon);
                const canAfford = player.gold >= upgradePrice;
                const maxLevel = weapon.upgrade.level >= 5;
                
                return (
                  <div 
                    key={weapon.id}
                    className={`shop-item ${!canAfford || maxLevel ? 'disabled' : ''}`}
                    onClick={() => canAfford && !maxLevel && upgradeWeapon(weapon.id)}
                  >
                    <span className="item-icon">{weapon.icon}</span>
                    <div className="item-info">
                      <h4>{weapon.name} Lv.{weapon.upgrade.level}</h4>
                      <p className="item-desc">
                        {maxLevel ? '已满级' : `升级到 Lv.${weapon.upgrade.level + 1}`}
                      </p>
                      <p className="item-stats">
                        伤害+{Math.floor(weapon.baseDamage * 0.2)} | 攻速+10%
                      </p>
                    </div>
                    <div className="item-price">
                      {maxLevel ? 'MAX' : `💰 ${upgradePrice}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* 商店物品 */}
        {shopItems.length > 0 && (
          <div className="shop-section">
            <h3>📦 商品</h3>
            <div className="shop-items">
              {shopItems.map(item => {
                const isWeapon = 'type' in item && ['sword', 'bow', 'magic', 'axe', 'dagger', 'staff', 'crossbow'].includes(item.type);
                const canAfford = player.gold >= item.price;
                
                return (
                  <div 
                    key={item.id}
                    className={`shop-item ${!canAfford ? 'disabled' : ''}`}
                    onClick={() => {
                      if (canAfford) {
                        if (isWeapon) {
                          purchaseWeapon(item.id);
                        } else {
                          purchasePassive(item.id);
                        }
                      }
                    }}
                  >
                    <span className="item-icon">{item.icon}</span>
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p className="item-desc">{item.description}</p>
                      {'effect' in item && (
                        <p className="item-stats">
                          {getPassiveEffectText(item)}
                        </p>
                      )}
                    </div>
                    <div className="item-price">
                      💰 {item.price}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="shop-footer">
          <button className="continue-btn" onClick={closeShop}>
            继续游戏
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 暂停界面
// ============================================

const PausedOverlay: React.FC = () => {
  const resumeGame = useGameStore(s => s.resumeGame);
  const goToMenu = useGameStore(s => s.goToMenu);
  
  return (
    <div className="overlay paused-overlay">
      <div className="overlay-content">
        <h2>⏸️ 游戏暂停</h2>
        <div className="pause-buttons">
          <button className="menu-btn primary" onClick={resumeGame}>
            继续游戏
          </button>
          <button className="menu-btn" onClick={goToMenu}>
            返回菜单
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 游戏结束界面
// ============================================

const GameOverOverlay: React.FC = () => {
  const score = useGameStore(s => s.score);
  const time = useGameStore(s => s.time);
  const player = useGameStore(s => s.player);
  const leaderboard = useGameStore(s => s.leaderboard);
  const restartGame = useGameStore(s => s.restartGame);
  const goToMenu = useGameStore(s => s.goToMenu);
  
  const character = player ? CHARACTERS.find(c => c.id === player.characterId) : null;
  
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="overlay game-over-overlay">
      <div className="overlay-content">
        <h2>💀 游戏结束</h2>
        
        <div className="final-stats">
          <div className="stat-row">
            <span>角色</span>
            <span>{character?.icon} {character?.name}</span>
          </div>
          <div className="stat-row">
            <span>最终分数</span>
            <span className="highlight">{score}</span>
          </div>
          <div className="stat-row">
            <span>存活时间</span>
            <span>{formatTime(time)}</span>
          </div>
          <div className="stat-row">
            <span>最终等级</span>
            <span>Lv.{player?.level || 1}</span>
          </div>
        </div>
        
        <div className="leaderboard-section">
          <h3>🏆 排行榜</h3>
          <div className="leaderboard-list">
            {leaderboard.slice(0, 5).map(entry => {
              const char = CHARACTERS.find(c => c.id === entry.characterId);
              return (
                <div key={entry.rank} className="leaderboard-entry">
                  <span className="rank">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </span>
                  <span className="char-icon">{char?.icon}</span>
                  <span className="entry-score">{entry.score}</span>
                  <span className="entry-time">{formatTime(entry.time)}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="game-over-buttons">
          <button className="menu-btn primary" onClick={restartGame}>
            再来一局
          </button>
          <button className="menu-btn" onClick={goToMenu}>
            返回菜单
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 辅助函数
// ============================================

const getPassiveEffectText = (passive: Passive): string => {
  const { type, value } = passive.effect;
  switch (type) {
    case 'attack':
      return `+${value} 攻击力`;
    case 'defense':
      return `+${value} 防御力`;
    case 'moveSpeed':
      return `+${value} 移动速度`;
    case 'maxHp':
      return `+${value} 最大生命`;
    case 'pickupRange':
      return `+${value} 拾取范围`;
    case 'criticalRate':
      return `+${Math.round(value * 100)}% 暴击率`;
    case 'criticalDamage':
      return `+${Math.round(value * 100)}% 暴击伤害`;
    default:
      return '';
  }
};

export default GameUI;