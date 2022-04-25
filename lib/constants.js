const constants = {
  // NOTE: For low tick rates, please avoid (tps % character speed === 0) due
  // to animation inconsistency. You must also set tps >= any character speed.
  // This is because of movement queue implementation (may be changed in the future).
  tps: 8,
  enemyViewDistance: 6,
  balance: {
    base: {
      enemyHealth: 50,
      playerHealth: 100,
      enemyStrength: 5
    },
    increase: {
      enemyHealth: 60,
      playerHealth: 10,
      enemyStrength: 5
    }
  }
  // TODO expose other balance data
}

export default constants;