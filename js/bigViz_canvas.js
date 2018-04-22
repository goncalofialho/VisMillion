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
    }

    updateCanvas(data){
      //randomScatterValues()
      /*
      var context = this.context
      var dataContainer = this.dataContainer
      var chart = this

      var dataBinding = dataContainer.selectAll('custom.arc')
            .data(data, function(d){ return d; })
// update existing element
      dataBinding.attr('size', 8)
                .transition()
                .duration(1000)
                .attr('size',15)
                .attr('fillStyle', 'green')

 // for new elements, create a 'custom' dom node,
      dataBinding.enter()
            .append('custom')
            .classed('arc',true)
            .attr('x',function(d){ return chart.x(d[0])})
            .attr('y',function(d){ return chart.y(d[1])})
            .attr('size',8)
            .attr('fillStyle', 'red')

   // for exiting elements,
      dataBinding.exit()
            .attr('size',8)
            .transition()
            .duration(1000)
            .attr('size',5)
            .attr('fillStyle','lightgrey')
            */
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
      /*this.modules.forEach(function(el){
        el.draw()
      })*/

      var context = obj.context
      var dataContainer = obj.dataContainer

      context.fillStyle = "#fff";
      context.rect(0,0,this.width,this.height);
      context.fill();

      this.modules.forEach(function(el){
        el.draw()
      })
/*
      //EACH ELEMENT MUST HAVE AN TYPE  THIS IS ARC FOR SCATTER
      var elements = dataContainer.selectAll("custom.arc");
      elements.each(function(d) {
        var node = d3.select(this);

        context.beginPath();
        context.fillStyle = node.attr("fillStyle");
        context.arc(node.attr("x"), node.attr("y"), node.attr("size"), 0 , 2*Math.PI , true);
        context.fill();
        context.closePath();

      });*/
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
      var mod1 = this.findModule(module1)
      var mod2 = this.findModule(module2)
      var transitions = this.transitions

      var elements1 = [], elements2 = []
      elements1 = Object.keys(mod1.elements).map(function(key){
         return mod1.elements[key];
      });
      elements2 = Object.keys(mod2.elements).map(function(key){
         return mod2.elements[key];
      });
      console.log(elements1)
      console.log(elements2)




      elements1.forEach(function(el){
        el.transition().duration(transitions).attr("transform","translate("+mod2.x1+",0)")
      })
      mod1.axisBottom.transition().duration(this.transitions).attr("transform", "translate("+ mod2.x1 +"," + this.height + ")")
      mod1.axisLeft.transition().duration(this.transitions).attr("transform", "translate("+ mod2.x1 +",0)")

      elements2.forEach(function(el){
        el.transition().duration(transitions).attr("transform","translate("+mod1.x1+",0)")
      })
      mod2.axisBottom.transition().duration(this.transitions).attr("transform", "translate("+ mod1.x1 +"," + this.height + ")")
      mod2.axisLeft.transition().duration(this.transitions).attr("transform", "translate("+ mod1.x1 +",0)")

      var i = mod1.index
      mod1.index = mod2.index
      mod2.index = i

      i = mod1.x1
      mod1.x1 = mod2.x1
      mod2.x1 = i


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
    if(this.type=="linechart")
      this.updatelinechart()
    else if(this.type=="barchart")
      this.updatebarchart()
    else if(this.type=="scatterchart")
      this.updatescatterchart()
  }

  drawlinechart(){
    //TODO
  }

  updatelinechart(){
    //TODO
  }

  drawbarchart(){
    var context = this.chart.context
    var elements = this.chart.dataContainer.selectAll('custom.bars')
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

    /* EACH IDIOM HAS ITS OWN AXIS SCALE */
    this.y = d3.scaleLinear().domain([0,100] /* TODO: scales */ ).range([this.chart.height, 0])
    this.x = d3.scaleLinear().domain([0,220]).range([0, own_width])

    var values = groupBarChart()
    var dataBinding = dataContainer.selectAll('custom.bars')
          .data(values, function(d){ return d; })

    var bandwidth = this.chart.height / values.length ;
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    dataBinding.enter()
            .append('custom')
            .classed('bars', true)
            .attr('x', function(d){ return own_width - xscale(d)})
            .attr('height', bandwidth)
            .attr('y', function(d,p){ return (height - bandwidth) - (p * bandwidth); })
            //.transition()
            .attr('width', function(d){ return xscale(d)})
            .attr('fill', function(d,p){ return color(p)})

  }

  drawscatterchart(){
    var context = this.chart.context
    var elements = this.chart.dataContainer.selectAll('custom.scatterVals')
    elements.each(function(d){
      var node = d3.select(this)

      context.beginPath()
      context.fillStyle = node.attr('fill')
      context.rect(node.attr('cx'), node.attr('cy'), node.attr('r'), 0, 2 * Math.PI, false)
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
    var dataBinding = dataContainer.selectAll('custom.bars')
          .data(scatterArr, function(d){ return d; })

    var color = d3.scaleOrdinal(d3.schemeCategory10);


    dataBinding.enter()
            .append('custom')
            .classed('scatterVals', true)
            .attr('r', function(d) { return d[2]})
            .attr('cx', function(d) { return parent.x(d[0])})
            .attr('cy', function(d) { return parent.y(d[1])})
            .attr('fill', function(d,p) { return color(p)})

  }

}
