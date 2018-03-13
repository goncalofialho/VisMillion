from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from time import sleep
from threading import Thread
from faker import Faker
from random import randint


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
THREAD = Thread()
fake = Faker()

class CountThread(Thread):
    """Stream data on Thread"""
    delay = 0.2

    def __init(self):
        super(CountThread, self).__init__()

    def get_data(self):
        """ GET DATA AND EMIT TO SOCKET """
        count = 0
        while True:
            name = ""
            for i in range(10):
                name += (fake.name() + " , ")
            data = dict(names=name[:-3])
            socketio.send(data)
            count += 1
            sleep(self.delay)

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


if __name__ == '__main__':
    socketio.run(app, port=8002)



