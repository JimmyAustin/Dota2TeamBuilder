import React, { Component } from 'react';
import heroes from './config/heroes';
import HeroItem from './HeroItem';

class HeroList extends Component {
  constructor() {
    super();
    this.state = {'search_term': ''}
    this.clickOnHero = this.clickOnHero.bind(this)
    this.buildHeroItem = this.buildHeroItem.bind(this)
    this.updateSearchTerm = this.updateSearchTerm.bind(this)
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

  updateSearchTerm(event) {
    this.setState({search_term: event.target.value});
  }

  render() {
    var self = this;
    var searched_heroes = heroes.filter((x) => {
      return x.HERO.toLowerCase().indexOf(this.state.search_term) != -1
    })

    var agility_hero_list = searched_heroes.filter(function(x) {
        return x.ID > 0 && x.A == 'Agility'
    }).map(function(x) {
      return self.buildHeroItem(x)
    }) 

    var intelligence_hero_list = searched_heroes.filter(function(x) {
        return x.ID > 0 && x.A == 'Intelligence'
    }).map(function(x) {
      return self.buildHeroItem(x)
    })  
    
    var strength_hero_list = searched_heroes.filter(function(x) {
        return x.ID > 0 && x.A == 'Strength'
    }).map(function(x) {
      return self.buildHeroItem(x)
    })  
    
    return (
      <div>
        Search: <input type="text" value={this.state.search_term} onChange={this.updateSearchTerm} />

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
