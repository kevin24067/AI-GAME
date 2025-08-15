// 跳棋游戏常量

const BOARD_SIZE = 8;
const PLAYER = {
    RED: 'red',
    BLACK: 'black'
};

const PIECE_TYPE = {
    NORMAL: 'normal',
    KING: 'king'
};

const DIRECTION = {
    UP_LEFT: { row: -1, col: -1 },
    UP_RIGHT: { row: -1, col: 1 },
    DOWN_LEFT: { row: 1, col: -1 },
    DOWN_RIGHT: { row: 1, col: 1 }
};