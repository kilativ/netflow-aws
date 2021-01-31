<template>
<div>
  <table class="w-full lg:p-5 text-gray-700 block lg:table">
      <thead class="hidden lg:table-header-group">
          <tr>
              <th class="text-left text-blue-900 px-1">Date</th>
              <th class="text-left text-blue-900 px-1">Name</th>
              <th class="text-right text-blue-900 px-1">Amount</th>
              <th class="text-blue-900 px-1 text-right">Category</th>
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
</div></template>
<script lang="ts">
import { Transaction } from "plaid";
import { NetFlowVue } from "./NetFlowBaseVue";

import { Prop } from "vue-property-decorator";

export default class TransactionTable extends NetFlowVue {
  @Prop({type: [Array]}) readonly transactions!: Transaction[];
}
</script>
