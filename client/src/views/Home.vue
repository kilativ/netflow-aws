<template>
  <div>
    <div class="bg-gray-800 pt-3">
      <div class="rounded-tl-md bg-gradient-to-r from-pink-500 to-gray-800 p-4 shadow text-2xl text-white">
        <h3 class="font-bold pl-2">Home sample</h3>
      </div>
    </div>

    <div class="flex flex-wrap">
      <div class="w-full md:w-1/2 xl:w-1/3 p-6">
        <div class="bg-gradient-to-b from-green-200 to-green-100 border-b-4 border-green-600 shadow-xl p-5">
          <div class="flex flex-row items-center">
            <div class="flex-shrink pr-4">
              <div class="rounded-full p-5 bg-green-600">
                <i class="fa fa-wallet fa-2x fa-inverse"></i>
              </div>
            </div>
            <div class="flex-1 text-right md:text-center">
              <h5 class="font-bold uppercase text-gray-600">Total Revenue</h5>
              <h3 class="font-bold text-3xl">
                $3249
                <span class="text-green-500"><i class="fas fa-caret-up"></i></span>
              </h3>
            </div>
          </div>
        </div>
      </div>



      <div class="w-full md:w-1/2 xl:w-1/3 p-6">
        <div class="bg-gradient-to-b from-pink-200 to-pink-100 border-b-4 border-pink-500 rounded-lg shadow-xl p-5">
          <div class="flex flex-row items-center">
            <div class="flex-shrink pr-4">
              <div class="rounded-full p-5 bg-pink-600">
                <i class="fas fa-users fa-2x fa-inverse"></i>
              </div>
            </div>
            <div class="flex-1 text-right md:text-center">
              <h5 class="font-bold uppercase text-gray-600">Total Users</h5>
              <h3 class="font-bold text-3xl">
                249
                <span class="text-pink-500" >
                  <i class="fas fa-exchange-alt"></i>
                </span>
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import PlaidLink from "@/views/PlaidLink.vue";

export default {
  name: "Home",
  components: {
    PlaidLink,
  },
};
</script>
 