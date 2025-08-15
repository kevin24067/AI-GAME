// 激光策略棋常量

const BOARD_SIZE = {
    ROWS: 8,
    COLS: 10
};

const PLAYER = {
    RED: 'red',
    BLUE: 'blue'
};

const PIECE_TYPE = {
    SINGLE_MIRROR: 'single-mirror',
    DOUBLE_MIRROR: 'double-mirror',
    ABSORBER: 'absorber',
    PRISM: 'prism',
    PHARAOH: 'pharaoh',
    LAUNCHER: 'launcher'
};

const DIRECTION = {
    UP: { row: -1, col: 0 },
    RIGHT: { row: 0, col: 1 },
    DOWN: { row: 1, col: 0 },
    LEFT: { row: 0, col: -1 }
};

const LASER_COLOR = {
    RED: 'red',
    BLUE: 'blue',
    GREEN: 'green',
    YELLOW: 'yellow'
};

// 镜子的方向，表示为角度（0, 90, 180, 270）
const MIRROR_ORIENTATION = {
    NE: 0,   // 东北方向 (/)
    SE: 90,  // 东南方向 (\)
    SW: 180, // 西南方向 (/)
    NW: 270  // 西北方向 (\)
};

// 激光方向映射
const LASER_DIRECTION = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

// 镜子反射映射表 [镜子类型][镜子方向][入射方向] = 出射方向
const REFLECTION_MAP = {
    [PIECE_TYPE.SINGLE_MIRROR]: {
        [MIRROR_ORIENTATION.NE]: {
            [LASER_DIRECTION.UP]: LASER_DIRECTION.RIGHT,
            [LASER_DIRECTION.RIGHT]: LASER_DIRECTION.UP,
            [LASER_DIRECTION.DOWN]: LASER_DIRECTION.LEFT,
            [LASER_DIRECTION.LEFT]: LASER_DIRECTION.DOWN
        },
        [MIRROR_ORIENTATION.SE]: {
            [LASER_DIRECTION.UP]: LASER_DIRECTION.LEFT,
            [LASER_DIRECTION.RIGHT]: LASER_DIRECTION.DOWN,
            [LASER_DIRECTION.DOWN]: LASER_DIRECTION.RIGHT,
            [LASER_DIRECTION.LEFT]: LASER_DIRECTION.UP
        },
        [MIRROR_ORIENTATION.SW]: {
            [LASER_DIRECTION.UP]: LASER_DIRECTION.RIGHT,
            [LASER_DIRECTION.RIGHT]: LASER_DIRECTION.UP,
            [LASER_DIRECTION.DOWN]: LASER_DIRECTION.LEFT,
            [LASER_DIRECTION.LEFT]: LASER_DIRECTION.DOWN
        },
        [MIRROR_ORIENTATION.NW]: {
            [LASER_DIRECTION.UP]: LASER_DIRECTION.LEFT,
            [LASER_DIRECTION.RIGHT]: LASER_DIRECTION.DOWN,
            [LASER_DIRECTION.DOWN]: LASER_DIRECTION.RIGHT,
            [LASER_DIRECTION.LEFT]: LASER_DIRECTION.UP
        }
    },
    [PIECE_TYPE.DOUBLE_MIRROR]: {
        // 双面镜的反射规则与单面镜相同，但在游戏逻辑中会有特殊处理
        [MIRROR_ORIENTATION.NE]: {
            [LASER_DIRECTION.UP]: LASER_DIRECTION.RIGHT,
            [LASER_DIRECTION.RIGHT]: LASER_DIRECTION.UP,
            [LASER_DIRECTION.DOWN]: LASER_DIRECTION.LEFT,
            [LASER_DIRECTION.LEFT]: LASER_DIRECTION.DOWN
        },
        [MIRROR_ORIENTATION.SE]: {
            [LASER_DIRECTION.UP]: LASER_DIRECTION.LEFT,
            [LASER_DIRECTION.RIGHT]: LASER_DIRECTION.DOWN,
            [LASER_DIRECTION.DOWN]: LASER_DIRECTION.RIGHT,
            [LASER_DIRECTION.LEFT]: LASER_DIRECTION.UP
        },
        [MIRROR_ORIENTATION.SW]: {
            [LASER_DIRECTION.UP]: LASER_DIRECTION.RIGHT,
            [LASER_DIRECTION.RIGHT]: LASER_DIRECTION.UP,
            [LASER_DIRECTION.DOWN]: LASER_DIRECTION.LEFT,
            [LASER_DIRECTION.LEFT]: LASER_DIRECTION.DOWN
        },
        [MIRROR_ORIENTATION.NW]: {
            [LASER_DIRECTION.UP]: LASER_DIRECTION.LEFT,
            [LASER_DIRECTION.RIGHT]: LASER_DIRECTION.DOWN,
            [LASER_DIRECTION.DOWN]: LASER_DIRECTION.RIGHT,
            [LASER_DIRECTION.LEFT]: LASER_DIRECTION.UP
        }
    }
};

// 棱镜颜色转换映射
const PRISM_COLOR_MAP = {
    [LASER_COLOR.RED]: LASER_COLOR.GREEN,
    [LASER_COLOR.BLUE]: LASER_COLOR.YELLOW,
    [LASER_COLOR.GREEN]: LASER_COLOR.BLUE,
    [LASER_COLOR.YELLOW]: LASER_COLOR.RED
};