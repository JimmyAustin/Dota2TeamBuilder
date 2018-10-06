import React, { Component } from 'react';
import heroes from './config/heroes'
import ReactTooltip from 'react-tooltip'
class HeroItem extends Component {
  constructor() {
    super();
    this.clicked = this.clicked.bind(this);
  }
  clicked() {
    if (this.props.disabled == true) {
      return
    }
    console.log('clicked');
    if (this.props.onClick) {
      this.props.onClick(this.props.info.ID);
    }
    console.log(this.props.info.NAME)
  }

  render() {
    var selectedStyle = {
      filter: this.props.disabled ? 'grayscale(100%)' : ''
    }
    return (
      <div>
        <img 
          style={selectedStyle}
          onClick={this.clicked}
          data-tip={this.props.info.NAME} 
          src={'/images/' + this.props.info.NAME + '.png'}></img>
        
      </div>
    );
  }
}

export default HeroItem;

//<ReactTooltip />