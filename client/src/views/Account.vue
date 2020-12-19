<template>
  <div class="account">
    <h1>This is my account page</h1>

    <h2>Accounts</h2>
    <div v-for="item in list" :key="item.id">
        <a v-bind:href="'/account/'+ item.id">{{item.nickname}}</a>
    </div>
  </div>
</template>
<script lang="ts">
import axios, { AxiosResponse } from "axios";
import { Vue } from "vue-class-component";
import { Component } from "vue-property-decorator";
import { AccountService } from "../services/account";
import gAuthPlugin from "vue3-google-oauth2";
import {NetFlowPlaidBankAccount, NetFlowUser} from "../../../shared/models/account-dto"

export default class AccountView extends Vue {
  private list : NetFlowPlaidBankAccount[] = [];

  private $gAuth: any;

  async mounted() {
    console.log("mounted");
    const user = await new AccountService().getUserAccount(
      this.$gAuth.instance.currentUser.get().getAuthResponse().access_token
    );
    console.log(user);
    this.list = user.accounts;
  }
}
</script>