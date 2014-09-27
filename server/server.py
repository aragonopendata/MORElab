#!flask/bin/python
from flask import Flask
from twitter import *
from settings import postgres_db, postgres_pass, postgres_user
import psycopg2
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app)

conn = psycopg2.connect("dbname=%s user=%s password=%s" % (postgres_db, postgres_user, postgres_pass))
cur = conn.cursor()


@app.route('/morelab/api/v1.0/stream')
def index():
    cur.execute("SELECT * FROM tweets ORDER BY datetime DESC LIMIT 20;")
    items = cur.fetchall()
    json_str = '['
    i = 0
    for item in items:
        if i == 0:
            json_str += '{"id": "%s", "text": "%s", "user": "%s", "name": "%s", "lat": "%s", "long": "%s", "datetime": "%s"}' % (item[0], item[1].replace('"', '\\"'), item[2], item[3], item[4], item[5], item[6])
        else:
            json_str += ',{"id": "%s", "text": "%s", "user": "%s", "name": "%s", "lat": "%s", "long": "%s", "datetime": "%s"}' % (item[0], item[1].replace('"', '\\"'), item[2], item[3], item[4], item[5], item[6])
        i += 1

    json_str += ']'

    return json_str

if __name__ == '__main__':
    #browse_tuits.delay()
    #get_stream.delay()
    app.run(debug=True)