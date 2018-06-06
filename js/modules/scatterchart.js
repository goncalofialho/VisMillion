import { Module } from './module.js'

export class Scatterchart extends Module{
    constructor(options){
        super(options)
        this.type = 'scatterchart'

        var endTime = new Date()
        var startTime = new Date(endTime.getTime() - this.own_width / this.chart.pixelsPerSecond * 1000)

        this.y = d3.scaleLinear().domain(this.chart.y.domain()).range([this.chart.height, 0])
        this.x = d3.scaleTime().range([0, this.own_width])
        this.x.domain([startTime, endTime])

        this.dotsColor = options.dotsColor || 'orange'
        this.dotsRadius = options.dotsRadius || 5

        this.squareLength = options.squareLength || 15
        this.scatterBoxes = []
        this.squareColor = options.squareColor || 'blue'
        this.squareDensity = options.squareDensity || 10
        this.scaleColor = d3.scaleLinear().domain([0,this.squareDensity]).range(['transparent',this.squareColor]).interpolate(d3.interpolateRgb)

        this.appendModuleOptions()
    }


    appendModuleOptions(){
        var options = {
            title: this.type,
            dotsColor: this.dotsColor,
            dotsRadius: this.dotsRadius,
            index: this.index,
            squareDensity: this.squareDensity
        }
        var markup = `
            <div class="mod-option">
                <h3>${options.title}</h3>
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
            min:1,
            max:50,
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
        var endTime = new Date(ts - ((this.own_width / this.chart.pixelsPerSecond * 1000) * ((this.chart.modules.length - 1) - this.index) ))
        var startTime = new Date(endTime.getTime() - this.own_width / this.chart.pixelsPerSecond * 1000)

        this.data = this.chart.filterData(startTime, endTime)

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
        var scaleY = d3.scaleLinear().domain(this.y.domain()).range([yCells,0])
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
    }


    draw(){
        var context = this.chart.context
        var parent = this
        var color = this.dotsColor;
        var r = this.dotsRadius;

        // Low Flow (Isto e lento)
        this.data.forEach(function(el){
            let cx = parent.chart.margin.left + parent.x1 + parent.x(el.ts)
            let cy = parent.chart.margin.top + parent.y(el.data)
            //let color = 'orange'
            context.beginPath()
          context.fillStyle = color
          context.arc(cx, cy, r, 0, 2 * Math.PI, false)
          context.fill()
          context.closePath()

        })

        // High Flow
        for(let i = 0; i < this.scatterBoxes.length; i++){
            for(let j = 0; j < this.scatterBoxes[i].vals.length; j++){
                let x = parent.x1 + parent.chart.margin.left + parent.x(this.scatterBoxes[i].ts)
                let y = parent.chart.margin.top + (j * this.squareLength)
                let width = this.squareLength
                let color = this.scaleColor(this.scatterBoxes[i].vals[j])
                context.beginPath()
                context.rect(x, y, width, width)
                context.fillStyle = color
                context.fill()
                context.closePath()
            }
        }
    }
}