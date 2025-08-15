class Sprite {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
    }

    intersects(other) {
        return !(
            this.x + this.width <= other.x ||
            this.x >= other.x + other.width ||
            this.y + this.height <= other.y ||
            this.y >= other.y + other.height
        );
    }
}