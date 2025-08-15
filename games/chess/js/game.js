class ChessGame {
    constructor() {
        this.board = new ChessBoard();
        this.currentPlayer = PIECE_COLOR.RED; // 红方先行
        this.gameOver = false;
        this.winner = null;
        this.moveHistory = [];
        this.ai = new ChessAI();
        
        this.turnInfoElement = document.getElementById('turn-info');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.winnerInfoElement = document.getElementById('winnerInfo');
        
        this.setupEventListeners();
        this.updateTurnInfo();
    }
    
    setupEventListeners() {
        const canvas = document.getElementById('chessBoard');
        
        // 点击棋盘
        canvas.addEventListener('click', (e) => {
            if (this.gameOver) return;
            
            // 如果当前是AI回合，不处理点击
            if (this.currentPlayer === PIECE_COLOR.BLACK) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.handlePlayerMove(x, y);
        });
        
        // 新游戏按钮
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.startNewGame();
        });
        
        // 悔棋按钮
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undoMove();
        });
        
        // 提示按钮
        document.getElementById('hintBtn').addEventListener('click', () => {
            this.showHint();
        });
        
        // 重新开始按钮
        document.getElementById('restartButton').addEventListener('click', () => {
            this.startNewGame();
            this.gameOverScreen.classList.add('hidden');
        });
    }
    
    startNewGame() {
        this.board = new ChessBoard();
        this.currentPlayer = PIECE_COLOR.RED;
        this.gameOver = false;
        this.winner = null;
        this.moveHistory = [];
        this.updateTurnInfo();
        this.board.draw();
    }
    
    handlePlayerMove(x, y) {
        // 只有当前玩家的棋子才能移动
        const result = this.board.handleClick(x, y);
        
        if (!result) return;
        
        if (result.type === 'select') {
            // 选中棋子，检查是否是当前玩家的棋子
            if (result.piece.color !== this.currentPlayer) {
                // 不是当前玩家的棋子，取消选择
                result.piece.selected = false;
                this.board.selectedPiece = null;
                this.board.validMoves = [];
            }
        } else if (result.type === 'move') {
            // 移动棋子
            this.moveHistory.push({
                piece: result.piece,
                from: { x: result.from.x, y: result.from.y },
                to: { x: result.to.x, y: result.to.y },
                captured: result.captured
            });
            
            // 检查游戏是否结束
            if (result.captured && result.captured.type === PIECE_TYPE.KING) {
                this.endGame(this.currentPlayer);
                this.board.draw();
                return;
            }
            
            // 切换玩家
            this.switchPlayer();
            
            // AI回合
            if (this.currentPlayer === PIECE_COLOR.BLACK && !this.gameOver) {
                setTimeout(() => this.makeAIMove(), 500);
            }
        }
        
        this.board.draw();
    }
    
    makeAIMove() {
        const move = this.ai.findBestMove(this.board, PIECE_COLOR.BLACK);
        
        if (move) {
            const piece = this.board.getPieceAt(move.from.x, move.from.y);
            if (piece) {
                // 选中棋子
                if (this.board.selectedPiece) {
                    this.board.selectedPiece.selected = false;
                }
                
                // 记录原始位置和目标位置，用于高亮显示
                const fromX = move.from.x;
                const fromY = move.from.y;
                const toX = move.to.x;
                const toY = move.to.y;
                
                piece.selected = true;
                this.board.selectedPiece = piece;
                this.board.validMoves = piece.getValidMoves(this.board);
                
                // 移动棋子
                const result = this.board.movePiece(piece, toX, toY);
                
                this.moveHistory.push({
                    piece: result.piece,
                    from: { x: fromX, y: fromY },
                    to: { x: toX, y: toY },
                    captured: result.captured
                });
                
                // 检查游戏是否结束
                if (result.captured && result.captured.type === PIECE_TYPE.KING) {
                    this.endGame(this.currentPlayer);
                    this.board.draw();
                    return;
                }
                
                // 高亮显示电脑的移动
                this.highlightAIMove(fromX, fromY, toX, toY);
            }
        } else {
            // 如果AI找不到移动，直接切换回玩家
            this.switchPlayer();
            this.board.draw();
        }
    }
    
    // 高亮显示电脑的移动
    highlightAIMove(fromX, fromY, toX, toY) {
        // 设置高亮状态
        this.board.aiMoveHighlight = {
            from: { x: fromX, y: fromY },
            to: { x: toX, y: toY },
            active: true
        };
        
        // 绘制高亮
        this.board.draw();
        
        // 3秒后取消高亮并切换玩家
        setTimeout(() => {
            this.board.aiMoveHighlight.active = false;
            this.switchPlayer();
            this.board.draw();
        }, 3000);
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === PIECE_COLOR.RED ? PIECE_COLOR.BLACK : PIECE_COLOR.RED;
        this.updateTurnInfo();
        
        // 检查将军和将死
        if (this.board.isKingInCheck(this.currentPlayer)) {
            if (this.board.isCheckmate(this.currentPlayer)) {
                // 将死，游戏结束
                this.endGame(this.currentPlayer === PIECE_COLOR.RED ? PIECE_COLOR.BLACK : PIECE_COLOR.RED);
            } else {
                // 将军
                this.turnInfoElement.textContent = `当前回合: ${this.currentPlayer === PIECE_COLOR.RED ? '红方' : '黑方'} (将军!)`;
            }
        }
    }
    
    updateTurnInfo() {
        this.turnInfoElement.textContent = `当前回合: ${this.currentPlayer === PIECE_COLOR.RED ? '红方' : '黑方'}`;
    }
    
    endGame(winner) {
        this.gameOver = true;
        this.winner = winner;
        this.winnerInfoElement.textContent = `${winner === PIECE_COLOR.RED ? '红方' : '黑方'}胜利!`;
        this.gameOverScreen.classList.remove('hidden');
    }
    
    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        // 如果是AI回合，需要撤销两步（玩家和AI的各一步）
        const steps = this.currentPlayer === PIECE_COLOR.BLACK ? 1 : 2;
        
        for (let i = 0; i < steps && this.moveHistory.length > 0; i++) {
            const lastMove = this.moveHistory.pop();
            
            // 恢复棋子位置
            const piece = this.board.getPieceAt(lastMove.to.x, lastMove.to.y);
            if (piece) {
                piece.x = lastMove.from.x;
                piece.y = lastMove.from.y;
            }
            
            // 恢复被吃的棋子
            if (lastMove.captured) {
                this.board.pieces.push(lastMove.captured);
            }
        }
        
        // 恢复到玩家回合
        this.currentPlayer = PIECE_COLOR.RED;
        this.updateTurnInfo();
        this.gameOver = false;
        this.board.draw();
    }
    
    showHint() {
        // 使用AI找出最佳移动作为提示
        const move = this.ai.findBestMove(this.board, this.currentPlayer);
        
        if (move) {
            const piece = this.board.getPieceAt(move.from.x, move.from.y);
            if (piece) {
                // 高亮显示提示的棋子和目标位置
                if (this.board.selectedPiece) {
                    this.board.selectedPiece.selected = false;
                }
                
                piece.selected = true;
                this.board.selectedPiece = piece;
                this.board.validMoves = [{ x: move.to.x, y: move.to.y }];
                this.board.draw();
            }
        }
    }
}