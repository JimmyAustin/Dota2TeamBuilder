import React, { Component } from 'react';
import runFunc from './evaluate_game.js';
import treeWorker from './dota_tree_handler.worker';

const steps_before_checkin = 50;

class MatchRateCounter extends Component {
  constructor(props) {
    super()
    this.window = 5
    this.state = {
      rates: [[props['simmed_game_count'], Date.now()]]
    }
  }

  rate() {
    var start = this.state.rates[0]
    var end = this.state.rates[this.state.rates.length - 1]
    var timediff_in_seconds =  (end[1] - start[1]) / 1000;
    return (end[0] - start[0]) / (timediff_in_seconds) 
  }

  componentWillReceiveProps(props) {
    var new_rate = [[props['simmed_game_count'], Date.now()]]
    var rates = new_rate.concat(this.state.rates).slice(0, this.window)
    this.setState({rates: rates})
  }

  render() {
    return (
      <div>
        simmed_game_count: {this.props.simmed_game_count}
        <br/>
        rate: {this.rate()}
      </div>
    );
  }
}

export default MatchRateCounter;
