// 法老之光游戏棋子类定义

class Piece {
    constructor(type, player, x, y, direction = 0) {
        this.type = type;
        this.player = player;
        this.x = x;
        this.y = y;
        this.direction = direction; // 0-3 对应 0°, 90°, 180°, 270°
        this.selected = false;
        this.highlighted = false;
    }

    // 获取棋子显示符号
    getSymbol() {
        return PIECE_SYMBOLS[this.type];
    }

    // 获取棋子颜色
    getColor() {
        return this.player === PLAYERS.RED ? COLORS.RED_PLAYER : COLORS.BLUE_PLAYER;
    }

    // 检查是否可以移动
    canMove() {
        return this.type !== PIECE_TYPES.PHARAOH;
    }

    // 检查是否可以旋转
    canRotate() {
        return this.type !== PIECE_TYPES.PHARAOH;
    }

    // 旋转棋子
    rotate(clockwise = true) {
        if (!this.canRotate()) return false;
        
        if (clockwise) {
            this.direction = (this.direction + 1) % 4;
        } else {
            this.direction = (this.direction + 3) % 4;
        }
        return true;
    }

    // 移动棋子到新位置
    moveTo(newX, newY) {
        if (!this.canMove()) return false;
        
        this.x = newX;
        this.y = newY;
        return true;
    }

    // 获取激光交互结果
    interactWithLaser(laserDirection) {
        switch (this.type) {
            case PIECE_TYPES.PHARAOH:
                return { destroyed: true, reflected: false, absorbed: false };
                
            case PIECE_TYPES.PYRAMID:
                return this.pyramidInteraction(laserDirection);
                
            case PIECE_TYPES.SCARAB:
                return this.scarabInteraction(laserDirection);
                
            case PIECE_TYPES.ANUBIS:
                return this.anubisInteraction(laserDirection);
                
            default:
                return { destroyed: false, reflected: false, absorbed: false };
        }
    }

    // 金字塔激光交互
    // 金字塔激光交互
    pyramidInteraction(laserDirection) {
        // 金字塔是单面90度反射镜，只有镜面能反射激光
        const mirrorNormal = this.getMirrorNormal();
        const laserAngle = this.getLaserAngle(laserDirection);
        const mirrorAngle = this.direction * 90;
        
        // 计算激光与镜面的夹角
        let angleDiff = Math.abs(laserAngle - mirrorAngle);
        if (angleDiff > 180) angleDiff = 360 - angleDiff;
        
        // 检查激光是否从镜面正面入射（允许一定角度范围）
        if (angleDiff >= 135 && angleDiff <= 225) {
            // 从镜面正面入射，进行90度反射
            const reflectedDirection = this.calculatePyramidReflection(laserDirection, this.direction);
            return { 
                destroyed: false, 
                reflected: true, 
                absorbed: false,
                newDirection: reflectedDirection
            };
        } else {
            // 从背面或侧面击中，棋子被摧毁
            return { destroyed: true, reflected: false, absorbed: false };
        }
    }

    // 圣甲虫激光交互
    // 圣甲虫激光交互
    scarabInteraction(laserDirection) {
        // 圣甲虫是双面对角线反射镜，可以从任意角度反射
        const reflectedDirection = this.calculateScarabReflection(laserDirection, this.direction);
        return { 
            destroyed: false, 
            reflected: true, 
            absorbed: false,
            newDirection: reflectedDirection
        };
    }

    // 阿努比斯激光交互
    // 阿努比斯激光交互
    anubisInteraction(laserDirection) {
        // 阿努比斯是单面吸收盾，只有盾牌正面能吸收激光
        const shieldAngle = this.direction * 90;
        const laserAngle = this.getLaserAngle(laserDirection);
        
        // 计算激光与盾牌的相对角度
        let angleDiff = Math.abs(laserAngle - shieldAngle);
        if (angleDiff > 180) angleDiff = 360 - angleDiff;
        
        // 检查激光是否从盾牌正面入射（180度相对，允许45度误差）
        if (angleDiff >= 135 && angleDiff <= 225) {
            // 从盾牌正面入射，吸收激光
            return { destroyed: false, reflected: false, absorbed: true };
        } else {
            // 从侧面或背面击中，棋子被摧毁
            return { destroyed: true, reflected: false, absorbed: false };
        }
    }

    // 获取激光方向角度
    getLaserAngle(laserDirection) {
        if (laserDirection.x === 1) return 0;   // 向右
        if (laserDirection.y === 1) return 90;  // 向下
        if (laserDirection.x === -1) return 180; // 向左
        if (laserDirection.y === -1) return 270; // 向上
        return 0;
    }

    // 检查是否击中镜面
    isHittingMirrorSide(laserAngle, mirrorDirection) {
        const mirrorAngle = mirrorDirection * 90;
        const angleDiff = Math.abs(laserAngle - mirrorAngle) % 360;
        return angleDiff <= 45 || angleDiff >= 315;
    }

    // 检查是否击中盾牌正面
    isHittingShieldFront(laserAngle, shieldDirection) {
        const shieldAngle = shieldDirection * 90;
        const angleDiff = Math.abs(laserAngle - shieldAngle) % 360;
        return angleDiff <= 45 || angleDiff >= 315;
    }

    // 计算反射方向
    // 获取镜面法向量
    getMirrorNormal() {
        // 根据方向返回镜面法向量
        const normals = [
            { x: 0, y: -1 },  // 0° - 向上
            { x: 1, y: 0 },   // 90° - 向右
            { x: 0, y: 1 },   // 180° - 向下
            { x: -1, y: 0 }   // 270° - 向左
        ];
        return normals[this.direction];
    }

    // 计算金字塔反射（90度反射）
    calculatePyramidReflection(laserDirection, mirrorDirection) {
        // 金字塔进行90度反射
        const reflectionMatrix = [
            // 镜面朝向: 0°(上), 90°(右), 180°(下), 270°(左)
            [
                { x: 0, y: 1 },   // 激光向右 → 向下
                { x: -1, y: 0 },  // 激光向下 → 向左  
                { x: 0, y: -1 },  // 激光向左 → 向上
                { x: 1, y: 0 }    // 激光向上 → 向右
            ],
            [
                { x: 0, y: -1 },  // 激光向右 → 向上
                { x: 1, y: 0 },   // 激光向下 → 向右
                { x: 0, y: 1 },   // 激光向左 → 向下
                { x: -1, y: 0 }   // 激光向上 → 向左
            ],
            [
                { x: 0, y: -1 },  // 激光向右 → 向上
                { x: 1, y: 0 },   // 激光向下 → 向右
                { x: 0, y: 1 },   // 激光向左 → 向下
                { x: -1, y: 0 }   // 激光向上 → 向左
            ],
            [
                { x: 0, y: 1 },   // 激光向右 → 向下
                { x: -1, y: 0 },  // 激光向下 → 向左
                { x: 0, y: -1 },  // 激光向左 → 向上
                { x: 1, y: 0 }    // 激光向上 → 向右
            ]
        ];
        
        const laserIndex = this.directionToIndex(laserDirection);
        return reflectionMatrix[mirrorDirection][laserIndex];
    }

    // 计算反射方向（通用方法）
    calculateReflection(laserDirection, mirrorDirection) {
        // 使用更精确的反射计算
        return this.calculatePyramidReflection(laserDirection, mirrorDirection);
    }

    // 计算对角线反射
    // 计算圣甲虫反射（对角线反射）
    calculateScarabReflection(laserDirection, scarabDirection) {
        // 圣甲虫是双面对角线反射镜，根据旋转角度进行对角线反射
        const laserIndex = this.directionToIndex(laserDirection);
        
        // 对角线反射矩阵 - 根据圣甲虫的旋转角度
        const reflectionMatrices = [
            // 0° - 主对角线反射 (\)
            [
                { x: 0, y: -1 },  // 右 → 上
                { x: 1, y: 0 },   // 下 → 右
                { x: 0, y: 1 },   // 左 → 下
                { x: -1, y: 0 }   // 上 → 左
            ],
            // 90° - 副对角线反射 (/)
            [
                { x: 0, y: 1 },   // 右 → 下
                { x: -1, y: 0 },  // 下 → 左
                { x: 0, y: -1 },  // 左 → 上
                { x: 1, y: 0 }    // 上 → 右
            ],
            // 180° - 主对角线反射 (\)
            [
                { x: 0, y: -1 },  // 右 → 上
                { x: 1, y: 0 },   // 下 → 右
                { x: 0, y: 1 },   // 左 → 下
                { x: -1, y: 0 }   // 上 → 左
            ],
            // 270° - 副对角线反射 (/)
            [
                { x: 0, y: 1 },   // 右 → 下
                { x: -1, y: 0 },  // 下 → 左
                { x: 0, y: -1 },  // 左 → 上
                { x: 1, y: 0 }    // 上 → 右
            ]
        ];
        
        return reflectionMatrices[scarabDirection][laserIndex];
    }

    // 计算对角线反射（保持兼容性）
    calculateDiagonalReflection(laserDirection, scarabDirection) {
        return this.calculateScarabReflection(laserDirection, scarabDirection);
    }

    // 方向向量转索引
    directionToIndex(direction) {
        if (direction.x === 1) return 0;   // 右
        if (direction.y === 1) return 1;   // 下
        if (direction.x === -1) return 2;  // 左
        if (direction.y === -1) return 3;  // 上
        return 0;
    }

    // 索引转方向向量
    indexToDirection(index) {
        const directions = [
            { x: 1, y: 0 },   // 右
            { x: 0, y: 1 },   // 下
            { x: -1, y: 0 },  // 左
            { x: 0, y: -1 }   // 上
        ];
        return directions[index] || directions[0];
    }

    // 角度转方向向量
    angleToDirection(angle) {
        angle = angle % 360;
        if (angle < 45 || angle >= 315) return { x: 1, y: 0 };   // 右
        if (angle >= 45 && angle < 135) return { x: 0, y: 1 };   // 下
        if (angle >= 135 && angle < 225) return { x: -1, y: 0 }; // 左
        if (angle >= 225 && angle < 315) return { x: 0, y: -1 }; // 上
        return { x: 1, y: 0 };
    }

    // 绘制棋子
    draw(ctx, cellSize) {
        const centerX = this.x * cellSize + cellSize / 2;
        const centerY = this.y * cellSize + cellSize / 2;
        
        // 绘制选中高亮
        if (this.selected) {
            ctx.fillStyle = COLORS.SELECTED;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);
            ctx.globalAlpha = 1;
        }
        
        // 绘制可移动高亮
        if (this.highlighted) {
            ctx.fillStyle = COLORS.HIGHLIGHT;
            ctx.globalAlpha = 0.2;
            ctx.fillRect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);
            ctx.globalAlpha = 1;
        }
        
        // 根据棋子类型绘制不同的形状和镜子效果
        this.drawPieceShape(ctx, centerX, centerY, cellSize);
        
        // 绘制方向指示器（除法老外）
        if (this.type !== PIECE_TYPES.PHARAOH) {
            this.drawDirectionIndicator(ctx, centerX, centerY, cellSize);
        }
    }

    // 绘制棋子形状
    drawPieceShape(ctx, centerX, centerY, cellSize) {
        const radius = cellSize * 0.35;
        
        switch (this.type) {
            case PIECE_TYPES.PHARAOH:
                this.drawPharaoh(ctx, centerX, centerY, radius);
                break;
            case PIECE_TYPES.PYRAMID:
                this.drawPyramid(ctx, centerX, centerY, radius);
                break;
            case PIECE_TYPES.SCARAB:
                this.drawScarab(ctx, centerX, centerY, radius);
                break;
            case PIECE_TYPES.ANUBIS:
                this.drawAnubis(ctx, centerX, centerY, radius);
                break;
        }
    }

    // 绘制法老
    drawPharaoh(ctx, centerX, centerY, radius) {
        // 绘制基础圆形
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.getColor();
        ctx.fill();
        ctx.strokeStyle = COLORS.GOLD;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 绘制王冠符号
        ctx.fillStyle = COLORS.GOLD;
        ctx.font = `${radius * 1.2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👑', centerX, centerY);
    }

    // 绘制金字塔（带镜面效果）
    // 绘制金字塔（带镜面效果）
    drawPyramid(ctx, centerX, centerY, radius) {
        const size = radius * 1.2;
        
        // 计算三角形顶点
        const angle = (this.direction * Math.PI / 2) - Math.PI / 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        // 三角形的三个顶点（相对于中心）
        const points = [
            { x: 0, y: -size * 0.8 },      // 顶点
            { x: -size * 0.6, y: size * 0.4 },  // 左下
            { x: size * 0.6, y: size * 0.4 }    // 右下
        ];
        
        // 旋转顶点
        const rotatedPoints = points.map(p => ({
            x: centerX + p.x * cos - p.y * sin,
            y: centerY + p.x * sin + p.y * cos
        }));
        
        // 绘制三角形主体
        ctx.beginPath();
        ctx.moveTo(rotatedPoints[0].x, rotatedPoints[0].y);
        ctx.lineTo(rotatedPoints[1].x, rotatedPoints[1].y);
        ctx.lineTo(rotatedPoints[2].x, rotatedPoints[2].y);
        ctx.closePath();
        ctx.fillStyle = this.getColor();
        ctx.fill();
        ctx.strokeStyle = COLORS.GOLD;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制镜面（反射面）
        const mirrorStart = rotatedPoints[0];
        const mirrorEnd = { 
            x: (rotatedPoints[1].x + rotatedPoints[2].x) / 2,
            y: (rotatedPoints[1].y + rotatedPoints[2].y) / 2
        };
        
        ctx.beginPath();
        ctx.moveTo(mirrorStart.x, mirrorStart.y);
        ctx.lineTo(mirrorEnd.x, mirrorEnd.y);
        ctx.strokeStyle = COLORS.LASER_CYAN;
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // 镜面光效
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制反光面白点提醒
        this.drawReflectionDots(ctx, mirrorStart, mirrorEnd, 3);
    }

    // 绘制圣甲虫（双面对角镜）
    // 绘制圣甲虫（双面对角镜）
    drawScarab(ctx, centerX, centerY, radius) {
        // 绘制圆形基础
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.getColor();
        ctx.fill();
        ctx.strokeStyle = COLORS.GOLD;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制对角线镜面
        const mirrorLength = radius * 1.4;
        const angle = (this.direction * Math.PI / 2) + Math.PI / 4; // 45度对角线
        
        const startX = centerX - Math.cos(angle) * mirrorLength / 2;
        const startY = centerY - Math.sin(angle) * mirrorLength / 2;
        const endX = centerX + Math.cos(angle) * mirrorLength / 2;
        const endY = centerY + Math.sin(angle) * mirrorLength / 2;
        
        // 主镜面
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = COLORS.LASER_CYAN;
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // 镜面光效
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制反光面白点提醒（双面镜）
        this.drawReflectionDots(ctx, { x: startX, y: startY }, { x: endX, y: endY }, 4);
        
        // 绘制圣甲虫符号
        ctx.fillStyle = COLORS.GOLD;
        ctx.font = `${radius * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪲', centerX, centerY);
    }

    // 绘制阿努比斯（单面吸收盾）
    // 绘制阿努比斯（单面吸收盾）
    drawAnubis(ctx, centerX, centerY, radius) {
        // 绘制基础形状
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.getColor();
        ctx.fill();
        ctx.strokeStyle = COLORS.GOLD;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制盾牌（吸收面）
        const shieldSize = radius * 0.8;
        const angle = this.direction * Math.PI / 2;
        const shieldX = centerX + Math.cos(angle) * radius * 0.6;
        const shieldY = centerY + Math.sin(angle) * radius * 0.6;
        
        // 盾牌形状
        ctx.beginPath();
        ctx.arc(shieldX, shieldY, shieldSize * 0.5, angle - Math.PI/3, angle + Math.PI/3);
        ctx.fillStyle = '#4A4A4A';
        ctx.fill();
        ctx.strokeStyle = COLORS.BRONZE;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 绘制盾牌正面的反光点提醒
        const shieldFrontX = centerX + Math.cos(angle) * radius * 0.8;
        const shieldFrontY = centerY + Math.sin(angle) * radius * 0.8;
        this.drawShieldReflectionDots(ctx, shieldFrontX, shieldFrontY, angle);
        
        // 绘制阿努比斯符号
        ctx.fillStyle = COLORS.GOLD;
        ctx.font = `${radius * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐺', centerX, centerY);
    }

    // 绘制方向指示器
    drawDirectionIndicator(ctx, centerX, centerY, cellSize) {
        const radius = cellSize * 0.45;
        const angle = this.direction * Math.PI / 2 - Math.PI / 2; // 转换为弧度，0°指向上方
        
        const indicatorX = centerX + Math.cos(angle) * radius;
        const indicatorY = centerY + Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.arc(indicatorX, indicatorY, 3, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.GOLD;
        ctx.fill();
    }

    // 检查点击是否在棋子范围内
    isPointInside(x, y, cellSize) {
        const centerX = this.x * cellSize + cellSize / 2;
        const centerY = this.y * cellSize + cellSize / 2;
        const radius = cellSize * 0.4;
        
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        return distance <= radius;
    }

    // 克隆棋子
    // 绘制反光点提醒（用于镜面）
    drawReflectionDots(ctx, startPoint, endPoint, dotCount) {
        ctx.save();
        
        // 计算镜面长度和方向
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        // 绘制白色反光点
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 4;
        
        for (let i = 0; i < dotCount; i++) {
            const t = (i + 1) / (dotCount + 1); // 均匀分布在镜面上
            const dotX = startPoint.x + dx * t;
            const dotY = startPoint.y + dy * t;
            
            ctx.beginPath();
            ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    // 绘制盾牌反光点提醒
    drawShieldReflectionDots(ctx, centerX, centerY, angle) {
        ctx.save();
        
        // 绘制盾牌正面的白色反光点
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 3;
        
        // 在盾牌正面绘制3个反光点
        const dotPositions = [
            { x: centerX, y: centerY },
            { x: centerX + Math.cos(angle + Math.PI/6) * 8, y: centerY + Math.sin(angle + Math.PI/6) * 8 },
            { x: centerX + Math.cos(angle - Math.PI/6) * 8, y: centerY + Math.sin(angle - Math.PI/6) * 8 }
        ];
        
        dotPositions.forEach(pos => {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }

    // 克隆棋子
    clone() {
        return new Piece(this.type, this.player, this.x, this.y, this.direction);
    }
}

// 导出棋子类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Piece;
}