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
             <account-table :accounts="bank.accounts"></account-table>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>
<script lang="ts">
import { InjectReactive, Watch } from "vue-property-decorator";
import { AccountService } from "../services/account";
import { NetFlowPlaidBankLink, NetFlowUser} from "../../../shared/models/account-dto";
import { NetFlowVue } from "./NetFlowBaseVue";
import Swal from 'sweetalert2'
import {Account} from 'plaid'
import AccountTable from '../components/AccountTable.vue'
import { Options } from "vue-class-component";

@Options({
  components: {
    AccountTable,
  },
})
export default class AccountView extends NetFlowVue {
  private list: NetFlowPlaidBankLink[] = [];
  private user: NetFlowUser = new NetFlowUser();

  @InjectReactive() isInit!: boolean;
  @Watch("isInit", { immediate: true }) onIsInitChanged() {
    if (this.isInit) {
      this.loadData();
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
