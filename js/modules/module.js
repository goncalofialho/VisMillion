// This class should be abstract
export class Module{
    constructor(options){
        if(this.constructor === Module){
            throw new Error('Cannot instantiate abstract class named: ' + this.constructor.name)
        }else if(options.chart == undefined){
            throw new Error('Chart not specified at options')
        }
        this.chart = options.chart
        this.index = options.index
        this.x
        this.y
        this.type
        this.x1
        this.data = []

        this.own_width = this.chart.width / (this.chart.modules.length + 1)
        this.x1 = this.own_width * (this.chart.modules.length + 1)

        this.chart.addModule(this)
        this.deltaTimeX = options.deltaTimeX || undefined
    }

    // just declarations
    appendModuleOptions(){}
    update(ts){}
    draw(){}
    mouseEvent(x, y, tooltip, event){}
}