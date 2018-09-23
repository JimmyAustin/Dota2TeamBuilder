import React, { Component } from 'react';
import runFunc from './evaluate_game.js';
import DotaTree from './DotaTree.js'

class App extends Component {
  constructor(props) {
    //runFunc();
    var tree = new DotaTree();
    tree.step()
    tree.step()
    tree.step()
    console.log(tree.best_option_chain())
    debugger;
    super()

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
