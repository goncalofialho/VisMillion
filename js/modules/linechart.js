import { Module } from './module.js'

export class Linechart extends Module{
    constructor(options){
        super(options)
        this.type = 'linechart'

        this.deltaRange = options.deltaRange || 35000
        var endTime = new Date()
        var startTime = new Date(endTime.getTime() - this.own_width / this.chart.pixelsPerSecond * 1000)

        this.y = this.chart.yScale.copy() //d3.scaleLinear().domain(this.chart.y.domain()).range([this.chart.height, 0])
        this.x = d3.scaleTime().range([0, this.own_width]).domain([startTime, endTime])

        // OPTIONS
        this.flow = options.flow || 'low'
        this.boxPlots = []
        this.dots = []
        this.boxPlotSteps = options.boxPlotSteps || 20
        this.maxmin = options.maxmin || false
        this.lineCurve = options.lineCurve || d3.curveBasis
        // COLORS
        this.lowLineColor = options.lowLineColor || 'black'
        this.highTopAreaColor = options.highTopAreaColor || 'rgba(0, 0, 255, 0.5)'
        this.highMiddleLineColor = options.highMiddleLineColor || 'rgb(255, 191, 0)'
        this.highBottomAreaColor = options.highBottomAreaColor || 'rgba(255, 0, 0, 0.5)'

        this.appendModuleOptions()
        this.verticalLine = d3.select('body').append('div')
                        .attr('class', 'verticalLine')
                        .attr('id', this.type + '' + this.index)
                        .style('height', this.chart.height + 'px')
                        .style('top', this.chart.canvas._groups[0][0].offsetTop + this.chart.margin.top + 'px')
        this.verticalLineTS = this.verticalLine.append('span')
                         .attr('class', 'verticalLineTS')
    }



    mouseEvent(x, y, tooltip, event){
        var notFound = true

        var timeInterval = this.x.domain()
        var steps = this.boxPlotSteps
        var scale = d3.scaleTime().domain(timeInterval).range([0, steps])
        var delta = scale.invert(1).getTime() - scale.invert(0).getTime()
        for(var i = 0; i < this.boxPlots.length; i++){
            // CHECKS IF BOX IS DISPLAYED
            if(this.x(this.boxPlots[i].ts) > this.own_width || this.x(this.boxPlots[i].ts) < 0){
                //console.log(i + ' not displaying')
                continue
            }
            let xBox = this.x1 + this.chart.margin.left + (this.x(this.boxPlots[i].ts - delta)) - 5 // THIS 5 PREVENTS BUG FROM ROUNDING TIMESTAMPS AT UPDATE PHASE (delta/2)
            let width = this.x(this.boxPlots[i].ts + delta) - (this.x(this.boxPlots[i].ts - delta))
            let yBox = this.chart.margin.top + this.y(this.boxPlots[i][0.75])
            let height = Math.abs(this.y(this.boxPlots[i]['0.25']) - this.y(this.boxPlots[i]['0.75']))

            if(insideBox({x:x, y:y},{x:xBox, y:yBox, width: width, height: height})){
                //console.log('Displaying box ' + i)
                var val = i
                var upperQuantile = this.chart.sci_notation ? reduceNumber(this.boxPlots[i]['0.75'], 5, 3) : this.boxPlots[i]['0.75'].toFixed(2)
                var lowerQuantile = this.chart.sci_notation ? reduceNumber(this.boxPlots[i]['0.25'], 5, 3) : this.boxPlots[i]['0.25'].toFixed(2)
                var median        = this.chart.sci_notation ? reduceNumber(this.boxPlots[i]['0.5'], 5, 3)  : this.boxPlots[i]['0.5'].toFixed(2)
                var maximum       = this.chart.sci_notation ? reduceNumber(this.boxPlots[i]['max'], 5, 3)  : this.boxPlots[i]['max'].toFixed(2)
                var minimum       = this.chart.sci_notation ? reduceNumber(this.boxPlots[i]['min'], 5, 3)  : this.boxPlots[i]['min'].toFixed(2)

                var markup = `
                            <span>
                                <p>Quartile 0.75 - <i>${upperQuantile}</i></p>
                                <p>Median 0.5 - <i>${median}</i></p>
                                <p>Quartile 0.25 - <i>${lowerQuantile}</i></p>
                                <p>Maximum - <i>${maximum}</i></p>
                                <p>Minimum - <i>${minimum}</i></p>
                            </span>
                            `
                tooltip.html(markup)
                tooltip
                    .style('top', event.pageY + 5 + 'px')
                    .style('left', event.pageX + 5 + 'px')
                    .classed('open', true)
                this.verticalLine
                    .style('left', event.pageX + 'px')
                    .classed('open', true)

                var others_width = 0
                for(let i = 0; i < this.index; i++){
                    others_width += this.chart.modules[i].own_width
                }
                var timestamp = this.x.invert(x - others_width - this.chart.margin.left)

                this.verticalLineTS
                    .text(transformDate(timestamp))

                notFound = false
                break
            }

        }

        if( notFound ){
            tooltip
                .classed('open', false)
            this.verticalLine
                .classed('open', false)
        }
    }
    clearSpecificToolTips(){
        this.verticalLine
            .classed('open', false)
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
        //var endTime = new Date(ts - ((this.own_width / this.chart.pixelsPerSecond * 1000) * ((this.chart.modules.length - 1) - this.index) ))
        //var startTime = new Date(endTime.getTime() - this.own_width / this.chart.pixelsPerSecond * 1000)
        var endTime = new Date(ts - this.chart.getDeltaTime(this.index))
        var startTime = new Date(endTime.getTime() - this.deltaRange )

        // GENERATING AREA CHART
        var timeInterval = this.x.domain()
        var steps = this.boxPlotSteps
        var scale = d3.scaleTime().domain(timeInterval).range([0, steps])
        var delta = scale.invert(1).getTime() - scale.invert(0).getTime()
        var graphsInFront
        if(this.chart.modules[this.index + 1] == undefined){
            graphsInFront = 0
        }else{
            graphsInFront = 3
        }
        this.data = this.chart.filterData(startTime, new Date(endTime.getTime() + (delta * 3)))
        this.data = this.data.filter( el => el.data <= this.chart.y.domain()[1] && el.data > 0)
        //TODO: QUANDO O LINECHART É O MAIS A DIREITA NAO ESTA A DESENHAR PORQUE NAO HA PONTOS NO FUTURO!!! TIRAR GRAPHS IN FRONT, RESOLVER SALTO

        // UPDATE DOMAINS
        this.x = d3.scaleTime().range([0, this.own_width])
        this.x.domain([startTime, endTime])
        this.y.domain(this.chart.y.domain())


        for(var i = 0; i < this.boxPlots.length; i++){
            if(this.boxPlots[i].ts > startTime.getTime() - delta * 2)
                break
        }


        this.boxPlots.splice(0,i)

        /* inserting new data */
        if(this.data.length > 0 && this.boxPlots.length == 0){
            var first_element = this.data[0]
            if((first_element.ts + delta) < timeInterval[1].getTime() + (delta * graphsInFront )){
                var elements = this.data.filter( el => first_element.ts  <= el.ts && (first_element.ts + delta) > el.ts )
                elements = elements.map( el => el.data ).sort(function(a,b){return a-b})
                this.boxPlots.push({
                    0.25 : d3.quantile(elements, .25),
                    0.50 : d3.quantile(elements, .50),
                    0.75 : d3.quantile(elements, .75),
                    ts   : first_element.ts + (delta / 2),
                    max  : elements[elements.length - 1],
                    min  : elements[0]
                })
            }
        }else if(this.boxPlots.length > 0){
            var first_ts = this.boxPlots[0].ts
            var i = this.boxPlots.length
            var timestamp = first_ts + (delta * i)
            if((timestamp + delta) < timeInterval[1].getTime() + (delta * graphsInFront )){
                var elements = this.data.filter( el => timestamp  <= el.ts && (timestamp + delta) > el.ts )
                elements = elements.map( el => el.data ).sort(function(a,b){return a-b})
                this.boxPlots.push({
                    0.25 : d3.quantile(elements, .25),
                    0.50 : d3.quantile(elements, .50),
                    0.75 : d3.quantile(elements, .75),
                    ts   : timestamp + (delta / 2),
                    max  : elements[elements.length - 1],
                    min  : elements[0]
                })
            }
        }

        if(this.chart.modules[this.index + 1] != undefined && this.chart.modules[this.index + 1].type == 'scatterchart' && this.chart.modules[this.index + 1].flow != 'high'){
            this.dotsOptions = {
                    color : this.chart.modules[this.index + 1].dotsColor,
                    r     : this.chart.modules[this.index + 1].dotsRadius,
                    vanish: d3.scaleLinear().domain([new Date(endTime.getTime() - (delta * graphsInFront)),endTime]).range(['transparent', this.chart.modules[this.index + 1].dotsColor]).interpolate(d3.interpolateRgb)
            }
            this.dots = this.chart.filterData(new Date(endTime.getTime() - (delta * graphsInFront)),endTime)
            this.dots = this.dots.filter( el => el.data <= this.chart.y.domain()[1])
        }
        if(this.chart.modules[this.index + 1] != undefined && this.chart.modules[this.index + 1].flow == 'high'){
            this.dots = []
        }

    }


    draw(){
        var context = this.chart.context
        var parent = this

        context.beginPath()
        context.moveTo(parent.x1 + parent.chart.margin.left + parent.own_width, parent.chart.margin.top)
        context.lineTo(parent.x1 + parent.chart.margin.left + parent.own_width, parent.chart.margin.top + parent.chart.height)
        context.stroke()
        context.closePath()

        if(this.chart.modules[this.index + 1] != undefined && this.dots.length > 0 && this.chart.modules[this.index + 1].type == 'scatterchart'){
            var color = 'red' //this.dotsOptions.color
            var r = this.dotsOptions.r
            this.dots.forEach(function(el){
                // CAREFULL WITH THE
                //let cx = parent.chart.margin.left + parent.chart.modules[parent.index + 1].x1 + parent.chart.modules[parent.index + 1].x(el.ts)
                let cx = parent.chart.margin.left + parent.chart.modules[parent.index ].x1 + parent.x(el.ts)
                let cy = parent.chart.margin.top + parent.chart.modules[parent.index + 1].y(el.data)
                let color = parent.dotsOptions.vanish(el.ts)
                context.beginPath()
                context.fillStyle = color
                context.arc(cx, cy, r, 0, 2 * Math.PI, false)
                context.fill()
                context.closePath()
            })

        }
        if(this.flow == 'low'){
            var lineGenerator = d3.line()
                    .x(function(d){
                        if(parent.x(d.ts) < 0){
                            return parent.x1 + parent.chart.margin.left
                        }else if (parent.x(d.ts) > parent.own_width){
                            return parent.x1 + parent.chart.margin.left + parent.own_width
                        }else{
                            return parent.chart.margin.left + parent.x1 + parent.x(d.ts)
                        }
                    })
                    .y(function(d){ return parent.chart.margin.top + parent.y(d.data); })
                    .curve(this.lineCurve)
                      .context(context)

            context.beginPath()
            lineGenerator(this.data)
            context.strokeStyle = this.lowLineColor
            context.stroke()
            context.closePath()
        }else{
            var areaInferior = d3.area()
            .x(function(d){
                    if(parent.x(d.ts) < 0){
                        return parent.x1 + parent.chart.margin.left
                    }else if(parent.x(d.ts) > parent.own_width){
                        return parent.x1 + parent.chart.margin.left + parent.own_width
                    }else{
                        return parent.x1 + parent.chart.margin.left + parent.x(d.ts)
                    }
             //return parent.x(d.ts) > 0 ? (parent.x1 + parent.chart.margin.left + parent.x(d.ts)) : (parent.x1 + parent.chart.margin.left) })
             })
            //        .x(function(d){ return parent.x1 + parent.chart.margin.left + parent.x(d.ts) })
                    .y1(function(d){ return parent.chart.margin.top + parent.y(d['0.25'])})
                    .y0(function(d){ return parent.chart.margin.top + parent.y(d['0.5'])})
                    .curve(this.lineCurve)
                    .context(context)

            var areaSuperior = d3.area()
            .x(function(d){
                    if(parent.x(d.ts) < 0){
                        return parent.x1 + parent.chart.margin.left
                    }else if(parent.x(d.ts) > parent.own_width){
                        return parent.x1 + parent.chart.margin.left + parent.own_width
                    }else{
                        return parent.x1 + parent.chart.margin.left + parent.x(d.ts)
                    }
            //return parent.x(d.ts) > 0 ? (parent.x1 + parent.chart.margin.left + parent.x(d.ts)) : (parent.x1 + parent.chart.margin.left) })
            })
            //        .x(function(d){ return parent.x1 + parent.chart.margin.left + parent.x(d.ts) })
                    .y1(function(d){ return parent.chart.margin.top + parent.y(d['0.75'])})
                    .y0(function(d){ return parent.chart.margin.top + parent.y(d['0.5'])})
                    .curve(this.lineCurve)
                    .context(context)

            var mediana = d3.line() //d3.area()
            .x(function(d){
                    if(parent.x(d.ts) < 0){
                        return parent.x1 + parent.chart.margin.left
                    }else if(parent.x(d.ts) > parent.own_width){
                        return parent.x1 + parent.chart.margin.left + parent.own_width
                    }else{
                        return parent.x1 + parent.chart.margin.left + parent.x(d.ts)
                    }
            //return parent.x(d.ts) > 0 ? (parent.x1 + parent.chart.margin.left + parent.x(d.ts)) : (parent.x1 + parent.chart.margin.left) })
            })
            //        .x(function(d){ return parent.x1 + parent.chart.margin.left + parent.x(d.ts) })
                    .y(function(d){ return parent.chart.margin.top + parent.y(d['0.5'])})
                    .curve(this.lineCurve)
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
            context.strokeStyle = 'black'
            context.closePath()



        }
        if(this.maxmin){
            var max = d3.line()
            .x(function(d){
                    if(parent.x(d.ts) < 0){
                        return parent.x1 + parent.chart.margin.left
                    }else if(parent.x(d.ts) > parent.own_width){
                        return parent.x1 + parent.chart.margin.left + parent.own_width
                    }else{
                        return parent.x1 + parent.chart.margin.left + parent.x(d.ts)
                    }
            })
                    .y(function(d){ return parent.chart.margin.top + parent.y(d['max'])})
                    .curve(this.lineCurve)
                    .context(context)

            var min = d3.line()
            .x(function(d){
                    if(parent.x(d.ts) < 0){
                        return parent.x1 + parent.chart.margin.left
                    }else if(parent.x(d.ts) > parent.own_width){
                        return parent.x1 + parent.chart.margin.left + parent.own_width
                    }else{
                        return parent.x1 + parent.chart.margin.left + parent.x(d.ts)
                    }
            })
                    .y(function(d){return parent.chart.margin.top + parent.y(d['min'])})
                    .curve(this.lineCurve)
                    .context(context)
            context.beginPath()
            max(this.boxPlots)
            context.stroke()
            context.closePath()
            context.beginPath()
            min(this.boxPlots)
            context.stroke()
            context.closePath()
        }
/*
        for(var i = 0; i < this.boxPlots.length; i++){
            let x = this.x1 + this.chart.margin.left + this.x(this.boxPlots[i].ts)
            let y = this.chart.margin.top
            let height = this.chart.height
            context.beginPath()
            context.moveTo(x,y)
            context.lineTo(x,y+height)
            context.stroke()
            context.closePath()
        }
*/        // X AXIS
        context.beginPath()
        context.fillStyle = 'black'
        context.textAlign = 'center'
        context.BaseLine = 'bottom'
        context.fillText(transformDate(this.x.domain()[1]), this.chart.margin.left + this.own_width + this.x1 , this.chart.margin.top + this.chart.height + 10)
        context.closePath()
    }
}