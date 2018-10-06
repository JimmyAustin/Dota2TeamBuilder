import DotaTree from './DotaTree.js'
import {load_model, model_ready} from './evaluate_game.js'
import hero_embeddings from '../config/normalized_embeddings';



load_model()

var should_be_calculating = false;
var tree = new DotaTree();
var count = 0;
var max_step_count = 0

var timerId = setInterval(function () {
    if (model_ready()) {
        clearInterval(timerId);
        
        console.log('Model reporting ready')
        self.postMessage({state: 'MODEL_READY'})
    } else {
        console.log('Model not reporting ready')
    }
}, 200);

self.addEventListener("message", getMessage);

function getMessage(event) {
    if (event.data.func == 'runCalculations') {
        runCalculations(event.data)
    } else if (event.data.func == 'ready') {
        self.postMessage({state: 'READY'})        
    } else if (event.data.func == 'updateBaseState') {
        tree.update_root_state(
            event.data.selection_order, 
            event.data.radiant_heroes, 
            event.data.dire_heroes, 
            event.data.radiant_bans.concat(event.data.radiant_bans)
        )
    } else {
        debugger;
    }
}

async function runCalculations(data) {
    max_step_count += data.max_step_count
    should_be_calculating = true;
    console.log('REstarting')        

    while (count < max_step_count) {

        if (await tree.step()) {
            if (count == 100) {
                        debugger;
            }
            count += 1;
            if (count % 10 == 0) {
                self.postMessage({state: 'UPDATE', 

                                  current_best: chain_to_choices(tree.best_option_chain()),
                                  step_count: count,
                                  simmed_game_count: tree.game_count})
            }
            if (tree.finished == true) {
                self.postMessage({state: 'COMPLETE_FINISHED', 
                                  current_best: chain_to_choices(tree.best_option_chain()),
                                  step_count: count,
                                  simmed_game_count: tree.game_count})
                return;
            }            
        } else {
            debugger
        }
    }

    console.log('Fin')
    self.postMessage({state: 'FINISHED'})
}


function readable_chain_to_choices(best_option_chain) {
    return best_option_chain.map((x) => {
        return `${hero_embeddings[x.state.choice].HERO} (${x.wins} - ${x.played}, ${x.wins/x.played*100}%)`;
    })
}


function chain_to_choices(best_option_chain) {
    return best_option_chain.map((x) => {
        return x.state;
    })
}