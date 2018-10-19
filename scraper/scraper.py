import dota2api
from ratelimit import limits, sleep_and_retry

import os
import json
from time import sleep
import random

directory = 'scrape_results'

all_files = [os.path.join(directory, x) for x in os.listdir(directory)]

seen_players = set()
unseen_player_list = []
seen_match_ids = set()
duplicate_matches_count = 0

for filepath in all_files:
    print(filepath)
    with open(filepath, 'rb') as file_ref:
        for line in file_ref:
            try:
                result = json.loads(line.decode('utf8'))
                if 'type' in result and result['type'] == 'STARTED_ON_NEW_PLAYER':
                    seen_players.add(result['player_id'])
                else:
                    if result['match_id'] in seen_match_ids:
                        duplicate_matches_count = duplicate_matches_count + 1
                    seen_match_ids.add(result['match_id'])
                    for player in result['players']:
                        if 'account_id' in player:
                            unseen_player_list.append(player['account_id'])
            except Exception:
                pass

unseen_player_list = [x for x in unseen_player_list if x not in seen_players]

if len(unseen_player_list) == 0:
    unseen_player_list = [31632658] # That's Zin

print('Inited, {0} duplicate matches'.format(duplicate_matches_count))

import dota2api
from ratelimit import limits, sleep_and_retry

api = dota2api.Initialise()


match_count = len(seen_match_ids)

def get_next_filename():
    count = 1
    while True:
        path = './scrape_results/all_matches_{0}.json'.format(count)
        if os.path.exists(path) is False:
            return path
        count = count + 1

matches_file = open(get_next_filename(), 'wb')

def print_status_update():
    players_seen = len(seen_players) - len(unseen_player_list)
    print("Matches saved: {0}, Players Seen: {1}, Players To Go: {2}".format(match_count, players_seen, len(unseen_player_list)))

@sleep_and_retry
@limits(calls=1, period=1.10)
def api_call(endpoint, *args, **kwargs):
    try:
        return getattr(api, endpoint)(*args, **kwargs)
    except dota2api.src.exceptions.APITimeoutError:
        sleep(10)
    except Exception as e:
        print(e)
        print("Sleeping it off.")
        sleep(10)
def get_player(player_id):
    print('Getting player: {0}'.format(player_id))
    try:
        history = api_call('get_match_history', account_id=player_id)
    except Exception as e:
        print(e)
        print("Sleeping it off.")
        sleep(10)
    matches_file.write(json.dumps({'type': 'STARTED_ON_NEW_PLAYER', 'player_id': player_id}).encode('utf8'))
    matches_file.write('\n'.encode('utf8'))
    for match in random.sample(history['matches'], 5):
        get_match(match['match_id'])

def get_match(match_id):
    global match_count
    if match_id in seen_match_ids:
        return
    print('get_match_details: {0}'.format(match_id))
    print_status_update()
    details = api_call('get_match_details', match_id)
    matches_file.write(json.dumps(details).encode('utf8'))
    matches_file.write('\n'.encode('utf8'))
    match_count = match_count + 1
    for player in details['players']:
        if player.get('account_id') and player['account_id'] not in seen_players:
            unseen_player_list.append(player['account_id'])
            seen_players.add(player['account_id'])

while len(unseen_player_list) > 0:
    try:
        get_player(unseen_player_list.pop())
    except Exception as e:
        pass
