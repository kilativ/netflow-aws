<template>
  <div>

  <div class="bg-gray-800 pt-3">
      <div
        class="rounded-tl-md bg-gradient-to-r from-blue-900 to-gray-800 p-4 shadow text-2xl text-white"
      >
        <h3 class="font-bold pl-2">Accounts</h3>
      </div>
    </div>
    <div class="flex flex-wrap">
            
      <div class="w-full 2xl:w-1/2 p-6"  v-for="bank in list" :key="bank.id">
        <div class="bg-gradient-to-b from-blue-200 to-blue-100 border-b-4 border-blue-600 shadow-xl p-5">
            <div class="flex-1 text-left  lg:text-center">
              <h4 class="font-bold text-3xl">
                {{ bank.nickname }} 
                <i class="fas fa-download cursor-pointer" @click="fetchTransactions(bank.id)"></i>
              </h4>
          </div>
           <div class="lg:p-5">
              <table class="w-full text-gray-700">
                  <thead class="lg:table-header-group hidden">
                      <tr>
                          <th class="text-blue-900 px-1 text-left">Name</th>
                          <th class="text-blue-900 px-1 text-left">Number</th>
                          <th class="text-blue-900 px-1 text-left">Type</th>
                          <th class="text-blue-900 px-1 text-right">Balance</th>
                          <th></th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="account in bank.accounts" :key="account.account_id" class="border-b border-blue-500 mb-3">
                          <td class="lg:px-1">{{account.official_name ?? account.name}}</td>
                          <td class="lg:px-1 lg:table-cell hidden">{{ account.mask }}</td>
                          <td class="lg:px-1 lg:table-cell hidden">{{ account.type }} - {{ account.subtype }}</td>
                          <td class="lg:px-1 text-right">{{ formatter.currencyUSD(account.balances.current) }}</td>
                          <td  class="px-1 text-right whitespace-nowrap">
                            <router-link v-bind:to="`/account/${account.account_id}/transactions/`" class="cursor-pointer underline">
                              <i class="fas fa-dollar-sign pr-1 lg:pr-3"></i>
                            </router-link>
                              <router-link v-bind:to="`/account/${account.account_id}/snapshot`" class="cursor-pointer">
                              <i class="fas fa-chart-area"></i>
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
import Swal from 'sweetalert2'

export default class AccountView extends NetFlowVue {
  private list: NetFlowPlaidBankLink[] = [];
  private user: NetFlowUser = new NetFlowUser();

  mounted() {
    if(NetFlowVue.Vue3GoogleOauth?.isInit) {
      this.loadData();
    } else {
      console.log("Need to figure out how to make it wait for NetFlowVue.Vue3GoogleOauth?.isInit to be initialized");
      new Promise(resolve => setTimeout(resolve, 2000)).then(_=>this.loadData());
    }
  }

  async loadData() {
   this.user = await new AccountService().getUserAccount(
      this.getAccessToken()
    );
    this.list = this.user.banks;
  }

  fetchTransactions(bankId: string) {
    Swal.fire({
      text: 'Are you sure you want to download transactions for this bank?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes!',
      cancelButtonText: 'No'
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        await new AccountService().fetchBankTransaction(this.getAccessToken(), bankId);
      }
    });
  }
  
}
</script>
