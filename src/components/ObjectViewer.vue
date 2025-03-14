<script setup lang="ts">

import { ref, shallowRef, watch } from 'vue';
import { Scene, PerspectiveCamera, WebGLRenderer, ACESFilmicToneMapping, GridHelper, Vector3, MathUtils, PMREMGenerator } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { watchImmediate } from '@vueuse/core';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const props = defineProps<{
    objectBuffer?: Buffer<ArrayBufferLike>
}>();

const threeContainer = ref<HTMLCanvasElement | undefined>();
const renderer = shallowRef<WebGLRenderer | undefined>();

let controls: OrbitControls | undefined = undefined;
const loader = new GLTFLoader();

const scene = new Scene();
const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;

const helper = new GridHelper( 10000, 2, 0xffffff, 0xffffff );
scene.add( helper );

watch(() => props.objectBuffer, async () => {
    if (!props.objectBuffer) return;

    loader.parse(new Uint8Array(props.objectBuffer).buffer, '', (gltf) => {
        scene.add(gltf.scene)
    }, (err) => {
        console.log(err);
    })
})

watchImmediate(threeContainer, () => {
    if (!threeContainer.value) return;

    renderer.value = new WebGLRenderer({canvas: threeContainer.value});
    renderer.value.setSize( window.innerWidth, window.innerHeight );;
    renderer.value.toneMapping = ACESFilmicToneMapping;
    renderer.value.toneMappingExposure = 0.5;

    renderer.value.setAnimationLoop( animate );

    controls = new OrbitControls( camera, renderer.value.domElement );

    const pmremGenerator = new PMREMGenerator( renderer.value );
    scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

    initSkyBox();
    window.addEventListener( 'resize', onWindowResize );
})


function initSkyBox() {
    const sky = new Sky();
    const sun = new Vector3();

    sky.scale.setScalar( 450000 );

    const effectController = {
        turbidity: 10,
        rayleigh: 3,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.7,
        elevation: 2,
        azimuth: 180,
        exposure: renderer.value.toneMappingExposure
    };

    const uniforms = sky.material.uniforms;

    uniforms[ 'turbidity' ].value = effectController.turbidity;
    uniforms[ 'rayleigh' ].value = effectController.rayleigh;
    uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
    uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;

    const phi = MathUtils.degToRad( 90 - effectController.elevation );
    const theta = MathUtils.degToRad( effectController.azimuth );

    sun.setFromSphericalCoords( 1, phi, theta );

    uniforms[ 'sunPosition' ].value.copy( sun );

    renderer.value.toneMappingExposure = effectController.exposure;
    scene.add( sky );
}

function animate() {
    if (!renderer.value) return;

    controls?.update();

	renderer.value.render( scene, camera );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.value.setSize( window.innerWidth, window.innerHeight );

    animate();

}

</script>

<template>
    <canvas ref="threeContainer" />
</template>