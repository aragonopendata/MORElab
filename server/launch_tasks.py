from celery import Celery
from twitter import *
from settings import auth, postgres_db, postgres_pass, postgres_user
import psycopg2
import time
from nltk.corpus import conll2002
from nltk.tag.hmm import HiddenMarkovModelTagger
from nltk import word_tokenize
import requests
import json
import redis
import difflib
from time import sleep
from celery.signals import celeryd_init
from multiprocessing import Pool
from nltk import UnigramTagger, BigramTagger, TrigramTagger

def analyze(text, track_list):
    for item in track_list:
        if item in text:
            if len(item.split(' ')) > 1:
                print text
                return True

    tokens = word_tokenize(text)
    tags = hmm_tagger.tag(tokens)
    i = 0
    for tag in tags:
        if tag[0] in track_list:
            if tag[1] != None:
                if tag[1].startswith('N') and len(tag[1]) <= 2:
                    if i > 0:
                        if tags[i-1][1] != None:
                            if tags[i-1][1].startswith('D'):
                                continue
                        else:
                            continue
                    print text
                    print tags
                    print tag
                    return True

        i += 1
    return False

DIFF_THRESHOLD = 0.75


conn = psycopg2.connect("dbname=%s user=%s password=%s" % (postgres_db, postgres_user, postgres_pass))
cur = conn.cursor()

sents = conll2002.tagged_sents()
hmm_tagger = BigramTagger(sents)

query_pool = []

sparql_query = '''select ?label (?menPopulation + ?womenPopulation) as ?sum where {?s a <http://dbpedia.org/ontology/Municipality> .
?s rdfs:label ?label .
?s <http://opendata.aragon.es/def/Aragopedia#menPopulation> ?menPopulation .
?s <http://opendata.aragon.es/def/Aragopedia#menPopulation> ?womenPopulation .
} ORDER BY DESC(?sum) LIMIT 400
'''
print sparql_query
payload = {'query': sparql_query, 'format': 'json'}
r = requests.get('http://opendata.aragon.es/sparql', params=payload)

query = ''
json_result = json.loads(r.text)
i = 0
for item in json_result['results']['bindings']:
    label = item['label']['value']
    if i == 0:
        query += label
    else:
        query += ',' + label
    i += 1


twitter_stream = TwitterStream(auth=auth)
print query
track_list = query.split(',')
iterator = twitter_stream.statuses.filter(track=query, language='es')
for tweet in iterator:
        text = tweet['text']
        if analyze(text, track_list):
            user = tweet['user']['screen_name']
            name = tweet['user']['name']
            id = tweet['id']
            lat, long = None, None
            if tweet['coordinates'] != None:
                lat = tweet['coordinates']['coordinates'][1]
                long = tweet['coordinates']['coordinates'][0]
            datetime = time.strftime('%Y-%m-%d %H:%M:%S', time.strptime(tweet['created_at'],'%a %b %d %H:%M:%S +0000 %Y'))
            query = "INSERT INTO tweets (id, text, uzers, name, lat, long, datetime) VALUES (%s, %s, %s, %s, %s, %s, %s)"
            try:
                cur.execute(query, (id, text, user, name, lat, long, datetime))
                conn.commit()
            except Exception as e:
                print e
                print 'Error!'
#get_stream.delay(query_pool)
#browse_tuits.delay()