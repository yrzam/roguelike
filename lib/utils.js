import { EasyStar } from './3p/easystar.js';
import Player from './actors/characters/player.js';

// [a, b)
export function randomInRange(a, b) {
  return a + Math.floor(Math.random() * (b - a));
}

export function randomInArr(arr) {
  return arr[randomInRange(0, arr.length)];
}

export function getDistanceToPlayer(fromPos, gameMap) {
  const toPos = gameMap.findActorsByClassName(Player)?.[0];
  if (!fromPos || !toPos) return;
  return Math.sqrt(Math.pow(toPos.x - fromPos.x, 2) + Math.pow(toPos.y - fromPos.y, 2));
}

const pathfinder = new EasyStar.js();
pathfinder.setAcceptableTiles(0);

export function findPathToPlayer(fromPos, gameMap, cb) {
  const toPos = gameMap.findActorsByClassName(Player)?.[0];
  if (!fromPos || !toPos) return;
  pathfinder.findPath(fromPos.x, fromPos.y, toPos.x, toPos.y, cb);
}

export function pathFinderTick(gameMap) {
  pathfinder.setGrid(gameMap.map.map((r) => r.map(
    (v) => v && !(v?.value instanceof Player) ? 1 : 0)));
  gameMap.actors.forEach((a) => a.pfTick?.());
  pathfinder.calculate();
}