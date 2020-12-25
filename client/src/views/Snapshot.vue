<template>
  <div style="width: 1000px; height: 600px">
    <canvas ref="myChart" id="myChart"></canvas>
  </div>
</template>

<script lang="ts">
import Chart from "chart.js";
import { inject } from "vue";
import { Vue } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { SnapshotBalance, SnapshotDto } from "../../../shared/models/snapshot-dto";
import { AccountService } from "../services/account";
import { NetFlowVue } from "./NetFlowBaseVue";
import { Formatter } from '../utils/formatter'

export default class SnapshotView extends NetFlowVue {
  @Prop(String) accountId!: string;
  // vertical line to mark "Today" https://stackoverflow.com/a/43092029/75672

  @Watch("Vue3GoogleOauth.isInit", { immediate: true }) onMatchChanged() {
    if (this.Vue3GoogleOauth.isInit) {
      this.loadData();
    }
  }

  loadData() {
        new AccountService().getAccountSnapshot(this.getAccessToken(), this.accountId).then((data) => {
      console.log(data);
      this.createChart(data);
    });
  }

  createChart(chartData: SnapshotDto) {
    const cavnas = document.getElementById("myChart") as HTMLCanvasElement;
    const formatter = Formatter;
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
            title: function (tooltipItems, data) {
              if (tooltipItems.length > 1) {
                debugger;
              }
              const item = chartData.balances[tooltipItems[0].index as number];
              return item.notes;
            },
            label: function (tooltipItems, data) {
              const item = chartData.balances[tooltipItems.index as number];
              return [
                new Date(item.date).toLocaleDateString(),
                `amount: ${formatter.currencyUSD(item.transactionAmount)}`,
                `balance: ${formatter.currencyUSD(item.balance)}`,
              ];
            },
          },
        },
      },
      data: {
        datasets: [
          {
            steppedLine: true,
            fill: false,
            borderDash: [5, 0],
            borderColor: "rgba(255,64,64,1)",
            label: chartData.account.official_name??chartData.account.name,
            data: chartData.balances.map((d) => {
              return { x: d.date, y: d.balance };
            }),
          },
        ],
      },
    });
  }
}
</script>