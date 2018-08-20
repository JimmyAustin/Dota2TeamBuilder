# This is gonna be played on users CPUs, so we should use it on ours.
import os
os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"   # see issue #152
os.environ["CUDA_VISIBLE_DEVICES"] = ""

import keras
from utils import *
from os import path
from random import choice
from math import sqrt, log #log is natural log
from datetime import datetime
from copy import copy
from toolbox.notebook import *
from toolbox.notebook.fs import *
import flamegraph
import numpy as np
import random

model_configuration = {'epochs': 20,
 'final_activation_function': 'softmax',
 'include_hero_embeddings': True,
 'include_integrated_one_hot_encodings': False,
 'include_matchup_embeddings': False,
 'include_seperate_one_hot_encodings': False,
 'label_classes': 2,
 'layers': [200],
 'loss_function': 'mean_squared_error',
 'optimizer': 'adagrad'}

exploration_parameter = sqrt(2)
#exploration_parameter = 1000
total_hero_pool = len(hero_list)

model_directory = './tmp/'
model_name = 'classification__PO40HVWG6Y__.01-0.22.hdf5'

input_function = build_input_function(label_classes=0,
                                      include_seperate_one_hot_encodings=False,
                                      include_integrated_one_hot_encodings=False,
                                      include_hero_embeddings=True,
                                      include_matchup_embeddings=False)

model = keras.models.load_model(path.join(model_directory, model_name))

def get_random_game(existing_radient, existing_dire, remaining_picks, remaining_selection_order):
    picks = {
        'radient': copy(existing_radient),
        'dire': copy(existing_dire)
    }
    picked = []
    for team, pick_or_ban in remaining_selection_order:
        selection = None
        while selection is None:
            selection = choice(remaining_picks)
            if selection in picked:
                selection = None
        picked.append(selection)
        if pick_or_ban == 'pick':
            if team == 'radient':
                picks['radient'].append(selection)
            else:
                picks['dire'].append(selection)
    return picks['radient'], picks['dire']

def get_next_game(existing_radient, existing_dire, remaining_picks, remaining_selection_order):
    next_team, next_pick_or_ban = remaining_selection_order[0]
    random_selection = choice(remaining_picks)
    radient = copy(existing_radient)
    dire = copy(existing_dire)
    remaining_picks = [x for x in remaining_picks if x is not random_selection]
    if next_pick_or_ban == 'pick':
        if next_team == 'radient':
            radient.append(random_selection)
        else:
            dire.append(random_selection)
    return random_selection, (radient, dire, remaining_picks, remaining_selection_order[1:])

def print_game_debug(radient, dire):
    radient = [get_hero_from_id(x)['name'] for x in radient]
    dire = [get_hero_from_id(x)['name'] for x in dire]
    #print("Playing {0} vs {1}".format(radient, dire))

def play_game(radient, dire): #Array of hero ids
    return play_games([(radient, dire)])

def other_team(team):
    return 'dire' if team == 'radient' else 'radient'

def play_games(games):
    def build_input(radient, dire):
        match = {'players': [{'hero_id': x} for x in radient + dire]}
        if len(match['players']) != 10:
            import pdb; pdb.set_trace()
        return input_function(match)
    inputs = [build_input(r,d) for r,d in games]
    try:
        predictions = model.predict(np.array(inputs))
    except Exception as e:
        import pdb; pdb.set_trace()
        raise e
    def evaluate_prediction(prediction):
        if len(prediction) == 2:
            return prediction[0] > prediction[1]
        else:
            return prediction[0] > 0.5
    return [evaluate_prediction(p) for p in predictions]

def potential_child_simulations(remaining_picks, selection_order):
    total_options = 1
    for i in range(len(remaining_picks)-len(selection_order), len(remaining_picks)):
        total_options = total_options * i
    return total_options

class TreeFullyExpandedException(Exception):
    pass

class DotaMonteCarloTree():
    def __init__(self, radient_heros=[],
                       dire_heros=[],
                       team='radient',
                       selection_order=None,
                       possible_picks=None,
                       parallel_simulation=False,
                       expansion_factor=1):



        self.root = DotaMonteCarloNode(0,
                                       team=other_team(team),
                                       parent_node=None,
                                       radient_heros=radient_heros,
                                       dire_heros=dire_heros,
                                       remaining_picks=possible_picks,
                                       selection_order=selection_order)
        self.step_count = 0
        self.expansion_factor = expansion_factor
        self.parallel_simulation = parallel_simulation

    def step(self):
        expansion_node = self.root.get_expansion_node()
        if expansion_node is None: # fully expanded tree
            print('fully expanded')
            raise TreeFullyExpandedException
        if self.parallel_simulation:
            child_nodes = [expansion_node.expand() for _ in range(0, self.expansion_factor)]
            games = [child_node.random_game_for_simulation() for child_node in child_nodes]
            predictions = play_games(games)
            [child_node.add_simulation_result(p) for child_node, p in zip(child_nodes, predictions)]
            self.step_count += self.expansion_factor
        else:
            for i in range(0, self.expansion_factor):
                if expansion_node.fully_expanded != True:
                    child_node = expansion_node.expand()
                    child_node.simulate() # This will automatically backpropogate
                    self.step_count += 1

    def run_for_time(self, time_in_seconds):
        try:
            start_time = datetime.now()
            while (datetime.now() - start_time).total_seconds() < time_in_seconds:
                self.run_steps(5)
        except TreeFullyExpandedException:
            pass

    def run_steps(self, steps):
        for i in range(0, steps):
            self.step()
    
    def evaluated_node_count(self):
        return self.root.node_count()

    def get_best_path(self, best_func=lambda x: x.value):
        best_node = self.root
        path = []
        while best_node is not None:
            best_child = None
            best_value = -1
            for child in best_node.children:
                if best_func(child) > best_value:
                    best_value = child.value
                    best_child = child
            if best_child:
                best_child.sibling_count = len(best_node.children)
                path.append(best_child)
            best_node = best_child
        return path

class DotaMonteCarloNode():
    def __init__(self, choice, team, parent_node, radient_heros, dire_heros, 
                 remaining_picks, selection_order):
        self.team = team
        self.radient_heros = radient_heros
        self.dire_heros = dire_heros
        self.choice = choice
        self.remaining_picks = remaining_picks
        self.selection_order = selection_order
        self.played = 0
        self.wins = 0
        self.parent_node = parent_node
        self.children = []
        self.child_parameters = set()
        self.value = 0
        self.leaf_win = None
        self.check_if_leaf_node()
        self.check_if_fully_expanded()

    def node_count(self):
        return 1 + sum([child.node_count() for child in self.children])

    def check_if_leaf_node(self):
        if len(self.dire_heros) + len(self.radient_heros) == 10:
            self.leaf_node = True
            self.fully_expanded = True
            self.children_fully_expanded = True
        else:
            self.leaf_node = False

    def check_if_fully_expanded(self):
        self.fully_expanded = len(self.children) == len(self.remaining_picks)
        if self.fully_expanded:
            print(self.fully_expanded)

    def get_expansion_node(self):
        best_node = None if self.fully_expanded else self
        best_value = -10**10 if self.fully_expanded else self.value
        for child in self.children:
            child = child.get_expansion_node()
            if child and child.value > best_value and child.leaf_node == False:
                best_value = child.value
                best_node = child
        return best_node

    def radient_win(self):
        self.played += 1
        if self.team == 'radient':
            self.wins += 1
        if self.parent_node:
            self.parent_node.radient_win()
        self.calculate_node_value()

    def radient_loss(self):
        self.played += 1
        if self.team == 'dire':
            self.wins += 1
        if self.parent_node:
            self.parent_node.radient_loss()
        self.calculate_node_value()

    def fully_expand(self):
        return [self.expand_with_choice(o) for o in self.remaining_picks]

    def expand(self):
        try:
            choice =  random.choice([x for x in self.remaining_picks if x not in self.child_parameters])
        except IndexError:
            import pdb; pdb.set_trace()
        return self.expand_with_choice(choice)

    def expand_with_choice(self, choice):
        self.child_parameters.add(choice)
        team, pick_or_ban = self.selection_order[0]
        radient = copy(self.radient_heros)
        dire = copy(self.dire_heros)

        if pick_or_ban == 'pick':
            if team == 'radient':
                radient.append(choice)
            else:
                dire.append(choice)
        remaining_picks = [x for x in self.remaining_picks if x is not choice]
        child_node = DotaMonteCarloNode(choice=choice,
                                        team=other_team(self.team),
                                        parent_node=self,
                                        radient_heros=radient,
                                        dire_heros=dire,
                                        remaining_picks=remaining_picks,
                                        selection_order=self.selection_order[1:])
        self.children.append(child_node)
        self.check_if_fully_expanded()
        return child_node

    def random_game_for_simulation(self):
        if self.leaf_node and self.leaf_win is not None:
            return
        radient, dire = get_random_game(self.radient_heros,
                                        self.dire_heros,
                                        self.remaining_picks,
                                        self.selection_order)
        return radient, dire

    def add_simulation_result(self, result):
        if self.leaf_node:
            self.leaf_win = result
        if result == True: # Radient win
            self.radient_win()
        else:
            self.radient_loss()

    def simulate(self):
        lineup = self.random_game_for_simulation()
        if lineup is None:
            return

        if self.leaf_node and self.leaf_win is not None:
            return
        radient, dire = lineup
        result = play_game(radient, dire)
        self.add_simulation_result(result)

    def calculate_node_value(self):
        child_simulation_count = potential_child_simulations(self.remaining_picks, self.selection_order)
        component_1 = self.wins / self.played
        component_2 = sqrt(log(child_simulation_count)/self.played)
        self.value = component_1 + (exploration_parameter * component_2)


radient = ['storm_spirit', 'spectre', 'silencer']
dire = ['bloodseeker', 'doom_bringer', 'venomancer']

radient = [get_hero_id_from_name(x) for x in radient]
dire = [get_hero_id_from_name(x) for x in dire]

team = 'radient'

selection_order = []
radient_heros_picked = len(radient)
dire_heros_picked = len(dire)

while (radient_heros_picked + dire_heros_picked) != 10:
    if radient_heros_picked <= dire_heros_picked:
        selection_order.append(('radient', 'pick'))
        radient_heros_picked += 1
    else:
        selection_order.append(('dire', 'pick'))
        dire_heros_picked += 1

possible_picks = [x['id'] for x in hero_list['heroes'] if x['name'] not in radient and x['name'] not in dire and x['id'] != 0]

print("Remaining Selection Order: {0}".format(selection_order))
tree = DotaMonteCarloTree(radient_heros=radient,
                          dire_heros=dire,
                          team=team,
                          selection_order=selection_order,
                          possible_picks=possible_picks)
tree.root.fully_expand()
flamegraph.start_profile_thread(fd=open("perf.log", "w"))

for i in range(0, 10):
    print(i)
    tree.run_for_time(1)
    print("Executed {0} steps".format(tree.step_count))
    path = tree.get_best_path()
    print(tree.root.value)
    for node, selection in zip(path, selection_order):
        print("{0} {1} - {2} (of {3}".format(selection[0], selection[1], get_hero_from_id(node.choice)['name'], node.sibling_count))
        print(node.value)
total_possible_options = potential_child_simulations(possible_picks, selection_order)
evaluated = tree.evaluated_node_count()

print("total possible options: {0}".format(total_possible_options))
print("evaluated: {0}".format(evaluated))

print("search space search: {0:f}".format(float(evaluated)/float(total_possible_options)))
