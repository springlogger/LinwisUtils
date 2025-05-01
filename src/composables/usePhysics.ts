import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'
import {
    BoxGeometry,
    BufferGeometry,
    Clock,
    IcosahedronGeometry,
    InstancedMesh,
    Matrix4,
    Mesh,
    Object3D,
    Quaternion,
    Scene,
    SphereGeometry,
    Vector3,
} from 'three'
import { ColliderDesc, RigidBody } from '@dimforge/rapier3d-compat'

let rapier: typeof import('@dimforge/rapier3d-compat') | null = null

const frameRate = 60
const ZERO = new Vector3()
const _scale = new Vector3(1, 1, 1)

export async function usePhysic() {
    if (rapier === null) {
        rapier = await import('@dimforge/rapier3d-compat')
        await rapier.init()
    }

    const gravity = new Vector3(0.0, -9.81, 0.0)
    const world = new rapier.World(gravity)

    const meshes: Array<Mesh | Object3D | InstancedMesh> = []
    const meshMap: WeakMap<Mesh | InstancedMesh | Object3D, RigidBody | RigidBody[]> = new WeakMap()

    const _vector = new Vector3()
    const _quaternion = new Quaternion()
    const _matrix = new Matrix4()

    const clock = new Clock()

    setInterval(step, 1000 / frameRate)

    //   // https://rapier.rs/docs/api/javascript/JavaScript3D/
    //   // https://rapier.rs/docs/user_guides/javascript/getting_started_js/

    //   physics = await RapierPhysics();

    //   // userData.physics = mass, restitution
    //   // also can set mesh velocity by physics.setMeshVelocity(mesh, velocity, index?)

    function addScene(scene: Scene) {
        scene.traverse(function (child) {
            if (child instanceof Mesh && child.isMesh) {
                const physics = child.userData.physics

                if (physics) {
                    addMesh(child, physics.mass, physics.restitution)
                }
            }
        })
    }

    function getShape(
        geometry: BufferGeometry | BoxGeometry | SphereGeometry | IcosahedronGeometry
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
            const vertices = []
            const vertex = new Vector3()
            const position = geometry.getAttribute('position')

            for (let i = 0; i < position.count; i++) {
                vertex.fromBufferAttribute(position, i)
                vertices.push(vertex.x, vertex.y, vertex.z)
            }

            const indices =
                geometry.getIndex() === null
                    ? Uint32Array.from(Array(vertices.length / 3).keys())
                    : new Uint32Array(geometry.getIndex().array)

            return rapier.ColliderDesc.trimesh(new Float32Array(vertices), indices)
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

        return mergeGeometries(geometries, true)
    }

    function addMesh(mesh: Mesh | InstancedMesh | Object3D, mass = 0, restitution = 0) {
        let geometry: BufferGeometry | BoxGeometry | SphereGeometry | IcosahedronGeometry

        if (!(mesh instanceof Mesh) && !(mesh instanceof InstancedMesh)) {
            geometry = mergeModelGeometry(mesh)
        } else {
            geometry = mesh.geometry
        }

        const shape = getShape(geometry)

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
            meshMap.set(mesh, body)
        }
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

    function setMeshPosition(mesh: Mesh | InstancedMesh, position: Vector3, index = 0) {
        let body = meshMap.get(mesh)

        if (mesh instanceof InstancedMesh && mesh.isInstancedMesh && Array.isArray(body)) {
            body = body[index]
        }
        body = body as RigidBody

        body.setAngvel(ZERO, true)
        body.setLinvel(ZERO, true)
        body.setTranslation(position, true)
    }

    function setMeshVelocity(mesh: Mesh | InstancedMesh, velocity: Vector3, index = 0) {
        let body = meshMap.get(mesh)

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
                const bodies = meshMap.get(mesh) as RigidBody[]
                for (let j = 0; j < bodies.length; j++) {
                    const body = bodies[j]
                    const position = body.translation() as Vector3
                    _quaternion.copy(body.rotation())
                    _matrix.compose(position, _quaternion, _scale).toArray(array, j * 16)
                }
                mesh.instanceMatrix.needsUpdate = true
                mesh.computeBoundingSphere()
            } else {
                const body = meshMap.get(mesh) as RigidBody

                mesh.position.copy(body.translation())
                mesh.quaternion.copy(body.rotation())
            }
        }
    }

    return {
        addScene,
        addMesh,
        setMeshPosition,
        setMeshVelocity,
    }
}
