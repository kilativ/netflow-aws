<template>
  <div>
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

@Options({
  components: {
    PlaidLink,
  },
})
export default class App extends Vue {

  publicToken = '';
  accessToken = '';
  itemId = '';

  async onSuccess(token: string) {
    this.publicToken = token;
    const tokenResponse = await axios.post('/api/set_access_token',
    {
      public_token: this.publicToken
    });
    this.accessToken = tokenResponse.data.access_token;
    this.itemId = tokenResponse.data.item_id;
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>