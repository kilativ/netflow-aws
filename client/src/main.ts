import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import gAuthPlugin from 'vue3-google-oauth2';

let gauthClientId = "490654358518-6b1n91aah35nv8msd5ngdhnk68ntp6ub.apps.googleusercontent.com";
const gauthOption = { clientId: gauthClientId, scope: 'email', prompt: 'consent', fetch_basic_profile: false };


const app = createApp(App);

app.config.globalProperties.$filters = {
    currencyUSD(value: number) {
    const formatter = Intl.NumberFormat('en-US',{ style: 'currency', currency: 'USD'})
      return formatter.format(value);
    }
  }
app.use(gAuthPlugin,gauthOption).use(router).mount('#app') 
app.provide('formaters',app.config.globalProperties.$filters); // is there a way to avoid it?