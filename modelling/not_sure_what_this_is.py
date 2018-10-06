import keras
from tensorflow.python.client import device_lib
print(device_lib.list_local_devices())

import json

hero_embeddings = json.loads(open('normalized_embeddings.json', 'r').read())

keys =  ['STR', 'STR+', 'STR25', 'AGI', 'AGI+', 'AGI25', 'INT', 'INT+', 'INT25', 'T', 'T+', 'T25', 'MS', 'AR', 'DMG(MIN)', 'DMG(MAX)', 'RG', 'BAT', 'ATK PT', 'ATK BS', 'VS-D', 'VS-N', 'TR', 'COL', 'HP/S', 'L', 'is_str', 'is_agi', 'is_int', '0_win', '0_gpm', '0_assists', '0_denies', '0_deaths', '0_kills', '0_last_hits', '0_level', '0_hero_damage', '0_hero_healing', '0_tower_damage', '0_xp_per_min', '1_win', '1_gpm', '1_assists', '1_denies', '1_deaths', '1_kills', '1_last_hits', '1_level', '1_hero_damage', '1_hero_healing', '1_tower_damage', '1_xp_per_min', '2_win', '2_gpm', '2_assists', '2_denies', '2_deaths', '2_kills', '2_last_hits', '2_level', '2_hero_damage', '2_hero_healing', '2_tower_damage', '2_xp_per_min', '3_win', '3_gpm', '3_assists', '3_denies', '3_deaths', '3_kills', '3_last_hits', '3_level', '3_hero_damage', '3_hero_healing', '3_tower_damage', '3_xp_per_min']

def build_array_embedding(hero_embedding):
    return [hero_embedding[key] for key in keys]

array_hero_embeddings = {k: build_array_embedding(v) for k, v in hero_embeddings.items()}

friendly_matchups = json.loads(open('friendly_matchups.json', 'r').read())
enemy_matchups = json.loads(open('enemy_matchups.json', 'r').read())

import numpy
from keras.datasets import imdb
from keras.models import Sequential
from keras.layers import Dense, Dropout
from keras.layers import LSTM
from keras.layers.embeddings import Embedding
from keras.preprocessing import sequence
import pickle
import numpy as np
from tqdm import tqdm
from toolbox.notebook import *
from sklearn.model_selection import train_test_split
import random
from utils import *
# fix random seed for reproducibility
numpy.random.seed(7)

batch_size = 32

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

def transform_match(match):
    if proper_match(match) is False:
        return None
    for player in match['players']:
        player['hero_id'] = str(player['hero_id'])
    radient = match['players'][0:5]
    dire = match['players'][5:]
    
    radient = sorted(radient, key=lambda x: int(x['hero_id']))
    dire = sorted(dire, key=lambda x: int(x['hero_id']))
#     random.shuffle(radient)
#     random.shuffle(dire)
    
    radient_matchups_embeddings = [get_player_embedding_from_match(player, match, True) for player in radient]
    dire_matchups_embeddings = [get_player_embedding_from_match(player, match, False) for player in dire]
    hero_embeddings = [array_hero_embeddings[x['hero_id']] for x in radient+dire]
    
    embeddings = flatten(radient_matchups_embeddings + dire_matchups_embeddings + hero_embeddings)
    embeddings.extend(get_team_one_hot_encodings(radient))
    embeddings.extend(get_team_one_hot_encodings(dire))
    
    label = [1,0] if match['radiant_win'] else [0,1]
    
    return embeddings, label

def data_generator(filepaths, batch_size=32, callback=None):
    #loading data
    batch_events = []
    batch_labels = []
    counter = 0
    while True:
        #print('full touch')
        #print(len(filepaths))
        for match, label in get_random_json_lines_from_files(filepaths, 
                                                             transform_func=transform_match):
            if len(batch_events) == batch_size:
                if callback is not None:
                    callback(counter)
                yield np.array(batch_events), np.array(batch_labels)
                batch_events = []
                batch_labels = []
                counter = counter + 1
            batch_events.append(match)
            batch_labels.append(label)

from keras.callbacks import ModelCheckpoint, Callback
from keras_tqdm import TQDMCallback


def test_run(layers, epochs):
    print("TESTING")
    print("LAYERS: {0}".format(layers))
    print("EPOCHS: {0}".format(epochs))
    all_files = get_files_in_folders('./scraper/cleaned_data/')

    training_set, validating_set = train_test_split(all_files, train_size=0.9)
    training_generator = data_generator(training_set, batch_size=batch_size)
    validating_generator = data_generator(validating_set, batch_size=batch_size)#,callback=print)


    # Expected Output Shape

    hero_embeddings_count = 10 * len(keys) #10 characters, each with a set number of keys from the hero embeddings
    matchup_embeddings_count = 10 * 9 # 10 people, with matchup numbers for every other player
    one_hot_embeddings = 120 * 2 # Hero count * team count
    total_input_number = hero_embeddings_count + matchup_embeddings_count + one_hot_embeddings

    generator_value = training_generator.__next__()[0][0] # Skip first axis (value/label) and second axis (batch)
    generator_value = validating_generator.__next__()[0][0] # Skip first axis (value/label) and second axis (batch)

    assert(len(generator_value) == total_input_number)

    # create the model
    model = Sequential()
    model.add(Dense(layers[0], activation='relu', input_shape=(total_input_number,)))
    for layer in layers[1:]:
        model.add(Dense(layer, activation='relu'))
    model.add(Dense(2, activation='softmax'))
    model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
    print(model.summary())


    name = '_'.join([str(x) for x in layers])

    checkpointer = ModelCheckpoint(filepath="./tmp/classification__" + name + "__.{epoch:02d}-{val_loss:.2f}.hdf5", verbose=1)

    # model.fit_generator(training_generator, 
    #                     steps_per_epoch=1350000/batch_size, 
    #                     epochs=20, 
    #                     verbose=0,
    #                     validation_data=validating_generator, 
    #                     validation_steps=150000/(batch_size/2), 
    #                     callbacks=[checkpointer,TQDMNotebookCallback()])

    print("start training")
    steps_per_epoch = int(500000/batch_size)
    model.fit_generator(training_generator, 
                        steps_per_epoch=steps_per_epoch,#1350000/batch_size/100, 
                        epochs=epochs, 
                        verbose=0,
                        #validation_data=validating_generator, 
                        #validation_steps=10, #/(batch_size/2)/100, 
                        callbacks=[checkpointerTQDMCallback()])
    print("end training")
    test_values = []
    test_labels = []
    for x in range(0, 100):
        test_value, label = validating_generator.__next__()
        test_values.extend(test_value)
        test_labels.extend(label)
    print('loaded from validating_generator')
    num_correct = 0
    for value, label in zip(test_values, test_labels):
        evalled_result = model.predict(np.array((value,)))
        prediction = evalled_result[0][0] > evalled_result[0][1]
        correct = prediction == label[0]
        #print("{0} == {1} - {2}".format(evalled_result, label, correct))
        if correct:
            num_correct += 1
    print(num_correct/len(test_labels))

    del model
    del training_generator
    del validating_generator
layer_configurations_to_test = [
    [500],
    [800],
    [1000],
    [2000],
    [2000, 1000, 500],
    [1000, 400],
    [500, 400],
    [800, 500, 300],
    [800, 500, 300, 200],
    [200, 200, 200],
    [100, 100, 100, 100],
    [2000, 1000, 500],
]

for config in layer_configurations_to_test:
    test_run(config, 5)
