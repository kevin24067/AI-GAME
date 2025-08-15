// 棋子类型
const PIECE_TYPE = {
    KING: 'king',       // 将/帅
    ADVISOR: 'advisor', // 士/仕
    ELEPHANT: 'elephant', // 象/相
    HORSE: 'horse',     // 马
    CHARIOT: 'chariot', // 车
    CANNON: 'cannon',   // 炮
    PAWN: 'pawn'        // 兵/卒
};

// 棋子颜色
const PIECE_COLOR = {
    RED: 'red',
    BLACK: 'black'
};

// 棋盘尺寸
const BOARD_SIZE = {
    WIDTH: 9,  // 列数
    HEIGHT: 10 // 行数
};

// 棋子初始位置配置
const INITIAL_SETUP = [
    // 红方（下方）
    { type: PIECE_TYPE.CHARIOT, color: PIECE_COLOR.RED, x: 0, y: 9 },
    { type: PIECE_TYPE.HORSE, color: PIECE_COLOR.RED, x: 1, y: 9 },
    { type: PIECE_TYPE.ELEPHANT, color: PIECE_COLOR.RED, x: 2, y: 9 },
    { type: PIECE_TYPE.ADVISOR, color: PIECE_COLOR.RED, x: 3, y: 9 },
    { type: PIECE_TYPE.KING, color: PIECE_COLOR.RED, x: 4, y: 9 },
    { type: PIECE_TYPE.ADVISOR, color: PIECE_COLOR.RED, x: 5, y: 9 },
    { type: PIECE_TYPE.ELEPHANT, color: PIECE_COLOR.RED, x: 6, y: 9 },
    { type: PIECE_TYPE.HORSE, color: PIECE_COLOR.RED, x: 7, y: 9 },
    { type: PIECE_TYPE.CHARIOT, color: PIECE_COLOR.RED, x: 8, y: 9 },
    { type: PIECE_TYPE.CANNON, color: PIECE_COLOR.RED, x: 1, y: 7 },
    { type: PIECE_TYPE.CANNON, color: PIECE_COLOR.RED, x: 7, y: 7 },
    { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.RED, x: 0, y: 6 },
    { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.RED, x: 2, y: 6 },
    { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.RED, x: 4, y: 6 },
    { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.RED, x: 6, y: 6 },
    { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.RED, x: 8, y: 6 },
    
    // 黑方（上方）
    { type: PIECE_TYPE.CHARIOT, color: PIECE_COLOR.BLACK, x: 0, y: 0 },
    { type: PIECE_TYPE.HORSE, color: PIECE_COLOR.BLACK, x: 1, y: 0 },
    { type: PIECE_TYPE.ELEPHANT, color: PIECE_COLOR.BLACK, x: 2, y: 0 },
    { type: PIECE_TYPE.ADVISOR, color: PIECE_COLOR.BLACK, x: 3, y: 0 },
    { type: PIECE_TYPE.KING, color: PIECE_COLOR.BLACK, x: 4, y: 0 },
    { type: PIECE_TYPE.ADVISOR, color: PIECE_COLOR.BLACK, x: 5, y: 0 },
    { type: PIECE_TYPE.ELEPHANT, color: PIECE_COLOR.BLACK, x: 6, y: 0 },
    { type: PIECE_TYPE.HORSE, color: PIECE_COLOR.BLACK, x: 7, y: 0 },
    { type: PIECE_TYPE.CHARIOT, color: PIECE_COLOR.BLACK, x: 8, y: 0 },
    { type: PIECE_TYPE.CANNON, color: PIECE_COLOR.BLACK, x: 1, y: 2 },
    { type: PIECE_TYPE.CANNON, color: PIECE_COLOR.BLACK, x: 7, y: 2 },
    { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.BLACK, x: 0, y: 3 },
    { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.BLACK, x: 2, y: 3 },
    { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.BLACK, x: 4, y: 3 },
    { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.BLACK, x: 6, y: 3 },
    { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.BLACK, x: 8, y: 3 }
];

// 棋子中文名称
const PIECE_NAMES = {
    [PIECE_COLOR.RED]: {
        [PIECE_TYPE.KING]: '帅',
        [PIECE_TYPE.ADVISOR]: '仕',
        [PIECE_TYPE.ELEPHANT]: '相',
        [PIECE_TYPE.HORSE]: '马',
        [PIECE_TYPE.CHARIOT]: '车',
        [PIECE_TYPE.CANNON]: '炮',
        [PIECE_TYPE.PAWN]: '兵'
    },
    [PIECE_COLOR.BLACK]: {
        [PIECE_TYPE.KING]: '将',
        [PIECE_TYPE.ADVISOR]: '士',
        [PIECE_TYPE.ELEPHANT]: '象',
        [PIECE_TYPE.HORSE]: '马',
        [PIECE_TYPE.CHARIOT]: '车',
        [PIECE_TYPE.CANNON]: '炮',
        [PIECE_TYPE.PAWN]: '卒'
    }
};

// 棋子颜色
const PIECE_COLORS = {
    [PIECE_COLOR.RED]: '#ff0000',
    [PIECE_COLOR.BLACK]: '#000000'
};

// 棋盘格子大小
const CELL_SIZE = 70;

// 棋盘边距
const BOARD_MARGIN = 35;