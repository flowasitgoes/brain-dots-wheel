// Brain Dots - Colors Web Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 设置画布大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 游戏状态
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let bestScore = parseInt(localStorage.getItem('bestScore') || '0');
let framesCount = 0;
let gameLevel = 1.5;
let gameOver = false;
let tutorialShow = true;

// UI 元素
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const playBtn = document.getElementById('play-btn');
const restartBtn = document.getElementById('restart-btn');
const tutorial = document.getElementById('tutorial');
const bestScoreEl = document.getElementById('best-score');
const lastScoreEl = document.getElementById('last-score');
const finalScoreEl = document.getElementById('final-score');

// 更新 UI
bestScoreEl.textContent = `最佳分数: ${bestScore}`;

// 颜色常量
const COLORS = {
    RED: { name: 'red', value: 1, color: '#FF4444' },
    BLUE: { name: 'blue', value: 2, color: '#4444FF' },
    YELLOW: { name: 'yellow', value: 3, color: '#FFFF44' },
    GREEN: { name: 'green', value: 4, color: '#44FF44' }
};

// 游戏对象
let centerCircle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: Math.min(canvas.width, canvas.height) / 16,
    rotation: 0
};

let leftWheel = {
    x: 0,
    y: canvas.height / 2,
    radius: Math.min(canvas.width, canvas.height) / 8,
    rotation: -3 * Math.PI / 4,
    touchActive: false,
    lastTouchY: 0
};

let rightWheel = {
    x: canvas.width,
    y: canvas.height / 2,
    radius: Math.min(canvas.width, canvas.height) / 8,
    rotation: -Math.PI / 4,
    touchActive: false,
    lastTouchY: 0
};

let obstacles = [];

// 障碍物结构
class Obstacle {
    constructor(x, y, color, size, isLeft) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.isLeft = isLeft;
        this.alpha = 1;
    }
}

// 获取轮子当前颜色
function getWheelColor(wheel, isLeft) {
    let rotation = wheel.rotation;
    // 规范化角度到 -PI 到 PI
    while (rotation > Math.PI) rotation -= 2 * Math.PI;
    while (rotation < -Math.PI) rotation += 2 * Math.PI;
    
    if (rotation >= -Math.PI / 2 && rotation < 0) {
        return isLeft ? COLORS.BLUE : COLORS.GREEN;
    } else if (rotation >= -Math.PI && rotation < -Math.PI / 2) {
        return isLeft ? COLORS.RED : COLORS.YELLOW;
    } else if (rotation >= 0 && rotation <= Math.PI / 2) {
        return isLeft ? COLORS.YELLOW : COLORS.RED;
    } else {
        return isLeft ? COLORS.GREEN : COLORS.BLUE;
    }
}

// 生成随机障碍物
function spawnObstacle() {
    const colors = [COLORS.RED, COLORS.BLUE, COLORS.YELLOW, COLORS.GREEN];
    const color = colors[Math.floor(Math.random() * 4)];
    const sizes = [
        Math.min(canvas.width, canvas.height) / 22,
        Math.min(canvas.width, canvas.height) / 33,
        Math.min(canvas.width, canvas.height) / 40
    ];
    const size = sizes[Math.floor(Math.random() * 3)];
    
    let isLeft = Math.random() > 0.5;
    if (score > 10) {
        isLeft = !isLeft;
    }
    
    obstacles.push(new Obstacle(
        canvas.width / 2,
        canvas.height / 2,
        color,
        size,
        isLeft
    ));
}

// 绘制圆形渐变
function drawCircle(x, y, radius, color) {
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color.replace('FF', 'CC'));
    ctx.fillStyle = gradient;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// 绘制轮子
function drawWheel(wheel) {
    ctx.save();
    ctx.translate(wheel.x, wheel.y);
    ctx.rotate(wheel.rotation);
    
    // 绘制轮子主体
    drawCircle(0, 0, wheel.radius, '#888');
    
    // 绘制四个象限的颜色
    const colors = [COLORS.RED, COLORS.BLUE, COLORS.YELLOW, COLORS.GREEN];
    if (wheel === rightWheel) {
        colors.reverse();
    }
    
    // 绘制四个象限
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 - Math.PI / 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, wheel.radius, angle, angle + Math.PI / 2);
        ctx.closePath();
        ctx.fillStyle = colors[i].color;
        ctx.fill();
    }
    
    // 绘制边框
    ctx.beginPath();
    ctx.arc(0, 0, wheel.radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.restore();
}

// 绘制障碍物
function drawObstacle(obstacle) {
    ctx.globalAlpha = obstacle.alpha;
    drawCircle(obstacle.x, obstacle.y, obstacle.size, obstacle.color.color);
    ctx.globalAlpha = 1;
}

// 绘制分数
function drawScore() {
    ctx.fillStyle = '#000';
    const fontSize = Math.min(canvas.width, canvas.height) / 20;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`分数: ${score}`, canvas.width / 2, canvas.height / 4);
}

// 检查碰撞
function checkCollision(obstacle, wheel, isLeft) {
    const dx = obstacle.x - wheel.x;
    const dy = obstacle.y - wheel.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const collisionDistance = obstacle.size + wheel.radius;
    
    if (distance < collisionDistance) {
        const wheelColor = getWheelColor(wheel, isLeft);
        const correct = wheelColor.name === obstacle.color.name;
        
        if (correct) {
            score++;
            playSound('score');
        } else {
            gameOver = true;
            playSound('punch');
            setTimeout(() => {
                endGame();
            }, 500);
        }
        
        obstacle.alpha = 0;
        setTimeout(() => {
            const index = obstacles.indexOf(obstacle);
            if (index > -1) obstacles.splice(index, 1);
        }, 500);
        
        return true;
    }
    return false;
}

// 游戏循环
function gameLoop() {
    if (gameState !== 'playing') return;
    
    // 清除画布
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!tutorialShow && !gameOver) {
        framesCount++;
        
        // 更新中心圆圈旋转
        centerCircle.rotation += 0.1047;
        if (centerCircle.rotation >= Math.PI * 2) {
            centerCircle.rotation = 0;
        }
        
        // 生成障碍物
        const spawnInterval = 240 / gameLevel;
        if (framesCount * gameLevel >= spawnInterval) {
            framesCount = 0;
            spawnObstacle();
        }
        
        // 更新游戏难度
        if (score > 10) {
            if (score <= 20) gameLevel = 1.6;
            else if (score <= 30) gameLevel = 1.65;
            else if (score <= 40) gameLevel = 1.7;
            else if (score <= 50) gameLevel = 1.75;
            else if (score <= 60) gameLevel = 1.8;
            else if (score <= 70) gameLevel = 1.85;
            else if (score <= 80) gameLevel = 1.9;
            else if (score <= 90) gameLevel = 1.95;
            else if (score <= 100) gameLevel = 1.95;
            else if (score <= 110) gameLevel = 2.0;
            else if (score <= 120) gameLevel = 2.05;
            else if (score <= 130) gameLevel = 2.1;
            else if (score <= 140) gameLevel = 2.15;
            else gameLevel = 2.2;
        }
        
        // 更新障碍物位置
        obstacles.forEach((obstacle, index) => {
            if (obstacle.isLeft) {
                obstacle.x -= 5;
            } else {
                obstacle.x += 5;
            }
            
            // 检查是否移出屏幕
            if ((obstacle.x < -obstacle.size && obstacle.isLeft) ||
                (obstacle.x > canvas.width + obstacle.size && !obstacle.isLeft)) {
                obstacles.splice(index, 1);
                return;
            }
            
            // 检查碰撞
            if (!gameOver) {
                if (obstacle.isLeft) {
                    checkCollision(obstacle, leftWheel, true);
                } else {
                    checkCollision(obstacle, rightWheel, false);
                }
            }
        });
        
        drawScore();
    }
    
    // 绘制中心圆圈
    ctx.save();
    ctx.translate(centerCircle.x, centerCircle.y);
    ctx.rotate(centerCircle.rotation);
    drawCircle(0, 0, centerCircle.radius, '#666');
    ctx.restore();
    
    // 绘制轮子
    drawWheel(leftWheel);
    drawWheel(rightWheel);
    
    // 绘制障碍物
    obstacles.forEach(drawObstacle);
    
    requestAnimationFrame(gameLoop);
}

// 触摸/鼠标事件处理
let isLeftTouch = false;
let isRightTouch = false;
let lastLeftY = 0;
let lastRightY = 0;

function getTouchPosFromTouch(touch) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
    };
}

function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

// 支持多点触摸
let activeTouches = new Map();

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (let touch of e.changedTouches) {
        const touchId = touch.identifier;
        const pos = getTouchPosFromTouch(touch);
        activeTouches.set(touchId, pos);
        handleTouchStartMulti(pos);
    }
});

canvas.addEventListener('mousedown', handleTouchStart);

function handleTouchStartMulti(pos) {
    handleTouchStartInternal(pos);
}

function handleTouchStart(e) {
    const pos = getTouchPos(e);
    handleTouchStartInternal(pos);
}

function handleTouchStartInternal(pos) {
    if (gameState !== 'playing') return;
    
    if (tutorialShow) {
        tutorial.classList.add('hidden');
        tutorialShow = false;
        return;
    }
    
    if (gameOver) return;
    
    if (pos.x < canvas.width / 2) {
        isLeftTouch = true;
        lastLeftY = pos.y;
    } else {
        isRightTouch = true;
        lastRightY = pos.y;
    }
}

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (let touch of e.changedTouches) {
        const touchId = touch.identifier;
        const pos = getTouchPosFromTouch(touch);
        if (activeTouches.has(touchId)) {
            const lastPos = activeTouches.get(touchId);
            activeTouches.set(touchId, pos);
            handleTouchMoveMulti(lastPos, pos);
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) {
        handleTouchMove(e);
    }
});

function handleTouchMoveMulti(lastPos, currentPos) {
    handleTouchMoveInternal(lastPos, currentPos);
}

function handleTouchMove(e) {
    if (gameState !== 'playing' || tutorialShow || gameOver) return;
    
    const pos = getTouchPos(e);
    // 对于鼠标事件，使用全局的 lastLeftY 或 lastRightY
    const lastY = pos.x < canvas.width / 2 ? lastLeftY : lastRightY;
    handleTouchMoveInternal({ x: pos.x, y: lastY }, pos);
}

function handleTouchMoveInternal(lastPos, currentPos) {
    if (gameState !== 'playing' || tutorialShow || gameOver) return;
    
    const pos = currentPos;
    
    if (pos.x < canvas.width / 2 && isLeftTouch) {
        const deltaY = pos.y - lastPos.y;
        if (deltaY > 0) {
            leftWheel.rotation += Math.PI / 24;
        } else if (deltaY < 0) {
            leftWheel.rotation -= Math.PI / 24;
        }
        lastLeftY = pos.y;
    } else if (pos.x > canvas.width / 2 && isRightTouch) {
        const deltaY = pos.y - lastPos.y;
        if (deltaY > 0) {
            rightWheel.rotation -= Math.PI / 24;
        } else if (deltaY < 0) {
            rightWheel.rotation += Math.PI / 24;
        }
        lastRightY = pos.y;
    }
}

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    for (let touch of e.changedTouches) {
        activeTouches.delete(touch.identifier);
    }
    if (activeTouches.size === 0) {
        isLeftTouch = false;
        isRightTouch = false;
    }
});

canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    for (let touch of e.changedTouches) {
        activeTouches.delete(touch.identifier);
    }
    if (activeTouches.size === 0) {
        isLeftTouch = false;
        isRightTouch = false;
    }
});

canvas.addEventListener('mouseup', handleTouchEnd);

function handleTouchEnd(e) {
    const pos = getTouchPos(e);
    
    if (pos.x < canvas.width / 2) {
        isLeftTouch = false;
    } else {
        isRightTouch = false;
    }
}

// 音效（简单的音频上下文）
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    // 简单的音效实现
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'score') {
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'punch') {
        oscillator.frequency.value = 200;
        gainNode.gain.value = 0.2;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
    }
}

// 游戏控制
function startGame() {
    gameState = 'playing';
    gameOver = false;
    score = 0;
    framesCount = 0;
    gameLevel = 1.5;
    obstacles = [];
    tutorialShow = true;
    
    // 更新画布尺寸
    resizeCanvas();
    
    // 重置轮子位置和大小
    leftWheel.x = 0;
    leftWheel.y = canvas.height / 2;
    leftWheel.radius = Math.min(canvas.width, canvas.height) / 8;
    leftWheel.rotation = -3 * Math.PI / 4;
    
    rightWheel.x = canvas.width;
    rightWheel.y = canvas.height / 2;
    rightWheel.radius = Math.min(canvas.width, canvas.height) / 8;
    rightWheel.rotation = -Math.PI / 4;
    
    // 重置中心圆圈
    centerCircle.x = canvas.width / 2;
    centerCircle.y = canvas.height / 2;
    centerCircle.radius = Math.min(canvas.width, canvas.height) / 16;
    
    startScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    tutorial.classList.remove('hidden');
    
    gameLoop();
}

function endGame() {
    gameState = 'gameOver';
    
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        bestScoreEl.textContent = `最佳分数: ${bestScore}`;
    }
    
    finalScoreEl.textContent = `分数: ${score}`;
    lastScoreEl.textContent = `上次分数: ${score}`;
    lastScoreEl.classList.remove('hidden');
    
    gameOverScreen.classList.add('active');
}

// 按钮事件
playBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.remove('active');
    startScreen.classList.add('active');
});

// 初始化
gameLoop();
