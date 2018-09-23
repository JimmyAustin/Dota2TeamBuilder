import heroes from './config/heroes';
console.log(heroes)
var all_hero_ids = heroes.map((hero) => {
	return hero['ID']
}).filter((x) => { return x > 0 });

class DotaState {
	constructor(parameters) {
		this.radiant_heroes = parameters.radiant_heroes || []
		this.dire_heroes = parameters.dire_heroes || []

		this.banned_heroes = parameters.banned_heroes || []
		this.team = parameters.team
		this.choice = parameters.choice
	};

	future_picks() {
		if (this.banned_heroes == undefined) {
			debugger;
		}
		return all_hero_ids.filter((x) => {
			return (this.radiant_heroes.indexOf(x) === -1 &&
					this.dire_heroes.indexOf(x) === -1 &&
					this.banned_heroes.indexOf(x) === -1)
		});
	}

	played_out_team() {
		var radiant_heroes = this.radiant_heroes.slice();
		var dire_heroes = this.dire_heroes.slice();
		var available_heros = this.future_picks();
		console.log("available_heros");
		console.log(available_heros)
		console.log("all_heros");
		console.log(all_hero_ids)
		while (radiant_heroes.length !== 5 || dire_heroes.length !== 5) {
			var hero = available_heros[Math.floor(Math.random()*available_heros.length)];
			if (radiant_heroes.length !== 5) {
				radiant_heroes.push(hero);
			} else {
				dire_heroes.push(hero);				
			}
		}
		return [radiant_heroes, dire_heroes]
	}
}

export default DotaState