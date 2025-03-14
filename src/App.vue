<script setup lang="ts">
import { shallowRef } from 'vue';
import ObjectViewer from './components/ObjectViewer.vue';
import SideBar from './components/SideBar.vue';

</script>

<template>
  <!-- <button @click="openDialog">123</button> -->

  <SideBar />

  <ObjectViewer />
</template>