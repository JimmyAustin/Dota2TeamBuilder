import React, { Component } from 'react';
import runFunc from './evaluate_game.js';
import treeWorker from './dota_tree_handler.worker';

const steps_before_checkin = 50;

class DotaCalculatorController extends Component {
  constructor(props) {
    super()


    const treeHandler = new treeWorker();

    treeHandler.addEventListener('message', (event) => {
      console.log(event.data)
      if (event.data.state == 'FINISHED') {
        if (this.state.running == true) {
          this.start_calculations()
        }
      } else if (event.data.state == 'UPDATE') {
        this.setState({best_picks: event.data.current_best,
                       step_count: event.data.step_count, 
                       simmed_game_count: event.data.simmed_game_count})
      } else if (event.data.state == 'MODEL_READY') {
        this.setState({ready: true})
      }
    });

    this.state = {
      running: false,
      ready: false,
      step_count: 0,
      max_count: 0,
      best_picks: [],
      simmed_game_count: 0,
      worker: treeHandler
    }

    // const worker = new myWorker();
    // worker.postMessage(this.state.counter);
    // worker.addEventListener('message', event => this.setState({counter: event.data}));
    this.current_state = this.current_state.bind(this);
    this.start_calculations = this.start_calculations.bind(this);
    this.toggle_calculations = this.toggle_calculations.bind(this);
  }

  toggle_calculations() {
    console.log(this.state.running)
    if (this.state.running == true) {
      this.setState({running: false})
    } else {
      this.setState({running: true})
      this.start_calculations()
    }
  }

  start_calculations() {
    this.setState({max_count: this.state.max_count + steps_before_checkin})
    this.state.worker.postMessage({func: 'runCalculations', max_step_count: steps_before_checkin});    
  }

  current_state() {
    if (this.state.ready == false) {
      return 'Loading Model';
    }
    if (this.state.running) {
      return 'Running';
    } else {
      return 'Ready';
    }
  }

  render() {
    return (
      <div>
        Status: {this.current_state()}
        <br/>
        Step Count: {this.state.step_count}
        <br/>
        Max Count: {this.state.max_count}
        <br/>
        Best: {this.state.best_picks}
        <br/>
        simmed_game_count: {this.state.simmed_game_count}
        <br/>
        <button onClick={this.toggle_calculations} disabled={this.state.ready == false}>
            {this.state.running ? 'Stop' : 'Start'}
        </button>
      </div>
    );
  }
}

export default DotaCalculatorController;
