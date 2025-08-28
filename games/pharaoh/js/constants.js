// 法老之光游戏常量定义

// 游戏配置
const GAME_CONFIG = {
    BOARD_WIDTH: 10,
    BOARD_HEIGHT: 8,
    CELL_SIZE: 80,
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 640,
    LASER_SOURCES: [
        { x: 0, y: 7, direction: 'right' },  // A8 位置（左上），向右发射
        { x: 9, y: 0, direction: 'left' }    // J1 位置（右下），向左发射
    ]
};

// 玩家类型
const PLAYERS = {
    RED: 'red',
    BLUE: 'blue'
};

// 棋子类型
const PIECE_TYPES = {
    PHARAOH: 'pharaoh',     // 法老
    PYRAMID: 'pyramid',     // 金字塔
    SCARAB: 'scarab',       // 圣甲虫
    ANUBIS: 'anubis'        // 阿努比斯
};

// 棋子方向（0-3对应0°, 90°, 180°, 270°）
const DIRECTIONS = {
    NORTH: 0,   // 0°
    EAST: 1,    // 90°
    SOUTH: 2,   // 180°
    WEST: 3     // 270°
};

// 激光方向
const LASER_DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// 游戏状态
const GAME_STATES = {
    WAITING: 'waiting',
    SELECTING: 'selecting',
    MOVING: 'moving',
    ROTATING: 'rotating',
    LASER_FIRING: 'laser_firing',
    GAME_OVER: 'game_over'
};

// 操作模式
const OPERATION_MODES = {
    MOVE: 'move',
    ROTATE: 'rotate'
};

// 初始棋盘布局
const INITIAL_BOARD = {
    // 红色玩家棋子位置 (底部)
    red: [
        { type: PIECE_TYPES.PHARAOH, x: 6, y: 1, direction: DIRECTIONS.NORTH },
        { type: PIECE_TYPES.PYRAMID, x: 7, y: 3, direction: DIRECTIONS.NORTH },
        { type: PIECE_TYPES.SCARAB, x: 2, y: 1, direction: DIRECTIONS.NORTH },
        { type: PIECE_TYPES.ANUBIS, x: 2, y: 3, direction: DIRECTIONS.EAST },
        { type: PIECE_TYPES.ANUBIS, x: 4, y: 1, direction: DIRECTIONS.EAST }
    ],
    // 蓝色玩家棋子位置 (顶部)
    blue: [
        { type: PIECE_TYPES.PHARAOH, x: 3, y: 6, direction: DIRECTIONS.SOUTH },
        { type: PIECE_TYPES.PYRAMID, x: 2, y: 4, direction: DIRECTIONS.SOUTH },
        { type: PIECE_TYPES.SCARAB, x: 7, y: 6, direction: DIRECTIONS.SOUTH },
        { type: PIECE_TYPES.ANUBIS, x: 5, y: 6, direction: DIRECTIONS.WEST },
        { type: PIECE_TYPES.ANUBIS, x: 7, y: 4, direction: DIRECTIONS.WEST }
    ]
};

// 棋子显示符号
const PIECE_SYMBOLS = {
    [PIECE_TYPES.PHARAOH]: '👑',
    [PIECE_TYPES.PYRAMID]: '🔺',
    [PIECE_TYPES.SCARAB]: '🪲',
    [PIECE_TYPES.ANUBIS]: '🐺'
};

// 颜色配置
const COLORS = {
    RED_PLAYER: '#DC2626',
    BLUE_PLAYER: '#2563EB',
    GOLD: '#FFD700',
    BRONZE: '#CD7F32',
    LASER_CYAN: '#00FFFF',
    BOARD_DARK: '#2D2D2D',
    BOARD_LIGHT: '#8B7355',
    HIGHLIGHT: '#FFD700',
    SELECTED: '#FF6B6B'
};

// 动画配置
const ANIMATION_CONFIG = {
    LASER_SPEED: 500,        // 激光移动速度 (像素/秒)
    LASER_DURATION: 1000,    // 激光显示持续时间 (毫秒)
    PIECE_MOVE_DURATION: 300, // 棋子移动动画时间 (毫秒)
    ROTATION_DURATION: 200    // 旋转动画时间 (毫秒)
};

// 音效配置
const SOUND_CONFIG = {
    LASER_FIRE: 'sounds/laser_fire.mp3',
    LASER_HIT: 'sounds/laser_hit.mp3',
    PIECE_MOVE: 'sounds/piece_move.mp3',
    PIECE_ROTATE: 'sounds/piece_rotate.mp3',
    GAME_WIN: 'sounds/game_win.mp3'
};

// 导出所有常量
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GAME_CONFIG,
        PLAYERS,
        PIECE_TYPES,
        DIRECTIONS,
        LASER_DIRECTIONS,
        GAME_STATES,
        OPERATION_MODES,
        INITIAL_BOARD,
        PIECE_SYMBOLS,
        COLORS,
        ANIMATION_CONFIG,
        SOUND_CONFIG
    };
}