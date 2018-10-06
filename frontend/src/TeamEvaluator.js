import React, { Component } from 'react';
import heroes from './config/heroes';
import ReactTooltip from 'react-tooltip';
import * as tf from '@tensorflow/tfjs';
import hero_embeddings from './config/normalized_embeddings';


class TeamEvaluator extends Component {
  constructor() {
    super();

    this.state = {prediction: [0, 0]}
    var self = this;
    tf.loadModel('/model/model.json').then(function(model) {
      self.setState({model: model})
    }).catch(function(e) {
      console.log('shits fucked')
      console.log(e)
    })

    this.clicked = this.clicked.bind(this);
  }

  clicked() {
    if (this.state.model == undefined || 
        this.props.radiant_heroes.length != 5 ||
        this.props.dire_heroes.length != 5) {
      return
    }



    var input = build_model_input(this.props.radiant_heroes, this.props.dire_heroes)
    var input2 = build_model_input(shuffle(this.props.radiant_heroes), 
                                   shuffle(this.props.dire_heroes))
    var input3 = build_model_input(shuffle(this.props.radiant_heroes), 
                                   shuffle(this.props.dire_heroes))
    var input4 = build_model_input(shuffle(this.props.radiant_heroes), 
                                   shuffle(this.props.dire_heroes))
    var prediction = this.state.model.predict(tf.tensor2d([input])).dataSync()
    
    //var prediction = this.state.model.predict(tf.tensor2d([input, input2])).dataSync()
    console.log(prediction)
    this.setState({prediction: prediction})
    
    // if (this.props.onClick) {
    //   this.props.onClick(this.props.info.ID);
    // }
    // console.log(this.props.info.NAME)
  }

  render() {
    return (
      <div>
        <div>Model: {this.state.model ? 'Loaded': 'Loading'}</div>
        <div>P1: {this.state.prediction[0]} - P2: {this.state.prediction[1]}</div>
        <div onClick={this.clicked}> Evaluate </div>
      </div>
    );
  }
}


var keys =  ['STR', 'STR+', 'STR25', 'AGI', 'AGI+', 'AGI25', 'INT', 
         'INT+', 'INT25', 'T', 'T+', 'T25', 'MS', 'AR', 'DMG(MIN)', 
         'DMG(MAX)', 'RG', 'BAT', 'ATK PT', 'ATK BS', 'VS-D', 'VS-N', 
         'TR', 'COL', 'HP/S', 'L', 'is_str', 'is_agi', 'is_int', '0_win', 
         '0_gpm', '0_assists', '0_denies', '0_deaths', '0_kills', '0_last_hits', 
         '0_level', '0_hero_damage', '0_hero_healing', '0_tower_damage', 
         '0_xp_per_min', '1_win', '1_gpm', '1_assists', '1_denies', '1_deaths', 
         '1_kills', '1_last_hits', '1_level', '1_hero_damage', '1_hero_healing', 
         '1_tower_damage', '1_xp_per_min', '2_win', '2_gpm', '2_assists', 
         '2_denies', '2_deaths', '2_kills', '2_last_hits', '2_level', 
         '2_hero_damage', '2_hero_healing', '2_tower_damage', '2_xp_per_min', 
         '3_win', '3_gpm', '3_assists', '3_denies', '3_deaths', '3_kills', 
         '3_last_hits', '3_level', '3_hero_damage', '3_hero_healing', '3_tower_damage', 
         '3_xp_per_min']

// var build_array_embedding = function(hero_embedding) {
//   return [hero_embedding[key] for key in keys]
// }
    

var array_hero_embeddings = {}
console.log(hero_embeddings)
Object.keys(hero_embeddings).forEach((k) => {
  array_hero_embeddings[k] = keys.map((key) => {
    return hero_embeddings[k][key]
  });
});


// {k: build_array_embedding(v) for k, v in hero_embeddings.items()}


var build_model_input = function(radiant_heroes, dire_heroes) {
  var hero_count = 120;

  var include_integrated_one_hot_encodings = false;
  var include_hero_encodings = true;

  var integrated_one_hot_encodings = []
  var hero_embeddings = []

  if (include_hero_encodings) {
    var radiant_embeds = radiant_heroes.map((hero_id) => {
      return array_hero_embeddings[hero_id]
    })
    var dire_embeds = radiant_heroes.map((hero_id) => {
      return array_hero_embeddings[hero_id]
    })
    hero_embeddings = Array.concat(...Array.concat(...radiant_embeds), Array.concat(...dire_embeds))
  }

  if (include_integrated_one_hot_encodings) {
    integrated_one_hot_encodings = Array(hero_count);
    integrated_one_hot_encodings.fill(0);
    radiant_heroes.map((x) => {
      integrated_one_hot_encodings[x-1] = 1; // Hero ids start at 1, arrays start at 0
    });
    dire_heroes.map((x) => {
      integrated_one_hot_encodings[x-1] = -1; // Hero ids start at 1, arrays start at 0
    });

  }

  var embeddings = Array.concat(integrated_one_hot_encodings, hero_embeddings)
  return embeddings
}

var shuffle = function(a) {
    a = a.map((x) => { return x });
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default TeamEvaluator;

//<ReactTooltip />