import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import gAuthPlugin from 'vue3-google-oauth2';

let gauthClientId = "490654358518-6b1n91aah35nv8msd5ngdhnk68ntp6ub.apps.googleusercontent.com";
const gauthOption = { clientId: gauthClientId, scope: 'email', prompt: 'consent', fetch_basic_profile: false };


createApp(App).use(gAuthPlugin,gauthOption).use(router).mount('#app') 
