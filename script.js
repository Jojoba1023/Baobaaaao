// --- SECTION 1: THE BUTTONS ---
const noBtn = document.getElementById('no-btn');
const yesBtn = document.getElementById('yes-btn');
const landingPage = document.getElementById('landing-page');
const gamePage = document.getElementById('game-page');
const trustPage = document.getElementById('trust-page'); 
const poemPage = document.getElementById('poem-page');
const finalPage = document.getElementById('final-page');

// Move the NO button
noBtn.addEventListener('mouseover', () => {
    const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
    const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);
    noBtn.style.position = 'absolute';
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
});

// YES button growth
let scale = 1;
setInterval(() => {
    scale += 0.005; 
    if (scale < 2.5) yesBtn.style.transform = `scale(${scale})`;
}, 100);

// Transition to Game
yesBtn.addEventListener('click', () => {
    landingPage.classList.remove('active');
    gamePage.classList.add('active');
    startGame();
});

// --- SECTION 2: THE CAT POOP GAME (HARD MODE) ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

// Load Images
const catImg = document.getElementById('img-cat');
const poopImg = document.getElementById('img-poop');

canvas.width = Math.min(window.innerWidth * 0.9, 400);
canvas.height = 500;

let score = 0;
let lives = 3;
let gameActive = false;
let player = { x: canvas.width / 2, y: canvas.height - 70, width: 60, height: 60 };
let items = [];
let spawnRate = 600; // Faster spawning
let animationId;
let spawnTimeout;

function movePlayer(e) {
    if (!gameActive) return;
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX || e.touches[0].clientX;
    player.x = clientX - rect.left - player.width / 2;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}
canvas.addEventListener('mousemove', movePlayer);
canvas.addEventListener('touchmove', movePlayer);

function startGame() {
    // Reset Variables
    score = 0;
    lives = 3;
    items = [];
    scoreEl.innerText = score;
    updateLivesDisplay();
    gameActive = true;
    
    animateGame();
    spawnItem();
}

function updateLivesDisplay() {
    let hearts = "";
    for(let i=0; i<lives; i++) hearts += "❤️";
    livesEl.innerText = hearts;
}

function spawnItem() {
    if (!gameActive) return;
    items.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        // DIFFICULTY: Faster speed (4 to 8 speed)
        speed: 4 + Math.random() * 4 
    });
    spawnTimeout = setTimeout(spawnItem, spawnRate); 
}

function animateGame() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Player
    ctx.drawImage(catImg, player.x, player.y, player.width, player.height);

    // Draw Items
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        item.y += item.speed;
        
        ctx.drawImage(poopImg, item.x, item.y, 40, 40);

        // CAUGHT (Collision)
        if (
            item.x < player.x + player.width &&
            item.x + 40 > player.x &&
            item.y < player.y + player.height &&
            item.y + 40 > player.y
        ) {
            score++;
            scoreEl.innerText = score;
            items.splice(i, 1);
            i--;
            
            // WIN CONDITION: 10 Poops
            if (score >= 10) {
                gameWin();
                return;
            }
        }
        // MISSED (Hit the floor)
        else if (item.y > canvas.height) {
            items.splice(i, 1);
            i--;
            lives--;
            updateLivesDisplay();
            
            // LOSE CONDITION
            if (lives <= 0) {
                gameOver();
                return;
            }
        }
    }
    animationId = requestAnimationFrame(animateGame);
}

function gameOver() {
    gameActive = false;
    clearTimeout(spawnTimeout);
    cancelAnimationFrame(animationId);
    
    // Draw "Try Again" text on canvas
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "white";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("KiKi is judging you...", canvas.width/2, canvas.height/2 - 20);
    ctx.fillText("Try Again!", canvas.width/2, canvas.height/2 + 30);

    // Restart after 2 seconds
    setTimeout(startGame, 2000);
}

function gameWin() {
    gameActive = false;
    clearTimeout(spawnTimeout);
    cancelAnimationFrame(animationId);
    
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    
    setTimeout(() => {
        gamePage.classList.remove('active');
        trustPage.classList.add('active'); 
        
        setTimeout(() => {
            trustPage.classList.remove('active');
            poemPage.classList.add('active');
            startPoem();
        }, 3000);
        
    }, 1000);
}

// --- SECTION 3: THE POEM ---
const poemText = [
    "笑我那些爛笑話的樣子",
    "笑到彎腰 笑到流淚",
    "笑到隔壁鄰居以為我在家殺豬",
    "那種誇張程度",
    "讓我懷疑自己是不是",
    "不小心拿到了喜劇之王的劇本",
    " ",
    "看到你笑成這樣",
    "比中樂透還開心",
    "雖然我從沒中過樂透",
    "但我猜大概就是這種感覺",
    " ",
    "我愛你每天欺負我",
    "說我笨 說我呆",
    "說我穿衣服像阿伯",
    "然後轉過身偷偷把我亂買的零食吃光",
    "說要幫我健康管理",
    "這就是我每天開心的來源",
    "雖然聽起來像某種奇怪的受虐傾向",
    " ",
    "我們遠距離撐了這麼久",
    "久到我手機裡都是半夜視訊的截圖",
    "久到機票可以貼滿一面牆",
    "一天沒有你",
    "我就像手機沒電 錢包沒錢",
    "WiFi斷線 還忘記帶鑰匙",
    "整個人不安到像被丟到外太空",
    " ",
    "所以我要每天逗你笑",
    "用我的爛笑話 我的笨動作",
    "以愛情的姿勢，深入妳的幽谷",
    "山峰聳立起來，再一次彎腰，再一次流淚",
    "Anyway….",
    "我偶爾會傻逼的樣子（故意的啦）",
    "讓你成為全世界最開心的女生",
    "就算你笑的是我",
    "我也心甘情願",
    "能看到妳傻笑的臉",
    "其實覺得已經樂透",


    " ",
    "Happy Valentine's Day! ❤️"
];

function startPoem() {
    const container = document.getElementById('poem-container');
    let delay = 0;

    poemText.forEach(line => {
        const p = document.createElement('p');
        p.className = 'poem-line';
        p.innerText = line;
        if (line === " ") p.innerHTML = "&nbsp;"; 
        container.appendChild(p);

        setTimeout(() => {
            p.classList.add('visible');
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, delay);
        delay += 1200; 
    });

    setTimeout(() => {
        poemPage.classList.remove('active');
        finalPage.classList.add('active');
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    }, delay + 5000);
}