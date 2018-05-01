var margin = {top: 20, right: 20, left: 30, bottom: 20}
var width = 800
var height = 400
var obj;

function smoothVal(value, target){
    window[value] = target
}
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
                .attr("width", this.width /*+ this.margin.left + this.margin.right*/)
                .attr("height", this.height /*+ this.margin.top + this.margin.bottom*/)
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

    smoothPixelsPerSecond(target){
        var incs = Math.abs(this.pixelsPerSecond - target)
        var interval = this.transitions / incs
        var parent = this
        var incrementer = setInterval(calculate, interval, target, parent)

        /* SOME MAGIC ON THIS TIMER SINCE JAVASCRIPT IS CCRRAAAZYYYY */
        // FIX WITH WEBWORKERS MAYBE
        setTimeout( clearIncrementer, incs * 5 , target)

        function calculate(target, parent){
            console.log("incrementing to "+ target)
            if(parent.pixelsPerSecond > target){
                parent.pixelsPerSecond-=1
            }else if(parent.pixelsPerSecond < target){
                parent.pixelsPerSecond+=1
            }
            console.log(parent.pixelsPerSecond)
        }

        function clearIncrementer(){
            console.log("Clearing incrementer")
            clearInterval(incrementer)
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

    draw(){
      this.clean_board()

      this.modules.forEach(function(el){
        el.draw()
      })
    }

    clean_board(){
      var context = obj.context
      var dataContainer = obj.dataContainer

      context.fillStyle = "#fff";
      context.rect(0,0,this.width,this.height);
      context.fill();
    }

    update(){
      this.modules.forEach(function(el){
        el.update()
      })
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

    if(this.type=="linechart"){
        this.y = d3.scaleLinear().domain([0,100]).range([this.chart.height, 0])
        this.x = d3.scaleTime().range([0, own_width])

        var endTime = new Date()
        var startTime = new Date(endTime.getTime() - own_width / this.chart.pixelsPerSecond * 1000)
        this.x.domain([startTime, endTime])

    }else if(this.type=="barchart"){
        this.domain = [0,100]
        this.numBars = 10

        this.y = d3.scaleLinear().domain(0,10).range([this.chart.height])
        this.x = d3.scaleLinear().domain(domain).range([0, own_width])

        this.barsData = new Array(this.numBars).fill(0)

        this.bandwidth = this.chart.height / this.numBars

    }else if(this.type=="scatterchart"){
        this.y = d3.scaleLinear().domain([0,100] /* TODO: scales */ ).range([this.chart.height, 0])
        this.x = d3.scaleTime().range([0, own_width])

        var endTime = new Date()
        var startTime = new Date(endTime.getTime() - own_width / this.chart.pixelsPerSecond * 1000)
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

  update(){
    var own_width = this.chart.width / this.chart.modules.length
    this.x1 =  own_width * this.index
    if(this.type=="linechart"){
      this.updatelinechart()
    }else if(this.type=="barchart"){
      this.updatebarchart()
    }else if(this.type=="scatterchart"){
      this.updatescatterchart()
    }
  }

  drawlinechart(){
    var context = this.chart.context
    var parent = this

    var lineGenerator = d3.line()
                .x(function(d){ return parent.x1 + parent.x(d.ts); })
                .y(function(d){ return parent.y(d.data); })
                .curve(d3.curveCardinal)
      //          .curve(d3.curveCardinal)
                  .context(context)


      context.fillStyle = (parent.index == 0) ? 'blue' : 'orange'
      context.beginPath()
      lineGenerator(this.data)
      context.stroke()
      context.closePath()
  }

  updatelinechart(){
    var dataContainer = this.chart.dataContainer
    var parent = this
    var own_width = this.chart.width / this.chart.modules.length
    this.x1 = own_width * this.index

    var ts = new Date()
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


  /*
    var dataContainer = this.chart.dataContainer

    var own_width = this.chart.width / this.chart.modules.length
    var n = 40

    this.y = d3.scaleLinear().domain([0,10] ).range([this.chart.height - 10 , 0])
    this.x = d3.scaleLinear().domain([0, n-1] ).range([0, own_width])

    this.data = [Array.from({length: n}, (v, i) => [this.x(i), this.y(randomNumberBounds(0,10))])];
    var dataBinding = dataContainer.selectAll('custom.linechart.module'+this.index)
          .data(this.data, function(d) {return d; })
    var parent = this

    dataBinding.enter()
          .append('custom')
          .classed('linechart', true)
          .classed('module'+this.index, true)
          .attr('x', function(d){ return parent.x1})
          .attr('fill', 'orange')
*/



  }

  drawbarchart(){
    var context = this.chart.context
    var own_width = this.chart.width / this.chart.modules.length

    for(var i=0; i < this.barsData.length; i++){
        let x = this.x1 + (own_width - this.x(this.barsData[i]))
        let y = (this.chart.height - this.bandwidth) - (i * this.bandwidth)
        let width = this.x(this.barsData[i])
        let height = this.bandwidth
        let color = (parent.index == 0) ? 'blue' : 'orange'

        context.beginPath()
        context.fillStyle = color
        context.rect(x,y,width,height)
        context.fill()
        context.closePath()
    }


/*
    var elements = this.chart.dataContainer.selectAll('custom.bars.module'+this.index)
    elements.each(function(d){
      var node = d3.select(this)
      context.beginPath()
      context.fillStyle = (parent.index == 0) ? 'blue' : 'orange'
      context.rect(node.attr('x'), node.attr('y'), node.attr('width'), node.attr('height'))
      context.fill()
      context.closePath()

    })*/
  }

  updatebarchart(){
    var dataContainer = this.chart.dataContainer
    var parent = this
    var own_width = this.chart.width / this.chart.modules.length
    this.x1 = own_width * this.index

    var ts = new Date()
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
/*
    TRY THIS FOR SMOOTH TRANSITIONS

    var dataBinding = dataContainer.selectAll('custom.bars.module'+this.index)
            .data(this.barsData, function(d){ return d; })

    dataBinding.enter()
            .append('custom')
            .classed('bars', true)
            .classed('module'+this.index, true)
            .attr('height', this.bandwidth)
            .attr('y', function(d,p){ return (parent.chart.height - parent.bandwidth) - (p * parent.bandwidth); })
            .transition()
            .duration(300)
            .ease(d3.easeLinear)
            .attr('width', function(d){ return parent.x(d)})
            .attr('x', function(d){ return parent.x1 + (own_width - parent.x(d))})

    dataBinding.transition()
            .duration(300)
            .ease(d3.easeLinear)
            .attr('width', function(d){ return parent.x(d)})
            .attr('x', function(d){ return parent.x1 + (own_width - parent.x(d))})

    dataBinding.exit()
            .remove()*/
/*
    var own_width = this.chart.width / this.chart.modules.length
    var xscale = d3.scaleLinear().domain([0,220]).range([0, this.chart.width / this.chart.modules.length])
    var parent = this

    this.y = d3.scaleLinear().domain([0,100] ).range([this.chart.height, 0])
    this.x = d3.scaleTime().range([0, own_width])


    var values = groupBarChart()
    var dataBinding = dataContainer.selectAll('custom.bars.module'+this.index)
          .data(values, function(d){ return d; })

    var bandwidth = this.chart.height / values.length ;
    var color = d3.scaleOrdinal(d3.schemeCategory10);*/
/*
    dataBinding.enter()
            .append('custom')
            .classed('bars', true)
            .classed('module'+this.index, true)
            .attr('x', function(d){console.log(parent.x1); return parent.x1 + (own_width - xscale(d))})
            .attr('height', bandwidth)
            .attr('y', function(d,p){ return (height - bandwidth) - (p * bandwidth); })
            //.transition()
            .attr('width', function(d){ return xscale(d)})
            .attr('fill', function(d,p){ return color(p)})*/

  }

  drawscatterchart(){
    var context = this.chart.context
    var parent = this

    this.data.forEach(function(el){
        let cx = parent.x1 + parent.x(el.ts)
        let cy = parent.y(el.data)
        let r = 5
        let color = (parent.index == 0) ? 'blue' : 'orange'
        //let color = 'orange'
        context.beginPath()
      context.fillStyle = color
      context.arc(cx, cy, r, 0, 2 * Math.PI, false)
      context.fill()
      context.closePath()

    })
/*

    var elements = this.chart.dataContainer.selectAll('custom.scatterVals.module'+this.index)


    elements.each(function(d){
      var node = d3.select(this)

      context.beginPath()
      context.fillStyle = node.attr('fill')
      context.arc(node.attr('cx'), node.attr('cy'), node.attr('r'), 0, 2 * Math.PI, false)
      context.fill()
      context.closePath()

    })*/
  }

  updatescatterchart(){
    var dataContainer = this.chart.dataContainer
    var parent = this
    var own_width = this.chart.width / this.chart.modules.length
    this.x1 = own_width * this.index

    var ts = new Date()
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

    /*
    var dataBinding = dataContainer.selectAll('custom.scatterVals.module'+this.index)
        .data(bufferData, function(d){ return d; })

    var dataBinding.data(bufferData).enter()
        .append('custom')
        .classed('scatterVals', true)
        .classed('module'+this.index, true)
        .attr('r', function(d) { return 5 /})
        .attr('fill', function(d,p) { return 'orange'})
        .attr('ts', function(d){ return d.ts})
        .attr('cx', function(d) { return parent.x1 + parent.x(d.ts)})
        .attr('cy', function(d) { return parent.y(d.data)})

    dataBinding
            .attr('cx', function(d) { return parent.x1 + parent.x(d.ts)})
            .attr('cy', function(d) { return parent.y(d.data)})

     dataBinding.exit()
            .remove()
    */
  }


}


/*
    d3 version allows transitions

  updatescatterchart(){
    var dataContainer = this.chart.dataContainer

    var own_width = this.chart.width / this.chart.modules.length
    var parent = this

    /* EACH IDIOM HAS ITS OWN AXIS SCALE */
    //this.y = d3.scaleLinear().domain([min,max] /* TODO: scales */ ).range([this.chart.height, 0])
    //this.x = d3.scaleLinear().domain([0,100]).range([0, own_width])

   // var endTime = new Date()
  //  var startTime = new Date(endTime.getTime() - own_width / 10 * 1000)

    /* REMOVING DATACONTAINER ELEMENTS THAT ARE NO LONGER NEEDED */
  //  for(var i = 0; i < bufferData.length; i++){
 //       if(bufferData[i].ts > startTime.getTime())
  //          break
    //}
   // bufferData.splice(0,i)


    //console.log("bufferData length: "  + bufferData.length)
  //  var dataBinding = dataContainer.selectAll('custom.scatterVals.module'+this.index)
  //        .data(bufferData, function(d){ return d; })

  //  var color = d3.scaleOrdinal(d3.schemeCategory10);


    /* UPDATE DOMAINS */
//    this.x.domain([startTime, endTime])
    //this.y.domain([minScatter, maxScatter])

    /*var dataBinding.data(bufferData).enter()
            .append('custom')
            .classed('scatterVals', true)
            .classed('module'+this.index, true)
            .attr('r', function(d) { return 5 /})
            .attr('cx', function(d) { return parent.x1 + parent.x(d.ts)})
            .attr('cy', function(d) { return parent.y(d.data)})
            .attr('ts', function(d){ return d.ts})
            .attr('fill', function(d,p) { return 'orange'})

    dataBinding
            .attr('cx', function(d) { return parent.x1 + parent.x(d.ts)})
            .attr('cy', function(d) { return parent.y(d.data)})

     dataBinding.exit()
            .remove()
    */
 // }
