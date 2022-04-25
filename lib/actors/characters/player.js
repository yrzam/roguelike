import Character from './base.js';
import Enemy from './enemy.js';
import GameMap from '../../map.js';
import Item from '../items/base.js';

export default class Player extends Character {
  _keysPressed = [];

  constructor(gameMap, balance) {
    super(gameMap, Object.assign({
      speed: 5
    }, balance));
    window.addEventListener('keydown', (event) => this._handleControls(event));
    window.addEventListener('keyup', (event) => this._handleControls(event));
  }

  _handleControls(event) {
    if (event.type === 'keydown') this._keysPressed.push(event.code);
    if (event.type === 'keyup') this._keysPressed = this._keysPressed.filter(el => el !== event.code);
  }

  tick(ms, n) {
    if (!this.isAlive) return;
    this._applyControls();
    super.tick(ms, n);
  }

  _applyControls() {
    this._keysPressed.forEach((k) => {
      switch (k) {
        case 'KeyW':
          this.qMove(GameMap.Directions.UP);
          break;
        case 'KeyA':
          this.qMove(GameMap.Directions.LEFT);
          break;
        case 'KeyS':
          this.qMove(GameMap.Directions.DOWN);
          break;
        case 'KeyD':
          this.qMove(GameMap.Directions.RIGHT);
          break;
        case 'Space':
          this.qAttack(this._gameMap.viewNear(this).flat()
            .filter(el => el?.value instanceof Enemy).map(el => el.value));
          break;
      }
    })
  }

  canConsume(actor) {
    return actor instanceof Item;
  }
}