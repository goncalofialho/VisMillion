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
        this.flowPerSecond = 1
        this.chart.connection = this

        this.divOptions(this.chart)
    }

    divOptions(){
        var markup = `
            <p>
                <button type="button" status="resume" class="btn btn-primary" disabled><i class="fas fa-play"></i>Resume</button>
                <button type="button" status="pause" class="btn btn-warning"><i class="fas fa-pause"></i>Pause</button>
            </p>
        `
        $('#chartOptions').append(markup)

        var parent = this
        $('#chartOptions button').on('click', function(){
            $(this).parent().find('button').attr('disabled', false)
            $(this).attr('disabled', true)
            if($(this).attr('status') == 'resume'){
                parent.resume()
                parent.chart.resume()
            }else{
                parent.pause()
                parent.chart.pause()
            }
        })
    }

    connect(){
        var chart = this.chart
        var packs = this.packs
        this.socket = io.connect('http://' + this.host + ':' + this.port)

        this.socket.on('message', function(data){
            var now
            if(data['ts'] != undefined){
                now = new Date(data['ts'] * 1000)
            }else{
                now = new Date()
            }
            chart.data.push({
                ts: now.getTime(),
                data: data['val']
            })

            packs += 1
            //if (packs % 1000 == 0) console.log('1000 packs: ' + transformDate(now))
            $('#package-count p:first-child i').text(packs)

            if (data['val'] >= 100) {
                chart.outliers.push(new Date())
                //console.log('OUTLIER!')
                //console.log(data['val'])
            }
        })
        var connection = this
        this.socket.on('delay', function(data){
            $('.options > span:first-child p.ammount').text("1 package per " + data["value"] + " seconds")
            $('#streamDelay').slider('value',data["value"])
            $('#delay span').text(data["value"])
            connection.flowPerSecond = 1 / data['value']
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