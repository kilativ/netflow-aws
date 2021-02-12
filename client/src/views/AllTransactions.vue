<template>
  <div class="transactions">
    <div class="bg-gray-800 pt-3">
      <div
        class="rounded-tl-md bg-gradient-to-r from-green-900 to-gray-800 p-4 shadow text-2xl text-white">
        <h3 class="font-bold pl-2">All Transactions</h3>
      </div>
    </div>

    <div class="flex flex-wrap">
      <div class="w-full md:w-1/1 xl:w-1/1 p-6">
        <div
          class="bg-gradient-to-b from-green-200 to-green-100 border-b-4 border-green-600 rounded-lg shadow-xl p-5">
          <div class="flex-1 text-left lg:text-center">
            <h4 class="font-bold text-3xl">All Transactions</h4>
            <div><i class="fas fa-parking pl-1"></i> = pending</div>
            <div>
              <form v-on:submit.prevent="searchClicked">
                <input
                  v-model="searchTerm"
                  placeholder="search"
                  class="border-green-700 border px-2"
                />
                <button
                  class="m-5 bg-green-500 px-2 py-1 hover:bg-green-700 text-white font-bold border border-green-700"
                  @click="searchClicked">
                  Search
                </button>
              </form>
            </div>
          </div>
          <div>
            <table class="w-full lg:p-5 text-gray-700 block lg:table">
              <thead class="hidden lg:table-header-group">
                <tr>
                  <th class="text-left text-green-900 px-1 cursor-pointer" @click="sortClicked(transactions, 'date')">
                    Date
                    <i class="fas fa-arrow-up" v-if="sortColumn === 'date' && sortAsc"></i>
                    <i class="fas fa-arrow-down" v-if="sortColumn === 'date' && !sortAsc"></i>
                  </th>
                  <th class="text-left text-green-900 px-1 cursor-pointer" @click="sortClicked(transactions, 'name')">
                    Name
                    <i class="fas fa-arrow-up" v-if="sortColumn === 'name' && sortAsc"></i>
                    <i class="fas fa-arrow-down" v-if="sortColumn === 'name' && !sortAsc"></i>
                  </th>
                  <th class="text-left text-green-900 px-1 cursor-pointer" @click="sortClicked(transactions, 'account')">
                    Account
                    <i class="fas fa-arrow-up" v-if="sortColumn === 'account' && sortAsc"></i>
                    <i class="fas fa-arrow-down" v-if="sortColumn === 'account' && !sortAsc"></i>
                  </th>
                  <th class="text-right text-green-900 px-1 cursor-pointer" @click="sortClicked(transactions, 'amount')">
                    Amount
                    <i class="fas fa-arrow-up" v-if="sortColumn === 'amount' && sortAsc"></i>
                    <i class="fas fa-arrow-down" v-if="sortColumn === 'amount' && !sortAsc"></i>
                  </th>
                </tr>
              </thead>

              <tbody class="block lg:table-row-group">
                <tr
                  v-for="txn in transactions"
                  :key="txn.transaction_id"
                  class="block lg:table-row border-b border-green-500 mb-3">
                  <td class="block lg:table-cell">
                    <div class="flex flex-row justify-between">
                      <div class="font-bold visible lg:hidden">Date</div>
                      <div class="whitespace-nowrap">
                        {{ txn.date
                        }}<i class="fas fa-parking pl-1" v-if="txn.pending"></i>
                      </div>
                    </div>
                  </td>
                  <td class="block lg:table-cell">
                    <div class="flex flex-row justify-between">
                      <div class="font-bold visible lg:hidden">Name</div>
                      <div class="text-right lg:text-left">{{ txn.name }}</div>
                    </div>
                  </td>
                  <td class="block lg:table-cell">
                    <div class="flex flex-row justify-between">
                      <div class="font-bold visible lg:hidden">Category</div>
                      <div class="text-right lg:text-left w-full">
                        <router-link
                          v-bind:to="`/account/${txn.account_id}/transactions/`"
                          class="cursor-pointer underline">
                          {{ txn.account_name }}
                        </router-link>
                      </div>
                    </div>
                  </td>
                  <td class="block lg:table-cell">
                    <div class="flex flex-row justify-between">
                      <div class="font-bold visible lg:hidden">Amount</div>
                      <div class="text-right w-full">
                        {{ formatter.currencyUSD(txn.amount) }}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="pleaseWait">
              <div class="sk-wave">
                <div class="sk-wave-rect spinner"></div>
                <div class="sk-wave-rect spinner"></div>
                <div class="sk-wave-rect spinner"></div>
                <div class="sk-wave-rect spinner"></div>
                <div class="sk-wave-rect spinner"></div>
              </div>
            </div>
            <div class="flex flex-row">
              <button
                class="bg-green-500 px-2 py-1 hover:bg-green-700 text-white font-bold border border-green-700"
                @click="loadOlder()">
                Load older
              </button>
              <div class="text-green-700 p-1">
                Loaded transactions untill
                {{ dayjs(startDate).format("MM-DD-YYYY") }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { AccountService } from "../services/account";
import { NetFlowVue } from "./NetFlowBaseVue";
import { InjectReactive, Prop, Watch } from "vue-property-decorator";

import TransactionTable from "../components/TransactionTable.vue";
import { Options } from "vue-class-component";
import dayjs from "dayjs";
import { NetflowTransaction } from "../../../shared/models/netflow-transaction";
import { SortUtils } from "../utils/sort-utils";

const DAYS_TO_LOAD = 30;

@Options({
  components: {
    TransactionTable,
  },
})
export default class AllTransactionsView extends NetFlowVue {
  @Prop(String) accountId!: string;

  transactions: NetflowTransaction[] = [];
  pendingTransactions: NetflowTransaction[] = [];
  searchTerm: any;
  endDate = new Date();
  startDate = new Date();
  pleaseWait = false;
  dayjs = dayjs;

  sortUtils = new SortUtils();

  private sortColumn = "date";
  private sortAsc = false;

  @InjectReactive() isInit!: boolean;
  @Watch("isInit", { immediate: true }) onIsInitChanged() {
    if (this.isInit) {
      this.resetDates();
      this.loadTransactions();
    }
  }

  resetDates() {
    this.endDate = new Date();
    this.startDate = dayjs().subtract(DAYS_TO_LOAD, "days").toDate();
  }

  async loadTransactions(append = false) {
    this.pleaseWait = true;
    const allTxns = await new AccountService().getUserTransactions(
      this.getAccessToken(),
      this.startDate,
      this.endDate,
      this.searchTerm ?? ""
    );
    this.pleaseWait = false;

    const permanentTxns = allTxns.filter((txn) => !txn.pending);
    const pendingTxnThatHavePermTxn = permanentTxns
      .filter((txn) => txn.pending_transaction_id)
      .map((txn) => txn.pending_transaction_id);

    const newTxns = allTxns.filter(
      (txn) => pendingTxnThatHavePermTxn.indexOf(txn.transaction_id) === -1
    );
    if (append) {
      this.transactions = [...this.transactions, ...newTxns];
    } else {
      this.transactions = newTxns;
    }
    this.sortUtils.sortTransactions(this.transactions, this.sortColumn, this.sortAsc);
  }

  searchClicked() {
    this.resetDates();
    this.loadTransactions();
  }

  loadOlder() {
    this.endDate = this.startDate;
    this.startDate = dayjs(this.endDate)
      .subtract(DAYS_TO_LOAD, "days")
      .toDate();
    this.loadTransactions(true);
  }

  sortClicked(collection: NetflowTransaction[], columName: string) {
    if (columName === this.sortColumn) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColumn = columName;
    }
    this.sortUtils.sortTransactions(collection, this.sortColumn, this.sortAsc);
  }
}
</script>
<style scoped>
.spinner {
  background-color: rgb(16, 185, 129);
}
</style>