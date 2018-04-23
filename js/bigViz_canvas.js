var margin = {top: 20, right: 20, left: 30, bottom: 20}
var width = 800
var height = 400
var obj;


class Chart{
    constructor(width, height, margin){
        this.availableIdioms = ["linechart", "barchart", "scatterchart"]
        this.width = width
        this.height = height
        this.margin = margin
        this.modules = []
        this.transitions = 600
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
    this.elements = {}
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
    this.x = d3.scaleLinear().range([0, own_width])
    this.x1 =  own_width * this.index

    if(this.type=="linechart")
      this.updatelinechart()
    else if(this.type=="barchart")
      this.updatebarchart()
    else if(this.type=="scatterchart")
      this.updatescatterchart()
  }

  drawlinechart(){
    //TODO
    var context = this.chart.context
    var elements = this.chart.dataContainer.selectAll('custom.linechart.module'+this.index)
    var parent = this

    var lineGenerator = d3.line()
      //          .x(function(d, i){ return parent.x(i); })
      //          .y(function(d, i){ return parent.y(d); })
      //          .curve(d3.curveCardinal)
                  .context(context)

    elements.each(function(d){
      var node = d3.select(this)

      context.translate(node.attr('x'),0)
      context.fillStyle = node.attr('fill')
      context.beginPath()
      lineGenerator(parent.data[0])
      context.stroke()
      context.closePath()
      context.translate(0,0)
    })
  }

  updatelinechart(){
    var dataContainer = this.chart.dataContainer

    var own_width = this.chart.width / this.chart.modules.length
    var n = 40

    this.y = d3.scaleLinear().domain([0,10] /* TODO: scales */).range([this.chart.height - 10 , 0])
    this.x = d3.scaleLinear().domain([0, n-1] /* TODO: scales */).range([0, own_width])

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

  }

  drawbarchart(){
    var context = this.chart.context
    var elements = this.chart.dataContainer.selectAll('custom.bars.module'+this.index)
    elements.each(function(d){
      var node = d3.select(this)
      context.beginPath()
      context.fillStyle = node.attr('fill')
      context.rect(node.attr('x'), node.attr('y'), node.attr('width'), node.attr('height'))
      context.fill()
      context.closePath()

    })
  }

  updatebarchart(){
    var dataContainer = this.chart.dataContainer

    var own_width = this.chart.width / this.chart.modules.length
    var xscale = d3.scaleLinear().domain([0,220] /* TODO: scales */ ).range([0, this.chart.width / this.chart.modules.length])
    var parent = this

    /* EACH IDIOM HAS ITS OWN AXIS SCALE */
    this.y = d3.scaleLinear().domain([0,100] /* TODO: scales */ ).range([this.chart.height, 0])
    this.x = d3.scaleLinear().domain([0,220]).range([0, own_width])

    var values = groupBarChart()
    var dataBinding = dataContainer.selectAll('custom.bars.module'+this.index)
          .data(values, function(d){ return d; })

    var bandwidth = this.chart.height / values.length ;
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    dataBinding.enter()
            .append('custom')
            .classed('bars', true)
            .classed('module'+this.index, true)
            .attr('x', function(d){console.log(parent.x1); return parent.x1 + (own_width - xscale(d))})
            .attr('height', bandwidth)
            .attr('y', function(d,p){ return (height - bandwidth) - (p * bandwidth); })
            //.transition()
            .attr('width', function(d){ return xscale(d)})
            .attr('fill', function(d,p){ return color(p)})

  }

  drawscatterchart(){
    var context = this.chart.context
    var elements = this.chart.dataContainer.selectAll('custom.scatterVals.module'+this.index)
    elements.each(function(d){
      var node = d3.select(this)
      context.beginPath()
      context.fillStyle = node.attr('fill')
      context.arc(node.attr('cx'), node.attr('cy'), node.attr('r'), 0, 2 * Math.PI, false)
      context.fill()
      context.closePath()

    })
  }

  updatescatterchart(){
    var dataContainer = this.chart.dataContainer

    var own_width = this.chart.width / this.chart.modules.length
    var parent = this

    /* EACH IDIOM HAS ITS OWN AXIS SCALE */
    this.y = d3.scaleLinear().domain([0,100] /* TODO: scales */ ).range([this.chart.height, 0])
    this.x = d3.scaleLinear().domain([0,100]).range([0, own_width])

    randomScatterValues()
    var dataBinding = dataContainer.selectAll('custom.scatterVals.module'+this.index)
          .data(scatterArr, function(d){ return d; })

    var color = d3.scaleOrdinal(d3.schemeCategory10);


    dataBinding.enter()
            .append('custom')
            .classed('scatterVals', true)
            .classed('module'+this.index, true)
            .attr('r', function(d) { return d[2]})
            .attr('cx', function(d) { return parent.x1 + parent.x(d[0])})
            .attr('cy', function(d) { return parent.y(d[1])})
            .attr('fill', function(d,p) { return color(p)})

  }

}
