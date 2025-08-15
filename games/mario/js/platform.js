class Platform extends Sprite {
    constructor(x, y, width, height) {
        super(x, y, width, height, '#8B4513'); // 棕色平台
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 添加平台纹理
        ctx.fillStyle = '#A0522D';
        for (let i = 0; i < this.width; i += 20) {
            ctx.fillRect(this.x + i, this.y, 10, this.height);
        }
    }
}