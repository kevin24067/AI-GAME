// 激光策略棋棋盘类

class Board {
    constructor() {
        this.grid = [];
        this.initializeBoard();
    }

    // 初始化棋盘
    initializeBoard() {
        this.grid = [];
        
        // 创建10x8的棋盘格子
        for (let row = 0; row < BOARD_SIZE.ROWS; row++) {
            this.grid[row] = [];
            for (let col = 0; col < BOARD_SIZE.COLS; col++) {
                this.grid[row][col] = null;
            }
        }

        // 放置红方激光发射器（左上角）
        this.setPiece(0, 0, new Piece(0, 0, PLAYER.RED, PIECE_TYPE.LAUNCHER));
        
        // 放置蓝方激光发射器（右下角）
        this.setPiece(7, 9, new Piece(7, 9, PLAYER.BLUE, PIECE_TYPE.LAUNCHER));
        
        // 放置红方法老（左侧中部）
        this.setPiece(3, 1, new Piece(3, 1, PLAYER.RED, PIECE_TYPE.PHARAOH));
        
        // 放置蓝方法老（右侧中部）
        this.setPiece(4, 8, new Piece(4, 8, PLAYER.BLUE, PIECE_TYPE.PHARAOH));
        
        // 放置红方棋子（围绕法老的防御阵型）
        this.setPiece(2, 1, new Piece(2, 1, PLAYER.RED, PIECE_TYPE.SINGLE_MIRROR));
        this.setPiece(3, 2, new Piece(3, 2, PLAYER.RED, PIECE_TYPE.DOUBLE_MIRROR));
        this.setPiece(4, 1, new Piece(4, 1, PLAYER.RED, PIECE_TYPE.ABSORBER));
        this.setPiece(2, 2, new Piece(2, 2, PLAYER.RED, PIECE_TYPE.PRISM));
        
        // 放置红方额外的棋子（可机动部署）
        this.setPiece(1, 3, new Piece(1, 3, PLAYER.RED, PIECE_TYPE.SINGLE_MIRROR));
        this.setPiece(2, 4, new Piece(2, 4, PLAYER.RED, PIECE_TYPE.DOUBLE_MIRROR));
        this.setPiece(3, 3, new Piece(3, 3, PLAYER.RED, PIECE_TYPE.ABSORBER));
        
        // 放置蓝方棋子（围绕法老的防御阵型）
        this.setPiece(3, 8, new Piece(3, 8, PLAYER.BLUE, PIECE_TYPE.SINGLE_MIRROR));
        this.setPiece(4, 7, new Piece(4, 7, PLAYER.BLUE, PIECE_TYPE.DOUBLE_MIRROR));
        this.setPiece(5, 8, new Piece(5, 8, PLAYER.BLUE, PIECE_TYPE.ABSORBER));
        this.setPiece(5, 7, new Piece(5, 7, PLAYER.BLUE, PIECE_TYPE.PRISM));
        
        // 放置蓝方额外的棋子（可机动部署）
        this.setPiece(6, 6, new Piece(6, 6, PLAYER.BLUE, PIECE_TYPE.SINGLE_MIRROR));
        this.setPiece(5, 5, new Piece(5, 5, PLAYER.BLUE, PIECE_TYPE.DOUBLE_MIRROR));
        this.setPiece(4, 6, new Piece(4, 6, PLAYER.BLUE, PIECE_TYPE.ABSORBER));
    }

    // 渲染棋盘
    render(selectedPiece = null, validMoves = [], rotateMode = false) {
        const boardElement = document.getElementById('laser-board');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < BOARD_SIZE.ROWS; row++) {
            for (let col = 0; col < BOARD_SIZE.COLS; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.dataset.row = row;
                square.dataset.col = col;
                
                // 如果是选中棋子的位置，添加选中样式
                if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
                    square.classList.add('selected');
                }
                
                // 如果是有效移动位置，添加提示样式
                const isValidMove = validMoves.some(move => move.row === row && move.col === col);
                if (isValidMove) {
                    square.classList.add('valid-move');
                    
                    // 添加移动提示标记
                    const moveIndicator = document.createElement('div');
                    moveIndicator.className = 'move-indicator';
                    square.appendChild(moveIndicator);
                }
                
                // 如果格子上有棋子，则渲染棋子
                const piece = this.grid[row][col];
                if (piece) {
                    // 使用新的createDOMElement方法创建棋子元素
                    const pieceElement = piece.createDOMElement();
                    
                    // 应用旋转样式
                    if (piece.type === PIECE_TYPE.SINGLE_MIRROR || piece.type === PIECE_TYPE.DOUBLE_MIRROR) {
                        // 如果处于旋转模式且是当前玩家的镜子，添加旋转提示
                        if (rotateMode && piece.player === selectedPiece?.player) {
                            pieceElement.classList.add('can-rotate');
                        }
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
        
        if (!piece || !this.isValidPosition(toRow, toCol)) return false;
        
        // 移动棋子
        this.setPiece(toRow, toCol, piece);
        this.setPiece(fromRow, fromCol, null);
        
        return true;
    }

    // 检查位置是否在棋盘范围内
    isValidPosition(row, col) {
        return row >= 0 && row < BOARD_SIZE.ROWS && col >= 0 && col < BOARD_SIZE.COLS;
    }

    // 获取玩家所有可移动的棋子
    getMovablePieces(player) {
        const pieces = [];
        
        for (let row = 0; row < BOARD_SIZE.ROWS; row++) {
            for (let col = 0; col < BOARD_SIZE.COLS; col++) {
                const piece = this.getPiece(row, col);
                
                if (piece && piece.player === player && piece.canMove()) {
                    pieces.push(piece);
                }
            }
        }
        
        return pieces;
    }

    // 获取棋子的所有可能移动位置
    getValidMoves(piece) {
        if (!piece || !piece.canMove()) return [];
        
        const moves = [];
        const directions = [
            DIRECTION.UP,
            DIRECTION.RIGHT,
            DIRECTION.DOWN,
            DIRECTION.LEFT
        ];
        
        // 检查四个方向的移动
        for (const dir of directions) {
            const newRow = piece.row + dir.row;
            const newCol = piece.col + dir.col;
            
            if (this.isValidPosition(newRow, newCol) && !this.getPiece(newRow, newCol)) {
                moves.push({ row: newRow, col: newCol });
            }
        }
        
        return moves;
    }

    // 获取玩家的法老棋子
    getPharaoh(player) {
        for (let row = 0; row < BOARD_SIZE.ROWS; row++) {
            for (let col = 0; col < BOARD_SIZE.COLS; col++) {
                const piece = this.getPiece(row, col);
                
                if (piece && piece.player === player && piece.type === PIECE_TYPE.PHARAOH) {
                    return piece;
                }
            }
        }
        
        return null;
    }

    // 获取玩家的激光发射器
    getLauncher(player) {
        for (let row = 0; row < BOARD_SIZE.ROWS; row++) {
            for (let col = 0; col < BOARD_SIZE.COLS; col++) {
                const piece = this.getPiece(row, col);
                
                if (piece && piece.player === player && piece.type === PIECE_TYPE.LAUNCHER) {
                    return piece;
                }
            }
        }
        
        return null;
    }

    // 克隆棋盘
    clone() {
        const newBoard = new Board();
        newBoard.grid = [];
        
        for (let row = 0; row < BOARD_SIZE.ROWS; row++) {
            newBoard.grid[row] = [];
            for (let col = 0; col < BOARD_SIZE.COLS; col++) {
                const piece = this.grid[row][col];
                newBoard.grid[row][col] = piece ? piece.clone() : null;
            }
        }
        
        return newBoard;
    }
}