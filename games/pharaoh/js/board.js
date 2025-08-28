// 法老之光游戏棋盘类定义

class Board {
    constructor() {
        this.width = GAME_CONFIG.BOARD_WIDTH;
        this.height = GAME_CONFIG.BOARD_HEIGHT;
        this.cellSize = GAME_CONFIG.CELL_SIZE;
        this.pieces = [];
        this.selectedPiece = null;
        this.highlightedCells = [];
        
        this.initializeBoard();
    }

    // 初始化棋盘
    initializeBoard() {
        this.pieces = [];
        
        // 创建红色玩家棋子
        INITIAL_BOARD.red.forEach(pieceData => {
            const piece = new Piece(
                pieceData.type,
                PLAYERS.RED,
                pieceData.x,
                pieceData.y,
                pieceData.direction
            );
            this.pieces.push(piece);
        });
        
        // 创建蓝色玩家棋子
        INITIAL_BOARD.blue.forEach(pieceData => {
            const piece = new Piece(
                pieceData.type,
                PLAYERS.BLUE,
                pieceData.x,
                pieceData.y,
                pieceData.direction
            );
            this.pieces.push(piece);
        });
    }

    // 获取指定位置的棋子
    getPieceAt(x, y) {
        return this.pieces.find(piece => piece.x === x && piece.y === y);
    }

    // 获取指定玩家的所有棋子
    getPlayerPieces(player) {
        return this.pieces.filter(piece => piece.player === player);
    }

    // 获取指定玩家的法老
    getPlayerPharaoh(player) {
        return this.pieces.find(piece => 
            piece.player === player && piece.type === PIECE_TYPES.PHARAOH
        );
    }

    // 检查位置是否在棋盘范围内
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    // 检查位置是否为空
    isEmpty(x, y) {
        return !this.getPieceAt(x, y);
    }

    // 选择棋子
    selectPiece(piece) {
        // 清除之前的选择
        this.clearSelection();
        
        if (piece) {
            this.selectedPiece = piece;
            piece.selected = true;
            this.updateHighlights();
        }
    }

    // 清除选择
    clearSelection() {
        if (this.selectedPiece) {
            this.selectedPiece.selected = false;
            this.selectedPiece = null;
        }
        this.clearHighlights();
    }

    // 更新高亮显示
    updateHighlights() {
        this.clearHighlights();
        
        if (!this.selectedPiece) return;
        
        // 获取可移动的位置
        const validMoves = this.getValidMoves(this.selectedPiece);
        validMoves.forEach(pos => {
            const piece = this.getPieceAt(pos.x, pos.y);
            if (piece) {
                piece.highlighted = true;
            }
        });
        
        this.highlightedCells = validMoves;
    }

    // 清除高亮
    clearHighlights() {
        this.pieces.forEach(piece => {
            piece.highlighted = false;
        });
        this.highlightedCells = [];
    }

    // 获取棋子的有效移动位置
    getValidMoves(piece) {
        if (!piece || !piece.canMove()) return [];
        
        const validMoves = [];
        const directions = [
            { x: 0, y: -1 }, // 上
            { x: 0, y: 1 },  // 下
            { x: -1, y: 0 }, // 左
            { x: 1, y: 0 }   // 右
        ];
        
        directions.forEach(dir => {
            const newX = piece.x + dir.x;
            const newY = piece.y + dir.y;
            
            if (this.isValidPosition(newX, newY)) {
                const targetPiece = this.getPieceAt(newX, newY);
                
                // 可以移动到空位置
                if (!targetPiece) {
                    validMoves.push({ x: newX, y: newY, type: 'move' });
                }
                // 可以与其他棋子交换（除了法老）
                else if (targetPiece.type !== PIECE_TYPES.PHARAOH) {
                    validMoves.push({ x: newX, y: newY, type: 'swap', piece: targetPiece });
                }
            }
        });
        
        return validMoves;
    }

    // 移动棋子
    movePiece(piece, newX, newY) {
        if (!piece || !this.isValidPosition(newX, newY)) return false;
        
        const targetPiece = this.getPieceAt(newX, newY);
        
        if (!targetPiece) {
            // 移动到空位置
            piece.moveTo(newX, newY);
            return true;
        } else if (targetPiece.type !== PIECE_TYPES.PHARAOH) {
            // 交换位置
            const tempX = piece.x;
            const tempY = piece.y;
            
            piece.moveTo(newX, newY);
            targetPiece.moveTo(tempX, tempY);
            return true;
        }
        
        return false;
    }

    // 旋转棋子
    rotatePiece(piece, clockwise = true) {
        if (!piece || !piece.canRotate()) return false;
        
        return piece.rotate(clockwise);
    }

    // 移除棋子
    removePiece(piece) {
        const index = this.pieces.indexOf(piece);
        if (index > -1) {
            this.pieces.splice(index, 1);
            return true;
        }
        return false;
    }

    // 处理鼠标点击
    handleClick(x, y, currentPlayer, operationMode) {
        const clickedPiece = this.pieces.find(piece => 
            piece.isPointInside(x, y, this.cellSize)
        );
        
        if (operationMode === OPERATION_MODES.MOVE) {
            return this.handleMoveClick(clickedPiece, x, y, currentPlayer);
        } else if (operationMode === OPERATION_MODES.ROTATE) {
            return this.handleRotateClick(clickedPiece, currentPlayer);
        }
        
        return null;
    }

    // 处理移动模式点击
    handleMoveClick(clickedPiece, x, y, currentPlayer) {
        if (this.selectedPiece) {
            // 已选择棋子，尝试移动
            const cellX = Math.floor(x / this.cellSize);
            const cellY = Math.floor(y / this.cellSize);
            
            const validMoves = this.getValidMoves(this.selectedPiece);
            const validMove = validMoves.find(move => move.x === cellX && move.y === cellY);
            
            if (validMove) {
                const success = this.movePiece(this.selectedPiece, cellX, cellY);
                if (success) {
                    this.clearSelection();
                    return { type: 'move', success: true };
                }
            } else {
                // 点击其他位置，重新选择
                if (clickedPiece && clickedPiece.player === currentPlayer && clickedPiece.canMove()) {
                    this.selectPiece(clickedPiece);
                    return { type: 'select', piece: clickedPiece };
                } else {
                    this.clearSelection();
                }
            }
        } else {
            // 未选择棋子，选择棋子
            if (clickedPiece && clickedPiece.player === currentPlayer && clickedPiece.canMove()) {
                this.selectPiece(clickedPiece);
                return { type: 'select', piece: clickedPiece };
            }
        }
        
        return null;
    }

    // 处理旋转模式点击
    handleRotateClick(clickedPiece, currentPlayer) {
        if (clickedPiece && clickedPiece.player === currentPlayer && clickedPiece.canRotate()) {
            const success = this.rotatePiece(clickedPiece, true);
            if (success) {
                return { type: 'rotate', piece: clickedPiece, success: true };
            }
        }
        
        return null;
    }

    // 绘制棋盘
    draw(ctx) {
        // 清除画布
        ctx.clearRect(0, 0, this.width * this.cellSize, this.height * this.cellSize);
        
        // 绘制网格
        this.drawGrid(ctx);
        
        // 绘制激光发射器
        this.drawLaserSources(ctx);
        
        // 绘制高亮格子
        this.drawHighlights(ctx);
        
        // 绘制棋子
        this.pieces.forEach(piece => {
            piece.draw(ctx, this.cellSize);
        });
        
        // 绘制坐标标签
        this.drawCoordinates(ctx);
    }

    // 绘制网格
    drawGrid(ctx) {
        ctx.strokeStyle = COLORS.BRONZE;
        ctx.lineWidth = 1;
        
        // 绘制垂直线
        for (let x = 0; x <= this.width; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.cellSize, 0);
            ctx.lineTo(x * this.cellSize, this.height * this.cellSize);
            ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= this.height; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.cellSize);
            ctx.lineTo(this.width * this.cellSize, y * this.cellSize);
            ctx.stroke();
        }
    }

    // 绘制激光发射器
    drawLaserSources(ctx) {
        GAME_CONFIG.LASER_SOURCES.forEach((source, index) => {
            const x = source.x * this.cellSize + this.cellSize / 2;
            const y = source.y * this.cellSize + this.cellSize / 2;
            
            // 根据玩家设置不同颜色
            const playerColor = index === 0 ? COLORS.RED_PLAYER : COLORS.BLUE_PLAYER;
            
            // 绘制发射器背景
            ctx.fillStyle = playerColor;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(source.x * this.cellSize, source.y * this.cellSize, this.cellSize, this.cellSize);
            ctx.globalAlpha = 1;
            
            // 绘制发射器边框
            ctx.strokeStyle = playerColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(source.x * this.cellSize, source.y * this.cellSize, this.cellSize, this.cellSize);
            
            // 绘制激光发射器符号
            ctx.fillStyle = COLORS.LASER_CYAN;
            ctx.font = `${this.cellSize * 0.4}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚡', x, y);
            
            // 绘制方向箭头
            const arrowSize = this.cellSize * 0.15;
            ctx.fillStyle = playerColor;
            ctx.font = `${arrowSize}px Arial`;
            
            if (source.direction === 'right') {
                ctx.fillText('→', x + this.cellSize * 0.25, y);
            } else {
                ctx.fillText('←', x - this.cellSize * 0.25, y);
            }
        });
    }

    // 绘制高亮格子
    drawHighlights(ctx) {
        this.highlightedCells.forEach(cell => {
            ctx.fillStyle = COLORS.HIGHLIGHT;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(cell.x * this.cellSize, cell.y * this.cellSize, this.cellSize, this.cellSize);
            ctx.globalAlpha = 1;
        });
    }

    // 绘制坐标标签
    drawCoordinates(ctx) {
        ctx.fillStyle = COLORS.GOLD;
        ctx.font = `${this.cellSize * 0.2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 绘制列标签 (A-J)
        for (let x = 0; x < this.width; x++) {
            const label = String.fromCharCode(65 + x); // A, B, C...
            ctx.fillText(label, x * this.cellSize + this.cellSize / 2, -10);
            ctx.fillText(label, x * this.cellSize + this.cellSize / 2, this.height * this.cellSize + 20);
        }
        
        // 绘制行标签 (1-8)
        for (let y = 0; y < this.height; y++) {
            const label = (this.height - y).toString(); // 8, 7, 6...
            ctx.fillText(label, -15, y * this.cellSize + this.cellSize / 2);
            ctx.fillText(label, this.width * this.cellSize + 15, y * this.cellSize + this.cellSize / 2);
        }
    }

    // 获取棋盘状态的字符串表示（用于调试）
    toString() {
        let result = '  ';
        for (let x = 0; x < this.width; x++) {
            result += String.fromCharCode(65 + x) + ' ';
        }
        result += '\n';
        
        for (let y = 0; y < this.height; y++) {
            result += (this.height - y) + ' ';
            for (let x = 0; x < this.width; x++) {
                const piece = this.getPieceAt(x, y);
                if (piece) {
                    const symbol = piece.player === PLAYERS.RED ? 'R' : 'B';
                    const type = piece.type.charAt(0).toUpperCase();
                    result += symbol + type;
                } else {
                    result += '. ';
                }
            }
            result += '\n';
        }
        
        return result;
    }
}

// 导出棋盘类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Board;
}