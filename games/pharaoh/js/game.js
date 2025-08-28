// 法老之光游戏主逻辑

class PharaohGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.board = new Board();
        this.laserSystem = new LaserSystem(this.board);
        
        this.currentPlayer = PLAYERS.RED;
        this.gameState = GAME_STATES.WAITING;
        this.operationMode = OPERATION_MODES.MOVE;
        this.winner = null;
        
        // 移动记录系统
        this.moveHistory = [];
        this.gameStateHistory = [];
        this.moveCounter = 0;
        
        this.initializeEventListeners();
        this.updateUI();
        this.render();
    }

    // 初始化事件监听器
    // 初始化事件监听器
    initializeEventListeners() {
        // 画布点击事件
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState === GAME_STATES.GAME_OVER) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.handleCanvasClick(x, y);
        });

        // 模式切换按钮
        document.getElementById('moveMode').addEventListener('click', () => {
            this.setOperationMode(OPERATION_MODES.MOVE);
        });
        
        document.getElementById('rotateMode').addEventListener('click', () => {
            this.setOperationMode(OPERATION_MODES.ROTATE);
        });

        // 悬浮旋转按钮
        document.getElementById('rotateClockwise').addEventListener('click', () => {
            this.handleRotation(true);
        });
        
        document.getElementById('rotateCounterclockwise').addEventListener('click', () => {
            this.handleRotation(false);
        });

        // 悔棋按钮
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undoLastMove();
        });

        // 游戏结束按钮
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('menuBtn').addEventListener('click', () => {
            this.returnToMenu();
        });

        // 设置按钮
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showRules();
        });

        // 关闭规则弹窗
        document.getElementById('closeRules').addEventListener('click', () => {
            this.hideRules();
        });
    }

    // 处理画布点击
    // 处理画布点击
    handleCanvasClick(x, y) {
        if (this.gameState !== GAME_STATES.GAME_OVER) {
            // 点击画布时隐藏旋转控制按钮
            this.hideRotationControls();
        }
        
        if (this.gameState !== GAME_STATES.WAITING && this.gameState !== GAME_STATES.SELECTING) {
            return;
        }

        const result = this.board.handleClick(x, y, this.currentPlayer, this.operationMode);
        
        if (result) {
            if (result.type === 'select') {
                this.gameState = GAME_STATES.SELECTING;
                
                // 如果选中的棋子可以旋转，显示旋转控制按钮
                if (result.piece.canRotate()) {
                    this.showRotationControls();
                    this.hideOperationModes();
                    this.updateGameInfo(`已选择${result.piece.getSymbol()}，选择移动位置或使用旋转按钮`);
                } else {
                    this.updateGameInfo(`已选择${result.piece.getSymbol()}，选择目标位置`);
                }
            } else if (result.type === 'move' && result.success) {
                // 隐藏控制按钮
                this.hideRotationControls();
                this.showOperationModes();
                
                // 保存游戏状态用于悔棋
                this.saveGameState();
                
                // 记录移动
                this.recordMove('move', result);
                
                // 自动发射激光
                this.executeMove();
            } else if (result.type === 'rotate' && result.success) {
                // 隐藏控制按钮
                this.hideRotationControls();
                this.showOperationModes();
                
                // 保存游戏状态用于悔棋
                this.saveGameState();
                
                // 记录旋转
                this.recordMove('rotate', result);
                
                // 自动发射激光
                this.executeMove();
            }
        } else {
            // 点击空白区域，清除选择
            this.board.clearSelection();
            this.hideRotationControls();
            this.showOperationModes();
            this.gameState = GAME_STATES.WAITING;
            this.updateGameInfo('选择一个棋子进行操作');
        }
        
        this.render();
    }

    // 执行移动并发射激光
    executeMove() {
        this.gameState = GAME_STATES.WAITING;
        this.updateGameInfo('操作完成，激光发射中...');
        
        // 延迟一点时间让玩家看到操作结果
        setTimeout(() => {
            this.fireLaser();
        }, 300);
    }

    // 保存游戏状态用于悔棋
    saveGameState() {
        const gameState = {
            boardState: this.board.pieces.map(piece => piece.clone()),
            currentPlayer: this.currentPlayer,
            moveCounter: this.moveCounter
        };
        this.gameStateHistory.push(gameState);
        
        // 只保留最近的一步用于悔棋
        if (this.gameStateHistory.length > 1) {
            this.gameStateHistory.shift();
        }
    }

    // 记录移动
    recordMove(type, result) {
        this.moveCounter++;
        
        const move = {
            number: this.moveCounter,
            player: this.currentPlayer,
            type: type,
            piece: result.piece ? result.piece.type : null,
            description: this.getMoveDescription(type, result),
            timestamp: new Date()
        };
        
        this.moveHistory.push(move);
        this.updateMoveHistory();
        this.updateUndoButton();
    }

    // 获取移动描述
    // 获取移动描述
    getMoveDescription(type, result) {
        if (type === 'move') {
            const piece = result.piece || this.board.selectedPiece;
            if (!piece || !piece.type) {
                return '移动操作';
            }
            return `${PIECE_SYMBOLS[piece.type]} 移动到 ${String.fromCharCode(65 + piece.x)}${8 - piece.y}`;
        } else if (type === 'rotate') {
            const piece = result.piece;
            if (!piece || !piece.type) {
                return '旋转操作';
            }
            const direction = result.clockwise ? '顺时针' : '逆时针';
            return `${PIECE_SYMBOLS[piece.type]} ${direction}旋转 (${piece.direction * 90}°)`;
        }
        return '未知操作';
    }

    // 更新移动记录显示
    updateMoveHistory() {
        const moveList = document.getElementById('moveList');
        
        if (this.moveHistory.length === 0) {
            moveList.innerHTML = '<div class="no-moves">暂无移动记录</div>';
            return;
        }
        
        moveList.innerHTML = '';
        
        this.moveHistory.slice(-10).forEach(move => {
            const moveItem = document.createElement('div');
            moveItem.className = `move-item ${move.player}-move`;
            
            moveItem.innerHTML = `
                <div class="move-info">
                    <div class="move-number">第 ${move.number} 步 - ${move.player === PLAYERS.RED ? '红方' : '蓝方'}</div>
                    <div class="move-description">${move.description}</div>
                </div>
            `;
            
            moveList.appendChild(moveItem);
        });
        
        // 滚动到底部
        moveList.scrollTop = moveList.scrollHeight;
    }

    // 更新悔棋按钮状态
    updateUndoButton() {
        const undoBtn = document.getElementById('undoBtn');
        undoBtn.disabled = this.gameStateHistory.length === 0 || this.gameState === GAME_STATES.GAME_OVER;
    }

    // 悔棋功能
    // 悔棋功能
    undoLastMove() {
        if (this.gameStateHistory.length === 0 || this.gameState === GAME_STATES.GAME_OVER) {
            return;
        }
        
        // 恢复上一个游戏状态
        const lastState = this.gameStateHistory.pop();
        this.board.pieces = lastState.boardState;
        this.currentPlayer = lastState.currentPlayer;
        this.moveCounter = lastState.moveCounter;
        
        // 移除最后一条移动记录
        this.moveHistory.pop();
        
        // 清除激光路径
        this.laserSystem.clearLaser();
        
        // 隐藏旋转控制按钮
        this.hideRotationControls();
        this.showOperationModes();
        
        // 更新UI
        this.updatePlayerIndicator();
        this.updateMoveHistory();
        this.updateUndoButton();
        this.updateGameInfo(`悔棋成功，轮到${this.getPlayerName()}操作`);
        
        this.render();
    }

    // 处理旋转操作
    handleRotation(clockwise) {
        if (!this.board.selectedPiece || this.gameState !== GAME_STATES.SELECTING) {
            return;
        }
        
        const piece = this.board.selectedPiece;
        if (!piece.canRotate()) {
            return;
        }
        
        // 执行旋转
        const success = this.board.rotatePiece(piece, clockwise);
        
        if (success) {
            // 隐藏控制按钮
            this.hideRotationControls();
            this.showOperationModes();
            
            // 保存游戏状态用于悔棋
            this.saveGameState();
            
            // 记录旋转
            this.recordMove('rotate', { piece: piece, success: true, clockwise: clockwise });
            
            // 自动发射激光
            this.executeMove();
        }
    }

    // 显示旋转控制按钮
    showRotationControls() {
        const controls = document.getElementById('rotationControls');
        if (controls) {
            controls.style.display = 'flex';
        }
    }

    // 隐藏旋转控制按钮
    hideRotationControls() {
        const controls = document.getElementById('rotationControls');
        if (controls) {
            controls.style.display = 'none';
        }
    }

    // 显示操作模式按钮
    showOperationModes() {
        const footer = document.querySelector('.game-footer');
        if (footer) {
            footer.style.display = 'block';
        }
    }

    // 隐藏操作模式按钮
    hideOperationModes() {
        const footer = document.querySelector('.game-footer');
        if (footer) {
            footer.style.display = 'none';
        }
    }

    // 设置操作模式
    setOperationMode(mode) {
        if (this.gameState === GAME_STATES.GAME_OVER) return;
        
        this.operationMode = mode;
        this.board.clearSelection();
        this.pendingAction = null;
        this.gameState = GAME_STATES.WAITING;
        
        // 更新UI
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        if (mode === OPERATION_MODES.MOVE) {
            document.getElementById('moveMode').classList.add('active');
            this.updateGameInfo('选择要移动的棋子');
        } else {
            document.getElementById('rotateMode').classList.add('active');
            this.updateGameInfo('选择要旋转的棋子');
        }
        
        this.render();
    }


    // 发射激光
    fireLaser() {
        this.gameState = GAME_STATES.LASER_FIRING;
        this.updateGameInfo('激光发射中...');
        
        // 清除之前的激光路径
        this.laserSystem.clearLaser();
        
        // 发射激光并计算路径
        const laserResult = this.laserSystem.fireLaser(this.currentPlayer);
        
        console.log('激光发射结果:', laserResult);
        console.log('激光路径长度:', this.laserSystem.laserPath.length);
        
        // 立即显示静态激光路径
        this.render();
        
        // 开始激光动画
        this.laserSystem.startAnimation(this.canvas, () => {
            this.handleLaserResult(laserResult);
        });
    }

    // 处理激光结果
    handleLaserResult(result) {
        // 执行棋子摧毁
        const destroyedPieces = this.laserSystem.executeDestruction();
        
        if (result.hitPharaoh) {
            // 游戏结束
            this.endGame(result.winner);
        } else {
            // 继续游戏，切换玩家
            this.switchPlayer();
            this.gameState = GAME_STATES.WAITING;
            
            if (destroyedPieces.length > 0) {
                this.updateGameInfo(`摧毁了${destroyedPieces.length}个棋子，轮到${this.getPlayerName()}操作`);
            } else {
                this.updateGameInfo(`轮到${this.getPlayerName()}操作`);
            }
        }
        
        this.render();
    }

    // 切换玩家
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === PLAYERS.RED ? PLAYERS.BLUE : PLAYERS.RED;
        this.updatePlayerIndicator();
    }

    // 结束游戏
    endGame(winner) {
        this.winner = winner;
        this.gameState = GAME_STATES.GAME_OVER;
        this.showGameOver();
    }

    // 显示游戏结束界面
    showGameOver() {
        const overlay = document.getElementById('gameOverOverlay');
        const victoryText = document.getElementById('victoryText');
        
        victoryText.textContent = `${this.getPlayerName(this.winner)}获胜！`;
        overlay.style.display = 'flex';
        
        // 添加胜利动画
        setTimeout(() => {
            overlay.classList.add('show');
        }, 100);
    }

    // 隐藏游戏结束界面
    hideGameOver() {
        const overlay = document.getElementById('gameOverOverlay');
        overlay.style.display = 'none';
        overlay.classList.remove('show');
    }

    // 重新开始游戏
    // 重新开始游戏
    restartGame() {
        this.hideGameOver();
        this.board.initializeBoard();
        this.laserSystem.clearLaser();
        this.currentPlayer = PLAYERS.RED;
        this.gameState = GAME_STATES.WAITING;
        this.operationMode = OPERATION_MODES.MOVE;
        this.winner = null;
        
        // 重置移动记录系统
        this.moveHistory = [];
        this.gameStateHistory = [];
        this.moveCounter = 0;
        
        // 隐藏旋转控制按钮，显示操作模式
        this.hideRotationControls();
        this.showOperationModes();
        
        this.setOperationMode(OPERATION_MODES.MOVE);
        this.updateUI();
        this.render();
    }

    // 返回主菜单
    returnToMenu() {
        window.location.href = '../../index.html';
    }

    // 显示规则
    showRules() {
        document.getElementById('rulesModal').style.display = 'flex';
    }

    // 隐藏规则
    hideRules() {
        document.getElementById('rulesModal').style.display = 'none';
    }

    // 更新UI
    updateUI() {
        this.updatePlayerIndicator();
        this.updateGameInfo('选择要移动的棋子');
        this.updateMoveHistory();
        this.updateUndoButton();
    }

    // 更新玩家指示器
    updatePlayerIndicator() {
        const indicator = document.getElementById('currentPlayer');
        const icon = indicator.querySelector('.player-icon');
        const name = indicator.querySelector('.player-name');
        
        if (this.currentPlayer === PLAYERS.RED) {
            icon.className = 'player-icon red-player';
            name.textContent = '红色玩家';
        } else {
            icon.className = 'player-icon blue-player';
            name.textContent = '蓝色玩家';
        }
    }

    // 更新游戏信息
    updateGameInfo(message) {
        document.getElementById('gameInfo').textContent = message;
    }


    // 获取玩家名称
    getPlayerName(player = this.currentPlayer) {
        return player === PLAYERS.RED ? '红色玩家' : '蓝色玩家';
    }

    // 渲染游戏
    render() {
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制棋盘
        this.board.draw(this.ctx);
        
        // 绘制激光路径（如果有）
        if (this.laserSystem.laserPath.length > 0 && !this.laserSystem.isAnimating) {
            this.laserSystem.drawStaticPath(this.ctx, this.board.cellSize);
        }
    }

    // 获取游戏状态信息
    getGameInfo() {
        return {
            currentPlayer: this.currentPlayer,
            gameState: this.gameState,
            operationMode: this.operationMode,
            winner: this.winner,
            boardState: this.board.toString(),
            laserInfo: this.laserSystem.getPathInfo()
        };
    }
}

// 导出游戏类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PharaohGame;
}