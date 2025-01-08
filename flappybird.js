//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;

let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight
};

let birdImg = new Image();
birdImg.src = "./images/flappybird.png";

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;

let topPipeImg = new Image();
topPipeImg.src = "./images/toppipe.png";

let bottomPipeImg = new Image();
bottomPipeImg.src = "./images/bottompipe.png";

let velocityX = -4;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;

let wingSound = new Audio("./sound/sfx_wing.wav");
let hitSound = new Audio("./sound/sfx_hit.wav");
let bgm = new Audio("./sound/bgm_mario.mp3");
bgm.loop = true;

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  birdImg.onload = () => drawBird();
  requestAnimationFrame(update);
  setInterval(placePipes, 1000);

  // Keyboard controls
  document.addEventListener("keydown", moveBird);

  // Touch controls
  board.addEventListener("touchstart", moveBirdOnTouch);
};

function update() {
  if (gameOver) return;

  context.clearRect(0, 0, board.width, board.height);
  requestAnimationFrame(update);

  // Apply gravity and update bird position
  velocityY += gravity;
  bird.y = Math.max(bird.y + velocityY, 0);

  if (bird.y > boardHeight) gameOver = true;

  drawBird();

  // Draw and update pipes
  pipeArray = pipeArray.filter((pipe) => pipe.x + pipe.width > 0);
  pipeArray.forEach((pipe) => {
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5;
      pipe.passed = true;
    }

    if (detectCollision(bird, pipe)) {
      hitSound.play();
      gameOver = true;
    }
  });

  // Display score
  drawScore();

  if (gameOver) displayGameOver();
}

function placePipes() {
  if (gameOver) return;

  let randomPipeY = -(pipeHeight / 4) - Math.random() * (pipeHeight / 2);
  let openingSpace = board.height / 4;

  pipeArray.push({
    img: topPipeImg,
    x: boardWidth,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false
  });

  pipeArray.push({
    img: bottomPipeImg,
    x: boardWidth,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false
  });
}

function moveBird(e) {
  if (["Space", "ArrowUp", "KeyX"].includes(e.code)) {
    if (bgm.paused) {
      bgm.play();
    }

    wingSound.play();
    velocityY = -6;

    if (gameOver) {
      resetGame();
    }
  }
}

// Handle touch input
function moveBirdOnTouch() {
  if (!gameOver) {
    velocityY = -6;
  } else {
    resetGame();
  }
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
  context.fillText(score, 5, 45);
}

function displayGameOver() {
  context.fillText("GAME OVER!", 45, 90);
  bgm.pause();
}

function resetGame() {
  bird.y = birdY;
  pipeArray = [];
  score = 0;
  gameOver = false;
  velocityY = 0;
  requestAnimationFrame(update); // Restart game loop
}
