import { Outlier } from './outlier.js'


export class Chart{
    constructor(options){
        this.width = options.width || 800
        this.height = options.height || 400
        this.margin = options.margin || {top: 20, right: 10, left: 10, bottom: 10}
        this.modules = []
        this.transitions = options.transitions || 100
        this.pixelsPerSecond = options.pixelsPerSecond || 10
        this.data  = []
        this.yScale = options.yScale || d3.scaleLinear()
        this.timerControl
        this.connection
        this.selfDelay = options.selfDelay || 100
        if(options.outlier){
            var outlierHeight =/* options.outlier_opts.outlierHeight ||*/ 100
            this.outlierBox = options.outlierBox || {width: this.width, height: outlierHeight}
            this.margin.top = this.margin.top + this.outlierBox.height
        }
        this.container = options.container || d3.select('.bigvis')
        this.canvas = this.container.append("canvas")
                .attr('id','canvas')
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
        d3.select(this.container.node().parentNode).style('max-width', this.width + this.margin.left + this.margin.right + 'px')
        d3.select(this.container.node().parentNode).style('padding', '0px')
        this.startTime = new Date()
        this.startTimeText = d3.select('#package-count p:last-child i')
        this.x = d3.scaleTime().range([0, this.width])
        this.y = this.yScale.range([this.height, 0])

        this.bgColor = options.bgColor || '#fff'
        this.context = this.canvas.node().getContext("2d")

        let xDomain = options.xDomain || [0,100]
        let yDomain = options.yDomain || [0,2000]

        this.x.domain(xDomain)
        this.y.domain(yDomain)

        this.time0 = Date.now()
        this.fps = d3.select('#fps span')

        if(options.outlier){
            if(options.outlier_opts){
                options.outlier_opts['chart'] = this
                if(options.outlier_opts['width'] == undefined) options.outlier_opts['chart'] = this.width
                if(options.outlier_opts['height'] == undefined) options.outlier_opts['height'] = outlierHeight
                if(options.outlier_opts['thresholdBottom'] == undefined) options.outlier_opts['thresholdBottom'] = this.y.domain()[1]
            }
            let opts = options.outlier_opts ||  {
                                                    chart : this,
                                                    width : this.width,
                                                    height: outlierHeight,
                                                    thresholdBottom : this.y.domain()[1]
                                                }
            this.outlier = new Outlier(opts)
        }

        this.divOptions({
            title: 'Chart',
            pixelsPerSecond: this.pixelsPerSecond,
            maxYDomain: this.y.domain()[1]
        })

        this.tooltip = d3.select('body').append('div')
                            .attr('class', 'tooltip')

        let chart = this
        this.canvas.on('mousemove', function(){ chart.mouseEvent() } )
    }

    mouseEvent(){
        var mouseX = d3.event.layerX || d3.event.offsetX
        var mouseY = d3.event.layerY || d3.event.offsetY

        this.modules.forEach(function(el){
            el.clearSpecificToolTips()
        })
        if( mouseX > this.margin.left && mouseX < this.margin.left + this.width
                    && mouseY > this.margin.top &&  mouseY < this.margin.top + this.height){

            for(var i = this.modules.length - 1; i > -1; i--){
                if((this.width / this.modules.length) * i < mouseX - this.margin.left)
                    break
            }

            this.modules[i].mouseEvent(mouseX, mouseY, this.tooltip, event)


        }else if(this.outlier && insideBox({x: mouseX, y: mouseY}, {x: this.margin.left, y: this.margin.top - this.outlier.height - this.outlier.marginOutlierTop, width: this.outlier.width, height: this.outlier.height})){
            this.outlier.mouseEvent(mouseX, mouseY, this.tooltip, event)
        }else{
            this.tooltip
                .classed('open', false)


        }

    }

    divOptions(options){
        var markup = `
            <div class="mod-option">
                <h3>${options.title}</h3>
                <fieldset id="chartOptions">
                    <legend>Select Flow </legend>
                    <p>
                        <span id="PixelsPerSecondSpan">Pixels Per Second: ${options.pixelsPerSecond}</span>
                        <div id="pixelSecond"></div>
                    <p>
                    <p>
                        <span id="yDomainSpan">Y Domain: ${options.maxYDomain}</span>
                        <div id="yDomain"></div>
                    </p>
                    <p>
                        <span>Background Color: </span>
                        <input type="text" id="chart-bg" />
                    </p>
                </fieldset>
            </div>
        `

        $('.modules-options').append(markup)
        var chart = this

        $('#pixelSecond').slider({
            min:5,
            max:100,
            step:1,
            value:this.pixelsPerSecond,
            slide: function(event, ui){
                $(this).parent().find('#PixelsPerSecondSpan').text("Pixels Per Second: "+ui.value)
                chart.pixelsPerSecond = ui.value

            }
        })

        $('#yDomain').slider({
            range: "max",
            min: chart.y.domain()[0],
            max: chart.y.domain()[1] * 2,
            value: chart.y.domain()[1],
            step: chart.y.domain()[1] * 0.1,
            slide: function(event, ui){
                $(this).parent().find('#yDomainSpan').text('Y Domain: ' + ui.value)
                chart.y.domain([chart.y.domain()[0], ui.value])
            }
        })

        $('#chart-bg').spectrum({
            color: chart.bgColor,
            preferredFormat: "rgb",
            showButtons: false,
            move: function(color){
                chart.bgColor = color.toRgbString()
            }
        })
    }

    draw_update(){
        this.update()
        this.draw()

        // COMPUTE FPS
        var time1 = Date.now()
        this.fps.text(Math.round(1000/ (time1 - this.time0)))
        this.time0 = time1

    }

    update(){
        var ts = new Date()
        ts = new Date(ts - this.selfDelay)
        // update date
        var delta = new Date(ts - this.startTime)
        this.startTimeText.text(checkTime(delta.getHours() - 1) + ':' + checkTime(delta.getMinutes()) + ':' + checkTime(delta.getSeconds()))

        // Axis
        var width = this.modules[0].type != "barchart" ? this.width :  this.width - (this.width / this.modules.length)
        var endTime = new Date(ts)
        var startTime = new Date(endTime.getTime() - width / this.pixelsPerSecond * 1000)

        this.x = d3.scaleTime().range([0, this.width]).domain([startTime, endTime])
        this.modules.forEach(function(el){
            el.update(ts)
        })
        if(this.outlier) this.outlier.update(ts)
    }

    getDeltaTime(index){
        var delta = 0
        for(let i = this.modules.length - 1; i >= index + 1 ; i--){
            delta += this.modules[i].deltaRange
        }
        return delta
    }

    draw(){
        this.clean_board()

        // VAR AXIS
        var tickCount = 5,
            tickSize = 6,
            ticks = this.x.ticks(tickCount),
            ticksY = this.y.ticks(tickCount),
            //tickYFormat = d3.format('.0s'),
            tickYFormat = d3.format('1'),
            tickFormat = this.x.tickFormat(),
            context = this.context,
            x = this.x,
            y = this.y,
            height = this.height,
            margin = this.margin,
            width = this.width;

        // DRAW EACH MODULE
        this.modules.forEach(function(el){
            el.draw()
        })
        if(this.outlier) this.outlier.draw()

        // Y AXIS
        context.beginPath()
        ticksY.forEach(function(d){
            context.moveTo(margin.left, margin.top + y(d))
            context.lineTo(margin.left-5 , margin.top + y(d))

            context.moveTo(margin.left + width, margin.top + y(d))
            context.lineTo(margin.left + width + 5 , margin.top + y(d))
        })
        context.strokeStyle = "black"
        context.stroke()

        context.fillStyle = "black"
        context.textAlign = "right"
        context.textBaseline = "middle"
        ticksY.forEach(function(d){
            context.textAlign = "right"
            context.fillText(tickYFormat(d), margin.left-6 , margin.top + y(d))
            context.textAlign = "left"
            context.fillText(tickYFormat(d), margin.left + width + 6 , margin.top + y(d))

        })

        // X AXIS
        /*context.textAlign = "center"
        context.Baseline = "top"

        var translate = (this.modules[0].type == "barchart" ? this.width / this.modules.length : 0) + 30
        ticks.forEach(function(d){
            context.fillText(tickFormat(d), x(d) + translate , height + margin.top  + 10)
        })*/
        context.textAlign = "center"
        context.Baseline = "top"

        /* X AXIS BARCHART */
        if(this.modules[0].type == "barchart"){
            let module = this.modules[0],
                ticks = module.x.ticks(5),
                tickFormat = module.x.tickFormat('0s'),
                own_width = this.width / (this.modules.length + 1)

            var xAx = module.x
            if(module.chart.modules.length > module.index + 1 == false || module.chart.modules[module.index+1].type == 'scatterchart'){
                ticks.forEach(function(d){
                    context.fillText(d, module.x(d) + margin.left , margin.top - 10)
                })
            }else{
                xAx.range(xAx.range().reverse())
                ticks.forEach(function(d){
                    context.fillText(d, xAx(d) + margin.left , margin.top - 10)
                })


            }
        }

        if(this.outlier){
            let x = this.x.copy()
            x.range([0,this.width])
            //console.log(x.range())
            var ticks = x.ticks(10)
            var tickFormat = d3.timeFormat('%H:%M:%S')

            context.beginPath()
            /*context.moveTo(margin.left, margin.top - this.outlier.height - this.outlier.marginOutlierTop)
            context.lineTo(margin.left + this.width, margin.top - this.outlier.height - this.outlier.marginOutlierTop)
            */for(let i = 0; i < ticks.length; i++){
                context.moveTo(margin.left + x(ticks[i]), margin.top - this.outlier.height - this.outlier.marginOutlierTop - 2)
                context.lineTo(margin.left + x(ticks[i]), margin.top - this.outlier.height - this.outlier.marginOutlierTop + 2)
                context.fillText(tickFormat(ticks[i]), margin.left + x(ticks[i]), margin.top - this.outlier.height - this.outlier.marginOutlierTop - 8)
            }
            context.strokeStyle = "black"
            context.stroke()
            context.closePath()
        }
    }

    clean_board(){
        var context = this.context
        var dataContainer = this.dataContainer
        var fullWidth = this.width + this.margin.left + this.margin.right
        var fullHeight = this.height + this.margin.top + this.margin.bottom
        context.fillStyle = this.bgColor
        context.rect(0,0, fullWidth, fullHeight)
        context.fill()

        /* DEBUG BOX */
        //context.beginPath()
        context.strokeStyle = "black"
        context.rect(this.margin.left,this.margin.top,this.width, this.height)
        context.stroke()
        //context.closePath()

    }

    addModule(module){
        this.modules.push(module)
    }

    transferData(from, data, chart){
        if(data.length == 0 || from <= 0)
            return

        if(chart.modules[from-1] == undefined){
            //Transfer Data
            //console.log("Cannot transfer data to nothing")
            return
        }else{
            for (let i = 0; i < data.length; i++){
                chart.modules[from-1].data.push(data[i])
            }
        }
    }

    filterData(startTime, endTime){
        if(startTime == null)
            return this.data.filter( el => el.ts < endTime.getTime() )
        else
            return this.data.filter( el => el.ts > startTime.getTime() && el.ts < endTime.getTime() )
    }

    start(){
        var chart = this
        this.timerControl = d3.timer(function(){ chart.draw_update() })
    }

    pause(){
        this.timerControl.stop()
    }

    resume(){
        this.start()
    }
}