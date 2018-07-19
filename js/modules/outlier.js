
export class Outlier{
    constructor(options){
        this.chart = options.chart
        this.marginOutlierTop = options.marginOutlierTop || 30
        this.height = options.height - this.marginOutlierTop
        this.width = options.width
        this.data = []
        this.thresholdTop = options.thresholdBottom * 2
        this.thresholdBottom = options.thresholdBottom
        this.lastEndTime  = null
        this.x1 = 0
        this.y = d3.scaleLinear().domain([this.thresholdBottom, this.thresholdBottom * 2]).range([this.height, 0])
        this.defaultRadius = options.radius || 5
        var date = new Date()
        this.scaleRadius = d3.scaleTime().domain([date, new Date(date.getTime() + this.chart.transitions * 2)]).range([this.defaultRadius / 2 , this.defaultRadius ])
    }


    mouseEvent(x, y, tooltip, event){
        var notFound = true
        for( let i = 0; i < this.data.length; i++){
            let el = this.data[i]
            let xBox = (this.chart.margin.left + this.chart.x(el.ts)) - this.radius
            let yBox = (this.chart.margin.top - this.height - this.marginOutlierTop + this.y(el.data)) - this.radius
            let width = this.radius * 2
            let height = this.radius * 2
            if(insideBox({x:x, y:y},{x:xBox, y:yBox, width: width, height: height})){
                let data = el.data
                let ts = (new Date(el.ts)).toLocaleString()
                var markup = `
                            <span>
                                <p>Timestamp  : <i>${ts}</i></p>
                                <p>Data Value : <i>${data}</i></p>
                            </span>
                            `
                tooltip.html(markup)
                tooltip
                    .style('top', event.pageY + 5 + 'px')
                    .style('left', event.pageX + 5 + 'px')
                    .classed('open', true)

                notFound = false
                break
            }
        }

        if( notFound ){
            tooltip
                .classed('open', false)
        }
    }

    update(ts){
        var endTime = new Date(ts)
        var data = this.chart.filterData(this.lastEndTime, endTime)
        data = data.filter( el => el.data > this.thresholdBottom && el.data <= this.thresholdTop)
        this.lastEndTime = endTime
        if(data.length > 0){
            for(let i = 0; i < data.length; i++){
                this.data.push(data[i])
            }
        }
        this.x1 = this.chart.modules[0].type == 'barchart' ? this.chart.modules[0].own_width : 0

        if( ts  > this.scaleRadius.domain()[1].getTime() ){
            this.radius = this.scaleRadius.range()[1]
            let date = new Date()
            // this prevents transitions to get negative values (because of selfDelay)
            date = new Date(date.getTime() - this.chart.selfDelay)
            let new_range = this.scaleRadius.range().reverse()
            this.scaleRadius = d3.scaleTime().domain([date, new Date(date.getTime() + this.chart.transitions * 2)]).range(new_range)


        }else{
            this.radius = this.scaleRadius(ts)
        }
        //this.radius = this.scaleRadius(ts) //> this.defaultRadius ? this.defaultRadius : this.scaleRadius(ts)

    }
    draw(){
        var context = this.chart.context
        var x = this.chart.margin.left
        var y = this.chart.margin.top - this.height
        var width = this.width
        var height = this.height
        var parent = this
        var r = this.radius
        var color = 'black' //this.dotsColor

        for(var i = 0; i < this.data.length ; i++){
            let el = this.data[i]
            let cx = parent.chart.margin.left  + parent.chart.x(el.ts)
            if (cx < parent.chart.margin.left) continue
            let cy = parent.chart.margin.top - this.height - this.marginOutlierTop  + this.y(el.data)
            context.beginPath()
            context.fillStyle = color
            context.arc(cx, cy, r, 0, 2 * Math.PI, false)
            context.fill()
            context.closePath()
        }

        context.beginPath()
        context.strokeStyle = 'black'
        context.rect(x, y - this.marginOutlierTop , width, height)
        context.stroke()
        context.closePath()
        //console.log('drawing')
    }
}
