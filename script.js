// --- DOM ELEMENTS ---
const landingPage = document.getElementById('landing-page');
const reactionPage = document.getElementById('reaction-page');
const gamePage = document.getElementById('game-page');
const trustPage = document.getElementById('trust-page');
const poemPage = document.getElementById('poem-page');
const finalPage = document.getElementById('final-page');

const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');

const toGameBtn = document.getElementById('to-game-btn');
const toPoemBtn = document.getElementById('to-poem-btn');
const poemNextBtn = document.getElementById('poem-next-btn');

// --- 1. NAVIGATION LOGIC ---

// Click YES -> Go to Reaction Page
yesBtn.addEventListener('click', () => {
    landingPage.classList.remove('active');
    reactionPage.classList.add('active');
});

// Click NEXT (on Reaction Page) -> Go to Game
toGameBtn.addEventListener('click', () => {
    reactionPage.classList.remove('active');
    gamePage.classList.add('active');
    startGame();
});

// Click NEXT (on Trust Page) -> Go to Poem
toPoemBtn.addEventListener('click', () => {
    trustPage.classList.remove('active');
    poemPage.classList.add('active');
    startPoem();
});

// Click NEXT (after Poem) -> Go to Final Page
poemNextBtn.addEventListener('click', () => {
    poemPage.classList.remove('active');
    finalPage.classList.add('active');
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
});


// --- 2. NO BUTTON CHASE LOGIC (Strict Borders) ---
let isNoBtnMoving = false;

document.addEventListener('mousemove', (e) => {
    // Only run this logic if we are on the landing page
    if (!landingPage.classList.contains('active')) return;

    const btnRect = noBtn.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const dist = Math.hypot(mouseX - btnCenterX, mouseY - btnCenterY);

    // If mouse is close (within 100px)
    if (dist < 100) {
        
        // If this is the first move, switch to fixed positioning so it moves smoothly
        if (!isNoBtnMoving) {
            noBtn.style.position = 'fixed';
            noBtn.style.left = btnRect.left + 'px';
            noBtn.style.top = btnRect.top + 'px';
            isNoBtnMoving = true;
        }

        // Calculate direction to move AWAY from mouse
        const angle = Math.atan2(mouseY - btnCenterY, mouseX - btnCenterX);
        
        // Move opposite direction
        const moveDistance = 50; 
        let moveX = Math.cos(angle) * -moveDistance;
        let moveY = Math.sin(angle) * -moveDistance;

        let newX = btnRect.left + moveX;
        let newY = btnRect.top + moveY;

        // --- BOUNDARY CHECK (Keep on screen) ---
        // Prevent going off left edge (0) or right edge (window.innerWidth - buttonWidth)
        newX = Math.max(10, Math.min(window.innerWidth - btnRect.width - 10, newX));
        
        // Prevent going off top edge (0) or bottom edge
        newY = Math.max(10, Math.min(window.innerHeight - btnRect.height - 10, newY));

        noBtn.style.left = `${newX}px`;
        noBtn.style.top = `${newY}px`;
    }
});


// --- 3. GAME LOGIC ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over-screen');

// Images
const catImg = document.getElementById('img-cat');
const poopImg = document.getElementById('img-poop');
const bucketImg = document.getElementById('img-bucket');
const fireImg = document.getElementById('img-fire');

// Set canvas size
canvas.width = Math.min(window.innerWidth * 0.9, 400);
canvas.height = 500;

// Game State
let gameActive = false;
let score = 0;
let animationId;
let spawnTimeout;

// Entities
let bucket = { x: canvas.width / 2 - 30, y: canvas.height - 80, width: 60, height: 60 };
let bossCat = { x: 0, y: 10, width: 70, height: 70, speed: 3, direction: 1 };
let items = [];

// Bucket Controls
function moveBucket(e) {
    if (!gameActive) return;
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX || e.touches[0].clientX;
    bucket.x = clientX - rect.left - bucket.width / 2;
    
    // Bounds check
    if (bucket.x < 0) bucket.x = 0;
    if (bucket.x + bucket.width > canvas.width) bucket.x = canvas.width - bucket.width;
}
canvas.addEventListener('mousemove', moveBucket);
canvas.addEventListener('touchmove', moveBucket);

function startGame() {
    score = 0;
    items = [];
    scoreEl.innerText = score;
    gameActive = true;
    gameOverScreen.classList.add('hidden'); 
    
    animate();
    spawnItem();
}

// Make restartGame available globally for the HTML button
window.restartGame = function() {
    startGame();
}

function spawnItem() {
    if (!gameActive) return;

    const isFire = Math.random() < 0.2; // 20% Fire

    items.push({
        type: isFire ? 'fire' : 'poop',
        x: bossCat.x + (bossCat.width / 4),
        y: bossCat.y + bossCat.height,
        width: 40,
        height: 40,
        speed: 3 + Math.random() * 2 
    });

    spawnTimeout = setTimeout(spawnItem, 800);
}

function animate() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Boss Cat
    bossCat.x += bossCat.speed * bossCat.direction;
    if (bossCat.x + bossCat.width > canvas.width || bossCat.x < 0) {
        bossCat.direction *= -1;
    }
    ctx.drawImage(catImg, bossCat.x, bossCat.y, bossCat.width, bossCat.height);

    // 2. Bucket
    ctx.drawImage(bucketImg, bucket.x, bucket.y, bucket.width, bucket.height);

    // 3. Items
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        item.y += item.speed;

        let img = item.type === 'fire' ? fireImg : poopImg;
        ctx.drawImage(img, item.x, item.y, item.width, item.height);

        // Collision Check
        if (
            item.x < bucket.x + bucket.width &&
            item.x + item.width > bucket.x &&
            item.y < bucket.y + bucket.height &&
            item.y + item.height > bucket.y
        ) {
            // CAUGHT
            if (item.type === 'fire') {
                gameOver();
                return;
            } else {
                score++;
                scoreEl.innerText = score;
                items.splice(i, 1);
                i--;
                
                if (score >= 15) {
                    gameWin();
                    return;
                }
            }
        } 
        // Missed (Floor)
        else if (item.y > canvas.height) {
            items.splice(i, 1);
            i--;
        }
    }

    animationId = requestAnimationFrame(animate);
}

function gameOver() {
    gameActive = false;
    clearTimeout(spawnTimeout);
    cancelAnimationFrame(animationId);
    gameOverScreen.classList.remove('hidden');
}

function gameWin() {
    gameActive = false;
    clearTimeout(spawnTimeout);
    cancelAnimationFrame(animationId);
    
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    setTimeout(() => {
        gamePage.classList.remove('active');
        trustPage.classList.add('active');
    }, 1000);
}


// --- 4. POEM LOGIC ---
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
    container.innerHTML = ""; 
    
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
        delay += 1000; 
    });

    setTimeout(() => {
        poemNextBtn.classList.remove('hidden');
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, delay + 500);
}