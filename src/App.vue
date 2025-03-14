<script setup lang="ts">
import { ref } from 'vue';
import ObjectViewer from './components/ObjectViewer.vue';
import SideBar from './components/SideBar.vue';

const selectedPage = ref<string>('Editor');

</script>

<template>
  <!-- <button @click="openDialog">123</button> -->

  <div class="flex flex-row">

    <SideBar v-model:selectedPage="selectedPage" />

    <ObjectViewer v-show="selectedPage === 'Editor'"/>
    <div v-show="selectedPage !== 'Editor'">
      Test
    </div>

  </div>
</template>