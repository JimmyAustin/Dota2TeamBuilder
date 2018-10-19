import json
from toolbox.notebook.fs import *
import numpy as np

hero_list = json.load(open('../config/heroes.json'))
hero_list_by_id = {x['ID']: x for x in hero_list}
hero_id_by_name = {x['NAME']: x['ID'] for x in hero_list}

def get_hero_id_from_name(name):
    return hero_id_by_name[name]

def get_hero_from_id(id):
    return hero_list_by_id[id]

def proper_match_type(match):
    return (match or {}).get('game_mode_name', 'Unknown') in ['Ability Draft',
         'All Pick',
         'All Random',
         'All Random Death Match',
         'Captains Mode',
         'Random Draft',
         'Ranked All Pick',
         'Single Draft']

def all_valid_players(match):
    for player in match['players']:
        if int(player.get('hero_id', 0)) == 0:
            return False
        if player.get('leaver_status', 'N/A') != 0: #leaver_status: 0 - NONE - finished match, no abandon.
            return False
    if len(match['players']) != 10:
        return False
    return True

def proper_match(match):
    return proper_match_type(match) and all_valid_players(match)

hero_embeddings = json.loads(open('./embeddings/normalized_embeddings.json', 'r').read())

keys =  ['STR', 'STR+', 'STR25', 'AGI', 'AGI+', 'AGI25', 'INT', 'INT+', 'INT25', 'T', 'T+', 'T25', 'MS', 'AR', 'DMG(MIN)', 'DMG(MAX)', 'RG', 'BAT', 'ATK PT', 'ATK BS', 'VS-D', 'VS-N', 'TR', 'COL', 'HP/S', 'L', 'is_str', 'is_agi', 'is_int', '0_win', '0_gpm', '0_assists', '0_denies', '0_deaths', '0_kills', '0_last_hits', '0_level', '0_hero_damage', '0_hero_healing', '0_tower_damage', '0_xp_per_min', '1_win', '1_gpm', '1_assists', '1_denies', '1_deaths', '1_kills', '1_last_hits', '1_level', '1_hero_damage', '1_hero_healing', '1_tower_damage', '1_xp_per_min', '2_win', '2_gpm', '2_assists', '2_denies', '2_deaths', '2_kills', '2_last_hits', '2_level', '2_hero_damage', '2_hero_healing', '2_tower_damage', '2_xp_per_min', '3_win', '3_gpm', '3_assists', '3_denies', '3_deaths', '3_kills', '3_last_hits', '3_level', '3_hero_damage', '3_hero_healing', '3_tower_damage', '3_xp_per_min']

def build_array_embedding(hero_embedding):
    return [hero_embedding[key] for key in keys]

array_hero_embeddings = {k: build_array_embedding(v) for k, v in hero_embeddings.items()}

friendly_matchups = json.loads(open('./embeddings/friendly_matchups.json', 'r').read())
enemy_matchups = json.loads(open('./embeddings/enemy_matchups.json', 'r').read())

def get_player_embedding_from_match(player, match, radient):
    def get_player_matchup(other_player):
        hostile = other_player['player_slot'] > 127 and radient
        relevant_matchup = enemy_matchups if hostile else friendly_matchups  
        try:
            return relevant_matchup[player['hero_id']][other_player['hero_id']]
        except KeyError:
            import pdb; pdb.set_trace()
            pass
    return [get_player_matchup(other_player) for other_player in match['players']
            if player != other_player]

def get_team_one_hot_encodings(players, total_size=120):
    encoding = np.zeros(120)
    for player in players:
        encoding[int(player['hero_id']) -1] = 1
    return encoding

def build_input_function(sort_players=True, 
                         include_seperate_one_hot_encodings=True, 
                         include_integrated_one_hot_encodings=True,
                         include_hero_embeddings=True, 
                         include_matchup_embeddings=True,
                         label_classes=2):
    def transform_match(match):
        for player in match['players']:
            player['hero_id'] = str(player['hero_id'])
        radient = match['players'][0:5]
        dire = match['players'][5:]
        
        radient = sorted(radient, key=lambda x: int(x['hero_id']))
        dire = sorted(dire, key=lambda x: int(x['hero_id']))
    #     random.shuffle(radient)
    #     random.shuffle(dire)
        
        embeddings = []

        if include_matchup_embeddings:
            radient_matchups_embeddings = [get_player_embedding_from_match(player, match, True) for player in radient]
            dire_matchups_embeddings = [get_player_embedding_from_match(player, match, False) for player in dire]
            embeddings = flatten(radient_matchups_embeddings + dire_matchups_embeddings)

        if include_hero_embeddings:
            embeddings.extend(flatten([array_hero_embeddings[x['hero_id']] for x in radient+dire]))

        if include_seperate_one_hot_encodings:
            embeddings.extend(get_team_one_hot_encodings(radient))
            embeddings.extend(get_team_one_hot_encodings(dire))
        
        if include_integrated_one_hot_encodings:
            embeddings.extend(get_team_one_hot_encodings(radient) - (get_team_one_hot_encodings(dire) * 2))

        if label_classes == 2:
            label = [1,0] if match['radiant_win'] else [0,1]
        elif label_classes == 1:
            label = [1] if match['radiant_win'] else [0]
        elif label_classes == 0:
            return embeddings
        return embeddings, label
    return transform_match