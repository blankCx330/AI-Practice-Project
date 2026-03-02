const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const TILE_COUNT = 30;
const MAX_FOOD = 5;
const rooms = new Map();
let roomIdCounter = 1;

class Player {
    constructor(id, color) {
        this.id = id;
        this.color = color;
        this.snake = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.alive = true;
        // 新技能系统 - 围绕得分点
        this.skills = {
            q: { cooldown: 8000, lastUsed: 0, projectile: null },   // 核弹
            w: { cooldown: 15000, lastUsed: 0, timeStopActive: false, timeStopEnd: 0 },  // 时间静止
            e: { cooldown: 15000, lastUsed: 0, clone: null },       // 镜像分身
            r: { cooldown: 25000, lastUsed: 0, blackhole: null }   // 黑洞
        };
        this.frozen = false;
        this.frozenUntil = 0;
        this.ws = null;
    }
    
    reset(startX, startY) {
        this.snake = [{ x: startX, y: startY }, { x: startX - 1, y: startY }, { x: startX - 2, y: startY }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.alive = true;
        this.frozen = false;
        this.frozenUntil = 0;
        for (let key in this.skills) {
            this.skills[key].lastUsed = 0;
            this.skills[key].projectile = null;
            this.skills[key].timeStopActive = false;
            this.skills[key].timeStopEnd = 0;
            this.skills[key].clone = null;
            this.skills[key].blackhole = null;
        }
    }
}

class Room {
    constructor(id) {
        this.id = id;
        this.players = new Map();
        this.foods = [];
        this.gameLoop = null;
        this.running = false;
        this.gameSpeed = 120;
        this.generateFoods(MAX_FOOD);
    }
    
    generateFoods(count = 1) {
        for (let i = 0; i < count; i++) {
            let validPosition = false;
            let newFood;
            while (!validPosition) {
                newFood = { 
                    x: Math.floor(Math.random() * TILE_COUNT), 
                    y: Math.floor(Math.random() * TILE_COUNT),
                    frozen: false,
                    timeFrozen: false
                };
                validPosition = true;
                // 检查是否与现有食物重叠
                if (this.foods.some(f => f.x === newFood.x && f.y === newFood.y)) {
                    validPosition = false;
                    continue;
                }
                // 检查是否与玩家蛇重叠
                this.players.forEach(player => {
                    if (player.snake.some(s => s.x === newFood.x && s.y === newFood.y)) validPosition = false;
                    if (player.skills.e.clone && player.skills.e.clone.some(s => s.x === newFood.x && s.y === newFood.y)) validPosition = false;
                });
            }
            this.foods.push(newFood);
        }
    }
    
    addPlayer(ws) {
        const id = this.players.size + 1;
        const colors = ['#00ff88', '#00ffff', '#ff00ff', '#ff9500'];
        const player = new Player(id, colors[id - 1] || '#00ff88');
        player.ws = ws;
        
        const startPositions = [{ x: 3, y: 3 }, { x: TILE_COUNT - 4, y: TILE_COUNT - 4 }, { x: 3, y: TILE_COUNT - 4 }, { x: TILE_COUNT - 4, y: 3 }];
        player.reset(startPositions[id - 1].x, startPositions[id - 1].y);
        this.players.set(id, player);
        
        ws.playerId = id;
        ws.roomId = this.id;
        
        return player;
    }
    
    removePlayer(playerId) {
        this.players.delete(playerId);
        if (this.players.size === 0) {
            this.stop();
            rooms.delete(this.id);
        }
    }
    
    start() {
        if (this.running) return;
        this.running = true;
        
        const startPositions = [{ x: 3, y: 3 }, { x: TILE_COUNT - 4, y: TILE_COUNT - 4 }, { x: 3, y: TILE_COUNT - 4 }, { x: TILE_COUNT - 4, y: 3 }];
        let idx = 0;
        this.players.forEach(player => {
            player.reset(startPositions[idx].x, startPositions[idx].y);
            idx++;
        });
        
        this.foods = [];
        this.generateFoods(MAX_FOOD);
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }
    
    stop() {
        this.running = false;
        if (this.gameLoop) { clearInterval(this.gameLoop); this.gameLoop = null; }
    }
    
    update() {
        const now = Date.now();
        const events = [];
        
        this.players.forEach(player => {
            // 检查冰冻状态
            if (player.frozen && now > player.frozenUntil) {
                player.frozen = false;
            }
            
            // ========== Q技能：核弹 ==========
            if (player.skills.q.projectile) {
                const proj = player.skills.q.projectile;
                
                if (!proj.exploded) {
                    proj.x += proj.vx;
                    proj.y += proj.vy;
                    
                    // 检测是否到达目标点并爆炸
                    const dist = Math.abs(proj.x - proj.targetX) + Math.abs(proj.y - proj.targetY);
                    if (dist <= 1 || proj.x < 0 || proj.x >= TILE_COUNT || proj.y < 0 || proj.y >= TILE_COUNT) {
                        // 爆炸！清理所有食物
                        proj.exploded = true;
                        const cleared = this.foods.length;
                        player.score += cleared * 15;
                        // 蛇长度增加
                        for (let i = 0; i < cleared; i++) {
                            player.snake.push({ x: player.snake[player.snake.length-1].x, y: player.snake[player.snake.length-1].y });
                        }
                        events.push({ type: 'nuke', playerId: player.id, cleared: cleared });
                        this.foods = [];
                        this.generateFoods(MAX_FOOD);
                        player.skills.q.projectile = null;
                    }
                }
            }
            
            // ========== E技能：镜像分身 ==========
            if (player.skills.e.clone) {
                const clone = player.skills.e.clone;
                
                // 分身AI：追踪最近的食物
                let targetFood = null;
                let minDist = Infinity;
                this.foods.forEach(f => {
                    const d = Math.abs(f.x - clone[0].x) + Math.abs(f.y - clone[0].y);
                    if (d < minDist) { minDist = d; targetFood = f; }
                });
                
                const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
                for (let d of dirs) {
                    const nx = clone[0].x + d[0];
                    const ny = clone[0].y + d[1];
                    if (nx >= 0 && nx < TILE_COUNT && ny >= 0 && ny < TILE_COUNT && 
                        !clone.some(s => s.x === nx && s.y === ny) && !player.snake.some(s => s.x === nx && s.y === ny)) {
                        clone.unshift({ x: nx, y: ny });
                        clone.pop();
                        
                        // 检测吃食物
                        const foodIdx = this.foods.findIndex(f => f.x === nx && f.y === ny);
                        if (foodIdx !== -1) {
                            player.score += 10;
                            events.push({ type: 'cloneEat', playerId: player.id, x: nx, y: ny });
                            this.foods.splice(foodIdx, 1);
                            this.generateFoods(1);
                        }
                        break;
                    }
                }
            }
            
            // ========== R技能：黑洞 ==========
            if (player.skills.r.blackhole) {
                const bh = player.skills.r.blackhole;
                bh.radius += 0.3;
                bh.phase = (bh.phase || 0) + 0.2;
                
                if (bh.radius > 8) {
                    player.skills.r.blackhole = null;
                } else {
                    // 吸引所有食物向玩家移动
                    this.foods.forEach(f => {
                        const dx = player.snake[0].x - f.x;
                        const dy = player.snake[0].y - f.y;
                        const dist = Math.abs(dx) + Math.abs(dy);
                        
                        if (dist < bh.radius * 3 && dist > 0) {
                            if (dist <= 1) {
                                // 食物被吸入
                                player.score += 20;
                                events.push({ type: 'blackhole', playerId: player.id, x: f.x, y: f.y });
                                this.foods = this.foods.filter(fd => fd !== f);
                                this.generateFoods(1);
                            } else {
                                // 向玩家移动
                                f.x += Math.sign(dx);
                                f.y += Math.sign(dy);
                            }
                        }
                    });
                }
            }
            
            // ========== W技能：时间静止 ==========
            if (player.skills.w.timeStopActive) {
                if (now > player.skills.w.timeStopEnd) {
                    player.skills.w.timeStopActive = false;
                    this.foods.forEach(f => { f.timeFrozen = false; });
                }
            }
            // 解冻时间冻结的食物
            this.foods.forEach(f => {
                if (f.timeFrozen && now > f.unfreezeAt) f.timeFrozen = false;
            });
            
            // ========== 玩家移动 ==========
            player.direction = { ...player.nextDirection };
            let newHead = { x: player.snake[0].x + player.direction.x, y: player.snake[0].y + player.direction.y };
            const isGhostMode = player.skills.e.clone !== null;
            
            // 边界检测
            if (!isGhostMode && (newHead.x < 0 || newHead.x >= TILE_COUNT || newHead.y < 0 || newHead.y >= TILE_COUNT)) {
                player.alive = false;
                events.push({ type: 'death', playerId: player.id });
                return;
            } else if (isGhostMode) {
                if (newHead.x < 0) newHead.x = TILE_COUNT - 1;
                if (newHead.x >= TILE_COUNT) newHead.x = 0;
                if (newHead.y < 0) newHead.y = TILE_COUNT - 1;
                if (newHead.y >= TILE_COUNT) newHead.y = 0;
            }
            
            // 自身碰撞
            if (!isGhostMode && player.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
                player.alive = false;
                events.push({ type: 'death', playerId: player.id });
                return;
            }
            
            // 玩家碰撞
            this.players.forEach(other => {
                if (other.id !== player.id && other.alive && other.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
                    player.alive = false;
                    events.push({ type: 'death', playerId: player.id });
                }
            });
            
            if (!player.alive) return;
            
            player.snake.unshift(newHead);
            
            // 吃食物
            const foodIdx = this.foods.findIndex(f => f.x === newHead.x && f.y === newHead.y);
            if (foodIdx !== -1) {
                player.score += 10;
                events.push({ type: 'eat', playerId: player.id, x: newHead.x, y: newHead.y });
                this.foods.splice(foodIdx, 1);
                this.generateFoods(1);
            } else {
                player.snake.pop();
            }
        });
        
        this.broadcast({ type: 'update', players: this.getPlayersState(), foods: this.foods, events });
    }
    
    getPlayersState() {
        const state = {};
        this.players.forEach(player => {
            state[player.id] = {
                id: player.id,
                color: player.color,
                snake: player.snake,
                direction: player.direction,
                score: player.score,
                alive: player.alive,
                frozen: player.frozen,
                skills: {
                    q: { cooldown: player.skills.q.cooldown, lastUsed: player.skills.q.lastUsed, projectile: player.skills.q.projectile },
                    w: { cooldown: player.skills.w.cooldown, lastUsed: player.skills.w.lastUsed, timeStopActive: player.skills.w.timeStopActive, timeStopEnd: player.skills.w.timeStopEnd },
                    e: { cooldown: player.skills.e.cooldown, lastUsed: player.skills.e.lastUsed, clone: player.skills.e.clone },
                    r: { cooldown: player.skills.r.cooldown, lastUsed: player.skills.r.lastUsed, blackhole: player.skills.r.blackhole }
                }
            };
        });
        return state;
    }
    
    broadcast(message) {
        const data = JSON.stringify(message);
        this.players.forEach(player => {
            if (player.ws && player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(data);
            }
        });
    }
    
    handleMessage(playerId, message) {
        const player = this.players.get(playerId);
        if (!player || !player.alive || player.frozen) return;
        
        switch (message.type) {
            case 'direction':
                const d = message.direction;
                if (d.x !== -player.direction.x && d.y !== -player.direction.y) {
                    player.nextDirection = d;
                }
                break;
            case 'skill':
                this.useSkill(player, message.skill);
                break;
            case 'start':
                this.start();
                break;
        }
    }
    
    useSkill(player, skillKey) {
        const skill = player.skills[skillKey];
        const now = Date.now();
        if (now - skill.lastUsed < skill.cooldown) return;
        
        skill.lastUsed = now;
        
        switch (skillKey) {
            case 'q': // 核弹 - 飞向目标后爆炸清理所有食物
                skill.projectile = {
                    x: player.snake[0].x + player.direction.x * 2,
                    y: player.snake[0].y + player.direction.y * 2,
                    targetX: player.snake[0].x + player.direction.x * 8,
                    targetY: player.snake[0].y + player.direction.y * 8,
                    vx: player.direction.x * 1.5,
                    vy: player.direction.y * 1.5,
                    exploded: false
                };
                this.broadcast({ type: 'skill', playerId: player.id, skill: 'q', effect: 'nuke' });
                break;
                
            case 'w': // 时间静止 - 冻结所有食物
                if (!skill.timeStopActive) {
                    skill.timeStopActive = true;
                    skill.timeStopEnd = now + 8000;
                    this.foods.forEach(f => { f.timeFrozen = true; f.unfreezeAt = skill.timeStopEnd; });
                    this.broadcast({ type: 'skill', playerId: player.id, skill: 'w', effect: 'timestop' });
                }
                break;
                
            case 'e': // 镜像分身
                skill.clone = [
                    { x: TILE_COUNT - player.snake[0].x, y: TILE_COUNT - player.snake[0].y },
                    { x: TILE_COUNT - player.snake[0].x + 1, y: TILE_COUNT - player.snake[0].y },
                    { x: TILE_COUNT - player.snake[0].x + 2, y: TILE_COUNT - player.snake[0].y }
                ];
                this.broadcast({ type: 'skill', playerId: player.id, skill: 'e', effect: 'clone' });
                break;
                
            case 'r': // 黑洞 - 吸引所有食物
                skill.blackhole = {
                    x: player.snake[0].x,
                    y: player.snake[0].y,
                    radius: 1,
                    phase: 0
                };
                this.broadcast({ type: 'skill', playerId: player.id, skill: 'r', effect: 'blackhole' });
                break;
        }
    }
}

wss.on('connection', (ws) => {
    let room = null;
    
    for (let r of rooms.values()) {
        if (r.players.size < 4 && !r.running) {
            room = r;
            break;
        }
    }
    
    if (!room) {
        room = new Room(roomIdCounter++);
        rooms.set(room.id, room);
    }
    
    const player = room.addPlayer(ws);
    
    ws.send(JSON.stringify({
        type: 'init',
        playerId: player.id,
        roomId: room.id,
        players: room.getPlayersState(),
        foods: room.foods,
        tileCount: TILE_COUNT
    }));
    
    room.broadcast({ type: 'playerJoined', playerId: player.id, players: room.getPlayersState() });
    
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            if (message.roomId === room.id) {
                room.handleMessage(player.id, message);
            }
        } catch (e) {
            console.error('Error:', e);
        }
    });
    
    ws.on('close', () => {
        room.removePlayer(player.id);
        room.broadcast({ type: 'playerLeft', playerId: player.id, players: room.getPlayersState() });
    });
});

console.log('═══════════════════════════════════════');
console.log('   🐍 Neon Snake Server Started');
console.log('═══════════════════════════════════════');
console.log('   Local: ws://localhost:8080');
console.log('   LAN:   ws://<your-ip>:8080');
console.log('═══════════════════════════════════════');
