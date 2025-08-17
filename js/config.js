// Supabase 安全配置文件
// 生产环境中，这些值应该通过服务器端渲染或构建时注入

// 检查是否在安全环境中
const isSecureContext = () => {
    return location.protocol === 'https:' || location.hostname === 'localhost';
};

// 配置 Supabase 连接信息
window.SUPABASE_CONFIG = {
    // 在生产环境中，URL 通常可以公开
    url: 'https://wdevawgwxnxqdgkxnegd.supabase.co',
    
    // ANON_KEY 应该从安全来源获取
    // 在实际部署中，建议通过以下方式之一获取：
    // 1. 服务器端 API 获取
    // 2. 构建时环境变量注入
    // 3. 加密存储后动态解密
    key: (() => {
        // 开发环境警告
        if (!isSecureContext()) {
            console.warn('⚠️ 非安全上下文，请在 HTTPS 环境中使用');
        }
        
        // 在生产环境中，这里应该是从安全 API 获取的密钥
        // 目前使用开发环境配置
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZXZhd2d3eG54cWRna3huZWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDIwODAsImV4cCI6MjA3MDg3ODA4MH0.U_f453KdjSdELparSVe7YKgyLr2R2oLBwdluPFxVjAs';
    })()
};

// 生产环境安全建议
console.info(`
🔒 Supabase 安全配置建议：

开发环境：
✅ 当前配置适用于开发和测试

生产环境建议：
1. 使用环境变量注入密钥
2. 通过服务器端 API 获取配置
3. 实施密钥轮换策略
4. 启用 RLS (Row Level Security)
5. 配置域名白名单
6. 监控 API 使用情况

当前环境: ${isSecureContext() ? 'HTTPS/Localhost' : 'HTTP (不安全)'}
`);