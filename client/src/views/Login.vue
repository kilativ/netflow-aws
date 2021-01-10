<template>
<div>
  <h1>IsInit: {{ Vue3GoogleOauth.isInit }}</h1>
  <h1>IsAuthorized: {{ Vue3GoogleOauth.isAuthorized }}</h1>
  <h2 v-if="user">signed user: {{user}}</h2>
  <button @click="test">Test</button>
  <button @click="handleClickSignIn" :disabled="!Vue3GoogleOauth.isInit || Vue3GoogleOauth.isAuthorized">sign in</button>
  <button @click="handleClickGetAuthCode" :disabled="!Vue3GoogleOauth.isInit">get authCode</button>
  <button @click="handleClickSignOut" :disabled="!Vue3GoogleOauth.isAuthorized">sign out</button> 
</div>
</template>

<script>
import { inject, toRefs } from "vue";
import { AccountService } from "../services/account";

export default {
  name: "Login",
  props: {
    msg: String,
  },

  data(){
    return {
      user: '',
    }
  },

  methods: {
    test() {
      const user = this.$gAuth.instance.currentUser.get();
      console.log(user);
    },


    async handleClickSignIn(){
      try {
        const googleUser = await this.$gAuth.signIn();
        if (!googleUser) {
          return null;
        }
        console.log("googleUser", googleUser);
        this.user = googleUser.getBasicProfile().getEmail();
        console.log("getId", this.user);
        console.log("getBasicProfile", googleUser.getBasicProfile());
        console.log("getAuthResponse", googleUser.getAuthResponse());
        console.log(
          "getAuthResponse",
          this.$gAuth.instance.currentUser.get().getAuthResponse()
        );

        let service = new AccountService();
        let access_token = this.$gAuth.instance.currentUser.get().getAuthResponse().access_token;
        let netflow_user = await service.getUserAccount(access_token);
        if (!netflow_user) {
          console.log('user not found adding new account')
          netflow_user = await new AccountService().addUserAccount(access_token);
          console.log(`added account for ${netflow_user.userId}`)
        } else {
          console.log(`signed in as ${netflow_user.userId}`)
        }

      } catch (error) {
        //on fail do something
        console.error(error);
        return null;
      }
    },

    async handleClickGetAuthCode(){
      try {
        const authCode = await this.$gAuth.getAuthCode();
        console.log("authCode", authCode);
      } catch(error) {
        //on fail do something
        console.error(error);
        return null;
      }
    },

    async handleClickSignOut() {
      try {
        await this.$gAuth.signOut();
        console.log("isAuthorized", this.Vue3GoogleOauth.isAuthorized);
        this.user = "";
      } catch (error) {
        console.error(error);
      }
    }
  },
  setup(props) {
    // const { isSignIn } = toRefs(props);
    const Vue3GoogleOauth = inject("Vue3GoogleOauth");

    // const handleClickLogin = () => {};
    return {
       Vue3GoogleOauth,
      //  handleClickLogin,
    //   isSignIn,
     };
  },
};
</script>

