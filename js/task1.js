const MIN_PRICE = 10;
const MAX_PRICE = 99;
const START_LIVES = 3;
const START_PRICE = 48;

let currentPrice = START_PRICE;
let lives = START_LIVES;
let streak = 0;
let bestStreak = 0;
let round = 1;
let gameIsActive = true;

const priceElement = document.querySelector('#current-price');
const livesElement = document.querySelector('#lives');
const streakElement = document.querySelector('#streak');
const bestStreakElement = document.querySelector('#best-streak');
const roundElement = document.querySelector('#round-number');
const messageElement = document.querySelector('#game-message');
const statusElement = document.querySelector('#game-status');
const buttonsElement = document.querySelector('#game-actions');
const restartButton = document.querySelector('#restart-game');

function getRandomPrice() {
  const numberOfPrices = MAX_PRICE - MIN_PRICE + 1;
  return Math.floor(Math.random() * numberOfPrices) + MIN_PRICE;
}

function showGameState() {
  priceElement.textContent = currentPrice;
  livesElement.textContent = `${lives} / ${START_LIVES}`;
  streakElement.textContent = streak;
  bestStreakElement.textContent = bestStreak;
  roundElement.textContent = round;

  if (gameIsActive) {
    statusElement.textContent = 'ROUND ACTIVE';
  } else {
    statusElement.textContent = 'ROUND COMPLETE';
  }
}

function endGame() {
  gameIsActive = false;
  messageElement.textContent = `Round over. Best streak: ${bestStreak}.`;
  buttonsElement.classList.add('hidden');
  restartButton.classList.remove('hidden');
  showGameState();
}

function makeGuess(event) {
  const clickedButton = event.target.closest('[data-guess]');

  if (!clickedButton) {
    messageElement.textContent = 'This is not a valid move.';
    return;
  }

  if (gameIsActive === false) {
    messageElement.textContent = 'The game is over. Start again first.';
    return;
  }

  const guess = clickedButton.dataset.guess;

  if (guess !== 'higher' && guess !== 'lower') {
    messageElement.textContent = 'Choose Higher or Lower.';
    return;
  }

  const nextPrice = getRandomPrice();
  let isCorrect = false;

  if ((guess === 'higher' && nextPrice >= currentPrice) ||
      (guess === 'lower' && nextPrice <= currentPrice)) {
    isCorrect = true;
  }

  currentPrice = nextPrice;

  if (isCorrect) {
    streak += 1;

    if (streak > bestStreak) {
      bestStreak = streak;
    }

    messageElement.textContent = `Correct. The next price was ${nextPrice}.`;
  } else {
    lives -= 1;
    streak = 0;
    messageElement.textContent = `Not this time. The next price was ${nextPrice}.`;

    if (lives === 0) {
      endGame();
    }
  }

  round += 1;
  showGameState();
}

function restartGame() {
  currentPrice = getRandomPrice();
  lives = START_LIVES;
  streak = 0;
  round = 1;
  gameIsActive = true;

  messageElement.textContent = 'Will the next one be higher or lower?';
  buttonsElement.classList.remove('hidden');
  restartButton.classList.add('hidden');
  showGameState();
}

buttonsElement.addEventListener('click', makeGuess);
restartButton.addEventListener('click', restartGame);
showGameState();