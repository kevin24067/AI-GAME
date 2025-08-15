// 跳棋游戏棋子类

class Piece {
    constructor(row, col, player) {
        this.row = row;
        this.col = col;
        this.player = player;
        this.type = PIECE_TYPE.NORMAL;
    }

    // 升级为王
    promoteToKing() {
        this.type = PIECE_TYPE.KING;
    }

    // 检查是否为王
    isKing() {
        return this.type === PIECE_TYPE.KING;
    }
}