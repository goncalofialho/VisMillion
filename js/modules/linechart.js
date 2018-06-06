import { Module } from './module.js'

export class Linechart extends Module{
    constructor(options){
        super(options)
        this.type = 'linechart'

        var endTime = new Date()
        var startTime = new Date(endTime.getTime() - this.own_width / this.chart.pixelsPerSecond * 1000)

        this.y = d3.scaleLinear().domain(this.chart.y.domain()).range([this.chart.height, 0])
        this.x = d3.scaleTime().range([0, this.own_width]).domain([startTime, endTime])

        // OPTIONS
        this.flow = options.flow || 'low'
        this.boxPlots = []
        this.boxPlotSteps = options.boxPlotSteps || 20

        // COLORS
        this.lowLineColor = options.lowLineColor || 'black'
        this.highTopAreaColor = options.highTopAreaColor || 'rgba(0, 0, 255, 0.5)'
        this.highMiddleLineColor = options.highMiddleLineColor || 'rgb(255, 191, 0)'
        this.highBottomAreaColor = options.highBottomAreaColor || 'rgba(255, 0, 0, 0.5)'

        this.appendModuleOptions()
    }


    appendModuleOptions(){
        var options = {
            title: this.type,
            flow: this.flow,
            index: this.index,
            lowLineColor: this.lowLineColor,
            highTopAreaColor: this.highTopAreaColor,
            highMiddleLineColor: this.highMiddleLineColor,
            highBottomAreaColor: this.highBottomAreaColor,
            boxPlotSteps: this.boxPlotSteps
        }


        var markup = `
            <div class="mod-option">
                <h3>${options.title}</h3>
                <fieldset id="linechart${options.index}">
                    <legend>Select Flow </legend>
                    <span class="radiobuttons" >
                        <label for="${options.index}radio-1">Low</label>
                        <input type="radio" name="${options.index}radio-1" id="${options.index}radio-1">
                    </span>
                    <span class="radiobuttons">
                        <label for="${options.index}radio-2">High</label>
                        <input type="radio" name="${options.index}radio-1" id="${options.index}radio-2">
                    </span>
                </fieldset>

                <fieldset class="lineChartColors">
                    <legend>High Flow</legend>
                    <p>
                         <span id="boxPlotStepsText${options.index}">BoxPlot Steps: ${options.boxPlotSteps} </span>
                         <div id="boxPlotSteps${options.index}"></div>
                    </p>
                    <p>
                        <span>Top Area Color: </span>
                        <input type="text" id="highTopAreaColor${options.index}" />
                    </p>
                    <p>
                        <span>Median Line Color: </span>
                        <input type="text" id="highMiddleLineColor${options.index}" />
                    </p>
                    <p>
                        <span>Bottom Area Color: </span>
                        <input type="text" id="highBottomAreaColor${options.index}" />
                    </p>
                </fieldset>
                <fieldset>
                    <legend>Low Flow:</legend>
                    <p>
                        <span>Line Color: </span>
                        <input type="text" id="lowLineColor${options.index}" />
                    </p>
                </fieldset>
            </div>
        `

        $('.modules-options').append(markup)

        var module = this
        options.flow == 'low' ? $('#'+options.index+'radio-1').prop('checked', true) : $('#'+options.index+'radio-2').prop('checked', true)
        $('fieldset#linechart'+options.index+' input[type="radio"]').change(function(){
            $(this).attr('id') == options.index + 'radio-1' ? module.flow = 'low' : module.flow = 'high'
        })

        $('#boxPlotSteps'+options.index).slider({
            min:5,
            max:50,
            step:1,
            value: module.boxPlotSteps,
            slide: function(event, ui){
                $(this).parent().find('#boxPlotStepsText'+module.index).text("BoxPlot Steps: "+ ui.value)
                module.boxPlotSteps = ui.value
            }
        })

        $('#lowLineColor'+options.index).spectrum({
            color: module.lowLineColor,
            showAlpha: true,
            preferredFormat: "rgba",
            showButtons: false,
            move: function(color){
                module.lowLineColor = color.toRgbString()
            }
        })
        $('#highTopAreaColor'+options.index).spectrum({
            color: module.highTopAreaColor,
            showAlpha: true,
            preferredFormat: "rgba",
            showButtons: false,
            move: function(color){
                module.highTopAreaColor = color.toRgbString()
            }
        })
        $('#highMiddleLineColor'+options.index).spectrum({
            color: module.highMiddleLineColor,
            showAlpha: true,
            preferredFormat: "rgba",
            showButtons: false,
            move: function(color){
                module.highMiddleLineColor = color.toRgbString()
            }
        })
        $('#highBottomAreaColor'+options.index).spectrum({
            color: module.highBottomAreaColor,
            showAlpha: true,
            preferredFormat: "rgba",
            showButtons: false,
            move: function(color){
                module.highBottomAreaColor = color.toRgbString()
            }
        })
    }


    update(ts){
        this.own_width = this.chart.width / this.chart.modules.length
        this.x1 =  this.own_width * this.index
        var endTime = new Date(ts - ((this.own_width / this.chart.pixelsPerSecond * 1000) * ((this.chart.modules.length - 1) - this.index) ))
        var startTime = new Date(endTime.getTime() - this.own_width / this.chart.pixelsPerSecond * 1000)

        this.data = this.chart.filterData(startTime, endTime)

        for(var i = 0; i < this.boxPlots.length; i++){
            if(this.boxPlots[i].ts > startTime.getTime())
                break
        }
        this.boxPlots.splice(0,i)

        // UPDATE DOMAINS
        this.x = d3.scaleTime().range([0, this.own_width])
        this.x.domain([startTime, endTime])
        this.y.domain(this.chart.y.domain())

        // GENERATING AREA CHART
        var timeInterval = this.x.domain()
        var steps = this.boxPlotSteps
        var scale = d3.scaleTime().domain(timeInterval).range([0, steps])
        var delta = scale.invert(1).getTime() - scale.invert(0).getTime()

        /* inserting new data */
        if(this.data.length > 0 && this.boxPlots.length == 0){
            var first_element = this.data[0]
            if((first_element.ts + delta) < timeInterval[1].getTime()){
                var elements = this.data.filter( el => first_element.ts  <= el.ts && (first_element.ts + delta) > el.ts )
                elements = elements.map( el => el.data ).sort(function(a,b){return a-b})
                this.boxPlots.push({
                    0.25 : d3.quantile(elements, .25),
                    0.50 : d3.quantile(elements, .50),
                    0.75 : d3.quantile(elements, .75),
                    ts   : first_element.ts + (delta / 2)
                })
            }
        }else if(this.boxPlots.length > 0){
            var first_ts = this.boxPlots[0].ts
            var i = this.boxPlots.length
            var timestamp = first_ts + (delta * i)
            if((timestamp + delta) < timeInterval[1].getTime()){
                var elements = this.data.filter( el => timestamp  <= el.ts && (timestamp + delta) > el.ts )
                elements = elements.map( el => el.data ).sort(function(a,b){return a-b})
                this.boxPlots.push({
                    0.25 : d3.quantile(elements, .25),
                    0.50 : d3.quantile(elements, .50),
                    0.75 : d3.quantile(elements, .75),
                    ts   : timestamp + (delta / 2)
                })
            }
        }
    }


    draw(){
        var context = this.chart.context
        var parent = this
        if(this.flow == 'low'){
            var lineGenerator = d3.line()
                    .x(function(d){ return parent.chart.margin.left + parent.x1 + parent.x(d.ts); })
                    .y(function(d){ return parent.chart.margin.top + parent.y(d.data); })
                    .curve(d3.curveBasis)
                      .context(context)

            context.beginPath()
            lineGenerator(this.data)
            context.strokeStyle = this.lowLineColor
            context.stroke()
            context.closePath()
        }else{
            var areaInferior = d3.area()
                    .x(function(d){ return parent.x1 + parent.chart.margin.left + parent.x(d.ts) })
                    .y1(function(d){ return parent.chart.margin.top + parent.y(d['0.25'])})
                    .y0(function(d){ return parent.chart.margin.top + parent.y(d['0.5'])})
                    .curve(d3.curveBasis)
                    .context(context)

            var areaSuperior = d3.area()
                    .x(function(d){ return parent.x1 + parent.chart.margin.left + parent.x(d.ts) })
                    .y1(function(d){ return parent.chart.margin.top + parent.y(d['0.75'])})
                    .y0(function(d){ return parent.chart.margin.top + parent.y(d['0.5'])})
                    .curve(d3.curveBasis)
                    .context(context)

            var mediana = d3.line() //d3.area()
                    .x(function(d){ return parent.x1 + parent.chart.margin.left + parent.x(d.ts) })
                    .y(function(d){ return parent.chart.margin.top + parent.y(d['0.5'])})
                    .curve(d3.curveBasis)
                    .context(context)

            context.beginPath()
            areaInferior(this.boxPlots)
            context.fillStyle = this.highBottomAreaColor
            context.fill()
            context.closePath()

            context.beginPath()
            areaSuperior(this.boxPlots)
            context.fillStyle = this.highTopAreaColor
            context.fill()
            context.closePath()

            context.beginPath()
            mediana(this.boxPlots)
            context.lineWidth = 3
            context.strokeStyle = this.highMiddleLineColor
            context.stroke()
            context.lineWidth = 1
            context.closePath()
        }
    }
}