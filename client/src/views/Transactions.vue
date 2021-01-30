<template>
  <div class="transactions">
    
    <div class="bg-gray-800 pt-3">
      <div class="rounded-tl-3xl bg-gradient-to-r from-blue-900 to-gray-800 p-4 shadow text-2xl text-white">
        <h3 class="font-bold pl-2">Account - Transactions</h3>
      </div>
    </div>


    <div class="flex flex-wrap">
      <div class="w-full md:w-1/1 xl:w-1/1 p-6" v-if="pendingTransactions.length" >
        <div class="bg-gradient-to-b from-blue-200 to-blue-100 border-b-4 border-blue-600 rounded-lg shadow-xl p-5">
            <div class="flex-1 text-right md:text-center">
              <h4 class="font-bold text-3xl">
                Pending Transactions
              </h4>
          </div>
           <div class="p-5">
              <table class="w-full p-5 text-gray-700">
                  <thead>
                      <tr>
                          <th class="text-left text-blue-900 px-1">Date</th>
                          <th class="text-left text-blue-900 px-1">Name</th>
                          <th class="text-left text-blue-900 px-1">Amount</th>
                          <th class="text-blue-900 px-1 text-left">Category</th>
                      </tr>
                  </thead>

                  <tbody>
                    <tr v-for="txn in pendingTransactions" :key="txn.transaction_id">
                      <td>{{ txn.date }}</td>
                      <td style="max-width: 500px;">{{ txn.name }}</td>
                      <td>{{ txn.amount }}</td>
                      <td>{{ txn.category.join() }}</td>
                    </tr>
                  </tbody>
              </table>
            </div>
        </div>
      </div>
      <div class="w-full md:w-1/1 xl:w-1/1 p-6" >
        <div class="bg-gradient-to-b from-blue-200 to-blue-100 border-b-4 border-blue-600 rounded-lg shadow-xl p-5">
            <div class="flex-1 text-right md:text-center">
              <h4 class="font-bold text-3xl">
                Transactions
              </h4>
          </div>
           <div class="p-5">
              <table class="w-full p-5 text-gray-700">
                  <thead>
                      <tr>
                          <th class="text-left text-blue-900 px-1">Date</th>
                          <th class="text-left text-blue-900 px-1">Name</th>
                          <th class="text-left text-blue-900 px-1">Amount</th>
                          <th class="text-blue-900 px-1 text-left">Category</th>
                      </tr>
                  </thead>

                  <tbody>
                    <tr v-for="txn in transactions.slice(0,25)" :key="txn.transaction_id">
                      <td>{{ txn.date }}</td>
                      <td style="max-width: 500px;">{{ txn.name }}</td>
                      <td>{{ txn.amount }}</td>
                      <td>{{ txn.category.join() }}</td>
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
import { Prop } from "vue-property-decorator";

export default class TransactionsView extends NetFlowVue {
  @Prop(String) accountId!: string;
  
  transactions: Transaction[] = [];
  pendingTransactions: Transaction[] = [];

  mounted() {
    if(NetFlowVue.Vue3GoogleOauth?.isInit) {
      this.loadTransactions();
    } else {
      console.log("Need to figure out how to make it wait for NetFlowVue.Vue3GoogleOauth?.isInit to be initialized");
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