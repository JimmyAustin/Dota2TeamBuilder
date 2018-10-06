import os


def get_next_filename():
	count = 1
	while True:
		path = './scrape_results/all_matches_{0}.json'.format(count)
		if os.path.exists(path) is False:
			return path
		count = count + 1

print(get_next_filename())