import React, { Component } from 'react';
import runFunc from './evaluate_game.js';
import treeWorker from './dota_tree_handler.worker';
import MatchRateCounter from './MatchRateCounter.js';

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
        if (this.props.provisional_callback) {
          var choices = event.data.current_best.map((x) => { return x.choice });
          this.props.provisional_callback(choices);
        }
        this.setState({best_picks: event.data.current_best.map((x) => { return x.choice }),
                       step_count: event.data.step_count, 
                       simmed_game_count: event.data.simmed_game_count})
      } else if (event.data.state == 'MODEL_READY') {
        this.setState({ready: true})
      } else if (event.data.state == 'COMPLETE_FINISHED') {
        this.setState({finished: true, running: false, ready: true})
      }
    });

    this.state = {
      finished: false,
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
    this.update_worker_state = this.update_worker_state.bind(this);

    this.update_worker_state(props)
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

  componentWillReceiveProps(props) {
    if (this.props.radiant_heroes != props.radiant_heroes ||
        this.props.dire_heroes != props.dire_heroes ||
        this.props.radiant_bans != props.radiant_bans ||
        this.props.dire_bans != props.dire_bans) {
      this.update_worker_state(props)

    }
  }

  update_worker_state(state) {
    var updated_state = state || this.props;
    this.state.worker.postMessage({
      func: 'updateBaseState', 
      radiant_heroes: updated_state.radiant_heroes,
      dire_heroes: updated_state.dire_heroes,
      radiant_bans: updated_state.radiant_bans,
      dire_bans: updated_state.dire_bans,
      selection_order: updated_state.selection_order    
    });
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
        <MatchRateCounter simmed_game_count={this.state.simmed_game_count}/>
        <br/>
        <button onClick={this.toggle_calculations} disabled={this.state.ready == false || this.state.finished == true}>
            {this.state.running ? 'Stop' : 'Start'}
        </button>
      </div>
    );
  }
}

export default DotaCalculatorController;
