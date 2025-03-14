<script setup lang="ts">

import { ref, shallowRef, watch } from 'vue';
import { Scene, PerspectiveCamera, WebGLRenderer, ACESFilmicToneMapping, GridHelper, Vector3, MathUtils, PMREMGenerator, Raycaster, Vector2, Object3D, Group } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useEventListener, watchImmediate } from '@vueuse/core';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import ObjectViewerGUI from './ObjectViewerGUI.vue';

// пока нет модели нужно выводжить подсказку о том чтобы перетащить модель мышкой или выбрать через меню

const objectBuffer = shallowRef<Buffer<ArrayBufferLike>>();
const objects: Group[] = [];
const selectedObject = ref<Object3D>()

windowAPI.dialogResponse((_, response) => {
  objectBuffer.value = response;
})

const threeContainer = ref<HTMLCanvasElement | undefined>();
const renderer = shallowRef<WebGLRenderer | undefined>();

let  transformControls: TransformControls | undefined = undefined;
let controls: OrbitControls | undefined = undefined;
const loader = new GLTFLoader();

const scene = new Scene();
const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;

const helper = new GridHelper( 10000, 2, 0xffffff, 0xffffff );
scene.add( helper );

watch(objectBuffer, async () => {
    if (!objectBuffer.value) return;

    loader.parse(new Uint8Array(objectBuffer.value).buffer, '', (gltf) => {
        scene.add(gltf.scene)
        objects.push(gltf.scene);
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
    transformControls = new TransformControls(camera, renderer.value.domElement);
    scene.add(transformControls.getHelper());

    const pmremGenerator = new PMREMGenerator( renderer.value );
    scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

    initSkyBox();
    useEventListener(window, 'resize', onWindowResize)
})

useEventListener(window, 'keydown', (event) => {
    if (event.key === 'g' || event.key === '1') {
    	transformControls.setMode('translate');
    };
    if (event.key === 'r' || event.key === '2') {
    	transformControls.setMode('rotate');
    };
    if (event.key === 's' || event.key === '3') {
    	transformControls.setMode('scale');
    };
    
    if (event.key === 'Backspace') {
        transformControls.detach();
    	selectedObject.value.removeFromParent();
        selectedObject.value = undefined;
        controls.enabled = true;
    };
})

useEventListener(window, 'pointerdown', (event) => {
    if (objects.length === 0) return;

    const raycaster = new Raycaster();
    const mouse = new Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        selectedObject.value = intersects[0].object;
        transformControls.attach(selectedObject.value);
        controls.enabled = false;
    } else {
	    transformControls.detach();
        controls.enabled = true;
        selectedObject.value = undefined;
	};
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

    if (transformControls.dragging) {
        controls.enabled = false;
    }
    else if (!controls.enabled) {
        controls.enabled = true;
    }

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
    <ObjectViewerGUI v-model:selected-object="selectedObject" />
</template>