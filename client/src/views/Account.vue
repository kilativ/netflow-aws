<template>
  <div>

  <div class="bg-gray-800 pt-3">
      <div
        class="rounded-tl-3xl bg-gradient-to-r from-blue-900 to-gray-800 p-4 shadow text-2xl text-white"
      >
        <h3 class="font-bold pl-2">Accounts</h3>
      </div>
    </div>
    <div class="flex flex-wrap">
            
      <div class="w-full md:w-1/1 xl:w-1/2 p-6"  v-for="bank in list" :key="bank.id">
        <div class="bg-gradient-to-b from-blue-200 to-blue-100 border-b-4 border-blue-600 rounded-lg shadow-xl p-5">
            <div class="flex-1 text-right md:text-center">
              <h4 class="font-bold text-3xl">
                {{ bank.nickname }}
              </h4>
          </div>
           <div class="p-5">
                      <table class="w-full p-5 text-gray-700">
                          <thead>
                              <tr>
                                  <th class="text-left text-blue-900 px-1">Name</th>
                                  <th class="text-left text-blue-900 px-1">Number</th>
                                  <th class="text-left text-blue-900 px-1">Type</th>
                                  <th class="text-blue-900 px-1 text-right">Balance</th>
                                  <th class="text-blue-900 px-1 text-center">Snapshot</th>
                              </tr>
                          </thead>

                          <tbody>
                              <tr v-for="account in bank.accounts" :key="account.account_id">
                                  <td class="px-1">
                                    <router-link v-bind:to="`/account/${account.account_id}/transactions/`">
                                      <a class="underline" href="#">{{account.official_name ?? account.name}}</a>
                                    </router-link>
                                  </td>
                                  <td class="px-1">{{ account.mask }}</td>
                                  <td class="px-1">{{ account.type }} - {{ account.subtype }}</td>
                                  <td class="text-right px-1">{{ formatter.currencyUSD(account.balances.current) }}</td>
                                  <td class="text-center px-1">
                                     <router-link v-bind:to="`/account/${account.account_id}/snapshot`">
                                      <a class="underline" href="#">view</a>
                                     </router-link>
                                  </td>
                              </tr>
                          </tbody>
                      </table>
              </div>
        </div>
      </div>


    </div>
  </div>
</template>
<script lang="ts">
import { AccountService } from "../services/account";
import { NetFlowPlaidBankLink, NetFlowUser} from "../../../shared/models/account-dto";
import { NetFlowVue } from "./NetFlowBaseVue";

export default class AccountView extends NetFlowVue {
  private list: NetFlowPlaidBankLink[] = [];
  private user: NetFlowUser = new NetFlowUser();

  mounted() {
    if(NetFlowVue.Vue3GoogleOauth?.isInit) {
      this.loadData();
    } else {
      console.log("Need to figure out how to make it wait for NetFlowVue.Vue3GoogleOauth?.isInit to be initialized");
    }
  }

  async loadData() {
   this.user = await new AccountService().getUserAccount(
      this.getAccessToken()
    );
    this.list = this.user.banks;
  }
}
</script>