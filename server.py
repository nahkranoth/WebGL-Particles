from flask import Flask, send_from_directory
from flask import render_template
from flask import make_response


app = Flask(__name__)

def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r

@app.route('/')
def hello(name=None):
    r = make_response(render_template('index.html'))
    add_header(r)
    return r

@app.route('/<path:path>')
def send_html(path):
    r = make_response(send_from_directory('static', path))
    add_header(r)
    return r

app.run(host='0.0.0.0', port='2000')
app.debug = True


