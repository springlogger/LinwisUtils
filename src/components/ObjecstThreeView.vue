<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useThreeStore } from '../stores/three'
import { Object3D } from 'three';
import { ref } from 'vue';

defineProps<{
    object: Object3D
    level: number
}>()

const three = useThreeStore()
const { selectedObject } = storeToRefs(three)

const expanded = ref(false);

</script>

<template>
    <tr 
        @click="selectedObject = object" 
        @mouseenter="three.onGUIThreeObjectHoverIn(object)"
        @mouseleave="three.onGUIThreeObjectHoverOut"
        class="cursor-pointer"
        :class="{
            'bg-blue-900 hover:bg-blue-800': selectedObject && selectedObject.uuid === object.uuid,
            'hover:bg-[#1f1f1f]': selectedObject && selectedObject.uuid !== object.uuid,
        }"
    >
      <td :style="{ paddingLeft: `${level * 16 + 16}px` }" class="py-1">
        <span
          v-if="object.children.length > 0"
          @click.stop="expanded = !expanded"
          class="mr-2"
        >
          {{ expanded ? '▾' : '▸' }}
        </span>
        {{ object.name || '(Без имени)' }}
      </td>
    </tr>
    <template v-if="expanded">
      <ObjecstThreeView
        v-for="child in object.children"
        :key="child.uuid"
        :object="child"
        :level="level + 1"
      />
    </template>
  </template>


