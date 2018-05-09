from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from time import sleep
from threading import Thread
from faker import Faker
from random import randint
import pandas as pd

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
THREAD = Thread()
fake = Faker()
csvfile = pd.read_csv('datasets/Taxi_Trips_full.csv', encoding='utf-8', nrows=10000)
maximum = len(csvfile.index)


class CountThread(Thread):
    """Stream data on Thread"""
    delay = 1

    def __init(self):
        super(CountThread, self).__init__()
        self.delay = 0.1

    def get_data(self):
        """ GET DATA AND EMIT TO SOCKET """
        count = 0
        while True:
            socketio.send(int(csvfile.iloc[count]['Trip Seconds']))
            print(csvfile.iloc[count]['Trip Seconds'])
            count += 1
            if count > maximum:
                exit()
            sleep(self.getDelay())

    def getDelay(self):
        return self.delay

    def setDelay(self, value):
        self.delay = value

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


# TODO: CONNECT TO DATASET