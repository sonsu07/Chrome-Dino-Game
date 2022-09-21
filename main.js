const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth - 100;
canvas.height = window.innerHeight - 100;

const dino = {
    x : 10,
    y : 200,
    width : 50,
    height : 50,
    draw() {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    jump() {
        this.y++;
    },
    fall() {
        if (this.y > 200) {
            this.y--;
        }
    }
}

class Cactus {
    constructor() {
        this.x = 850;
        this.y = 200;
        this.width = 50;
        this.height = 50;
    }
    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}


let cactusArr = [];
let timer = 0;
let animate;
function moveCactus() {
    animate = requestAnimationFrame(moveCactus);

    ctx.clearRect(0, 0, canvas.width, canvas.height); // 도형이 이동한 만큼 삭제

    // 일정 시간이 지나면 선인장 장애물 생성
    // 120 프레임마다 리스폰
    if (timer % 120 === 0) {
        const cactus = new Cactus();
        cactusArr.push(cactus);
    }
    timer++;

    cactusArr.forEach((item, idx, arr) => {
        // 특정 x좌표에 들어서면 cactus 장애물 삭제.
        // 캐릭터와 장애물이 부딪히면 장애물 삭제
        if (item.x <  20) {
            arr.splice(idx, 1);
        }

        item.x -= 3; // 선인장 장애물을 왼쪽으로 이동시킴
        item.draw();
        gameOver(dino, item);
    })

    dino.draw();
}

moveCactus();

// 캐릭터와 장애물이 부딪히는 경우  게임오버
function gameOver(dino, cactus) {
    let xAxisDif = cactus.x - (dino.x + dino.width);
    let yAxisDif = cactus.y - (dino.y + dino.height);

    if (xAxisDif < 0 && yAxisDif < 0) {
        ctx.clearRect(0, 0, this.width, this.height);
        cancelAnimationFrame(animate);
    }
}