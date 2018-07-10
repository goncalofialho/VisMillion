import { Chart } from './chart.js'
import { Linechart } from './linechart.js'
import { Scatterchart} from './scatterchart.js'
import { Barchart} from './barchart.js'
import { Connection } from './connection.js'


var timerControl;
var obj;
var connection;
$(document).ready(function(){

    // CHART
    obj = new Chart({
        width: $('.container').width() ,
        height: 400,
        margin: {top: 30, right: 40, left: 40, bottom: 25},
        transitions: 300,
        pixelsPerSecond: 10,
        bgColor: '#ffffff',
        xDomain: [0,100],
        yDomain: [1e-6,100],
        yScale: d3.scaleLog(),
        selfDelay: 1000,
        container: d3.select('.bigvis'),
        outlier: true/*,
        outlier_opts : {
            outlierHeight : 100,

        }*/
    })

    // MODULES

    var module1 = new Barchart({
        chart : obj,
        index : obj.modules.length,
        numBars : 20,
        barsColor : 'orange',
        maxWidth : 0.95,
        startingDomain : [0,100]
    })

    var module2 = new Linechart({
        chart : obj,
        index : obj.modules.length,
        flow  : 'high',
        boxPlotSteps : 30,
        deltaRange: 30000
    })

    var module2 = new Scatterchart({
        chart : obj,
        index : obj.modules.length,
        dotsColor  : 'black',
        dotsRadius : 1,
        squareLength : 20,
        squareColor : 'orange',
        squareDensity : 50,
        squareDensityRange : [0, 300],
        maxDotsFlow : 3000,
        deltaRange : 15000
    })

    //CONNECTION
    connection = new Connection({
        host : 'localhost',
        port : '8002',
        chart: obj
    })


    //OTHERS
    $( "#streamDelay" ).slider({
        animate: true,
        min:0.001,
        max:2,
        step:0.001,
        value:1,
        slide: function(event, ui){
            $(this).parent().find('p.ammount').text("1 package per " + ui.value + " seconds")
            connection.streamDelay(ui.value.toString())
        }
    });



    /* Connect WebSocket */
    connection.connect()
    /* Start Rendering */
    obj.start()
})