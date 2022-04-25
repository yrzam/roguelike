import Character from '../characters/base.js';
import Item from './base.js';

export default class Heal extends Item {
  healAmount;

  constructor(gameMap, balance) {
    balance = Object.assign({
      healAmount: 50,
    }, balance);
    super(gameMap, balance);
    Object.assign(this, balance);
  }

  tickConsumed(ms, owner) {
    if (owner instanceof Character && owner.health + this.healAmount <= owner.maxHealth) {
      owner.health += this.healAmount;
      owner.disuse(this);
    }
  }
}