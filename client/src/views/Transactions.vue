<template>
  <div class="transactions">
    <h1>Transactions for an account</h1>
    <h1>IsInit: {{ Vue3GoogleOauth.isInit }}</h1>
    <table>
      <tr v-for="txn in transactions" :key="txn.transaction_id">
        <td>{{ txn.date }}</td>
        <td>{{ txn.name }}</td>
        <td>{{ txn.iso_currency_code }}</td>
        <td>{{ txn.amount }}</td>
        <td>{{ txn.category.join() }}</td>
        <td>{{ txn.name }}</td>
        <td>{{ txn.name }}</td>
      </tr>
    </table>
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
  private $gAuth: any;
  private Vue3GoogleOauth: any = inject("Vue3GoogleOauth");

  async loadTransactions() {
    console.log(this.accountId);
    // need to call this after logged in
    const accessCode = this.$gAuth.instance.currentUser.get().getAuthResponse()
      .access_token;

    this.transactions = await new AccountService().getAccountTransactions(
      accessCode,this.accountId
    );
  }

  @Watch("Vue3GoogleOauth.isInit", { immediate: true }) onMatchChanged() {
    if (this.Vue3GoogleOauth.isInit) {
      this.loadTransactions();
    }
  }
}
</script>