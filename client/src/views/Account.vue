<template>
  <div class="account">
    <h1>This is my account page</h1>
  <h1>IsInit: {{ Vue3GoogleOauth.isInit }}</h1>

    <h2>Accounts</h2>
    <div v-for="bank in list" :key="bank.id">
        <h4>{{bank.nickname}}</h4>
        <div v-for="account in bank.accounts" :key="account.account_id">
            <a v-bind:href="'/transactions/'+ account.account_id">{{account.official_name?? account.name}}</a> 
             - {{account.mask}} ({{account.type}} - {{account.subtype}})
             {{$filters.currencyUSD(account.balances.current)}}
        </div>
    </div>
  </div>
</template>
<script lang="ts">
import axios, { AxiosResponse } from "axios";
import { Vue } from "vue-class-component";
import { Component, Watch } from "vue-property-decorator";
import { AccountService } from "../services/account";
import gAuthPlugin from "vue3-google-oauth2";
import {NetFlowPlaidBankLink, NetFlowUser} from "../../../shared/models/account-dto"
import { inject } from "vue";

export default class AccountView extends Vue {
  private list : NetFlowPlaidBankLink[] = [];
  private Vue3GoogleOauth: any = inject("Vue3GoogleOauth");

  private $gAuth: any;

  async loadData() {
    console.log("mounted");
    console.log( this.$gAuth);
    const user = await new AccountService().getUserAccount(
      this.$gAuth.instance.currentUser.get().getAuthResponse().access_token
    );
    console.log(user);
    this.list = user.banks;
  }

    @Watch("Vue3GoogleOauth.isInit", { immediate: true }) onMatchChanged() {
    if (this.Vue3GoogleOauth.isInit) {
      this.loadData();
    }
  }
}
</script>