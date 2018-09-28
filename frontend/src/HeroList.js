import React, { Component } from 'react';
import heroes from 'config/heroes';
import HeroItem from './HeroItem';

class HeroList extends Component {
  constructor() {
    super();
    this.clickOnHero = this.clickOnHero.bind(this)
    this.buildHeroItem = this.buildHeroItem.bind(this)
  }

  clickOnHero(id) {
    console.log(id)
    this.props.onUnselectedClick(id)
  }

  buildHeroItem(x) {
    return <HeroItem 
            onClick={this.clickOnHero}
            info={x}
            disabled={this.props.selectedHeros.indexOf(x.ID) != -1}>
        </HeroItem> 
  }

  render() {
    var self = this;
    var agility_hero_list = heroes.filter(function(x) {
        return x.ID > 0 && x.A == 'Agility'
    }).map(function(x) {
      return self.buildHeroItem(x)
    }) 

    var intelligence_hero_list = heroes.filter(function(x) {
        return x.ID > 0 && x.A == 'Intelligence'
    }).map(function(x) {
      return self.buildHeroItem(x)
    })  
    
    var strength_hero_list = heroes.filter(function(x) {
        return x.ID > 0 && x.A == 'Strength'
    }).map(function(x) {
      return self.buildHeroItem(x)
    })  
    
    return (
      <div>
        <div>
            <h2>Agility</h2>
            <div style={{display: 'flex', 'flexWrap': 'wrap'}}>
                {agility_hero_list}
            </div>
        </div>
        <div>
            <h2>Strength</h2>
            <div style={{display: 'flex', 'flexWrap': 'wrap'}}>
                {strength_hero_list}
            </div>
        </div>
        <div>
            <h2>Intelligence</h2>
            <div style={{display: 'flex', 'flexWrap': 'wrap'}}>
                {intelligence_hero_list}
            </div>
        </div>
      </div>
    );
  }
}


export default HeroList;
