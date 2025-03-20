<script setup lang="ts">
import { ref } from 'vue';
import ObjectViewer from './components/ObjectViewer.vue';
import SideBar from './components/SideBar.vue';
import ToDoList from './components/ToDoList.vue'
import UserProfile from './components/UserProfile.vue';
import Authorization from './components/Authorization.vue';
import Notes from './components/Notes.vue';

const selectedPage = ref<string>('Editor');

</script>

<template>
  <div class="flex flex-row">

    <SideBar v-model:selectedPage="selectedPage" />

    <div v-show="selectedPage === 'Editor'">
      <ObjectViewer />
    </div>
    
    <div v-show="selectedPage === 'ToDoList'" class="w-full">
      <ToDoList />
    </div>

    <div v-show="selectedPage === 'Notes'" class="w-full">
      <Notes />
    </div>

    <div v-show="selectedPage === 'Authorization'" class="w-full">
      <Authorization @redirect="selectedPage = 'UserProfile'" />
    </div>

    <div v-show="selectedPage === 'UserProfile'" class="w-full">
      <UserProfile />
    </div>

  </div>
</template>