<template>
  <div class="transactions">
    <div class="bg-gray-800 pt-3">
      <div class="rounded-tl-md bg-gradient-to-r from-blue-900 to-gray-800 p-4 shadow text-2xl text-white">
        <h3 class="font-bold pl-2">Account - Transactions</h3>
      </div>
    </div>

    <div class="flex flex-wrap">
      <div class="w-full md:w-1/1 xl:w-1/1 p-6" v-if="pendingTransactions.length" >
        <div class="bg-gradient-to-b from-blue-200 to-blue-100 border-b-4 border-blue-600 shadow-xl p-5">
            <div class="flex-1 text-left lg:text-center">
              <h4 class="font-bold text-3xl">
                Pending Transactions
              </h4>
          </div>
           <div>
              <transaction-table :transactions="pendingTransactions"></transaction-table>
            </div>
        </div>
      </div>
      <div class="w-full md:w-1/1 xl:w-1/1 p-6" >
        <div class="bg-gradient-to-b from-blue-200 to-blue-100 border-b-4 border-blue-600 rounded-lg shadow-xl p-5">
            <div class="flex-1 text-left lg:text-center">
              <h4 class="font-bold text-3xl">
                Transactions
              </h4>
          </div>
           <div>
              <transaction-table :transactions="transactions.slice(0,25)"></transaction-table>
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
import { Component, Prop } from "vue-property-decorator";

import TransactionTable from './TransactionTable.vue';
import { Options } from "vue-class-component";

@Options({
  components: {
    TransactionTable,
  },
})
export default class TransactionsView extends NetFlowVue {
  @Prop(String) accountId!: string;
  
  transactions: Transaction[] = [];
  pendingTransactions: Transaction[] = [];

  mounted() {
    if(NetFlowVue.Vue3GoogleOauth?.isInit) {
      this.loadTransactions();
    } else {
      console.log("Need to figure out how to make it wait for NetFlowVue.Vue3GoogleOauth?.isInit to be initialized");
      new Promise(resolve => setTimeout(resolve, 2000)).then(_=>this.loadTransactions());
    }
  }

  async loadTransactions() {
    const allTxns = await new AccountService().getAccountTransactions(this.getAccessToken(),this.accountId);

    this.transactions = allTxns.filter(txn=>!txn.pending);
    const pendingTxnThatHavePermTxn = this.transactions.filter(txn=>txn.pending_transaction_id).map(txn=>txn.pending_transaction_id );
    this.pendingTransactions = allTxns.filter(txn=>txn.pending && pendingTxnThatHavePermTxn.indexOf(txn.transaction_id)=== -1);
  }
}
</script>