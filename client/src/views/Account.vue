<template>
  <div class="account">
    <h1>This is my account page</h1>
  </div>
</template>
<script lang="ts">
import axios, { AxiosResponse } from "axios";
import { Vue } from "vue-class-component";
import { Component } from "vue-property-decorator";
import { AccountService } from "../services/account";

export default class Account extends Vue {
private list: Array<object> = [
    {
      name: 'Preetish',
      age: '26'
    },
    {
      name: 'John',
      age: '30'
    }
  ]
mounted() {
   console.log('mounted');
   const response = new AccountService().getAccount();
  }
}
</script>