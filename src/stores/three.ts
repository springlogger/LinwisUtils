import { watchImmediate, useEventListener } from '@vueuse/core'
import { defineStore } from 'pinia'
import {
    ACESFilmicToneMapping,
    GridHelper,
    MathUtils,
    Object3D,
    PerspectiveCamera,
    PMREMGenerator,
    Raycaster,
    Scene,
    Vector2,
    Vector3,
    WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Sky } from 'three/examples/jsm/objects/Sky'
import { ref, shallowRef, watch, watchEffect } from 'vue'

export const useThreeStore = defineStore('three', () => {
    const threeContainer = ref<HTMLCanvasElement | undefined>()

    const scene = new Scene()
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    const helper = new GridHelper(10000, 2, 0xffffff, 0xffffff)
    scene.add(helper)

    let transformControls: TransformControls | undefined = undefined
    let controls: OrbitControls | undefined = undefined

    const { objects } = (function useObjectLoader() {
        const objectBuffer = shallowRef<Buffer<ArrayBufferLike>>()
        const objects = shallowRef<Object3D[]>([])

        const loader = new GLTFLoader()

        windowAPI.dialogResponse((_, response) => {
            objectBuffer.value = response
        })

        watch(objectBuffer, async () => {
            if (!objectBuffer.value) return

            loader.parse(
                new Uint8Array(objectBuffer.value).buffer,
                '',
                gltf => {
                    scene.add(gltf.scene)

                    for (const object of gltf.scene.children) {
                        objects.value.push(object)
                    }
                },
                err => {
                    console.log(err)
                }
            )
        })

        return {
            objects,
        }
    })()

    ;(function useInitRender() {
        const renderer = shallowRef<WebGLRenderer | undefined>()

        watchImmediate(threeContainer, () => {
            if (!threeContainer.value) return

            renderer.value = new WebGLRenderer({ canvas: threeContainer.value })
            renderer.value.setSize(window.innerWidth, window.innerHeight)
            renderer.value.toneMapping = ACESFilmicToneMapping
            renderer.value.toneMappingExposure = 0.5

            renderer.value.setAnimationLoop(animate)

            controls = new OrbitControls(camera, renderer.value.domElement)
            transformControls = new TransformControls(camera, renderer.value.domElement)
            scene.add(transformControls.getHelper())

            const pmremGenerator = new PMREMGenerator(renderer.value)
            scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
        })

        watchEffect(() => {
            if (!renderer.value) return

            const sky = new Sky()
            const sun = new Vector3()

            sky.scale.setScalar(450000)

            const effectController = {
                turbidity: 10,
                rayleigh: 3,
                mieCoefficient: 0.005,
                mieDirectionalG: 0.7,
                elevation: 2,
                azimuth: 180,
                exposure: renderer.value.toneMappingExposure,
            }

            const uniforms = sky.material.uniforms

            uniforms['turbidity'].value = effectController.turbidity
            uniforms['rayleigh'].value = effectController.rayleigh
            uniforms['mieCoefficient'].value = effectController.mieCoefficient
            uniforms['mieDirectionalG'].value = effectController.mieDirectionalG

            const phi = MathUtils.degToRad(90 - effectController.elevation)
            const theta = MathUtils.degToRad(effectController.azimuth)

            sun.setFromSphericalCoords(1, phi, theta)

            uniforms['sunPosition'].value.copy(sun)

            renderer.value.toneMappingExposure = effectController.exposure
            scene.add(sky)
        })

        function animate() {
            if (!renderer.value) return

            if (transformControls.dragging) {
                controls.enabled = false
            } else if (!controls.enabled) {
                controls.enabled = true
            }

            controls?.update()

            renderer.value.render(scene, camera)
        }

        function onWindowResize() {
            if (!renderer.value) return

            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()

            renderer.value.setSize(window.innerWidth, window.innerHeight)

            animate()
        }

        useEventListener(window, 'resize', onWindowResize)
    })()

    const { selectedObject } = (function useThreeControls() {
        const selectedObject = ref<Object3D>()

        function findRootParentInList(object: Object3D, list: Object3D[]): Object3D | null {
            let current: Object3D | null = object
            while (current) {
                if (list.includes(current)) return current
                current = current.parent
            }
            return null
        }

        watch(selectedObject, selectedObjectNew => {
            if (selectedObjectNew) {
                transformControls.attach(selectedObjectNew)
            } else {
                transformControls.detach()
            }
        })

        useEventListener(window, 'keydown', event => {
            if (event.key === 'g') {
                transformControls.setMode('translate')
            }
            if (event.key === 'r') {
                transformControls.setMode('rotate')
            }
            if (event.key === 's') {
                transformControls.setMode('scale')
            }

            if (event.key === 'Delete') {
                transformControls.detach()
                selectedObject.value.removeFromParent()
                selectedObject.value = undefined
            }

            if (event.key === 'Escape') {
                transformControls.detach()
                selectedObject.value = undefined
            }
        })

        useEventListener(window, 'pointerdown', event => {
            if (objects.value.length === 0) return

            const raycaster = new Raycaster()
            const mouse = new Vector2()

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

            raycaster.setFromCamera(mouse, camera)
            const intersects = raycaster.intersectObjects(objects.value)

            if (intersects.length === 0) return

            const hitObject = intersects[0].object
            const rootObject = findRootParentInList(hitObject, objects.value)

            if (!rootObject) return

            if (selectedObject.value && rootObject.uuid === selectedObject.value.uuid) {
                if (transformControls.dragging) return
                selectedObject.value = undefined
            } else {
                selectedObject.value = rootObject
            }
        })

        return {
            selectedObject,
        }
    })()

    function convertToJson() {
        transformControls.detach()
        windowAPI.openSaveDialog(scene.toJSON() as unknown as JSON)
    }

    return {
        threeContainer,
        selectedObject,
        objects,

        convertToJson,
    }
})

// if (import.meta.hot) {
//   import.meta.hot.accept(acceptHMRUpdate(useChatStore, import.meta.hot));
// }
