// 游戏记录追踪器
class GameTracker {
    constructor(gameName) {
        this.gameName = gameName;
        this.startTime = Date.now();
        this.currentScore = 0;
        this.currentLevel = 1;
        this.user = null;
        
        this.initUser();
    }

    // 初始化用户信息
    async initUser() {
        try {
            if (window.SupabaseClient) {
                this.user = await window.SupabaseClient.auth.getCurrentUser();
                console.log('游戏追踪器初始化，用户:', this.user?.email || '未登录');
            }
        } catch (error) {
            console.error('初始化用户信息失败:', error);
        }
    }

    // 更新分数
    updateScore(score) {
        this.currentScore = Math.max(this.currentScore, score);
    }

    // 更新关卡
    updateLevel(level) {
        this.currentLevel = Math.max(this.currentLevel, level);
    }

    // 计算游戏时长（秒）
    getPlayTime() {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    // 保存游戏记录
    async saveGameRecord() {
        if (!this.user) {
            console.log('用户未登录，跳过记录保存');
            return { success: false, message: '用户未登录' };
        }

        try {
            const playTime = this.getPlayTime();
            
            // 检查是否已有该游戏的记录
            const existingRecord = await window.SupabaseClient.database.select(
                'user_game_records', 
                '*', 
                { 
                    user_id: this.user.id, 
                    game_name: this.gameName 
                }
            );

            if (existingRecord.success && existingRecord.data.length > 0) {
                // 更新现有记录（只有更好的成绩才更新）
                const existing = existingRecord.data[0];
                const shouldUpdate = 
                    this.currentScore > existing.score || 
                    this.currentLevel > existing.level ||
                    playTime > existing.play_time;

                if (shouldUpdate) {
                    const updateData = {
                        score: Math.max(this.currentScore, existing.score),
                        level: Math.max(this.currentLevel, existing.level),
                        play_time: existing.play_time + playTime,
                        updated_at: new Date().toISOString()
                    };

                    const result = await window.SupabaseClient.database.update(
                        'user_game_records',
                        updateData,
                        { id: existing.id }
                    );

                    console.log('游戏记录已更新:', result);
                    return result;
                } else {
                    console.log('当前成绩未超过历史最佳，不更新记录');
                    return { success: true, message: '记录未更新' };
                }
            } else {
                // 创建新记录
                const newRecord = {
                    user_id: this.user.id,
                    game_name: this.gameName,
                    score: this.currentScore,
                    level: this.currentLevel,
                    play_time: playTime
                };

                const result = await window.SupabaseClient.database.insert(
                    'user_game_records',
                    newRecord
                );

                console.log('新游戏记录已创建:', result);
                return result;
            }
        } catch (error) {
            console.error('保存游戏记录失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取用户游戏历史记录
    async getUserGameHistory() {
        if (!this.user) {
            return { success: false, message: '用户未登录' };
        }

        try {
            const result = await window.SupabaseClient.database.select(
                'user_game_records',
                '*',
                { 
                    user_id: this.user.id,
                    game_name: this.gameName
                }
            );

            return result;
        } catch (error) {
            console.error('获取游戏历史失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取游戏排行榜
    async getLeaderboard(limit = 10) {
        try {
            // 注意：这里需要使用原生 SQL 查询来获取排行榜
            const query = `
                SELECT 
                    user_id,
                    game_name,
                    score,
                    level,
                    play_time,
                    created_at,
                    updated_at
                FROM user_game_records 
                WHERE game_name = '${this.gameName}'
                ORDER BY score DESC, level DESC, play_time ASC
                LIMIT ${limit}
            `;

            const result = await window.SupabaseClient.getClient()
                .rpc('execute_sql', { query });

            return result;
        } catch (error) {
            console.error('获取排行榜失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 显示游戏统计信息
    displayStats() {
        const playTime = this.getPlayTime();
        const minutes = Math.floor(playTime / 60);
        const seconds = playTime % 60;

        return {
            gameName: this.gameName,
            score: this.currentScore,
            level: this.currentLevel,
            playTime: `${minutes}分${seconds}秒`,
            user: this.user?.email || '未登录'
        };
    }
}

// 导出到全局
window.GameTracker = GameTracker;