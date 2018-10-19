# Dota 2 Team Builder

## What is it?

The Dota 2 Team Builder guides you through a captains mode draft. It handles both bans and picks for both sides. It runs entirely in the users browser, and was implemented using React, Tensorflow.js, and Keras on the backend.

## How does it work?

It uses a Monte Carlo Tree Search running inside a web worker. The MCTS evaluation function is a neural network run using Tensorflow.js. The code is pretty bad.

## Wheres the code?


The repo can be divided into three sections, scraper, modelling and frontend.

### Scraper

The scraper is fairly basic. It uses the dota2api module and rate limits to 1 second. If it crashes for whatever reason, or you need to reboot, it can resume.

You'll need to set the D2_API_KEY environment variable. You can get a key from: https://steamcommunity.com/dev/registerkey

export D2_API_KEY=83247983248793298732

It'll traverse the graph of players, starting with yours truly. It'll grab the details of a random 5 matches the player has played and save them. It will also keep track of every player in those games, and add them to a list of players to traverse. That list is persisted, so you can restart the process whenever you want.

### Modelling 

The basic purpose of the model is: Given two teams of five heroes, which team will win. There is a script called train_search.py which will randomly test various feature sets. Model checkpoints will be saved into the tmp file. 

The modelling folder also has a rudimentary MVP of the MCTS algorithm.

### Frontend

I'm a really unexperienced frontend developer, so this is quite rudimentary. It's a fairly basic Create React App. 

## Updating the model

You can turn the hdf5 model sitting in the modelling/tmp folder into the right format for the webapp using this: https://js.tensorflow.org/tutorials/import-keras.html

Replace the existing model files in frontend/public/. You'll also need to edit the "TeamEvaluator.js" file so that it feeds the right inputs into the model.

# TODO:

- Make it even slightly attractive
- Add tests
- Clean up the code
