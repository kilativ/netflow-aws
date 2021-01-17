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
    IsInit: {{ Vue3GoogleOauth.isInit }}
  </div>
  </div>
</template>
<script lang="ts">
import axios, { AxiosResponse } from "axios";
import { Vue } from "vue-class-component";
import { Component, Prop, Watch } from "vue-property-decorator";
import { AccountService } from "../services/account";
import gAuthPlugin from "vue3-google-oauth2";
import {
  NetFlowPlaidBankLink,
  NetFlowUser,
} from "../../../shared/models/account-dto";
import { inject } from "vue";
import { Transaction } from "plaid";

export default class TransactionsView extends Vue {
  @Prop(String) accountId!: string;
  
  transactions: Transaction[] = [];
  pendingTransactions: Transaction[] = [];
  private $gAuth: any;
  private Vue3GoogleOauth: any = inject("Vue3GoogleOauth");

  async loadTransactions() {
    console.log(this.accountId);
    // need to call this after logged in
    const accessCode = this.$gAuth.instance.currentUser.get().getAuthResponse()
      .access_token;

    const allTxns = await new AccountService().getAccountTransactions(accessCode,this.accountId);

    this.transactions = allTxns.filter(txn=>!txn.pending);
    const pendingTxnThatHavePermTxn = this.transactions.filter(txn=>txn.pending_transaction_id).map(txn=>txn.pending_transaction_id );
    this.pendingTransactions = allTxns.filter(txn=>txn.pending && pendingTxnThatHavePermTxn.indexOf(txn.transaction_id)=== -1);
  }

  @Watch("Vue3GoogleOauth.isInit", { immediate: true }) onMatchChanged() {
    if (this.Vue3GoogleOauth.isInit) {
      this.loadTransactions();
    }
  }
}
</script>