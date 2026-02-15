// --- PAGE ELEMENTS ---
const landingPage = document.getElementById('landing-page');
const reactionPage = document.getElementById('reaction-page');
const gamePage = document.getElementById('game-page');
const trustPage = document.getElementById('trust-page');
const poemPage = document.getElementById('poem-page');
const finalPage = document.getElementById('final-page');
const noBtn = document.getElementById('no-btn');
const poemNextBtn = document.getElementById('poem-next-btn');

// --- 1. NAVIGATION FUNCTIONS ---

function handleYes() {
    landingPage.classList.remove('active');
    reactionPage.classList.add('active');
}

function goToGame() {
    reactionPage.classList.remove('active');
    gamePage.classList.add('active');
    startGame();
}

function goToPoem() {
    trustPage.classList.remove('active');
    poemPage.classList.add('active');
    window.scrollTo(0, 0); // Force scroll to top
    startPoem();
}

function goToFinal() {
    poemPage.classList.remove('active');
    finalPage.classList.add('active');
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
}


// --- 2. NO BUTTON CHASE LOGIC ---
let isNoBtnMoving = false;

document.addEventListener('mousemove', (e) => {
    if (!landingPage.classList.contains('active')) return;

    const btnRect = noBtn.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const dist = Math.hypot(mouseX - btnCenterX, mouseY - btnCenterY);

    if (dist < 100) {
        if (!isNoBtnMoving) {
            noBtn.style.position = 'fixed';
            noBtn.style.left = btnRect.left + 'px';
            noBtn.style.top = btnRect.top + 'px';
            isNoBtnMoving = true;
        }

        const angle = Math.atan2(mouseY - btnCenterY, mouseX - btnCenterX);
        const moveDistance = 50; 
        
        let moveX = Math.cos(angle) * -moveDistance;
        let moveY = Math.sin(angle) * -moveDistance;

        let newX = btnRect.left + moveX;
        let newY = btnRect.top + moveY;

        newX = Math.max(10, Math.min(window.innerWidth - btnRect.width - 10, newX));
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

const catImg = document.getElementById('img-cat');
const poopImg = document.getElementById('img-poop');
const bucketImg = document.getElementById('img-bucket');
const fireImg = document.getElementById('img-fire');

canvas.width = Math.min(window.innerWidth * 0.9, 400);
canvas.height = 500;

let gameActive = false;
let score = 0;
let animationId;
let spawnTimeout;

let bucket = { x: canvas.width / 2 - 30, y: canvas.height - 80, width: 60, height: 60 };
let bossCat = { x: 0, y: 10, width: 70, height: 70, speed: 3, direction: 1 };
let items = [];

function moveBucket(e) {
    if (!gameActive) return;
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX || e.touches[0].clientX;
    bucket.x = clientX - rect.left - bucket.width / 2;
    
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

function restartGame() {
    startGame();
}

function spawnItem() {
    if (!gameActive) return;

    // 45% Chance for Fire
    const isFire = Math.random() < 0.45; 

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

    bossCat.x += bossCat.speed * bossCat.direction;
    if (bossCat.x + bossCat.width > canvas.width || bossCat.x < 0) {
        bossCat.direction *= -1;
    }
    ctx.drawImage(catImg, bossCat.x, bossCat.y, bossCat.width, bossCat.height);
    ctx.drawImage(bucketImg, bucket.x, bucket.y, bucket.width, bucket.height);

    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        item.y += item.speed;

        let img = item.type === 'fire' ? fireImg : poopImg;
        ctx.drawImage(img, item.x, item.y, item.width, item.height);

        if (
            item.x < bucket.x + bucket.width &&
            item.x + item.width > bucket.x &&
            item.y < bucket.y + bucket.height &&
            item.y + item.height > bucket.y
        ) {
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


// --- 4. POEM LOGIC (BUTTON FIX) ---
const poemText = [
    "妳總是被我的笨拙逗樂，",
    "笑得彎了腰，眼角泛著淚，",
    "那誇張的笑聲驚動四鄰，",
    "彷彿我天生就握著喜劇之王的劇本，",
    "只為博妳一瞬開懷。",
    " ",
    "看見妳那樣的笑容，",
    "勝過世間所有的頭彩。",
    "雖未曾被幸運之神眷顧，",
    "但擁有妳的笑容，我想，這就是幸運的極致。",
    " ",
    "喜歡妳帶著愛意的欺負，",
    "笑我笨，笑我呆，",
    "笑我穿衣服像阿伯，",
    "最弊以「健康管理」為名，",
    "吃光「我們」的甜品零食。",
    "這就是我每天開心的來源，",
    "雖然聽起來像某種奇怪的受虐傾向。",
    " ",
    "跨越距離的思念太漫長，",
    "長到夜深的視訊截圖塞滿手機，",
    "長到往返的機票足以糊滿一面牆。",
    "一天沒有你，",
    "我便如斷線的風箏，流浪的小貓咪，",
    "在沒有溫暖的胡同裡驚慌失措。",
    " ",
    "於是我願做妳專屬的小丑，",
    "用我的爛笑話，我的笨動作，",
    "而在你願意時，",
    "以愛情的姿勢，深入妳的幽谷，",
    "山峰聳立起來，讓你喊爽喊痛，",
    "Sorry，我又說了些奇怪的話。",
    "此中，",
    "我只願妳做世上最快樂的女孩。",
    "即便我是妳笑話裡的主角，又有何妨？",
    "只要能換來妳的一臉傻笑，",
    "我就心滿意足了。",
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
        }, delay);
        delay += 800; // Slightly faster text speed (0.8s)
    });

    // FIX: Show the button after 2 seconds, don't wait for the poem!
    setTimeout(() => {
        poemNextBtn.classList.remove('hidden');
    }, 2000);
}