import React, { Component } from 'react';
import heroes from 'config/heroes';
import PickOrderRow from './PickOrderRow';

class PickOrderer extends Component {
  constructor() {
    super();
    this.state = {
      radiant_picks: [1,2,3], 
      dire_picks: [4,5,6], 
      radiant_bans: [7,8], 
      dire_bans: [9,10]
    }

    this.back = this.back.bind(this)
  }

  get_selection_order() {
    var heros_by_id = {};
    heroes.map(function(x) {
      heros_by_id[x.ID] = x;
    });
    var starting_team = this.props.starting_team || 'radiant'
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
      ].map((x) => {
          if (x.team == 'radiant') {
            if (x.pick_type == 'pick') {
              x.hero_id =  this.state.radiant_picks[x.count]
            } else {
              x.hero_id = this.state.radiant_bans[x.count]
            }
          } else {
            if (x.pick_type == 'pick') {
              x.hero_id =  this.state.dire_picks[x.count]
            } else {
              x.hero_id = this.state.dire_bans[x.count]
            }
          }
          x.hero = heros_by_id[x.hero_id]
          return x
      });
  }

  back(id) {
    var selection_order = this.get_selection_order().reverse();
    var self =  this;
    selection_order.every((x) => {
      console.log(x)
      if (x.hero != undefined) {
        console.log(x.hero)
        var hero_id = x.hero.ID
        var not_value = (y) => { return y != hero_id }
        if (x.team == 'radiant') {
          if (x.pick_type == 'pick') {
            self.setState({radiant_picks: self.state.radiant_picks.filter(not_value)})
          } else {
            self.setState({radiant_bans: self.state.radiant_bans.filter(not_value)})
          }
        } else {
          if (x.pick_type == 'pick') {

            console.log('before')
                        console.log(hero_id)

            console.log(self.state.dire_picks)
            self.setState({dire_picks: self.state.dire_picks.filter(not_value)})
            console.log(self.state.dire_picks.filter(not_value))
          } else {
            self.setState({dire_bans: self.state.dire_bans.filter(not_value)})
          }
        }
        return false; // Break out
      }
      return true;
    })
  }

  clickOnHero(id) {
    console.log(id)
    this.props.onUnselectedClick(id)
  }

  render(x) {
    var heros_by_id = {};
    heroes.map(function(x) {
      heros_by_id[x.ID] = x;
    });


    var row_items = build_selection_order(this.props.starting_team || 'radiant',
                                          this.state.radiant_picks,
                                          this.state.dire_picks,
                                          this.state.radiant_bans,
                                          this.state.dire_bans,
                                          heros_by_id).map((x) => {
      return <PickOrderRow hero={x.hero} row_type={x}></PickOrderRow>
    })
    return <div style={{width: '320px'}}>
      <div>
        {row_items}
      </div>
      <div>
        <div onClick={this.back}>Back</div>
      </div>
    </div>
  }
}

var build_selection_order = (starting_team, radiant_picks, dire_picks, radiant_bans, dire_bans, hero_information) => {

  
  var other_team = (starting_team || 'radiant') == 'radiant' ? 'dire' : 'radiant';

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
    ].map((x) => {
        if (x.team == 'radiant') {
          if (x.pick_type == 'pick') {
            x.hero_id =  radiant_picks[x.count]
          } else {
            x.hero_id = radiant_bans[x.count]
          }
        } else {
          if (x.pick_type == 'pick') {
            x.hero_id =  dire_picks[x.count]
          } else {
            x.hero_id = dire_bans[x.count]
          }
        }
        x.hero = hero_information[x.hero_id]
        return x
    });


}

export default PickOrderer;
