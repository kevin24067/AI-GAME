/**
 * 游戏主逻辑类
 */
class ThiefGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.thief = null;
        this.guards = [];
        this.items = [];
        this.obstacles = [];
        this.level = 1;
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.gameWon = false;
        this.paused = false;
        
        this.keyStates = {};
        this.setupEventListeners();
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keyStates[e.code] = true;
            
            // 空格键激活隐身能力
            if (e.code === 'Space' && this.thief && !this.paused && !this.gameOver) {
                this.thief.activateInvisibility();
            }
            
            // ESC键暂停游戏
            if (e.code === 'Escape') {
                this.togglePause();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keyStates[e.code] = false;
        });
        
        // 按钮事件
        document.getElementById('startButton').addEventListener('click', () => {
            document.getElementById('startScreen').classList.add('hidden');
            this.startGame();
        });
        
        document.getElementById('restartButton').addEventListener('click', () => {
            document.getElementById('gameOverScreen').classList.add('hidden');
            this.resetGame();
            this.startGame();
        });
        
        document.getElementById('nextLevelButton').addEventListener('click', () => {
            document.getElementById('levelCompleteScreen').classList.add('hidden');
            this.level++;
            this.startLevel();
        });
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        this.resetGame();
        this.startLevel();
        this.gameLoop();
    }
    
    /**
     * 重置游戏状态
     */
    resetGame() {
        this.level = 1;
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.gameWon = false;
        this.paused = false;
        
        // 更新UI
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    /**
     * 开始当前关卡
     */
    startLevel() {
        // 清空所有游戏对象
        this.thief = null;
        this.guards = [];
        this.items = [];
        this.obstacles = [];
        
        // 根据关卡设置游戏
        switch (this.level) {
            case 1:
                this.setupLevel1();
                break;
            case 2:
                this.setupLevel2();
                break;
            case 3:
                this.setupLevel3();
                break;
            default:
                this.gameWon = true;
                this.showGameWonScreen();
                break;
        }
    }
    
    /**
     * 设置第一关
     */
    setupLevel1() {
        // 创建小偷
        this.thief = new Thief(50, 50);
        
        // 创建官兵
        const guard1 = new Guard(400, 100, 1);
        guard1.setPatrolPath([
            { x: 400, y: 100 },
            { x: 400, y: 300 },
            { x: 200, y: 300 },
            { x: 200, y: 100 }
        ]);
        
        const guard2 = new Guard(600, 400, 1);
        guard2.setPatrolPath([
            { x: 600, y: 400 },
            { x: 400, y: 400 },
            { x: 400, y: 200 },
            { x: 600, y: 200 }
        ]);
        
        this.guards.push(guard1, guard2);
        
        // 创建金币
        for (let i = 0; i < 5; i++) {
            const x = 100 + Math.random() * (this.width - 200);
            const y = 100 + Math.random() * (this.height - 200);
            this.items.push(new Item(x, y, 'coin'));
        }
        
        // 创建药水
        this.items.push(new Item(300, 200, 'potion'));
        
        // 创建钥匙和出口
        this.items.push(new Item(this.width - 100, this.height - 100, 'key'));
        this.exit = { x: this.width - 80, y: 50, width: 50, height: 50, locked: true };
    }
    
    /**
     * 设置第二关
     */
    setupLevel2() {
        // 创建小偷
        this.thief = new Thief(50, 50);
        
        // 创建官兵（更多、更快）
        const guard1 = new Guard(300, 100, 2);
        guard1.setPatrolPath([
            { x: 300, y: 100 },
            { x: 300, y: 300 },
            { x: 100, y: 300 },
            { x: 100, y: 100 }
        ]);
        
        const guard2 = new Guard(500, 200, 2);
        guard2.setPatrolPath([
            { x: 500, y: 200 },
            { x: 300, y: 200 },
            { x: 300, y: 400 },
            { x: 500, y: 400 }
        ]);
        
        const guard3 = new Guard(600, 100, 2);
        guard3.setPatrolPath([
            { x: 600, y: 100 },
            { x: 600, y: 300 },
            { x: 400, y: 300 },
            { x: 400, y: 100 }
        ]);
        
        this.guards.push(guard1, guard2, guard3);
        
        // 创建金币
        for (let i = 0; i < 8; i++) {
            const x = 100 + Math.random() * (this.width - 200);
            const y = 100 + Math.random() * (this.height - 200);
            this.items.push(new Item(x, y, 'coin'));
        }
        
        // 创建药水
        this.items.push(new Item(200, 200, 'potion'));
        this.items.push(new Item(500, 400, 'potion'));
        
        // 创建钥匙和出口
        this.items.push(new Item(this.width - 100, this.height - 100, 'key'));
        this.exit = { x: this.width - 80, y: 50, width: 50, height: 50, locked: true };
        
        // 添加一些障碍物
        this.obstacles.push({ x: 200, y: 150, width: 200, height: 20 });
        this.obstacles.push({ x: 400, y: 350, width: 200, height: 20 });
    }
    
    /**
     * 设置第三关
     */
    setupLevel3() {
        // 创建小偷
        this.thief = new Thief(50, 50);
        
        // 创建官兵（更多、更快、探测范围更大）
        const guard1 = new Guard(200, 100, 3);
        guard1.setPatrolPath([
            { x: 200, y: 100 },
            { x: 200, y: 300 },
            { x: 100, y: 300 },
            { x: 100, y: 100 }
        ]);
        
        const guard2 = new Guard(400, 200, 3);
        guard2.setPatrolPath([
            { x: 400, y: 200 },
            { x: 200, y: 200 },
            { x: 200, y: 400 },
            { x: 400, y: 400 }
        ]);
        
        const guard3 = new Guard(600, 100, 3);
        guard3.setPatrolPath([
            { x: 600, y: 100 },
            { x: 600, y: 300 },
            { x: 400, y: 300 },
            { x: 400, y: 100 }
        ]);
        
        const guard4 = new Guard(300, 350, 3);
        guard4.setPatrolPath([
            { x: 300, y: 350 },
            { x: 500, y: 350 },
            { x: 500, y: 450 },
            { x: 300, y: 450 }
        ]);
        
        this.guards.push(guard1, guard2, guard3, guard4);
        
        // 创建金币
        for (let i = 0; i < 10; i++) {
            const x = 100 + Math.random() * (this.width - 200);
            const y = 100 + Math.random() * (this.height - 200);
            this.items.push(new Item(x, y, 'coin'));
        }
        
        // 创建药水
        this.items.push(new Item(150, 150, 'potion'));
        this.items.push(new Item(450, 350, 'potion'));
        this.items.push(new Item(250, 450, 'potion'));
        
        // 创建钥匙和出口
        this.items.push(new Item(this.width - 100, this.height - 100, 'key'));
        this.exit = { x: this.width - 80, y: 50, width: 50, height: 50, locked: true };
        
        // 添加更多障碍物，形成迷宫
        this.obstacles.push({ x: 150, y: 150, width: 300, height: 20 });
        this.obstacles.push({ x: 150, y: 150, width: 20, height: 200 });
        this.obstacles.push({ x: 450, y: 150, width: 20, height: 200 });
        this.obstacles.push({ x: 150, y: 350, width: 320, height: 20 });
        this.obstacles.push({ x: 300, y: 250, width: 20, height: 100 });
        this.obstacles.push({ x: 500, y: 250, width: 150, height: 20 });
        this.obstacles.push({ x: 500, y: 250, width: 20, height: 150 });
    }
    
    /**
     * 游戏主循环
     */
    gameLoop() {
        if (!this.gameOver && !this.paused) {
            this.update();
        }
        
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * 更新游戏状态
     */
    update() {
        // 更新小偷位置
        this.handleThiefMovement();
        this.thief.update(this.width, this.height);
        
        // 检查小偷与障碍物的碰撞
        this.handleObstacleCollisions();
        
        // 更新官兵位置
        for (const guard of this.guards) {
            guard.update(this.width, this.height, this.thief);
            
            // 检查官兵是否抓到小偷
            if (guard.collidesWith(this.thief)) {
                this.handleThiefCaught();
                break;
            }
        }
        
        // 检查道具收集
        this.checkItemCollection();
        
        // 检查是否到达出口
        this.checkExit();
    }
    
    /**
     * 处理小偷移动
     */
    handleThiefMovement() {
        // 重置方向
        this.thief.direction.x = 0;
        this.thief.direction.y = 0;
        
        // 根据按键状态设置方向
        if (this.keyStates['ArrowLeft'] || this.keyStates['KeyA']) {
            this.thief.direction.x = -1;
        }
        if (this.keyStates['ArrowRight'] || this.keyStates['KeyD']) {
            this.thief.direction.x = 1;
        }
        if (this.keyStates['ArrowUp'] || this.keyStates['KeyW']) {
            this.thief.direction.y = -1;
        }
        if (this.keyStates['ArrowDown'] || this.keyStates['KeyS']) {
            this.thief.direction.y = 1;
        }
        
        // 如果同时按下了两个方向键，归一化向量以保持一致的速度
        if (this.thief.direction.x !== 0 && this.thief.direction.y !== 0) {
            const length = Math.sqrt(this.thief.direction.x * this.thief.direction.x + 
                                    this.thief.direction.y * this.thief.direction.y);
            this.thief.direction.x /= length;
            this.thief.direction.y /= length;
        }
    }
    
    /**
     * 处理障碍物碰撞
     */
    handleObstacleCollisions() {
        for (const obstacle of this.obstacles) {
            // 检查碰撞
            if (!(
                this.thief.x + this.thief.width <= obstacle.x ||
                this.thief.x >= obstacle.x + obstacle.width ||
                this.thief.y + this.thief.height <= obstacle.y ||
                this.thief.y >= obstacle.y + obstacle.height
            )) {
                // 确定从哪个方向碰撞，并调整位置
                const overlapLeft = this.thief.x + this.thief.width - obstacle.x;
                const overlapRight = obstacle.x + obstacle.width - this.thief.x;
                const overlapTop = this.thief.y + this.thief.height - obstacle.y;
                const overlapBottom = obstacle.y + obstacle.height - this.thief.y;
                
                // 找出最小重叠方向
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                
                if (minOverlap === overlapLeft) {
                    this.thief.x = obstacle.x - this.thief.width;
                } else if (minOverlap === overlapRight) {
                    this.thief.x = obstacle.x + obstacle.width;
                } else if (minOverlap === overlapTop) {
                    this.thief.y = obstacle.y - this.thief.height;
                } else if (minOverlap === overlapBottom) {
                    this.thief.y = obstacle.y + obstacle.height;
                }
            }
        }
    }
    
    /**
     * 处理小偷被抓
     */
    handleThiefCaught() {
        this.lives--;
        document.getElementById('lives').textContent = this.lives;
        
        if (this.lives <= 0) {
            this.gameOver = true;
            this.showGameOverScreen();
        } else {
            // 重置小偷位置
            this.thief.x = 50;
            this.thief.y = 50;
        }
    }
    
    /**
     * 检查道具收集
     */
    checkItemCollection() {
        for (const item of this.items) {
            if (!item.collected && item.collidesWith(this.thief)) {
                item.collected = true;
                
                switch (item.type) {
                    case 'coin':
                        this.score += 100;
                        document.getElementById('score').textContent = this.score;
                        break;
                    case 'potion':
                        this.thief.activateInvisibility();
                        break;
                    case 'key':
                        this.exit.locked = false;
                        break;
                }
            }
        }
    }
    
    /**
     * 检查是否到达出口
     */
    checkExit() {
        if (!this.exit.locked && 
            this.thief.x < this.exit.x + this.exit.width &&
            this.thief.x + this.thief.width > this.exit.x &&
            this.thief.y < this.exit.y + this.exit.height &&
            this.thief.y + this.thief.height > this.exit.y) {
            
            this.showLevelCompleteScreen();
        }
    }
    
    /**
     * 绘制游戏
     */
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制背景
        this.drawBackground();
        
        // 绘制障碍物
        this.drawObstacles();
        
        // 绘制出口
        this.drawExit();
        
        // 绘制道具
        for (const item of this.items) {
            item.draw(this.ctx);
        }
        
        // 绘制小偷
        this.thief.draw(this.ctx);
        
        // 绘制官兵
        for (const guard of this.guards) {
            guard.draw(this.ctx);
        }
        
        // 绘制UI
        this.drawUI();
        
        // 如果游戏暂停，绘制暂停屏幕
        if (this.paused) {
            this.drawPauseScreen();
        }
    }
    
    /**
     * 绘制背景
     */
    drawBackground() {
        // 绘制网格背景
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.strokeStyle = '#bdc3c7';
        this.ctx.lineWidth = 1;
        
        // 绘制垂直线
        for (let x = 0; x <= this.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= this.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * 绘制障碍物
     */
    drawObstacles() {
        this.ctx.fillStyle = '#7f8c8d';
        
        for (const obstacle of this.obstacles) {
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // 添加纹理
            this.ctx.strokeStyle = '#95a5a6';
            this.ctx.lineWidth = 1;
            
            // 水平线
            for (let y = obstacle.y + 5; y < obstacle.y + obstacle.height; y += 5) {
                this.ctx.beginPath();
                this.ctx.moveTo(obstacle.x, y);
                this.ctx.lineTo(obstacle.x + obstacle.width, y);
                this.ctx.stroke();
            }
            
            // 垂直线
            for (let x = obstacle.x + 5; x < obstacle.x + obstacle.width; x += 5) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, obstacle.y);
                this.ctx.lineTo(x, obstacle.y + obstacle.height);
                this.ctx.stroke();
            }
        }
    }
    
    /**
     * 绘制出口
     */
    drawExit() {
        if (this.exit.locked) {
            this.ctx.fillStyle = '#e74c3c';
        } else {
            this.ctx.fillStyle = '#2ecc71';
        }
        
        this.ctx.fillRect(this.exit.x, this.exit.y, this.exit.width, this.exit.height);
        
        // 绘制门的样式
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.exit.x + 5, this.exit.y + 5, this.exit.width - 10, this.exit.height - 10);
        
        // 绘制门把手
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(this.exit.x + 10, this.exit.y + this.exit.height / 2, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 如果门锁着，绘制锁
        if (this.exit.locked) {
            this.ctx.fillStyle = '#f39c12';
            this.ctx.fillRect(this.exit.x + this.exit.width / 2 - 5, 
                             this.exit.y + this.exit.height / 2 - 5, 10, 10);
            
            this.ctx.strokeStyle = '#000';
            this.ctx.strokeRect(this.exit.x + this.exit.width / 2 - 5, 
                               this.exit.y + this.exit.height / 2 - 5, 10, 10);
        }
    }
    
    /**
     * 绘制UI
     */
    drawUI() {
        // 绘制隐身能力冷却条
        const cooldownProgress = this.thief.getInvisibilityCooldownProgress();
        const barWidth = 100;
        const barHeight = 10;
        const barX = 20;
        const barY = this.height - 30;
        
        // 背景
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 进度
        if (this.thief.isInvisible) {
            this.ctx.fillStyle = '#9b59b6'; // 紫色表示正在使用
        } else if (cooldownProgress >= 1) {
            this.ctx.fillStyle = '#2ecc71'; // 绿色表示可用
        } else {
            this.ctx.fillStyle = '#e74c3c'; // 红色表示冷却中
        }
        
        this.ctx.fillRect(barX, barY, barWidth * cooldownProgress, barHeight);
        
        // 标签
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('隐身能力', barX, barY - 5);
        
        // 提示
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('按空格键使用隐身能力', this.width / 2, this.height - 20);
    }
    
    /**
     * 绘制暂停屏幕
     */
    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('游戏暂停', this.width / 2, this.height / 2);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillText('按ESC键继续', this.width / 2, this.height / 2 + 40);
    }
    
    /**
     * 显示游戏结束屏幕
     */
    showGameOverScreen() {
        document.getElementById('gameOverScreen').classList.remove('hidden');
        document.getElementById('finalScore').textContent = this.score;
    }
    
    /**
     * 显示关卡完成屏幕
     */
    showLevelCompleteScreen() {
        document.getElementById('levelCompleteScreen').classList.remove('hidden');
        document.getElementById('levelScore').textContent = this.score;
        document.getElementById('nextLevel').textContent = this.level + 1;
    }
    
    /**
     * 显示游戏胜利屏幕
     */
    showGameWonScreen() {
        document.getElementById('gameWonScreen').classList.remove('hidden');
        document.getElementById('finalWinScore').textContent = this.score;
    }
    
    /**
     * 切换暂停状态
     */
    togglePause() {
        this.paused = !this.paused;
    }
}