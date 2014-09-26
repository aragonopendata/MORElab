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

app = Celery('tasks', broker='redis://localhost:6379/0')

twitter = Twitter(auth=auth)
twitter_stream = TwitterStream(auth=auth)

conn = psycopg2.connect("dbname=%s user=%s password=%s" % (postgres_db, postgres_user, postgres_pass))
cur = conn.cursor()

redis = redis.StrictRedis(host='localhost', port=6379, db=0)

sents = conll2002.tagged_sents()
hmm_tagger = HiddenMarkovModelTagger.train(sents)

print 'Tagger ready'

def analyze_tweet(text):
    tokens = word_tokenize(text)
    tags = hmm_tagger.tag(tokens)
    for tag in tags:
        if tag[1] == 'NP':
            if redis.exists('aragopedia:%s' % tag[0]):
                if redis.get('aragopedia:%s' % tag[0]) == 'None':
                    return False
                else:
                    return True
            else:
                payload = {'action': 'query', 'list': 'search', 'srwhat': 'title', 'srsearch': '%s' % tag[0], 'format': 'json'}
                r = requests.get('http://opendata.aragon.es/aragopedia/api.php', params=payload)
                json_result = json.loads(r.text)
                try:
                    if len(json_result['query']['search']) > 0:
                        title = json_result['query']['search'][0]['title']
                        redis.set('aragopedia:%s' % tag[0], title)
                        print text
                        print tag[0]
                        print title
                        return True
                    else:
                        redis.set('aragopedia:%s' % tag[0], 'None')
                except:
                    print r.text

@app.task
def browse_tuits():
    max_id = None
    tweets = twitter.search.tweets(q='', geocode='40.418889,-3.691944,750km', lang='es', count='1000')
    for tweet in tweets['statuses']:
        text = tweet['text']
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
        except:
            pass
        if max_id == None:
            max_id = tweet['id']
        elif max_id > tweet['id']:
            max_id = tweet['id']
    conn.commit()

    while True:
        #sleep()
        try:
            tweets = twitter.search.tweets(q='', geocode='40.418889,-3.691944,750km', lang='es', count='1000', max_id=max_id)
        except:
            continue
        max_id = None
        for tweet in tweets['statuses']:
            text = tweet['text']
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
            except:
                pass
            if max_id == None:
                max_id = tweet['id']
            elif max_id > tweet['id']:
                max_id = tweet['id']
        conn.commit()

@app.task
def get_stream():
    iterator = twitter_stream.statuses.filter(locations='-180,-90,180,90', language='es')

    for tweet in iterator:
        text = tweet['text']
        if analyze_tweet(text):
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
            except:
                print 'Error!'