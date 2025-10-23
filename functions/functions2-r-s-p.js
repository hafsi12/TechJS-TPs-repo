let score = JSON.parse(localStorage.getItem('score')) || {
  wins: 0,
  losses: 0,
  ties: 0
};

updateScoreElement();

// Event listeners pour les boutons
document.querySelector('.js-rock-button')
  .addEventListener('click', () => {
    playGame('rock');
  });

document.querySelector('.js-paper-button')
  .addEventListener('click', () => {
    playGame('paper');
  });

document.querySelector('.js-scissors-button')
  .addEventListener('click', () => {
    playGame('scissors');
  });

// Support clavier (r, p, s)
document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (key === 'r') playGame('rock');
  if (key === 'p') playGame('paper');
  if (key === 's') playGame('scissors');
});

function playGame(playerMove) {
  const computerMove = pickComputerMove();

  let result = '';

  // calcul du résultat
  if (playerMove === computerMove) {
    result = "Tie.";
    score.ties += 1;
  } else if (
    (playerMove === 'rock' && computerMove === 'scissors') ||
    (playerMove === 'paper' && computerMove === 'rock') ||
    (playerMove === 'scissors' && computerMove === 'paper')
  ) {
    result = "You win!";
    score.wins += 1;
  } else {
    result = "You lose.";
    score.losses += 1;
  }

  // Sauvegarde du score
  localStorage.setItem('score', JSON.stringify(score));
  updateScoreElement();

  // Affichage du résultat (texte)
  const resultElement = document.querySelector('.js-result');
  resultElement.textContent = result;

  // Affichage des coups (avec icônes si disponibles)
  const movesElement = document.querySelector('.js-moves');
  const playerImg = `<img src="images/${playerMove}-emoji.png" class="move-icon" alt="${playerMove}">`;
  const computerImg = `<img src="images/${computerMove}-emoji.png" class="move-icon" alt="${computerMove}">`;
  movesElement.innerHTML = `You: ${playerImg} &nbsp;&nbsp; Computer: ${computerImg}`;
}

function updateScoreElement() {
  document.querySelector('.js-score')
    .innerHTML = `Wins: ${score.wins}, Losses: ${score.losses}, Ties: ${score.ties}`;
}

function pickComputerMove() {
  const randomNumber = Math.random();

  let computerMove = '';

  if (randomNumber >= 0 && randomNumber < 1 / 3) {
    computerMove = 'rock';
  } else if (randomNumber >= 1 / 3 && randomNumber < 2 / 3) {
    computerMove = 'paper';
  } else {
    computerMove = 'scissors';
  }

  return computerMove;
}

let isAutoplaying = false ;
let intervalId ; // sert a stocker l'idetifiant du miniteur

function autoPlay(){
     if(!isAutoplaying) {
        isAutoplaying = true ;
        intervalId = setInterval(()=> { // lance une part chaque seconde
             const playerMove = pickComputerMove();
             playGame(playerMove) ;

        } , 1000 ) ;
        console.log("auto play active") ;
     }else {
      clearInterval(intervalId) ;
      isAutoplaying = false ;
      console.log("auto play desactive") ;
     }

}
