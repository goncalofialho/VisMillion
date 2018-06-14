import { Module } from './module.js'

export class Areachart extends Module{
    constructor(options){
        super(options)
        this.type = 'areachart'

        var endTime = new Date()
        var startTime = new Date(endTime.getTime() - this.own_width / this.chart.pixelsPerSecond * 1000)
    }


}