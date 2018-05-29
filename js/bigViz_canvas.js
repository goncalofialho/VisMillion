var margin = {top: 50, right: 30, left: 30, bottom: 20}
var width = 800
var height = 400
var obj;
var c;
/* TODO: APPLY GETTERS AND SETTERS */

class Chart{
    constructor(width, height, margin){
        this.availableIdioms = ["linechart", "barchart", "scatterchart"]
        this.width = width
        this.height = height
        this.margin = margin
        this.modules = []
        this.transitions = 100
        this.pixelsPerSecond = 10
        this.canvas = d3.select(".bigvis").append("canvas")
                .attr('id','canvas')
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
            //.append("g")
            //    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        this.x = d3.scaleLinear().range([0, width])
        this.y = d3.scaleLinear().range([height, 0])

        this.bgColor = '#fff'
        this.context = this.canvas.node().getContext("2d")
        this.detachedContainer = document.createElement('custom')
        this.dataContainer = d3.select(this.detachedContainer)

        this.x.domain([0,100])
        this.y.domain([0,2000])

        var scalex = this.x
        var scaley = this.y


        /* Chart options */
        var options = {
            title: 'Chart',
            pixelsPerSecond: this.pixelsPerSecond,
            maxYDomain: this.y.domain()[1]
        }

        var markup = `
            <div class="mod-option">
                <h3>${options.title}</h3>
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
            min: 0,
            max: 10000,
            value: chart.y.domain()[1],
            step: 500,
            slide: function(event, ui){
                $(this).parent().find('#yDomainSpan').text('Y Domain: ' + ui.value)
                chart.y.domain([0, ui.value])
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
      obj.update()
      obj.draw()

      // COMPUTE FPS
      time1 = Date.now()
      fps.text(Math.round(1000/ (time1 - time0)))
      time0 = time1
    }


    animateFunc(elapsed, interpolator, timer){
        const step = elapsed / this.transitions
        if(step > 1){
            timer.stop()
            console.log(interpolator(1))
            return
        }
    }

    addModule(type){
      try{
        if(this.availableIdioms.indexOf(type) >= 0){
          this.modules.push(new Module(type, this, this.modules.length))
        }else{
          throw new Error("Type "+type+" not recognized")
        }
      }catch(e){
        console.log(e)
      }

    }
    update(){

    var ts = new Date()

    /* AXIS */
    var width = this.modules[0].type != "barchart" ? this.width :  this.width - (this.width / this.modules.length)
    var endTime = new Date(ts)
    var startTime = new Date(endTime.getTime() - width / this.pixelsPerSecond * 1000)

    this.x = d3.scaleTime().range([0, width]).domain([startTime, endTime])


      this.modules.forEach(function(el){
        el.update(ts)
      })
    }


    draw(){
      this.clean_board()

    /* DRAW AXIS */
    var tickCount = 10,
        tickSize = 6,
        ticks = this.x.ticks(tickCount),
        ticksY = this.y.ticks(tickCount),
        tickYFormat = d3.format('.0s'),
        tickFormat = this.x.tickFormat(),
        context = this.context,
        x = this.x,
        y = this.y,
        height = this.height,
        margin = this.margin,
        width = this.width;


      this.modules.forEach(function(el){
        el.draw()
      })

    /* Y AXIS */
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


    /* X AXIS */
    context.textAlign = "center"
    context.Baseline = "top"

    var translate = this.modules[0].type == "barchart" ? this.width / this.modules.length : 0
    ticks.forEach(function(d){
        context.fillText(tickFormat(d), x(d) + translate , height + margin.top  + 10)
    })

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





    }

    clean_board(){
      var context = obj.context
      var dataContainer = obj.dataContainer
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


    findModule(index){
      return this.modules.find(function(el){
        if(el.index == index)
          return el
      })
    }
    changeModules(module1, module2){


    }
    /* TRANSFERIR DATA DE UM BUFFER PARA OUTRO */
    transferData(from, data, chart){
        if(data.length == 0 || from <= 0)
            return

        if(chart.modules[from-1] == undefined){
            //Transfer Data
            //console.log("Cannot trasnfer data to nothing")
            return
        }else{
            for (let i = 0; i < data.length; i++){
                chart.modules[from-1].data.push(data[i])
            }
        }
    }
}

class Module{
  constructor(type, chart, index){
    this.type = type
    this.chart = chart
    this.index = index
    this.x
    this.y
    this.axisBottom
    this.axisLeft
    this.x1
    this.data = []

    /* EACH IDIOM HAS ITS OWN AXIS SCALE */
    var own_width = this.chart.width / (this.chart.modules.length + 1)
    this.x1 = own_width * (this.chart.modules.length + 1)
    var endTime = new Date()
    var startTime = new Date(endTime.getTime() - own_width / this.chart.pixelsPerSecond * 1000)

    if(this.type=="linechart"){
        this.y = d3.scaleLinear().domain(this.chart.y.domain()).range([this.chart.height, 0])
        this.x = d3.scaleTime().range([0, own_width])

        this.x.domain([startTime, endTime])
        this.flow = 'high'
        this.boxPlots = []
        this.boxPlotSteps = 20

        this.lowLineColor = 'black'
        this.highTopAreaColor = 'rgba(0, 0, 255, 0.5)'
        this.highMiddleLineColor = 'rgb(255, 191, 0)'
        this.highBottomAreaColor = 'rgba(255, 0, 0, 0.5)'

    }else if(this.type=="barchart"){
        this.domain = this.chart.y.domain()
        this.numBars = 10
        this.indexBars = 0
        this.barsColor = 'blue'
        /* % of bars width */
        this.maxWidth = 0.9


        this.y = d3.scaleLinear().domain(0,10).range([this.chart.height])
        this.x = d3.scaleLinear().domain(domain).range([0, own_width])

        this.yScatter = d3.scaleLinear().domain(this.chart.y.domain()).range([this.chart.height, 0])
        this.xScatter = d3.scaleTime().range([0, own_width])
        this.xScatter.domain([startTime, endTime])

        this.barsData = new Array(this.numBars).fill(0)

        this.bandwidth = this.chart.height / this.numBars

        this.chart.x = d3.scaleLinear().range([0, width - own_width])

    }else if(this.type=="scatterchart"){
        this.y = d3.scaleLinear().domain(this.chart.y.domain()).range([this.chart.height, 0])
        this.x = d3.scaleTime().range([0, own_width])

        this.x.domain([startTime, endTime])

        this.dotsColor = 'orange'
        this.dotsRadius = 5

        this.squareLength = 10
        this.scatterBoxes = []
        this.scaleColor = d3.scaleLinear().domain([0,10]).range(['transparent','blue']).interpolate(d3.interpolateRgb)



    }

    this.appendModuleOptions()

    }

  appendModuleOptions(){
    if(this.type=='linechart'){
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
                    <legend>Select Flow: </legend>
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
                    <legend>High Flow:</legend>
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


    }else if(this.type=='barchart'){
        var options = {
            title: this.type,
            index: this.index,
            maxWidth: parseInt(this.maxWidth * 100)
        }
        var markup = `
            <div class="mod-option">
                <h3>${options.title}</h3>
                <p>
                    <span>Bars Color: </span>
                    <input type="text" id="barsColor${options.index}" />
                </p>
                <p>
                     <span id="maxWidthVal${options.index}">Max Width: ${options.maxWidth} % </span>
                     <div id="maxWidth${options.index}"></div>
                </p>
            </div>
        `

        $('.modules-options').append(markup)

        var module = this
        $('#barsColor'+options.index).spectrum({
            color: module.barsColor,
            showAlpha: true,
            preferredFormat: "rgba",
            showButtons: false,
            move: function(color){
                module.barsColor = color.toRgbString()
            }
        })

        $('#maxWidth'+options.index).slider({
            min:0.1,
            max:1,
            step:0.05,
            value: module.maxWidth,
            slide: function(event, ui){
                $(this).parent().find('#maxWidthVal'+module.index).text("Max Width: "+ parseInt(ui.value * 100) +"% ")
                module.maxWidth = ui.value
            }
        })


    }else if(this.type=='scatterchart'){
        var options = {
            title: this.type,
            dotsColor: this.dotsColor,
            dotsRadius: this.dotsRadius,
            index: this.index
        }
        var markup = `
            <div class="mod-option">
                <h3>${options.title}</h3>
                <p>
                    <span>Dots Color: </span>
                    <input type="text" id="dotsColor${options.index}" />
                </p>
                <p>
                     <span id="dotsRadiusVal${options.index}">Dots Radius: ${options.dotsRadius} </span>
                     <div id="dotsRadius${options.index}"></div>
                </p>
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
    }
  }

  draw(){
    if(this.type=="linechart")
      this.drawlinechart()
    else if(this.type=="barchart")
      this.drawbarchart()
    else if(this.type=="scatterchart")
      this.drawscatterchart()
  }

  update(ts){
    var own_width = this.chart.width / this.chart.modules.length
    this.x1 =  own_width * this.index
    if(this.type=="linechart"){
      this.updatelinechart(ts)
    }else if(this.type=="barchart"){
      this.updatebarchart(ts)
    }else if(this.type=="scatterchart"){
      this.updatescatterchart(ts)
    }
  }

  drawlinechart(){
    var context = this.chart.context
    var parent = this

    if(this.flow == 'low'){
        var lineGenerator = d3.line()
                .x(function(d){ return parent.chart.margin.left + parent.x1 + parent.x(d.ts); })
                .y(function(d){ return parent.chart.margin.top + parent.y(d.data); })
                .curve(d3.curveBasis)
                  .context(context)


       // context.fillStyle = (parent.index == 0) ? 'blue' : 'orange'
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
                //.y1(function(d){ return parent.chart.margin.top + parent.y(d['0.50'])})
                .curve(d3.curveBasis)
                .context(obj.context)

      var areaSuperior = d3.area()
                .x(function(d){ return parent.x1 + parent.chart.margin.left + parent.x(d.ts) })
                .y1(function(d){ return parent.chart.margin.top + parent.y(d['0.75'])})
                .y0(function(d){ return parent.chart.margin.top + parent.y(d['0.5'])})
                //.y1(function(d){ return parent.chart.margin.top + parent.y(d['0.75'])})
                .curve(d3.curveBasis)
                .context(obj.context)

      var mediana = d3.line() //d3.area()
                .x(function(d){ return parent.x1 + parent.chart.margin.left + parent.x(d.ts) })
                .y(function(d){ return parent.chart.margin.top + parent.y(d['0.5'])})
                //.y0(function(d){ return parent.chart.margin.top + parent.y(d['0.50'])})
                //.y1(function(d){ return parent.chart.margin.top + parent.y(d['0.75'])})
                .curve(d3.curveBasis)
                .context(obj.context)




      context.beginPath()
      areaInferior(this.boxPlots)
      context.fillStyle = this.highBottomAreaColor
      context.fill()
     // context.strokeStyle = 'red'
     // context.stroke()
      context.closePath()

      context.beginPath()
      areaSuperior(this.boxPlots)
      context.fillStyle = this.highTopAreaColor
      context.fill()
     // context.strokeStyle = 'blue'
     // context.stroke()
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

  updatelinechart(ts){
    var dataContainer = this.chart.dataContainer
    var parent = this
    var own_width = this.chart.width / this.chart.modules.length
    this.x1 = own_width * this.index

    var endTime = new Date(ts - ((own_width / parent.chart.pixelsPerSecond * 1000) * ((this.chart.modules.length - 1) - this.index) ))
    var startTime = new Date(endTime.getTime() - own_width / parent.chart.pixelsPerSecond * 1000)


    /* REMOVING DATACONTAINER ELEMENTS THAT ARE NO LONGER NEEDED */
    for(var i = 0; i < this.data.length; i++){
        if(this.data[i].ts > startTime.getTime())
            break
    }

    if(this.index != 0){
        this.chart.transferData(this.index, this.data.splice(0,i),parent.chart)
    }

    for(var i = 0; i < this.boxPlots.length; i++){
        if(this.boxPlots[i].ts > startTime.getTime())
            break
    }
    this.boxPlots.splice(0,i)


    /* UPDATE DOMAINS */
    this.x = d3.scaleTime().range([0, own_width])
    this.x.domain([startTime, endTime])
    this.y.domain(this.chart.y.domain())


    /* GENERATING AREA CHART
    var dataIntervals = []
    var timeInterval = this.x.domain()
    var steps = 20
    var scale = d3.scaleTime().domain(timeInterval).range([0, steps])
    var dataIntervals = []
    var intervals = []
    var boxPlots = []
    for (var l = 0; l <= steps; l++){
        dataIntervals.push([])
    }
    for (let i = 0; i <= steps; i++){
        intervals.push(scale.invert(i))
    }
    for (var l = 0; l < this.data.length; l++){
        dataIntervals[Math.round(scale(this.data[l].ts))].push(this.data[l])
    }

    dataIntervals.forEach(function(el, index){
        var elements = el.map( el => el.data ).sort(function(a,b){return a-b})
        boxPlots.push({
            0.25 : d3.quantile(elements, .25),
            0.50 : d3.quantile(elements, .50),
            0.75 : d3.quantile(elements, .75),
            ts : intervals[index].getTime()
        })
    })
    this.boxPlots = boxPlots*/

    /* GENERATING AREA CHART */
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
        //for (let i=1; i < steps; i++){
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
        //}
    }

  }

  drawbarchart(){
    var context = this.chart.context
    var own_width = this.chart.width / this.chart.modules.length
    var parent = this
    var max = Math.max.apply(Math, this.domain)
    var slices = max/this.numBars

    if(this.chart.modules.length > this.index + 1 == false || this.chart.modules[this.index+1].type == 'scatterchart'){

        this.data.forEach(function(el){

        if(! (parent.xScatter(el.ts) > parent.x(parent.barsData[(Math.ceil(el.data/slices) - 1)]))){

            return
        }

            let cx = parent.chart.margin.left + parent.x1 + parent.xScatter(el.ts)
            let cy = parent.chart.margin.top + parent.yScatter(el.data)
            let r = 5
            let color = (parent.index == 0) ? 'blue' : 'orange'

            context.beginPath()
            context.fillStyle = color
            context.arc(cx, cy, r, 0, 2 * Math.PI, false)
            context.fill()
            context.closePath()
        })
    }



    for(var i=0; i < this.barsData.length; i++){
        let x,y,width,height,color;


        if(this.chart.modules.length > this.index + 1 == false || this.chart.modules[this.index+1].type == 'scatterchart'){
            //console.log('first way')
            x = this.chart.margin.left + this.x1
            y = this.chart.margin.top + (this.chart.height - this.bandwidth) - (i * this.bandwidth)
            width = this.x(this.barsData[i])
            height = this.bandwidth
        }else{
            //console.log('second way')
            x = this.chart.margin.left + this.x1 + (own_width - this.x(this.barsData[i]))
            y = this.chart.margin.top + (this.chart.height - this.bandwidth) - (i * this.bandwidth)
            width = this.x(this.barsData[i])
            height = this.bandwidth
        }


        color = this.barsColor
        context.beginPath()
        context.fillStyle = color
        context.rect(x,y,width,height)
        context.fill()
        context.strokeStyle = "1px"
        context.stroke()
        context.closePath()
    }


  }

  updatebarchart(ts){
  /* TODO: TRANSICOES */
    var dataContainer = this.chart.dataContainer
    var parent = this
    var own_width = this.chart.width / this.chart.modules.length
    this.x1 = own_width * this.index

    var endTime = new Date(ts - ((own_width / parent.chart.pixelsPerSecond * 1000) * ((this.chart.modules.length - 1) - this.index) ))
    var startTime = new Date(endTime.getTime() - own_width / parent.chart.pixelsPerSecond * 1000)


    /* REMOVING DATACONTAINER ELEMENTS THAT ARE NO LONGER NEEDED */
    for(var i = 0; i < this.data.length; i++){
        if(this.data[i].ts > startTime.getTime())
            break
    }
    if(this.index != 0){
        this.chart.transferData(this.index, this.data.splice(0,i),parent.chart)
    }


    var max = Math.max.apply(Math, this.domain)
    var slices = max/this.numBars

    this.barsData = new Array(this.numBars).fill(0)
    this.data.forEach(function(el,index){
    // SOMETHING WRONG GOING ON HERE
        if(el.data >= parent.y.domain()[0] && el.data <= parent.y.domain()[1]){
            if(parent.chart.modules.length > parent.index + 1 == false || parent.chart.modules[parent.index+1].type == 'scatterchart'){
                if(! (parent.xScatter(el.ts) > parent.x(parent.barsData[(Math.ceil(el.data/slices) - 1)]))){
                    if((Math.ceil(el.data/slices) - 1) == -1)
                        parent.barsData[0] += 1
                    else
                    parent.barsData[(Math.ceil(el.data/slices) - 1)] += 1

                }
            }else{
                if((Math.ceil(el.data/slices) - 1) < 0)
                    parent.barsData[0] += 1
                else
                    parent.barsData[(Math.ceil(el.data/slices) - 1)] += 1
            }
        }
    })


    /* UPDATE DOMAINS */
    if( Math.max( ...this.barsData ) > this.x.domain()[1] * this.maxWidth ){
        this.x.domain([0, this.x.domain()[1] + (this.x.domain()[1] * (1 - this.maxWidth))])
    }

    this.x.range([0, own_width])
    this.xScatter = d3.scaleTime().range([0, own_width])
    this.xScatter.domain([startTime, endTime])
    this.y.domain(this.chart.y.domain())



  }

  drawscatterchart(){
    var context = this.chart.context
    var parent = this

    var color = this.dotsColor;
    var r = this.dotsRadius;



    this.data.forEach(function(el){
        let cx = parent.chart.margin.left + parent.x1 + parent.x(el.ts)
        let cy = parent.chart.margin.top + parent.y(el.data)
        //let color = 'orange'
        context.beginPath()
      context.fillStyle = color
      context.arc(cx, cy, r, 0, 2 * Math.PI, false)
      context.fill()
      context.closePath()

    })/*
    var squareLength = 20
    for(var i = 0; i < this.x.range()[1]; i+= squareLength){
        for(var j=0; j < this.y.range()[0]; j+= squareLength){
            let x = parent.x1 + parent.chart.margin.left + i
            let y = parent.chart.margin.top + j
            let width = squareLength
            context.beginPath()
            context.rect(x, y, squareLength, squareLength)
            context.strokeStyle = 'black'
            context.stroke()
            context.closePath()
        }
    }*/

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

  updatescatterchart(ts){
    var dataContainer = this.chart.dataContainer
    var parent = this
    var own_width = this.chart.width / this.chart.modules.length
    this.x1 = own_width * this.index

    var endTime = new Date(ts - ((own_width / parent.chart.pixelsPerSecond * 1000) * ((this.chart.modules.length - 1) - this.index) ))
    var startTime = new Date(endTime.getTime() - own_width / parent.chart.pixelsPerSecond * 1000)

    /* REMOVING DATACONTAINER ELEMENTS THAT ARE NO LONGER NEEDED */
    for(var i = 0; i < this.data.length; i++){
        if(this.data[i].ts > startTime.getTime())
            break
    }
    if(this.index != 0){
        this.chart.transferData(this.index, this.data.splice(0,i),parent.chart)
    }

    /* UPDATE DOMAINS */
    this.x = d3.scaleTime().range([0, own_width])
    this.x.domain([startTime, endTime])
    this.y.domain(this.chart.y.domain())

    /* GENERATING BINNING CHART */
    var timeInterval = this.x.domain()
    var squareLength = this.squareLength
    var scale = d3.scaleTime().domain(timeInterval).range([0, Math.ceil( own_width / squareLength)])
    var delta = scale.invert(1).getTime() - scale.invert(0).getTime()

    /* POPULATE Boxes */

    if (this.scatterBoxes.length == 0){
        this.scatterDomain = this.x
        for(let i = 0; i < Math.ceil(own_width / squareLength) + 1; i++){
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



}
