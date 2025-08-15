/**
 * 官兵角色类
 */
class Guard extends Character {
    constructor(x, y, difficulty = 1) {
        super(x, y, 35, 35, '#e74c3c', 3 + difficulty * 0.5); // 红色官兵，难度越高速度越快
        this.detectionRadius = 150 + difficulty * 20; // 探测半径，难度越高探测范围越大
        this.target = null; // 追踪目标
        this.patrolPoints = []; // 巡逻点
        this.currentPatrolIndex = 0;
        this.patrolWaitTime = 0;
        this.difficulty = difficulty;
    }
    
    /**
     * 绘制官兵
     */
    draw(ctx) {
        // 绘制官兵身体
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制官兵面部特征
        ctx.fillStyle = '#000';
        // 眼睛
        ctx.fillRect(this.x + 8, this.y + 10, 6, 6);
        ctx.fillRect(this.x + 21, this.y + 10, 6, 6);
        // 嘴巴
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 22, 5, 0, Math.PI, false);
        ctx.stroke();
        
        // 绘制官兵的帽子
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(this.x - 3, this.y - 8, this.width + 6, 10);
        
        // 绘制探测范围（调试用）
        /*
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.detectionRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(231, 76, 60, 0.3)';
        ctx.stroke();
        */
    }
    
    /**
     * 设置巡逻路径
     */
    setPatrolPath(points) {
        this.patrolPoints = points;
        if (points.length > 0) {
            this.currentPatrolIndex = 0;
            this.moveToPoint(points[0]);
        }
    }
    
    /**
     * 移动到指定点
     */
    moveToPoint(point) {
        const dx = point.x - (this.x + this.width / 2);
        const dy = point.y - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            this.direction.x = dx / distance;
            this.direction.y = dy / distance;
        } else {
            this.direction.x = 0;
            this.direction.y = 0;
            this.patrolWaitTime = 60; // 停留1秒
        }
    }
    
    /**
     * 更新官兵状态
     */
    update(canvasWidth, canvasHeight, thief) {
        // 检查是否能看到小偷
        if (thief && !thief.isInvisible) {
            const distance = this.distanceTo(thief);
            if (distance < this.detectionRadius) {
                this.target = thief;
            } else if (this.target === thief) {
                this.target = null;
            }
        } else {
            this.target = null;
        }
        
        // 如果发现小偷，追击小偷
        if (this.target) {
            const dx = (this.target.x + this.target.width / 2) - (this.x + this.width / 2);
            const dy = (this.target.y + this.target.height / 2) - (this.y + this.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                this.direction.x = dx / distance;
                this.direction.y = dy / distance;
            } else {
                this.direction.x = 0;
                this.direction.y = 0;
            }
        }
        // 否则，按照巡逻路径移动
        else if (this.patrolPoints.length > 0) {
            if (this.patrolWaitTime > 0) {
                this.patrolWaitTime--;
                if (this.patrolWaitTime <= 0) {
                    this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
                    this.moveToPoint(this.patrolPoints[this.currentPatrolIndex]);
                }
            } else {
                const currentPoint = this.patrolPoints[this.currentPatrolIndex];
                const dx = currentPoint.x - (this.x + this.width / 2);
                const dy = currentPoint.y - (this.y + this.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= 5) {
                    this.patrolWaitTime = 60; // 到达巡逻点后停留1秒
                    this.direction.x = 0;
                    this.direction.y = 0;
                }
            }
        }
        
        super.update(canvasWidth, canvasHeight);
    }
}