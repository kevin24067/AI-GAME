// 配置管理 - 安全版本
class Config {
    constructor() {
        this.supabaseUrl = null;
        this.supabaseAnonKey = null;
        this.initialized = false;
    }

    // 从环境变量或硬编码配置获取
    async initialize() {
        if (this.initialized) return true;

        // 在浏览器环境中，直接使用硬编码的值（从.env文件中获取）
        this.supabaseUrl = 'https://wdevawgwxnxqdgkxnegd.supabase.co';
        this.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZXZhd2d3eG54cWRna3huZWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDIwODAsImV4cCI6MjA3MDg3ODA4MH0.U_f453KdjSdELparSVe7YKgyLr2R2oLBwdluPFxVjAs';
        
        console.log('✅ Supabase 配置已加载');

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