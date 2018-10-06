import React, { Component } from 'react';
import heroes from './config/heroes'
import ReactTooltip from 'react-tooltip'
import HeroItem from './HeroItem';

class TeamList extends Component {
  constructor(props) {
    super();
    this.state = {'search': ''}
  }

  render() {
  	var heros_by_id = {};
  	heroes.map(function(x) {
  		heros_by_id[x.ID] = x;
  	});
  	var self = this;
  	var heros = this.props.heroes.map(function(x) {
  		return <HeroItem 
  		onClick={self.props.onHeroClick}
  		info={heros_by_id[x]}> </HeroItem>
  	});

    return (
      <div style={{minWidth: '640px', maxWidth: '640px'}}>
        <h2
        	style={{color: this.props.selected ? 'black' : 'gray'}}
        	onClick={this.props.onTeamSelect}>
        	{this.props.team_name}
        </h2>
        <div style={{display: 'flex'}}>
        	{heros}
        </div>
      </div>
    );
  }
}

export default TeamList;
