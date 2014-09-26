#!flask/bin/python
from flask import Flask
from twitter import *
from settings import auth

app = Flask(__name__)
twitter = Twitter(auth=auth)


def get_stream():
    print twitter.statuses.home_timeline()

@app.route('/morelab/api/v1.0/stream')
def index():
    get_stream()
    return '[{"user": "foo", "text": "Lorem Ipsum dolosor bla bla bla", "date": "2014-09-24T18:00"}]'

if __name__ == '__main__':
    app.run(debug=True)