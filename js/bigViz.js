var margin = {top: 20, right: 20, left: 30, bottom: 20}
var width = 800
var height = 400
var obj;




function createChart(margin, width, height){
    var x = d3.scaleTime().range([0, width])
    var y = d3.scaleLinear().range([height, 0])

    var svg = d3.select(".bigvis").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

    svg.append("g")
        .call(d3.axisLeft(y))


    var dots = svg.append("g")
/*
    for(var i = 0 ; i < width * 100 ; i++){
        dots.append('circle')
            .attr('cy', Math.ceil(i/width) - 1)
            .attr('cx', ((i / width) - parseInt(i/width)) * width)
            .attr('r', 0.5)
    }
*/
    return svg

}


class Chart{
    constructor(width, height, margin){
        this.availableIdioms = ["linechart", "barchart"]
        this.width = width
        this.height = height
        this.margin = margin
        this.modules = []
        this.transitions = 600
        this.svg = d3.select(".bigvis").append("svg")
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        this.x = d3.scaleTime().range([0, width])
        this.y = d3.scaleLinear().range([height, 0])

    }

    addModule(type){
      try{
        if(this.availableIdioms.indexOf(type) > 0){
          this.modules.push(new Module(type, this, this.modules.length))
        }else{
          throw new Error("Type "+type+" not recognized")
        }
      }catch(e){
        console.log(e)
      }

    }

    draw(){
      this.modules.forEach(function(el){
        el.draw()
      })
      /*  this.svg.append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.x))

        this.svg.append("g")
            .call(d3.axisLeft(this.y))*/
    }

    update(){

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

      mod1.axisBottom.transition().duration(this.transitions).attr("transform", "translate("+ mod2.x1 +"," + this.height + ")")
      mod1.axisLeft.transition().duration(this.transitions).attr("transform", "translate("+ mod2.x1 +",0)")

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
    this.elements = []
  }

  draw(){
    var svg = this.chart.svg
    var own_width = this.chart.width / this.chart.modules.length
    this.x = d3.scaleTime().range([0, own_width])
    this.x1 =  own_width * this.index



    if(this.type=="linechart")
      this.drawlinechart()
    else if(this.type=="barchart")
      this.drawbarchart()
    else if(this.type=="scatterChart")
      this.drawscatterchart()
  }

  drawlinechart(){
    var svg = this.chart.svg

    /* EACH IDIOM HAS ITS OWN AXIS SCALE */
    this.y = d3.scaleLinear().range([this.chart.height, 0])
    this.axisBottom = svg.append("g")
          .attr("transform", "translate("+ this.x1 +"," + this.chart.height + ")")
          .call(d3.axisBottom(this.x)/*.ticks(0)*/)

    this.axisLeft = svg.append("g")
          .attr("transform", "translate("+ this.x1 +",0)")
          .call(d3.axisLeft(this.y)/*.ticks(0)*/)
  }

  drawbarchart(){
    var svg = this.chart.svg

    /* EACH IDIOM HAS ITS OWN AXIS SCALE */
    this.y = d3.scaleLinear().domain([0,100] /* TODO: scales */ ).range([this.chart.height, 0])
    //console.log("BANDWIDTH: "+this.y.bandwidth())

    this.axisBottom = svg.append("g")
          .attr("transform", "translate("+ this.x1 +"," + this.chart.height + ")")
          .call(d3.axisBottom(this.x)/*.ticks(0)*/)

    this.axisLeft = svg.append("g")
          .attr("transform", "translate("+ this.x1 +",0)")
          .call(d3.axisLeft(this.y)/*.ticks(0)*/)

    var values = groupBarChart()

    var bars = svg.append("g")
    this.elements.push(bars)

    var bandwidth = this.chart.height / values.length ;

    bars.selectAll('.bar')
          .data(values)
        .enter().append('rect')
          .attr('class','bar')
          .attr('x',0)
          .attr('height', bandwidth )
          .attr('y', function(d,p){ return 440 - (p*bandwidth);})
          .attr('width', function(d){return d * 10;})


  }
  drawscatterchart(){
    var svg = this.chart.svg
  }
}
