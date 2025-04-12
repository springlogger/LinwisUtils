<script setup lang="ts">
import ObjectViewerGUI from './ObjectViewerGUI.vue'
import { useThreeStore } from '../stores/three'
import { storeToRefs } from 'pinia'

// пока нет модели нужно выводжить подсказку о том чтобы перетащить модель мышкой или выбрать через меню

const { threeContainer } = storeToRefs(useThreeStore())
</script>

<template>
    <canvas ref="threeContainer" />
    <ObjectViewerGUI />
</template>
