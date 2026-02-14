// --- SECTION 1: THE BUTTONS ---
const noBtn = document.getElementById('no-btn');
const yesBtn = document.getElementById('yes-btn');
const landingPage = document.getElementById('landing-page');
const gamePage = document.getElementById('game-page');
const poemPage = document.getElementById('poem-page');

// Move the NO button when hovered
noBtn.addEventListener('mouseover', () => {
    const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
    const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);
    noBtn.style.position = 'absolute';
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
});

// Make the YES button grow over time
let scale = 1;
setInterval(() => {
    scale += 0.005; // Grows slowly
    // Cap the size so it doesn't cover the whole screen immediately
    if (scale < 2.5) { 
        yesBtn.style.transform = `scale(${scale})`;
    }
}, 100);

// Transition to Game
yesBtn.addEventListener('click', () => {
    landingPage.classList.remove('active');
    gamePage.classList.add('active');
    startGame();
});

// --- SECTION 2: THE GAME ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

// Set canvas size
canvas.width = Math.min(window.innerWidth * 0.9, 400);
canvas.height = 500;

let score = 0;
let gameActive = false;
let player = { x: canvas.width / 2, y: canvas.height - 50, width: 50, height: 50 };
let hearts = [];

// Handle mouse/touch movement
function movePlayer(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX || e.touches[0].clientX;
    player.x = clientX - rect.left - player.width / 2;
    
    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

canvas.addEventListener('mousemove', movePlayer);
canvas.addEventListener('touchmove', movePlayer);

function startGame() {
    gameActive = true;
    animateGame();
    spawnHeart();
}

function spawnHeart() {
    if (!gameActive) return;
    hearts.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        speed: 2 + Math.random() * 3
    });
    setTimeout(spawnHeart, 800); // New heart every 0.8 seconds
}

function animateGame() {
    if (!gameActive) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Player (A basket or just a cute block)
    ctx.fillStyle = '#ff4d4d';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = 'white';
    ctx.font = "20px Arial";
    ctx.fillText("U", player.x + 15, player.y + 30); // Represents "You"

    // Draw and Move Hearts
    ctx.fillStyle = '#ff66b2';
    ctx.font = "30px Arial";
    
    for (let i = 0; i < hearts.length; i++) {
        let h = hearts[i];
        h.y += h.speed;
        ctx.fillText("❤️", h.x, h.y);

        // Collision Detection
        if (
            h.x < player.x + player.width &&
            h.x + 30 > player.x &&
            h.y < player.y + player.height &&
            h.y + 30 > player.y
        ) {
            score++;
            scoreEl.innerText = score;
            hearts.splice(i, 1);
            i--;
            
            // Win Condition
            if (score >= 15) {
                endGame();
            }
        }
        
        // Remove hearts that fall off screen
        if (h.y > canvas.height) {
            hearts.splice(i, 1);
            i--;
        }
    }
    
    requestAnimationFrame(animateGame);
}

function endGame() {
    gameActive = false;
    // Celebration Confetti
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });
    
    // Wait 2 seconds then show poem
    setTimeout(() => {
        gamePage.classList.remove('active');
        poemPage.classList.add('active');
        startPoem();
    }, 2000);
}

// --- SECTION 3: THE POEM ---
const poemText = [
    "笑我那些爛笑話的樣子",
    "笑到彎腰 笑到流淚",
    "還有時笑聲便變呻吟",
    "我以愛情的姿勢，深入妳的幽谷",
    "山峰聳立起來，又一次彎腰，笑道呻吟",
    "你的聲音傳到隔壁鄰居",
    "懷疑我是否在家殺豬",
    "那種誇張程度",
    "讓我都思問: 自己是不是",
    "不小心拿到了喜劇之王的劇本",
    " ",
    "看到你笑成這樣",
    "我比中樂透還開心",
    "雖然我從沒中過樂透",
    "但我猜大概就是這種感覺",
    " ",
    "我愛你每天欺負我",
    "說我笨 說我呆",
    "說我穿衣服像阿伯",
    "然後轉過身偷偷把我亂買的零食吃光",
    "說要幫我健康管理",
    "這就是我每天在一起開心來源",
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
        
        if (line === " ") {
            p.innerHTML = "&nbsp;"; // Maintain spacing for empty lines
        }

        container.appendChild(p);

        // Fade in line by line
        setTimeout(() => {
            p.classList.add('visible');
            // Auto scroll to bottom as lines appear
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        }, delay);

        delay += 1200; // 1.2 seconds per line
    });

    // --- SECTION 3: THE POEM ---
// (Keep your poemText array exactly the same as before)

const finalPage = document.getElementById('final-page');

function startPoem() {
    const container = document.getElementById('poem-container');
    let delay = 0;

    poemText.forEach((line, index) => {
        const p = document.createElement('p');
        p.className = 'poem-line';
        p.innerText = line;
        
        if (line === " ") {
            p.innerHTML = "&nbsp;"; 
        }

        container.appendChild(p);

        setTimeout(() => {
            p.classList.add('visible');
            // Auto scroll to bottom
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        }, delay);

        delay += 1200; // 1.2 seconds per line
    });

    // CALCULATE WHEN TO SHOW THE FINAL PAGE
    // Wait for the total delay + 5 extra seconds for her to read the last line
    setTimeout(() => {
        poemPage.classList.remove('active');
        finalPage.classList.add('active');
        
        // Shoot confetti one last time!
        confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 }
        });
    }, delay + 5000);
}
}