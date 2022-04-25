import RenderEngine from './render.js'
import GameMap from './map.js'
import Player from './actors/characters/player.js';
import Enemy from './actors/characters/enemy.js';
import Sword from './actors/items/sword.js';
import Heal from './actors/items/heal.js';
import Character from './actors/characters/base.js';
import constants from './constants.js';
import { pathFinderTick } from './utils.js';

export default class Game {
  isOver = false;
  isPaused = false;

  _gameMap;
  _re;
  _player;
  level = 0;
  events;

  constructor(listener) {
    this.events = listener || new EventTarget();
    this._newLevel(0);
    this._loop();
    this.events.dispatchEvent(new Event('start'));
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this._loop();
  }

  _newLevel(n) {
    const b = constants.balance;

    this._gameMap = new GameMap();
    if (!this._player) {
      this._player = new Player(this._gameMap, { health: b.base.playerHealth });
      this._re = new RenderEngine(this._gameMap, this._player);
    }
    else {
      this._re.bindMap(this._gameMap);
      this._player.toNewMap(this._gameMap);
    }
    this.events.dispatchEvent(new CustomEvent('newLevel', { detail: { userLevel: n + 1 } }));

    for (let i = 0; i < 10; ++i) new Enemy(this._gameMap, {
      health: b.base.enemyHealth + n * b.increase.enemyHealth,
      dpkick: b.base.enemyStrength + n * b.increase.enemyStrength,
    });
    for (let i = 0; i < 2; ++i) new Sword(this._gameMap);
    for (let i = 0; i < 10; ++i) new Heal(this._gameMap);

    if (n) this._player.maxHealth += b.increase.playerHealth;
  }

  async _loop() {
    let t = 1000 / constants.tps;
    let tick = 0;
    while (!this.isOver && !this.isPaused) {
      const prevT = Date.now();
      if (tick % (constants.tps * 2) === 0) {  // check every 2s (due to performance impact)
        if (!this._player.isAlive) { this.over(); return; };
        if (this._levelEnded()) this._newLevel(++this.level);
      }

      pathFinderTick(this._gameMap);
      this._gameMap.actors.forEach((a) => a.tick(t, tick));
      this._re.render();
      console.log(t);

      await new Promise((r) => setTimeout(r,
        Math.max(0, 2 * 1000 / constants.tps - this._avgTickTime(t))));
      ++tick;
      t = Date.now() - prevT;
    }
  }

  _tickPeriods = [];
  _avgTickTime(currentMs) {
    this._tickPeriods.push(currentMs);
    if (this._tickPeriods.length > constants.tps * 5) this._tickPeriods.shift();
    return this._tickPeriods.reduce((a, b) => a + b, 0) / this._tickPeriods.length;
  }

  _levelEnded() {
    if (this._gameMap.actors.filter(el => el instanceof Character).length === 1) {
      this._gameMap.actors.forEach((el) => {  // consume all items left
        if (this._player.canConsume(el)) this._player.consume(el);
      })
      return true;
    }
    return false;
  }

  over() {
    this.isOver = true;
    this.events.dispatchEvent(new CustomEvent('over',
      { detail: { userLevel: this.level + 1 } }));
  }

}