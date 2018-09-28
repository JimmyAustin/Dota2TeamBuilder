import * as tf from '@tensorflow/tfjs';
import hero_embeddings from './config/normalized_embeddings';

var model = null

var array_hero_embeddings = {}

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

  Object.keys(hero_embeddings).forEach((k) => {
    array_hero_embeddings[k] = keys.map((key) => {
      return hero_embeddings[k][key]
    });
  });

function load_model() {
  console.log('Loading model')
  tf.loadModel('/model/model.json').then((x) => {
    console.log('Loaded model')
    model = x;
  })
}

function model_ready() {
    return model != null;
}

function build_model_input(radiant_heroes, dire_heroes) {
    var hero_count = 120;

    var include_integrated_one_hot_encodings = false;
    var include_hero_encodings = true;

    var integrated_one_hot_encodings = []
    var hero_embeddings = []

    if (include_hero_encodings) {
      var radiant_embeds = radiant_heroes.map((hero_id) => {
        return array_hero_embeddings[hero_id]
      })
      var dire_embeds = dire_heroes.map((hero_id) => {
        return array_hero_embeddings[hero_id]
      })
      hero_embeddings = Array(...Array(...radiant_embeds), ...Array(...dire_embeds))
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

    var embeddings = Array(...integrated_one_hot_encodings, ...hero_embeddings.flat())
    return embeddings
  }

var last_game_run = null

async function run_games(games) {
  var start = Date.now();
  //---
  var game_embeddings = games.map((x) => {
    return build_model_input(x[0], x[1])
  });
  if (game_embeddings[0] == undefined || game_embeddings[0].length != 770) {
    debugger;
  }
  var prediction = model.predict(tf.tensor2d(game_embeddings)).dataSync()
      
  var grouped_predictions = Array(prediction.length/2).fill().map((_, i) => {
    return [prediction[i], prediction[i+1]]
  });
  last_game_run = Date.now()
  return grouped_predictions
}

function run() {
  debugger;
  run_games([
    [[1,2,3,4,5],[6,7,8,9,10]],
    [[11,12,13,14,15],[16,17,18,19,20]]
  ]);
}

export {run_games, model_ready, load_model};
export default run;