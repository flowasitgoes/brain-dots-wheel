// Vercel Serverless Function
const express = require('express');
const path = require('path');
const app = express();

// 设置静态文件目录，确保正确设置 MIME 类型
app.use(express.static(path.join(__dirname, '..'), {
    setHeaders: (res, filePath) => {
        // Express 会自动设置正确的 MIME 类型
        // 但我们可以确保它被正确设置
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
        }
    }
}));

// 主页路由（SPA fallback）
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

module.exports = app;
