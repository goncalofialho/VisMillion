import { Chart } from './chart.js'


export class Connection{
    constructor(options){
        if(options.host == undefined){
            throw new Error('Must provide host address')
        }else if(options.port == undefined){
            throw new Error('Must provide port address')
        }else if(options.chart == undefined && !(options.chart instanceof Chart)){
            throw new Error('Please provide a chart')
        }
        this.socket
        this.host = options.host
        this.port = options.port
        this.chart = options.chart
        this.packs = 0
    }

    connect(){
        var chart = this.chart
        var packs = this.packs
        this.socket = io.connect('http://' + this.host + ':' + this.port)

        this.socket.on('message', function(data){
            let now = new Date()
            chart.data.push({
                ts: now.getTime(),
                data: data
            })
            packs += 1
            $('#package-count p i').text(packs)
        })

        this.socket.on('delay', function(data){
            $('.options > span:first-child p.ammount').text("1 package per " + data["value"] + " seconds")
            $('#streamDelay').slider('value',data["value"])
            $('#delay span').text(data["value"])
        })
    }

    streamDelay(value){
        this.socket.emit('delay', {delay: value})
    }

    pause(){
        this.socket.emit('pause')
    }

    resume(){
        this.socket.emit('resume')
    }
}