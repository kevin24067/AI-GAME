class ChessPiece {
    constructor(type, color, x, y) {
        this.type = type;
        this.color = color;
        this.x = x;
        this.y = y;
        this.selected = false;
    }
    
    draw(ctx) {
        const centerX = BOARD_MARGIN + this.x * CELL_SIZE;
        const centerY = BOARD_MARGIN + this.y * CELL_SIZE;
        const radius = CELL_SIZE * 0.4;
        
        // 绘制棋子背景
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f5e8c9';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.color === PIECE_COLOR.RED ? '#8B0000' : '#000000';
        ctx.stroke();
        
        // 如果被选中，绘制高亮效果
        if (this.selected) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + 3, 0, Math.PI * 2);
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // 绘制棋子文字
        ctx.font = `bold ${radius * 1.2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = PIECE_COLORS[this.color];
        ctx.fillText(PIECE_NAMES[this.color][this.type], centerX, centerY);
    }
    
    // 获取棋子可以移动的位置
    getValidMoves(board) {
        const moves = [];
        
        switch (this.type) {
            case PIECE_TYPE.KING:
                this.getKingMoves(board, moves);
                break;
            case PIECE_TYPE.ADVISOR:
                this.getAdvisorMoves(board, moves);
                break;
            case PIECE_TYPE.ELEPHANT:
                this.getElephantMoves(board, moves);
                break;
            case PIECE_TYPE.HORSE:
                this.getHorseMoves(board, moves);
                break;
            case PIECE_TYPE.CHARIOT:
                this.getChariotMoves(board, moves);
                break;
            case PIECE_TYPE.CANNON:
                this.getCannonMoves(board, moves);
                break;
            case PIECE_TYPE.PAWN:
                this.getPawnMoves(board, moves);
                break;
        }
        
        return moves;
    }
    
    // 将/帅的移动规则
    getKingMoves(board, moves) {
        // 定义九宫格的范围
        const minX = this.color === PIECE_COLOR.RED ? 3 : 3;
        const maxX = this.color === PIECE_COLOR.RED ? 5 : 5;
        const minY = this.color === PIECE_COLOR.RED ? 7 : 0;
        const maxY = this.color === PIECE_COLOR.RED ? 9 : 2;
        
        // 上下左右四个方向
        const directions = [
            { dx: 0, dy: -1 }, // 上
            { dx: 1, dy: 0 },  // 右
            { dx: 0, dy: 1 },  // 下
            { dx: -1, dy: 0 }  // 左
        ];
        
        for (const dir of directions) {
            const newX = this.x + dir.dx;
            const newY = this.y + dir.dy;
            
            // 检查是否在九宫格内
            if (newX >= minX && newX <= maxX && newY >= minY && newY <= maxY) {
                // 检查目标位置是否为空或有敌方棋子
                const targetPiece = board.getPieceAt(newX, newY);
                if (!targetPiece || targetPiece.color !== this.color) {
                    moves.push({ x: newX, y: newY });
                }
            }
        }
        
        // 检查将帅是否面对面（飞将）
        const oppositeKing = board.findKing(this.color === PIECE_COLOR.RED ? PIECE_COLOR.BLACK : PIECE_COLOR.RED);
        if (oppositeKing && this.x === oppositeKing.x) {
            // 检查两个将/帅之间是否有其他棋子
            let hasPieceBetween = false;
            const startY = Math.min(this.y, oppositeKing.y) + 1;
            const endY = Math.max(this.y, oppositeKing.y);
            
            for (let y = startY; y < endY; y++) {
                if (board.getPieceAt(this.x, y)) {
                    hasPieceBetween = true;
                    break;
                }
            }
            
            if (!hasPieceBetween) {
                moves.push({ x: oppositeKing.x, y: oppositeKing.y });
            }
        }
    }
    
    // 士/仕的移动规则
    getAdvisorMoves(board, moves) {
        // 定义九宫格的范围
        const minX = this.color === PIECE_COLOR.RED ? 3 : 3;
        const maxX = this.color === PIECE_COLOR.RED ? 5 : 5;
        const minY = this.color === PIECE_COLOR.RED ? 7 : 0;
        const maxY = this.color === PIECE_COLOR.RED ? 9 : 2;
        
        // 对角线四个方向
        const directions = [
            { dx: -1, dy: -1 }, // 左上
            { dx: 1, dy: -1 },  // 右上
            { dx: -1, dy: 1 },  // 左下
            { dx: 1, dy: 1 }    // 右下
        ];
        
        for (const dir of directions) {
            const newX = this.x + dir.dx;
            const newY = this.y + dir.dy;
            
            // 检查是否在九宫格内
            if (newX >= minX && newX <= maxX && newY >= minY && newY <= maxY) {
                // 检查目标位置是否为空或有敌方棋子
                const targetPiece = board.getPieceAt(newX, newY);
                if (!targetPiece || targetPiece.color !== this.color) {
                    moves.push({ x: newX, y: newY });
                }
            }
        }
    }
    
    // 象/相的移动规则
    getElephantMoves(board, moves) {
        // 象/相不能过河
        const maxY = this.color === PIECE_COLOR.RED ? 9 : 4;
        const minY = this.color === PIECE_COLOR.RED ? 5 : 0;
        
        // 象/相的四个方向
        const directions = [
            { dx: -2, dy: -2, checkX: -1, checkY: -1 }, // 左上
            { dx: 2, dy: -2, checkX: 1, checkY: -1 },  // 右上
            { dx: -2, dy: 2, checkX: -1, checkY: 1 },  // 左下
            { dx: 2, dy: 2, checkX: 1, checkY: 1 }     // 右下
        ];
        
        for (const dir of directions) {
            const newX = this.x + dir.dx;
            const newY = this.y + dir.dy;
            
            // 检查是否在棋盘范围内且不过河
            if (newX >= 0 && newX < BOARD_SIZE.WIDTH && newY >= minY && newY <= maxY) {
                // 检查象眼是否被塞住
                const eyeX = this.x + dir.checkX;
                const eyeY = this.y + dir.checkY;
                
                if (!board.getPieceAt(eyeX, eyeY)) {
                    // 检查目标位置是否为空或有敌方棋子
                    const targetPiece = board.getPieceAt(newX, newY);
                    if (!targetPiece || targetPiece.color !== this.color) {
                        moves.push({ x: newX, y: newY });
                    }
                }
            }
        }
    }
    
    // 马的移动规则
    getHorseMoves(board, moves) {
        // 马的八个方向
        const directions = [
            { dx: -1, dy: -2, checkX: 0, checkY: -1 }, // 左上远
            { dx: 1, dy: -2, checkX: 0, checkY: -1 },  // 右上远
            { dx: -2, dy: -1, checkX: -1, checkY: 0 }, // 左上近
            { dx: 2, dy: -1, checkX: 1, checkY: 0 },   // 右上近
            { dx: -2, dy: 1, checkX: -1, checkY: 0 },  // 左下近
            { dx: 2, dy: 1, checkX: 1, checkY: 0 },    // 右下近
            { dx: -1, dy: 2, checkX: 0, checkY: 1 },   // 左下远
            { dx: 1, dy: 2, checkX: 0, checkY: 1 }     // 右下远
        ];
        
        for (const dir of directions) {
            const newX = this.x + dir.dx;
            const newY = this.y + dir.dy;
            
            // 检查是否在棋盘范围内
            if (newX >= 0 && newX < BOARD_SIZE.WIDTH && newY >= 0 && newY < BOARD_SIZE.HEIGHT) {
                // 检查马腿是否被绊住
                const legX = this.x + dir.checkX;
                const legY = this.y + dir.checkY;
                
                if (!board.getPieceAt(legX, legY)) {
                    // 检查目标位置是否为空或有敌方棋子
                    const targetPiece = board.getPieceAt(newX, newY);
                    if (!targetPiece || targetPiece.color !== this.color) {
                        moves.push({ x: newX, y: newY });
                    }
                }
            }
        }
    }
    
    // 车的移动规则
    getChariotMoves(board, moves) {
        // 四个方向：上、右、下、左
        const directions = [
            { dx: 0, dy: -1 }, // 上
            { dx: 1, dy: 0 },  // 右
            { dx: 0, dy: 1 },  // 下
            { dx: -1, dy: 0 }  // 左
        ];
        
        for (const dir of directions) {
            for (let step = 1; step < Math.max(BOARD_SIZE.WIDTH, BOARD_SIZE.HEIGHT); step++) {
                const newX = this.x + dir.dx * step;
                const newY = this.y + dir.dy * step;
                
                // 检查是否在棋盘范围内
                if (newX < 0 || newX >= BOARD_SIZE.WIDTH || newY < 0 || newY >= BOARD_SIZE.HEIGHT) {
                    break;
                }
                
                const targetPiece = board.getPieceAt(newX, newY);
                
                if (!targetPiece) {
                    // 空位置，可以移动
                    moves.push({ x: newX, y: newY });
                } else {
                    // 遇到棋子
                    if (targetPiece.color !== this.color) {
                        // 敌方棋子，可以吃
                        moves.push({ x: newX, y: newY });
                    }
                    // 无论是敌方还是己方棋子，都不能继续前进
                    break;
                }
            }
        }
    }
    
    // 炮的移动规则
    getCannonMoves(board, moves) {
        // 四个方向：上、右、下、左
        const directions = [
            { dx: 0, dy: -1 }, // 上
            { dx: 1, dy: 0 },  // 右
            { dx: 0, dy: 1 },  // 下
            { dx: -1, dy: 0 }  // 左
        ];
        
        for (const dir of directions) {
            let hasPlatform = false; // 是否已经越过一个棋子（炮架）
            
            for (let step = 1; step < Math.max(BOARD_SIZE.WIDTH, BOARD_SIZE.HEIGHT); step++) {
                const newX = this.x + dir.dx * step;
                const newY = this.y + dir.dy * step;
                
                // 检查是否在棋盘范围内
                if (newX < 0 || newX >= BOARD_SIZE.WIDTH || newY < 0 || newY >= BOARD_SIZE.HEIGHT) {
                    break;
                }
                
                const targetPiece = board.getPieceAt(newX, newY);
                
                if (!targetPiece) {
                    // 空位置
                    if (!hasPlatform) {
                        // 没有炮架，可以移动
                        moves.push({ x: newX, y: newY });
                    }
                } else {
                    // 遇到棋子
                    if (!hasPlatform) {
                        // 第一次遇到棋子，作为炮架
                        hasPlatform = true;
                    } else {
                        // 已经有炮架，这是第二个棋子
                        if (targetPiece.color !== this.color) {
                            // 敌方棋子，可以吃
                            moves.push({ x: newX, y: newY });
                        }
                        // 无论是敌方还是己方棋子，都不能继续前进
                        break;
                    }
                }
            }
        }
    }
    
    // 兵/卒的移动规则
    getPawnMoves(board, moves) {
        // 兵/卒的前进方向
        const forwardDir = this.color === PIECE_COLOR.RED ? -1 : 1;
        
        // 是否已过河
        const crossedRiver = this.color === PIECE_COLOR.RED ? this.y < 5 : this.y > 4;
        
        // 前进
        const newY = this.y + forwardDir;
        if (newY >= 0 && newY < BOARD_SIZE.HEIGHT) {
            const targetPiece = board.getPieceAt(this.x, newY);
            if (!targetPiece || targetPiece.color !== this.color) {
                moves.push({ x: this.x, y: newY });
            }
        }
        
        // 如果已过河，可以左右移动
        if (crossedRiver) {
            // 左移
            if (this.x > 0) {
                const targetPiece = board.getPieceAt(this.x - 1, this.y);
                if (!targetPiece || targetPiece.color !== this.color) {
                    moves.push({ x: this.x - 1, y: this.y });
                }
            }
            
            // 右移
            if (this.x < BOARD_SIZE.WIDTH - 1) {
                const targetPiece = board.getPieceAt(this.x + 1, this.y);
                if (!targetPiece || targetPiece.color !== this.color) {
                    moves.push({ x: this.x + 1, y: this.y });
                }
            }
        }
    }
}