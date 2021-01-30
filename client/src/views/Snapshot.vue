<template>
<div>
    
    <div class="bg-gray-800 pt-3">
      <div class="rounded-tl-md bg-gradient-to-r from-blue-900 to-gray-800 p-4 shadow text-2xl text-white">
        <h3 class="font-bold pl-2">Account - Snapshot</h3>
      </div>
    </div>


    <div class="flex flex-wrap">
      <div class="w-full md:w-1/1 xl:w-1/1 p-6" >
        <div class="bg-gradient-to-b from-blue-200 to-blue-100 border-b-4 border-blue-600 shadow-xl p-5">
            <div class="flex-1 text-right md:text-center">
              <h4 class="font-bold text-3xl">
                Snapshot
              </h4>
          </div>
           <div class="p-5">
              <canvas ref="myChart" id="myChart"></canvas>
            </div>
        </div>
      </div>
  </div>
</div>  
</template>

<script lang="ts">
import Chart from "chart.js";
import { Prop } from "vue-property-decorator";
import { SnapshotBalance } from "../../../shared/models/snapshot-dto";
import { AccountService } from "../services/account";
import { NetFlowVue } from "./NetFlowBaseVue";
import { Formatter } from '../../../shared/utils/formatter'

export default class SnapshotView extends NetFlowVue {
  @Prop(String) accountId!: string;
  // vertical line to mark "Today" https://stackoverflow.com/a/43092029/75672

  mounted() {
    if(NetFlowVue.Vue3GoogleOauth?.isInit) {
      this.loadData();
    } else {
      console.log("Need to figure out how to make it wait for NetFlowVue.Vue3GoogleOauth?.isInit to be initialized");
      new Promise(resolve => setTimeout(resolve, 2000)).then(_=>this.loadData());
    }
  }
  
  loadData() {
      new AccountService().getAccountSnapshot(this.getAccessToken(), this.accountId).then((data) => {
        this.createChart(data.account.official_name ?? data.account.name, data.balances.filter(b=>!b.future), data.balances.filter(b=>b.future));
    });
  }

  createChart(name: string, current: SnapshotBalance[], future: SnapshotBalance[]) {
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
          displayColors: false,
          callbacks: {
            title: function(tooltipItems,data) {
              return new Date(tooltipItems[0].label as string).toDateString();
            },
            label: function (tooltipItems, data) {
              const item = tooltipItems.datasetIndex === 0?  current[tooltipItems.index as number]: future[tooltipItems.index as number];
              return [
                item.notes,
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
            label: name,
            data: current.map((d) => { return { x: d.date, y: d.balance };}),
          },
          {
            steppedLine: true,
            fill: false,
            borderDash: [5, 5],
            borderColor: "rgba(255,64,64,1)",
            label: "predicted",
            data: future.map((d) => { return { x: d.date, y: d.balance };}),
          },
        ],
      },
    });
  }
}
</script>