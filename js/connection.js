var socket;
var minScatter = null; maxScatter = null;
function connect(){
    socket = io.connect('http://' + document.domain + ':' + 8002);

    socket.on('pong', function(){
        console.log("Received Pong!");
    });

    socket.on('message', function(data){
      //  console.log(data)
      if(minScatter == null && maxScatter == null){
        minScatter = data
        maxScatter = data
      }
      if(data > maxScatter){
        maxScatter = data
      }
      if(data < minScatter){
        minScatter = data
      }

        var now = new Date()
        obj.modules[obj.modules.length-1].data.push({
                ts: now.getTime() ,
                data: data
            })
       // $('.output').append('<p>'+data["names"]+'</p>')
    })


    socket.on('delay', function(data){
        $('#delay span').text(data["value"])
    })
}


function ping(message){
    socket.emit("ping", {data: message});
}

/* MANAGING DELAYS */
function streamDelay(value){
    socket.emit("delay", {delay: value});
}
