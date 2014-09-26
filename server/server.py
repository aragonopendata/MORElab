#!flask/bin/python
from flask import Flask
from twitter import *
from tasks import browse_tuits

app = Flask(__name__)
browse_tuits()

@app.route('/morelab/api/v1.0/stream')
def index():
    return '[{"user": "foo", "text": "Lorem Ipsum dolosor bla bla bla", "date": "2014-09-24T18:00"}]'

if __name__ == '__main__':
    app.run(debug=True)