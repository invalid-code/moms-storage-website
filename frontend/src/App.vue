<script setup lang="ts">
import box from './assets/box.png'
import home from './assets/home.png'
import send from './assets/send.png'
import store from './assets/store.png'
import bell from './assets/bell.png'
import deliveryTruck from './assets/delivery-truck.png'
import { useRoute } from 'vue-router'

const route = useRoute();
</script>

<template>
  <nav class="bg-[#363537] w-full h-23 flex items-center p-4.25">
    <h1 class="text-white text-[30px] ml-9">JRJ PHARMACY</h1>
    <img class="h-10 ml-auto mr-3.25" :src="deliveryTruck" alt="navbar new delivery">
    <img class="h-10" :src="bell" alt="navbar notifications">
  </nav>

  <div class="flex">
    <aside class="flex flex-col bg-[#363537] h-full top-23 w-[100.8px] fixed">
      <router-link to="/" class="h-25 flex items-center justify-center" :class="{'bg-[#80808080]': route.name === 'home'}">
        <img class="w-15 h-15" :src="home" alt="sidebar home">
      </router-link>
      <router-link to="/branches" class="h-25 flex items-center justify-center" :class="{'bg-[#80808080]': route.name === 'branches'}">
        <img class="w-15 h-15" :src="store" alt="sidebar branches">
      </router-link>
      <router-link to="/stocks" class="h-25 flex items-center justify-center" :class="{'bg-[#80808080]': route.name === 'stocks'}">
        <img class="w-15 h-15" :src="box" alt="sidebar stocks">
      </router-link>
      <router-link to="/deliveries" class="h-25 flex items-center justify-center" :class="{'bg-[#80808080]': route.name === 'deliveries'}">
        <img class="w-15 h-15" :src="send" alt="sidebar deliveries">
      </router-link>
    </aside>

    <main class="bg-[#F5F5F5] flex-1 pl-[100.8px] min-h-[calc(100dvh-92px)]">
      <router-view />
    </main>
  </div>
</template>

<style scoped></style>
