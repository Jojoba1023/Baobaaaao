// --- PAGE ELEMENTS ---
const landingPage = document.getElementById('landing-page');
const reactionPage = document.getElementById('reaction-page');
const gamePage = document.getElementById('game-page');
const trustPage = document.getElementById('trust-page');
const poemPage = document.getElementById('poem-page');
const finalPage = document.getElementById('final-page');

const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');

// --- 1. NO BUTTON CHASE LOGIC ---
// We track mouse position and move button if it gets too close
document.addEventListener('mousemove', (e) => {
    if (!landingPage.classList.contains('active')) return;

    const btnRect = noBtn.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

    // If mouse is within 150px of the button
    if (dist < 150) {
        // Calculate angle to move away
        const angle = Math.atan2(e.clientY - btnCenterY, e.clientX - btnCenterX);
        
        // Move opposite direction
        let moveX = Math.cos(angle) * -20; // Move speed
        let moveY = Math.sin(angle) * -20;

        let newLeft = noBtn.offsetLeft + moveX;
        let newTop = noBtn.offsetTop + moveY;

        // Keep inside screen bounds
        const maxX = window.innerWidth - btnRect.width;
        const maxY = window.innerHeight - btnRect.height;

        if (newLeft < 0) newLeft = 0;
        if (newLeft > maxX) newLeft = maxX;
        if (newTop < 0) newTop = 0;
        if (newTop > maxY) newTop = maxY;

        noBtn.style.left = `${newLeft}px`;
        noBtn.style.top = `${newTop}px`;
    }
});

yesBtn.addEventListener('click', () => {
    landingPage.classList.remove('active');
    reactionPage.classList.add('active');
});

// --- NAVIGATION FUNCTIONS ---
function goToGame() {
    reactionPage.classList.remove('active');
    gamePage.classList.add('active');
    startGame();
}

function goToPoem() {
    trustPage.classList.remove('active');
    poemPage.classList.add('active');
    startPoem();
}

function goToFinal() {
    poemPage.classList.remove('active');
    finalPage.classList.add('active');
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
}


// --- 2. GAME LOGIC ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over-screen');

// Images
const catImg = document.getElementById('img-cat');
const poopImg = document.getElementById('img-poop');
const bucketImg = document.getElementById('img-bucket');
const fireImg = document.getElementById('img-fire');

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
let items = []; // Holds both poop and fire

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
    gameOverScreen.classList.add('hidden'); // Hide Try Again screen
    
    animate();
    spawnItem();
}

function restartGame() {
    startGame();
}

function spawnItem() {
    if (!gameActive) return;

    // 20% Chance for FIRE, 80% Chance for POOP
    const isFire = Math.random() < 0.2;

    items.push({
        type: isFire ? 'fire' : 'poop',
        x: bossCat.x + (bossCat.width / 4), // Drop from Cat's current position
        y: bossCat.y + bossCat.height,
        width: 40,
        height: 40,
        speed: 3 + Math.random() * 2 // Fall speed (Slower than before)
    });

    // Spawn rate
    spawnTimeout = setTimeout(spawnItem, 800);
}

function animate() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Move & Draw Boss Cat
    bossCat.x += bossCat.speed * bossCat.direction;
    // Bounce Cat off walls
    if (bossCat.x + bossCat.width > canvas.width || bossCat.x < 0) {
        bossCat.direction *= -1;
    }
    ctx.drawImage(catImg, bossCat.x, bossCat.y, bossCat.width, bossCat.height);

    // 2. Draw Bucket
    ctx.drawImage(bucketImg, bucket.x, bucket.y, bucket.width, bucket.height);

    // 3. Move & Draw Items
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
            // CAUGHT ITEM
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
        // Missed item (hit floor)
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
    gameOverScreen.classList.remove('hidden'); // Show Try Again button
}

function gameWin() {
    gameActive = false;
    clearTimeout(spawnTimeout);
    cancelAnimationFrame(animationId);
    
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    // Wait 1 second then go to Trust page
    setTimeout(() => {
        gamePage.classList.remove('active');
        trustPage.classList.add('active');
    }, 1000);
}


// --- 3. POEM LOGIC ---
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
    const nextBtn = document.getElementById('poem-next-btn');
    container.innerHTML = ""; // Clear previous if any
    
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

    // Show the Next Button after all lines are shown
    setTimeout(() => {
        nextBtn.classList.remove('hidden');
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, delay + 500);
}