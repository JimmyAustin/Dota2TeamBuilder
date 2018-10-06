import React, { Component } from 'react';
import heroes from './config/heroes'
import ReactTooltip from 'react-tooltip'
class PickOrderRow extends Component {
  constructor() {
    super();
  }

  render() {
    var hero_info = null;
    return (
      <div style={row_style(this.props.row_type)}>
        <div style={{'width': '50px',
                     'position': 'absolute',
                     'padding-top': '3px',
                     'padding-left': '4px',
                     'text-transform': 'uppercase',
                     'text-align': 'left'}}>
          {this.props.row_type.team}
                  <br/>
          {this.props.row_type.pick_type}
        </div>
        <div style={{position: 'absolute',
                     paddingLeft: '80px',
                     paddingTop: '13px'}}>
          {this.props.hero && this.props.hero.HERO}
        </div>
        <div style={{float:'right', height: '44px'}}>
          {hero_row_component(this.props)}
        </div>
      </div>
    );
  }
}

var hero_row_component = (props) => {
  if (props.hero == null) {
    return <div></div>
  }
  return (
    <div>

      <img 
          style={{filter: props.provisional ? 'grayscale(100%)' : '',
                  height: '44px',
                  float: 'right'}}
          data-tip={props.hero.HERO} 
          src={'/images/' + props.hero.NAME + '.png'}>
      </img>
    </div>)
}

var row_style = (x) => {
  var base = {height: '44px'}
  if (x.pick_type == 'pick') {
    if (x.team == 'radiant') {
      base['background'] = 'lightgreen'
    } else {
      base['background'] = 'lightcoral'
    }
  } else {
    if (x.team == 'radiant') {
      base['background'] = 'darkgreen'
    } else {
      base['background'] = 'darkred' 
    }  
  }
  return base
}

export default PickOrderRow;

//<ReactTooltip />