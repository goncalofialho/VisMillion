var socket; //= io.connect('http://' + document.domain + ':' + 8002);

function connect(){
    socket = io.connect('http://' + document.domain + ':' + 8002);

    socket.on('pong', function(){
        console.log("Received Pong!");
    });

    socket.on('message', function(data){
       // console.log(data)
       // $('.output').append('<p>'+data["names"]+'</p>')
    })


    socket.on('delay', function(data){
        $('#delay span').text(data["value"])
    })
}
/*
socket.on('connect', function() {
    socket.emit('my event', {data: 'I\'m connected!'});
});*/

function ping(message){
    socket.emit("ping", {data: message});
}

/* MANAGING DELAYS */
function streamDelay(value){
    socket.emit("delay", {delay: value});
}

