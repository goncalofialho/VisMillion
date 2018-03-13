var socket = io.connect('http://' + document.domain + ':' + 8002);

/*
socket.on('connect', function() {
    socket.emit('my event', {data: 'I\'m connected!'});
});*/

function ping(message){
    socket.emit("ping", {data: message});
}

socket.on('pong', function(){
    console.log("Received Pong!");
})

socket.on('message', function(data){
    console.log(data)
    $('.output').append('<p>'+data["names"]+'</p>')
})