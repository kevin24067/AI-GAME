class Player extends Sprite {
    constructor(x, y) {
        super(x, y, 30, 50, '#E52521'); // 马里奥的红色
        this.jumpPower = -15;
        this.gravity = 0.5;
        this.speed = 5;
        this.isJumping = false;
        this.direction = 1; // 1 for right, -1 for left
        this.lives = 3;
        this.score = 0;
        this.isInvincible = false;
        this.invincibleTime = 0;
    }

    update(platforms) {
        // 应用重力
        this.velocityY += this.gravity;
        
        // 更新位置
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // 检查平台碰撞
        this.checkPlatformCollisions(platforms);
        
        // 处理无敌时间
        if (this.isInvincible) {
            this.invincibleTime--;
            if (this.invincibleTime <= 0) {
                this.isInvincible = false;
            }
        }
    }
    
    checkPlatformCollisions(platforms) {
        let onPlatform = false;
        
        for (const platform of platforms) {
            if (this.intersects(platform)) {
                // 从上方碰撞平台
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.isJumping = false;
                    onPlatform = true;
                }
                // 从下方碰撞平台
                else if (this.velocityY < 0 && this.y - this.velocityY >= platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.velocityY = 0;
                }
                // 从左侧碰撞平台
                else if (this.velocityX > 0 && this.x + this.width - this.velocityX <= platform.x) {
                    this.x = platform.x - this.width;
                    this.velocityX = 0;
                }
                // 从右侧碰撞平台
                else if (this.velocityX < 0 && this.x - this.velocityX >= platform.x + platform.width) {
                    this.x = platform.x + platform.width;
                    this.velocityX = 0;
                }
            }
        }
        
        if (!onPlatform && !this.isJumping) {
            this.isJumping = true;
        }
    }
    
    jump() {
        if (!this.isJumping) {
            this.velocityY = this.jumpPower;
            this.isJumping = true;
        }
    }
    
    moveLeft() {
        this.velocityX = -this.speed;
        this.direction = -1;
    }
    
    moveRight() {
        this.velocityX = this.speed;
        this.direction = 1;
    }
    
    stop() {
        this.velocityX = 0;
    }
    
    takeDamage() {
        if (!this.isInvincible) {
            this.lives--;
            this.isInvincible = true;
            this.invincibleTime = 60; // 60帧无敌时间
        }
        return this.lives <= 0;
    }
    
    addScore(points) {
        this.score += points;
    }
    
    draw(ctx) {
        // 如果处于无敌状态，则闪烁效果
        if (this.isInvincible && Math.floor(this.invincibleTime / 5) % 2 === 0) {
            return;
        }
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制马里奥的帽子
        ctx.fillStyle = '#E52521'; // 红色帽子
        ctx.fillRect(this.x - 5, this.y, this.width + 10, 10);
        
        // 绘制马里奥的脸
        ctx.fillStyle = '#FFA07A'; // 肤色
        ctx.fillRect(this.x + 5, this.y + 10, this.width - 10, 15);
        
        // 绘制马里奥的眼睛
        ctx.fillStyle = '#000000';
        if (this.direction === 1) {
            ctx.fillRect(this.x + 20, this.y + 15, 5, 5);
        } else {
            ctx.fillRect(this.x + 5, this.y + 15, 5, 5);
        }
    }
}