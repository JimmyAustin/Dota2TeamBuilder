import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import HeroList from './HeroList.js';
import TeamList from './TeamList.js';
import PickOrdererView from './PickOrdererView.js';
import TeamEvaluator from './TeamEvaluator.js';
import DotaCalculatorController from './MonteCarlo/DotaCalculatorController.js';
import heroes from './config/heroes';

class App extends Component {
  constructor() {
    super()
    this.state = {
      // radiant_heroes: [1,2,3],
      // dire_heroes: [4,5,6],
      // radiant_bans: [10,11],
      // dire_bans: [12,13],
      radiant_heroes: [],
      dire_heroes: [],
      radiant_bans: [],
      dire_bans: [],
      provisional_choices: [4,5,6],
      radiant_selected: true,
      starting_team: 'radiant'
    }
   
    this.add_hero = this.add_hero.bind(this);
    this.back = this.back.bind(this);
    this.get_relevant_hero = this.get_relevant_hero.bind(this);
    this.add_hero_to_team =  this.add_hero_to_team.bind(this);
    this.remove_hero_from_team = this.remove_hero_from_team.bind(this);
    this.swap_starting_team  = this.swap_starting_team.bind(this);
    this.update_provisional_heros = this.update_provisional_heros.bind(this);
  }

  get_relevant_hero(team, pick, count) {
    if (team == 'radiant') {
      if (pick == 'pick') {
        return this.state.radiant_heroes[count]
      } else {
        return this.state.radiant_bans[count]
      }
    } else {
      if (pick == 'pick') {
        console.log(this);
        console.log(this.state);
        return this.state.dire_heroes[count]
      } else {
        return this.state.dire_bans[count]
      }
    }
  }

  remove_hero_from_team(team, pick, hero_id) {
    var not_value = (y) => { return y != hero_id }
    if (team == 'radiant') {
      if (pick == 'pick') {
        this.setState({radiant_heroes: this.state.radiant_heroes.filter(not_value)})
      } else {
        this.setState({radiant_bans: this.state.radiant_bans.filter(not_value)})
      }
    } else {
      if (pick == 'pick') {
        this.setState({dire_heroes: this.state.dire_heroes.filter(not_value)})
      } else {
        this.setState({dire_bans: this.state.dire_bans.filter(not_value)})
      }
    }
  }

  add_hero_to_team(team, pick, hero_id) {
    if (team == 'radiant') {
      if (pick == 'pick') {
        this.setState({radiant_heroes: this.state.radiant_heroes.concat([hero_id])})
      } else {
        this.setState({radiant_bans: this.state.radiant_bans.concat([hero_id])})
      }
    } else {
      if (pick == 'pick') {
        this.setState({dire_heroes: this.state.dire_heroes.concat([hero_id])})
      } else {
        this.setState({dire_bans: this.state.dire_bans.concat([hero_id])})
      }
    }
  }

  update_provisional_heros(provisional_choices) {
    this.setState({provisional_choices: provisional_choices})
  }

  back(id) {
    console.log('back')
    var selection_order = build_selection_order(this.state.starting_team).reverse();
    var self = this;
    selection_order.every((x) => {
      var hero = self.get_relevant_hero(x.team, x.pick_type, x.count)
      if (hero != undefined) {
        self.remove_hero_from_team(x.team, x.pick_type, hero)
        return false; // Break out
      };
      return true
    });
    console.log(this.state);
  }


  add_hero(id) {
    var selection_order = build_selection_order(this.state.starting_team);
    var self = this;
    selection_order.every((x) => {
      var hero = self.get_relevant_hero(x.team, x.pick_type, x.count)
      if (hero == undefined) {
        self.add_hero_to_team(x.team, x.pick_type, id)
        return false; // Break out
      };
      return true
    });
  }

  swap_starting_team() {
    this.setState({
      radiant_picks: this.state.dire_heroes,
      dire_picks: this.state.radiant_heroes,
      radiant_bans: this.state.dire_bans,
      dire_bans: this.state.radiant_bans,
      starting_team: this.state.starting_team == 'radiant' ? 'dire' : 'radiant'
    })
  }

  render() {
    return (
      <div className="App">
        <div style={{
              width: '320px',
              display: 'inline-block',
              float: 'left'}}>
              <div onClick={this.swap_starting_team}>Starting Team: {this.state.starting_team}</div>
            <PickOrdererView 
              selection_order={build_selection_order(this.state.starting_team)}
              radiant_picks={this.state.radiant_heroes}
              dire_picks={this.state.dire_heroes}
              radiant_bans={this.state.radiant_bans}
              dire_bans={this.state.dire_bans}
              provisional_choices={this.state.provisional_choices}>
            </PickOrdererView>
            <div style={{height: '44px'}}>
              <button style={{height: '30px', width: '200px', margin: '2px'}} onClick={this.back}>
                Back
              </button>
            </div>
        </div>
        <div style={{
              position: 'absolute',
              left: '320px'}}>
          <DotaCalculatorController
            radiant_heroes={this.state.radiant_heroes}
            dire_heroes={this.state.dire_heroes}
            radiant_bans={this.state.radiant_bans}
            dire_bans={this.state.dire_bans}
            selection_order={build_selection_order(this.state.starting_team)}
            provisional_callback={this.update_provisional_heros}
            ></DotaCalculatorController>
          <div style={{display: 'flex', flexWrap: 'wrap'}}>
            <TeamList 
              team_name='Radiant Picks'
              heroes={this.state.radiant_heroes}
              onHeroClick={this.remove_radiant_hero}
              onTeamSelect={this.radiant_team_select}>
            </TeamList>
            <TeamList 
              team_name='Dire Picks'
              heroes={this.state.dire_heroes}
              onHeroClick={this.remove_dire_hero}
              onTeamSelect={this.dire_team_select}>
            </TeamList>
            <TeamList 
              team_name='Radiant Bans'
              heroes={this.state.radiant_bans}
              onHeroClick={this.remove_radiant_hero}
              onTeamSelect={this.radiant_team_select}>
            </TeamList>
            <TeamList 
              team_name='Dire Bans'
              heroes={this.state.dire_bans}
              onHeroClick={this.remove_dire_hero}
              onTeamSelect={this.dire_team_select}>
            </TeamList>
          </div>
          <HeroList
            selectedHeros={this.state.dire_heroes.concat(this.state.radiant_heroes, 
                                        this.state.radiant_bans, this.state.dire_bans)}
            onUnselectedClick={this.add_hero}
          >
          </HeroList>
        </div>
      </div>
    );
  }
}

var build_selection_order = function(starting_team) {
    var heros_by_id = {};
    
    heroes.map(function(x) {
      heros_by_id[x.ID] = x;
    });
    
    var other_team = starting_team == 'radiant' ? 'dire' : 'radiant';

    return [
          {team: starting_team, pick_type: 'ban', count: 0},
          {team: other_team, pick_type: 'ban', count: 0},
          {team: starting_team, pick_type: 'ban', count: 1},
          {team: other_team, pick_type: 'ban', count: 1},
          {team: starting_team, pick_type: 'ban', count: 2},
          {team: other_team, pick_type: 'ban', count: 2},

          {team: starting_team, pick_type: 'pick', count: 0},
          {team: other_team, pick_type: 'pick', count: 0},
          {team: other_team, pick_type: 'pick', count: 1},
          {team: starting_team, pick_type: 'pick', count: 1},
          
          {team: starting_team, pick_type: 'ban', count: 3},
          {team: other_team, pick_type: 'ban', count: 3},
          {team: starting_team, pick_type: 'ban', count: 4},
          {team: other_team, pick_type: 'ban', count: 4},
          
          {team: starting_team, pick_type: 'pick', count: 2},
          {team: other_team, pick_type: 'pick', count: 2},
          {team: starting_team, pick_type: 'pick', count: 3},
          {team: other_team, pick_type: 'pick', count: 3},
          
          {team: other_team, pick_type: 'ban', count: 5},
          {team: starting_team, pick_type: 'ban', count: 5},
          
          {team: starting_team, pick_type: 'pick', count: 4},
          {team: other_team, pick_type: 'pick', count: 4},
    ]
};


export default App;
