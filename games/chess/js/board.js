class ChessBoard {
    constructor() {
        this.pieces = [];
        this.canvas = document.getElementById('chessBoard');
        this.ctx = this.canvas.getContext('2d');
        this.selectedPiece = null;
        this.validMoves = [];
        this.aiMoveHighlight = {
            from: null,
            to: null,
            active: false
        };
        this.setupBoard();
    }
    
    setupBoard() {
        // 清空棋盘
        this.pieces = [];
        
        // 根据初始配置添加棋子
        for (const pieceConfig of INITIAL_SETUP) {
            this.pieces.push(new ChessPiece(
                pieceConfig.type,
                pieceConfig.color,
                pieceConfig.x,
                pieceConfig.y
            ));
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制棋盘背景
        this.drawBoard();
        
        // 绘制有效移动位置提示
        this.drawValidMoves();
        
        // 绘制AI移动高亮
        if (this.aiMoveHighlight.active && this.aiMoveHighlight.from && this.aiMoveHighlight.to) {
            this.drawAIMoveHighlight();
        }
        
        // 绘制棋子
        for (const piece of this.pieces) {
            piece.draw(this.ctx);
        }
    }
    
    drawBoard() {
        const ctx = this.ctx;
        
        // 绘制棋盘背景
        ctx.fillStyle = '#f5e8c9';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制棋盘格子
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        
        // 绘制横线
        for (let y = 0; y < BOARD_SIZE.HEIGHT; y++) {
            ctx.beginPath();
            ctx.moveTo(BOARD_MARGIN, BOARD_MARGIN + y * CELL_SIZE);
            ctx.lineTo(BOARD_MARGIN + (BOARD_SIZE.WIDTH - 1) * CELL_SIZE, BOARD_MARGIN + y * CELL_SIZE);
            ctx.stroke();
        }
        
        // 绘制竖线
        for (let x = 0; x < BOARD_SIZE.WIDTH; x++) {
            // 上半部分
            ctx.beginPath();
            ctx.moveTo(BOARD_MARGIN + x * CELL_SIZE, BOARD_MARGIN);
            ctx.lineTo(BOARD_MARGIN + x * CELL_SIZE, BOARD_MARGIN + 4 * CELL_SIZE);
            ctx.stroke();
            
            // 下半部分
            ctx.beginPath();
            ctx.moveTo(BOARD_MARGIN + x * CELL_SIZE, BOARD_MARGIN + 5 * CELL_SIZE);
            ctx.lineTo(BOARD_MARGIN + x * CELL_SIZE, BOARD_MARGIN + 9 * CELL_SIZE);
            ctx.stroke();
        }
        
        // 绘制楚河汉界
        ctx.font = 'bold 30px Arial';
        ctx.fillStyle = '#8B0000';
        ctx.textAlign = 'center';
        ctx.fillText('楚 河', BOARD_MARGIN + 2 * CELL_SIZE, BOARD_MARGIN + 4.5 * CELL_SIZE);
        ctx.fillText('汉 界', BOARD_MARGIN + 6 * CELL_SIZE, BOARD_MARGIN + 4.5 * CELL_SIZE);
        
        // 绘制九宫格斜线
        // 上方九宫格
        ctx.beginPath();
        ctx.moveTo(BOARD_MARGIN + 3 * CELL_SIZE, BOARD_MARGIN);
        ctx.lineTo(BOARD_MARGIN + 5 * CELL_SIZE, BOARD_MARGIN + 2 * CELL_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(BOARD_MARGIN + 5 * CELL_SIZE, BOARD_MARGIN);
        ctx.lineTo(BOARD_MARGIN + 3 * CELL_SIZE, BOARD_MARGIN + 2 * CELL_SIZE);
        ctx.stroke();
        
        // 下方九宫格
        ctx.beginPath();
        ctx.moveTo(BOARD_MARGIN + 3 * CELL_SIZE, BOARD_MARGIN + 7 * CELL_SIZE);
        ctx.lineTo(BOARD_MARGIN + 5 * CELL_SIZE, BOARD_MARGIN + 9 * CELL_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(BOARD_MARGIN + 5 * CELL_SIZE, BOARD_MARGIN + 7 * CELL_SIZE);
        ctx.lineTo(BOARD_MARGIN + 3 * CELL_SIZE, BOARD_MARGIN + 9 * CELL_SIZE);
        ctx.stroke();
        
        // 绘制兵/卒位置标记
        this.drawPositionMark(1, 2);
        this.drawPositionMark(7, 2);
        this.drawPositionMark(0, 3);
        this.drawPositionMark(2, 3);
        this.drawPositionMark(4, 3);
        this.drawPositionMark(6, 3);
        this.drawPositionMark(8, 3);
        
        this.drawPositionMark(1, 7);
        this.drawPositionMark(7, 7);
        this.drawPositionMark(0, 6);
        this.drawPositionMark(2, 6);
        this.drawPositionMark(4, 6);
        this.drawPositionMark(6, 6);
        this.drawPositionMark(8, 6);
    }
    
    drawPositionMark(x, y) {
        const ctx = this.ctx;
        const centerX = BOARD_MARGIN + x * CELL_SIZE;
        const centerY = BOARD_MARGIN + y * CELL_SIZE;
        const size = 10;
        
        // 绘制十字标记
        if (x > 0) { // 左侧标记
            ctx.beginPath();
            ctx.moveTo(centerX - size, centerY - size / 2);
            ctx.lineTo(centerX - size / 2, centerY - size / 2);
            ctx.lineTo(centerX - size / 2, centerY - size);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX - size, centerY + size / 2);
            ctx.lineTo(centerX - size / 2, centerY + size / 2);
            ctx.lineTo(centerX - size / 2, centerY + size);
            ctx.stroke();
        }
        
        if (x < BOARD_SIZE.WIDTH - 1) { // 右侧标记
            ctx.beginPath();
            ctx.moveTo(centerX + size, centerY - size / 2);
            ctx.lineTo(centerX + size / 2, centerY - size / 2);
            ctx.lineTo(centerX + size / 2, centerY - size);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX + size, centerY + size / 2);
            ctx.lineTo(centerX + size / 2, centerY + size / 2);
            ctx.lineTo(centerX + size / 2, centerY + size);
            ctx.stroke();
        }
    }
    
    drawValidMoves() {
        if (!this.validMoves.length) return;
        
        const ctx = this.ctx;
        
        for (const move of this.validMoves) {
            const centerX = BOARD_MARGIN + move.x * CELL_SIZE;
            const centerY = BOARD_MARGIN + move.y * CELL_SIZE;
            
            // 绘制可移动位置提示
            ctx.beginPath();
            ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.fill();
        }
    }
    
    // 绘制AI移动高亮
    drawAIMoveHighlight() {
        const ctx = this.ctx;
        const fromX = BOARD_MARGIN + this.aiMoveHighlight.from.x * CELL_SIZE;
        const fromY = BOARD_MARGIN + this.aiMoveHighlight.from.y * CELL_SIZE;
        const toX = BOARD_MARGIN + this.aiMoveHighlight.to.x * CELL_SIZE;
        const toY = BOARD_MARGIN + this.aiMoveHighlight.to.y * CELL_SIZE;
        
        // 绘制起始位置高亮
        ctx.beginPath();
        ctx.arc(fromX, fromY, CELL_SIZE * 0.45, 0, Math.PI * 2);
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 绘制目标位置高亮
        ctx.beginPath();
        ctx.arc(toX, toY, CELL_SIZE * 0.45, 0, Math.PI * 2);
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 绘制连接线
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 添加箭头
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const arrowSize = 15;
        
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - arrowSize * Math.cos(angle - Math.PI / 6),
            toY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            toX - arrowSize * Math.cos(angle + Math.PI / 6),
            toY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = '#FF0000';
        ctx.fill();
    }
    
    handleClick(x, y) {
        // 将像素坐标转换为棋盘坐标
        const boardX = Math.round((x - BOARD_MARGIN) / CELL_SIZE);
        const boardY = Math.round((y - BOARD_MARGIN) / CELL_SIZE);
        
        // 检查坐标是否在棋盘范围内
        if (boardX < 0 || boardX >= BOARD_SIZE.WIDTH || boardY < 0 || boardY >= BOARD_SIZE.HEIGHT) {
            return null;
        }
        
        // 检查是否点击了有效移动位置
        if (this.selectedPiece) {
            for (const move of this.validMoves) {
                if (move.x === boardX && move.y === boardY) {
                    // 执行移动
                    return this.movePiece(this.selectedPiece, boardX, boardY);
                }
            }
        }
        
        // 查找点击的棋子
        const clickedPiece = this.getPieceAt(boardX, boardY);
        
        // 如果点击了己方棋子，选中它
        if (clickedPiece) {
            // 清除之前的选择
            if (this.selectedPiece) {
                this.selectedPiece.selected = false;
            }
            
            // 选中新棋子
            clickedPiece.selected = true;
            this.selectedPiece = clickedPiece;
            this.validMoves = clickedPiece.getValidMoves(this);
            
            return { type: 'select', piece: clickedPiece };
        } else {
            // 点击空位置，取消选择
            if (this.selectedPiece) {
                this.selectedPiece.selected = false;
                this.selectedPiece = null;
                this.validMoves = [];
            }
            
            return { type: 'deselect' };
        }
    }
    
    movePiece(piece, x, y) {
        // 检查目标位置是否有敌方棋子
        const targetPiece = this.getPieceAt(x, y);
        let capturedPiece = null;
        
        if (targetPiece) {
            // 吃掉敌方棋子
            this.pieces = this.pieces.filter(p => p !== targetPiece);
            capturedPiece = targetPiece;
        }
        
        // 移动棋子
        piece.x = x;
        piece.y = y;
        
        // 取消选择
        piece.selected = false;
        this.selectedPiece = null;
        this.validMoves = [];
        
        return {
            type: 'move',
            piece: piece,
            from: { x: piece.x, y: piece.y },
            to: { x, y },
            captured: capturedPiece
        };
    }
    
    getPieceAt(x, y) {
        return this.pieces.find(piece => piece.x === x && piece.y === y);
    }
    
    findKing(color) {
        return this.pieces.find(piece => piece.type === PIECE_TYPE.KING && piece.color === color);
    }
    
    isKingInCheck(color) {
        const king = this.findKing(color);
        if (!king) return false;
        
        // 检查所有敌方棋子是否可以吃到国王
        const enemyColor = color === PIECE_COLOR.RED ? PIECE_COLOR.BLACK : PIECE_COLOR.RED;
        
        for (const piece of this.pieces) {
            if (piece.color === enemyColor) {
                const moves = piece.getValidMoves(this);
                for (const move of moves) {
                    if (move.x === king.x && move.y === king.y) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    isCheckmate(color) {
        // 如果王不在将军状态，则不是将军
        if (!this.isKingInCheck(color)) {
            return false;
        }
        
        // 检查所有己方棋子的所有可能移动是否能解除将军
        for (const piece of this.pieces) {
            if (piece.color === color) {
                const moves = piece.getValidMoves(this);
                
                for (const move of moves) {
                    // 模拟移动
                    const originalX = piece.x;
                    const originalY = piece.y;
                    const targetPiece = this.getPieceAt(move.x, move.y);
                    
                    // 临时移动
                    if (targetPiece) {
                        this.pieces = this.pieces.filter(p => p !== targetPiece);
                    }
                    
                    piece.x = move.x;
                    piece.y = move.y;
                    
                    // 检查移动后是否仍在将军状态
                    const stillInCheck = this.isKingInCheck(color);
                    
                    // 恢复原状
                    piece.x = originalX;
                    piece.y = originalY;
                    
                    if (targetPiece) {
                        this.pieces.push(targetPiece);
                    }
                    
                    // 如果有一步棋可以解除将军，则不是将死
                    if (!stillInCheck) {
                        return false;
                    }
                }
            }
        }
        
        // 所有移动都无法解除将军，则是将死
        return true;
    }
}