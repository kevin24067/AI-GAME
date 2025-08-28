// 法老之光游戏激光系统

class LaserSystem {
    constructor(board) {
        this.board = board;
        this.laserPath = [];
        this.animationFrames = [];
        this.isAnimating = false;
    }

    // 发射激光
    fireLaser(player) {
        // 清除之前的激光路径
        this.clearLaser();
        
        // 根据玩家确定激光发射源
        // 红色玩家从左上角(A8)发射，蓝色玩家从右下角(J1)发射
        const laserSource = player === PLAYERS.RED ? 
            GAME_CONFIG.LASER_SOURCES[0] : GAME_CONFIG.LASER_SOURCES[1];
        
        // 计算激光路径
        this.laserPath = this.calculateLaserPath(laserSource);
        
        // 检查是否击中法老
        const hitResult = this.checkPharaohHit();
        
        return {
            path: this.laserPath,
            hitPharaoh: hitResult.hit,
            winner: hitResult.winner,
            destroyedPieces: this.getDestroyedPieces()
        };
    }

    // 计算激光路径
    calculateLaserPath(source) {
        const path = [];
        let currentX = source.x;
        let currentY = source.y;
        let direction = this.getDirectionVector(source.direction);
        let maxSteps = 100; // 防止无限循环
        
        while (maxSteps > 0) {
            // 移动到下一个位置
            currentX += direction.x;
            currentY += direction.y;
            
            // 检查是否超出棋盘边界
            if (!this.board.isValidPosition(currentX, currentY)) {
                break;
            }
            
            // 添加路径点
            path.push({
                x: currentX,
                y: currentY,
                direction: { ...direction }
            });
            
            // 检查是否有棋子
            const piece = this.board.getPieceAt(currentX, currentY);
            if (piece) {
                // 计算激光与棋子的交互
                const interaction = piece.interactWithLaser(direction);
                
                if (interaction.destroyed) {
                    // 棋子被摧毁，激光停止
                    path[path.length - 1].hitPiece = piece;
                    path[path.length - 1].destroyed = true;
                    break;
                } else if (interaction.absorbed) {
                    // 激光被吸收，停止
                    path[path.length - 1].hitPiece = piece;
                    path[path.length - 1].absorbed = true;
                    break;
                } else if (interaction.reflected) {
                    // 激光被反射，改变方向
                    direction = interaction.newDirection;
                    path[path.length - 1].hitPiece = piece;
                    path[path.length - 1].reflected = true;
                    path[path.length - 1].newDirection = { ...direction };
                }
            }
            
            maxSteps--;
        }
        
        return path;
    }

    // 获取方向向量
    getDirectionVector(direction) {
        switch (direction) {
            case 'up': return { x: 0, y: -1 };
            case 'down': return { x: 0, y: 1 };
            case 'left': return { x: -1, y: 0 };
            case 'right': return { x: 1, y: 0 };
            default: return { x: 1, y: 0 };
        }
    }

    // 检查是否击中法老
    checkPharaohHit() {
        for (let pathPoint of this.laserPath) {
            if (pathPoint.hitPiece && pathPoint.hitPiece.type === PIECE_TYPES.PHARAOH) {
                const winner = pathPoint.hitPiece.player === PLAYERS.RED ? PLAYERS.BLUE : PLAYERS.RED;
                return { hit: true, winner: winner, pharaoh: pathPoint.hitPiece };
            }
        }
        return { hit: false, winner: null, pharaoh: null };
    }

    // 获取被摧毁的棋子
    getDestroyedPieces() {
        const destroyed = [];
        for (let pathPoint of this.laserPath) {
            if (pathPoint.destroyed && pathPoint.hitPiece) {
                destroyed.push(pathPoint.hitPiece);
            }
        }
        return destroyed;
    }

    // 执行摧毁棋子
    executeDestruction() {
        const destroyedPieces = this.getDestroyedPieces();
        destroyedPieces.forEach(piece => {
            this.board.removePiece(piece);
        });
        return destroyedPieces;
    }

    // 清除激光
    clearLaser() {
        this.laserPath = [];
        this.stopAnimation();
    }

    // 开始激光动画
    // 开始激光动画
    startAnimation(canvas, onComplete) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.animationFrames = [];
        
        const ctx = canvas.getContext('2d');
        const cellSize = this.board.cellSize;
        let currentFrame = 0;
        
        // 获取激光发射源
        const firstPoint = this.laserPath[0];
        let sourcePoint = null;
        
        if (firstPoint) {
            // 根据第一个路径点的方向推断激光源位置
            if (firstPoint.direction.x === 1) {
                // 向右发射，源在左边
                sourcePoint = { x: firstPoint.x - 1, y: firstPoint.y };
            } else if (firstPoint.direction.x === -1) {
                // 向左发射，源在右边
                sourcePoint = { x: firstPoint.x + 1, y: firstPoint.y };
            } else if (firstPoint.direction.y === 1) {
                // 向下发射，源在上边
                sourcePoint = { x: firstPoint.x, y: firstPoint.y - 1 };
            } else if (firstPoint.direction.y === -1) {
                // 向上发射，源在下边
                sourcePoint = { x: firstPoint.x, y: firstPoint.y + 1 };
            }
        }
        
        const animate = () => {
            if (!this.isAnimating) {
                if (onComplete) onComplete();
                return;
            }
            
            // 清除激光效果层
            const laserLayer = document.getElementById('laserEffects');
            if (laserLayer) {
                laserLayer.innerHTML = '';
            }
            
            // 绘制当前帧的激光路径
            for (let i = 0; i <= currentFrame && i < this.laserPath.length; i++) {
                const point = this.laserPath[i];
                const previousPoint = i > 0 ? this.laserPath[i-1] : null;
                const useSourcePoint = i === 0 ? sourcePoint : null;
                
                this.drawLaserSegment(point, previousPoint, cellSize, laserLayer, useSourcePoint);
            }
            
            currentFrame++;
            
            if (currentFrame >= this.laserPath.length) {
                // 动画完成，保持显示一段时间
                setTimeout(() => {
                    this.stopAnimation();
                    if (onComplete) onComplete();
                }, ANIMATION_CONFIG.LASER_DURATION);
            } else {
                // 继续下一帧
                setTimeout(() => requestAnimationFrame(animate), 50);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // 绘制激光段
    // 绘制激光段
    drawLaserSegment(currentPoint, previousPoint, cellSize, container, sourcePoint = null) {
        // 确定激光段的起点
        let startX, startY;
        
        if (previousPoint) {
            startX = previousPoint.x * cellSize + cellSize / 2;
            startY = previousPoint.y * cellSize + cellSize / 2;
        } else if (sourcePoint) {
            // 从激光发射源开始
            startX = sourcePoint.x * cellSize + cellSize / 2;
            startY = sourcePoint.y * cellSize + cellSize / 2;
        } else {
            // 默认从当前点开始
            startX = currentPoint.x * cellSize + cellSize / 2;
            startY = currentPoint.y * cellSize + cellSize / 2;
        }
        
        const endX = currentPoint.x * cellSize + cellSize / 2;
        const endY = currentPoint.y * cellSize + cellSize / 2;
        
        // 只有当起点和终点不同时才绘制激光束
        if (startX !== endX || startY !== endY) {
            // 创建激光束元素
            const laserBeam = document.createElement('div');
            laserBeam.className = 'laser-beam';
            
            // 计算激光束的位置和角度
            const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
            const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
            
            laserBeam.style.left = startX + 'px';
            laserBeam.style.top = startY + 'px';
            laserBeam.style.width = length + 'px';
            laserBeam.style.height = '4px';
            laserBeam.style.transform = `rotate(${angle}deg)`;
            laserBeam.style.transformOrigin = '0 50%';
            
            container.appendChild(laserBeam);
        }
        
        // 如果击中棋子，添加相应的视觉效果
        if (currentPoint.hitPiece) {
            const hitEffect = document.createElement('div');
            
            if (currentPoint.reflected) {
                // 反射效果
                hitEffect.className = 'laser-reflection';
                hitEffect.innerHTML = '✨';
            } else if (currentPoint.absorbed) {
                // 吸收效果
                hitEffect.className = 'laser-absorption';
                hitEffect.innerHTML = '🛡️';
            } else if (currentPoint.destroyed) {
                // 摧毁效果
                hitEffect.className = 'laser-destruction';
                hitEffect.innerHTML = '💥';
            }
            
            hitEffect.style.left = (endX - 15) + 'px';
            hitEffect.style.top = (endY - 15) + 'px';
            
            container.appendChild(hitEffect);
        }
    }

    // 停止动画
    stopAnimation() {
        this.isAnimating = false;
        
        // 清除激光效果
        const laserLayer = document.getElementById('laserEffects');
        if (laserLayer) {
            laserLayer.innerHTML = '';
        }
    }

    // 绘制静态激光路径
    // 绘制静态激光路径
    drawStaticPath(ctx, cellSize) {
        if (this.laserPath.length === 0) return;
        
        ctx.save();
        ctx.strokeStyle = COLORS.LASER_CYAN;
        ctx.lineWidth = 4;
        ctx.shadowColor = COLORS.LASER_CYAN;
        ctx.shadowBlur = 8;
        
        // 找到激光发射源
        const firstPoint = this.laserPath[0];
        let sourceX, sourceY;
        
        // 根据第一个路径点的位置和方向，推断激光源
        if (firstPoint.direction.x === 1) {
            // 向右发射，源在左边
            sourceX = (firstPoint.x - 1) * cellSize + cellSize / 2;
            sourceY = firstPoint.y * cellSize + cellSize / 2;
        } else if (firstPoint.direction.x === -1) {
            // 向左发射，源在右边
            sourceX = (firstPoint.x + 1) * cellSize + cellSize / 2;
            sourceY = firstPoint.y * cellSize + cellSize / 2;
        } else if (firstPoint.direction.y === 1) {
            // 向下发射，源在上边
            sourceX = firstPoint.x * cellSize + cellSize / 2;
            sourceY = (firstPoint.y - 1) * cellSize + cellSize / 2;
        } else if (firstPoint.direction.y === -1) {
            // 向上发射，源在下边
            sourceX = firstPoint.x * cellSize + cellSize / 2;
            sourceY = (firstPoint.y + 1) * cellSize + cellSize / 2;
        } else {
            // 默认从第一个点开始
            sourceX = firstPoint.x * cellSize + cellSize / 2;
            sourceY = firstPoint.y * cellSize + cellSize / 2;
        }
        
        // 开始绘制激光路径
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        
        // 绘制完整的激光路径，包括反射后的路径
        for (let i = 0; i < this.laserPath.length; i++) {
            const point = this.laserPath[i];
            const targetX = point.x * cellSize + cellSize / 2;
            const targetY = point.y * cellSize + cellSize / 2;
            
            ctx.lineTo(targetX, targetY);
            
            // 如果有反射，需要特殊处理
            if (point.reflected) {
                // 先绘制到反射点的激光
                ctx.stroke();
                
                // 绘制反射点光效
                ctx.save();
                ctx.beginPath();
                ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(targetX, targetY, 4, 0, Math.PI * 2);
                ctx.fillStyle = COLORS.LASER_CYAN;
                ctx.fill();
                ctx.restore();
                
                // 从反射点开始新的激光段
                ctx.beginPath();
                ctx.moveTo(targetX, targetY);
                
                // 继续绘制反射后的路径
                continue;
            }
            
            // 如果激光被吸收或摧毁棋子，结束绘制
            if (point.absorbed || point.destroyed) {
                ctx.stroke();
                
                // 绘制击中效果
                ctx.save();
                ctx.beginPath();
                ctx.arc(targetX, targetY, 8, 0, Math.PI * 2);
                ctx.fillStyle = point.destroyed ? '#FF6B6B' : '#4A4A4A';
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
                
                break; // 激光结束
            }
        }
        
        // 绘制最后一段激光（如果没有被中断）
        ctx.stroke();
        ctx.restore();
    }

    // 获取激光路径信息（用于调试）
    getPathInfo() {
        return {
            length: this.laserPath.length,
            reflections: this.laserPath.filter(p => p.reflected).length,
            absorptions: this.laserPath.filter(p => p.absorbed).length,
            destructions: this.laserPath.filter(p => p.destroyed).length,
            hitPharaoh: this.checkPharaohHit().hit
        };
    }
}

// 导出激光系统类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LaserSystem;
}