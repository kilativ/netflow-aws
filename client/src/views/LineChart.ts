import { Line, mixins, } from 'vue-chartjs'
const { reactiveProp } = mixins

export default class MyLineChart extends Line{
  options: Chart.ChartOptions | undefined
  chartData: Chart.ChartData  ={}
  mounted () {
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    this.renderChart(this.chartData, this.options)
  }
}