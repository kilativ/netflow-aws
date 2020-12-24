<template>
  <div style="width: 1000px; height: 600px">
    <canvas ref="myChart" id="myChart"></canvas>
  </div>
</template>

<script lang="ts">
import Chart from "chart.js";
import { inject } from "vue";
import { Vue } from "vue-class-component";
import { SnapshotBalance } from "../../../shared/models/snapshot-dto";
import { AccountService } from "../services/account";

export default class SnapshotView extends Vue {
  formatter: any;

  // vertical line to mark "Today" https://stackoverflow.com/a/43092029/75672

  mounted() {
     this.formatter = inject('formaters'); // is there a better way to access globa properties than injecting it?
     new AccountService().getAccountSnapshot('accountIdHere').then(data => {
       console.log(data);
       this.createChart(data);
     })

  }

  createChart(chartData: SnapshotBalance[]) {
    const cavnas = document.getElementById("myChart") as HTMLCanvasElement;
    const formatter= this.formatter;
    new Chart(cavnas, {
      type: "line",
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
          xAxes: [
            {
              type: "time",
              time: {
                unit: "day",
              },
            },
          ],
        },
        tooltips: {
          mode: "index",
          displayColors: false,
          callbacks: {
            title: function(tooltipItems, data) {
              const item = chartData[tooltipItems[0].index as number];
							return item.notes;
            },
            label: function (tooltipItems, data) {
              const item = chartData[tooltipItems.index as number];
              return [new Date(item.date).toLocaleDateString(), formatter.currencyUSD(item.transactionAmount)];
            }
          }
        }
      },
      data: {
        datasets: [
          {
            steppedLine: true,
            fill:false,
            borderDash: [5, 2],
            borderColor: 'rgba(255,125,125,1)',
            label: "Checking Account Balance",
            data: chartData.map(d=> {
              return {x:d.date, y:d.balance }
            }) 
          },
        ],
      },
    });
  }
}
</script>