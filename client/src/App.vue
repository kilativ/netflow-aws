<template>

<div>
    <nav class="bg-gray-800 pt-2 md:pt-1 pb-1 px-1 mt-0 h-auto fixed w-full z-20 top-0">
        <div class="flex flex-wrap items-center">
            <div class="flex flex-shrink md:w-2/3 justify-center md:justify-start text-white">
                <a href="#">
                    <span class="text-xl pl-2"><i class="em em-money_with_wings m-2"></i><span class="px-2">NetFlow</span></span>
                </a>
            </div>
            <div class="flex w-full pt-2 content-center justify-between md:w-1/3 md:justify-end">
              <div class="md:text-gray-400 px-3">Hello User</div>
            </div>
        </div>
    </nav>

    <div class="flex flex-col md:flex-row">
        <div class="bg-gray-800 shadow-xl h-16 fixed bottom-0 mt-12 md:relative md:h-screen z-10 w-full md:w-48">
            <div class="md:mt-12 md:w-48 md:fixed md:left-0 md:top-0 content-center md:content-start text-left justify-between">
                <ul class="list-reset flex flex-row md:flex-col py-0 md:py-3 px-1 md:px-2 text-center md:text-left">
                    <li class="mr-3 flex-1" v-for="item in menuItems" :key="item.name">
                        <router-link v-bind:to="item.link">
                            <a href="#" class="block py-1 md:py-3 pl-0 md:pl-1 align-middle text-white no-underline hover:text-white border-b-2" v-bind:class="getItemClass(item)">
                                <i class="fa pr-0 md:pr-3"  v-bind:class="getIconClass(item)"></i><span class="pb-1 md:pb-0 text-xs md:text-base text-gray-600 md:text-gray-400 block md:inline-block">
                                {{item.name}}
                                </span>
                            </a>
                        </router-link>
                    </li>
                </ul>
            </div>
        </div>

        <div class="main-content flex-1 bg-gray-100 mt-12 md:mt-2 pb-24 md:pb-5">
  <router-view/>
        </div>
    </div>


  </div>
</template>
<script lang="ts">

import { Vue } from "vue-class-component";
import { NetFlowVue } from "./views/NetFlowBaseVue";
import { Component, Watch } from "vue-property-decorator";

export default class App extends Vue {
    $route: any;

    menuItems = [
        {name:"Home", link:"/", class:"border-gray-800 hover:border-pink-500", icon:"fa-tasks", color:"pink-500"},
        {name:"Accounts", link:"/account", class:"border-gray-800 hover:border-blue-600", icon:"fa-chart-area", color:"blue-600"},
        {name:"Plaid", link:"/plaid", class:" border-gray-800 hover:border-purple-500", icon:"fa-envelope", color:"purple-500"},
        {name:"Google Login", link:"/login", class:"border-gray-800 hover:border-red-500", icon:"fa-wallet", color:"red-500"},
    ]

    getItemClass(item: MenuItem) {
        return (item.link === this.$route.path)? `border-${item.color}`: `border-gray-800 hover:border-${item.color}`;
    }

    getIconClass(item: MenuItem) {
        return (item.link === this.$route.path)? `${item.icon} text-${item.color}`: item.icon;
    }
}

export class MenuItem {
    name: string;
    link: string;
    class: string;
    color: string;
    icon: string;
}
</script>

<style scoped lang="scss">
</style>
