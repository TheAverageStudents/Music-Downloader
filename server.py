import spotipy, flask, json

a = spotipy.Spotify(auth_manager=spotipy.oauth2.SpotifyClientCredentials(client_id="714dc4b9b4354f97982be83b2b76b4d5", client_secret="4d1f590c40d043329305965fb7c40d49"))
s = flask.Flask('')
@s.route('/')
def bruh():return "You are not supposed to be here."
@s.route("/t")
def t():
    i = flask.request.url.split("?i=")[1]
    x = a.track(i)
    return { "name" : x["name"], "artist" : x["album"]["artists"][0]["name"], "duration_ms": x["duration_ms"] }
@s.route("/p")
def p():
    i = flask.request.url.split("?i=")[1]
    x = a.playlist(i)
    '''
    ["tracks"]["items"]
    print(x[0]["track"]["duration_ms"])
    o = {}
    c = []
    for j in x:
        c.append(str(j["track"]["name"] + " " + j["track"]["album"]["artists"][0]["name"]))
        #print(j["duration_ms"])
    '''
    return x

s.run(host="0.0.0.0")


#Python is very slow, I'm going to make this code fast.