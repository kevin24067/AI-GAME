/**
 * 小偷角色类
 */
class Thief extends Character {
    constructor(x, y) {
        super(x, y, 30, 30, '#3498db', 5); // 蓝色小偷
        this.isInvisible = false;
        this.invisibilityTime = 0;
        this.invisibilityCooldown = 0;
    }
    
    /**
     * 绘制小偷
     */
    draw(ctx) {
        if (this.isInvisible) {
            ctx.globalAlpha = 0.5; // 半透明效果
        }
        
        // 绘制小偷身体
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制小偷面部特征
        ctx.fillStyle = '#000';
        // 眼睛
        ctx.fillRect(this.x + 7, this.y + 10, 5, 5);
        ctx.fillRect(this.x + 18, this.y + 10, 5, 5);
        // 嘴巴
        ctx.fillRect(this.x + 10, this.y + 20, 10, 3);
        
        // 绘制小偷的帽子
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x - 2, this.y - 5, this.width + 4, 8);
        
        ctx.globalAlpha = 1.0; // 恢复透明度
    }
    
    /**
     * 更新小偷状态
     */
    update(canvasWidth, canvasHeight) {
        super.update(canvasWidth, canvasHeight);
        
        // 更新隐身状态
        if (this.isInvisible) {
            this.invisibilityTime--;
            if (this.invisibilityTime <= 0) {
                this.isInvisible = false;
                this.invisibilityCooldown = 300; // 5秒冷却时间（假设60帧/秒）
            }
        } else if (this.invisibilityCooldown > 0) {
            this.invisibilityCooldown--;
        }
    }
    
    /**
     * 激活隐身能力
     */
    activateInvisibility() {
        if (!this.isInvisible && this.invisibilityCooldown <= 0) {
            this.isInvisible = true;
            this.invisibilityTime = 180; // 3秒隐身时间（假设60帧/秒）
            return true;
        }
        return false;
    }
    
    /**
     * 获取隐身能力冷却进度（0-1）
     */
    getInvisibilityCooldownProgress() {
        if (this.isInvisible) {
            return this.invisibilityTime / 180;
        } else if (this.invisibilityCooldown > 0) {
            return 1 - (this.invisibilityCooldown / 300);
        }
        return 1;
    }
}