class ChessAI {
    constructor() {
        this.maxDepth = 2; // 搜索深度
    }
    
    findBestMove(board, color) {
        let bestScore = -Infinity;
        let bestMove = null;
        
        // 获取所有可能的移动
        const possibleMoves = this.getAllPossibleMoves(board, color);
        
        // 评估每个移动
        for (const move of possibleMoves) {
            // 模拟移动
            const piece = board.getPieceAt(move.from.x, move.from.y);
            const originalX = piece.x;
            const originalY = piece.y;
            const targetPiece = board.getPieceAt(move.to.x, move.to.y);
            
            // 临时移动
            if (targetPiece) {
                board.pieces = board.pieces.filter(p => p !== targetPiece);
            }
            
            piece.x = move.to.x;
            piece.y = move.to.y;
            
            // 评估局面
            const score = this.minimax(board, this.maxDepth - 1, -Infinity, Infinity, false, color);
            
            // 恢复原状
            piece.x = originalX;
            piece.y = originalY;
            
            if (targetPiece) {
                board.pieces.push(targetPiece);
            }
            
            // 更新最佳移动
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
    
    minimax(board, depth, alpha, beta, isMaximizing, aiColor) {
        // 到达叶子节点或游戏结束
        if (depth === 0) {
            return this.evaluateBoard(board, aiColor);
        }
        
        const currentColor = isMaximizing ? aiColor : (aiColor === PIECE_COLOR.RED ? PIECE_COLOR.BLACK : PIECE_COLOR.RED);
        
        if (isMaximizing) {
            let maxScore = -Infinity;
            const possibleMoves = this.getAllPossibleMoves(board, currentColor);
            
            for (const move of possibleMoves) {
                // 模拟移动
                const piece = board.getPieceAt(move.from.x, move.from.y);
                const originalX = piece.x;
                const originalY = piece.y;
                const targetPiece = board.getPieceAt(move.to.x, move.to.y);
                
                // 临时移动
                if (targetPiece) {
                    board.pieces = board.pieces.filter(p => p !== targetPiece);
                }
                
                piece.x = move.to.x;
                piece.y = move.to.y;
                
                // 递归评估
                const score = this.minimax(board, depth - 1, alpha, beta, false, aiColor);
                
                // 恢复原状
                piece.x = originalX;
                piece.y = originalY;
                
                if (targetPiece) {
                    board.pieces.push(targetPiece);
                }
                
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                
                // Alpha-Beta剪枝
                if (beta <= alpha) {
                    break;
                }
            }
            
            return maxScore;
        } else {
            let minScore = Infinity;
            const possibleMoves = this.getAllPossibleMoves(board, currentColor);
            
            for (const move of possibleMoves) {
                // 模拟移动
                const piece = board.getPieceAt(move.from.x, move.from.y);
                const originalX = piece.x;
                const originalY = piece.y;
                const targetPiece = board.getPieceAt(move.to.x, move.to.y);
                
                // 临时移动
                if (targetPiece) {
                    board.pieces = board.pieces.filter(p => p !== targetPiece);
                }
                
                piece.x = move.to.x;
                piece.y = move.to.y;
                
                // 递归评估
                const score = this.minimax(board, depth - 1, alpha, beta, true, aiColor);
                
                // 恢复原状
                piece.x = originalX;
                piece.y = originalY;
                
                if (targetPiece) {
                    board.pieces.push(targetPiece);
                }
                
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                
                // Alpha-Beta剪枝
                if (beta <= alpha) {
                    break;
                }
            }
            
            return minScore;
        }
    }
    
    getAllPossibleMoves(board, color) {
        const moves = [];
        
        for (const piece of board.pieces) {
            if (piece.color === color) {
                const validMoves = piece.getValidMoves(board);
                
                for (const move of validMoves) {
                    moves.push({
                        from: { x: piece.x, y: piece.y },
                        to: move
                    });
                }
            }
        }
        
        return moves;
    }
    
    evaluateBoard(board, aiColor) {
        let score = 0;
        
        // 棋子价值
        const pieceValues = {
            [PIECE_TYPE.KING]: 10000,
            [PIECE_TYPE.ADVISOR]: 200,
            [PIECE_TYPE.ELEPHANT]: 200,
            [PIECE_TYPE.HORSE]: 400,
            [PIECE_TYPE.CHARIOT]: 900,
            [PIECE_TYPE.CANNON]: 450,
            [PIECE_TYPE.PAWN]: 100
        };
        
        // 位置价值（简化版）
        const positionValues = {
            [PIECE_TYPE.PAWN]: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [10, 20, 30, 40, 50, 40, 30, 20, 10],
                [50, 60, 70, 80, 90, 80, 70, 60, 50],
                [60, 70, 80, 90, 100, 90, 80, 70, 60],
                [70, 80, 90, 100, 110, 100, 90, 80, 70],
                [80, 90, 100, 110, 120, 110, 100, 90, 80],
                [90, 100, 110, 120, 130, 120, 110, 100, 90],
                [100, 110, 120, 130, 140, 130, 120, 110, 100]
            ]
        };
        
        // 计算棋子价值
        for (const piece of board.pieces) {
            const value = pieceValues[piece.type];
            const posValue = positionValues[piece.type] ? 
                positionValues[piece.type][piece.y][piece.x] : 0;
            
            if (piece.color === aiColor) {
                score += value + posValue;
            } else {
                score -= value + posValue;
            }
        }
        
        // 考虑将军状态
        const enemyColor = aiColor === PIECE_COLOR.RED ? PIECE_COLOR.BLACK : PIECE_COLOR.RED;
        
        if (board.isKingInCheck(enemyColor)) {
            score += 50;
            
            if (board.isCheckmate(enemyColor)) {
                score += 9000;
            }
        }
        
        if (board.isKingInCheck(aiColor)) {
            score -= 50;
            
            if (board.isCheckmate(aiColor)) {
                score -= 9000;
            }
        }
        
        return score;
    }
}