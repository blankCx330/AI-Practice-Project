// ==================== 贪吃蛇 - 围绕得分点技能版本 ====================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });

const GRID_SIZE = 20;
let TILE_COUNT = 30;
let MAX_FOOD = 5;

let gameMode = 'single';
let isOnline = false;
let myPlayerId = null;
let ws = null;
let players = {};
let foods = [];
let isGameRunning = false;
let gameSpeed = 120;

const MAX_PARTICLES = 150;
let particles = [];
let renderNeeded = true;

// DOM元素
const startScreen = document.getElementById('startScreen');
const onlineMenu = document.getElementById('onlineMenu');
const gameOverScreen = document.getElementById('gameOverScreen');
const connectionStatus = document.getElementById('connectionStatus');
const playersList = document.getElementById('playersList');
const startBtn = document.getElementById('startBtn');
const scorePanel = document.getElementById('scorePanel');
const effectIndicator = document.getElementById('effectIndicator');
const impactOverlay = document.getElementById('impactOverlay');
const gameContainer = document.getElementById('gameContainer');
const winnerText = document.getElementById('winnerText');
const finalScores = document.getElementById('finalScores');

const skillUI = {
    q: { bar: document.getElementById('cooldownQ'), element: document.getElementById('skillQ') },
    w: { bar: document.getElementById('cooldownW'), element: document.getElementById('skillW') },
    e: { bar: document.getElementById('cooldownE'), element: document.getElementById('skillE') },
    r: { bar: document.getElementById('cooldownR'), element: document.getElementById('skillR') }
};

// ==================== 单人模式 ====================
class SnakePlayer {
    constructor(id, color, startX, startY) {
        this.id = id;
        this.color = color;
        this.snake = [{ x: startX, y: startY }, { x: startX - 1, y: startY }, { x: startX - 2, y: startY }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.alive = true;
        this.frozen = false;
        this.frozenUntil = 0;
        this.skills = {
            q: { cooldown: 8000, lastUsed: 0, projectile: null, exploded: false },
            w: { cooldown: 15000, lastUsed: 0, timeStopActive: false, timeStopEnd: 0, zones: [] },
            e: { cooldown: 3000, lastUsed: 0, clones: [], maxClones: 5, cloneLifetime: 15000 },
            r: { cooldown: 25000, lastUsed: 0, blackhole: null }
        };
    }
}

let player1;
let singleGameLoop = null;

function initSinglePlayer() {
    foods = [];
    particles = [];
    if (singleGameLoop) { clearInterval(singleGameLoop); singleGameLoop = null; }
    player1 = new SnakePlayer(1, '#00ff88', 4, 4);
    generateFoodsLocal(MAX_FOOD);
    updateScorePanel();
    renderNeeded = true;
}

function generateFoodsLocal(count = 1) {
    for (let i = 0; i < count; i++) {
        let valid = false;
        let newFood;
        while (!valid) {
            newFood = { 
                x: Math.floor(Math.random() * TILE_COUNT), 
                y: Math.floor(Math.random() * TILE_COUNT),
                frozen: false,
                timeFrozen: false
            };
            valid = !foods.some(f => f.x === newFood.x && f.y === newFood.y);
            valid = valid && !player1.snake.some(s => s.x === newFood.x && s.y === newFood.y);
            for (const clone of player1.skills.e.clones) {
                valid = valid && !clone.some(s => s.x === newFood.x && s.y === newFood.y);
            }
        }
        foods.push(newFood);
    }
}

function updateSinglePlayer() {
    const now = Date.now();
    const p = player1;
    
    if (p.frozen && now > p.frozenUntil) p.frozen = false;
    if (!p.alive || p.frozen) { endSingleGame(); return; }
    
    // 更新核弹
    if (p.skills.q.projectile) {
        const proj = p.skills.q.projectile;
        if (!proj.exploded) {
            proj.x += proj.vx;
            proj.y += proj.vy;
            const dist = Math.abs(proj.x - proj.targetX) + Math.abs(proj.y - proj.targetY);
            if (dist <= 1 || proj.x < 0 || proj.x >= TILE_COUNT || proj.y < 0 || proj.y >= TILE_COUNT) {
                proj.exploded = true;
                const cleared = foods.length;
                p.score += cleared * 15;
                for (let i = 0; i < cleared; i++) {
                    p.snake.push({ x: p.snake[p.snake.length-1].x, y: p.snake[p.snake.length-1].y });
                }
                createImpactNuke();
                foods = [];
                generateFoodsLocal(MAX_FOOD);
                p.skills.q.projectile = null;
            }
        }
    }
    
    // 更新所有分身
    const cloneLifetime = p.skills.e.cloneLifetime;
    p.skills.e.clones = p.skills.e.clones.filter(clone => now - clone.createdAt < cloneLifetime);
    
    for (const clone of p.skills.e.clones) {
        const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
        
        let targetFood = null;
        let minDist = Infinity;
        foods.forEach(f => {
            const d = Math.abs(f.x - clone[0].x) + Math.abs(f.y - clone[0].y);
            if (d < minDist) { minDist = d; targetFood = f; }
        });
        
        if (targetFood) {
            dirs.sort((a, b) => {
                const na = { x: clone[0].x + a[0], y: clone[0].y + a[1] };
                const nb = { x: clone[0].x + b[0], y: clone[0].y + b[1] };
                const da = Math.abs(targetFood.x - na.x) + Math.abs(targetFood.y - na.y);
                const db = Math.abs(targetFood.x - nb.x) + Math.abs(targetFood.y - nb.y);
                return da - db;
            });
        }
        
        for (let d of dirs) {
            const nx = clone[0].x + d[0], ny = clone[0].y + d[1];
            let hitOtherClone = false;
            for (const otherClone of p.skills.e.clones) {
                if (otherClone !== clone && otherClone.some(s => s.x === nx && s.y === ny)) {
                    hitOtherClone = true;
                    break;
                }
            }
            
            if (nx >= 0 && nx < TILE_COUNT && ny >= 0 && ny < TILE_COUNT && 
                !clone.some(s => s.x === nx && s.y === ny) && !p.snake.some(s => s.x === nx && s.y === ny) && !hitOtherClone) {
                clone.unshift({ x: nx, y: ny });
                clone.pop();
                
                const foodIdx = foods.findIndex(f => f.x === nx && f.y === ny);
                if (foodIdx !== -1) {
                    p.score += 10;
                    createImpactEat(nx, ny);
                    foods.splice(foodIdx, 1);
                    generateFoodsLocal(1);
                    p.snake.push({ x: p.snake[p.snake.length-1].x, y: p.snake[p.snake.length-1].y });
                }
                break;
            }
        }
    }
    
    // 更新黑洞
    if (p.skills.r.blackhole) {
        const bh = p.skills.r.blackhole;
        bh.radius += 0.3;
        bh.phase = (bh.phase || 0) + 0.2;
        
        if (bh.radius > 8) {
            p.skills.r.blackhole = null;
        } else {
            foods.forEach(f => {
                const dx = p.snake[0].x - f.x;
                const dy = p.snake[0].y - f.y;
                const dist = Math.abs(dx) + Math.abs(dy);
                
                if (dist < bh.radius * 3 && dist > 0) {
                    if (dist <= 1) {
                        p.score += 20;
                        createImpactEat(f.x, f.y);
                        foods = foods.filter(fd => fd !== f);
                        generateFoodsLocal(1);
                    } else {
                        f.x += Math.sign(dx);
                        f.y += Math.sign(dy);
                    }
                }
            });
        }
    }
    
    // 更新时间静止场
    if (p.skills.w.timeStopActive) {
        if (now > p.skills.w.timeStopEnd) {
            p.skills.w.timeStopActive = false;
            foods.forEach(f => { f.timeFrozen = false; });
        }
    }
    foods.forEach(f => {
        if (f.timeFrozen && now > f.unfreezeAt) f.timeFrozen = false;
    });
    
    // 更新冰霜领域
    p.skills.w.zones = p.skills.w.zones.filter(z => now - z.createdAt < 6000);
    p.skills.w.zones.forEach(z => {
        foods.forEach(f => {
            if (f.x === z.x && f.y === z.y && !f.frozen) {
                f.frozen = true;
                f.unfreezeAt = now + 3000;
            }
        });
    });
    foods.forEach(f => {
        if (f.frozen && now > f.unfreezeAt) f.frozen = false;
    });
    
    p.direction = { ...p.nextDirection };
    let newHead = { x: p.snake[0].x + p.direction.x, y: p.snake[0].y + p.direction.y };
    const hasClones = p.skills.e.clones.length > 0;
    
    if (!hasClones && (newHead.x < 0 || newHead.x >= TILE_COUNT || newHead.y < 0 || newHead.y >= TILE_COUNT)) {
        p.alive = false;
        createImpactDeath();
        endSingleGame();
        return;
    } else if (hasClones) {
        if (newHead.x < 0) newHead.x = TILE_COUNT - 1;
        if (newHead.x >= TILE_COUNT) newHead.x = 0;
        if (newHead.y < 0) newHead.y = TILE_COUNT - 1;
        if (newHead.y >= TILE_COUNT) newHead.y = 0;
    }
    
    if (!hasClones && p.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        p.alive = false;
        createImpactDeath();
        endSingleGame();
        return;
    }
    
    p.snake.unshift(newHead);
    
    const foodIdx = foods.findIndex(f => f.x === newHead.x && f.y === newHead.y);
    if (foodIdx !== -1) {
        p.score += 10;
        createImpactEat(newHead.x, newHead.y);
        foods.splice(foodIdx, 1);
        generateFoodsLocal(1);
    } else {
        p.snake.pop();
    }
    
    updateScorePanel();
    updateSkillUI();
    renderNeeded = true;
}

function endSingleGame() {
    isGameRunning = false;
    if (singleGameLoop) { clearInterval(singleGameLoop); singleGameLoop = null; }
    winnerText.textContent = '游戏结束';
    finalScores.innerHTML = '<div class="score-row"><span class="player-tag p1">得分</span><span class="score-value">' + player1.score + '</span></div>';
    gameOverScreen.classList.remove('hidden');
}

function startSinglePlayerGame() {
    initSinglePlayer();
    startScreen.classList.add('hidden');
    onlineMenu.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    isGameRunning = true;
    gameSpeed = 120;
    if (singleGameLoop) clearInterval(singleGameLoop);
    singleGameLoop = setInterval(updateSinglePlayer, gameSpeed);
    renderNeeded = true;
    requestAnimationFrame(gameLoop);
}

// ==================== 在线模式 ====================
function connectToServer() {
    const addr = document.getElementById('serverAddress').value || 'localhost:8080';
    if (ws) ws.close();
    ws = new WebSocket('ws://' + addr);
    ws.onopen = () => {
        connectionStatus.querySelector('.status-dot').classList.remove('offline');
        connectionStatus.querySelector('.status-text').textContent = '已连接';
    };
    ws.onclose = () => {
        connectionStatus.querySelector('.status-dot').classList.add('offline');
        connectionStatus.querySelector('.status-text').textContent = '断开连接';
    };
    ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        handleOnlineMessage(data);
    };
    onlineMenu.classList.add('hidden');
    startScreen.classList.add('hidden');
}

function handleOnlineMessage(data) {
    switch (data.type) {
        case 'init':
            myPlayerId = data.playerId;
            TILE_COUNT = data.tileCount;
            players = data.players;
            foods = data.foods;
            updateOnlinePlayersList();
            break;
        case 'playerJoined':
        case 'playerLeft':
            players = data.players;
            updateOnlinePlayersList();
            break;
        case 'update':
            players = data.players;
            foods = data.foods;
            data.events.forEach(ev => {
                if (ev.type === 'eat') createImpactEat(ev.x || 0, ev.y || 0);
                if (ev.type === 'nuke') createImpactNuke();
                if (ev.type === 'blackhole') createSpecialEffect('blackhole');
                if (ev.type === 'freeze') createSpecialEffect('freeze');
            });
            updateScorePanel();
            updateSkillUI();
            break;
        case 'skill':
            if (data.playerId === myPlayerId) {
                const names = { q: '核弹!', w: '冰霜领域!', e: '镜像分身!', r: '黑洞!' };
                showEffect(names[data.skill], data.effect);
            }
            createSpecialEffect(data.effect);
            break;
    }
    renderNeeded = true;
}

function updateOnlinePlayersList() {
    const entries = Object.entries(players);
    if (entries.length === 0) { playersList.innerHTML = '<h3>等待玩家...</h3>'; startBtn.classList.add('hidden'); return; }
    let html = '<h3>在线玩家 (' + entries.length + '/4)</h3>';
    entries.forEach(([id, player]) => {
        const isMe = parseInt(id) === myPlayerId;
        html += '<div class="player-waiting" style="border-color: ' + player.color + ';"><span class="player-tag p' + id + '">P' + id + '</span>' + (isMe ? '(你)' : '') + ' ' + player.score + '分</div>';
    });
    playersList.innerHTML = html;
    if (entries.length >= 1) startBtn.classList.remove('hidden');
}

function sendOnline(msg) { if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg)); }
function startOnlineGame() { sendOnline({ type: 'start' }); startBtn.classList.add('hidden'); }

// ==================== 粒子系统 ====================
function createParticleBurst(gridX, gridY, color, count = 25) {
    if (particles.length > MAX_PARTICLES) return;
    const x = gridX * GRID_SIZE + 10, y = gridY * GRID_SIZE + 10;
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
        const speed = Math.random() * 10 + 4;
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, decay: 0.02, color, size: Math.random() * 5 + 2 });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= p.decay; p.vx *= 0.95; p.vy *= 0.95;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
}

// ==================== 冲击效果 ====================
function createImpactEat(gridX, gridY) {
    const x = (gridX / TILE_COUNT) * 100, y = (gridY / TILE_COUNT) * 100;
    impactOverlay.style.setProperty('--x', x + '%'); impactOverlay.style.setProperty('--y', y + '%');
    impactOverlay.className = 'impact-overlay eat';
    gameContainer.classList.add('shake');
    setTimeout(function() { impactOverlay.className = 'impact-overlay'; gameContainer.classList.remove('shake'); }, 350);
}

function createImpactNuke() {
    impactOverlay.style.background = 'radial-gradient(circle, rgba(255,100,0,0.8) 0%, rgba(255,0,0,0.5) 30%, transparent 70%)';
    impactOverlay.className = 'impact-overlay nuke';
    gameContainer.classList.add('shake');
    setTimeout(function() { impactOverlay.className = 'impact-overlay'; gameContainer.classList.remove('shake'); }, 600);
    
    for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 15 + 5;
        particles.push({
            x: canvas.width / 2, y: canvas.height / 2,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            life: 1, decay: 0.015,
            color: ['#ff6600', '#ff0000', '#ffaa00', '#ffff00'][Math.floor(Math.random() * 4)],
            size: Math.random() * 8 + 4
        });
    }
}

function createSpecialEffect(type) {
    const effects = {
        nuke: function() { impactOverlay.style.background = 'radial-gradient(circle, rgba(255,100,0,0.7) 0%, transparent 60%)'; impactOverlay.className = 'impact-overlay nuke'; },
        freeze: function() { impactOverlay.className = 'impact-overlay freeze'; },
        clone: function() { impactOverlay.style.background = 'radial-gradient(circle, rgba(255,0,255,0.5) 0%, transparent 50%)'; impactOverlay.className = 'impact-overlay skill'; },
        blackhole: function() { impactOverlay.style.background = 'radial-gradient(circle, rgba(136,0,255,0.7) 0%, transparent 70%)'; impactOverlay.className = 'impact-overlay blackhole'; },
        timestop: function() { 
            impactOverlay.style.background = 'radial-gradient(circle, rgba(0,255,255,0.6) 0%, rgba(138,43,226,0.4) 40%, transparent 70%)'; 
            impactOverlay.className = 'impact-overlay timestop';
            for (let i = 0; i < 40; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 8 + 3;
                particles.push({
                    x: canvas.width / 2, y: canvas.height / 2,
                    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                    life: 1, decay: 0.012,
                    color: ['#00ffff', '#8a2be2', '#00ced1', '#ff00ff'][Math.floor(Math.random() * 4)],
                    size: Math.random() * 6 + 3
                });
            }
        }
    };
    if (effects[type]) effects[type]();
    if (type !== 'timestop') {
        gameContainer.classList.add('shake');
        setTimeout(function() { impactOverlay.className = 'impact-overlay'; gameContainer.classList.remove('shake'); }, 500);
    } else {
        setTimeout(function() { impactOverlay.className = 'impact-overlay'; gameContainer.classList.remove('shake'); }, 800);
    }
}

function createImpactDeath() {
    impactOverlay.className = 'impact-overlay death';
    gameContainer.classList.add('shake');
    setTimeout(function() { impactOverlay.className = 'impact-overlay'; gameContainer.classList.remove('shake'); }, 500);
}

// ==================== UI ====================
function updateScorePanel() {
    let html = '';
    const toShow = isOnline ? players : { 1: player1 };
    Object.entries(toShow).forEach(function([id, p]) { if (p) html += '<div class="player-score p' + id + '"><span class="player-tag p' + id + '">P' + id + '</span><span class="score-value">' + p.score + '</span></div>'; });
    scorePanel.innerHTML = html;
}

function showEffect(text, type) {
    effectIndicator.textContent = text;
    effectIndicator.className = 'effect-indicator show ' + type;
    setTimeout(function() { effectIndicator.classList.remove('show'); }, 1500);
}

function updateSkillUI() {
    const now = Date.now();
    const player = isOnline ? players[myPlayerId] : player1;
    if (!player) return;
    
    for (let key in player.skills) {
        const skill = player.skills[key];
        const ui = skillUI[key];
        const elapsed = now - skill.lastUsed;
        const remaining = skill.cooldown - elapsed;
        
        if (remaining > 0) {
            ui.element.classList.add('on-cooldown');
            ui.element.classList.remove('active');
            ui.bar.style.width = ((skill.cooldown - remaining) / skill.cooldown * 100) + '%';
        } else {
            ui.element.classList.remove('active', 'on-cooldown');
            ui.bar.style.width = '100%';
        }
    }
}

// ==================== 绘制 ====================
function draw() {
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath(); ctx.moveTo(i * GRID_SIZE, 0); ctx.lineTo(i * GRID_SIZE, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * GRID_SIZE); ctx.lineTo(canvas.width, i * GRID_SIZE); ctx.stroke();
    }
    
    const toDraw = isOnline ? players : { 1: player1 };
    
    Object.values(toDraw).forEach(function(p) {
        if (p && p.skills && p.skills.w && p.skills.w.zones) p.skills.w.zones.forEach(function(z) { drawIceZone(z.x, z.y); });
    });
    
    Object.values(toDraw).forEach(function(p) {
        if (p && p.skills && p.skills.q && p.skills.q.projectile && !p.skills.q.projectile.exploded) drawNuke(p.skills.q.projectile);
    });
    
    Object.values(toDraw).forEach(function(p) {
        if (p && p.skills && p.skills.r && p.skills.r.blackhole) drawBlackhole(p.skills.r.blackhole);
    });
    
    foods.forEach(function(f) { drawFood(f); });
    
    Object.values(toDraw).forEach(function(p) {
        if (p && p.skills && p.skills.e && p.skills.e.clones) {
            p.skills.e.clones.forEach(function(clone) { drawClone(clone, p.color); });
        }
    });
    
    Object.entries(toDraw).forEach(function([id, p]) { if (p && p.snake) drawSnake(p, p.frozen); });
    
    drawParticles();
}

function drawSnake(player, frozen) {
    if (!player || !player.snake) return;
    frozen = frozen || false;
    
    const hasClones = player.skills && player.skills.e && player.skills.e.clones && player.skills.e.clones.length > 0;
    
    player.snake.forEach(function(seg, idx) {
        const isHead = idx === 0;
        const px = seg.x * GRID_SIZE + 1.5;
        const py = seg.y * GRID_SIZE + 1.5;
        const size = GRID_SIZE - 3;
        
        let color = isHead ? (frozen ? '#0088ff' : (hasClones ? '#ff00ff' : player.color)) : 
            'rgb(0, ' + Math.floor(200 - idx * 8) + ', ' + Math.floor(100 - idx * 4) + ')';
        
        if (isHead || idx % 2 === 0) {
            ctx.shadowColor = frozen ? '#0088ff' : (hasClones ? '#ff00ff' : player.color);
            ctx.shadowBlur = isHead ? 20 : 8;
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(px, py, size, size);
        
        if (isHead && !frozen) {
            const dir = player.direction;
            const eyeSize = 3;
            const eyeOffset = 4;
            let ex1, ey1, ex2, ey2;
            
            if (dir.x === 1) {
                ex1 = px + size - eyeOffset; ey1 = py + eyeOffset;
                ex2 = px + size - eyeOffset; ey2 = py + size - eyeOffset - eyeSize;
            } else if (dir.x === -1) {
                ex1 = px + eyeOffset; ey1 = py + eyeOffset;
                ex2 = px + eyeOffset; ey2 = py + size - eyeOffset - eyeSize;
            } else if (dir.y === -1) {
                ex1 = px + eyeOffset; ey1 = py + eyeOffset;
                ex2 = px + size - eyeOffset - eyeSize; ey2 = py + eyeOffset;
            } else {
                ex1 = px + eyeOffset; ey1 = py + size - eyeOffset;
                ex2 = px + size - eyeOffset - eyeSize; ey2 = py + size - eyeOffset;
            }
            
            ctx.fillStyle = '#fff';
            ctx.fillRect(ex1, ey1, eyeSize, eyeSize);
            ctx.fillRect(ex2, ey2, eyeSize, eyeSize);
        }
    });
    ctx.shadowBlur = 0;
}

function drawFood(f) {
    if (!f) return;
    
    const px = f.x * GRID_SIZE + 10, py = f.y * GRID_SIZE + 10;
    const t = Date.now() / 250, pulse = Math.sin(t) * 0.25 + 1, float = Math.sin(t * 2) * 2;
    
    if (f.timeFrozen) {
        const t2 = Date.now() / 150;
        const pulse2 = Math.sin(t2) * 0.2 + 1;
        ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 25;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, GRID_SIZE / 2 - 2);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#00ffff');
        grad.addColorStop(0.6, '#8a2be2');
        grad.addColorStop(1, '#4b0082');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(px, py, (GRID_SIZE / 2 - 3) * pulse2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 / 3) * i + t2 * 0.5;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(angle) * 12, py + Math.sin(angle) * 12); ctx.stroke();
        }
    } else if (f.frozen) {
        ctx.shadowColor = '#0088ff'; ctx.shadowBlur = 20;
        const grad = ctx.createRadialGradient(px - 3, py - 3 + float, 0, px, py + float, GRID_SIZE / 2 - 2);
        grad.addColorStop(0, '#aaddff'); grad.addColorStop(0.5, '#0088ff'); grad.addColorStop(1, '#004488');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(px, py + float, (GRID_SIZE / 2 - 3) * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(150, 220, 255, 0.8)'; ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI / 2) * i + t;
            ctx.beginPath(); ctx.moveTo(px, py + float); ctx.lineTo(px + Math.cos(angle) * 10, py + Math.sin(angle) * 10 + float); ctx.stroke();
        }
    } else {
        ctx.shadowColor = '#ff9500'; ctx.shadowBlur = 25 * pulse;
        const grad = ctx.createRadialGradient(px - 3, py - 3 + float, 0, px, py + float, GRID_SIZE / 2 - 2);
        grad.addColorStop(0, '#ffcc66'); grad.addColorStop(0.4, '#ff9500'); grad.addColorStop(0.8, '#ff6600'); grad.addColorStop(1, '#cc4400');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(px, py + float, (GRID_SIZE / 2 - 3) * pulse, 0, Math.PI * 2); ctx.fill();
    }
    
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.arc(px - 4, py - 4 + float, 4, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
}

function drawNuke(proj) {
    if (!proj) return;
    
    const px = proj.x * GRID_SIZE + 10, py = proj.y * GRID_SIZE + 10;
    const t = Date.now() / 100;
    
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 20 + Math.sin(t) * 10;
    
    const grad = ctx.createRadialGradient(px, py, 0, px, py, 14);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#ff6600');
    grad.addColorStop(0.7, '#ff0000');
    grad.addColorStop(1, '#440000');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(px, py, 12 + Math.sin(t * 2) * 2, 0, Math.PI * 2); ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - proj.vx * 15, py - proj.vy * 15);
    ctx.arc(px - proj.vx * 10, py - proj.vy * 10, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

function drawBlackhole(bh) {
    if (!bh) return;
    
    const px = bh.x * GRID_SIZE + 10, py = bh.y * GRID_SIZE + 10;
    const r = bh.radius * GRID_SIZE;
    const pulse = Math.sin(bh.phase) * 0.2 + 1;
    
    ctx.shadowColor = '#8800ff';
    ctx.shadowBlur = 30 * pulse;
    
    const grad = ctx.createRadialGradient(px, py, 0, px, py, r);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.2, '#220044');
    grad.addColorStop(0.5, '#8800ff');
    grad.addColorStop(0.8, 'rgba(136,0,255,0.3)');
    grad.addColorStop(1, 'rgba(136,0,255,0)');
    
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
}

function drawIceZone(x, y) {
    const px = x * GRID_SIZE + 10, py = y * GRID_SIZE + 10;
    const t = Date.now() / 200;
    const alpha = Math.abs(Math.sin(t + x + y)) * 0.5 + 0.3;
    
    ctx.shadowColor = '#0088ff';
    ctx.shadowBlur = 15;
    ctx.fillStyle = 'rgba(0, 136, 255, ' + alpha + ')';
    ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fill();
    
    ctx.strokeStyle = 'rgba(150, 220, 255, ' + alpha + ')';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i + t;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(angle) * 12, py + Math.sin(angle) * 12); ctx.stroke();
    }
    ctx.shadowBlur = 0;
}

function drawClone(clone, color) {
    if (!clone) return;
    
    clone.forEach(function(seg, idx) {
        const px = seg.x * GRID_SIZE + 3, py = seg.y * GRID_SIZE + 3;
        const size = GRID_SIZE - 6;
        const alpha = 0.6 - idx * 0.1;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fillRect(px, py, size, size);
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

// ==================== 主循环 ====================
let lastTime = 0;
const PARTICLE_FPS = 60;
let gameLoopRunning = false;

function gameLoop(timestamp) {
    gameLoopRunning = true;
    
    if (timestamp - lastTime >= 1000 / PARTICLE_FPS) {
        lastTime = timestamp;
        
        if (renderNeeded || particles.length > 0) {
            if (renderNeeded) { draw(); renderNeeded = false; }
            if (particles.length > 0) updateParticles();
        }
    }
    
    if (renderNeeded || particles.length > 0 || isGameRunning) {
        requestAnimationFrame(gameLoop);
    } else {
        gameLoopRunning = false;
    }
}

// ==================== 控制 ====================
function startSinglePlayer() { 
    isOnline = false; 
    connectionStatus.querySelector('.status-text').textContent = '单机模式'; 
    startSinglePlayerGame(); 
}

function showOnlineMenu() { 
    startScreen.classList.add('hidden'); 
    onlineMenu.classList.remove('hidden'); 
    createBackgroundParticles(); 
}

function showMainMenu() { 
    onlineMenu.classList.add('hidden'); 
    startScreen.classList.remove('hidden'); 
    if (ws) ws.close(); 
}

function returnToMenu() { 
    gameOverScreen.classList.add('hidden'); 
    startScreen.classList.remove('hidden'); 
    isGameRunning = false; 
    if (ws) ws.close(); 
}

document.addEventListener('keydown', function(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) >= 0) e.preventDefault();
    if (!isGameRunning) return;
    
    const player = isOnline ? players[myPlayerId] : player1;
    if (!player || !player.alive) return;
    
    var sendDir = function(dir) { 
        if (isOnline) sendOnline({ type: 'direction', direction: dir }); 
        else if (dir.x !== -player.direction.x && dir.y !== -player.direction.y) player.nextDirection = dir; 
    };
    
    switch (e.key) {
        case 'ArrowUp': sendDir({ x: 0, y: -1 }); break;
        case 'ArrowDown': sendDir({ x: 0, y: 1 }); break;
        case 'ArrowLeft': sendDir({ x: -1, y: 0 }); break;
        case 'ArrowRight': sendDir({ x: 1, y: 0 }); break;
        case 'q': case 'w': case 'e': case 'r':
            if (isOnline) sendOnline({ type: 'skill', skill: e.key });
            else {
                var p = player;
                var now = Date.now();
                var sk = p.skills[e.key];
                if (now - sk.lastUsed >= sk.cooldown) {
                    sk.lastUsed = now;
                    renderNeeded = true;
                    if (!gameLoopRunning) requestAnimationFrame(gameLoop);
                    
                    switch (e.key) {
                        case 'q':
                            sk.projectile = { 
                                x: p.snake[0].x + p.direction.x * 2, 
                                y: p.snake[0].y + p.direction.y * 2,
                                targetX: p.snake[0].x + p.direction.x * 8,
                                targetY: p.snake[0].y + p.direction.y * 8,
                                vx: p.direction.x * 1.5, 
                                vy: p.direction.y * 1.5,
                                exploded: false
                            }; 
                            break;
                        case 'w':
                            if (!sk.timeStopActive) {
                                sk.timeStopActive = true;
                                sk.timeStopEnd = now + 8000;
                                foods.forEach(function(f) { f.timeFrozen = true; f.unfreezeAt = sk.timeStopEnd; });
                                showEffect('时间静止!', 'timestop');
                                createSpecialEffect('timestop');
                            }
                            var h = p.snake[0];
                            [[0,0],[0,1],[0,-1],[1,0],[-1,0]].forEach(function(d) { 
                                var dx = d[0], dy = d[1];
                                if (h.x+dx>=0 && h.x+dx<TILE_COUNT && h.y+dy>=0 && h.y+dy<TILE_COUNT) 
                                    sk.zones.push({x:h.x+dx, y:h.y+dy, createdAt:now}); 
                            }); 
                            break;
                        case 'e':
                            if (sk.clones.length < sk.maxClones) {
                                var validPos = false;
                                var newClone = [];
                                var attempts = 0;
                                while (!validPos && attempts < 50) {
                                    var startX = Math.floor(Math.random() * TILE_COUNT);
                                    var startY = Math.floor(Math.random() * TILE_COUNT);
                                    var overlap = p.snake.some(function(s) { return s.x === startX && s.y === startY; }) ||
                                                   sk.clones.some(function(c) { return c.some(function(s) { return s.x === startX && s.y === startY; }); });
                                    if (!overlap) {
                                        newClone = [
                                            { x: startX, y: startY },
                                            { x: startX + 1, y: startY },
                                            { x: startX + 2, y: startY }
                                        ];
                                        if (newClone.every(function(seg) { return seg.x >= 0 && seg.x < TILE_COUNT && seg.y >= 0 && seg.y < TILE_COUNT; })) {
                                            validPos = true;
                                        }
                                    }
                                    attempts++;
                                }
                                if (validPos) {
                                    newClone.createdAt = Date.now();
                                    sk.clones.push(newClone);
                                    showEffect('分身+1!', 'clone');
                                }
                            } else {
                                showEffect('分身已满!', 'clone');
                            }
                            break;
                        case 'r':
                            sk.blackhole = { x: p.snake[0].x, y: p.snake[0].y, radius: 1, phase: 0 }; 
                            break;
                    }
                }
            }
            break;
    }
});

function createBackgroundParticles() {
    var c = document.getElementById('particles');
    c.innerHTML = '';
    var colors = ['#00ff88', '#00ffff', '#ff00ff', '#ff9500'];
    for (var i = 0; i < 30; i++) {
        var p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 20 + 's';
        p.style.animationDuration = (15 + Math.random() * 10) + 's';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        c.appendChild(p);
    }
}

// 初始化
createBackgroundParticles();
renderNeeded = true;
requestAnimationFrame(gameLoop);
