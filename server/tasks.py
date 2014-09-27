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

DIFF_THRESHOLD = 0.75
#twitter_stream = None
app = Celery('tasks', broker='redis://localhost:6379/0')



conn = psycopg2.connect("dbname=%s user=%s password=%s" % (postgres_db, postgres_user, postgres_pass))
cur = conn.cursor()

# redis = redis.StrictRedis(host='localhost', port=6379, db=0)

sents = conll2002.tagged_sents()
hmm_tagger = HiddenMarkovModelTagger.train(sents)

print 'Tagger ready'

def analyze(text, track_list):
    tokens = word_tokenize(text)
    tags = hmm_tagger.tag(tokens)
    for tag in tags:
        if tag[0] in track_list:
            if tag[1].startswith('N') and len(tag[1]) <= 2:
                print text
                print tag
                return True
                break
    return False

@app.task
def get_stream(query_pool):
    twitter_stream = TwitterStream(auth=auth)
    for query in query_pool:
        print query
        track_list = query.split(',')
        # for item in query.split(','):
        #     track_list.append(item.lower())
        #iterator = twitter_stream.statuses.filter(locations='-180,-90,180,90', language='es')
        iterator = twitter_stream.statuses.filter(track=query, language='es')
        p = Pool(5)
        p.map(lol, [iterator])
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