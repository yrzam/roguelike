export default class Actor {
  id = Math.random().toString(16).slice(2);
  _gameMap;

  constructor(gameMap) {
    this._gameMap = gameMap;
    this.spawn();
  }

  spawn() {
    this._gameMap.addActorToRandomPlace(this);
  }

  despawn() {
    this._gameMap.removeActor(this);
  }

  canConsume(_actor) { return false };
  consume(_actor) { };
  disuse(_actor) { };

  toNewMap(gameMap) {
    this._gameMap = gameMap;
    this.spawn();
  }

  tick(_ms, _n) { }

}