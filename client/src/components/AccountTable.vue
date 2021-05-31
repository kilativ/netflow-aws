<template>
<div>
    <table class="w-full text-gray-700">
        <thead class="lg:table-header-group hidden">
            <tr>
                <th class="text-blue-900 px-1 text-left cursor-pointer" @click="sortClicked(accounts,'name')">Name
                  <i class="fas fa-arrow-up" v-if="(sortColumn==='name' && sortAsc)"></i>
                  <i class="fas fa-arrow-down" v-if="sortColumn==='name' && !sortAsc"></i>
                </th>
                <th class="text-blue-900 px-1 text-left cursor-pointer flex-nowrap" @click="sortClicked(accounts,'number')">Number
                  <i class="fas fa-arrow-up" v-if="(sortColumn==='number' && sortAsc)"></i>
                  <i class="fas fa-arrow-down" v-if="sortColumn==='number' && !sortAsc"></i>
                </th>
                <th class="text-blue-900 px-1 text-left cursor-pointer" @click="sortClicked(accounts,'type')">Type
                  <i class="fas fa-arrow-up" v-if="(sortColumn==='type' && sortAsc)"></i>
                  <i class="fas fa-arrow-down" v-if="sortColumn==='type' && !sortAsc"></i>
                </th>
                <th class="text-blue-900 px-1 text-right cursor-pointer" @click="sortClicked(accounts,'balance')">Balance
                  <i class="fas fa-arrow-up" v-if="(sortColumn==='balance' && sortAsc)"></i>
                  <i class="fas fa-arrow-down" v-if="sortColumn==='balance' && !sortAsc"></i>
                </th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="account in accounts" :key="account.account_id" class="border-b border-blue-500 mb-3">
                <td class="lg:px-1 cursor-pointer" @click="rowClicked(account.account_id)">{{account.official_name ?? account.name}}</td>
                <td class="lg:px-1 lg:table-cell hidden cursor-pointer" @click="rowClicked(account.account_id)">{{ account.mask }}</td>
                <td class="lg:px-1 lg:table-cell hidden cursor-pointer" @click="rowClicked(account.account_id)">{{ account.type }} - {{ account.subtype }}</td>
                <td class="lg:px-1 text-right cursor-pointer" @click="rowClicked(account.account_id)">{{ formatter.currencyUSD(account.balances.current) }}</td>
                <td  class="px-1 text-right whitespace-nowrap">
                  <router-link v-bind:to="`/account/${account.account_id}/snapshot`" class="cursor-pointer">
                    <i class="fas fa-chart-area"></i>
                  </router-link>
                </td>
            </tr>
        </tbody>
    </table>
  </div>
</template>
<script lang="ts">
  import { Account } from "plaid";
  import { Prop, Watch} from "vue-property-decorator";
  import { SortUtils } from "../utils/sort-utils";
  import { NetFlowVue } from "../views/NetFlowBaseVue";

  export default class AccountTable extends NetFlowVue {
    @Prop({type: [Array]}) 
    readonly accounts!: Account[];

    sortUtils = new SortUtils();
    private customSort = false;
    private sortColumn = "none";
    private sortAsc = true;
    $router: any;

    @Watch("accounts", { immediate: true }) onIsInitChanged() {
      if (this.customSort) {
        this.sortUtils.sortAccounts(this.accounts, this.sortColumn, this.sortAsc);
      }
    }

    sortClicked(collection: Account[], columName: string) {
      if (!this.customSort)  {
        this.customSort = true;
        this.sortColumn = "type";
      }
      if (columName === this.sortColumn) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortColumn = columName;
      }
      this.sortUtils.sortAccounts(collection, this.sortColumn, this.sortAsc);
    }

    rowClicked(account_id: string) {
      this.$router.push(`/account/${account_id}/transactions/`)
    }
  }
</script>
