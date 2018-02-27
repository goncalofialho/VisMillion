from geventwebsocket import WebSocketServer, WebSocketApplication, Resource
from collections import OrderedDict
from faker import Faker
import sched
import time
import json


class EchoApplication(WebSocketApplication):

    def on_open(self):
        self.startedSending = False;
        print("Connection Opened!")

    def on_message(self, message):
        #self.ws.send(message)
        if not self.startedSending:
            if message.decode("utf-8") == "accept":
                self.startedSending = True
                print(message.decode("utf-8") + "startedSending = " + str(startedSending))
                self.s = sched.scheduler(time.time, time.sleep)
                data = {}

                def send_info(sc):
                    print("sending info")
                    self.ws.send("Sending a bunch of crap")
                    for i in range(10):
                        data["id"+str(i)] = fake.name()
                    self.ws.send(json.dumps(data))
                    self.s.enter(1, 1, send_info, (sc,))

                self.s.enter(1, 1, send_info, (self.s,))
                self.s.run()
            else:
                print("received: "+message.decode("utf-8"))
                self.ws.send("Pong '" + message.decode("utf-8") + "'")



    def on_close(self, reason):
        print("Connection Closed! Reason: " + reason)

    def send_message(self, text):
        self.ws.send(text)


if __name__ == '__main__':
    startedSending = False
    print("hello world")
    fake = Faker();
    WebSocketServer(('', 8002), Resource(OrderedDict([('/', EchoApplication)]))).serve_forever()
    s = sched.scheduler(time.time, time.sleep)


