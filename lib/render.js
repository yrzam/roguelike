import Player from './actors/characters/player.js';
import Enemy from './actors/characters/enemy.js';
import Character from './actors/characters/base.js';
import Sword from './actors/items/sword.js';
import Heal from './actors/items/heal.js';

export default class RenderEngine {
  _mapCache = [[]];
  _inventoryCache = {};   // name: quantity
  _conf;
  _gameMap;
  _player;

  constructor(gameMap, player) {
    const tileProps = window.getComputedStyle(document.querySelector('.tile'));
    this._conf = {
      elWidth: parseInt(tileProps.width),
      elHeight: parseInt(tileProps.height)
    }
    this.bindMap(gameMap);
    this.bindPlayer(player);
    document.getElementById('field').innerHTML = '';
    document.getElementById('inventory').innerHTML = '';
  }

  bindMap(gameMap) {
    this._gameMap = gameMap;
    const f = document.getElementById('field')
    f.style.width = gameMap.dimensions.x * this._conf.elWidth + 'px';
    f.style.height = gameMap.dimensions.y * this._conf.elHeight + 'px';
    const inv = document.getElementById('inventory');
    inv.style.width = f.style.width;
  }

  bindPlayer(player) {
    this._player = player;
  }

  render() {
    const diff = this._mapCacheDelta(this._gameMap.map);
    //    console.log(`Render map: el count: ${document.getElementById('field').childElementCount
    //      }, updated:  base ${diff.base.length}, actors ${diff.actors.length}`);
    this._renderMapBase(diff.base);
    this._renderMapActors(diff.actors);
    this._renderInventory(this._invCacheDelta(this._player.inventory));
  }

  _renderMapBase(diffArr) {
    diffArr.forEach(({ x, y, v }) => {
      const el = document.createElement('div');
      el.className = v ? 'tileW' : 'tile';
      el.id = `tile${x}.${y}`
      el.style.top = y * this._conf.elHeight + 'px';
      el.style.left = x * this._conf.elWidth + 'px';
      document.getElementById(`tile${x}.${y}`)?.remove();
      document.getElementById('field').appendChild(el);
    })
  }

  _renderMapActors(diffArr) {
    diffArr.forEach(({ x, y, v, del }) => {
      if (del) return document.getElementById(`actor${v.id}`)?.remove();
      let el = document.getElementById(`actor${v.id}`);
      let isNew = false;
      if (!el) {
        isNew = true;
        el = document.createElement('div');
        el.id = `actor${v.id}`;

        if (v instanceof Player) el.className = 'tileP';
        else if (v instanceof Enemy) el.className = 'tileE';
        else if (v instanceof Sword) el.className = 'tileSW';
        else if (v instanceof Heal) el.className = 'tileHP';

      }
      el.style.top = y * this._conf.elHeight + 'px';
      el.style.left = x * this._conf.elWidth + 'px';

      if (v instanceof Character) {
        const hStr = `${Math.round(v.health / v.maxHealth * 100)}%`;
        if (!isNew) el.firstElementChild.style.width = hStr;
        else {
          const hBar = document.createElement('div');
          hBar.className = 'health'
          hBar.style.width = hStr;
          el.appendChild(hBar);
        }
      }
      if (isNew) {
        document.getElementById('field').appendChild(el);
      }
    })
  }

  _renderInventory(diff) {
    Object.entries(diff).forEach(([k, v]) => {
      let el = document.getElementById(`inv${k}`);
      if (!v) return el?.remove();
      if (!el) {
        el = document.createElement('span');
        el.id = `inv${k}`;
        const tile = document.createElement('div');
        tile.className = 'img ';

        if (k === 'Sword') tile.className += 'tileSW';
        else if (k === 'Heal') tile.className += 'tileHP';

        const num = document.createElement('div');
        num.className = 'invnum';
        num.innerHTML = v;

        el.appendChild(tile);
        el.appendChild(num)
        document.getElementById('inventory').appendChild(el);
      }
      else el.querySelector('.invnum').innerHTML = v
    })
  }

  _mapCacheDelta(mp) {
    let diff = {
      base: [],
      actors: []
    }
    mp.forEach((r, y) => r.forEach((v, x) => {
      if (y >= this._mapCache.length || x >= this._mapCache[0].length) {
        diff.base.push({ x, y, v: v?.type === 'wall' });
        if (v?.type === 'actor') diff.actors.push({ x, y, v: v.value });
        return;
      }
      const p = this._mapCache[y][x];
      if ((v?.type === 'wall') !== (p?.type === 'wall'))
        diff.base.push({ x, y, v: v?.type === 'wall' });
      if (v?.value?.id !== p?.value?.id
        || v?.value?.health !== p?.value?.health
        || v?.value?.maxHealth !== p?.value?.maxHealth) {
        if (v?.value && p?.value) {
          diff.actors.push({ x, y, v: v.value, prev: null });
          diff.actors.push({ x, y, v: null, prev: p.value });
        }
        else diff.actors.push({ x, y, v: v?.value, prev: p?.value });
      }
    }));
    diff.actors = diff.actors.filter((el) => {
      if (el.prev?.id && !diff.actors.some(({ v }) => v?.id === el.prev?.id)) {
        el.del = true;
        el.v = el.prev;
      }
      return el.v;
    })
    this._mapCache = mp.map((r) => r.map((v) =>
      v?.type === 'actor' ? {
        type: 'actor', value: {
          id: v.value.id,
          health: v.value.health, maxHealth: v.value.maxHealth
        }
      } : v
    ));
    return diff;
  }

  _invCacheDelta(inv) {
    const viewable = {};
    inv.forEach(el => {
      if (!(el.constructor.name in viewable)) viewable[el.constructor.name] = 0
      ++viewable[el.constructor.name];
    });
    let diff = {};
    new Set([...Object.keys(viewable), ...Object.keys(this._inventoryCache)]).forEach(k => {
      if (viewable[k] !== this._inventoryCache[k]) diff[k] = viewable[k] || 0;
    })
    this._inventoryCache = JSON.parse(JSON.stringify(({}, viewable)));
    return diff;
  }
}