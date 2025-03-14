<script setup lang="ts">
import { shallowRef } from 'vue';
import ObjectViewer from './components/ObjectViewer.vue';
import SideBar from './components/SideBar.vue';

const objectBuffer = shallowRef<Buffer<ArrayBufferLike>>();

function openDialog() {
  windowAPI.openDialog();
}

windowAPI.dialogResponse((_, response) => {
  objectBuffer.value = response;
})

</script>

<template>
  <!-- <button @click="openDialog">123</button> -->

  <SideBar />

  <ObjectViewer :object-buffer="objectBuffer" />
</template>