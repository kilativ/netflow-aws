<template>
<div>
  <table class="w-full lg:p-5 text-gray-700 block lg:table">
      <thead class="hidden lg:table-header-group">
          <tr>
              <th class="text-left text-blue-900 px-1 cursor-pointer" @click="sortClicked(transactions, 'date')">Date
                    <i class="fas fa-arrow-up" v-if="sortColumn === 'date' && sortAsc"></i>
                    <i class="fas fa-arrow-down" v-if="sortColumn === 'date' && !sortAsc"></i>
                  </th>
              <th class="text-left text-blue-900 px-1 cursor-pointer" @click="sortClicked(transactions, 'name')">Name
                    <i class="fas fa-arrow-up" v-if="sortColumn === 'name' && sortAsc"></i>
                    <i class="fas fa-arrow-down" v-if="sortColumn === 'name' && !sortAsc"></i>
                  </th>
              <th class="text-right text-blue-900 px-1 cursor-pointer" @click="sortClicked(transactions, 'amount')">Amount
                    <i class="fas fa-arrow-up" v-if="sortColumn === 'amount' && sortAsc"></i>
                    <i class="fas fa-arrow-down" v-if="sortColumn === 'amount' && !sortAsc"></i>
                  </th>
              <th class="text-blue-900 px-1 text-right cursor-pointer" @click="sortClicked(transactions, 'category')">Category
                    <i class="fas fa-arrow-up" v-if="sortColumn === 'category' && sortAsc"></i>
                    <i class="fas fa-arrow-down" v-if="sortColumn === 'category' && !sortAsc"></i>
                  </th>
          </tr>
      </thead>

      <tbody class="block lg:table-row-group">
        <tr v-for="txn in transactions" :key="txn.transaction_id" class="block lg:table-row border-b border-blue-500 mb-3">
          <td class="block lg:table-cell">
            <div class="flex flex-row justify-between">
              <div class="font-bold visible lg:hidden">Date</div>
              <div class="whitespace-nowrap">{{ txn.date }}</div>
            </div>
          </td>
          <td class="block lg:table-cell">
            <div class="flex flex-row justify-between">
              <div class="font-bold visible lg:hidden">Name</div>
              <div class="text-right lg:text-left">{{ txn.name }}</div>
            </div>
          </td>
          <td class="block lg:table-cell">
            <div class="flex flex-row justify-between">
              <div class="font-bold visible lg:hidden">Amount</div>
              <div class="text-right w-full">{{ formatter.currencyUSD(txn.amount) }}</div>
            </div>
          </td>
          <td class="block lg:table-cell">
            <div class="flex flex-row justify-between">
              <div class="font-bold visible lg:hidden">Category</div>
              <div class="text-right w-full">{{ txn.category.join() }}</div>
            </div>
          </td>
        </tr>
      </tbody>
  </table>
</div>
</template>
<script lang="ts">
  import { Transaction } from "plaid";
  import { Prop} from "vue-property-decorator";
  import { SortUtils } from "../utils/sort-utils";
  import { NetflowTransaction } from "../../../shared/models/netflow-transaction";
  import { NetFlowVue } from "../views/NetFlowBaseVue";

  export default class TransactionTable extends NetFlowVue {
    @Prop({type: [Array]}) readonly transactions!: Transaction[];
    sortUtils = new SortUtils();
    private sortColumn = "date";
    private sortAsc = false;

    sortClicked(collection: NetflowTransaction[], columName: string) {
      if (columName === this.sortColumn) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortColumn = columName;
      }
      this.sortUtils.sortTransactions(collection, this.sortColumn, this.sortAsc);
    }
  }
</script>
