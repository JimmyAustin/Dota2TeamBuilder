import React, { Component } from 'react';
import runFunc from './evaluate_game.js';
import DotaTree from './DotaTree.js'
import myWorker from './test.worker';
import DotaCalculatorController from './DotaCalculatorController.js';


class App extends Component {
  constructor(props) {
    //runFunc();
    var count = 0
    
    super()

    // const worker = new myWorker();
    // worker.postMessage(this.state.counter);
    // worker.addEventListener('message', event => this.setState({counter: event.data}));
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          <DotaCalculatorController />
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
