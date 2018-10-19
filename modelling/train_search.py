import keras
from tensorflow.python.client import device_lib
print(device_lib.list_local_devices())

import json

hero_embeddings = json.loads(open('./embeddings/normalized_embeddings.json', 'r').read())

keys =  ['STR', 'STR+', 'STR25', 'AGI', 'AGI+', 'AGI25', 'INT', 'INT+', 'INT25', 'T', 'T+', 
         'T25', 'MS', 'AR', 'DMG(MIN)', 'DMG(MAX)', 'RG', 'BAT', 'ATK PT', 'ATK BS', 'VS-D',
         'VS-N', 'TR', 'COL', 'HP/S', 'L', 'is_str', 'is_agi', 'is_int', '0_win', '0_gpm', 
         '0_assists', '0_denies', '0_deaths', '0_kills', '0_last_hits', '0_level', '0_hero_damage', 
         '0_hero_healing', '0_tower_damage', '0_xp_per_min', '1_win', '1_gpm', '1_assists', '1_denies',
         '1_deaths', '1_kills', '1_last_hits', '1_level', '1_hero_damage', '1_hero_healing', 
         '1_tower_damage', '1_xp_per_min', '2_win', '2_gpm', '2_assists', '2_denies', '2_deaths', 
         '2_kills', '2_last_hits', '2_level', '2_hero_damage', '2_hero_healing', '2_tower_damage', 
         '2_xp_per_min', '3_win', '3_gpm', '3_assists', '3_denies', '3_deaths', '3_kills', 
         '3_last_hits', '3_level', '3_hero_damage', '3_hero_healing', '3_tower_damage', '3_xp_per_min']

def build_array_embedding(hero_embedding):
    return [hero_embedding[key] for key in keys]

array_hero_embeddings = {k: build_array_embedding(v) for k, v in hero_embeddings.items()}

friendly_matchups = json.loads(open('./embeddings/friendly_matchups.json', 'r').read())
enemy_matchups = json.loads(open('./embeddings/enemy_matchups.json', 'r').read())

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

batch_size = 32


def data_generator(filepaths, batch_size=32, callback=None, transform_func=None):
    #loading data
    batch_events = []
    batch_labels = []
    counter = 0
    while True:
        #print('full touch')
        #print(len(filepaths))
        for match, label in get_random_json_lines_from_files(filepaths, 
                                                             transform_func=transform_func):
            if len(batch_events) == batch_size:
                if callback is not None:
                    callback(counter)
                yield np.array(batch_events), np.array(batch_labels)
                batch_events = []
                batch_labels = []
                counter = counter + 1
            batch_events.append(match)
            batch_labels.append(label)

from keras.callbacks import ModelCheckpoint, Callback, LambdaCallback, EarlyStopping
from keras_tqdm import TQDMCallback

import random
import string


def test_run(layers=[], epochs=10, output_shape=2, optimizer='adam', transform_func=None, loss='binary_crossentropy', final_activation_function='softmax'):
    print("TESTING")
    print("LAYERS: {0}".format(layers))
    print("EPOCHS: {0}".format(epochs))
    all_files = get_files_in_folders('../scraper/cleaned_data/')

    training_set, validating_set = train_test_split(all_files, train_size=0.9)
    training_generator = data_generator(training_set, batch_size=batch_size, transform_func=transform_func)
    validating_generator = data_generator(validating_set, batch_size=batch_size, transform_func=transform_func)


    # Expected Output Shape

    generator_value = training_generator.__next__()[0][0] # Skip first axis (value/label) and second axis (batch)
    generator_value = validating_generator.__next__()[0][0] # Skip first axis (value/label) and second axis (batch)


    # create the model
    model = Sequential()
    model.add(Dense(layers[0], activation='relu', input_shape=(len(generator_value),)))
    for layer in layers[1:]:
        model.add(Dense(layer, activation='relu'))
    model.add(Dense(output_shape, activation=final_activation_function))
    model.compile(loss=loss, optimizer=optimizer, metrics=['accuracy'])
    print(model.summary())

    name = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))



    checkpointer = ModelCheckpoint(filepath="./tmp/classification__" + name + "__.{epoch:02d}-{val_loss:.2f}.hdf5", 
                                   verbose=1, save_best_only=True)

    def test_model(epoch, logs):
        test_values = []
        test_labels = []
        validating_generator = data_generator(validating_set, batch_size=batch_size, transform_func=transform_func)

        for x in range(0, 50):
            test_value, label = validating_generator.__next__()
            test_values.extend(test_value)
            test_labels.extend(label)
        num_correct = 0
        for value, label in zip(test_values, test_labels):
            evalled_result = model.predict(np.array((value,)))
            if len(evalled_result[0] == 1):
                prediction = evalled_result[0][0] > 0.5
            else:
                prediction = evalled_result[0][0] > evalled_result[0][1]
            correct = prediction == label[0]
            #print("{0} == {1} - {2}".format(evalled_result, label, correct))
            if correct:
                num_correct += 1
        value = num_correct/len(test_labels)
        print("Epcoh: {epoch}, Value: {value}".format(epoch=epoch, value=value))
        return value


    print("start training")
    print("Input Size: {0}".format(len(generator_value)))
    steps_per_epoch = int(500000/batch_size)
    #steps_per_epoch = steps_per_epoch / 2

    test_model_callback = LambdaCallback(on_epoch_end=test_model)

    model.fit_generator(training_generator, 
                        steps_per_epoch=steps_per_epoch,#1350000/batch_size/100, 
                        epochs=epochs, 
                        verbose=0,
                        validation_data=validating_generator, 
                        validation_steps=steps_per_epoch/10, #/(batch_size/2)/100,
                        callbacks=[checkpointer, TQDMCallback(), test_model_callback,
                                   EarlyStopping(patience=5)])
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
        if len(evalled_result[0] == 1):
            prediction = evalled_result[0][0] > 0.5
        else:
            prediction = evalled_result[0][0] > evalled_result[0][1]
        correct = prediction == label[0]
        #print("{0} == {1} - {2}".format(evalled_result, label, correct))
        if correct:
            num_correct += 1
    print(num_correct/len(test_labels))

    del model
    del training_generator
    del validating_generator

layer_options = [
    {'layers': [100]},
    {'layers': [200]},
    {'layers': [500]},
    {'layers': [1000]},
    {'layers': [2000]},
    {'layers': [1000, 100]},
    {'layers': [1000, 200]},
    {'layers': [1000, 500]},
    {'layers': [1000, 1000]},
    {'layers': [2000, 100]},
    {'layers': [2000, 200]},
    {'layers': [2000, 500]},
    {'layers': [2000, 1000]},
    {'layers': [2000, 1500, 200]},
    {'layers': [2000, 1500, 500]},
    {'layers': [2000, 1500, 1000]},
]

final_activations = [
    {
        'final_activation_function': 'sigmoid',
        'label_classes': 1,
    },
    {
        'final_activation_function': 'softmax',
        'label_classes': 2, 
    }
]

include_seperate_one_hot_encodings = [
    {'include_seperate_one_hot_encodings': True}, 
    {'include_seperate_one_hot_encodings': False},   
] 

include_integrated_one_hot_encodings = [
    {'include_integrated_one_hot_encodings': True}, 
    {'include_integrated_one_hot_encodings': False},   
] 

include_hero_embeddings = [
    {'include_hero_embeddings': True}, 
    {'include_hero_embeddings': False},   
] 

include_matchup_embeddings = [
    {'include_matchup_embeddings': True}, 
    {'include_matchup_embeddings': False},   
] 

loss_functions = [
    {'loss_function': 'mean_squared_error'},
    {'loss_function': 'mean_absolute_percentage_error'},
]

optimizers = [
    {'optimizer': 'nadam'},
    {'optimizer': 'adamax'},
    {'optimizer': 'adam'},
    {'optimizer': 'adadelta'},
    {'optimizer': 'adagrad'},
]

epochs = [
    {'epochs': 20}
]

from random import choice
import pprint

def build_config():
    config = {}
    config.update(random.choice(layer_options))
    config.update(random.choice(final_activations))
    config.update(random.choice(include_seperate_one_hot_encodings))
    config.update(random.choice(include_integrated_one_hot_encodings))
    config.update(random.choice(include_hero_embeddings))
    config.update(random.choice(include_matchup_embeddings))
    config.update(random.choice(loss_functions))
    config.update(random.choice(optimizers))
    config.update(random.choice(epochs))
    return config

while True:
    try:
        config = build_config()
        pprint.pprint(config)
        input_function = build_input_function(sort_players=True, 
                                              include_seperate_one_hot_encodings=config['include_seperate_one_hot_encodings'], 
                                              include_integrated_one_hot_encodings=config['include_integrated_one_hot_encodings'],
                                              include_hero_embeddings=config['include_hero_embeddings'], 
                                              include_matchup_embeddings=config['include_matchup_embeddings'],
                                              label_classes=config['label_classes'])
        test_run(layers=config['layers'], 
                 final_activation_function=config['final_activation_function'],
                 transform_func=input_function,
                 optimizer=config['optimizer'],
                 loss=config['loss_function'],
                 epochs=config['epochs'],
                 output_shape=config['label_classes'])
    except Exception as e:
        print('--------ERROR--------')
        print(e)
        print('---------------------')