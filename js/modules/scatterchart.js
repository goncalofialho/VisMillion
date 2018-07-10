import { Module } from './module.js'

export class Scatterchart extends Module{
    constructor(options){
        super(options)
        this.type = 'scatterchart'
        this.deltaRange = options.deltaRange || 35000
        var endTime = new Date()
        var startTime = new Date(endTime.getTime() - this.own_width / this.chart.pixelsPerSecond * 1000)

        this.y = this.chart.yScale.copy()
        this.x = d3.scaleTime().range([0, this.own_width])
        this.x.domain([startTime, endTime])

        this.dotsColor = options.dotsColor || 'orange'
        this.dotsRadius = options.dotsRadius || 5
        this.maxFlowDrawDots = options.maxFlowDrawDots || 120
        this.maxDotsFlow = options.maxDotsFlow || 3000
        this.lowFlow = true

        this.squareLength = options.squareLength || 15
        this.scatterBoxes = []
        this.squareColor = options.squareColor || 'blue'
        this.squareDensity = options.squareDensity || 100
        this.squareDensityRange = options.squareDensityRange || [0,100]
        this.scaleColor = d3.scaleLinear().domain([0,this.squareDensity]).range(['transparent',this.squareColor]).interpolate(d3.interpolateRgb)

        this.appendModuleOptions()
        this.flow = options.flow || 'both'
        this.deltaXScale = options.deltaXScale || null
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

        loopBoxes:
        for(var i = 0; i < this.scatterBoxes.length; i++){
            let xBox, yBox, width, height
            xBox = this.x1 + this.chart.margin.left + this.x(this.scatterBoxes[i].ts)
            width = this.squareLength
            height = this.squareLength

            if( xBox + width > this.x1 + this.chart.margin.left + this.own_width){
                width = (this.x1 + this.chart.width.left + this.own_width) - xBox
            }else if( xBox < this.x1 + this.chart.margin.left){
                width = width + this.x(this.scatterBoxes[i].ts)
                xBox = this.x1 + this.chart.margin.left
            }

            for(var j = 0; j < this.scatterBoxes[i].vals.length; j++){
                yBox = this.chart.margin.top + (j * this.squareLength)
                if(this.scatterBoxes[i].vals[j] > 0 && insideBox({x:x, y:y},{x:xBox, y:yBox, width: width, height: height})){
                    var val = this.scatterBoxes[i].vals[j]
                    var markup = `
                        <span><i>${val}</i></span>
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
                    break loopBoxes
                }
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
            dotsColor: this.dotsColor,
            dotsRadius: this.dotsRadius,
            index: this.index,
            squareDensity: this.squareDensity,
            squareDensityRange : this.squareDensityRange
        }
        var markup = `
            <div class="mod-option" scatter>
                <h3>${options.title}</h3>
                <fieldset id="scatterchart${options.index}">
                    <legend>Select Flow </legend>
                    <span class="radiobuttons" >
                        <label for="${options.index}radio-1">Low</label>
                        <input type="radio" name="${options.index}radio-1" id="${options.index}radio-1">
                    </span>
                    <span class="radiobuttons">
                        <label for="${options.index}radio-2">Both</label>
                        <input type="radio" name="${options.index}radio-1" id="${options.index}radio-2">
                    </span>
                    <span class="radiobuttons">
                        <label for="${options.index}radio-3">High</label>
                        <input type="radio" name="${options.index}radio-1" id="${options.index}radio-3">
                    </span>
                </fieldset>
                <fieldset id="High-Flow${options.index}">
                    <legend>Low Flow </legend>
                    <p>
                         <span id="dotsRadiusVal${options.index}">Dots Radius: ${options.dotsRadius} </span>
                         <div id="dotsRadius${options.index}"></div>
                    </p>
                    <p>
                        <span>Dots Color: </span>
                        <input type="text" id="dotsColor${options.index}" />
                    </p>
                </fieldset>

                <fieldset id="High-Flow${options.index}">
                    <legend>High Flow </legend>
                    <p>
                         <span id="squareDensityText${options.index}">Square Density: ${options.squareDensity} </span>
                         <div id="squareDensity${options.index}"></div>
                    </p>
                    <p>
                        <span>Square Color: </span>
                        <input type="text" id="square-color${options.index}" />
                    </p>
                </fieldset>

            </div>
        `

        $('.modules-options').append(markup)
        var module = this
        options.flow == 'low' ? $('#'+options.index+'radio-1').prop('checked', true) : (options.flow == 'both' ? $('#'+options.index+'radio-3').prop('checked', true) : $('#'+options.index+'radio-2').prop('checked', true))
        $('fieldset#scatterchart'+options.index+' input[type="radio"]').change(function(){
            $(this).attr('id') == options.index + 'radio-1' ? module.flow = 'low' : ($(this).attr('id') == options.index + 'radio-2' ? module.flow = 'both' : module.flow = 'high' )
        })
        $('#dotsColor'+options.index).spectrum({
            color: module.dotsColor,
            showAlpha: true,
            preferredFormat: "rgba",
            showButtons: false,
            move: function(color){
                module.dotsColor = color.toRgbString()
            }
        })
        $('#square-color'+options.index).spectrum({
            color: module.squareColor,
            preferredFormat: "rgb",
            showButtons: false,
            move: function(color){
                module.scaleColor = d3.scaleLinear().domain([0,module.squareDensity]).range(['transparent',color.toRgbString()]).interpolate(d3.interpolateRgb)
            }
        })

        $('#dotsRadius'+options.index).slider({
            min:1,
            max:10,
            value: module.dotsRadius,
            step:0.5,
            slide: function(event, ui){
                $(this).parent().find('#dotsRadiusVal'+module.index).text("Dots Radius: "+ ui.value)
                module.dotsRadius = ui.value
            }
        })

        $('#squareDensity'+options.index).slider({
            min:options.squareDensityRange[0],
            max:options.squareDensityRange[1],
            step:1,
            value: module.squareDensity,
            slide: function(event, ui){
                $(this).parent().find('#squareDensityText'+module.index).text("Square Density: "+ ui.value)
                module.squareDensity = ui.value
                module.scaleColor.domain([0,module.squareDensity])

            }
        })
    }


    update(ts){
        this.own_width = this.chart.width / this.chart.modules.length
        this.x1 =  this.own_width * this.index

//        var endTime = new Date(ts - ((this.own_width / this.chart.pixelsPerSecond * 1000) * ((this.chart.modules.length - 1) - this.index) ))
//        var startTime = new Date(endTime.getTime() - this.own_width / this.chart.pixelsPerSecond * 1000)
        var endTime = new Date(ts - this.chart.getDeltaTime(this.index))
        var startTime = new Date(endTime.getTime() - this.deltaRange )

        this.deltaTimeX = endTime - startTime

        this.data = this.chart.filterData(startTime, endTime)

        // Remove out of domain data
        this.data = this.data.filter( el => el.data <= this.chart.y.domain()[1])

        // UPDATE DOMAINS
        this.x = d3.scaleTime().range([0, this.own_width])
        this.x.domain([startTime, endTime])
        this.y.domain(this.chart.y.domain())

        // GENERATING BINNING CHART
        var timeInterval = this.x.domain()
        var squareLength = this.squareLength
        var scale = d3.scaleTime().domain(timeInterval).range([0, Math.ceil( this.own_width / squareLength)])
        var delta = scale.invert(1).getTime() - scale.invert(0).getTime()

        // POPULATE BOXES
        if (this.scatterBoxes.length == 0){
            this.scatterDomain = this.x
            for(let i = 0; i < Math.ceil(this.own_width / squareLength) + 1; i++){
                this.scatterBoxes.push({
                    ts: timeInterval[0].getTime() + (i * delta),
                    vals: new Array(Math.ceil(this.y.range()[0] / squareLength)).fill(0)
                })
            }
        }
        if(this.scatterBoxes[0].ts + delta < this.x.domain()[0].getTime() ){
            this.scatterBoxes.splice(0,1)
            this.scatterBoxes.push({
                ts: this.scatterBoxes[this.scatterBoxes.length - 1].ts + delta,
                vals: new Array(Math.ceil(this.y.range()[0] / squareLength)).fill(0)
            })
        }

        var startScale = new Date(this.scatterBoxes[this.scatterBoxes.length - 2].ts )
        var endScale = new Date(this.scatterBoxes[this.scatterBoxes.length - 1].ts + delta)

        var yCells = Math.ceil(this.chart.height / squareLength)
        var scaleY = this.chart.y.copy()
        scaleY.domain(this.y.domain()).range([yCells,0])
        var scatterBoxes = this.scatterBoxes

        var newElements = this.data.filter( el => el.ts > startScale.getTime() && el.ts <= startScale.getTime() + delta)
        scatterBoxes[this.scatterBoxes.length - 2].vals = new Array(Math.ceil(this.y.range()[0] / squareLength)).fill(0)
        newElements.forEach(function(el){
            if(Math.ceil(scaleY(el.data)) <= yCells && Math.ceil(scaleY(el.data)) >= 0)
                scatterBoxes[scatterBoxes.length - 2].vals[Math.ceil(scaleY(el.data)) - 1] += 1
        })

        var newElements = this.data.filter( el => el.ts > startScale.getTime() + delta && el.ts <= endScale.getTime())
        scatterBoxes[scatterBoxes.length - 1].vals = new Array(Math.ceil(this.y.range()[0] / squareLength)).fill(0)
        newElements.forEach(function(el){
            if(Math.ceil(scaleY(el.data)) <= yCells && Math.ceil(scaleY(el.data)) >= 0)
                scatterBoxes[scatterBoxes.length - 1].vals[Math.ceil(scaleY(el.data)) - 1] += 1
        })

        // Should I draw the Dots ?
        /*if(this.chart.connection.flowPerSecond > this.maxFlowDrawDots){
            this.flow = 'high'
            $('#'+this.index+'radio-3').prop('checked', true)
        }*/
        /*var previousModule = 0
        if(this.chart.modules[this.index - 1].type == 'linechart'){
            previousModule = this.chart.modules[this.index - 1].dots.length
        }*/
        if(this.data.length > this.maxDotsFlow && this.flow != 'high'){
            this.flow = 'high'
            $('#'+this.index+'radio-3').prop('checked', true)
            $('#'+this.index+'radio-1').prop('disabled', true)
            $('#'+this.index+'radio-2').prop('disabled', true)
        }else if(this.data.length <= this.maxDotsFlow && this.flow == 'high'){
            $('#'+this.index+'radio-1').prop('disabled', false)
            $('#'+this.index+'radio-2').prop('disabled', false)
            this.flow = 'both'
            $('#'+this.index+'radio-2').prop('checked', true)
        }
        /*if(parseInt(this.chart.fps.text()) < 30){
            //this.chart.pause()
            console.log(this.data.length)
        }*/
    }


    draw(){
        var context = this.chart.context
        var parent = this
        var color = this.dotsColor;
        var r = this.dotsRadius;


        // Low Flow (Isto e lento)
        if(this.flow == 'both' || this.flow == 'low'){

            this.data.forEach(function(el){
                let cx = parent.chart.margin.left + parent.x1 + parent.x(el.ts)
                let cy = parent.chart.margin.top + parent.y(el.data)
                context.beginPath()
                context.fillStyle = color
                context.arc(cx, cy, r, 0, 2 * Math.PI, false)
                context.fill()
                context.closePath()
            })
          //context.fill()
          //context.closePath()
        }
        if(this.flow == 'both' || this.flow == 'high'){
            // High Flow
            for(let i = 0; i < this.scatterBoxes.length; i++){
                let x = parent.x1 + parent.chart.margin.left + parent.x(this.scatterBoxes[i].ts)
                let width = this.squareLength
                let height = this.squareLength

                if( x + width > parent.x1 + parent.chart.margin.left + parent.own_width ){
                    width = (parent.x1 + parent.chart.margin.left + parent.own_width) - x
                }else if( x < parent.x1 + parent.chart.margin.left ){
                    width = width + parent.x(this.scatterBoxes[i].ts)
                    x = parent.x1 + parent.chart.margin.left
                }

                for(let j = 0; j < this.scatterBoxes[i].vals.length; j++){
                    let y = parent.chart.margin.top + (j * this.squareLength)
                    let color = this.scaleColor(this.scatterBoxes[i].vals[j])

                    context.beginPath()
                    context.rect(x, y, width, height)
                    context.fillStyle = color
                    context.fill()
                    context.closePath()
                }
            }
        }

        // X AXIS
        context.beginPath()
        context.fillStyle = 'black'
        context.textAlign = 'center'
        context.BaseLine = 'bottom'
        context.fillText(transformDate(this.x.domain()[1]), this.chart.margin.left + this.own_width + this.x1 , this.chart.margin.top + this.chart.height + 10)
        context.closePath()
    }
}