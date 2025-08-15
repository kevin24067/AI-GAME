/**
 * 游戏角色基类
 */
class Character {
    constructor(x, y, width, height, color, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = speed;
        this.direction = { x: 0, y: 0 };
    }
    
    /**
     * 绘制角色
     */
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    /**
     * 更新角色位置
     */
    update(canvasWidth, canvasHeight) {
        // 根据方向和速度更新位置
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;
        
        // 确保角色不会移出画布
        this.x = Math.max(0, Math.min(this.x, canvasWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, canvasHeight - this.height));
    }
    
    /**
     * 检测与其他角色的碰撞
     */
    collidesWith(other) {
        return !(
            this.x + this.width <= other.x ||
            this.x >= other.x + other.width ||
            this.y + this.height <= other.y ||
            this.y >= other.y + other.height
        );
    }
    
    /**
     * 计算与另一个角色的距离
     */
    distanceTo(other) {
        const dx = (this.x + this.width / 2) - (other.x + other.width / 2);
        const dy = (this.y + this.height / 2) - (other.y + other.height / 2);
        return Math.sqrt(dx * dx + dy * dy);
    }
}