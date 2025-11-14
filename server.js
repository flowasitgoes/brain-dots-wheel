const express = require('express');
const path = require('path');
const app = express();
const PORT = 3636;

// 提供静态文件服务
app.use(express.static(__dirname));

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`游戏服务器运行在 http://localhost:${PORT}`);
});
