
export class Outlier{
    constructor(options){
        this.chart = options.chart
        this.height = options.height
        this.width = options.width
        this.data = []
        this.thresholdTop
        this.thresholdBottom = options.thresholdBottom

    }
    update(ts){
        //console.log('updating')
    }
    draw(){
        var context = this.chart.context
        var x = this.chart.margin.left
        var y = this.chart.margin.top - this.height
        var width = this.width
        var height = this.height
        context.beginPath()
        context.strokeStyle = 'black'
        context.rect(x, y, width, height)
        context.stroke()
        context.closePath()
        //console.log('drawing')
    }
}
