import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import HeroList from './HeroList.js';
import TeamList from './TeamList.js';
import TeamEvaluator from './TeamEvaluator.js';

class App extends Component {
  constructor() {
    super()
    this.state = {
      radiant_heroes: [4, 5, 6],
      dire_heroes: [1, 2, 3],
      radiant_selected: true
    }
    this.remove_radiant_hero = this.remove_radiant_hero.bind(this);
    this.remove_dire_hero = this.remove_dire_hero.bind(this);

    this.add_dire_hero = this.add_dire_hero.bind(this);
    this.add_radiant_hero = this.add_radiant_hero.bind(this);

    this.dire_team_select = this.dire_team_select.bind(this);
    this.radiant_team_select = this.radiant_team_select.bind(this);

    this.add_hero = this.add_hero.bind(this);
  }


  add_dire_hero(id) {
    this.setState({dire_heroes: this.state.dire_heroes + [id]});
  }

  add_radiant_hero(id) {
    this.setState({radiant_heroes: this.state.radiant_heroes + [id]});
  }

  dire_team_select(id) {
    console.log('click');
    this.setState({radiant_selected: false});
  }

  radiant_team_select(id) {
    this.setState({radiant_selected: true});
  }


  remove_dire_hero(id) {
    this.setState({dire_heroes: this.state.dire_heroes.filter((x) => {
      return x != id;
    })})
  }

  remove_radiant_hero(id) {
    this.setState({radiant_heroes: this.state.radiant_heroes.filter((x) => {
      return x != id;
    })})
  }

  add_hero(id) {
    console.log(id+1);
    var team = this.state.radiant_selected ? 'radiant_heroes' : 'dire_heroes'
    var current_team = this.state[team]
    var hero_not_selected = (this.state.radiant_heroes.indexOf(id) == -1 &&
                         this.state.dire_heroes.indexOf(id) == -1)
    if (current_team.length < 5 && hero_not_selected) {
      current_team.push(id)
    }
    this.setState({team: current_team})
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <TeamEvaluator
          radiant_heroes={this.state.radiant_heroes}
          dire_heroes={this.state.dire_heroes}
          ></TeamEvaluator>
        <div style={{display: 'flex', flexWrap: 'wrap'}}>
          <TeamList 
            selected={this.state.radiant_selected == true}
            team_name='Radient'
            heroes={this.state.radiant_heroes}
            onHeroClick={this.remove_radiant_hero}
            onTeamSelect={this.radiant_team_select}>
          </TeamList>
          <TeamList 
            selected={this.state.radiant_selected == false}
            team_name='Dire'
            heroes={this.state.dire_heroes}
            onHeroClick={this.remove_dire_hero}
            onTeamSelect={this.dire_team_select}>
          </TeamList>
        </div>
        <HeroList
          selectedHeros={Array.concat(this.state.dire_heroes, this.state.radiant_heroes)}
          onUnselectedClick={this.add_hero}
        >
        </HeroList>
      </div>
    );
  }
}

export default App;
