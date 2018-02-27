var wsUri = "ws://localhost:8002/";
var output, websocket;


function init(){
    output = $('.output');
    testWebSocket();
}

function testWebSocket(){
    websocket = new WebSocket(wsUri);
    websocket.onopen = function(evt) { writeToScreen("CONNECTED"); doSend("Hello server, I am a client")}
    websocket.onclose = function(evt) { writeToScreen("DISCONNECTED");}
    websocket.onmessage = function(evt) { writeToScreen("RECEIVED: " + evt.data)}
    websocket.onerror = function(evt) {writeToScreen("ERROR: " + evt.data)}
}

function writeToScreen(message){
    output.append('<p>' + message + '</p>')
}

function doSend(message){
    writeToScreen("SENT: "+message)
    websocket.send(message)
}