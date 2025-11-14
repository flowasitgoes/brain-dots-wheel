// Vercel Serverless Function
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// MIME 类型映射
const contentTypes = {
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.html': 'text/html; charset=utf-8',
    '.json': 'application/json'
};

// 静态文件处理中间件（必须在通配符路由之前）
app.use((req, res, next) => {
    const ext = path.extname(req.path).toLowerCase();
    
    // 如果是静态文件请求
    if (ext && contentTypes[ext] && ext !== '.html') {
        const filePath = path.join(__dirname, '..', req.path);
        
        // 检查文件是否存在
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader('Content-Type', contentTypes[ext]);
            res.sendFile(filePath);
            return;
        }
    }
    
    next();
});

// 使用 express.static 作为备用
app.use(express.static(path.join(__dirname, '..')));

// 所有其他请求返回 index.html (SPA fallback)
app.get('*', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

module.exports = app;