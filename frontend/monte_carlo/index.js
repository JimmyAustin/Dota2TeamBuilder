'use strict'

const util = require('util')
const Game_DOTA = require('./game-DOTA.js')
const MonteCarlo = require('./monte-carlo.js')

// Setup

let game = new Game_DOTA()
let mcts = new MonteCarlo(game)

let state = game.start()
let winner = game.winner(state)

// From initial state, play games until end

while (winner === null) {

  console.log()
  console.log("player: " + (state.player === 1 ? 1 : 2))
  console.log(state.board.map((row) => row.map((cell) => cell === -1 ? 2 : cell)))

  mcts.runSearch(state, 1)

  let stats = mcts.getStats(state)
  console.log(util.inspect(stats, {showHidden: false, depth: null}))

  let play = mcts.bestPlay(state, "robust")
  console.log("chosen play: " + util.inspect(play, {showHidden: false, depth: null}))

  state = game.nextState(state, play)
  winner = game.winner(state)
}

console.log()
console.log("winner: " + (winner === 1 ? 1 : 2))
console.log(state.board.map((row) => row.map((cell) => cell === -1 ? 2 : cell)))
