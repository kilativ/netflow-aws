<template>
  <div class="login">
    <h1>{{ msg }}</h1>
    <h3>{{ linkToken }}</h3>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios, { AxiosResponse } from 'axios';

export default defineComponent({
  name: 'Login',
  props: {
    msg: String,
  },
  data() {
    return {
      linkToken: ''
    }
  },
  async mounted() {
    const response = await axios.post('http://localhost:3000/api/create_link_token', {})
    this.linkToken = response.data;
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.login {
  h1 {
    background-color: grey;
  }
}
</style>
