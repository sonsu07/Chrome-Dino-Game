const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

// Images
const dinoImg = new Image();
dinoImg.src = 'dinosaur.png';

const cactusImg = new Image();
cactusImg.src = 'cactus.png'

// Variables
let score = null;
let scoreText = null;
let highScore = null;
let highScoreText = null;
let player = null;
let gravity = null;
let obstacles = [];
let gameSpeed = null;
let keys = {};

// EventListeners
document.addEventListener('keydown', function (e) {
    keys[e.code] = true;
    console.log(keys);
})
document.addEventListener('keyup', function (e) {
    keys[e.code] = false;
    console.log(keys);
})

// 플레이어 생성자
class Player {
    constructor(x, y, w, h, c) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;

        this.dy = 0;
        this.jumpForce = 15;
        this.originalHeight = h;
        this.grounded = false;
        this.jumpTimer = 0;
    }

    Animate() {
        // Jump
        if (keys['Space'] || keys['ArrowUp']) {
            this.Jump();
        } else {
            this.jumpTimer = 0;
        }

        // Down
        if (keys['ShiftLeft'] || keys['ArrowDown']) {
            this.h = this.originalHeight / 2;
        } else {
            this.h = this.originalHeight;
        }

        this.y += this.dy;

        // Gravity
        if (this.y + this.h < canvas.height) {
            this.dy += gravity;
            this.grounded = false;
        } else {
            this.dy = 0;
            this.grounded = true;
            this.y = canvas.height - this.h;
        }
        this.Draw();
    }

    Jump() {
        if (this.grounded && this.jumpTimer === 0) { // 1단계 점프
            this.jumpTimer = 1;
            this.dy = -this.jumpForce;
        }
        else if (this.jumpTimer > 0 && this.jumpTimer < 15) { // 2단계 점프
            this.jumpTimer++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50);
        }
    }

    Draw() {
        ctx.beginPath(); // 그리기 시작
        ctx.fillStyle = this.c;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.closePath(); // 그리기 끝내기
    }
}

// 장애물 생성자
class Obstacle {
    constructor(x, y, w, h, c) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;

        this.dx = -gameSpeed;
    }

    Update() {
        this.x += this.dx;
        this.Draw();
        this.dx = -gameSpeed;
    }

    Draw() {
        ctx.beginPath(); // 그리기 시작
        ctx.fillStyle = this.c;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.closePath(); // 그리기 끝내기
    }
}

// score 넣기
class Text {
    constructor(t, x, y, a, c, s) {
        this.t = t;
        this.x = x;
        this.y = y;
        this.a = a;
        this.c = c;
        this.s = s;
    }
    Draw() {
        ctx.beginPath(); // 그리기 시작
        ctx.fillStyle = this.c;
        ctx.font = this.s + 'px sans-serif';
        ctx.textAlign = this.a;
        ctx.fillText(this.t, this.x, this.y)
        ctx.closePath(); // 그리기 끝내기
    }
}

// Game Functions
function SpawnObstacle() {
    let size = RandomIntInRange(20, 70);
    let type = RandomIntInRange(0, 1); // 0은 지상 장애물, 1은 공중 장애물
    let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, '#2484E4');

    // 공중 장애물 생성
    if (type === 1) {
        obstacle.y -= player.originalHeight - 10;
    }
    obstacles.push(obstacle);
}

function RandomIntInRange(min, max) {
    return Math.round(Math.random() * (max - min) + min)
}

function Start() {
    // 캔버스 사이즈 설정
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.font = '48px, sans-serif';

    gameSpeed = 3;
    gravity = 1;

    score = 0;
    highScore = 0;
    if (localStorage.getItem('HighScore')) {
        highScore = localStorage.getItem('HighScore');
    }


    player = new Player(100, canvas.height - 150, 60, 50 , '#FF5858');
    scoreText = new Text('Score: ' + score, 25, 40, 'left', '#212121', '30');
    highScoreText = new Text('HighScore: ' + highScore, canvas.width - 25, 40, 'right', '#212121', '30')

    requestAnimationFrame(Update);
}


let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;
function Update() {
    let update = requestAnimationFrame(Update);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    spawnTimer--; // 장애물 리스폰 속도
    if (spawnTimer <= 0) {
        SpawnObstacle();
        console.log(obstacles);
        spawnTimer = initialSpawnTimer - gameSpeed * 8;

        if (spawnTimer < 60) {
            spawnTimer = 60;
        }
    }

    // spawn Enemies
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];

        if (obstacle.x + obstacle.w < 0) {
            obstacles.splice(i, 1);
        }

        // 부딪히면 초기화하는 기능.
        if (player.x < obstacle.x + obstacle.w &&
            player.x + player.w > obstacle.x &&
            player.y < obstacle.y + obstacle.h &&
            player.y + player.h > obstacle.y
        ) {
            obstacles = []; // 추가되는 장애물들 초기화
            score = 0; // 점수 초기화
            spawnTimer = initialSpawnTimer; // 타이머 시작점으로 초기화
            gameSpeed = 3; // 기본 속도로 초기화

            cancelAnimationFrame(update); // GameOver
        }

        obstacle.Update();
    }
    player.Animate();

    score++;
    scoreText.t = 'Score: ' + score;
    scoreText.Draw();

    if (score > highScore) {
        highScore = score;
        highScoreText.t = 'HighScore: ' + highScore;
        window.localStorage.setItem('HighScore', highScore); // reload 하더라도 highScore 남아있도록
    }

    highScoreText.Draw();

    gameSpeed += 0.003; // 난이도 점차 증가
}

Start();