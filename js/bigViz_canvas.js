var margin = {top: 20, right: 20, left: 20, bottom: 20}
var width = 800
var height = 400
var obj;

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

        this.context = this.canvas.node().getContext("2d")
        this.detachedContainer = document.createElement('custom')
        this.dataContainer = d3.select(this.detachedContainer)

        this.x.domain([0,100])
        this.y.domain([0,100])

        var scalex = this.x
        var scaley = this.y


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
        tickYFormat = this.y.tickFormat(),
        tickFormat = this.x.tickFormat(),
        context = this.context,
        x = this.x,
        y = this.y,
        height = this.height;
        margin = this.margin;


      this.modules.forEach(function(el){
        el.draw()
      })

    /* Y AXIS */
    context.beginPath()
    ticksY.forEach(function(d){
        context.moveTo(15, margin.top + y(d))
        context.lineTo(15 + tickSize, margin.top + y(d))
    })
    context.strokeStyle = "black"
    context.stroke()

    context.fillStyle = "black"
    context.textAlign = "right"
    context.textBaseline = "middle"
    ticksY.forEach(function(d){
        context.fillText(tickYFormat(d), tickSize + 10 , margin.top + y(d))
    })


    /* X AXIS */
    context.textAlign = "center"
    context.Baseline = "top"

    var translate = this.modules[0].type == "barchart" ? this.width / this.modules.length : 0
    ticks.forEach(function(d){
        context.fillText(tickFormat(d), x(d) + translate , height + margin.bottom + 10)
    })





    }

    clean_board(){
      var context = obj.context
      var dataContainer = obj.dataContainer
      var fullWidth = this.width + this.margin.left + this.margin.right
      var fullHeight = this.height + this.margin.top + this.margin.bottom
      context.fillStyle = "#fff"
      context.rect(0,0, fullWidth, fullHeight)
      context.fill()

      /* DEBUG BOX */
      //context.beginPath()
      context.strokeStyle = "black"
      context.rect(this.margin.left,this.margin.right,this.width, this.height)
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
        this.y = d3.scaleLinear().domain([0,100]).range([this.chart.height, 0])
        this.x = d3.scaleTime().range([0, own_width])

        this.x.domain([startTime, endTime])

    }else if(this.type=="barchart"){
        this.domain = [0,100]
        this.numBars = 10

        this.y = d3.scaleLinear().domain(0,10).range([this.chart.height])
        this.x = d3.scaleLinear().domain(domain).range([0, own_width])

        this.barsData = new Array(this.numBars).fill(0)

        this.bandwidth = this.chart.height / this.numBars

        this.chart.x = d3.scaleLinear().range([0, width - own_width])

    }else if(this.type=="scatterchart"){
        this.y = d3.scaleLinear().domain([0,100]).range([this.chart.height, 0])
        this.x = d3.scaleTime().range([0, own_width])

        this.x.domain([startTime, endTime])

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

    var lineGenerator = d3.line()
                .x(function(d){ return parent.chart.margin.left + parent.x1 + parent.x(d.ts); })
                .y(function(d){ return parent.chart.margin.top + parent.y(d.data); })
                .curve(d3.curveBasis)
                  .context(context)


      context.fillStyle = (parent.index == 0) ? 'blue' : 'orange'
      context.beginPath()
      lineGenerator(this.data)
      context.stroke()
      context.closePath()
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

    /* UPDATE DOMAINS */
    this.x = d3.scaleTime().range([0, own_width])
    this.x.domain([startTime, endTime])
  }

  drawbarchart(){
    var context = this.chart.context
    var own_width = this.chart.width / this.chart.modules.length

    for(var i=0; i < this.barsData.length; i++){
        let x = this.chart.margin.left + this.x1 + (own_width - this.x(this.barsData[i]))
        let y = this.chart.margin.top + (this.chart.height - this.bandwidth) - (i * this.bandwidth)
        let width = this.x(this.barsData[i])
        let height = this.bandwidth
        let color = (parent.index == 0) ? 'blue' : 'orange'

        context.beginPath()
        context.fillStyle = color
        context.rect(x,y,width,height)
        context.fill()
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

    parent.barsData = new Array(this.numBars).fill(0)
    this.data.forEach(function(el){
    //console.log((Math.ceil(el.data/slices) - 1))

      parent.barsData[(Math.ceil(el.data/slices) - 1)] += 1

    })

  }

  drawscatterchart(){
    var context = this.chart.context
    var parent = this

    this.data.forEach(function(el){
        let cx = parent.chart.margin.left + parent.x1 + parent.x(el.ts)
        let cy = parent.chart.margin.top + parent.y(el.data)
        let r = 5
        let color = (parent.index == 0) ? 'blue' : 'orange'
        //let color = 'orange'
        context.beginPath()
      context.fillStyle = color
      context.arc(cx, cy, r, 0, 2 * Math.PI, false)
      context.fill()
      context.closePath()

    })
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

  }


}
