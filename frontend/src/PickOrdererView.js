import React, { Component } from 'react';
import heroes from 'config/heroes';
import PickOrderRow from './PickOrderRow';

class PickOrdererView extends Component {
  constructor() {
    super();

    this.get_selection_order = this.get_selection_order.bind(this)
  }

  get_selection_order() {
    var heros_by_id = {};
    heroes.map(function(x) {
      heros_by_id[x.ID] = x;
    });
    var starting_team = this.props.starting_team || 'radiant'
    var other_team = starting_team == 'radiant' ? 'dire' : 'radiant';

    return this.props.selection_order.map((x, i) => {
          if (x.team == 'radiant') {
            if (x.pick_type == 'pick') {
              x.hero_id =  this.props.radiant_picks[x.count]
            } else {
              x.hero_id = this.props.radiant_bans[x.count]
            }
          } else {
            if (x.pick_type == 'pick') {
              x.hero_id =  this.props.dire_picks[x.count]
            } else {
              x.hero_id = this.props.dire_bans[x.count]
            }
          }
          if (x.hero_id == undefined) {
            var hero_count = (this.props.radiant_picks.length + 
                              this.props.radiant_bans.length + 
                              this.props.dire_picks.length + 
                              this.props.dire_bans.length)
            x.hero_id = this.props.provisional_choices[i - hero_count]
            x['provisional'] = true;
          } else {
            x['provisional'] = false;
          }
          x.hero = heros_by_id[x.hero_id]
          return x
      });
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
    var self = this;
    var row_items = this.get_selection_order().map((x) => {
      return <PickOrderRow provisional={x.provisional} hero={x.hero} row_type={x}></PickOrderRow>
    });
    

    // var row_items = build_selection_order(this.props.starting_team || 'radiant',
    //                                       this.state.radiant_picks,
    //                                       this.state.dire_picks,
    //                                       this.state.radiant_bans,
    //                                       this.state.dire_bans,
    //                                       heros_by_id).map((x) => {
    //   return <PickOrderRow hero={x.hero} row_type={x}></PickOrderRow>
    // });

    return <div style={{width: '320px'}}>
      <div>
        {row_items}
      </div>
    </div>
  }
}

export default PickOrdererView;
