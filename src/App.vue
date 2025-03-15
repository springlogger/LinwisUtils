<script setup lang="ts">
import { ref } from 'vue';
import ObjectViewer from './components/ObjectViewer.vue';
import SideBar from './components/SideBar.vue';
import ToDoList from './components/ToDoList.vue'

const selectedPage = ref<string>('Editor');

</script>

<template>
  <div class="flex flex-row">

    <SideBar v-model:selectedPage="selectedPage" />

    <div v-show="selectedPage === 'Editor'">
      <ObjectViewer />
    </div>
    
    <div v-show="selectedPage !== 'Editor'" class="w-full">
      <ToDoList />
    </div>

  </div>
</template>