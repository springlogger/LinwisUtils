<script setup lang="ts">
import { ref } from 'vue';
import ObjectViewer from './components/ObjectViewer.vue';

const objectBlob = ref<Buffer<ArrayBufferLike>>();

function openDialog() {
  windowAPI.openDialog();
}

windowAPI.dialogResponse((_, response) => {
  objectBlob.value = response;
})

</script>

<template>
  <button @click="openDialog">123</button>

  <ObjectViewer :object-blob="objectBlob" />
</template>