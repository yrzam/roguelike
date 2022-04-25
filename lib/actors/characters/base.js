import Actor from '../base.js';

export default class Character extends Actor {
  maxHealth = 100;
  health = 100;
  speed = 1;
  dpkick = 10;
  kickps = 1;
  inventory = [];

  nextTickOps = {
    attack: {
      targets: [],
      prevAgo: 0
    },
    move: {
      direction: null,
      prevAgo: 0
    },
  }

  constructor(gameMap, balance = {}) {
    super(gameMap);
    Object.assign(this, balance);
    if (balance.health && !balance.maxHealth) this.maxHealth = this.health;
    else if (balance.maxHealth && !balance.health) this.health = this.maxHealth;
  }

  qAttack(characters) {
    if (!this.isAlive) return;
    this.nextTickOps.attack.targets =
      Array.isArray(characters) ? characters : [characters];
  }

  qMove(direction) {
    if (!this.isAlive) return;
    const peek = this._gameMap.peekTile(this, direction);
    if (!(peek.obj instanceof Character) && peek.type !== 'wall')
      this.nextTickOps.move.direction = direction;
  }

  qCancelMove() {
    this.nextTickOps.move.direction = null;
  }

  getDamage(hp) {
    this.health -= hp;
    if (!this.isAlive) this._gameMap.removeActor(this);
  }

  tick(ms, n) {
    if (!this.isAlive) return;
    this.inventory.forEach((el) => el.tick(ms, n, this));

    this.nextTickOps.attack.prevAgo += ms;
    this.nextTickOps.move.prevAgo += ms;
    if (this.nextTickOps.move.direction
      && this.nextTickOps.move.prevAgo > 1000 / this.speed) {
      this._gameMap.moveActor(this, this.nextTickOps.move.direction);
      this.nextTickOps.move.direction = null;
      this.nextTickOps.move.prevAgo = 0;
    }
    if (this.nextTickOps.attack.targets.length
      && this.nextTickOps.attack.prevAgo > 1000 / this.kickps) {
      const nearIds = this._gameMap.viewNear(this).flat()
        .map(el => el?.value?.id).filter(el => el);
      this.nextTickOps.attack.targets.filter(el => nearIds.includes(el.id))
        .forEach(el => el.getDamage(this.dpkick));
      this.nextTickOps.attack.targets = [];
      this.nextTickOps.attack.prevAgo = 0;
    }

    super.tick(ms, n);
  }

  consume(actor) {
    this.inventory.push(actor);
  }

  disuse(actor) {
    this.inventory = this.inventory.filter(el => el.id !== actor.id);
  }

  get isAlive() {
    return this.health > 0;
  }
}