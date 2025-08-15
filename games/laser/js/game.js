// 激光策略棋游戏逻辑类

class LaserGame {
    constructor() {
        this.board = new Board();
        this.laser = new Laser(this.board);
        this.currentPlayer = PLAYER.RED;
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
        this.rotateMode = false;
    }

    // 初始化游戏
    init() {
        this.board.initializeBoard();
        this.laser = new Laser(this.board);
        this.currentPlayer = PLAYER.RED;
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
        this.rotateMode = false;
        
        this.updateGameStatus();
        this.board.render();
        this.setupEventListeners();
    }

    // 设置事件监听器
    setupEventListeners() {
        const boardElement = document.getElementById('laser-board');
        
        // 清除现有的事件监听器
        boardElement.removeEventListener('click', this.handleBoardClick);
        
        // 添加新的事件监听器
        boardElement.addEventListener('click', this.handleBoardClick.bind(this));
        
        // 设置按钮事件
        document.getElementById('new-game-btn').addEventListener('click', () => this.init());
        document.getElementById('rotate-btn').addEventListener('click', () => this.toggleRotateMode());
    }

    // 处理棋盘点击事件
    handleBoardClick(event) {
        if (this.gameOver) return;
        
        let target = event.target;
        
        // 如果点击的是棋子或移动指示器，则获取其父元素（格子）
        if (target.classList.contains('piece') || target.classList.contains('move-indicator')) {
            target = target.parentElement;
        }
        
        if (!target.classList.contains('square')) return;
        
        const row = parseInt(target.dataset.row);
        const col = parseInt(target.dataset.col);
        
        // 如果处于旋转模式
        if (this.rotateMode) {
            this.handleRotation(row, col);
            return;
        }
        
        // 如果已经选择了棋子，尝试移动
        if (this.selectedPiece) {
            const moveResult = this.tryMove(row, col);
            
            // 如果移动成功，发射激光并切换玩家
            if (moveResult) {
                this.fireLaser();
            }
        } 
        // 否则，尝试选择棋子
        else {
            this.selectPiece(row, col);
        }
    }

    // 选择棋子
    selectPiece(row, col) {
        const piece = this.board.getPiece(row, col);
        
        // 只能选择当前玩家的可移动棋子
        if (!piece || piece.player !== this.currentPlayer || !piece.canMove()) return;
        
        this.selectedPiece = piece;
        this.validMoves = this.board.getValidMoves(piece);
        
        // 更新棋盘显示，高亮选中的棋子和可移动位置
        this.board.render(this.selectedPiece, this.validMoves, this.rotateMode);
    }

    // 尝试移动棋子
    tryMove(row, col) {
        // 检查是否是有效移动
        const moveIndex = this.validMoves.findIndex(move => move.row === row && move.col === col);
        
        if (moveIndex === -1) {
            // 如果点击的不是有效移动，检查是否是选择其他棋子
            const piece = this.board.getPiece(row, col);
            if (piece && piece.player === this.currentPlayer && piece.canMove()) {
                this.selectPiece(row, col);
                return false;
            }
            
            // 否则取消选择
            this.clearSelection();
            return false;
        }
        
        const fromRow = this.selectedPiece.row;
        const fromCol = this.selectedPiece.col;
        
        // 执行移动
        const success = this.board.movePiece(fromRow, fromCol, row, col);
        
        this.clearSelection();
        this.board.render();
        
        return success;
    }

    // 处理棋子旋转
    handleRotation(row, col) {
        const piece = this.board.getPiece(row, col);
        
        // 只能旋转当前玩家的镜子
        if (!piece || piece.player !== this.currentPlayer || 
            (piece.type !== PIECE_TYPE.SINGLE_MIRROR && piece.type !== PIECE_TYPE.DOUBLE_MIRROR)) {
            return;
        }
        
        // 旋转棋子
        piece.rotate();
        
        // 退出旋转模式
        this.rotateMode = false;
        document.getElementById('rotate-btn').classList.remove('active');
        
        // 更新棋盘并发射激光
        this.board.render();
        this.fireLaser();
    }

    // 切换旋转模式
    toggleRotateMode() {
        this.rotateMode = !this.rotateMode;
        
        if (this.rotateMode) {
            document.getElementById('rotate-btn').classList.add('active');
            this.clearSelection();
            document.getElementById('game-status').textContent = '选择一个镜子进行旋转';
            
            // 高亮显示可旋转的棋子
            this.selectedPiece = { player: this.currentPlayer }; // 临时对象，仅用于渲染
            this.board.render(this.selectedPiece, [], true);
        } else {
            document.getElementById('rotate-btn').classList.remove('active');
            this.selectedPiece = null;
            this.board.render();
            this.updateGameStatus();
        }
    }

    // 发射激光
    fireLaser() {
        const result = this.laser.fireLaser(this.currentPlayer);
        
        // 渲染激光路径
        setTimeout(() => {
            this.laser.renderLaserPath();
            
            // 检查是否击中法老
            if (result.hitPharaoh) {
                this.gameOver = true;
                this.winner = this.currentPlayer;
                
                // 高亮显示被击中的法老
                const pharaoh = this.board.getPharaoh(result.hitPharaohPlayer);
                if (pharaoh) {
                    const pharaohElement = document.querySelector(`.square[data-row="${pharaoh.row}"][data-col="${pharaoh.col}"] .piece`);
                    if (pharaohElement) {
                        pharaohElement.classList.add('killed');
                    }
                }
                
                this.updateGameStatus();
            } else {
                // 切换玩家
                setTimeout(() => {
                    this.switchPlayer();
                }, 1000);
            }
        }, 500);
    }

    // 切换当前玩家
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === PLAYER.RED ? PLAYER.BLUE : PLAYER.RED;
        
        // 清除激光
        const oldLasers = document.querySelectorAll('.laser');
        oldLasers.forEach(laser => laser.remove());
        
        this.updateGameStatus();
    }

    // 清除选择状态
    clearSelection() {
        this.selectedPiece = null;
        this.validMoves = [];
        this.board.render();
    }

    // 更新游戏状态显示
    updateGameStatus() {
        const playerTurnElement = document.getElementById('current-player');
        playerTurnElement.textContent = this.currentPlayer === PLAYER.RED ? '红方' : '蓝方';
        playerTurnElement.className = this.currentPlayer === PLAYER.RED ? '' : 'blue';
        
        const gameStatusElement = document.getElementById('game-status');
        
        if (this.gameOver) {
            const winnerText = this.winner === PLAYER.RED ? '红方' : '蓝方';
            gameStatusElement.textContent = `游戏结束！${winnerText}获胜！`;
        } else {
            gameStatusElement.textContent = '';
        }
    }
}