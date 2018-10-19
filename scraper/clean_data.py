import json
from os.path import join
from toolbox.notebook.fs import *
from utils import *

file_count = 100

input_directory = './scraper/scrape_results'
output_directory = './scraper/cleaned_data/'

def file_ref(i):
	return open(join(output_directory, str(i).zfill(5) + ".json"), 'wb')

files = [file_ref(i) for i in range(0, file_count)]

for line in get_json_lines_in_folder(input_directory):
	if proper_match(line) is True:
		index = bucket_string(json.dumps(line), bucket_count=file_count)
		files[index].write(json.dumps(line).encode('utf-8'))
		files[index].write('\n'.encode('utf-8'))
