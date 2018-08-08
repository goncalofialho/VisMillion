from flask import Flask
from flask_socketio import SocketIO, emit
from time import sleep
from threading import Thread
import threading
import pandas as pd
import time
from dateutil import tz
import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
THREAD = Thread()
"""
csvfile = pd.read_csv('Taxi_Trips_sample.csv', encoding='utf-8')
column_timestamp = 'Trip Start Timestamp'
csvfile = csvfile.sort_values(by=column_timestamp)
column = 'Trip Seconds'
maximum = len(csvfile.index)
"""
csvfile = pd.read_csv('usabilityTests4.csv', encoding='utf-8')
#csvfile = pd.read_csv('usabilityTest1_2.csv', encoding='utf-8')
column_timestamp = 'delta'
#csvfile = csvfile.sort_values(by=column_timestamp)
column = 'trans_satoshis'
maximum = len(csvfile.index)
start_at = 0

class CountThread(Thread):
    """Stream data on Thread"""

    def __init__(self):
        super(CountThread, self).__init__()
        self.delay = 1
        self.paused = False
        self.pause_cond = threading.Condition(threading.Lock())

    def get_data(self):
        """ GET DATA AND EMIT TO SOCKET """
        count = start_at
        while True:
            with self.pause_cond:
                while self.paused:
                    self.pause_cond.wait()
                item = csvfile.iloc[count]
                val = item['trans_satoshis']
                if not str(val) == 'nan':
                    #socketio.send({'val': float(val), 'ts': int(time.mktime(datetime.datetime.utcnow().timetuple())) * 1000})
                    socketio.send({'val': float(val), 'ts': datetime.datetime.now().timestamp()})
                else:
                    print("NaN found at " + str(count))

                if count % 1000 == 0:
                    print(datetime.datetime.utcnow())

                count += 1
                if count >= maximum:
                    exit()
            sleep(item['delta'] / 1000)
            #sleep(self.getDelay())

    def getDelay(self):
        return self.delay

    def setDelay(self, value):
        self.delay = value

    def pause(self):
        self.paused = True
        self.pause_cond.acquire()

    def resume(self):
        self.paused = False
        self.pause_cond.notify()
        self.pause_cond.release()

    def run(self):
        """Default run method"""
        self.get_data()


@socketio.on('my event')
def test_message(message):
    print("my event!!!!!")
    emit('my response', {'data': 'got it!'})


@socketio.on("ping")
def handle_pong(message):
    print("Received Ping, responding pong!")
    print("Ping data: " + message["data"])
    emit('pong', {"data": "Pong"})


@socketio.on("delay")
def update_delay(value):
    print("Changing delay from: " + str(THREAD.getDelay()) + "s to "+value['delay'] + "s")
    THREAD.setDelay(float(value['delay']))
    emit('delay', {"value": THREAD.getDelay()})


@socketio.on('message')
def handle_message(message):
    print('received message: ' + message)

@socketio.on("pause")
def pause():
    print("Pausing Thread")
    THREAD.pause()
    emit('delay', {"value": '0'})

@socketio.on("resume")
def resume():
    print("Resuming Thread")
    THREAD.resume()
    emit('delay', {"value": '0'})


"""
@socketio.on('connect')
def test_connect():
    print("connected")
    emit('my response', {'data': "Connected"})
"""


@socketio.on('connect')
def connect_socket():
    print("someone connected!")
    """ Handle socket connection """
    global THREAD

    #Start Thread
    if not THREAD.isAlive():
        print("Started streaming")
        THREAD = CountThread()
        THREAD.start()
    emit('delay', {"value": THREAD.getDelay()})


if __name__ == '__main__':
    socketio.run(app, port=8002)
