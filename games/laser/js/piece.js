// 激光策略棋棋子类

class Piece {
    constructor(row, col, player, type) {
        this.row = row;
        this.col = col;
        this.player = player;
        this.type = type;
        
        // 根据棋子类型和玩家设置初始方向
        if (type === PIECE_TYPE.LAUNCHER) {
            // 发射器方向：红方向下，蓝方向上
            this.orientation = player === PLAYER.RED ? MIRROR_ORIENTATION.SE : MIRROR_ORIENTATION.NW;
        } else if (type === PIECE_TYPE.SINGLE_MIRROR || type === PIECE_TYPE.DOUBLE_MIRROR) {
            // 镜子默认方向
            this.orientation = player === PLAYER.RED ? MIRROR_ORIENTATION.NE : MIRROR_ORIENTATION.SW;
        } else {
            // 其他棋子默认方向
            this.orientation = MIRROR_ORIENTATION.NE;
        }
    }

    // 旋转棋子
    rotate() {
        // 顺时针旋转90度
        switch (this.orientation) {
            case MIRROR_ORIENTATION.NE:
                this.orientation = MIRROR_ORIENTATION.SE;
                break;
            case MIRROR_ORIENTATION.SE:
                this.orientation = MIRROR_ORIENTATION.SW;
                break;
            case MIRROR_ORIENTATION.SW:
                this.orientation = MIRROR_ORIENTATION.NW;
                break;
            case MIRROR_ORIENTATION.NW:
                this.orientation = MIRROR_ORIENTATION.NE;
                break;
        }
    }

    // 获取棋子的CSS样式类
    getClassNames() {
        const classes = ['piece', this.player, this.type];
        
        // 根据方向添加旋转样式
        if (this.type === PIECE_TYPE.SINGLE_MIRROR || this.type === PIECE_TYPE.DOUBLE_MIRROR) {
            classes.push(`orientation-${this.orientation}`);
        }
        
        return classes.join(' ');
    }
    
    // 创建DOM元素
    createDOMElement() {
        const element = document.createElement('div');
        element.className = this.getClassNames();
        
        // 为双面镜添加指示器
        if (this.type === PIECE_TYPE.DOUBLE_MIRROR) {
            const indicator1 = document.createElement('div');
            indicator1.className = 'indicator-1';
            element.appendChild(indicator1);
            
            const indicator2 = document.createElement('div');
            indicator2.className = 'indicator-2';
            element.appendChild(indicator2);
        }
        
        return element;
    }

    // 获取棋子的CSS旋转样式
    getRotationStyle() {
        if (this.type === PIECE_TYPE.SINGLE_MIRROR || this.type === PIECE_TYPE.DOUBLE_MIRROR) {
            return `transform: rotate(${this.orientation}deg);`;
        }
        return '';
    }

    // 检查棋子是否可以移动
    canMove() {
        // 发射器和法老不能移动
        return this.type !== PIECE_TYPE.LAUNCHER && this.type !== PIECE_TYPE.PHARAOH;
    }

    // 处理激光与棋子的交互
    handleLaser(laserDirection, laserColor) {
        switch (this.type) {
            case PIECE_TYPE.SINGLE_MIRROR:
                // 单面镜返回反射后的方向
                return {
                    direction: REFLECTION_MAP[this.type][this.orientation][laserDirection],
                    color: laserColor,
                    continue: true
                };
                
            case PIECE_TYPE.DOUBLE_MIRROR:
                // 双面镜根据入射方向和镜子方向确定反射方向
                // 双面镜有两个反射面，分别是对角线方向
                let reflectedDirection;
                
                // 使用与单面镜相同的反射映射表
                reflectedDirection = REFLECTION_MAP[this.type][this.orientation][laserDirection];
                
                return {
                    direction: reflectedDirection,
                    color: laserColor,
                    continue: true
                };
                
            case PIECE_TYPE.ABSORBER:
                // 吸收器吸收对应颜色的激光
                if ((this.player === PLAYER.RED && laserColor === LASER_COLOR.BLUE) ||
                    (this.player === PLAYER.BLUE && laserColor === LASER_COLOR.RED)) {
                    return { continue: false };
                }
                // 不吸收的颜色则继续传播
                return { direction: laserDirection, color: laserColor, continue: true };
                
            case PIECE_TYPE.PRISM:
                // 棱镜改变激光颜色
                return {
                    direction: laserDirection,
                    color: PRISM_COLOR_MAP[laserColor],
                    continue: true
                };
                
            case PIECE_TYPE.PHARAOH:
                // 法老被击中，游戏结束
                return { continue: false, hitPharaoh: true };
                
            default:
                // 其他棋子阻挡激光
                return { continue: false };
        }
    }

    // 克隆棋子
    clone() {
        const newPiece = new Piece(this.row, this.col, this.player, this.type);
        newPiece.orientation = this.orientation;
        return newPiece;
    }
}