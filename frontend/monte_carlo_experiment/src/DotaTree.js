import DotaState from './DotaState';
import DotaNode from './DotaNode';
import {run_games} from './evaluate_game.js';

var pick_order = [
    {team: 'R', pick_type: 'ban', count: 0},
    {team: 'D', pick_type: 'ban', count: 0},
    {team: 'R', pick_type: 'ban', count: 1},
    {team: 'D', pick_type: 'ban', count: 1},
    {team: 'R', pick_type: 'ban', count: 2},
    {team: 'D', pick_type: 'ban', count: 2},

    {team: 'R', pick_type: 'pick', count: 0},
    {team: 'D', pick_type: 'pick', count: 0},
    {team: 'D', pick_type: 'pick', count: 1},
    {team: 'R', pick_type: 'pick', count: 1},
    
    {team: 'R', pick_type: 'ban', count: 3},
    {team: 'D', pick_type: 'ban', count: 3},
    {team: 'R', pick_type: 'ban', count: 4},
    {team: 'D', pick_type: 'ban', count: 4},
    
    {team: 'R', pick_type: 'pick', count: 2},
    {team: 'D', pick_type: 'pick', count: 2},
    {team: 'R', pick_type: 'pick', count: 3},
    {team: 'D', pick_type: 'pick', count: 3},
    
    {team: 'D', pick_type: 'ban', count: 5},
    {team: 'R', pick_type: 'ban', count: 5},
    
    {team: 'R', pick_type: 'pick', count: 4},
    {team: 'D', pick_type: 'pick', count: 4},
]

class DotaTree {
	constructor() {
		var base_state = new DotaState({
			radiant_heroes: [],
			dire_heroes: [],
			banned_heroes: []
		})

		this.root_node = new DotaNode(null, 0, base_state)
	};


	step() {
		this.expand(this.next_expansion_node())
	}

	async expand(node) {
		var future_possible_picks = node.state.future_picks()
		var pick_type = pick_order[node.depth]
		node.children = future_possible_picks.map((hero_pick) => {
			if (pick_type.pick_type === 'ban') {
				var bans = node.state.banned_heroes.slice()
				bans.push(hero_pick)
				var state = new DotaState({
					radiant_heroes: node.state.radiant_heroes,
					dire_heroes: node.state.dire_heroes,
					banned_heroes: bans,
					team: pick_type.team,
					choice: hero_pick,
				})
			} else {
				if (pick_type.team === 'R') {
					var radiant_heroes = node.state.radiant_heroes.slice()
					radiant_heroes.push(radiant_heroes)
					var state = new DotaState({
						radiant_heroes: radiant_heroes,
						dire_heroes: node.state.dire_heroes,
						banned_heroes: bans,
						team: pick_type.team,
						choice: hero_pick,
					})
				} else {
					var dire = node.state.dire_heroes.slice()
					dire.push(hero_pick)
					var state = new DotaState({
						radiant_heroes: node.state.radiant_heroes,
						dire_heroes: dire,
						banned_heroes: node.state.banned_heroes,
						team: pick_type.team,
						choice: hero_pick,
					})
				}
			}
			return new DotaNode(node, node.depth+1, state);
		});
		var played_out_teams = node.children.map((x) => {
			return x.state.played_out_team();
		});
		var result = await run_games(played_out_teams);
		console.log(result)
		result.forEach((result, i) => {
			var radiant_win = result[0] > result[1]
			var node_is_radiant = pick_type['team'] === 'R';

			if (node_is_radiant == radiant_win) {
				node.children[i].backpropogate(1,1);
			} else {
				node.children[i].backpropogate(0,1);					
			}
		});
	}

	next_expansion_node() {
		var expansion_node = this.root_node
		while (expansion_node.children.length != 0) {
			var best_child = expansion_node.best_child()
			if (best_child == null) {
				return expansion_node
			} 
		}
		return expansion_node
	}

	best_option() {
		var radiant_heroes = {}
		var radiant_bans = {}
		var dire_heroes = {}
		var dire_bans = {}

	}

	best_option_chain() {
		var node_chain = []
		var current_node = this.root_node.most_explored_child();

		while (current_node !== null) {
			node_chain.push(current_node)
			current_node = current_node.most_explored_child()
		}

		return node_chain;
	}
}

export default DotaTree