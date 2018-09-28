'use strict'

/** Class representing a state transition. */
class Play_DOTA {
  constructor(hero_id) {
    this.hero_id = hero_id
  }

  hash() {
    return this.hero_id.toString()
  }
}

module.exports = Play_DOTA
