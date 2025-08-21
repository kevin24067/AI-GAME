/**
 * 页面访问统计模块
 * 用于记录页面访问次数和访问日志
 */

class PageAnalytics {
  constructor() {
    this.initialized = false;
    this.currentPath = window.location.pathname;
    this.currentPage = this.getPageName();
  }

  /**
   * 初始化分析模块
   */
  async init() {
    // 检查 Supabase 客户端
    if (!window.supabase) {
      console.error('Supabase 客户端未初始化');
      return;
    }

    try {
      // 检查用户是否已登录
      const { data: { user } } = await window.supabase.auth.getUser();
      this.userId = user ? user.id : 'anonymous';
      this.initialized = true;
      
      // 记录页面访问
      this.recordPageVisit();
    } catch (error) {
      console.error('初始化页面分析模块失败:', error);
    }
  }

  /**
   * 获取当前页面名称
   */
  getPageName() {
    const path = this.currentPath;
    
    if (path === '/' || path.endsWith('index.html')) {
      return '首页';
    }
    
    // 处理游戏页面
    if (path.includes('/games/')) {
      const gameName = path.split('/').filter(Boolean).slice(-2)[0];
      return `${gameName}游戏`;
    }
    
    // 处理登录页面
    if (path.includes('login.html')) {
      return '登录页';
    }
    
    // 其他页面
    return path;
  }

  /**
   * 记录页面访问
   */
  async recordPageVisit() {
    if (!this.initialized) {
      console.warn('分析模块未初始化');
      return;
    }

    try {
      const visitData = {
        page_path: this.currentPath,
        page_name: this.currentPage,
        user_id: this.userId,
        visit_time: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer || 'direct',
        screen_resolution: `${window.screen.width}x${window.screen.height}`
      };

      // 记录访问日志
      const { error: logError } = await window.supabase
        .from('page_visits')
        .insert([visitData]);

      if (logError) {
        console.error('记录访问日志失败:', logError);
        return;
      }

      // 更新页面访问计数
      const { data: pageData, error: pageError } = await window.supabase
        .from('page_stats')
        .select('id, visit_count')
        .eq('page_path', this.currentPath)
        .maybeSingle();

      if (pageError) {
        console.error('获取页面统计数据失败:', pageError);
        return;
      }

      if (pageData) {
        // 页面记录已存在，更新计数
        const { error: updateError } = await window.supabase
          .from('page_stats')
          .update({ 
            visit_count: pageData.visit_count + 1,
            last_visit: new Date().toISOString()
          })
          .eq('id', pageData.id);

        if (updateError) {
          console.error('更新页面访问计数失败:', updateError);
        }
      } else {
        // 创建新的页面记录
        const { error: insertError } = await window.supabase
          .from('page_stats')
          .insert([{
            page_path: this.currentPath,
            page_name: this.currentPage,
            visit_count: 1,
            first_visit: new Date().toISOString(),
            last_visit: new Date().toISOString()
          }]);

        if (insertError) {
          console.error('创建页面访问记录失败:', insertError);
        }
      }

      console.log(`页面访问已记录: ${this.currentPage}`);
    } catch (error) {
      console.error('记录页面访问失败:', error);
    }
  }

  /**
   * 获取页面访问统计数据
   */
  async getPageStats(pagePath = null) {
    if (!this.initialized) {
      console.warn('分析模块未初始化');
      return null;
    }

    try {
      let query = window.supabase.from('page_stats').select('*');
      
      if (pagePath) {
        query = query.eq('page_path', pagePath);
      }
      
      const { data, error } = await query.order('visit_count', { ascending: false });
      
      if (error) {
        console.error('获取页面统计数据失败:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('获取页面统计数据失败:', error);
      return null;
    }
  }
}

// 创建并初始化页面分析实例
document.addEventListener('DOMContentLoaded', () => {
  window.pageAnalytics = new PageAnalytics();
  
  // 等待 Supabase 客户端初始化完成后再初始化分析模块
  const checkSupabase = setInterval(() => {
    if (window.supabase) {
      clearInterval(checkSupabase);
      window.pageAnalytics.init();
    }
  }, 100);
  
  // 设置超时，避免无限等待
  setTimeout(() => {
    clearInterval(checkSupabase);
    console.error('Supabase 客户端加载超时');
  }, 5000);
});
