<template>
<div style="width:500px; height:300px">
  <canvas ref="myChart" width="500" height="300"></canvas>
  </div>
</template>

<script>
import Chart from "chart.js";

export default {
  name: "monthly-sales-chart",
  mounted() {
    new Chart(this.$refs.myChart, {
      type: "line",
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                suggestedMax: 100,
              },
            },
          ],
            xAxes: [{
                type: 'time',
                time: {
                    unit: 'week'
                }
            }]
        },
      },
      data: {
          
        datasets: [
          {
            steppedLine: true,
            label: "Account Balance",
            data:  [{
    x: new Date("2020-02-02"),
    y: 10
}, {
    t: new Date("2020-03-03"),
    y: 100
}]
          },
        ],
      },
    });
  },
};
</script>