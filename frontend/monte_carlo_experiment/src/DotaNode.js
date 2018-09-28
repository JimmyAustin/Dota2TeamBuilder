import heroes from './config/heroes';
import exploration_parameter from './config/parameters'
console.log(heroes)
var all_hero_ids = heroes.map((hero) => {
	return hero['ID']
}).filter((x) => { return x > 0 });

class DotaNode {
	constructor(parent, depth, state) {
		this.parent = parent
		this.depth = depth
		this.state = state
		this.being_expanded = false
		this.children = []
		this.wins = 0
		this.played = 0
		this.value = 0
		this.future_gamestate_count = this.possible_future_gamestates_count()
	}

	backpropogate(wins, played) {
		if (this.parent != null) {
			this.parent.backpropogate(wins, played)
		}
		this.wins += wins
		this.played += played
		this.calculate_value()
	}

	calculate_value(value) {
        var component_1 = this.wins / this.played
        var component_2 = Math.sqrt(Math.log(this.future_gamestate_count)/this.played)
        this.value = component_1 + (exploration_parameter * component_2)
	}

	possible_future_gamestates_count() {
		var total_options = 1
		// Number of rounds in pick are 22 (10 pick, 12 bans)
		// Hero count = 120
		for (var i = 120 - this.depth; i < 120; i++) {
			total_options = total_options * i
		}
		return total_options
	}

	best_child() {
		var best_child = null;
		var best_child_value = 0;
		this.children.forEach((x) => {
			if (x.value > best_child_value && x.being_expanded == false) {
				best_child = x;
				best_child_value = x.value
			}
		})
		return best_child;
	}

	most_explored_child() {
		var best_child = null;
		var best_child_value = 0;
		var best_win_perc = 0;
		this.children.forEach((x) => {
			var win_perc = x.wins/x.played
			if (x.played > best_child_value) {
				best_child = x;
				best_child_value = x.played
				best_win_perc = win_perc
			} else if (x.played == best_child_value) {
				if (win_perc > best_win_perc) {
					best_win_perc = win_perc
					best_child_value = x.played
					best_child = x
				}
			}
		})
		return best_child;
	}
}
export default DotaNode;