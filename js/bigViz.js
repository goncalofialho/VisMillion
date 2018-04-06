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
        this.availableIdioms = ["linechart", "barchart", "scatterchart"]
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
    var svg = this.chart.svg
    var own_width = this.chart.width / this.chart.modules.length
    this.x = d3.scaleLinear().range([0, own_width])
    this.x1 =  own_width * this.index




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
    else if(this.type=="scatterChart")
      this.updatescatterchart()
  }

  drawlinechart(){
    // TODO: SEE thIS TUTORIAL https://bost.ocks.org/mike/path/
    var svg = this.chart.svg

    var n = 40,
      random = d3.randomNormal(0, .2),
      data = d3.range(n).map(random)

    this.x = d3.scaleLinear()
      .domain([0, n - 1])
      .range([0, this.chart.width / this.chart.modules.length])

    this.y = d3.scaleLinear()
      .domain([-1, 1])
      .range([this.chart.height, 0])

    var parent = this

    var line = d3.line()
        .x(function(d, i) { return parent.x(i); })
        .y(function(d, i) { return parent.y(d); })


    var linechart = svg.append("g").attr('id','linechart')
                          .attr("transform", "translate("+this.x1+",0)")

    this.elements["linechart"] = linechart

    this.axisBottom = svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate("+this.x1+"," + this.chart.height + ")")
    .call(d3.axisBottom(parent.x))

    this.axisLeft = svg.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate("+this.x1+",0)")
    .call(d3.axisLeft(parent.y));

    linechart.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", (this.chart.width / this.chart.modules.length))
        .attr("height", this.chart.height)

    linechart.append("g")
        .attr("clip-path", "url(#clip)")
      .append("path")
        .datum(data)
        .attr("class", "line")
      .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .on("start", tick);

    function tick() {
      // Push a new data point onto the back.
      data.push(random());
      // Redraw the line.
      d3.select(this)
          .attr("d", line)
          .attr("transform", null);
      // Slide it to the left.
      d3.active(this)
          .attr("transform", "translate(" + parent.x(-1) + ",0)")
        .transition()
          .on("start", tick);
      // Pop the old data point off the front.
      data.shift();
    }
  }

  drawbarchart(){
    var svg = this.chart.svg
    var own_width = this.chart.width / this.chart.modules.length
    var xscale = d3.scaleLinear().domain([0,220] /* TODO: scales */ ).range([0, this.chart.width / this.chart.modules.length])

    /* EACH IDIOM HAS ITS OWN AXIS SCALE */
    this.y = d3.scaleLinear().domain([0,100] /* TODO: scales */ ).range([this.chart.height, 0])
    //console.log("BANDWIDTH: "+this.y.bandwidth())

    this.x = d3.scaleLinear().domain([0,220]).range([0, own_width])

    this.axisBottom = svg.append("g")
          .attr("transform", "translate("+ this.x1 +"," + this.chart.height + ")")
          .call(d3.axisBottom(this.x)/*.ticks(0)*/)


    this.axisLeft = svg.append("g")
          .attr("transform", "translate("+ this.x1 +",0)")
          .call(d3.axisLeft(this.y)/*.ticks(0)*/)
          .selectAll('.tick text')
          .attr('transform', 'translate(30,0)')

    this.axisLeft.selectAll('.tick line')
          .attr('transform', 'translate(35,0)')


    var values = groupBarChart()

    var bars = svg.append("g").attr('id','bars')
                  .attr("transform", "translate("+this.x1+",0)")
    this.elements["bars"] = bars

    var bandwidth = this.chart.height / values.length ;
    var height =  this.chart.height ;
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    bars.selectAll('.bar')
          .data(values)
        .enter().append('rect')
          .attr('class','bar')
          .attr('x',function(d){ return own_width - xscale(d)})
          .attr('height', bandwidth )
          .attr('y', function(d,p){ return (height - bandwidth) - (p*bandwidth);})
          .transition()
          .duration(300)
          .attr('width', function(d){return xscale(d)})
          .attr('fill', function(d,p) { return color(p)})


  }
  drawscatterchart(){
    var svg = this.chart.svg
    var own_width = this.chart.width / this.chart.modules.length
    var parent = this

    /* EACH IDIOM HAS ITS OWN AXIS SCALE */
    this.y = d3.scaleLinear().domain([0,100] /* TODO: scales */ ).range([this.chart.height, 0])
    //console.log("BANDWIDTH: "+this.y.bandwidth())

    this.x = d3.scaleLinear().domain([0,100]).range([0, own_width])


    randomScatterValues()
    var scatterVals = svg.append("g").attr('id','scatter-values')
                    .attr('transform','translate('+this.x1+',0)')

    this.axisBottom = svg.append("g")
          .attr("transform", "translate("+ this.x1 +"," + this.chart.height + ")")
          .call(d3.axisBottom(this.x)/*.ticks(0)*/)

    this.axisLeft = svg.append("g")
          .attr("transform", "translate("+ this.x1 +",0)")
          .call(d3.axisLeft(this.y)/*.ticks(0)*/)
          .selectAll('.tick text')
          .attr('transform', 'translate(30,0)')

    scatterVals.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", (this.chart.width / this.chart.modules.length))
        .attr("height", this.chart.height)

    this.elements["values"] = scatterVals
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    scatterVals.append('g')
        .attr('clip-path', 'url(#clip)')
        .selectAll('.circles')
          .data(scatterArr)
        .enter().append('circle')
          .attr('class','circles')
          .attr('r',function(d){ return d[2] })
          .attr("cx", function(d) {  return parent.x(d[0]) })
          .attr("cy", function(d) {  return parent.y(d[1]) })
          .attr('fill', function(d,p) { return color(p)} )
        .transition()
          .duration(500)
          .ease(d3.easeLinear)
          .on("start",tick)

    function tick(){
      //scatterArr.push([randomNumberBounds(0,100),randomNumberBounds(10,90),randomNumberBounds(0,10)])
      var element = d3.select(this).data()[0]
      var color = d3.scaleOrdinal(d3.schemeCategory10);

      if(element[0]<0){
        d3.select(this)
        .attr("cy", function(d) {d[1]=randomNumberBounds(10,90);  return parent.y(d[1]) })
          .transition()
        .duration(0)
        .attr('cx', function(d){d[0]=randomNumberBounds(105,120); return parent.x(d[0]) })
        .on("end",tick)
      }else{
      d3.select(this)
        .transition()
          .duration(500)
          .ease(d3.easeLinear)
          .attr('cx', function(d){ d[0]-=2.5; return parent.x(d[0]) })
          .on("end", tick)
      }
    }

    function verifyScatterArr(){

    }



  }

  updatebarchart(){
    var values = groupBarChart()
    var own_width = this.chart.width / this.chart.modules.length
    var xscale = d3.scaleLinear().domain([0,220] /* TODO: scales */ ).range([0, this.chart.width / this.chart.modules.length])
    var bandwidth = this.chart.height / values.length ;
    var height =  this.chart.height ;
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var bars = this.elements["bars"]

    bars.data( values)
      .selectAll('.bar')
          .transition()
          .duration(100)
          .attr('x',function(d,p){return own_width - xscale(values[p])})
          .attr('width',function(d,p){return xscale(values[p])})
  }
}
