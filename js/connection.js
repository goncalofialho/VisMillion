var socket;
var minScatter = null; maxScatter = null;
var packs = 0;
function connect(chart){
    socket = io.connect('http://' + document.domain + ':' + 8002);

    socket.on('pong', function(){
        console.log("Received Pong!");
    });

    socket.on('message', function(data){

        var now = new Date()

        chart.data.push({
            ts: now.getTime(),
            data: data
        })

/*        obj.modules[obj.modules.length-1].data.push({
                ts: now.getTime() ,
                data: data
            })*/
        packs += 1
        $('#package-count p i').text(packs)
       // $('.output').append('<p>'+data["names"]+'</p>')
    })


    socket.on('delay', function(data){
        $('.options > span:first-child p.ammount').text("1 package per " + data["value"] + " seconds")
        $('#streamDelay').slider('value',data["value"])
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
