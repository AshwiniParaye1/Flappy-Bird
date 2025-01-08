let board, context;
const boardWidth = 360;
const boardHeight = 640;

// Bird
const bird = {
  x: boardWidth / 8,
  y: boardHeight / 2,
  width: 34,
  height: 24,
  velocityY: 0
};
const birdImg = new Image();
birdImg.src = "./images/flappybird.png";

// Pipes
const pipeArray = [];
const pipeWidth = 64;
const pipeHeight = 512;
const pipeGap = boardHeight / 4;

const topPipeImg = new Image();
topPipeImg.src = "./images/toppipe.png";

const bottomPipeImg = new Image();
bottomPipeImg.src = "./images/bottompipe.png";

const pipeVelocityX = -4;

// Game variables
let gravity = 0.4;
let gameOver = false;
let score = 0;

// Sounds
// const wingSound = new Audio("./sound/sfx_wing.wav");
const wingSound = new Audio("./sound/wing.ogg");
// const hitSound = new Audio("./sound/sfx_hit.wav");
const hitSound = new Audio("./sound/hit1.ogg");
const bgm = new Audio("./sound/bgm_mario.mp3");
bgm.loop = true;

window.onload = function () {
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d");

  birdImg.onload = drawBird;
  requestAnimationFrame(update);

  setInterval(() => {
    if (!gameOver) placePipes();
  }, 1000);

  // Input listeners
  document.addEventListener("keydown", handleInput);
  board.addEventListener("touchstart", handleInput);
};

function update() {
  if (gameOver) return;

  context.clearRect(0, 0, boardWidth, boardHeight);

  // Update bird
  bird.velocityY += gravity;
  bird.y = Math.max(bird.y + bird.velocityY, 0);

  if (bird.y > boardHeight) {
    endGame();
    return;
  }

  drawBird();

  // Update pipes
  for (let i = pipeArray.length - 1; i >= 0; i--) {
    const pipe = pipeArray[i];
    pipe.x += pipeVelocityX;

    if (pipe.x + pipe.width <= 0) {
      pipeArray.splice(i, 1);
    } else {
      context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

      // Score check
      if (!pipe.passed && bird.x > pipe.x + pipe.width) {
        score += 0.5;
        pipe.passed = true;
      }

      // Collision detection
      if (detectCollision(bird, pipe)) {
        endGame();
        return;
      }
    }
  }

  // Draw score
  drawScore();

  requestAnimationFrame(update);
}

function placePipes() {
  const pipeY = -(pipeHeight / 4) - Math.random() * (pipeHeight / 2);

  pipeArray.push({
    img: topPipeImg,
    x: boardWidth,
    y: pipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false
  });

  pipeArray.push({
    img: bottomPipeImg,
    x: boardWidth,
    y: pipeY + pipeHeight + pipeGap,
    width: pipeWidth,
    height: pipeHeight,
    passed: false
  });
}

function handleInput(e) {
  if (gameOver) {
    resetGame();
    return;
  }

  if (bgm.paused) {
    bgm.play();
  }
  wingSound.play();

  bird.velocityY = -6;
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function drawBird() {
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

function drawScore() {
  context.fillStyle = "white";
  context.font = "45px sans-serif";
  context.fillText(Math.floor(score), 5, 45);
}

function endGame() {
  hitSound.play();
  bgm.pause();
  bgm.currentTime = 0;
  gameOver = true;
  context.fillText("GAME OVER!", 45, 90);
}

function resetGame() {
  bird.y = boardHeight / 2;
  bird.velocityY = 0;
  pipeArray.length = 0;
  score = 0;
  gameOver = false;
  requestAnimationFrame(update);
}
