// 法老之光游戏入口文件

// 全局游戏实例
let game = null;

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
});

// 初始化游戏
function initializeGame() {
    try {
        // 创建游戏实例
        game = new PharaohGame('gameCanvas');
        
        // 添加键盘事件监听
        document.addEventListener('keydown', handleKeyPress);
        
        // 添加窗口大小变化监听
        window.addEventListener('resize', handleResize);
        
        console.log('法老之光游戏初始化成功');
        
        // 显示欢迎信息
        showWelcomeMessage();
        
    } catch (error) {
        console.error('游戏初始化失败:', error);
        showErrorMessage('游戏初始化失败，请刷新页面重试');
    }
}

// 处理键盘按键
function handleKeyPress(event) {
    if (!game || game.gameState === GAME_STATES.GAME_OVER) return;
    
    switch (event.key) {
        case 'r':
        case 'R':
            // R键重新开始游戏
            if (confirm('确定要重新开始游戏吗？')) {
                game.restartGame();
            }
            break;
            
        case 'm':
        case 'M':
            // M键切换到移动模式
            game.setOperationMode(OPERATION_MODES.MOVE);
            break;
            
        case 't':
        case 'T':
            // T键切换到旋转模式
            game.setOperationMode(OPERATION_MODES.ROTATE);
            break;
            
        case ' ':
        case 'Enter':
            // 空格键或回车键确认操作
            event.preventDefault();
            if (game.pendingAction) {
                game.confirmAction();
            }
            break;
            
        case 'Escape':
            // ESC键取消选择
            game.board.clearSelection();
            game.pendingAction = null;
            game.gameState = GAME_STATES.WAITING;
            game.disableConfirmButton();
            game.render();
            break;
            
        case 'h':
        case 'H':
        case '?':
            // H键或?键显示帮助
            game.showRules();
            break;
    }
}

// 处理窗口大小变化
function handleResize() {
    if (!game) return;
    
    // 重新渲染游戏
    setTimeout(() => {
        game.render();
    }, 100);
}

// 显示欢迎信息
function showWelcomeMessage() {
    const gameInfo = document.getElementById('gameInfo');
    if (gameInfo) {
        gameInfo.innerHTML = `
            <div style="text-align: center; font-size: 14px;">
                <div>🎮 欢迎来到法老之光！</div>
                <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">
                    快捷键：M-移动 T-旋转 空格-确认 H-帮助 R-重启
                </div>
            </div>
        `;
        
        // 3秒后恢复正常提示
        setTimeout(() => {
            if (game && game.gameState !== GAME_STATES.GAME_OVER) {
                game.updateGameInfo('选择要移动的棋子');
            }
        }, 3000);
    }
}

// 显示错误信息
function showErrorMessage(message) {
    const gameInfo = document.getElementById('gameInfo');
    if (gameInfo) {
        gameInfo.innerHTML = `<div style="color: #ff6b6b; text-align: center;">${message}</div>`;
    }
}

// 游戏调试功能
function debugGame() {
    if (!game) {
        console.log('游戏未初始化');
        return;
    }
    
    const info = game.getGameInfo();
    console.log('=== 游戏状态调试信息 ===');
    console.log('当前玩家:', info.currentPlayer);
    console.log('游戏状态:', info.gameState);
    console.log('操作模式:', info.operationMode);
    console.log('获胜者:', info.winner);
    console.log('激光信息:', info.laserInfo);
    console.log('棋盘状态:');
    console.log(info.boardState);
    console.log('========================');
}

// 测试激光发射
function testLaser(player = PLAYERS.RED) {
    if (!game) {
        console.log('游戏未初始化');
        return;
    }
    
    console.log(`测试${player}玩家激光发射`);
    const result = game.laserSystem.fireLaser(player);
    console.log('激光结果:', result);
    
    // 开始动画
    game.laserSystem.startAnimation(game.canvas, () => {
        console.log('激光动画完成');
    });
}

// 导出调试函数到全局作用域
window.debugGame = debugGame;
window.testLaser = testLaser;

// 错误处理
window.addEventListener('error', function(event) {
    console.error('游戏运行错误:', event.error);
    showErrorMessage('游戏运行出现错误，请刷新页面重试');
});

// 未捕获的Promise错误
window.addEventListener('unhandledrejection', function(event) {
    console.error('未处理的Promise错误:', event.reason);
    event.preventDefault();
});