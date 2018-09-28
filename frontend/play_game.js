MCTS = require('mcts').MCTS;

function Game() {
  this.winner = null;
}

Game.prototype.getPossibleMoves = function () {
  if (this.winner === null) {
    return [0];
  }
  return [];
};

Game.prototype.getCurrentPlayer = function () {
  return 0;
};
 
Game.prototype.performMove = function (player) {
  this.winner = player;
};

Game.prototype.getWinner = function () {
  return this.winner;
};

var mcts = new MCTS(new Game());
console.log(mcts.selectMove());
