from celery import Celery
from twitter import *
from settings import auth
from nltk.corpus import conll2002
from nltk.tag.hmm import HiddenMarkovModelTagger

app = Celery('tasks', broker='redis://localhost:6379/0')

twitter = Twitter(auth=auth)

sents = conll2002.tagged_sents()
hmm_tagger = HiddenMarkovModelTagger.train(sents)

@app.task
def browse_tuits():
    max_id = None
    tweets = twitter.search.tweets(q='', geocode='40.418889,-3.691944,750km', lang='es', count='100')
    for tweet in tweets['statuses']:
        text = tweet['text']
        print text
        if max_id == None:
            max_id = tweet['id']
        elif max_id > tweet['id']:
            max_id = tweet['id']
    while True:
        try:
            tweets = twitter.search.tweets(q='', geocode='40.418889,-3.691944,750km', lang='es', count='100', max_id=max_id)
        except:
            continue
        max_id = None
        for tweet in tweets['statuses']:
            text = tweet['text']
            print text
            if max_id == None:
                max_id = tweet['id']
            elif max_id > tweet['id']:
                max_id = tweet['id']