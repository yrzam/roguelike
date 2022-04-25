import Character from './base.js';
import Player from './player.js';
import constants from '../../constants.js';
import { randomInArr, getDistanceToPlayer, findPathToPlayer } from '../../utils.js';
import GameMap from '../../map.js';

export default class Enemy extends Character {
  _chosenDirection;

  constructor(gameMap, balance) {
    super(gameMap, Object.assign({
      speed: 5,
      health: 50
    }, balance));
  }

  chooseDirection() {
    const pos = this._gameMap.findActorPos(this);

    if (getDistanceToPlayer(pos, this._gameMap) > constants.enemyViewDistance) {
      if (Math.random() < 0.2 ||
        (this._chosenDirection && this._gameMap.peekTile(this, this._chosenDirection).obj)) {
        this._chosenDirection = GameMap.Directions[
          randomInArr(Object.keys(GameMap.Directions))
        ]
      }
    }

    else {
      // pathfinding
      findPathToPlayer(pos, this._gameMap, (path) => {
        let nextStep = path?.[1];
        if (!nextStep) return;
        if (nextStep.x < pos.x) this._chosenDirection = GameMap.Directions.LEFT;
        if (nextStep.x > pos.x) this._chosenDirection = GameMap.Directions.RIGHT;
        if (nextStep.y > pos.y) this._chosenDirection = GameMap.Directions.DOWN;
        if (nextStep.y < pos.y) this._chosenDirection = GameMap.Directions.UP;
      })
    }
  }

  pfTick() {
    if (!this.isAlive) return;
    this.chooseDirection();
  }

  tick(ms, n) {
    if (!this.isAlive) return;
    if (n % Math.round(constants.tps / 2) === 0) {
      this.qAttack(this._gameMap.findActorsByClassName(Player).map(el => el.v));
    }

    if (this._chosenDirection) this.qMove(this._chosenDirection);
    super.tick(ms, n);
  }
}