<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useThreeStore } from '../stores/three'
import ObjecstThreeView from './ObjecstThreeView.vue'
import { Mesh, MeshPhysicalMaterial, RepeatWrapping, Texture, TextureLoader } from 'three'
import { openDialogFileType, openDialogTextureType } from 'src/types'

const three = useThreeStore()
const { selectedObject, objects } = storeToRefs(three)

const textureLoader = new TextureLoader()
const textureTypes: openDialogTextureType[] = ['albedo', 'normal', 'metalness', 'roughness', 'sheen']

function openDialog(fileType: openDialogFileType, textureType?: openDialogTextureType) {
    windowAPI.openDialog(fileType, textureType)
}

function getTexturePreview(texture: Texture): string {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  
  const ctx = canvas.getContext('2d')
  
  // Если текстура уже загружена в WebGL
  if (texture.image) {
    // Рисуем изображение на canvas
    ctx.drawImage(texture.image, 0, 0, 64, 64)
    return canvas.toDataURL()
  }
  
  // Альтернативный вариант для случаев, когда image еще не загружен
  return createFallbackPreview(texture)
}

function createFallbackPreview(texture: Texture): string {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  
  const ctx = canvas.getContext('2d')!
  
  // Просто заливаем цветом в зависимости от типа текстуры
  if ('normalMap' in texture && texture === texture.normalMap) {
    // Голубоватый цвет для нормал-мапов
    ctx.fillStyle = '#8888ff'
  } else if ('roughnessMap' in texture && texture === texture.roughnessMap) {
    // Серый цвет для roughness
    ctx.fillStyle = '#888888'
  } else {
    // Белый цвет для других текстур
    ctx.fillStyle = '#ffffff'
  }
  
  ctx.fillRect(0, 0, 64, 64)
  return canvas.toDataURL()
}

// Преобразует тип текстуры в свойство материала
function getTextureMapProperty(textureType: openDialogTextureType): string {
  const map: Record<openDialogTextureType, string> = {
    albedo: 'map',
    normal: 'normalMap',
    metalness: 'metalnessMap',
    roughness: 'roughnessMap',
    sheen: 'sheen' // для MeshPhysicalMaterial
  }
  return map[textureType]
}

function resetTexture(textureType: openDialogTextureType) {
  if (!selectedObject.value || !(selectedObject.value instanceof Mesh)) return
  
  const material = selectedObject.value.material
  const property = getTextureMapProperty(textureType)
  
  if (material[property]) {
    material[property].dispose()
    material[property] = null
    material.needsUpdate = true
  }
}

windowAPI.dialogResponseMaterial((_, buffer, textureType) => {
    if (!selectedObject.value || !(selectedObject.value instanceof Mesh)) return
    
    const material = selectedObject.value.material as MeshPhysicalMaterial
    if (!material) return

    const blob = new Blob([buffer])
    const url = URL.createObjectURL(blob)
    
    textureLoader.load(url, (texture) => {
        texture.flipY = false // Для большинства PBR материалов

        if (selectedObject.value.name.includes('Cube')) {
            texture.wrapS = RepeatWrapping
            texture.wrapT = RepeatWrapping
            texture.repeat.set(2, 2) // Примерное значение, подберите под вашу модель
            texture.anisotropy = 16 // Максимальное качество
        }
        
        switch(textureType) {
            case 'albedo':
                if (material.map) material.map.dispose()
                material.map = texture
                material.needsUpdate = true
                break
            case 'normal':
                if (material.normalMap) material.normalMap.dispose()
                material.normalMap = texture
                material.normalScale.set(1, 1)
                material.needsUpdate = true
                break
            case 'metalness':
                if (material.metalnessMap) material.metalnessMap.dispose()
                material.metalnessMap = texture
                material.needsUpdate = true
                break
            case 'roughness':
                if (material.roughnessMap) material.roughnessMap.dispose()
                material.roughnessMap = texture
                material.needsUpdate = true
                break
            case 'sheen':
                if (material.aoMap) material.aoMap.dispose()
                material.aoMap = texture
                material.needsUpdate = true
                break
        }
    })
})

</script>

<template>
    <div
        class="absolute right-0 top-10 bg-black p-1 flex flex-col justify-center align-middle items-center text-white gap-y-2 w-md overflow-y-scroll"
    >
        <div v-if="objects.length > 0" class="bg-[#141414] w-full rounded-sm flex flex-col gap-y-2 p-1">
            <table class="w-full table-fixed text-white border-collapse">
                <tbody>
                    <ObjecstThreeView
                        v-for="object in objects"
                        :key="object.uuid"
                        :object="object"
                        :level="0"
                    />
                </tbody>
            </table>
        </div>
        <div class="bg-[#141414] w-full rounded-sm flex flex-col gap-y-2 p-1 py-2">
            <div v-if="selectedObject && (selectedObject instanceof Mesh)">
                <div class="w-full flex justify-center">
                    <h2>
                        Textures
                    </h2>
                </div>
                <table class="w-full mt-2">
                    <tbody>
                        <template v-for="textureType in textureTypes">
                            <tr>
                                <td class="flex items-center">
                                    <div class="w-full flex justify-center">
                                            <div 
                                            v-if="selectedObject.material.map" 
                                            class="w-8 h-8 border border-gray-500"
                                            :style="{ backgroundImage: `url(${getTexturePreview(selectedObject.material.map)})` }"
                                        >
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="w-full flex justify-center">
                                        <p>{{textureType}}</p>
                                    </div>
                                </td>
                                <td>
                                    <div class="w-full flex justify-center">
                                        <button @click="openDialog('Material', textureType)">Выберите текстуру</button>
                                    </div>
                                </td>
                                <td>
                                    <div class="w-full flex justify-center">
                                        <button 
                                            v-if="selectedObject.material[getTextureMapProperty(textureType)]"
                                            @click="resetTexture(textureType)"
                                            class="ml-2 text-sm text-red-500"
                                        >
                                            Сбросить
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>

            <div v-if="selectedObject" class="flex flex-col gap-y-4 mt-2">
                <div>
                    <h3>Position</h3>
                    <div class="flex flex-col gap-2">
                        <div class="bg-[#1f1f1f] p-1 px-2 rounded-2xl focus:border-0">
                            x: <input v-model="selectedObject.position.x" />
                        </div>
                        <div class="bg-[#1f1f1f] p-1 px-2 rounded-2xl">
                            y: <input v-model="selectedObject.position.y" />
                        </div>
                        <div class="bg-[#1f1f1f] p-1 px-2 rounded-2xl">
                            z: <input v-model="selectedObject.position.z" />
                        </div>
                    </div>
                </div>
                <div>
                    <h3>Rotation</h3>
                    <div class="flex flex-col gap-2">
                        <div class="bg-[#1f1f1f] p-1 px-2 rounded-2xl focus:border-0">
                            x: <input v-model="selectedObject.quaternion.x" />
                        </div>
                        <div class="bg-[#1f1f1f] p-1 px-2 rounded-2xl">
                            y: <input v-model="selectedObject.quaternion.y" />
                        </div>
                        <div class="bg-[#1f1f1f] p-1 px-2 rounded-2xl">
                            z: <input v-model="selectedObject.quaternion.z" />
                        </div>
                        <div class="bg-[#1f1f1f] p-1 px-2 rounded-2xl">
                            w: <input v-model="selectedObject.quaternion.w" />
                        </div>
                    </div>
                </div>
            </div>

            <button
                @click="openDialog('Object')"
                class="rounded-2xl cursor-pointer p-2 hover:text-black hover:bg-white bg-[#343434] transition-all ease-out duration-100"
            >
                Add GLB
            </button>

            <button
                v-if="objects.length > 0"
                @click="three.convertToJson"
                class="rounded-2xl cursor-pointer p-2 hover:text-black hover:bg-white bg-[#343434] transition-all ease-out duration-100"
            >
                Convert scene to JSON
            </button>
        </div>
    </div>
</template>
