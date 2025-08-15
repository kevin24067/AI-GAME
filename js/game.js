class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.finalScoreElement = document.getElementById('finalScore');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        
        this.keys = {};
        this.gameRunning = false;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 键盘事件
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // 按钮事件
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.startGame());
    }
    
    startGame() {
        this.gameRunning = true;
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        
        // 初始化游戏对象
        this.player = new Player(50, 300);
        this.platforms = this.createPlatforms();
        this.enemies = this.createEnemies();
        this.coins = this.createCoins();
        
        // 开始游戏循环
        this.gameLoop();
    }
    
    createPlatforms() {
        const platforms = [];
        
        // 地面
        platforms.push(new Platform(0, 550, 800, 50));
        
        // 平台
        platforms.push(new Platform(100, 450, 200, 20));
        platforms.push(new Platform(400, 400, 150, 20));
        platforms.push(new Platform(600, 350, 150, 20));
        platforms.push(new Platform(200, 300, 150, 20));
        platforms.push(new Platform(0, 250, 100, 20));
        platforms.push(new Platform(350, 200, 200, 20));
        platforms.push(new Platform(650, 150, 150, 20));
        
        return platforms;
    }
    
    createEnemies() {
        const enemies = [];
        
        enemies.push(new Enemy(300, 400, 30, 30));
        enemies.push(new Enemy(500, 350, 30, 30));
        enemies.push(new Enemy(250, 250, 30, 30));
        enemies.push(new Enemy(400, 150, 30, 30));
        
        return enemies;
    }
    
    createCoins() {
        const coins = [];
        
        coins.push(new Coin(150, 400));
        coins.push(new Coin(200, 400));
        coins.push(new Coin(450, 350));
        coins.push(new Coin(500, 350));
        coins.push(new Coin(650, 300));
        coins.push(new Coin(700, 300));
        coins.push(new Coin(250, 250));
        coins.push(new Coin(300, 250));
        coins.push(new Coin(50, 200));
        coins.push(new Coin(400, 150));
        coins.push(new Coin(450, 150));
        coins.push(new Coin(700, 100));
        
        return coins;
    }
    
    handleInput() {
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.moveLeft();
        } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.moveRight();
        } else {
            this.player.stop();
        }
        
        if ((this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['Space']) && !this.player.isJumping) {
            this.player.jump();
        }
    }
    
    update() {
        // 更新玩家
        this.player.update(this.platforms);
        
        // 检查玩家是否掉出屏幕
        if (this.player.y > this.canvas.height) {
            if (this.player.takeDamage()) {
                this.gameOver();
                return;
            } else {
                // 重置玩家位置
                this.player.x = 50;
                this.player.y = 300;
                this.player.velocityY = 0;
            }
        }
        
        // 更新敌人
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            enemy.update(this.platforms, this.canvas.width);
            
            // 检查与玩家的碰撞
            if (this.player.intersects(enemy)) {
                // 从上方踩敌人
                if (this.player.velocityY > 0 && this.player.y + this.player.height - this.player.velocityY <= enemy.y) {
                    this.enemies.splice(i, 1);
                    this.player.velocityY = -10; // 反弹
                    this.player.addScore(200);
                    i--;
                } else {
                    // 被敌人伤害
                    if (this.player.takeDamage()) {
                        this.gameOver();
                        return;
                    }
                }
            }
        }
        
        // 更新金币
        for (let i = 0; i < this.coins.length; i++) {
            const coin = this.coins[i];
            coin.update();
            
            // 检查与玩家的碰撞
            if (!coin.collected && this.player.intersects(coin)) {
                const points = coin.collect();
                this.player.addScore(points);
            }
        }
        
        // 更新UI
        this.scoreElement.textContent = this.player.score;
        this.livesElement.textContent = this.player.lives;
    }
    
    draw() {
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        this.drawBackground();
        
        // 绘制平台
        for (const platform of this.platforms) {
            platform.draw(this.ctx);
        }
        
        // 绘制金币
        for (const coin of this.coins) {
            coin.draw(this.ctx);
        }
        
        // 绘制敌人
        for (const enemy of this.enemies) {
            enemy.draw(this.ctx);
        }
        
        // 绘制玩家
        this.player.draw(this.ctx);
    }
    
    drawBackground() {
        // 天空
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 云朵
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(100, 100, 30, 0, Math.PI * 2);
        this.ctx.arc(130, 90, 30, 0, Math.PI * 2);
        this.ctx.arc(160, 100, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(500, 70, 25, 0, Math.PI * 2);
        this.ctx.arc(530, 60, 25, 0, Math.PI * 2);
        this.ctx.arc(560, 70, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 远处的山
        this.ctx.fillStyle = '#228B22';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 400);
        this.ctx.lineTo(200, 250);
        this.ctx.lineTo(400, 350);
        this.ctx.lineTo(600, 200);
        this.ctx.lineTo(800, 300);
        this.ctx.lineTo(800, 400);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.handleInput();
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    gameOver() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.player.score;
        this.gameOverScreen.classList.remove('hidden');
    }
}

// 当页面加载完成后初始化游戏
window.addEventListener('load', () => {
    const game = new Game();
});