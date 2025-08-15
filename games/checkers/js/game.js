// 跳棋游戏逻辑类

class CheckersGame {
    constructor() {
        this.board = new Board();
        this.currentPlayer = PLAYER.RED;
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.moveHistory = [];
        this.mustJump = false;
        this.multiJump = false;
        this.jumpingPiece = null;
    }

    // 初始化游戏
    init() {
        this.board.initializeBoard();
        this.currentPlayer = PLAYER.RED;
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.moveHistory = [];
        this.mustJump = false;
        this.multiJump = false;
        this.jumpingPiece = null;
        
        this.updateGameStatus();
        this.board.render();
        this.setupEventListeners();
    }

    // 设置事件监听器
    setupEventListeners() {
        const boardElement = document.getElementById('checkers-board');
        
        // 清除现有的事件监听器
        boardElement.removeEventListener('click', this.handleBoardClick);
        
        // 添加新的事件监听器
        boardElement.addEventListener('click', this.handleBoardClick.bind(this));
        
        // 设置按钮事件
        document.getElementById('new-game-btn').addEventListener('click', () => this.init());
        document.getElementById('undo-btn').addEventListener('click', () => this.undoMove());
    }

    // 处理棋盘点击事件
    handleBoardClick(event) {
        if (this.gameOver) return;
        
        let target = event.target;
        
        // 如果点击的是棋子，则获取其父元素（格子）
        if (target.classList.contains('piece')) {
            target = target.parentElement;
        }
        
        if (!target.classList.contains('square')) return;
        
        const row = parseInt(target.dataset.row);
        const col = parseInt(target.dataset.col);
        
        // 如果已经选择了棋子，尝试移动
        if (this.selectedPiece) {
            const moveResult = this.tryMove(row, col);
            
            // 如果移动成功且不是多重跳跃，切换玩家
            if (moveResult && !this.multiJump) {
                this.switchPlayer();
            }
        } 
        // 否则，尝试选择棋子
        else {
            this.selectPiece(row, col);
        }
    }

    // 选择棋子
    selectPiece(row, col) {
        // 如果是多重跳跃模式，只能选择正在跳跃的棋子
        if (this.multiJump) {
            if (this.jumpingPiece && this.jumpingPiece.row === row && this.jumpingPiece.col === col) {
                this.selectedPiece = this.jumpingPiece;
                this.validMoves = this.board.getValidMoves(this.selectedPiece).filter(move => move.isJump);
                this.highlightValidMoves();
            }
            return;
        }
        
        const piece = this.board.getPiece(row, col);
        
        // 只能选择当前玩家的棋子
        if (!piece || piece.player !== this.currentPlayer) return;
        
        // 如果必须跳跃，只能选择可以跳跃的棋子
        if (this.mustJump) {
            const jumps = this.board.getAllJumpsForPlayer(this.currentPlayer);
            const canJump = jumps.some(jump => jump.piece.row === row && jump.piece.col === col);
            
            if (!canJump) return;
        }
        
        this.selectedPiece = piece;
        this.validMoves = this.board.getValidMoves(piece);
        
        // 如果必须跳跃，只显示跳跃移动
        if (this.mustJump) {
            this.validMoves = this.validMoves.filter(move => move.isJump);
        }
        
        this.highlightValidMoves();
    }

    // 尝试移动棋子
    tryMove(row, col) {
        // 检查是否是有效移动
        const moveIndex = this.validMoves.findIndex(move => move.row === row && move.col === col);
        
        if (moveIndex === -1) {
            // 如果点击的不是有效移动，取消选择
            this.clearSelection();
            return false;
        }
        
        const move = this.validMoves[moveIndex];
        const fromRow = this.selectedPiece.row;
        const fromCol = this.selectedPiece.col;
        
        // 记录移动历史
        this.moveHistory.push({
            fromRow: fromRow,
            fromCol: fromCol,
            toRow: row,
            toCol: col,
            piece: { ...this.selectedPiece },
            isJump: move.isJump,
            capturedPiece: move.isJump ? { ...this.board.getPiece(fromRow + Math.sign(row - fromRow), fromCol + Math.sign(col - fromCol)) } : null
        });
        
        // 执行移动
        if (move.isJump) {
            this.board.jumpPiece(fromRow, fromCol, row, col);
            
            // 检查是否可以继续跳跃
            const piece = this.board.getPiece(row, col);
            const furtherJumps = this.board.getValidMoves(piece).filter(m => m.isJump);
            
            if (furtherJumps.length > 0) {
                // 可以继续跳跃
                this.multiJump = true;
                this.jumpingPiece = piece;
                this.clearSelection();
                return true;
            } else {
                // 跳跃结束
                this.multiJump = false;
                this.jumpingPiece = null;
            }
        } else {
            this.board.movePiece(fromRow, fromCol, row, col);
        }
        
        this.clearSelection();
        this.board.render();
        this.checkGameOver();
        
        return true;
    }

    // 切换当前玩家
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === PLAYER.RED ? PLAYER.BLACK : PLAYER.RED;
        
        // 检查是否有必须执行的跳跃
        const jumps = this.board.getAllJumpsForPlayer(this.currentPlayer);
        this.mustJump = jumps.length > 0;
        
        this.updateGameStatus();
        this.checkGameOver();
    }

    // 清除选择状态
    clearSelection() {
        this.selectedPiece = null;
        this.validMoves = [];
        this.board.render();
    }

    // 高亮显示有效移动
    highlightValidMoves() {
        // 首先渲染棋盘
        this.board.render();
        
        // 高亮选中的棋子
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            
            // 高亮选中的棋子
            if (this.selectedPiece && row === this.selectedPiece.row && col === this.selectedPiece.col) {
                square.classList.add('selected');
            }
            
            // 高亮有效移动
            const isValidMove = this.validMoves.some(move => move.row === row && move.col === col);
            if (isValidMove) {
                square.classList.add('valid-move');
            }
        });
    }

    // 悔棋
    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        // 获取最后一步移动
        const lastMove = this.moveHistory.pop();
        
        // 恢复棋子位置
        this.board.setPiece(lastMove.toRow, lastMove.toCol, null);
        this.board.setPiece(lastMove.fromRow, lastMove.fromCol, new Piece(lastMove.fromRow, lastMove.fromCol, lastMove.piece.player));
        this.board.getPiece(lastMove.fromRow, lastMove.fromCol).type = lastMove.piece.type;
        
        // 如果是跳跃，恢复被吃的棋子
        if (lastMove.isJump && lastMove.capturedPiece) {
            const jumpedRow = lastMove.fromRow + Math.sign(lastMove.toRow - lastMove.fromRow);
            const jumpedCol = lastMove.fromCol + Math.sign(lastMove.toCol - lastMove.fromCol);
            
            const capturedPiece = new Piece(jumpedRow, jumpedCol, lastMove.capturedPiece.player);
            capturedPiece.type = lastMove.capturedPiece.type;
            this.board.setPiece(jumpedRow, jumpedCol, capturedPiece);
        }
        
        // 切换回上一个玩家
        this.currentPlayer = this.currentPlayer === PLAYER.RED ? PLAYER.BLACK : PLAYER.RED;
        
        // 重置多重跳跃状态
        this.multiJump = false;
        this.jumpingPiece = null;
        
        // 检查是否有必须执行的跳跃
        const jumps = this.board.getAllJumpsForPlayer(this.currentPlayer);
        this.mustJump = jumps.length > 0;
        
        this.board.render();
        this.updateGameStatus();
        this.gameOver = false;
    }

    // 检查游戏是否结束
    checkGameOver() {
        // 检查是否有玩家没有棋子了
        const redCount = this.board.getPieceCount(PLAYER.RED);
        const blackCount = this.board.getPieceCount(PLAYER.BLACK);
        
        if (redCount === 0) {
            this.gameOver = true;
            document.getElementById('game-status').textContent = '黑方获胜！';
            return;
        }
        
        if (blackCount === 0) {
            this.gameOver = true;
            document.getElementById('game-status').textContent = '红方获胜！';
            return;
        }
        
        // 检查当前玩家是否无法移动
        const moves = this.board.getAllMovesForPlayer(this.currentPlayer);
        
        if (moves.length === 0) {
            this.gameOver = true;
            const winner = this.currentPlayer === PLAYER.RED ? '黑方' : '红方';
            document.getElementById('game-status').textContent = `${winner}获胜！`;
        }
    }

    // 更新游戏状态显示
    updateGameStatus() {
        const playerTurnElement = document.getElementById('current-player');
        playerTurnElement.textContent = this.currentPlayer === PLAYER.RED ? '红方' : '黑方';
        playerTurnElement.className = this.currentPlayer === PLAYER.RED ? '' : 'black';
        
        const gameStatusElement = document.getElementById('game-status');
        
        if (!this.gameOver) {
            if (this.mustJump) {
                gameStatusElement.textContent = '有可以跳吃的棋子！';
            } else if (this.multiJump) {
                gameStatusElement.textContent = '可以继续跳吃！';
            } else {
                gameStatusElement.textContent = '';
            }
        }
    }
}