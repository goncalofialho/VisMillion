import { Chart } from './chart.js'
import { Linechart } from './linechart.js'
import { Scatterchart} from './scatterchart.js'
import { Barchart} from './barchart.js'
import { Connection } from './connection.js'
'use strict';

var timerControl;
var obj;
var connection;
var usability_test = undefined;
var usability_arr = usability_test != undefined ? [] : undefined;

$(document).ready(function(){
	//$('.modules-options').css('display','none')
	// CHART - EXAMPLE/
  /*  obj = new Chart({
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
        sci_notation: true,
        outlier: true
    })
	
	*/
	// CHART
    obj = new Chart({
        width: $('.container').width() ,
        height: 400,
        margin: {top: 30, right: 40, left: 40, bottom: 25},
        transitions: 300,
        pixelsPerSecond: 10,
        bgColor: '#ffffff',
        xDomain: [0,100],
        yDomain: [0,100],
        yScale: d3.scaleLinear(),
        selfDelay: 1000,
        container: d3.select('.bigvis'),
        sci_notation: false,
        outlier: true
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
        deltaRange: 30000,
        lineCurve : d3.curveCardinal,
        maxmin: true
    })

    var module2 = new Scatterchart({
        chart : obj,
        index : obj.modules.length,
        dotsColor  : 'black',
        dotsRadius : 1,
        squareLength : 25,
        squareColor : 'orange',
        squareDensity : 45,
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

    //Usability Tests Register
    if(usability_test != undefined) {
        document.querySelector('html').addEventListener('keypress', function(e){
            if(e.key === 'Enter'){
                let ts = new Date()
                let delta = ts - obj.data[0].ts - obj.selfDelay
                usability_arr.push(delta)
                document.cookie='test'+usability_test+'='+JSON.stringify(usability_arr)+'; expires=Thu, 18 Dec 2025 12:00:00 UTC'
            }
        })
    }
})