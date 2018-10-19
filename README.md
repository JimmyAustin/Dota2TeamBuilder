# Dota 2 Team Builder

The repo can be divided into three sections, scraper, modelling and frontend.

## Scraper

The scraper is fairly basic. It uses the dota2api module and rate limits to 1 second. If it crashes for whatever reason, or you need to reboot, it can resume.

You'll need to set the D2_API_KEY environment variable. You can get a key from: https://steamcommunity.com/dev/registerkey

export D2_API_KEY=83247983248793298732

It'll traverse the graph of players, starting with yours truly. It'll grab the details of a random 5 matches the player has played and save them. It will also keep track of every player in those games, and add them to a list of players to traverse. That list is persisted, so you can restart the process whenever you want.
