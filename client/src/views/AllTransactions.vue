<template>
  <div class="transactions">
    <div class="bg-gray-800 pt-3">
      <div class="rounded-tl-md bg-gradient-to-r from-green-900 to-gray-800 p-4 shadow text-2xl text-white">
        <h3 class="font-bold pl-2">All Transactions</h3>
      </div>
    </div>

    <div class="flex flex-wrap">
      <div class="w-full md:w-1/1 xl:w-1/1 p-6" >
        <div class="bg-gradient-to-b from-green-200 to-green-100 border-b-4 border-green-600 rounded-lg shadow-xl p-5">
            <div class="flex-1 text-left lg:text-center">
              <h4 class="font-bold text-3xl">
                All Transactions
              </h4>
              <div><i class="fas fa-parking pl-1"></i> = pending</div>
          </div>
           <div>
    <table class="w-full lg:p-5 text-gray-700 block lg:table">
      <thead class="hidden lg:table-header-group">
          <tr>
              <th class="text-left text-blue-900 px-1">Date</th>
              <th class="text-left text-blue-900 px-1">Name</th>
              <th class="text-left text-blue-900 px-1">Account</th>
              <th class="text-right text-blue-900 px-1">Amount</th>
          </tr>
      </thead>

      <tbody class="block lg:table-row-group">
        <tr v-for="txn in transactions.slice(0,50)" :key="txn.transaction_id" class="block lg:table-row border-b border-blue-500 mb-3">
          <td class="block lg:table-cell">
            <div class="flex flex-row justify-between">
              <div class="font-bold visible lg:hidden">Date</div>
              <div class="whitespace-nowrap">{{ txn.date }}<i class="fas fa-parking pl-1" v-if="txn.pending"></i></div>
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
              <div class="text-right lg:text-left w-full" >
                <router-link v-bind:to="`/account/${txn.account_id}/transactions/`" class="cursor-pointer underline">
                  {{ txn.account_name }}
                </router-link>
              </div>
            </div>
          </td>
          <td class="block lg:table-cell">
            <div class="flex flex-row justify-between">
              <div class="font-bold visible lg:hidden">Amount</div>
              <div class="text-right w-full">{{ formatter.currencyUSD(txn.amount) }}</div>
            </div>
          </td>
        </tr>
      </tbody>
  </table>
            </div>
        </div>
      </div>
  </div>
  </div>
</template>
<script lang="ts">
import { AccountService } from "../services/account";
import { Transaction } from "plaid";
import { NetFlowVue } from "./NetFlowBaseVue";
import { InjectReactive, Prop, Watch } from "vue-property-decorator";

import TransactionTable from './TransactionTable.vue';
import { Options } from "vue-class-component";

@Options({
  components: {
    TransactionTable,
  },
})
export default class AllTransactionsView extends NetFlowVue {
  @Prop(String) accountId!: string;
  
  transactions: Transaction[] = [];
  pendingTransactions: Transaction[] = [];

  @InjectReactive() isInit!: boolean;
  @Watch("isInit", { immediate: true }) onIsInitChanged() {
    if (this.isInit) {
      this.loadTransactions();
    }
  }

  async loadTransactions() {
    const allTxns = await new AccountService().getUserTransactions(this.getAccessToken());

    const permanentTxns = allTxns.filter(txn=>!txn.pending);
    const pendingTxnThatHavePermTxn = permanentTxns.filter(txn=>txn.pending_transaction_id).map(txn=>txn.pending_transaction_id );
    
    this.transactions = allTxns.filter(txn => pendingTxnThatHavePermTxn.indexOf(txn.transaction_id) === -1);
    // this.pendingTransactions = allTxns.filter(txn=>txn.pending && pendingTxnThatHavePermTxn.indexOf(txn.transaction_id)=== -1);
  }
}
</script>