import Actor from '../base.js';

export default class Item extends Actor {
  isConsumed = false;

  constructor(gameMap, balance = {}) {
    super(gameMap);
    Object.assign(this, balance);
  }

  tick(ms, n, optOwner) {
    this.isConsumed = !!optOwner;
    super.tick(ms, n);
    if (this.isConsumed) this.tickConsumed(ms, optOwner);
    else this.tickOnMap(ms);
  }

  tickOnMap(_ms) { };
  tickConsumed(_ms, _owner) { };
}