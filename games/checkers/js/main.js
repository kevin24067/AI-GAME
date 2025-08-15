// 跳棋游戏主程序

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 创建游戏实例
    const game = new CheckersGame();
    
    // 初始化游戏
    game.init();
});