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

    <div class="flex flex-wrap" v-if="futureTransactions.length">
      <div class="w-full md:w-1/1 xl:w-1/1 p-6" >
        <div class="bg-gradient-to-b from-blue-200 to-blue-100 border-b-4 border-blue-600 shadow-xl p-5">
            <div class="flex-1 text-right md:text-center">
              <h4 class="font-bold text-3xl">
                Predicted Transactions
              </h4>
          </div>
           <div class="p-5" v-if="futureTransactions">
             <table>
               <thead class="font-bold">
                 <td class="pr-2">Date</td>
                 <td class="pr-2">Description</td>
                 <td class="px-2 text-right">Predicted Amount</td>
                 <td class="px-2 text-right">Override Amount</td>
                 <td class="px-2 text-right">Final Balance</td>
              </thead>
              <tr v-for="txn in futureTransactions" :key="txn.id">
                 <td class="px-1" >{{formatter.toISODateString(new Date(txn.snapshotBalance.date))}}</td>
                 <td class="px-1">{{txn.snapshotBalance.notes}}</td>
                 <td class="text-right px-1">{{formatter.currencyUSD(txn.snapshotBalance.transactionAmount)}}</td>
                 <td class="text-right px-1 w-48"><input class="border-blue-700 border px-2 m-1 text-right w-24"  v-model="txn.override"/></td>
                 <td class="text-right px-1">{{formatter.currencyUSD(txn.snapshotBalance.balance)}}</td>
              </tr>
             </table>
           </div>
            <button class="btn" @click="updateOverrides()">Apply</button>
        </div>
      </div>
    </div>
</div>  
</template>

<script lang="ts">
import Chart from "chart.js";
import { InjectReactive, Prop, Watch } from "vue-property-decorator";
import { SnapshotBalance } from "../../../shared/models/snapshot-dto";
import { AccountService } from "../services/account";
import { NetFlowVue } from "./NetFlowBaseVue";
import { Formatter } from '../../../shared/utils/formatter'

export default class SnapshotView extends NetFlowVue {
  @Prop(String) accountId!: string;

  futureTransactions: SnapshotBalanceWithOverride[] = [];
  pastTransactions: SnapshotBalance[] = [];
  accountName: string = "";

  // vertical line to mark "Today" https://stackoverflow.com/a/43092029/75672

  @InjectReactive() isInit!: boolean;
  
  @Watch("isInit", { immediate: true }) onIsInitChanged() {
    if (this.isInit) { 
      this.loadData();
    }
  }

  loadData() {
      new AccountService().getAccountSnapshot(this.getAccessToken(), this.accountId).then((data) => {
        this.futureTransactions = data.balances.filter(b=>b.future).map(s=> new SnapshotBalanceWithOverride (s));
        this.pastTransactions = data.balances.filter(b=>!b.future);
        this.accountName = data.account.official_name ?? data.account.name;
        this.loadChart();
    });
  }
  loadChart() {
      this.createChart(this.accountName, this.pastTransactions, this.futureTransactions.map(s=>s.snapshotBalance as SnapshotBalance));
  }

  updateOverrides() {
    console.log('update overrides clicked');
    if(this.futureTransactions.length > 0) {
      // TODO remove this logic from backend
      let currentBalance = this.futureTransactions[0].snapshotBalance?.balance ?? 0;
      for (let i = 1; i< this.futureTransactions.length; i++) {
        currentBalance += +this.futureTransactions[i].override;
        (this.futureTransactions[i].snapshotBalance as any).balance = currentBalance;
      }

      this.loadChart();
    }
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

class SnapshotBalanceWithOverride{
  override: number = 0;
  snapshotBalance? :SnapshotBalance;
  constructor(snapshotBalance: SnapshotBalance) {
    this.snapshotBalance = snapshotBalance;
    this.override = snapshotBalance.transactionAmount;
  }
}
</script> 