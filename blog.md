# Introduction

So while flicking through Arxiv, I ran across a paper called #TODO, which described a system of using a neural network and Monte Carlo Tree Search in order to do Dota 2 team matchups. 

For those who don't know DOTA 2, it's a game developed by Valve Software, featuring two teams (called the Radiant and the Dire) of 5 fighting to destroy the other teams base. Each team selects their 5 heroes from a pool of 120. In "Captains Mode", the mode used during professional games, each game begins with a ordered back and forth process of selecting heroes, as well as banning heroes so that the other team cant select them. Each hero has different strengths and weaknesses, with some being highly effective at countering certain other heroes, while other hero pairs have strong synergies. A team must also be well rounded, with support players leaving resources to "carry" players, who scale more effectively. 

With 120 heroes, and 11 choices by each team (5 picks, 6 bans), the total count of final gamestates is equal to 5.05E24.

Obviously it is computationally intractable to calculate each of these solutions. Fortuantly Monte Carlo Tree Search (MCTS) comes to our aid. Monte Carlo Tree Search is the algorithm that underlies AI like Google's AlphaGo, but is also in use for the AI for many different games that have discrete time steps. 

# Why use Monte Carlo Tree Search?

MCTS has a few very useful properties for us.

1) The algorithm will for as long as possible, but we can cancel it at any point and get the best solution it has found so far. Many Chess AI that use this algorithm can set their difficulty using the same algorithm, just run for varying amounts of time.

2) It's a relatively simple algorithm to implement. It just has four steps.

3) The only game specific code we need is a function that, when given a final game state, can tell us who won.

# The Model Function

Our model is relatively simple. Given 10 heroes, 5 for the radiant and 5 for the dire, output the likelyhood of the Radient winning.

# Collecting and Augmenting Data

In order to train the model, we need examples of games actually being played. Fortuantly Valve has an API we can use to find the results of matches. By navigating the graph of players and the most recent matches they have participated in, we can build a database of matches.

If you don't want to do this, match datasets exist online, though you'll need to correct the format manually.

For the purposes of training this model, I built up a set of roughly 500'000 matches.

Because the order of picks doesn't make any difference once the game has began, teams with different orders of the same heroes are equivilent. This means we can effectively augment our dataset by shuffling the heroes in each team.

# Building a Model

I experimented with a few different ways of representing heroes. These included:

## Seperate one hot encoding. 
This builds a 120 item array for each team, with every value being 0 except for the values with the indexes of the heroes id.
## Integrated one hot encodings. 
A single 120 item array, with the radiant heroes set to 1 and the dire heroes set to negative one.
## Hero embeddings. 
Instead of representing each hero as a value in an array, feed in statistical information about each hero. This information included the heroes base stats (agility, strength, intelligence, range, damage), as well as how they perform during games of bucketed lengths. The median game takes 40 minutes, with the 25th percentile at 33 minutes and the 75th at 48 minutes. 

You can get a feel for how heroes perform over a game by looking at the numbers. For example, Spectre, a hero who begins the game incredibly weakly, has a win percentage of only 44% if the game ends before 33 minutes. By the time the game hits 48 minutes however, this win rate has skyrocketed to 62.9%.  

## Matchups.

We can also increase the accuracy of our model by precomputing matchups strengths for both teammates, and pairs on opposing teams.

# Defining a Model
# Training the Model
# Running the Model In The Browser

One of the core properties of the MCTS algorithm is that the more processing power you throw at it, the better it is. This also means any work we do on the main/ui thread, will be slow and generally unresponsive.

Luckily (with a bit of tweaking of Create React App), we have webworkers to help us! 

For those unfamiliar with the webworker API, it allows us to pass messages backwards and forwards in our threads. This means we can kick off a processing on a worker, then sit back and watch it pass back results to us.


# Team Calculation
# Conclusion