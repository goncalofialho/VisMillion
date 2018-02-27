import websocket

ws = websocket.WebSocketApp("ws:")
if __name__ == "__main__":
    websocket.enableTrace(True)