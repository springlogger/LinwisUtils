<script setup lang="ts">

import { ref, shallowRef } from 'vue';
import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { watchImmediate } from '@vueuse/core';

const threeContainer = ref<HTMLCanvasElement | undefined>();
const renderer = shallowRef<WebGLRenderer | undefined>();

let controls: OrbitControls | undefined = undefined;
// const loader = new GLTFLoader();

const scene = new Scene();
const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const geometry = new BoxGeometry( 1, 1, 1 );
const material = new MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

watchImmediate(threeContainer, () => {
    if (!threeContainer.value) return;

    renderer.value = new WebGLRenderer({canvas: threeContainer.value});
    renderer.value.setSize( window.innerWidth, window.innerHeight );;

    renderer.value.setAnimationLoop( animate );

    const controls = new OrbitControls( camera, renderer.value.domElement );
})

function animate() {
    if (!renderer.value) return;

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

	renderer.value.render( scene, camera );
}

</script>

<template>
    <canvas ref="threeContainer" />
</template>