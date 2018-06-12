(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
class Chart{
    constructor(options){
        this.width = options.width || 800;
        this.height = options.height || 400;
        this.margin = options.margin || {top: 10, right: 10, left: 10, bottom: 10};
        this.modules = [];
        this.transitions = options.transitions || 100;
        this.pixelsPerSecond = options.pixelsPerSecond || 10;
        this.data  = [];
        this.yScale = options.yScale || d3.scaleLinear();
        this.timerControl;
        this.connection;
        this.canvas = d3.select(".bigvis").append("canvas")
                .attr('id','canvas')
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.x = d3.scaleTime().range([0, this.width]);
        this.y = this.yScale.range([this.height, 0]);

        this.bgColor = options.bgColor || '#fff';
        this.context = this.canvas.node().getContext("2d");

        let xDomain = options.xDomain || [0,100];
        let yDomain = options.yDomain || [0,2000];

        this.x.domain(xDomain);
        this.y.domain(yDomain);

        this.time0 = Date.now();
        this.fps = d3.select('#fps span');

        this.divOptions({
            title: 'Chart',
            pixelsPerSecond: this.pixelsPerSecond,
            maxYDomain: this.y.domain()[1]
        });
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
        `;

        $('.modules-options').append(markup);
        var chart = this;

        $('#pixelSecond').slider({
            min:5,
            max:100,
            step:1,
            value:this.pixelsPerSecond,
            slide: function(event, ui){
                $(this).parent().find('#PixelsPerSecondSpan').text("Pixels Per Second: "+ui.value);
                chart.pixelsPerSecond = ui.value;

            }
        });

        $('#yDomain').slider({
            range: "max",
            min: chart.y.domain()[0],
            max: chart.y.domain()[1] * 2,
            value: chart.y.domain()[1],
            step: chart.y.domain()[1] * 0.1,
            slide: function(event, ui){
                $(this).parent().find('#yDomainSpan').text('Y Domain: ' + ui.value);
                chart.y.domain([chart.y.domain()[0], ui.value]);
            }
        });

        $('#chart-bg').spectrum({
            color: chart.bgColor,
            preferredFormat: "rgb",
            showButtons: false,
            move: function(color){
                chart.bgColor = color.toRgbString();
            }
        });
    }

    draw_update(){
        this.update();
        this.draw();

        // COMPUTE FPS
        var time1 = Date.now();
        this.fps.text(Math.round(1000/ (time1 - this.time0)));
        this.time0 = time1;
    }

    update(){
        var ts = new Date();

        // Axis
        var width = this.modules[0].type != "barchart" ? this.width :  this.width - (this.width / this.modules.length);
        var endTime = new Date(ts);
        var startTime = new Date(endTime.getTime() - width / this.pixelsPerSecond * 1000);

        this.x = d3.scaleTime().range([0, width]).domain([startTime, endTime]);
        this.modules.forEach(function(el){
            el.update(ts);
        });
    }

    draw(){
        this.clean_board();

        // VAR AXIS
        var tickCount = 5,
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
            el.draw();
        });

        // Y AXIS
        context.beginPath();
        ticksY.forEach(function(d){
            context.moveTo(margin.left, margin.top + y(d));
            context.lineTo(margin.left-5 , margin.top + y(d));

            context.moveTo(margin.left + width, margin.top + y(d));
            context.lineTo(margin.left + width + 5 , margin.top + y(d));
        });
        context.strokeStyle = "black";
        context.stroke();

        context.fillStyle = "black";
        context.textAlign = "right";
        context.textBaseline = "middle";
        ticksY.forEach(function(d){
            context.textAlign = "right";
            context.fillText(tickYFormat(d), margin.left-6 , margin.top + y(d));
            context.textAlign = "left";
            context.fillText(tickYFormat(d), margin.left + width + 6 , margin.top + y(d));

        });

        // X AXIS
        context.textAlign = "center";
        context.Baseline = "top";

        var translate = (this.modules[0].type == "barchart" ? this.width / this.modules.length : 0) + 30;
        ticks.forEach(function(d){
            context.fillText(tickFormat(d), x(d) + translate , height + margin.top  + 10);
        });

        /* X AXIS BARCHART */
        if(this.modules[0].type == "barchart"){
            let module = this.modules[0],
                ticks = module.x.ticks(5),
                tickFormat = module.x.tickFormat('0s'),
                own_width = this.width / (this.modules.length + 1);

            var xAx = module.x;
            if(module.chart.modules.length > module.index + 1 == false || module.chart.modules[module.index+1].type == 'scatterchart'){
                ticks.forEach(function(d){
                    context.fillText(d, module.x(d) + margin.left , margin.top - 10);
                });
            }else{
                xAx.range(xAx.range().reverse());
                ticks.forEach(function(d){
                    context.fillText(d, xAx(d) + margin.left , margin.top - 10);
                });


            }
        }
    }

    clean_board(){
        var context = this.context;
        var dataContainer = this.dataContainer;
        var fullWidth = this.width + this.margin.left + this.margin.right;
        var fullHeight = this.height + this.margin.top + this.margin.bottom;
        context.fillStyle = this.bgColor;
        context.rect(0,0, fullWidth, fullHeight);
        context.fill();

        /* DEBUG BOX */
        //context.beginPath()
        context.strokeStyle = "black";
        context.rect(this.margin.left,this.margin.top,this.width, this.height);
        context.stroke();
        //context.closePath()

    }

    addModule(module){
        this.modules.push(module);
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
                chart.modules[from-1].data.push(data[i]);
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
        var chart = this;
        this.timerControl = d3.timer(function(){ chart.draw_update(); });
    }

    pause(){
        this.timerControl.stop();
    }

    resume(){
        this.start();
    }
}

// This class should be abstract
class Module{
    constructor(options){
        if(this.constructor === Module){
            throw new Error('Cannot instantiate abstract class named: ' + this.constructor.name)
        }else if(options.chart == undefined){
            throw new Error('Chart not specified at options')
        }
        this.chart = options.chart;
        this.index = options.index;
        this.x;
        this.y;
        this.type;
        this.x1;
        this.data = [];

        this.own_width = this.chart.width / (this.chart.modules.length + 1);
        this.x1 = this.own_width * (this.chart.modules.length + 1);

        this.chart.addModule(this);
    }

    // just declarations
    appendModuleOptions(){}
    update(ts){}
    draw(){}
}

class Linechart extends Module{
    constructor(options){
        super(options);
        this.type = 'linechart';

        var endTime = new Date();
        var startTime = new Date(endTime.getTime() - this.own_width / this.chart.pixelsPerSecond * 1000);

        this.y = this.chart.yScale.copy(); //d3.scaleLinear().domain(this.chart.y.domain()).range([this.chart.height, 0])
        this.x = d3.scaleTime().range([0, this.own_width]).domain([startTime, endTime]);

        // OPTIONS
        this.flow = options.flow || 'low';
        this.boxPlots = [];
        this.boxPlotSteps = options.boxPlotSteps || 20;

        // COLORS
        this.lowLineColor = options.lowLineColor || 'black';
        this.highTopAreaColor = options.highTopAreaColor || 'rgba(0, 0, 255, 0.5)';
        this.highMiddleLineColor = options.highMiddleLineColor || 'rgb(255, 191, 0)';
        this.highBottomAreaColor = options.highBottomAreaColor || 'rgba(255, 0, 0, 0.5)';

        this.appendModuleOptions();
    }


    appendModuleOptions(){
        var options = {
            title: this.type,
            flow: this.flow,
            index: this.index,
            lowLineColor: this.lowLineColor,
            highTopAreaColor: this.highTopAreaColor,
            highMiddleLineColor: this.highMiddleLineColor,
            highBottomAreaColor: this.highBottomAreaColor,
            boxPlotSteps: this.boxPlotSteps
        };


        var markup = `
            <div class="mod-option">
                <h3>${options.title}</h3>
                <fieldset id="linechart${options.index}">
                    <legend>Select Flow </legend>
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
                    <legend>High Flow</legend>
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
        `;

        $('.modules-options').append(markup);

        var module = this;
        options.flow == 'low' ? $('#'+options.index+'radio-1').prop('checked', true) : $('#'+options.index+'radio-2').prop('checked', true);
        $('fieldset#linechart'+options.index+' input[type="radio"]').change(function(){
            $(this).attr('id') == options.index + 'radio-1' ? module.flow = 'low' : module.flow = 'high';
        });

        $('#boxPlotSteps'+options.index).slider({
            min:5,
            max:50,
            step:1,
            value: module.boxPlotSteps,
            slide: function(event, ui){
                $(this).parent().find('#boxPlotStepsText'+module.index).text("BoxPlot Steps: "+ ui.value);
                module.boxPlotSteps = ui.value;
            }
        });

        $('#lowLineColor'+options.index).spectrum({
            color: module.lowLineColor,
            showAlpha: true,
            preferredFormat: "rgba",
            showButtons: false,
            move: function(color){
                module.lowLineColor = color.toRgbString();
            }
        });
        $('#highTopAreaColor'+options.index).spectrum({
            color: module.highTopAreaColor,
            showAlpha: true,
            preferredFormat: "rgba",
            showButtons: false,
            move: function(color){
                module.highTopAreaColor = color.toRgbString();
            }
        });
        $('#highMiddleLineColor'+options.index).spectrum({
            color: module.highMiddleLineColor,
            showAlpha: true,
            preferredFormat: "rgba",
            showButtons: false,
            move: function(color){
                module.highMiddleLineColor = color.toRgbString();
            }
        });
        $('#highBottomAreaColor'+options.index).spectrum({
            color: module.highBottomAreaColor,
            showAlpha: true,
            preferredFormat: "rgba",
            showButtons: false,
            move: function(color){
                module.highBottomAreaColor = color.toRgbString();
            }
        });
    }


    update(ts){
        this.own_width = this.chart.width / this.chart.modules.length;
        this.x1 =  this.own_width * this.index;
        var endTime = new Date(ts - ((this.own_width / this.chart.pixelsPerSecond * 1000) * ((this.chart.modules.length - 1) - this.index) ));
        var startTime = new Date(endTime.getTime() - this.own_width / this.chart.pixelsPerSecond * 1000);

        // GENERATING AREA CHART
        var timeInterval = this.x.domain();
        var steps = this.boxPlotSteps;
        var scale = d3.scaleTime().domain(timeInterval).range([0, steps]);
        var delta = scale.invert(1).getTime() - scale.invert(0).getTime();
        var graphsInFront = 3;
        this.data = this.chart.filterData(startTime, new Date(endTime.getTime() + (delta * 3)));



        // UPDATE DOMAINS
        this.x = d3.scaleTime().range([0, this.own_width]);
        this.x.domain([startTime, endTime]);
        this.y.domain(this.chart.y.domain());


        for(var i = 0; i < this.boxPlots.length; i++){
            if(this.boxPlots[i].ts > startTime.getTime() - delta * 2)
                break
        }
        this.boxPlots.splice(0,i);

        /* inserting new data */
        if(this.data.length > 0 && this.boxPlots.length == 0){
            var first_element = this.data[0];
            if((first_element.ts + delta) < timeInterval[1].getTime() + (delta * graphsInFront )){
                var elements = this.data.filter( el => first_element.ts  <= el.ts && (first_element.ts + delta) > el.ts );
                elements = elements.map( el => el.data ).sort(function(a,b){return a-b});
                this.boxPlots.push({
                    0.25 : d3.quantile(elements, .25),
                    0.50 : d3.quantile(elements, .50),
                    0.75 : d3.quantile(elements, .75),
                    ts   : first_element.ts + (delta / 2)
                });
            }
        }else if(this.boxPlots.length > 0){
            var first_ts = this.boxPlots[0].ts;
            var i = this.boxPlots.length;
            var timestamp = first_ts + (delta * i);
            if((timestamp + delta) < timeInterval[1].getTime() + (delta * graphsInFront )){
                var elements = this.data.filter( el => timestamp  <= el.ts && (timestamp + delta) > el.ts );
                elements = elements.map( el => el.data ).sort(function(a,b){return a-b});
                this.boxPlots.push({
                    0.25 : d3.quantile(elements, .25),
                    0.50 : d3.quantile(elements, .50),
                    0.75 : d3.quantile(elements, .75),
                    ts   : timestamp + (delta / 2)
                });
            }
        }
    }


    draw(){
        var context = this.chart.context;
        var parent = this;
        if(this.flow == 'low'){
            var lineGenerator = d3.line()
                    .x(function(d){ return parent.chart.margin.left + parent.x1 + parent.x(d.ts); })
                    .y(function(d){ return parent.chart.margin.top + parent.y(d.data); })
                    .curve(d3.curveBasis)
                      .context(context);

            context.beginPath();
            lineGenerator(this.data);
            context.strokeStyle = this.lowLineColor;
            context.stroke();
            context.closePath();
        }else{
            var areaInferior = d3.area()
            .x(function(d){
                    if(parent.x(d.ts) < 0){
                        return parent.x1 + parent.chart.margin.left
                    }else if(parent.x(d.ts) > parent.own_width){
                        return parent.x1 + parent.chart.margin.left + parent.own_width
                    }else{
                        return parent.x1 + parent.chart.margin.left + parent.x(d.ts)
                    }
             //return parent.x(d.ts) > 0 ? (parent.x1 + parent.chart.margin.left + parent.x(d.ts)) : (parent.x1 + parent.chart.margin.left) })
             })
            //        .x(function(d){ return parent.x1 + parent.chart.margin.left + parent.x(d.ts) })
                    .y1(function(d){ return parent.chart.margin.top + parent.y(d['0.25'])})
                    .y0(function(d){ return parent.chart.margin.top + parent.y(d['0.5'])})
                    .curve(d3.curveBasis)
                    .context(context);

            var areaSuperior = d3.area()
            .x(function(d){
                    if(parent.x(d.ts) < 0){
                        return parent.x1 + parent.chart.margin.left
                    }else if(parent.x(d.ts) > parent.own_width){
                        return parent.x1 + parent.chart.margin.left + parent.own_width
                    }else{
                        return parent.x1 + parent.chart.margin.left + parent.x(d.ts)
                    }
            //return parent.x(d.ts) > 0 ? (parent.x1 + parent.chart.margin.left + parent.x(d.ts)) : (parent.x1 + parent.chart.margin.left) })
            })
            //        .x(function(d){ return parent.x1 + parent.chart.margin.left + parent.x(d.ts) })
                    .y1(function(d){ return parent.chart.margin.top + parent.y(d['0.75'])})
                    .y0(function(d){ return parent.chart.margin.top + parent.y(d['0.5'])})
                    .curve(d3.curveBasis)
                    .context(context);

            var mediana = d3.line() //d3.area()
            .x(function(d){
                    if(parent.x(d.ts) < 0){
                        return parent.x1 + parent.chart.margin.left
                    }else if(parent.x(d.ts) > parent.own_width){
                        return parent.x1 + parent.chart.margin.left + parent.own_width
                    }else{
                        return parent.x1 + parent.chart.margin.left + parent.x(d.ts)
                    }
            //return parent.x(d.ts) > 0 ? (parent.x1 + parent.chart.margin.left + parent.x(d.ts)) : (parent.x1 + parent.chart.margin.left) })
            })
            //        .x(function(d){ return parent.x1 + parent.chart.margin.left + parent.x(d.ts) })
                    .y(function(d){ return parent.chart.margin.top + parent.y(d['0.5'])})
                    .curve(d3.curveBasis)
                    .context(context);

            context.beginPath();
            areaInferior(this.boxPlots);
            context.fillStyle = this.highBottomAreaColor;
            context.fill();
            context.closePath();

            context.beginPath();
            areaSuperior(this.boxPlots);
            context.fillStyle = this.highTopAreaColor;
            context.fill();
            context.closePath();

            context.beginPath();
            mediana(this.boxPlots);
            context.lineWidth = 3;
            context.strokeStyle = this.highMiddleLineColor;
            context.stroke();
            context.lineWidth = 1;
            context.closePath();
        }
    }
}

class Scatterchart extends Module{
    constructor(options){
        super(options);
        this.type = 'scatterchart';

        var endTime = new Date();
        var startTime = new Date(endTime.getTime() - this.own_width / this.chart.pixelsPerSecond * 1000);

        this.y = this.chart.yScale.copy();
        this.x = d3.scaleTime().range([0, this.own_width]);
        this.x.domain([startTime, endTime]);

        this.dotsColor = options.dotsColor || 'orange';
        this.dotsRadius = options.dotsRadius || 5;
        this.maxFlowDrawDots = options.maxFlowDrawDots || 999;
        this.lowFlow = true;

        this.squareLength = options.squareLength || 15;
        this.scatterBoxes = [];
        this.squareColor = options.squareColor || 'blue';
        this.squareDensity = options.squareDensity || 10;
        this.scaleColor = d3.scaleLinear().domain([0,this.squareDensity]).range(['transparent',this.squareColor]).interpolate(d3.interpolateRgb);

        this.appendModuleOptions();
        this.flow = options.flow || 'both';
    }


    appendModuleOptions(){
        var options = {
            title: this.type,
            dotsColor: this.dotsColor,
            dotsRadius: this.dotsRadius,
            index: this.index,
            squareDensity: this.squareDensity
        };
        var markup = `
            <div class="mod-option">
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
        `;

        $('.modules-options').append(markup);
        var module = this;
        options.flow == 'low' ? $('#'+options.index+'radio-1').prop('checked', true) : (options.flow == 'both' ? $('#'+options.index+'radio-3').prop('checked', true) : $('#'+options.index+'radio-2').prop('checked', true));
        $('fieldset#scatterchart'+options.index+' input[type="radio"]').change(function(){
            $(this).attr('id') == options.index + 'radio-1' ? module.flow = 'low' : ($(this).attr('id') == options.index + 'radio-2' ? module.flow = 'both' : module.flow = 'high' );
        });
        $('#dotsColor'+options.index).spectrum({
            color: module.dotsColor,
            showAlpha: true,
            preferredFormat: "rgba",
            showButtons: false,
            move: function(color){
                module.dotsColor = color.toRgbString();
            }
        });
        $('#square-color'+options.index).spectrum({
            color: module.squareColor,
            preferredFormat: "rgb",
            showButtons: false,
            move: function(color){
                module.scaleColor = d3.scaleLinear().domain([0,module.squareDensity]).range(['transparent',color.toRgbString()]).interpolate(d3.interpolateRgb);
            }
        });

        $('#dotsRadius'+options.index).slider({
            min:1,
            max:10,
            value: module.dotsRadius,
            step:0.5,
            slide: function(event, ui){
                $(this).parent().find('#dotsRadiusVal'+module.index).text("Dots Radius: "+ ui.value);
                module.dotsRadius = ui.value;
            }
        });

        $('#squareDensity'+options.index).slider({
            min:1,
            max:50,
            step:1,
            value: module.squareDensity,
            slide: function(event, ui){
                $(this).parent().find('#squareDensityText'+module.index).text("Square Density: "+ ui.value);
                module.squareDensity = ui.value;
                module.scaleColor.domain([0,module.squareDensity]);

            }
        });
    }


    update(ts){
        this.own_width = this.chart.width / this.chart.modules.length;
        this.x1 =  this.own_width * this.index;
        var endTime = new Date(ts - ((this.own_width / this.chart.pixelsPerSecond * 1000) * ((this.chart.modules.length - 1) - this.index) ));

      //  var endTime = new Date(ts - ((this.own_width / this.chart.pixelsPerSecond * 1000) * ((this.chart.modules.length - 1) - this.index) ))
        var startTime = new Date(endTime.getTime() - this.own_width / this.chart.pixelsPerSecond * 1000);

        this.data = this.chart.filterData(startTime, endTime);

        // UPDATE DOMAINS
        this.x = d3.scaleTime().range([0, this.own_width]);
        this.x.domain([startTime, endTime]);
        this.y.domain(this.chart.y.domain());

        // GENERATING BINNING CHART
        var timeInterval = this.x.domain();
        var squareLength = this.squareLength;
        var scale = d3.scaleTime().domain(timeInterval).range([0, Math.ceil( this.own_width / squareLength)]);
        var delta = scale.invert(1).getTime() - scale.invert(0).getTime();

        // POPULATE BOXES
        if (this.scatterBoxes.length == 0){
            this.scatterDomain = this.x;
            for(let i = 0; i < Math.ceil(this.own_width / squareLength) + 1; i++){
                this.scatterBoxes.push({
                    ts: timeInterval[0].getTime() + (i * delta),
                    vals: new Array(Math.ceil(this.y.range()[0] / squareLength)).fill(0)
                });
            }
        }
        if(this.scatterBoxes[0].ts + delta < this.x.domain()[0].getTime() ){
            this.scatterBoxes.splice(0,1);
            this.scatterBoxes.push({
                ts: this.scatterBoxes[this.scatterBoxes.length - 1].ts + delta,
                vals: new Array(Math.ceil(this.y.range()[0] / squareLength)).fill(0)
            });
        }

        var startScale = new Date(this.scatterBoxes[this.scatterBoxes.length - 2].ts );
        var endScale = new Date(this.scatterBoxes[this.scatterBoxes.length - 1].ts + delta);

        var yCells = Math.ceil(this.chart.height / squareLength);
        var scaleY = this.chart.y.copy();
        scaleY.domain(this.y.domain()).range([yCells,0]);
        var scatterBoxes = this.scatterBoxes;

        var newElements = this.data.filter( el => el.ts > startScale.getTime() && el.ts <= startScale.getTime() + delta);
        scatterBoxes[this.scatterBoxes.length - 2].vals = new Array(Math.ceil(this.y.range()[0] / squareLength)).fill(0);
        newElements.forEach(function(el){
            if(Math.ceil(scaleY(el.data)) <= yCells && Math.ceil(scaleY(el.data)) >= 0)
                scatterBoxes[scatterBoxes.length - 2].vals[Math.ceil(scaleY(el.data)) - 1] += 1;
        });

        var newElements = this.data.filter( el => el.ts > startScale.getTime() + delta && el.ts <= endScale.getTime());
        scatterBoxes[scatterBoxes.length - 1].vals = new Array(Math.ceil(this.y.range()[0] / squareLength)).fill(0);
        newElements.forEach(function(el){
            if(Math.ceil(scaleY(el.data)) <= yCells && Math.ceil(scaleY(el.data)) >= 0)
                scatterBoxes[scatterBoxes.length - 1].vals[Math.ceil(scaleY(el.data)) - 1] += 1;
        });

        // Should I draw the Dots ?
        this.lowFlow = this.chart.connection.flowPerSecond < this.maxFlowDrawDots ? true : false;

    }


    draw(){
        var context = this.chart.context;
        var parent = this;
        var color = this.dotsColor;
        var r = this.dotsRadius;


        // Low Flow (Isto e lento)
        if(this.flow == 'both' || this.flow == 'low'){
            this.data.forEach(function(el){
                let cx = parent.chart.margin.left + parent.x1 + parent.x(el.ts);
                let cy = parent.chart.margin.top + parent.y(el.data);
                //let color = 'orange'
                context.beginPath();
              context.fillStyle = color;
              context.arc(cx, cy, r, 0, 2 * Math.PI, false);
              context.fill();
              context.closePath();

            });
        }
        if(this.flow == 'both' || this.flow == 'high'){

        // High Flow
        for(let i = 0; i < this.scatterBoxes.length; i++){
            let x = parent.x1 + parent.chart.margin.left + parent.x(this.scatterBoxes[i].ts);
            let width = this.squareLength;
            let height = this.squareLength;

            if( x + width > parent.x1 + parent.chart.margin.left + parent.own_width ){
                width = (parent.x1 + parent.chart.margin.left + parent.own_width) - x;
            }else if( x < parent.x1 + parent.chart.margin.left ){
                width = width + parent.x(this.scatterBoxes[i].ts);
                x = parent.x1 + parent.chart.margin.left;
            }

            for(let j = 0; j < this.scatterBoxes[i].vals.length; j++){
                let y = parent.chart.margin.top + (j * this.squareLength);
                let color = this.scaleColor(this.scatterBoxes[i].vals[j]);

                context.beginPath();
                context.rect(x, y, width, height);
                context.fillStyle = color;
                context.fill();
                context.closePath();
            }
        }
        }
    }
}

class Barchart extends Module{
    constructor(options){
        super(options);
        this.type = 'barchart';

        var endTime = new Date();
        var startTime = new Date(endTime.getTime() - this.own_width / this.chart.pixelsPerSecond * 1000);

        this.domain = this.chart.y.domain();
        this.numBars = options.numBars || 10;
        this.indexBars = 0;
        this.barsColor = options.barsColor || 'blue';
        this.maxWidth = options.maxWidth || 0.9;
        this.startingDomain = options.startingDomain || [0,100];

        this.y = this.chart.y.copy().range([0, this.numBars]);
        this.x = d3.scaleLinear().domain(this.startingDomain).range([0, this.own_width]);

        this.yScatter = this.chart.y.copy(); // d3.scaleLinear().domain(this.chart.y.domain()).range([this.chart.height, 0])
        this.xScatter = d3.scaleTime().range([0, this.own_width]);
        this.xScatter.domain([startTime, endTime]);

        this.barsData = [];
        for(let x = 0; x < this.numBars; x++){ this.barsData.push(0);}

        this.bandwidth = this.chart.height / this.numBars;

        this.chart.x = d3.scaleLinear().range([0, this.chart.width - this.own_width]);

        this.appendModuleOptions();

        this.transitions = [];
    }


    appendModuleOptions(){
        var options = {
            title: this.type,
            index: this.index,
            maxWidth: parseInt(this.maxWidth * 100)
        };
        var markup = `
            <div class="mod-option">
                <h3>${options.title}</h3>
                <fieldset id="High-Flow${options.index}">
                    <legend>Options </legend>
                    <p>
                        <span id="maxWidthVal${options.index}">Max Width: ${options.maxWidth} % </span>
                        <div id="maxWidth${options.index}"></div>
                    </p>
                    <p>
                        <span>Bars Color: </span>
                        <input type="text" id="barsColor${options.index}" />
                    </p>
                </fieldset>


            </div>
        `;

        $('.modules-options').append(markup);

        var module = this;
        $('#barsColor'+options.index).spectrum({
            color: module.barsColor,
            showAlpha: true,
            preferredFormat: "rgba",
            showButtons: false,
            move: function(color){
                module.barsColor = color.toRgbString();
            }
        });

        $('#maxWidth'+options.index).slider({
            min:0.1,
            max:1,
            step:0.05,
            value: module.maxWidth,
            slide: function(event, ui){
                $(this).parent().find('#maxWidthVal'+module.index).text("Max Width: "+ parseInt(ui.value * 100) +"% ");
                module.maxWidth = ui.value;
            }
        });
    }


    update(ts){
        this.own_width = this.chart.width / this.chart.modules.length;
        this.x1 =  this.own_width * this.index;
        var endTime = new Date(ts - ((this.own_width / this.chart.pixelsPerSecond * 1000) * ((this.chart.modules.length - 1) - this.index) ));
        var startTime = new Date(endTime.getTime() - this.own_width / this.chart.pixelsPerSecond * 1000);

        this.data = this.chart.filterData(null, endTime);

        var max = Math.max.apply(Math, this.domain);
        var slices = max/this.numBars;

        // TODO: OPTIMIZAR!!
        for(let i = 0; i < this.barsData.length; i++){
            this.barsData[i] = this.data.filter( el => Math.round(this.y(el.data)) == i ).length;
        }

        // UPDATE DOMAINS
        if( Math.max( ...this.barsData ) > this.x.domain()[1] * this.maxWidth ){
            this.x.domain([0, this.x.domain()[1] + (this.x.domain()[1] * (1 - this.maxWidth))]);
        }

        this.x.range([0, this.own_width]);
        this.xScatter = d3.scaleTime().range([0, this.own_width]);
        this.xScatter.domain([startTime, endTime]);
        this.y.domain(this.chart.y.domain());
    }


    draw(){
        var context = this.chart.context;
        var parent = this;
        var max = Math.max.apply(Math, this.domain);
        var slices = max/this.numBars;

        if(this.chart.modules.length > this.index + 1 == false || this.chart.modules[this.index+1].type == 'scatterchart'){
            this.data.forEach(function(el){
                if(! (parent.xScatter(el.ts) > parent.x(parent.barsData[(Math.ceil(el.data/slices) - 1)]))){
                    return
                }
                let cx = parent.chart.margin.left + parent.x1 + parent.xScatter(el.ts);
                let cy = parent.chart.margin.top + parent.yScatter(el.data);
                let r = 5;
                let color = (parent.index == 0) ? 'blue' : 'orange';

                context.beginPath();
                context.fillStyle = color;
                context.arc(cx, cy, r, 0, 2 * Math.PI, false);
                context.fill();
                context.closePath();
            });
        }

        for(var i=0; i < this.barsData.length; i++){
            let x,y,width,height,color;
            if(this.chart.modules.length > this.index + 1 == false || this.chart.modules[this.index+1].type == 'scatterchart'){
                x = this.chart.margin.left + this.x1;
                y = this.chart.margin.top + (this.chart.height - this.bandwidth) - (i * this.bandwidth);
                width = this.x(this.barsData[i]);
                height = this.bandwidth;
            }else{
                x = this.chart.margin.left + this.x1 + (this.own_width - this.x(this.barsData[i]));
                y = this.chart.margin.top + (this.chart.height - this.bandwidth) - (i * this.bandwidth);
                width = this.x(this.barsData[i]);
                height = this.bandwidth;
            }
            color = this.barsColor;
            context.beginPath();
            context.fillStyle = color;
            context.rect(x,y,width,height);
            context.fill();
            context.strokeStyle = "1px";
            context.stroke();
            context.closePath();
        }
    }
}

class Connection{
    constructor(options){
        if(options.host == undefined){
            throw new Error('Must provide host address')
        }else if(options.port == undefined){
            throw new Error('Must provide port address')
        }else if(options.chart == undefined && !(options.chart instanceof Chart)){
            throw new Error('Please provide a chart')
        }
        this.socket;
        this.host = options.host;
        this.port = options.port;
        this.chart = options.chart;
        this.packs = 0;
        this.flowPerSecond = 1;
        this.chart.connection = this;

        this.divOptions(this.chart);
    }

    divOptions(){
        var markup = `
            <p>
                <button type="button" status="resume" class="btn btn-primary" disabled><i class="fas fa-play"></i>Resume</button>
                <button type="button" status="pause" class="btn btn-warning"><i class="fas fa-pause"></i>Pause</button>
            </p>
        `;
        $('#chartOptions').append(markup);

        var parent = this;
        $('#chartOptions button').on('click', function(){
            $(this).parent().find('button').attr('disabled', false);
            $(this).attr('disabled', true);
            if($(this).attr('status') == 'resume'){
                parent.resume();
                parent.chart.resume();
            }else{
                parent.pause();
                parent.chart.pause();
            }
        });
    }

    connect(){
        var chart = this.chart;
        var packs = this.packs;
        this.socket = io.connect('http://' + this.host + ':' + this.port);

        this.socket.on('message', function(data){
            let now = new Date();
            chart.data.push({
                ts: now.getTime(),
                data: data
            });
            packs += 1;
            $('#package-count p i').text(packs);
        });
        var connection = this;
        this.socket.on('delay', function(data){
            $('.options > span:first-child p.ammount').text("1 package per " + data["value"] + " seconds");
            $('#streamDelay').slider('value',data["value"]);
            $('#delay span').text(data["value"]);
            connection.flowPerSecond = 1 / data['value'];
        });
    }

    streamDelay(value){
        this.socket.emit('delay', {delay: value});
    }

    pause(){
        this.socket.emit('pause');
    }

    resume(){
        this.socket.emit('resume');
    }
}

var obj;
var connection;
$(document).ready(function(){

    // CHART
    obj = new Chart({
        width: $('.container').width() ,
        height: 400,
        margin: {top: 50, right: 40, left: 40, bottom: 20},
        transitions: 300,
        pixelsPerSecond: 10,
        bgColor: '#fff',
        xDomain: [0,100],
        yDomain: [1e-5,100],
        yScale: d3.scaleLog()
    });

    // MODULES

    var module1 = new Barchart({
        chart : obj,
        index : obj.modules.length,
        numBars : 20,
        barsColor : 'orange',
        maxWidth : 0.95,
        startingDomain : [0,100]
    });

    var module2 = new Linechart({
        chart : obj,
        index : obj.modules.length,
        flow  : 'high',
        boxPlotSteps : 40
    });

    var module2 = new Scatterchart({
        chart : obj,
        index : obj.modules.length,
        dotsColor  : 'black',
        dotsRadius : 1,
        squareLength : 20,
        squareColor : 'orange',
        squareDensity : 30,
        maxFlowDrawDots : 900
    });

    //CONNECTION
    connection = new Connection({
        host : 'localhost',
        port : '8002',
        chart: obj
    });


    //OTHERS
    $( "#streamDelay" ).slider({
        min:0.001,
        max:2,
        step:0.001,
        value:1,
        slide: function(event, ui){
            $(this).parent().find('p.ammount').text("1 package per " + ui.value + " seconds");
            connection.streamDelay(ui.value.toString());
        }
    });



    /* Connect WebSocket */
    connection.connect();
    /* Start Rendering */
    obj.start();
});
