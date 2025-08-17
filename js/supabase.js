// Supabase 配置和客户端
const SUPABASE_URL = 'https://wdevawgwxnxqdgkxnegd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZXZhd2d3eG54cWRna3huZWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDIwODAsImV4cCI6MjA3MDg3ODA4MH0.U_f453KdjSdELparSVe7YKgyLr2R2oLBwdluPFxVjAs';

// 创建 Supabase 客户端（使用 CDN 版本）
let supabase;

// 初始化 Supabase 客户端
function initSupabase() {
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase 客户端初始化成功');
        return supabase;
    } else {
        console.error('Supabase 库未加载，请确保已包含 Supabase CDN 脚本');
        return null;
    }
}

// 用户认证相关函数
const auth = {
    // 注册新用户
    async signUp(email, password) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });
            
            if (error) throw error;
            
            console.log('注册成功:', data);
            return { success: true, data };
        } catch (error) {
            console.error('注册失败:', error.message);
            return { success: false, error: error.message };
        }
    },

    // 用户登录
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            
            if (error) throw error;
            
            console.log('登录成功:', data);
            return { success: true, data };
        } catch (error) {
            console.error('登录失败:', error.message);
            return { success: false, error: error.message };
        }
    },

    // 用户登出
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) throw error;
            
            console.log('登出成功');
            return { success: true };
        } catch (error) {
            console.error('登出失败:', error.message);
            return { success: false, error: error.message };
        }
    },

    // 获取当前用户
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error('获取用户信息失败:', error.message);
                return null;
            }
            console.log('获取到用户信息:', user);
            return user;
        } catch (error) {
            console.error('获取用户信息异常:', error.message);
            return null;
        }
    },

    // 获取当前会话
    async getSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('获取会话失败:', error.message);
                return null;
            }
            return session;
        } catch (error) {
            console.error('获取会话异常:', error.message);
            return null;
        }
    },

    // 监听认证状态变化
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    }
};

// 数据库操作相关函数
const database = {
    // 插入数据
    async insert(table, data) {
        try {
            const { data: result, error } = await supabase
                .from(table)
                .insert(data)
                .select();
            
            if (error) throw error;
            
            console.log('数据插入成功:', result);
            return { success: true, data: result };
        } catch (error) {
            console.error('数据插入失败:', error.message);
            return { success: false, error: error.message };
        }
    },

    // 查询数据
    async select(table, columns = '*', filters = {}) {
        try {
            let query = supabase.from(table).select(columns);
            
            // 应用过滤条件
            Object.keys(filters).forEach(key => {
                query = query.eq(key, filters[key]);
            });
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            console.log('数据查询成功:', data);
            return { success: true, data };
        } catch (error) {
            console.error('数据查询失败:', error.message);
            return { success: false, error: error.message };
        }
    },

    // 更新数据
    async update(table, data, filters = {}) {
        try {
            let query = supabase.from(table).update(data);
            
            // 应用过滤条件
            Object.keys(filters).forEach(key => {
                query = query.eq(key, filters[key]);
            });
            
            const { data: result, error } = await query.select();
            
            if (error) throw error;
            
            console.log('数据更新成功:', result);
            return { success: true, data: result };
        } catch (error) {
            console.error('数据更新失败:', error.message);
            return { success: false, error: error.message };
        }
    },

    // 删除数据
    async delete(table, filters = {}) {
        try {
            let query = supabase.from(table).delete();
            
            // 应用过滤条件
            Object.keys(filters).forEach(key => {
                query = query.eq(key, filters[key]);
            });
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            console.log('数据删除成功:', data);
            return { success: true, data };
        } catch (error) {
            console.error('数据删除失败:', error.message);
            return { success: false, error: error.message };
        }
    }
};

// 导出模块
window.SupabaseClient = {
    init: initSupabase,
    auth,
    database,
    getClient: () => supabase
};