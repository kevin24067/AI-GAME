-- 页面访问日志表
CREATE TABLE IF NOT EXISTS page_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT NOT NULL,
  page_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  visit_time TIMESTAMP WITH TIME ZONE NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  screen_resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 页面访问统计表
CREATE TABLE IF NOT EXISTS page_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT NOT NULL UNIQUE,
  page_name TEXT NOT NULL,
  visit_count INTEGER NOT NULL DEFAULT 0,
  first_visit TIMESTAMP WITH TIME ZONE NOT NULL,
  last_visit TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_page_visits_page_path ON page_visits(page_path);
CREATE INDEX IF NOT EXISTS idx_page_visits_user_id ON page_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_visit_time ON page_visits(visit_time);

-- 创建触发器自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_page_stats_updated_at
BEFORE UPDATE ON page_stats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 添加行级安全策略
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_stats ENABLE ROW LEVEL SECURITY;

-- 创建策略：只有管理员可以查看所有访问日志
CREATE POLICY admin_all_access_visits ON page_visits
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE is_admin = true));

-- 创建策略：用户只能查看自己的访问日志
CREATE POLICY user_own_access_visits ON page_visits
  USING (auth.uid()::text = user_id);

-- 创建策略：所有人可以查看页面统计数据
CREATE POLICY public_read_stats ON page_stats
  FOR SELECT USING (true);

-- 创建策略：只有管理员可以修改页面统计数据
CREATE POLICY admin_write_stats ON page_stats
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE is_admin = true));

-- 注释
COMMENT ON TABLE page_visits IS '存储每次页面访问的详细信息';
COMMENT ON TABLE page_stats IS '存储每个页面的访问统计数据';