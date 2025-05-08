<script setup lang="ts">
import ObjectViewerGUI from './ObjectViewerGUI.vue'
import { useThreeStore } from '../stores/three'
import { storeToRefs } from 'pinia'
import ObjectViewerHeader from './ObjectViewerHeader.vue'

// пока нет модели нужно выводжить подсказку о том чтобы перетащить модель мышкой или выбрать через меню

const { threeContainer } = storeToRefs(useThreeStore())
</script>

<template>
    <div class="flex flex-col w-full">
        <ObjectViewerHeader />
        <canvas ref="threeContainer" />
        <ObjectViewerGUI />
    </div>
</template>
