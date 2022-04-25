import Actor from './actors/base.js';
import { randomInRange, randomInArr } from './utils.js';

export default class GameMap {
  map = [[]];

  static Directions = {
    UP: 'up',
    DOWN: 'down',
    RIGHT: 'right',
    LEFT: 'left'
  }

  constructor() {
    this._generate();
  }

  addActorToRandomPlace(actor) {
    const flattenPos =
      Array(this.dimensions.x * this.dimensions.y).fill().map((_, i) => i)
        .filter(i =>
          !this.map[Math.floor(i / this.dimensions.x)][i % this.dimensions.x]);
    const i = randomInArr(flattenPos);
    this.map[Math.floor(i / this.dimensions.x)][i % this.dimensions.x] = {
      type: 'actor',
      value: actor
    };
  }

  removeActor(actor) {
    this.map.some((r, y) => r.some((v, x) => {
      if (v?.value?.id === actor.id) {
        this.map[y][x] = null;
        return true
      }
    }))
  }

  moveActor(actor, direction) {
    const pos = this.findActorPos(actor);
    if (!pos) throw new Error('No actor');
    const peek = this.peekTile(pos, direction);
    if (!peek.obj || (peek.obj?.type === 'actor' && actor.canConsume(peek.obj.value))) {
      if (peek.obj) {
        actor.consume(peek.obj.value);
        this.map[peek.toPos.y][peek.toPos.x] = null;
      }
      [this.map[pos.y][pos.x], this.map[peek.toPos.y][peek.toPos.x]] =
        [this.map[peek.toPos.y][peek.toPos.x], this.map[pos.y][pos.x]];
    }
  }

  peekTile(actorOrCoord, direction) {
    const pos = actorOrCoord instanceof Actor
      ? this.findActorPos(actorOrCoord) : actorOrCoord;
    if (!pos) throw new Error('No actor');
    const newPos = {
      y: direction === GameMap.Directions.UP
        ? pos.y - 1 : direction === GameMap.Directions.DOWN
          ? pos.y + 1 : pos.y,
      x: direction === GameMap.Directions.LEFT
        ? pos.x - 1 : direction === GameMap.Directions.RIGHT
          ? pos.x + 1 : pos.x
    }
    if (!pos) throw new Error('No actor');
    if (newPos.x < 0 || newPos.x >= this.dimensions.x
      || newPos.y < 0 || newPos.y >= this.dimensions.y)
      return { type: 'wall', toPos: newPos };
    return {
      toPos: newPos,
      obj: this.map[newPos.y][newPos.x]
    }
  }

  viewNear(actorOrCoord) {
    const pos = actorOrCoord instanceof Actor
      ? this.findActorPos(actorOrCoord) : actorOrCoord;
    if (!pos) throw new Error('No actor');
    let near = [];
    for (let y = 0; y < 3; ++y) {
      near.push([]);
      for (let x = 0; x < 3; ++x) {
        const target = { y: pos.y + y - 1, x: pos.x + x - 1 };
        if (target.x < 0 || target.x >= this.dimensions.x
          || target.y < 0 || target.y >= this.dimensions.y)
          near[y].push({ type: 'wall' });
        else near[y].push(this.map[target.y][target.x]);
      }
    }
    return near;
  }

  findActorPos(actor) {
    let pos;
    this.map.some((r, y) => r.some((v, x) => {
      if (v?.value?.id === actor.id) {
        pos = { x, y };
        return true;
      }
    }));
    return pos;
  }

  findActorsByClassName(cl) {
    const res = [];
    this.map.forEach((r, y) => r.forEach((v, x) => {
      if (v?.value instanceof cl) res.push({ x, y, v: v.value });
    }))
    return res;
  }

  _generate() {
    this.map = Array(20).fill().map(() => Array(32).fill({ type: 'wall' }));
    this._genPassages(true);
    this._genPassages(false);
    Array(randomInRange(5, 11)).fill().forEach(() => this._genRoom());
  }

  _genPassages(isHorizontal) {
    let pPassages = Array(isHorizontal
      ? this.dimensions.y : this.dimensions.x)
      .fill().map((_, i) => i);
    const passCount = randomInRange(3, 6)
    for (let i = 0; i < passCount; ++i) {
      const v = randomInArr(pPassages);
      pPassages = pPassages.filter(el => el < v - 1 || el > v + 1);
      if (isHorizontal) this.map[v].fill(null);
      else this.map.forEach(r => { r[v] = null })
    }
  }

  _genRoom() {
    const w = randomInRange(3, 9);
    const h = randomInRange(3, 9);
    let x, y;
    do {
      x = randomInRange(0, this.dimensions.x - w + 1);
      y = randomInRange(0, this.dimensions.y - h + 1);
    } while (!(() => {
      for (let wy = y; wy < y + h; ++wy)
        for (let wx = x; wx < x + w; ++wx) {
          if (!this.map[wy][wx]) return true;
        }
    })());
    for (let wy = y; wy < y + h; ++wy)
      for (let wx = x; wx < x + w; ++wx)
        this.map[wy][wx] = null;
  }

  get dimensions() {
    return { x: this.map[0].length, y: this.map.length }
  }

  get actors() {
    return this.map.flat().filter(el => el?.value instanceof Actor).map(el => el.value)
  }

}