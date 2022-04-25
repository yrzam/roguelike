import Game from './game.js';

function displ(id, state) {
  document.getElementById(id).style.display = state;
}

let game;
const listener = new EventTarget();

function init(event) {
  if (event.code !== 'Space') return;
  window.removeEventListener('keydown', init);
  window.addEventListener('keydown', pause);
  [...document.getElementsByClassName('pregame')].forEach((el) => el.style.display = 'none');
  displ('game', 'block');
  game = new Game(listener);
}

listener.addEventListener('newLevel', ({ detail }) => {
  document.getElementById('levelnum').innerHTML = detail.userLevel;
})

listener.addEventListener('over', ({ detail }) => {
  displ('game', 'none');
  displ('gameover', 'block');
  document.getElementById('finallvl').innerHTML = detail.userLevel;
  window.removeEventListener('keydown', pause);
  window.addEventListener('keydown', init);
});

function pause(event) {
  if (!game) return;
  if (event.code === 'KeyP') {
    game.pause();
    displ('pause', 'block');
    displ('inv-area', 'none');
  }
  else if (event.code === 'Space' && game.isPaused) {
    displ('pause', 'none');
    displ('inv-area', 'block');
    game.resume();
  }
}

window.addEventListener('keydown', init);