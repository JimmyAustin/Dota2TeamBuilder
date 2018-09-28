import React, { Component } from 'react';
import heroes from 'config/heroes'
import ReactTooltip from 'react-tooltip'
class PickOrderRow extends Component {
  constructor() {
    super();
  }

  render() {
    var hero_info = null;
    return (
      <div style={row_style(this.props.row_type)}>
        {this.props.row_type.team} - {this.props.row_type.pick_type}
        {this.props.hero && <img 
          style={{filter: this.props.provisional ? 'grayscale(100%)' : ''}}
          data-tip={this.props.hero.NAME} 
          src={'/images/' + this.props.hero.NAME + '.png'}></img>}
      </div>
    );
  }
}

var row_style = (x) => {
  if (x.pick_type == 'pick') {
    if (x.team == 'radiant') {
      return {background: 'lightgreen'}
    } else {
      return {background: 'lightcoral'}
    }
  } else {
    if (x.team == 'radiant') {
      return {background: 'darkgreen'}
    } else {
      return {background: 'darkred'}
    
    }  
  }
  var light_dark = x.pick_type == 'pick' ? 'light' : 'dark';
  var color = x.team == 'radiant' ? 'green' : 'red';
  return light_dark + color;
}

export default PickOrderRow;

//<ReactTooltip />