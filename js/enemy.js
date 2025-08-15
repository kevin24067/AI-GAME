class Enemy extends Sprite {
    constructor(x, y, width, height) {
        super(x, y, width, height, '#8B4513'); // 棕色敌人
        this.speed = 2;
        this.direction = 1; // 1 for right, -1 for left
    }
    
    update(platforms, canvasWidth) {
        // 应用重力
        this.velocityY += 0.5;
        
        // 水平移动
        this.velocityX = this.speed * this.direction;
        
        // 更新位置
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // 检查平台碰撞
        this.checkPlatformCollisions(platforms);
        
        // 检查边界碰撞
        if (this.x <= 0 || this.x + this.width >= canvasWidth) {
            this.direction *= -1;
        }
    }
    
    checkPlatformCollisions(platforms) {
        for (const platform of platforms) {
            if (this.intersects(platform)) {
                // 从上方碰撞平台
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                }
                // 从下方碰撞平台
                else if (this.velocityY < 0 && this.y - this.velocityY >= platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.velocityY = 0;
                }
                // 从侧面碰撞平台
                else {
                    this.direction *= -1;
                }
            }
        }
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制敌人的眼睛
        ctx.fillStyle = '#FFFFFF';
        if (this.direction === 1) {
            ctx.fillRect(this.x + this.width - 10, this.y + 5, 5, 5);
        } else {
            ctx.fillRect(this.x + 5, this.y + 5, 5, 5);
        }
    }
}