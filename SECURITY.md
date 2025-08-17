# 🔒 Supabase 安全配置指南

## 概述

本项目使用 Supabase 作为后端服务，为了确保生产环境的安全性，请遵循以下安全配置指南。

## 🚨 安全风险

### 当前风险
- ❌ ANON_KEY 在前端代码中暴露
- ❌ 配置信息硬编码在客户端
- ❌ 缺少环境变量管理

### 已实施的安全措施
- ✅ 配置文件分离 (`js/config.js`)
- ✅ 环境变量支持
- ✅ 开发/生产环境区分
- ✅ 敏感文件 `.gitignore` 配置
- ✅ 安全上下文检查

## 🛡️ 生产环境安全配置

### 1. 环境变量配置

创建 `.env` 文件（不要提交到版本控制）：

```bash
# 复制示例文件
cp .env.example .env

# 编辑配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

### 2. Supabase 项目安全设置

在 Supabase 控制台中配置：

```sql
-- 启用行级安全策略 (RLS)
ALTER TABLE user_game_records ENABLE ROW LEVEL SECURITY;

-- 配置域名白名单
-- 在 Authentication > Settings > Site URL 中设置
-- 允许的重定向 URL
```

### 3. 生产环境部署建议

#### 方案 A: 服务器端代理
```javascript
// 创建 API 端点获取配置
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY
  });
});
```

#### 方案 B: 构建时注入
```bash
# 构建时注入环境变量
VITE_SUPABASE_URL=$SUPABASE_URL \
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
npm run build
```

#### 方案 C: CDN 配置
```html
<!-- 通过 CDN 或服务器动态注入 -->
<script>
  window.SUPABASE_CONFIG = {
    url: '{{SUPABASE_URL}}',
    key: '{{SUPABASE_ANON_KEY}}'
  };
</script>
```

## 🔐 安全最佳实践

### 1. 密钥管理
- ✅ 使用环境变量存储敏感信息
- ✅ 定期轮换 API 密钥
- ✅ 监控 API 使用情况
- ✅ 设置使用限制和配额

### 2. 数据库安全
- ✅ 启用行级安全策略 (RLS)
- ✅ 最小权限原则
- ✅ 定期备份数据
- ✅ 监控异常访问

### 3. 前端安全
- ✅ 使用 HTTPS
- ✅ 实施 CSP (Content Security Policy)
- ✅ 验证用户输入
- ✅ 防止 XSS 攻击

### 4. 网络安全
- ✅ 配置 CORS 策略
- ✅ 使用域名白名单
- ✅ 实施速率限制
- ✅ 监控流量异常

## 🚀 部署检查清单

### 部署前检查
- [ ] 环境变量已正确配置
- [ ] 敏感信息已从代码中移除
- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] Supabase RLS 策略已启用
- [ ] 域名白名单已配置

### 部署后验证
- [ ] HTTPS 证书正常
- [ ] 用户认证功能正常
- [ ] 数据库连接安全
- [ ] API 调用受限制保护
- [ ] 监控和日志正常

## 📞 紧急响应

### 密钥泄露处理
1. 立即在 Supabase 控制台重置密钥
2. 更新所有部署环境的配置
3. 检查访问日志是否有异常
4. 通知相关团队成员

### 安全事件报告
- 记录事件详情和时间
- 评估影响范围
- 实施修复措施
- 更新安全策略

## 📚 相关资源

- [Supabase 安全文档](https://supabase.com/docs/guides/auth/row-level-security)
- [前端安全最佳实践](https://owasp.org/www-project-top-ten/)
- [环境变量管理](https://12factor.net/config)

---

⚠️ **重要提醒**: 在生产环境中，绝不要在客户端代码中硬编码敏感信息！