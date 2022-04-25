import Character from '../characters/base.js';
import Item from './base.js';

export default class Sword extends Item {
  strength;
  _bound = false;

  constructor(gameMap, balance) {
    balance = Object.assign({
      strength: 10,
    }, balance);
    super(gameMap, balance);
    Object.assign(this, balance);
  }

  tickConsumed(ms, owner) {
    if (owner instanceof Character && !this.bound) {
      owner.dpkick += this.strength;
      this.bound = true;
    }
  }
}