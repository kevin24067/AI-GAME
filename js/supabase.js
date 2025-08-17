// Supabase 配置和客户端
const SUPABASE_URL = 'https://wdevawgwxnxqdgkxnegd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZXZhd2d3eG54cWRna3huZWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDIwODAsImV4cCI6MjA3MDg3ODA4MH0.U_f453KdjSdELparSVe7YKgyLr2R2oLBwdluPFxVjAs';

// 创建 Supabase 客户端（使用 CDN 版本）
let supabase;
let isInitialized = false;

// 初始化 Supabase 客户端
function initSupabase() {
    try {
        // 避免重复初始化
        if (isInitialized && supabase) {
            console.log('Supabase 客户端已初始化');
            return supabase;
        }

        // 检查 Supabase CDN 是否加载
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase CDN 未加载，请检查网络连接');
            return null;
        }

        // 创建客户端
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });

        isInitialized = true;
        console.log('Supabase 客户端初始化成功');
        
        // 异步测试连接
        setTimeout(testConnection, 1000);
        
        return supabase;
    } catch (error) {
        console.error('Supabase 初始化失败:', error);
        return null;
    }
}

// 测试 Supabase 连接
async function testConnection() {
    try {
        if (!supabase) return;
        
        const { data, error } = await supabase.from('user_game_records').select('count', { count: 'exact', head: true });
        if (error) {
            console.warn('Supabase 连接测试警告:', error.message);
        } else {
            console.log('Supabase 数据库连接正常');
        }
    } catch (error) {
        console.warn('Supabase 连接测试失败:', error.message);
    }
}

// 用户认证相关函数
const auth = {
    // 注册新用户
    async signUp(email, password) {
        try {
            if (!supabase) {
                throw new Error('Supabase 客户端未初始化');
            }

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
            if (!supabase) {
                throw new Error('Supabase 客户端未初始化');
            }

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
            if (!supabase) {
                throw new Error('Supabase 客户端未初始化');
            }

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
            if (!supabase) {
                console.warn('Supabase 客户端未初始化');
                return null;
            }

            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                // 如果是无效 JWT 错误，尝试刷新会话
                if (error.message.includes('JWT') || error.message.includes('invalid')) {
                    console.log('尝试刷新用户会话...');
                    const { data: { session } } = await supabase.auth.getSession();
                    return session?.user || null;
                }
                console.warn('获取用户信息失败:', error.message);
                return null;
            }
            
            if (user) {
                console.log('获取到用户信息:', user.email);
            }
            return user;
        } catch (error) {
            console.error('获取用户信息异常:', error.message);
            return null;
        }
    },

    // 获取当前会话
    async getSession() {
        try {
            if (!supabase) {
                console.warn('Supabase 客户端未初始化');
                return null;
            }

            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.warn('获取会话失败:', error.message);
                return null;
            }
            return session;
        } catch (error) {
            console.error('获取会话异常:', error.message);
            return null;
        }
    },

    // 检查用户是否已登录
    async isLoggedIn() {
        const user = await this.getCurrentUser();
        return !!user;
    },

    // 监听认证状态变化
    onAuthStateChange(callback) {
        if (!supabase) {
            console.warn('Supabase 客户端未初始化');
            return null;
        }
        return supabase.auth.onAuthStateChange(callback);
    }
};

// 数据库操作相关函数
const database = {
    // 插入数据
    async insert(table, data) {
        try {
            if (!supabase) {
                throw new Error('Supabase 客户端未初始化');
            }

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
            if (!supabase) {
                throw new Error('Supabase 客户端未初始化');
            }

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
            if (!supabase) {
                throw new Error('Supabase 客户端未初始化');
            }

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
            if (!supabase) {
                throw new Error('Supabase 客户端未初始化');
            }

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
    getClient: () => supabase,
    isInitialized: () => isInitialized
};

// 自动初始化（当页面加载时）
if (typeof window !== 'undefined') {
    // 等待 DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initSupabase, 500);
        });
    } else {
        setTimeout(initSupabase, 500);
    }
}