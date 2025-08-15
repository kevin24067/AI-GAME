// 激光策略棋激光类

class Laser {
    constructor(board) {
        this.board = board;
        this.path = [];
        this.hitPharaoh = false;
        this.hitPharaohPlayer = null;
    }

    // 从发射器发射激光
    fireLaser(player) {
        // 清除之前的路径
        this.path = [];
        this.hitPharaoh = false;
        this.hitPharaohPlayer = null;
        
        // 获取发射器位置
        const launcher = this.board.getLauncher(player);
        if (!launcher) return { hitPharaoh: false };
        
        let row = launcher.row;
        let col = launcher.col;
        
        // 确定初始方向和颜色
        let direction;
        let color = player === PLAYER.RED ? LASER_COLOR.RED : LASER_COLOR.BLUE;
        
        // 根据发射器位置确定激光初始方向
        if (player === PLAYER.RED) {
            // 红方发射器在左上角，向右下发射
            direction = LASER_DIRECTION.DOWN; // 先向下发射
            row++; // 从发射器下方开始
        } else {
            // 蓝方发射器在右下角，向左上发射
            direction = LASER_DIRECTION.UP; // 先向上发射
            row--; // 从发射器上方开始
        }
        
        // 追踪激光路径
        this.traceLaserPath(row, col, direction, color);
        
        return {
            path: this.path,
            hitPharaoh: this.hitPharaoh,
            hitPharaohPlayer: this.hitPharaohPlayer
        };
    }

    // 追踪激光路径
    traceLaserPath(row, col, direction, color) {
        // 检查是否超出边界
        if (!this.board.isValidPosition(row, col)) {
            return;
        }
        
        // 获取当前位置的棋子
        const piece = this.board.getPiece(row, col);
        
        // 记录激光路径
        const pathSegment = {
            startRow: row,
            startCol: col,
            direction: direction,
            color: color
        };
        
        // 计算下一个位置
        let nextRow = row;
        let nextCol = col;
        
        switch (direction) {
            case LASER_DIRECTION.UP:
                pathSegment.endRow = row - 1;
                pathSegment.endCol = col;
                nextRow--;
                break;
            case LASER_DIRECTION.RIGHT:
                pathSegment.endRow = row;
                pathSegment.endCol = col + 1;
                nextCol++;
                break;
            case LASER_DIRECTION.DOWN:
                pathSegment.endRow = row + 1;
                pathSegment.endCol = col;
                nextRow++;
                break;
            case LASER_DIRECTION.LEFT:
                pathSegment.endRow = row;
                pathSegment.endCol = col - 1;
                nextCol--;
                break;
        }
        
        // 如果有棋子，处理激光与棋子的交互
        if (piece) {
            const result = piece.handleLaser(direction, color);
            
            // 如果击中法老，记录结果
            if (result.hitPharaoh) {
                this.hitPharaoh = true;
                this.hitPharaohPlayer = piece.player;
                this.path.push(pathSegment);
                return;
            }
            
            // 如果激光被阻挡，结束路径
            if (!result.continue) {
                this.path.push(pathSegment);
                return;
            }
            
            // 如果激光继续，更新方向和颜色
            direction = result.direction;
            color = result.color;
            
            // 根据新方向重新计算下一个位置
            switch (direction) {
                case LASER_DIRECTION.UP:
                    nextRow = row - 1;
                    nextCol = col;
                    break;
                case LASER_DIRECTION.RIGHT:
                    nextRow = row;
                    nextCol = col + 1;
                    break;
                case LASER_DIRECTION.DOWN:
                    nextRow = row + 1;
                    nextCol = col;
                    break;
                case LASER_DIRECTION.LEFT:
                    nextRow = row;
                    nextCol = col - 1;
                    break;
            }
        }
        
        // 添加路径段
        this.path.push(pathSegment);
        
        // 递归追踪下一段路径
        this.traceLaserPath(nextRow, nextCol, direction, color);
    }

    // 渲染激光路径
    renderLaserPath() {
        // 清除之前的激光
        const oldLasers = document.querySelectorAll('.laser');
        oldLasers.forEach(laser => laser.remove());
        
        // 渲染新的激光路径
        this.path.forEach(segment => {
            const laser = document.createElement('div');
            laser.classList.add('laser', segment.color);
            
            // 设置激光位置和大小
            const startSquare = document.querySelector(`.square[data-row="${segment.startRow}"][data-col="${segment.startCol}"]`);
            const endSquare = document.querySelector(`.square[data-row="${segment.endRow}"][data-col="${segment.endCol}"]`);
            
            if (!startSquare || !endSquare) return;
            
            const startRect = startSquare.getBoundingClientRect();
            const endRect = endSquare.getBoundingClientRect();
            const boardRect = document.getElementById('laser-board').getBoundingClientRect();
            
            // 计算激光的位置和大小
            if (segment.direction === LASER_DIRECTION.UP || segment.direction === LASER_DIRECTION.DOWN) {
                // 垂直激光
                laser.classList.add('vertical');
                laser.style.top = `${Math.min(startRect.top, endRect.top) - boardRect.top}px`;
                laser.style.height = `${Math.abs(endRect.top - startRect.top)}px`;
                laser.style.left = `${startRect.left + startRect.width / 2 - boardRect.left}px`;
            } else {
                // 水平激光
                laser.classList.add('horizontal');
                laser.style.left = `${Math.min(startRect.left, endRect.left) - boardRect.left}px`;
                laser.style.width = `${Math.abs(endRect.left - startRect.left)}px`;
                laser.style.top = `${startRect.top + startRect.height / 2 - boardRect.top}px`;
            }
            
            document.getElementById('laser-board').appendChild(laser);
        });
    }
}