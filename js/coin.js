class Coin extends Sprite {
    constructor(x, y) {
        super(x, y, 20, 20, '#FFD700'); // 金色金币
        this.collected = false;
        this.bobHeight = 5;
        this.bobSpeed = 0.05;
        this.bobTime = Math.random() * Math.PI * 2; // 随机初始相位
    }
    
    update() {
        // 金币上下浮动动画
        this.bobTime += this.bobSpeed;
        const bobOffset = Math.sin(this.bobTime) * this.bobHeight;
        this.y = this.y - this.velocityY + bobOffset;
        
        // 重置velocityY，因为我们手动处理了y坐标
        this.velocityY = 0;
    }
    
    draw(ctx) {
        if (this.collected) return;
        
        // 绘制金币
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制金币闪光效果
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 3, this.y + this.height / 3, this.width / 6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    collect() {
        if (!this.collected) {
            this.collected = true;
            return 100; // 金币价值
        }
        return 0;
    }
}