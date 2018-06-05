import { Chart } from './chart.js'
import { Linechart } from './linechart.js'
import { Scatterchart} from './scatterchart.js'
import { Barchart} from './barchart.js'


var timerControl;
var obj
$(document).ready(function(){

    // CHART
    obj = new Chart({
        width: $('.container').width(),
        height: 400,
        margin: {top: 50, right: 30, left: 30, bottom: 20},
        transitions: 300,
        pixelsPerSecond: 10,
        bgColor: '#fff',
        xDomain: [0,100],
        yDomain: [0,2000]
    })

    var module1 = new Barchart({
        chart : obj,
        index : obj.modules.length,
        numBars : 10,
        barsColor : 'orange',
        maxWidth : 0.95,
        startingDomain : [0,100]
    })

    var module2 = new Linechart({
        chart : obj,
        index : obj.modules.length,
        flow  : 'high',
        boxPlotSteps : 20
    })

    var module2 = new Scatterchart({
        chart : obj,
        index : obj.modules.length,
        dotsColor  : 'black',
        dotsRadius : 3,
        squareLength : 10,
        squareColor : 'orange',
        squareDensity : 5
    })


    //OTHERS
    $( "#streamDelay" ).slider({
        min:0.001,
        max:2,
        step:0.01,
        value:1,
        slide: function(event, ui){
            $(this).parent().find('p.ammount').text("1 package per " + ui.value + " seconds")
            streamDelay(ui.value.toString())
        }
    });



    /* Connect WebSocket */
    connect()
    /* Start Rendering */
    timerControl = d3.timer(function(){obj.draw_update()})

})