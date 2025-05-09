import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js'
import {
    BoxGeometry,
    BufferAttribute,
    BufferGeometry,
    Clock,
    IcosahedronGeometry,
    InstancedMesh,
    Matrix4,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Object3D,
    Quaternion,
    Scene,
    SphereGeometry,
    Vector3,
} from 'three'
import { ColliderDesc, RigidBody, World } from '@dimforge/rapier3d-compat'

let rapier: typeof import('@dimforge/rapier3d-compat') | null = null

const frameRate = 60
const ZERO = new Vector3()
const _scale = new Vector3(1, 1, 1)

// https://rapier.rs/docs/api/javascript/JavaScript3D/
// https://rapier.rs/docs/user_guides/javascript/getting_started_js/
export async function usePhysic() {
    if (rapier === null) {
        rapier = await import('@dimforge/rapier3d-compat')
        await rapier.init()
    }

    const gravity = new Vector3(0.0, -9.81, 0.0)
    const world = new rapier.World(gravity)

    const meshes: Array<Mesh | Object3D | InstancedMesh> = []
    const meshMap = new Map<string, RigidBody | RigidBody[]>()

    const _vector = new Vector3()
    const _quaternion = new Quaternion()
    const _matrix = new Matrix4()

    const clock = new Clock()

    setInterval(step, 1000 / frameRate)

    function createPhysicalFloor(scene: Scene) {
        const size = { x: 10, y: 0.2, z: 10 }

        const floorGeometry = new BoxGeometry(size.x, size.y, size.z)
        const floorMaterial = new MeshStandardMaterial({ color: 0x888888 })
        const floorMesh = new Mesh(floorGeometry, floorMaterial)

        floorMesh.position.set(0, -size.y / 2, 0)
        floorMesh.receiveShadow = true

        scene.add(floorMesh)

        const floorBodyDesc = rapier.RigidBodyDesc.fixed()
        const floorBody = world.createRigidBody(floorBodyDesc)

        const floorColliderDesc = ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2)

        world.createCollider(floorColliderDesc, floorBody)
    }

    function visualizeCollider(options: {
        type: 'box' | 'sphere' | 'convex' | 'trimesh'
        params: any
        scene: Scene
        position?: Vector3
        color?: number
    }) {
        const { type, params, scene, position = new Vector3(), color = 0xff0000 } = options

        let geometry: BufferGeometry

        if (type === 'box') {
            const { hx, hy, hz } = params
            geometry = new BoxGeometry(hx * 2, hy * 2, hz * 2)
        } else if (type === 'sphere') {
            const { radius } = params
            geometry = new SphereGeometry(radius, 16, 16)
        } else if (type === 'convex') {
            const { vertices } = params
            const points = []
            for (let i = 0; i < vertices.length; i += 3) {
                points.push(new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]))
            }
            geometry = new ConvexGeometry(points)
        } else if (type === 'trimesh') {
            const { vertices, indices } = params
            geometry = new BufferGeometry()
            geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
            geometry.setIndex(new BufferAttribute(indices, 1))
            geometry.computeVertexNormals()
        } else {
            throw new Error('Unknown collider type')
        }

        const material = new MeshBasicMaterial({
            color,
            wireframe: true,
            transparent: true,
            opacity: 0.5,
            depthTest: false,
        })

        const mesh = new Mesh(geometry, material)
        mesh.position.copy(position)
        scene.add(mesh)

        return mesh
    }

    function getShape(
        geometry: BufferGeometry | BoxGeometry | SphereGeometry | IcosahedronGeometry,
        scene: Scene
    ) {
        if (geometry.type === 'BoxGeometry' && geometry instanceof BoxGeometry) {
            const parameters = geometry.parameters

            const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5
            const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5
            const sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5

            return rapier.ColliderDesc.cuboid(sx, sy, sz)
        } else if (
            (geometry.type === 'SphereGeometry' && geometry instanceof SphereGeometry) ||
            (geometry.type === 'IcosahedronGeometry' && geometry instanceof IcosahedronGeometry)
        ) {
            const parameters = geometry.parameters
            const radius = parameters.radius !== undefined ? parameters.radius : 1
            return rapier.ColliderDesc.ball(radius)
        } else if (geometry.type === 'BufferGeometry') {
            // const vertices = []
            // const pos = geometry.getAttribute('position')

            // for (let i = 0; i < pos.count; i++) {
            //     vertices.push(pos.getX(i), pos.getY(i), pos.getZ(i))
            // }

            // const indices =
            //     geometry.getIndex() === null
            //         ? Uint32Array.from(Array(vertices.length / 3).keys())
            //         : new Uint32Array(geometry.getIndex().array)

            // showTrimeshCollider(vertices, indices, scene)

            // return rapier.ColliderDesc.trimesh(new Float32Array(vertices), indices)

            const vertices = []
            const pos = geometry.getAttribute('position')
            for (let i = 0; i < pos.count; i++) {
                vertices.push(pos.getX(i), pos.getY(i), pos.getZ(i))
            }

            // visualizeCollider({
            //     type: 'convex',
            //     params: { vertices },
            //     scene,
            // })

            return rapier.ColliderDesc.convexHull(new Float32Array(vertices))
        }

        return null
    }

    function mergeModelGeometry(root: Object3D): BufferGeometry | null {
        const geometries: BufferGeometry[] = []

        root.traverse(child => {
            if ((child as Mesh).isMesh) {
                const mesh = child as Mesh
                const geometry = mesh.geometry.clone()

                geometry.applyMatrix4(mesh.matrixWorld)

                geometries.push(geometry)
            }
        })

        if (geometries.length === 0) return null

        return mergeGeometries(geometries, false)
    }

    function createInstancedBody(mesh: InstancedMesh, mass: number, shape: ColliderDesc) {
        const array = mesh.instanceMatrix.array

        const bodies = []

        for (let i = 0; i < mesh.count; i++) {
            const position = _vector.fromArray(array, i * 16 + 12)
            bodies.push(createBody(position, null, mass, shape))
        }

        return bodies
    }

    function createBody(
        position: Vector3,
        quaternion: Quaternion,
        mass: number,
        shape: ColliderDesc
    ) {
        const desc = mass > 0 ? rapier.RigidBodyDesc.dynamic() : rapier.RigidBodyDesc.fixed()
        desc.setTranslation(position.x, position.y, position.z)
        if (quaternion !== null) desc.setRotation(quaternion)

        const body = world.createRigidBody(desc)
        world.createCollider(shape, body)

        return body
    }

    function addMesh(
        mesh: Mesh | InstancedMesh | Object3D,
        mass = 0,
        restitution = 0,
        scene?: Scene
    ) {
        let geometry: BufferGeometry | BoxGeometry | SphereGeometry | IcosahedronGeometry

        if (!(mesh instanceof Mesh) && !(mesh instanceof InstancedMesh)) {
            geometry = mergeModelGeometry(mesh)
        } else {
            geometry = mesh.geometry
        }

        const shape = getShape(geometry, scene)

        if (shape === null) return

        shape.setMass(mass)
        shape.setRestitution(restitution)

        let body

        if (mesh instanceof InstancedMesh && mesh.isInstancedMesh) {
            body = createInstancedBody(mesh, mass, shape)
        } else {
            body = createBody(mesh.position, mesh.quaternion, mass, shape)
        }

        if (mass > 0) {
            meshes.push(mesh)
            meshMap.set(mesh.uuid, body)
        }
    }

    function setMeshPhysics(mesh: Mesh | InstancedMesh | Object3D, enabled: boolean, index = 0) {
        let body = meshMap.get(mesh.uuid)

        if (mesh instanceof InstancedMesh && Array.isArray(body)) {
            body = body[index]
        }

        if (enabled) {
            ;(body as RigidBody).setBodyType(rapier.RigidBodyType.KinematicPositionBased, true)
        } else {
            ;(body as RigidBody).setBodyType(rapier.RigidBodyType.Dynamic, true)
        }
    }

    function setMeshKinematicMatrix(
        mesh: Mesh | InstancedMesh | Object3D,
        position: Vector3,
        quaternion: Quaternion,
        index = 0
    ) {
        let body = meshMap.get(mesh.uuid)

        if (mesh instanceof InstancedMesh && Array.isArray(body)) {
            body = body[index]
        }

        ;(body as RigidBody).setNextKinematicTranslation({
            x: position.x,
            y: position.y,
            z: position.z,
        })
        ;(body as RigidBody).setNextKinematicRotation({
            x: quaternion.x,
            y: quaternion.y,
            z: quaternion.z,
            w: quaternion.w,
        })
    }

    const disableMeshPhysics = (mesh: Mesh | InstancedMesh | Object3D, index = 0) =>
        setMeshPhysics(mesh, false, index)

    const enableMeshPhysics = (mesh: Mesh | InstancedMesh | Object3D, index = 0) =>
        setMeshPhysics(mesh, true, index)

    function setMeshPosition(mesh: Mesh | InstancedMesh | Object3D, position: Vector3, index = 0) {
        let body = meshMap.get(mesh.uuid)

        if (mesh instanceof InstancedMesh && mesh.isInstancedMesh && Array.isArray(body)) {
            body = body[index]
        }
        body = body as RigidBody

        body.setAngvel(ZERO, true)
        body.setLinvel(ZERO, true)
        body.setTranslation(position, true)
    }

    function setMeshVelocity(mesh: Mesh | InstancedMesh | Object3D, velocity: Vector3, index = 0) {
        let body = meshMap.get(mesh.uuid)

        if (mesh instanceof InstancedMesh && mesh.isInstancedMesh && Array.isArray(body)) {
            body = body[index]
        }
        body = body as RigidBody

        body.setLinvel(velocity, true)
    }

    function step() {
        world.timestep = clock.getDelta()
        world.step()

        for (let i = 0, l = meshes.length; i < l; i++) {
            const mesh = meshes[i]

            if (mesh instanceof InstancedMesh && mesh.isInstancedMesh) {
                const array = mesh.instanceMatrix.array
                const bodies = meshMap.get(mesh.uuid) as RigidBody[]
                for (let j = 0; j < bodies.length; j++) {
                    const body = bodies[j]
                    const position = body.translation() as Vector3
                    _quaternion.copy(body.rotation())
                    _matrix.compose(position, _quaternion, _scale).toArray(array, j * 16)
                }
                mesh.instanceMatrix.needsUpdate = true
                mesh.computeBoundingSphere()
            } else {
                const body = meshMap.get(mesh.uuid) as RigidBody

                mesh.position.copy(body.translation())
                mesh.quaternion.copy(body.rotation())
            }
        }
    }

    function isMeshPhysicEnable(object: Object3D) {
        return meshMap.get(object.uuid) !== undefined
    }

    return {
        addMesh,
        setMeshPosition,
        setMeshVelocity,
        createPhysicalFloor,
        disableMeshPhysics,
        enableMeshPhysics,
        setMeshKinematicMatrix,
        isMeshPhysicEnable,
    }
}
