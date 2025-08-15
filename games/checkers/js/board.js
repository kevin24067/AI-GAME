// 跳棋游戏棋盘类

class Board {
    constructor() {
        this.grid = [];
        this.initializeBoard();
    }

    // 初始化棋盘
    initializeBoard() {
        this.grid = [];
        
        // 创建8x8的棋盘格子
        for (let row = 0; row < BOARD_SIZE; row++) {
            this.grid[row] = [];
            for (let col = 0; col < BOARD_SIZE; col++) {
                // 只在黑色格子上放置棋子
                const isDarkSquare = (row + col) % 2 === 1;
                
                if (isDarkSquare) {
                    // 前三行放置黑棋
                    if (row < 3) {
                        this.grid[row][col] = new Piece(row, col, PLAYER.BLACK);
                    } 
                    // 后三行放置红棋
                    else if (row > 4) {
                        this.grid[row][col] = new Piece(row, col, PLAYER.RED);
                    } 
                    // 中间两行为空
                    else {
                        this.grid[row][col] = null;
                    }
                } else {
                    // 浅色格子上不放棋子
                    this.grid[row][col] = null;
                }
            }
        }
    }

    // 渲染棋盘
    render() {
        const boardElement = document.getElementById('checkers-board');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const square = document.createElement('div');
                const isLightSquare = (row + col) % 2 === 0;
                
                square.classList.add('square');
                square.classList.add(isLightSquare ? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;
                
                // 如果格子上有棋子，则渲染棋子
                const piece = this.grid[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('piece', piece.player);
                    
                    if (piece.type === PIECE_TYPE.KING) {
                        pieceElement.classList.add('king');
                    }
                    
                    square.appendChild(pieceElement);
                }
                
                boardElement.appendChild(square);
            }
        }
    }

    // 获取指定位置的棋子
    getPiece(row, col) {
        if (this.isValidPosition(row, col)) {
            return this.grid[row][col];
        }
        return null;
    }

    // 设置指定位置的棋子
    setPiece(row, col, piece) {
        if (this.isValidPosition(row, col)) {
            this.grid[row][col] = piece;
            if (piece) {
                piece.row = row;
                piece.col = col;
            }
        }
    }

    // 移动棋子
    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        
        if (!piece) return false;
        
        // 移动棋子
        this.setPiece(toRow, toCol, piece);
        this.setPiece(fromRow, fromCol, null);
        
        // 检查是否需要升级为王
        this.checkForKingPromotion(piece);
        
        return true;
    }

    // 执行跳跃吃子
    jumpPiece(fromRow, fromCol, toRow, toCol) {
        // 计算被跳过的棋子位置
        const jumpedRow = fromRow + Math.sign(toRow - fromRow);
        const jumpedCol = fromCol + Math.sign(toCol - fromCol);
        
        // 移动棋子
        const success = this.movePiece(fromRow, fromCol, toRow, toCol);
        
        if (success) {
            // 移除被跳过的棋子
            this.setPiece(jumpedRow, jumpedCol, null);
            return true;
        }
        
        return false;
    }

    // 检查是否需要升级为王
    checkForKingPromotion(piece) {
        if (!piece) return;
        
        // 红棋到达顶行升级为王
        if (piece.player === PLAYER.RED && piece.row === 0) {
            piece.type = PIECE_TYPE.KING;
        }
        // 黑棋到达底行升级为王
        else if (piece.player === PLAYER.BLACK && piece.row === BOARD_SIZE - 1) {
            piece.type = PIECE_TYPE.KING;
        }
    }

    // 获取棋子的所有可能移动
    getValidMoves(piece) {
        if (!piece) return [];
        
        const moves = [];
        const jumps = [];
        
        // 根据棋子类型确定可以移动的方向
        let directions = [];
        
        if (piece.type === PIECE_TYPE.KING) {
            // 王可以向所有方向移动
            directions = [
                DIRECTION.UP_LEFT, 
                DIRECTION.UP_RIGHT, 
                DIRECTION.DOWN_LEFT, 
                DIRECTION.DOWN_RIGHT
            ];
        } else if (piece.player === PLAYER.RED) {
            // 红棋只能向上移动
            directions = [DIRECTION.UP_LEFT, DIRECTION.UP_RIGHT];
        } else {
            // 黑棋只能向下移动
            directions = [DIRECTION.DOWN_LEFT, DIRECTION.DOWN_RIGHT];
        }
        
        // 检查每个方向的移动可能性
        for (const dir of directions) {
            const newRow = piece.row + dir.row;
            const newCol = piece.col + dir.col;
            
            // 检查是否可以移动到相邻位置
            if (this.isValidPosition(newRow, newCol) && !this.getPiece(newRow, newCol)) {
                moves.push({ row: newRow, col: newCol, isJump: false });
            }
            
            // 检查是否可以跳过对方棋子
            const jumpRow = piece.row + 2 * dir.row;
            const jumpCol = piece.col + 2 * dir.col;
            const jumpedPiece = this.getPiece(newRow, newCol);
            
            if (this.isValidPosition(jumpRow, jumpCol) && 
                !this.getPiece(jumpRow, jumpCol) && 
                jumpedPiece && 
                jumpedPiece.player !== piece.player) {
                jumps.push({ row: jumpRow, col: jumpCol, isJump: true });
            }
        }
        
        // 如果有跳跃移动，则必须执行跳跃
        return jumps.length > 0 ? jumps : moves;
    }

    // 获取玩家所有棋子的所有可能跳跃移动
    getAllJumpsForPlayer(player) {
        const jumps = [];
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const piece = this.getPiece(row, col);
                
                if (piece && piece.player === player) {
                    const pieceMoves = this.getValidMoves(piece);
                    const pieceJumps = pieceMoves.filter(move => move.isJump);
                    
                    if (pieceJumps.length > 0) {
                        jumps.push({
                            piece: piece,
                            jumps: pieceJumps
                        });
                    }
                }
            }
        }
        
        return jumps;
    }

    // 获取玩家所有棋子的所有可能移动
    getAllMovesForPlayer(player) {
        // 首先检查是否有跳跃移动
        const jumps = this.getAllJumpsForPlayer(player);
        if (jumps.length > 0) {
            return jumps;
        }
        
        // 如果没有跳跃移动，则返回所有普通移动
        const moves = [];
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const piece = this.getPiece(row, col);
                
                if (piece && piece.player === player) {
                    const pieceMoves = this.getValidMoves(piece);
                    
                    if (pieceMoves.length > 0) {
                        moves.push({
                            piece: piece,
                            jumps: pieceMoves
                        });
                    }
                }
            }
        }
        
        return moves;
    }

    // 检查位置是否在棋盘范围内
    isValidPosition(row, col) {
        return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
    }

    // 获取玩家的棋子数量
    getPieceCount(player) {
        let count = 0;
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.player === player) {
                    count++;
                }
            }
        }
        
        return count;
    }
}