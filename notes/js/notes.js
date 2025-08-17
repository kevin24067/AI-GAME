document.addEventListener('DOMContentLoaded', function() {
    // 获取所有导航项
    const navItems = document.querySelectorAll('.nav-item:not(.disabled)');
    
    // 为每个导航项添加点击事件
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有导航项的active类
            navItems.forEach(i => i.classList.remove('active'));
            
            // 为当前点击的导航项添加active类
            this.classList.add('active');
            
            // 获取要显示的笔记ID
            const noteId = this.querySelector('a').getAttribute('data-id');
            
            // 隐藏所有笔记
            document.querySelectorAll('.note-card').forEach(note => {
                note.style.display = 'none';
            });
            
            // 显示选中的笔记
            document.getElementById(noteId).style.display = 'block';
        });
    });
    
    // 默认显示第二篇随笔（当我的孩子开始迷恋二次元）
    document.getElementById('note-2').style.display = 'block';
    document.getElementById('note-1').style.display = 'none';
});