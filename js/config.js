// 配置管理 - 安全版本
class Config {
    constructor() {
        this.supabaseUrl = null;
        this.supabaseAnonKey = null;
        this.initialized = false;
    }

    // 从环境变量或用户输入获取配置
    async initialize() {
        if (this.initialized) return;

        // 尝试从环境变量获取（如果支持）
        if (typeof process !== 'undefined' && process.env) {
            this.supabaseUrl = process.env.VITE_SUPABASE_URL;
            this.supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
        }

        // 如果没有环境变量，提示用户配置
        if (!this.supabaseUrl || !this.supabaseAnonKey) {
            console.warn('⚠️ Supabase 配置缺失');
            console.warn('请在 .env 文件中配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
            console.warn('或者联系管理员获取配置信息');
            return false;
        }

        this.initialized = true;
        return true;
    }

    getSupabaseConfig() {
        if (!this.initialized) {
            throw new Error('配置未初始化，请先调用 initialize()');
        }
        return {
            url: this.supabaseUrl,
            anonKey: this.supabaseAnonKey
        };
    }

    // 检查是否在安全环境中
    isSecureContext() {
        return location.protocol === 'https:' || location.hostname === 'localhost';
    }
}

// 全局配置实例
window.appConfig = new Config();

// 安全提示
console.info(`
🔒 Supabase 安全配置说明：

⚠️ 重要：敏感信息已从代码中移除

配置步骤：
1. 复制 .env.example 为 .env
2. 在 .env 中填入您的 Supabase 配置
3. 确保 .env 文件不被提交到代码库

生产环境建议：
- 使用服务器端环境变量
- 实施 API 密钥轮换
- 启用 RLS (Row Level Security)
- 配置域名白名单
- 监控 API 使用情况
`);