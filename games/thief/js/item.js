/**
 * 游戏道具类
 */
class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type; // 'coin', 'potion', 'key'
        this.collected = false;
        this.pulseValue = 0;
        this.pulseDirection = 0.05;
    }
    
    /**
     * 绘制道具
     */
    draw(ctx) {
        if (this.collected) return;
        
        // 脉冲效果
        this.pulseValue += this.pulseDirection;
        if (this.pulseValue >= 1 || this.pulseValue <= 0) {
            this.pulseDirection *= -1;
        }
        
        const glowSize = 3 * this.pulseValue;
        
        switch (this.type) {
            case 'coin':
                // 绘制金币
                ctx.fillStyle = '#f1c40f';
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 
                         this.width / 2 + glowSize, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 
                         this.width / 2, 0, Math.PI * 2);
                ctx.fillStyle = '#f1c40f';
                ctx.fill();
                ctx.strokeStyle = '#f39c12';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // 金币符号
                ctx.fillStyle = '#f39c12';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('¥', this.x + this.width / 2, this.y + this.height / 2);
                break;
                
            case 'potion':
                // 绘制隐身药水
                ctx.fillStyle = 'rgba(155, 89, 182, 0.3)';
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 
                         this.width / 2 + glowSize, 0, Math.PI * 2);
                ctx.fill();
                
                // 药水瓶
                ctx.fillStyle = '#9b59b6';
                ctx.fillRect(this.x + 6, this.y + 3, 8, 4);
                ctx.fillRect(this.x + 5, this.y + 7, 10, 10);
                
                // 药水液体
                ctx.fillStyle = '#8e44ad';
                ctx.fillRect(this.x + 7, this.y + 10, 6, 5);
                break;
                
            case 'key':
                // 绘制钥匙
                ctx.fillStyle = 'rgba(243, 156, 18, 0.3)';
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 
                         this.width / 2 + glowSize, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#f39c12';
                // 钥匙头
                ctx.beginPath();
                ctx.arc(this.x + 8, this.y + 8, 5, 0, Math.PI * 2);
                ctx.fill();
                
                // 钥匙柄
                ctx.fillRect(this.x + 13, this.y + 7, 7, 2);
                ctx.fillRect(this.x + 16, this.y + 9, 2, 3);
                ctx.fillRect(this.x + 18, this.y + 7, 2, 2);
                break;
        }
    }
    
    /**
     * 检测与角色的碰撞
     */
    collidesWith(character) {
        if (this.collected) return false;
        
        return !(
            this.x + this.width <= character.x ||
            this.x >= character.x + character.width ||
            this.y + this.height <= character.y ||
            this.y >= character.y + character.height
        );
    }
}