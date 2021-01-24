<template>
  <div class="m-5">
    <plaid-link
      env="sandbox"
      clientName="Netflow"
      product="transactions"
      @success="onSuccess"
    >
    </plaid-link>
    public token: {{ publicToken }}
    <br/>
    access token: {{ accessToken }}
    <br/>
    item id: {{ itemId }}
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import axios, { AxiosResponse } from "axios";
import PlaidLink from '../views/PlaidLink.vue';
import { inject } from 'vue';
import { AccountService } from '../services/account';

@Options({
  components: {
    PlaidLink,
  },
})
export default class Plaid extends Vue {
  private $gAuth: any;
  private Vue3GoogleOauth: any = inject("Vue3GoogleOauth");

  publicToken = '';
  accessToken = '';
  itemId = '';

  async onSuccess(token: string) {
    this.publicToken = token;
    const accessCode = this.$gAuth.instance.currentUser.get().getAuthResponse().access_token;
   
   const tokenResponse= await new AccountService().addBankAccountToUser(accessCode,token);
    this.accessToken = tokenResponse;
    this.itemId = tokenResponse;
  }
}
</script>
